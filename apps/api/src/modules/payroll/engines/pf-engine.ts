/**
 * TASK 30 — EMPLOYEES' PROVIDENT FUND (EPF & EPS) ENGINE
 * Calculates statutory PF contributions (Employee 12%, Employer 3.67% EPF + 8.33% EPS capped at ₹15k ceiling, EDLI 0.5%, Admin 0.5%).
 */

export interface PfCalculationInput {
  basicMonthlySalary: number;
  daMonthlySalary?: number;
  isPfCappedAtStatutoryWageCeiling?: boolean; // Cap wage basis at ₹15,000
}

export interface PfCalculationResult {
  pfWage: number;
  employeePfContribution: number; // 12%
  employerEpsContribution: number; // 8.33% capped at max ₹1,250
  employerEpfContribution: number; // Employer 12% - EPS
  employerEdliContribution: number; // 0.50% capped at max ₹75
  employerAdminCharges: number; // 0.50%
  totalEmployerPfCost: number;
  totalMonthlyPfDeposit: number;
}

export class PfEngine {
  static readonly STATUTORY_WAGE_CEILING = 15000;
  static readonly MAX_EPS_CONTRIBUTION = 1250; // 8.33% of 15,000 = 1249.50 ~ 1250
  static readonly MAX_EDLI_CONTRIBUTION = 75; // 0.50% of 15,000 = 75

  /**
   * Calculate monthly PF breakdown for employee and employer.
   */
  static calculatePf(input: PfCalculationInput): PfCalculationResult {
    const rawPfWage = input.basicMonthlySalary + (input.daMonthlySalary ?? 0);
    const pfWage = input.isPfCappedAtStatutoryWageCeiling
      ? Math.min(rawPfWage, this.STATUTORY_WAGE_CEILING)
      : rawPfWage;

    const employeePfContribution = Math.round(pfWage * 0.12);

    // EPS is statutory 8.33% on wage capped at ₹15,000
    const epsWageBasis = Math.min(pfWage, this.STATUTORY_WAGE_CEILING);
    const employerEpsContribution = Math.min(
      this.MAX_EPS_CONTRIBUTION,
      Math.round(epsWageBasis * 0.0833)
    );

    const totalEmployerTwelvePercent = Math.round(pfWage * 0.12);
    const employerEpfContribution = Math.max(0, totalEmployerTwelvePercent - employerEpsContribution);

    const employerEdliContribution = Math.min(
      this.MAX_EDLI_CONTRIBUTION,
      Math.round(epsWageBasis * 0.005)
    );
    const employerAdminCharges = Math.round(epsWageBasis * 0.005);

    const totalEmployerPfCost =
      employerEpfContribution +
      employerEpsContribution +
      employerEdliContribution +
      employerAdminCharges;

    const totalMonthlyPfDeposit = employeePfContribution + totalEmployerPfCost;

    return {
      pfWage,
      employeePfContribution,
      employerEpsContribution,
      employerEpfContribution,
      employerEdliContribution,
      employerAdminCharges,
      totalEmployerPfCost,
      totalMonthlyPfDeposit
    };
  }
}
