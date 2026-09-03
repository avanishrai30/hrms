import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  SalaryComponentCategory,
  SalaryComponentType
} from "@vc-wms/shared-types";
import { PayrollMoney } from "./engines/payroll-money.js";
import { PfEngine } from "./engines/pf-engine.js";
import { EsiEngine } from "./engines/esi-engine.js";
import { StatutoryPolicyRegistry } from "./engines/statutory-policy.registry.js";

export interface CompensationItemSnapshot {
  componentId?: string | null;
  name: string;
  code: string;
  type: SalaryComponentType;
  category: SalaryComponentCategory;
  monthlyAmount: number | Prisma.Decimal | string;
  isTaxable?: boolean;
}

export interface AdjustmentSnapshot {
  id?: string;
  type: string;
  title: string;
  amount: number | Prisma.Decimal | string;
}

export interface ProrationResultItem {
  componentId?: string | null;
  name: string;
  code: string;
  type: SalaryComponentType;
  category: SalaryComponentCategory;
  baseAmount: number;
  proratedAmount: number;
  baseAmountDecimal: Prisma.Decimal;
  proratedAmountDecimal: Prisma.Decimal;
  isTaxable: boolean;
}

/**
 * Statutory Policy Audit Snapshot (Task 05.6 - Blockers 3 & 4)
 * Records tenant policy applicability separately from legal statutory effective date.
 */
export interface StatutoryPolicySnapshot {
  jurisdiction: string;
  period: string; // "MM/YYYY"
  policyAppliesFrom: string; // Tenant policy configuration applicability period (e.g. "2026-01")

  // PF Policy Metadata & Values
  pfPolicyVersion: string;
  pfPolicyProvenance: string;
  pfHistoricalValidity: string;
  pfPolicyWageCeiling: string;
  pfActualWageBasis: string;
  pfEmployeeRate: string;
  pfEmployerTotalRate: string;

  // ESI Policy Metadata & Values
  esiPolicyVersion: string;
  esiPolicyProvenance: string;
  esiHistoricalValidity: string;
  esiWageCeiling: string;
  esiDisabilityCeiling: string;
  esiActualWageBasis: string;
  esiEmployeeRate: string;
  esiEmployerRate: string;
  esiContinuationCycleApplied: boolean;
}

export interface ProrationResult {
  baseMonthlyCtc: number;
  dailyRate: number;
  workingDays: number;
  payableDays: number;
  grossSalary: number;
  totalDeductions: number;
  employerContributions: number;
  totalAdjustments: number;
  netSalary: number;
  grossSalaryDecimal: Prisma.Decimal;
  totalDeductionsDecimal: Prisma.Decimal;
  employerContributionsDecimal: Prisma.Decimal;
  totalAdjustmentsDecimal: Prisma.Decimal;
  netSalaryDecimal: Prisma.Decimal;
  statutoryPolicySnapshot: StatutoryPolicySnapshot;
  breakdownItems: ProrationResultItem[];
}

