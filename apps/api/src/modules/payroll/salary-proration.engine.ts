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
 * Statutory Policy Audit Snapshot (Task 05.4 - Blockers 6 & 7)
 * Strictly separates policy ceilings from actual employee wage basis.
 */
export interface StatutoryPolicySnapshot {
  jurisdiction: string;
  period: string; // "MM/YYYY"

  // PF Policy Metadata & Values
  pfPolicyVersion: string;
  pfPolicyEffectiveFrom: string;
  pfPolicyWageCeiling: string;
  pfActualWageBasis: string;
  pfEmployeeRate: string;
  pfEmployerTotalRate: string;

  // ESI Policy Metadata & Values
  esiPolicyVersion: string;
  esiPolicyEffectiveFrom: string;
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
   * arbitrary-precision Decimal arithmetic and period-effective statutory policy delegation.
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
      isPreviouslyCoveredInCycle = false
    } = params;

    // Blockers 2 & 3: validate period and jurisdiction explicitly
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

    // Blocker 6: handle workingDays === 0 explicitly before division
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
          jurisdiction: normalizedJurisdiction
        })
      : null;

    const esiResult = hasEsiComponent
      ? EsiEngine.calculateEsi({
          grossMonthlyWages: proratedGrossDecimal,
          year,
          month,
          jurisdiction: normalizedJurisdiction,
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
          // Blocker 9: PT is an explicitly configured compensation component
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

    // Blockers 6 & 7: Accurate snapshot distinguishing policy ceilings from employee wage basis
    const statutoryPolicySnapshot: StatutoryPolicySnapshot = {
      jurisdiction: normalizedJurisdiction,
      period: `${String(month).padStart(2, "0")}/${year}`,
      pfPolicyVersion: pfResult ? pfResult.policy.version : "NOT_APPLIED",
      pfPolicyEffectiveFrom: pfResult ? pfResult.policy.effectiveFrom : "N/A",
      pfPolicyWageCeiling: pfResult ? pfResult.policy.wageCeiling.toFixed(2) : "0.00",
      pfActualWageBasis: pfResult ? pfResult.pfWageDecimal.toFixed(2) : "0.00",
      pfEmployeeRate: pfResult ? pfResult.policy.employeeRate.toString() : "0",
      pfEmployerTotalRate: pfResult ? pfResult.policy.employerTotalRate.toString() : "0",
      esiPolicyVersion: esiResult ? esiResult.policy.version : "NOT_APPLIED",
      esiPolicyEffectiveFrom: esiResult ? esiResult.policy.effectiveFrom : "N/A",
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
