/**
 * TASK 30 — STATUTORY & PERFORMANCE BONUS ENGINE
 * Calculates statutory minimum (8.33%) / maximum (20%) bonus under Payment of Bonus Act (1965) and appraisal-linked performance bonuses.
 */

export interface BonusCalculationInput {
  annualBasicSalary: number;
  bonusType: "ANNUAL_STATUTORY" | "FESTIVE" | "PERFORMANCE" | "RETENTION" | "SIGN_ON";
  statutoryBonusPercentage?: number; // default 8.33% (statutory min) to 20% (statutory max)
  performanceRatingMultiplier?: number; // e.g. 1.2x for Exceeds Expectations
  targetBonusPercentageOfCtc?: number; // e.g. 10%
  annualCtc?: number;
}

export interface BonusCalculationResult {
  bonusType: string;
  wageBasis: number;
  effectivePercentage: number;
  bonusAmount: number;
  isStatutoryCompliant: boolean;
}

export class BonusEngine {
  static readonly STATUTORY_MIN_PERCENTAGE = 8.33;
  static readonly STATUTORY_MAX_PERCENTAGE = 20.0;

  /**
   * Calculate statutory or performance bonus amount.
   */
  static calculateBonus(input: BonusCalculationInput): BonusCalculationResult {
    let bonusAmount = 0;
    let effectivePercentage = 0;
    let wageBasis = input.annualBasicSalary;

    if (input.bonusType === "ANNUAL_STATUTORY" || input.bonusType === "FESTIVE") {
      effectivePercentage = Math.min(
        this.STATUTORY_MAX_PERCENTAGE,
        Math.max(this.STATUTORY_MIN_PERCENTAGE, input.statutoryBonusPercentage ?? this.STATUTORY_MIN_PERCENTAGE)
      );
      bonusAmount = Math.round(wageBasis * (effectivePercentage / 100));
    } else if (input.bonusType === "PERFORMANCE") {
      wageBasis = input.annualCtc ?? input.annualBasicSalary;
      const targetPct = input.targetBonusPercentageOfCtc ?? 10;
      const ratingMultiplier = input.performanceRatingMultiplier ?? 1.0;
      effectivePercentage = targetPct * ratingMultiplier;
      bonusAmount = Math.round(wageBasis * (effectivePercentage / 100));
    } else {
      // Retention / Sign-on
      effectivePercentage = input.targetBonusPercentageOfCtc ?? 15;
      wageBasis = input.annualCtc ?? input.annualBasicSalary;
      bonusAmount = Math.round(wageBasis * (effectivePercentage / 100));
    }

    return {
      bonusType: input.bonusType,
      wageBasis,
      effectivePercentage: Math.round(effectivePercentage * 100) / 100,
      bonusAmount,
      isStatutoryCompliant: effectivePercentage >= this.STATUTORY_MIN_PERCENTAGE
    };
  }
}
