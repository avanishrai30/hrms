import type {
  SalaryComponentCategory,
  SalaryComponentType
} from "@vc-wms/shared-types";

export interface CompensationItemSnapshot {
  componentId?: string | null;
  name: string;
  code: string;
  type: SalaryComponentType;
  category: SalaryComponentCategory;
  monthlyAmount: number;
  isTaxable?: boolean;
}

export interface AdjustmentSnapshot {
  id?: string;
  type: string;
  title: string;
  amount: number;
}

export interface ProrationResultItem {
  componentId?: string | null;
  name: string;
  code: string;
  type: SalaryComponentType;
  category: SalaryComponentCategory;
  baseAmount: number;
  proratedAmount: number;
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
  breakdownItems: ProrationResultItem[];
}

export class SalaryProrationEngine {
  /**
   * Computes prorated salary component breakdowns and net salary.
   */
  static calculateProration(params: {
    baseMonthlyCtc: number;
    workingDays: number;
    payableDays: number;
    components: CompensationItemSnapshot[];
    adjustments?: AdjustmentSnapshot[];
  }): ProrationResult {
    const { baseMonthlyCtc, workingDays, payableDays, components, adjustments = [] } = params;

    const dailyRate = workingDays > 0 ? Math.round((baseMonthlyCtc / workingDays) * 100) / 100 : 0;
    const prorationFactor = workingDays > 0 ? Math.min(1.0, payableDays / workingDays) : 0;

    const breakdownItems: ProrationResultItem[] = [];

    let proratedBasic = 0;
    let proratedGross = 0;
    let totalDeductions = 0;
    let employerContributions = 0;

    // Step 1: Prorate Earnings
    for (const comp of components) {
      if (comp.type === "EARNING") {
        const proratedAmount = Math.round(comp.monthlyAmount * prorationFactor * 100) / 100;
        if (comp.category === "BASIC") {
          proratedBasic = proratedAmount;
        }
        proratedGross += proratedAmount;

        breakdownItems.push({
          componentId: comp.componentId,
          name: comp.name,
          code: comp.code,
          type: comp.type,
          category: comp.category,
          baseAmount: comp.monthlyAmount,
          proratedAmount,
          isTaxable: comp.isTaxable ?? true
        });
      }
    }

    // Step 2: Calculate Prorated Deductions & Employer Contributions
    for (const comp of components) {
      if (comp.type === "DEDUCTION") {
        let proratedAmount = 0;
        if (comp.category === "PF") {
          // 12% of Prorated Basic
          proratedAmount = Math.round(proratedBasic * 0.12 * 100) / 100;
        } else if (comp.category === "ESI") {
          // 0.75% of Gross if Gross <= 21000
          proratedAmount = proratedGross <= 21000 ? Math.round(proratedGross * 0.0075 * 100) / 100 : 0;
        } else if (comp.category === "PROFESSIONAL_TAX") {
          // PT is ₹200 if payable days > 0
          proratedAmount = payableDays > 0 ? comp.monthlyAmount : 0;
        } else {
          proratedAmount = Math.round(comp.monthlyAmount * prorationFactor * 100) / 100;
        }

        totalDeductions += proratedAmount;

        breakdownItems.push({
          componentId: comp.componentId,
          name: comp.name,
          code: comp.code,
          type: comp.type,
          category: comp.category,
          baseAmount: comp.monthlyAmount,
          proratedAmount,
          isTaxable: false
        });
      } else if (comp.type === "EMPLOYER_CONTRIBUTION") {
        let proratedAmount = 0;
        if (comp.category === "PF") {
          // 12% of Prorated Basic
          proratedAmount = Math.round(proratedBasic * 0.12 * 100) / 100;
        } else if (comp.category === "ESI") {
          // 3.25% of Gross if Gross <= 21000
          proratedAmount = proratedGross <= 21000 ? Math.round(proratedGross * 0.0325 * 100) / 100 : 0;
        } else {
          proratedAmount = Math.round(comp.monthlyAmount * prorationFactor * 100) / 100;
        }

        employerContributions += proratedAmount;

        breakdownItems.push({
          componentId: comp.componentId,
          name: comp.name,
          code: comp.code,
          type: comp.type,
          category: comp.category,
          baseAmount: comp.monthlyAmount,
          proratedAmount,
          isTaxable: false
        });
      }
    }

    // Step 3: Compute Net Adjustments
    const totalAdjustments = adjustments.reduce((acc, adj) => acc + adj.amount, 0);

    // Step 4: Net Salary = Prorated Gross - Deductions + Adjustments
    const netSalary = Math.max(0, Math.round((proratedGross - totalDeductions + totalAdjustments) * 100) / 100);

    return {
      baseMonthlyCtc,
      dailyRate,
      workingDays,
      payableDays,
      grossSalary: Math.round(proratedGross * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      employerContributions: Math.round(employerContributions * 100) / 100,
      totalAdjustments: Math.round(totalAdjustments * 100) / 100,
      netSalary,
      breakdownItems
    };
  }
}
