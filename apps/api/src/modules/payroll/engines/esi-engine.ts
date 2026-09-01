/**
 * TASK 30 — EMPLOYEES' STATE INSURANCE (ESI) ENGINE
 * Calculates statutory ESI coverage and contributions (Employee 0.75%, Employer 3.25% on gross wages up to ₹21,000 ceiling).
 */

export interface EsiCalculationInput {
  grossMonthlyWages: number;
  isDisabilityCovered?: boolean; // Ceiling is ₹25,000 for employees with disabilities
  isPreviouslyCoveredInCycle?: boolean;
}

export interface EsiCalculationResult {
  isEligible: boolean;
  grossWageBasis: number;
  employeeEsiContribution: number; // 0.75%
  employerEsiContribution: number; // 3.25%
  totalMonthlyEsiDeposit: number;
}

export class EsiEngine {
  static readonly STATUTORY_GROSS_CEILING = 21000;
  static readonly DISABILITY_GROSS_CEILING = 25000;

  /**
   * Evaluate ESI eligibility and calculate exact contribution shares.
   */
  static calculateEsi(input: EsiCalculationInput): EsiCalculationResult {
    const ceiling = input.isDisabilityCovered
      ? this.DISABILITY_GROSS_CEILING
      : this.STATUTORY_GROSS_CEILING;

    const isEligible =
      input.grossMonthlyWages <= ceiling || (input.isPreviouslyCoveredInCycle ?? false);

    if (!isEligible) {
      return {
        isEligible: false,
        grossWageBasis: input.grossMonthlyWages,
        employeeEsiContribution: 0,
        employerEsiContribution: 0,
        totalMonthlyEsiDeposit: 0
      };
    }

    const employeeEsiContribution = Math.round(input.grossMonthlyWages * 0.0075 * 100) / 100;
    const employerEsiContribution = Math.round(input.grossMonthlyWages * 0.0325 * 100) / 100;
    const totalMonthlyEsiDeposit = Math.round((employeeEsiContribution + employerEsiContribution) * 100) / 100;

    return {
      isEligible: true,
      grossWageBasis: input.grossMonthlyWages,
      employeeEsiContribution,
      employerEsiContribution,
      totalMonthlyEsiDeposit
    };
  }
}
