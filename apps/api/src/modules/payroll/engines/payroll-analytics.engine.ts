/**
 * TASK 30 — PAYROLL COST & COMPENSATION ANALYTICS ENGINE
 * Synthesizes organizational payroll spend, overtime ratios, variable pay distribution, and compensation benchmarking.
 */

export interface DepartmentPayrollSpend {
  departmentId: string;
  departmentName: string;
  headcount: number;
  totalGrossPay: number;
  totalOvertimePay: number;
  totalIncentivesPay: number;
  totalEmployerContributions: number;
  averageMonthlyCtc: number;
}

export interface EnterprisePayrollAnalytics {
  totalHeadcount: number;
  totalMonthlyGrossCost: number;
  totalMonthlyNetDisbursement: number;
  totalEmployerStatutoryCost: number;
  totalOvertimeSpend: number;
  overtimeToGrossRatio: number;
  incentiveToGrossRatio: number;
  averageSalaryPerEmployee: number;
  departmentBreakdown: DepartmentPayrollSpend[];
  costTrendMonthly: Array<{ month: string; totalCost: number }>;
}

export class PayrollAnalyticsEngine {
  /**
   * Aggregate high-level executive payroll metrics across all business units and plants.
   */
  static synthesizePayrollAnalytics(
    departments: DepartmentPayrollSpend[],
    historicalTrendMonths: Array<{ month: string; totalCost: number }> = []
  ): EnterprisePayrollAnalytics {
    let totalHeadcount = 0;
    let totalMonthlyGrossCost = 0;
    let totalOvertimeSpend = 0;
    let totalIncentivesSpend = 0;
    let totalEmployerStatutoryCost = 0;

    for (const d of departments) {
      totalHeadcount += d.headcount;
      totalMonthlyGrossCost += d.totalGrossPay;
      totalOvertimeSpend += d.totalOvertimePay;
      totalIncentivesSpend += d.totalIncentivesPay;
      totalEmployerStatutoryCost += d.totalEmployerContributions;
    }

    const overtimeToGrossRatio =
      totalMonthlyGrossCost > 0
        ? Math.round((totalOvertimeSpend / totalMonthlyGrossCost) * 1000) / 10
        : 0;

    const incentiveToGrossRatio =
      totalMonthlyGrossCost > 0
        ? Math.round((totalIncentivesSpend / totalMonthlyGrossCost) * 1000) / 10
        : 0;

    const averageSalaryPerEmployee =
      totalHeadcount > 0 ? Math.round(totalMonthlyGrossCost / totalHeadcount) : 0;

    const totalMonthlyNetDisbursement = Math.round(totalMonthlyGrossCost * 0.85); // approximate net after statutory deductions

    return {
      totalHeadcount,
      totalMonthlyGrossCost,
      totalMonthlyNetDisbursement,
      totalEmployerStatutoryCost,
      totalOvertimeSpend,
      overtimeToGrossRatio,
      incentiveToGrossRatio,
      averageSalaryPerEmployee,
      departmentBreakdown: departments,
      costTrendMonthly: historicalTrendMonths
    };
  }
}
