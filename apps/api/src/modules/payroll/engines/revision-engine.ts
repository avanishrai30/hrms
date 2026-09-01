/**
 * TASK 30 — COMPENSATION REVISION & MERIT MATRIX ENGINE
 * Simulates salary hikes based on performance appraisal ratings and compa-ratios, and calculates retroactive salary arrears.
 */

export interface SalaryRevisionInput {
  currentMonthlyCtc: number;
  performanceRating: 1 | 2 | 3 | 4 | 5; // 1 (Poor) to 5 (Outstanding)
  compaRatioPercent: number; // e.g. 85% (below median), 100% (at median), 115% (above median)
  marketCorrectionAdjustmentPercent?: number;
}

export interface SalaryRevisionResult {
  currentMonthlyCtc: number;
  currentAnnualCtc: number;
  meritHikePercentage: number;
  marketAdjustmentPercentage: number;
  totalHikePercentage: number;
  newMonthlyCtc: number;
  newAnnualCtc: number;
  monthlyIncrementAmount: number;
  annualIncrementAmount: number;
}

export interface ArrearCalculationInput {
  oldMonthlyBasic: number;
  newMonthlyBasic: number;
  effectiveFromMonth: number;
  effectiveFromYear: number;
  payoutMonth: number;
  payoutYear: number;
}

export interface ArrearCalculationResult {
  monthsDifference: number;
  monthlyDifference: number;
  totalArrearsPayable: number;
}

export class RevisionEngine {
  /**
   * Merit Increment Matrix (Rating vs Compa-Ratio Tier)
   */
  static getMeritHikePercentage(rating: 1 | 2 | 3 | 4 | 5, compaRatio: number): number {
    // If compa-ratio < 90% (underpaid relative to market) -> higher hike
    // If compa-ratio > 110% (overpaid relative to market) -> moderate hike
    const isBelowMarket = compaRatio < 90;
    const isAboveMarket = compaRatio > 110;

    switch (rating) {
      case 5: // Outstanding (Top 5%)
        return isBelowMarket ? 18.0 : isAboveMarket ? 12.0 : 15.0;
      case 4: // Exceeds Expectations
        return isBelowMarket ? 14.0 : isAboveMarket ? 9.0 : 11.0;
      case 3: // Meets Expectations
        return isBelowMarket ? 10.0 : isAboveMarket ? 6.0 : 8.0;
      case 2: // Needs Improvement
        return isBelowMarket ? 4.0 : isAboveMarket ? 0.0 : 2.0;
      case 1: // Unsatisfactory
      default:
        return 0.0;
    }
  }

  /**
   * Simulate salary revision with merit matrix and market corrections.
   */
  static simulateRevision(input: SalaryRevisionInput): SalaryRevisionResult {
    const meritHikePercentage = this.getMeritHikePercentage(
      input.performanceRating,
      input.compaRatioPercent
    );
    const marketAdjustmentPercentage = input.marketCorrectionAdjustmentPercent ?? 0;
    const totalHikePercentage = meritHikePercentage + marketAdjustmentPercentage;

    const currentAnnualCtc = input.currentMonthlyCtc * 12;
    const newMonthlyCtc = Math.round(input.currentMonthlyCtc * (1 + totalHikePercentage / 100));
    const newAnnualCtc = newMonthlyCtc * 12;

    const monthlyIncrementAmount = newMonthlyCtc - input.currentMonthlyCtc;
    const annualIncrementAmount = newAnnualCtc - currentAnnualCtc;

    return {
      currentMonthlyCtc: input.currentMonthlyCtc,
      currentAnnualCtc,
      meritHikePercentage,
      marketAdjustmentPercentage,
      totalHikePercentage,
      newMonthlyCtc,
      newAnnualCtc,
      monthlyIncrementAmount,
      annualIncrementAmount
    };
  }

  /**
   * Compute retroactive salary arrears across back-dated months.
   */
  static calculateArrears(input: ArrearCalculationInput): ArrearCalculationResult {
    const startTotalMonths = input.effectiveFromYear * 12 + input.effectiveFromMonth;
    const endTotalMonths = input.payoutYear * 12 + input.payoutMonth;
    const monthsDifference = Math.max(0, endTotalMonths - startTotalMonths);

    const monthlyDifference = Math.max(0, input.newMonthlyBasic - input.oldMonthlyBasic);
    const totalArrearsPayable = monthlyDifference * monthsDifference;

    return {
      monthsDifference,
      monthlyDifference,
      totalArrearsPayable
    };
  }
}
