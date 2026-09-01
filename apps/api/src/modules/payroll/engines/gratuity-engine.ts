/**
 * TASK 30 — PAYMENT OF GRATUITY ACT (1972) ENGINE
 * Calculates statutory gratuity payout: (15 * (Basic + DA) * Years of Service) / 26 with statutory tax exemption limit of ₹20 Lakhs.
 */

export interface GratuityCalculationInput {
  dateOfJoining: Date;
  dateOfLeaving: Date;
  lastDrawnBasicSalary: number;
  lastDrawnDa?: number;
  isSeparationDueToDeathOrDisablement?: boolean; // Waives 5-year eligibility requirement
}

export interface GratuityCalculationResult {
  totalServiceYearsExact: number;
  completedYearsForGratuity: number;
  isEligible: boolean;
  wageBasis: number;
  gratuityGrossCalculated: number;
  statutoryTaxExemptLimit: number;
  gratuityTaxExemptAmount: number;
  gratuityTaxableAmount: number;
  netGratuityPayable: number;
}

export class GratuityEngine {
  static readonly STATUTORY_TAX_EXEMPT_LIMIT = 2000000; // ₹20 Lakhs max exemption limit

  /**
   * Calculate statutory gratuity for separated employee.
   */
  static calculateGratuity(input: GratuityCalculationInput): GratuityCalculationResult {
    const diffMs = input.dateOfLeaving.getTime() - input.dateOfJoining.getTime();
    const totalServiceYearsExact = Math.max(0, diffMs / (1000 * 60 * 60 * 24 * 365.25));

    // Full years + if remaining months > 6 months, round up to full year
    const fullYears = Math.floor(totalServiceYearsExact);
    const fractionYear = totalServiceYearsExact - fullYears;
    const completedYearsForGratuity = fractionYear >= 0.50 ? fullYears + 1 : fullYears;

    const isEligible =
      completedYearsForGratuity >= 5 || (input.isSeparationDueToDeathOrDisablement ?? false);

    const wageBasis = input.lastDrawnBasicSalary + (input.lastDrawnDa ?? 0);

    if (!isEligible || completedYearsForGratuity === 0) {
      return {
        totalServiceYearsExact: Math.round(totalServiceYearsExact * 100) / 100,
        completedYearsForGratuity,
        isEligible: false,
        wageBasis,
        gratuityGrossCalculated: 0,
        statutoryTaxExemptLimit: this.STATUTORY_TAX_EXEMPT_LIMIT,
        gratuityTaxExemptAmount: 0,
        gratuityTaxableAmount: 0,
        netGratuityPayable: 0
      };
    }

    // Statutory Formula: (15 * (Basic + DA) * Years) / 26
    const gratuityGrossCalculated = Math.round(
      (15 * wageBasis * completedYearsForGratuity) / 26
    );

    const gratuityTaxExemptAmount = Math.min(
      gratuityGrossCalculated,
      this.STATUTORY_TAX_EXEMPT_LIMIT
    );
    const gratuityTaxableAmount = Math.max(
      0,
      gratuityGrossCalculated - gratuityTaxExemptAmount
    );

    return {
      totalServiceYearsExact: Math.round(totalServiceYearsExact * 100) / 100,
      completedYearsForGratuity,
      isEligible: true,
      wageBasis,
      gratuityGrossCalculated,
      statutoryTaxExemptLimit: this.STATUTORY_TAX_EXEMPT_LIMIT,
      gratuityTaxExemptAmount,
      gratuityTaxableAmount,
      netGratuityPayable: gratuityGrossCalculated
    };
  }
}
