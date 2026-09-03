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
  monthlyAmount: number | Prisma.Decimal;
  isTaxable?: boolean;
}

export interface AdjustmentSnapshot {
  id?: string;
  type: string;
  title: string;
  amount: number | Prisma.Decimal;
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
  breakdownItems: ProrationResultItem[];
}

export class SalaryProrationEngine {
  /**
   * Computes prorated salary component breakdowns and net salary using authoritative
   * arbitrary-precision Decimal arithmetic and explicit statutory policy delegation.
   */
  static calculateProration(params: {
    baseMonthlyCtc: number | Prisma.Decimal;
    workingDays: number | Prisma.Decimal;
    payableDays: number | Prisma.Decimal;
    components: CompensationItemSnapshot[];
    adjustments?: AdjustmentSnapshot[];
  }): ProrationResult {
    const {
      baseMonthlyCtc: rawCtc,
      workingDays: rawWorkingDays,
      payableDays: rawPayableDays,
      components,
      adjustments = []
    } = params;

    const baseMonthlyCtc = PayrollMoney.toDecimal(rawCtc);
    const workingDays = PayrollMoney.toDecimal(rawWorkingDays);
    const payableDays = PayrollMoney.toDecimal(rawPayableDays);

    if (workingDays.isNegative()) {
      throw new BadRequestException("Working days cannot be negative.");
    }
    if (payableDays.isNegative()) {
      throw new BadRequestException("Payable days cannot be negative.");
    }

    const dailyRate = workingDays.greaterThan(0)
      ? PayrollMoney.round(PayrollMoney.div(baseMonthlyCtc, workingDays))
      : new Prisma.Decimal(0);

    const breakdownItems: ProrationResultItem[] = [];

    let proratedBasicDecimal = new Prisma.Decimal(0);
    let proratedGrossDecimal = new Prisma.Decimal(0);
    let totalDeductionsDecimal = new Prisma.Decimal(0);
    let employerContributionsDecimal = new Prisma.Decimal(0);

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
    for (const comp of components) {
      const baseAmountDecimal = PayrollMoney.round(comp.monthlyAmount);

      if (comp.type === "DEDUCTION") {
        let proratedAmountDecimal = new Prisma.Decimal(0);

        if (comp.category === "PF") {
          // Delegate to authoritative PfEngine with prorated basic wage
          const pfResult = PfEngine.calculatePf({
            basicMonthlySalary: proratedBasicDecimal.toNumber(),
            isPfCappedAtStatutoryWageCeiling: true
          });
          proratedAmountDecimal = PayrollMoney.toDecimal(pfResult.employeePfContribution);
        } else if (comp.category === "ESI") {
          // Delegate to authoritative EsiEngine with prorated gross wages
          const esiResult = EsiEngine.calculateEsi({
            grossMonthlyWages: proratedGrossDecimal.toNumber()
          });
          proratedAmountDecimal = PayrollMoney.toDecimal(esiResult.employeeEsiContribution);
        } else if (comp.category === "PROFESSIONAL_TAX") {
          // PT applies from employee-assigned compensation policy when payable days > 0
          proratedAmountDecimal = payableDays.greaterThan(0)
            ? baseAmountDecimal
            : new Prisma.Decimal(0);
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
        let proratedAmountDecimal = new Prisma.Decimal(0);

        if (comp.category === "PF") {
          // Delegate to PfEngine for employer PF match
          const pfResult = PfEngine.calculatePf({
            basicMonthlySalary: proratedBasicDecimal.toNumber(),
            isPfCappedAtStatutoryWageCeiling: true
          });
          // Employer total PF contribution (EPF + EPS)
          const totalEmployerPf = pfResult.employerEpfContribution + pfResult.employerEpsContribution;
          proratedAmountDecimal = PayrollMoney.toDecimal(totalEmployerPf);
        } else if (comp.category === "ESI") {
          // Delegate to EsiEngine for employer ESI match
          const esiResult = EsiEngine.calculateEsi({
            grossMonthlyWages: proratedGrossDecimal.toNumber()
          });
          proratedAmountDecimal = PayrollMoney.toDecimal(esiResult.employerEsiContribution);
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
    let totalAdjustmentsDecimal = new Prisma.Decimal(0);
    for (const adj of adjustments) {
      totalAdjustmentsDecimal = totalAdjustmentsDecimal.add(PayrollMoney.toDecimal(adj.amount));
    }

    // Step 4: Net Salary = Prorated Gross - Deductions + Adjustments
    const netSalaryDecimal = proratedGrossDecimal
      .sub(totalDeductionsDecimal)
      .add(totalAdjustmentsDecimal);

    // Blocker 11: Fail closed on negative net pay instead of silently clamping to zero
    if (netSalaryDecimal.isNegative()) {
      throw new BadRequestException(
        `Calculated net salary cannot be negative (${netSalaryDecimal.toFixed(2)}). Total deductions (${totalDeductionsDecimal.toFixed(2)}) and negative adjustments exceed gross earnings (${proratedGrossDecimal.toFixed(2)}).`
      );
    }

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
      breakdownItems
    };
  }
}
