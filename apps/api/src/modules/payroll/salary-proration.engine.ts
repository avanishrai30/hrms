import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  SalaryComponentCategory,
  SalaryComponentType
} from "@vc-wms/shared-types";
import { PayrollMoney } from "./engines/payroll-money.js";
import { PfEngine } from "./engines/pf-engine.js";
import { EsiEngine } from "./engines/esi-engine.js";

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

export interface StatutoryPolicySnapshot {
  pfPolicyVersion: string;
  pfWageCeiling: string;
  esiPolicyVersion: string;
  period: string;
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
   * arbitrary-precision Decimal arithmetic and versioned statutory policy delegation.
   */
  static calculateProration(params: {
    baseMonthlyCtc: number | Prisma.Decimal | string;
    workingDays: number | Prisma.Decimal | string;
    payableDays: number | Prisma.Decimal | string;
    components: CompensationItemSnapshot[];
    adjustments?: AdjustmentSnapshot[];
    year?: number;
    month?: number;
    jurisdiction?: string;
    isPreviouslyCoveredInCycle?: boolean;
  }): ProrationResult {
    const {
      baseMonthlyCtc: rawCtc,
      workingDays: rawWorkingDays,
      payableDays: rawPayableDays,
      components,
      adjustments = [],
      year = 2026,
      month = 1,
      jurisdiction = "IN",
      isPreviouslyCoveredInCycle = false
    } = params;

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

    // Step 2: Calculate Prorated Deductions & Employer Contributions via Authoritative Engines
    let appliedPfVersion = "DEFAULT";
    let appliedPfWageCeiling = "0.00";
    let appliedEsiVersion = "DEFAULT";

    for (const comp of components) {
      const baseAmountDecimal = PayrollMoney.round(comp.monthlyAmount);

      if (comp.type === "DEDUCTION") {
        let proratedAmountDecimal = PayrollMoney.zero();

        if (comp.category === "PF") {
          // Blockers 1, 3, 9: Pass proratedBasicDecimal directly (NO .toNumber() conversion!)
          const pfResult = PfEngine.calculatePf({
            basicMonthlySalary: proratedBasicDecimal,
            isPfCappedAtStatutoryWageCeiling: true,
            year,
            month,
            jurisdiction
          });
          proratedAmountDecimal = pfResult.employeePfContributionDecimal;
          appliedPfVersion = pfResult.policyVersion;
          appliedPfWageCeiling = pfResult.pfWageDecimal.toFixed(2);
        } else if (comp.category === "ESI") {
          // Blockers 2, 3, 9, 11: Pass proratedGrossDecimal directly (NO .toNumber() conversion!)
          const esiResult = EsiEngine.calculateEsi({
            grossMonthlyWages: proratedGrossDecimal,
            year,
            month,
            jurisdiction,
            isPreviouslyCoveredInCycle
          });
          proratedAmountDecimal = esiResult.employeeEsiContributionDecimal;
          appliedEsiVersion = esiResult.policyVersion;
        } else if (comp.category === "PROFESSIONAL_TAX") {
          // Blocker 12: PT applies from configured component data when payable days > 0
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

        if (comp.category === "PF") {
          // Blockers 1, 9, 10: Employer PF match = EPF + EPS matching share
          const pfResult = PfEngine.calculatePf({
            basicMonthlySalary: proratedBasicDecimal,
            isPfCappedAtStatutoryWageCeiling: true,
            year,
            month,
            jurisdiction
          });
          proratedAmountDecimal = pfResult.employerEpfContributionDecimal.add(
            pfResult.employerEpsContributionDecimal
          );
          appliedPfVersion = pfResult.policyVersion;
          appliedPfWageCeiling = pfResult.pfWageDecimal.toFixed(2);
        } else if (comp.category === "ESI") {
          // Blockers 2, 9: Employer ESI match
          const esiResult = EsiEngine.calculateEsi({
            grossMonthlyWages: proratedGrossDecimal,
            year,
            month,
            jurisdiction,
            isPreviouslyCoveredInCycle
          });
          proratedAmountDecimal = esiResult.employerEsiContributionDecimal;
          appliedEsiVersion = esiResult.policyVersion;
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

    // Blocker 11: Fail closed on negative net pay
    if (netSalaryDecimal.isNegative()) {
      throw new BadRequestException(
        `Calculated net salary cannot be negative (${netSalaryDecimal.toFixed(2)}). Total deductions (${totalDeductionsDecimal.toFixed(2)}) and negative adjustments exceed gross earnings (${proratedGrossDecimal.toFixed(2)}).`
      );
    }

    const statutoryPolicySnapshot: StatutoryPolicySnapshot = {
      pfPolicyVersion: appliedPfVersion,
      pfWageCeiling: appliedPfWageCeiling,
      esiPolicyVersion: appliedEsiVersion,
      period: `${String(month).padStart(2, "0")}/${year}`
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