export class SalaryProrationEngine {
  /**
   * Computes prorated salary component breakdowns and net salary using authoritative
   * arbitrary-precision Decimal arithmetic and tenant-configured statutory policy delegation.
   */
  static calculateProration(params: {
    baseMonthlyCtc: number | Prisma.Decimal | string;
    workingDays: number | Prisma.Decimal | string;
    payableDays: number | Prisma.Decimal | string;
    components: CompensationItemSnapshot[];
    adjustments?: AdjustmentSnapshot[];
    year: number;
    month: number;
    jurisdiction: string;
    pfPolicyVersion?: string;
    esiPolicyVersion?: string;
    policyAppliesFrom?: string;
    isPreviouslyCoveredInCycle?: boolean;
  }): ProrationResult {
    const {
      baseMonthlyCtc: rawCtc,
      workingDays: rawWorkingDays,
      payableDays: rawPayableDays,
      components,
      adjustments = [],
      year,
      month,
      jurisdiction,
      pfPolicyVersion = "IN_EPF_COMMITTED_LEGACY",
      esiPolicyVersion = "IN_ESI_COMMITTED_LEGACY",
      policyAppliesFrom,
      isPreviouslyCoveredInCycle = false
    } = params;

    StatutoryPolicyRegistry.validatePeriod(year, month);
    if (!jurisdiction || typeof jurisdiction !== "string" || jurisdiction.trim() === "") {
      throw new BadRequestException("Payroll statutory jurisdiction is required.");
    }
    const normalizedJurisdiction = jurisdiction.trim().toUpperCase();

    const baseMonthlyCtc = PayrollMoney.requireDecimal(rawCtc, "Base Monthly CTC");
    const workingDays = PayrollMoney.requireDecimal(rawWorkingDays, "Working Days");
    const payableDays = PayrollMoney.requireDecimal(rawPayableDays, "Payable Days");

    if (workingDays.isNegative()) {
      throw new BadRequestException("Working days cannot be negative.");
    }
    if (payableDays.isNegative()) {
      throw new BadRequestException("Payable days cannot be negative.");
    }

    const dailyRate = workingDays.greaterThan(0)
      ? PayrollMoney.round(PayrollMoney.div(baseMonthlyCtc, workingDays))
      : PayrollMoney.zero();

    const breakdownItems: ProrationResultItem[] = [];

    let proratedBasicDecimal = PayrollMoney.zero();
    let proratedGrossDecimal = PayrollMoney.zero();
    let totalDeductionsDecimal = PayrollMoney.zero();
    let employerContributionsDecimal = PayrollMoney.zero();

    // Step 1: Prorate Earnings
    for (const comp of components) {
      if (!comp.name || !comp.code || !comp.type || !comp.category) {
        throw new BadRequestException(
          `Corrupt salary component snapshot: missing required properties for code "${comp.code || "UNKNOWN"}".`
        );
      }

      if (comp.type === "EARNING") {
        const baseAmountDecimal = PayrollMoney.round(comp.monthlyAmount);
        const proratedAmountDecimal = PayrollMoney.prorateComponent(
          baseAmountDecimal,
          payableDays,
          workingDays
        );

        if (comp.category === "BASIC") {
          proratedBasicDecimal = proratedAmountDecimal;
        }

        proratedGrossDecimal = proratedGrossDecimal.add(proratedAmountDecimal);

        breakdownItems.push({
          componentId: comp.componentId,
          name: comp.name,
          code: comp.code,
          type: comp.type,
          category: comp.category,
          baseAmount: baseAmountDecimal.toNumber(),
          proratedAmount: proratedAmountDecimal.toNumber(),
          baseAmountDecimal,
          proratedAmountDecimal,
          isTaxable: comp.isTaxable ?? true
        });
      }
    }

    // Pre-calculate statutory policy results for period & jurisdiction
    const hasPfComponent = components.some((c) => c.category === "PF");
    const hasEsiComponent = components.some((c) => c.category === "ESI");

    const pfResult = hasPfComponent
      ? PfEngine.calculatePf({
          basicMonthlySalary: proratedBasicDecimal,
          isPfCappedAtStatutoryWageCeiling: true,
          year,
          month,
          jurisdiction: normalizedJurisdiction,
          policyVersion: pfPolicyVersion,
          policyAppliesFrom
        })
      : null;

    const esiResult = hasEsiComponent
      ? EsiEngine.calculateEsi({
          grossMonthlyWages: proratedGrossDecimal,
          year,
          month,
          jurisdiction: normalizedJurisdiction,
          policyVersion: esiPolicyVersion,
          policyAppliesFrom,
          isPreviouslyCoveredInCycle
        })
      : null;

    // Step 2: Calculate Prorated Deductions & Employer Contributions
    for (const comp of components) {
      const baseAmountDecimal = PayrollMoney.round(comp.monthlyAmount);

      if (comp.type === "DEDUCTION") {
        let proratedAmountDecimal = PayrollMoney.zero();

        if (comp.category === "PF" && pfResult) {
          proratedAmountDecimal = pfResult.employeePfContributionDecimal;
        } else if (comp.category === "ESI" && esiResult) {
          proratedAmountDecimal = esiResult.employeeEsiContributionDecimal;
        } else if (comp.category === "PROFESSIONAL_TAX") {
          proratedAmountDecimal = payableDays.greaterThan(0)
            ? baseAmountDecimal
            : PayrollMoney.zero();
        } else {
          proratedAmountDecimal = PayrollMoney.prorateComponent(
            baseAmountDecimal,
            payableDays,
            workingDays
          );
        }

        totalDeductionsDecimal = totalDeductionsDecimal.add(proratedAmountDecimal);

        breakdownItems.push({
          componentId: comp.componentId,
          name: comp.name,
          code: comp.code,
          type: comp.type,
          category: comp.category,
          baseAmount: baseAmountDecimal.toNumber(),
          proratedAmount: proratedAmountDecimal.toNumber(),
          baseAmountDecimal,
          proratedAmountDecimal,
          isTaxable: false
        });
      } else if (comp.type === "EMPLOYER_CONTRIBUTION") {
        let proratedAmountDecimal = PayrollMoney.zero();

        if (comp.category === "PF" && pfResult) {
          proratedAmountDecimal = pfResult.employerEpfContributionDecimal.add(
            pfResult.employerEpsContributionDecimal
          );
        } else if (comp.category === "ESI" && esiResult) {
          proratedAmountDecimal = esiResult.employerEsiContributionDecimal;
        } else {
          proratedAmountDecimal = PayrollMoney.prorateComponent(
            baseAmountDecimal,
            payableDays,
            workingDays
          );
        }

        employerContributionsDecimal = employerContributionsDecimal.add(proratedAmountDecimal);

        breakdownItems.push({
          componentId: comp.componentId,
          name: comp.name,
          code: comp.code,
          type: comp.type,
          category: comp.category,
          baseAmount: baseAmountDecimal.toNumber(),
          proratedAmount: proratedAmountDecimal.toNumber(),
          baseAmountDecimal,
          proratedAmountDecimal,
          isTaxable: false
        });
      }
    }

    // Step 3: Compute Net Adjustments using Decimal addition
    let totalAdjustmentsDecimal = PayrollMoney.zero();
    for (const adj of adjustments) {
      totalAdjustmentsDecimal = totalAdjustmentsDecimal.add(
        PayrollMoney.requireDecimal(adj.amount, "Adjustment amount")
      );
    }

    // Step 4: Net Salary = Prorated Gross - Deductions + Adjustments
    const netSalaryDecimal = proratedGrossDecimal
      .sub(totalDeductionsDecimal)
      .add(totalAdjustmentsDecimal);

    if (netSalaryDecimal.isNegative()) {
      throw new BadRequestException(
        `Calculated net salary cannot be negative (${netSalaryDecimal.toFixed(2)}). Total deductions (${totalDeductionsDecimal.toFixed(2)}) and negative adjustments exceed gross earnings (${proratedGrossDecimal.toFixed(2)}).`
      );
    }

    // Blockers 3 & 4 (Task 05.6): Truthful snapshot with tenant policy applicability
    const statutoryPolicySnapshot: StatutoryPolicySnapshot = {
      jurisdiction: normalizedJurisdiction,
      period: `${String(month).padStart(2, "0")}/${year}`,
      policyAppliesFrom: policyAppliesFrom ?? "NOT_CONFIGURED",
      pfPolicyVersion: pfResult ? pfResult.policy.version : "NOT_APPLIED",
      pfPolicyProvenance: pfResult ? pfResult.policy.provenance : "NOT_APPLIED",
      pfHistoricalValidity: pfResult ? pfResult.policy.historicalValidity : "NOT_APPLIED",
      pfPolicyWageCeiling: pfResult ? pfResult.policy.wageCeiling.toFixed(2) : "0.00",
      pfActualWageBasis: pfResult ? pfResult.pfWageDecimal.toFixed(2) : "0.00",
      pfEmployeeRate: pfResult ? pfResult.policy.employeeRate.toString() : "0",
      pfEmployerTotalRate: pfResult ? pfResult.policy.employerTotalRate.toString() : "0",
      esiPolicyVersion: esiResult ? esiResult.policy.version : "NOT_APPLIED",
      esiPolicyProvenance: esiResult ? esiResult.policy.provenance : "NOT_APPLIED",
      esiHistoricalValidity: esiResult ? esiResult.policy.historicalValidity : "NOT_APPLIED",
      esiWageCeiling: esiResult ? esiResult.policy.wageCeiling.toFixed(2) : "0.00",
      esiDisabilityCeiling: esiResult ? esiResult.policy.disabilityCeiling.toFixed(2) : "0.00",
      esiActualWageBasis: esiResult ? esiResult.grossWageBasisDecimal.toFixed(2) : "0.00",
      esiEmployeeRate: esiResult ? esiResult.policy.employeeRate.toString() : "0",
      esiEmployerRate: esiResult ? esiResult.policy.employerRate.toString() : "0",
      esiContinuationCycleApplied: isPreviouslyCoveredInCycle
    };

    return {
      baseMonthlyCtc: baseMonthlyCtc.toNumber(),
      dailyRate: dailyRate.toNumber(),
      workingDays: workingDays.toNumber(),
      payableDays: payableDays.toNumber(),
      grossSalary: proratedGrossDecimal.toNumber(),
      totalDeductions: totalDeductionsDecimal.toNumber(),
      employerContributions: employerContributionsDecimal.toNumber(),
      totalAdjustments: totalAdjustmentsDecimal.toNumber(),
      netSalary: netSalaryDecimal.toNumber(),
      grossSalaryDecimal: proratedGrossDecimal,
      totalDeductionsDecimal,
      employerContributionsDecimal,
      totalAdjustmentsDecimal,
      netSalaryDecimal,
      statutoryPolicySnapshot,
      breakdownItems
    };
  }
}
