/**
 * TASK 31 — EMPLOYEE NET PROMOTER SCORE (eNPS) ENGINE
 * Calculates standardized eNPS (-100 to +100), promoter/passive/detractor distributions, and benchmark health ratings.
 */

export interface EnpsCalculationInput {
  scores: number[]; // Array of scores from 0 to 10
}

export interface EnpsCalculationResult {
  totalResponses: number;
  promotersCount: number;
  passivesCount: number;
  detractorsCount: number;
  promoterPercentage: number;
  passivePercentage: number;
  detractorPercentage: number;
  enpsScore: number; // -100 to +100
  ratingTier: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "CRITICAL";
}

export class EnpsEngine {
  /**
   * Categorize an individual score (0-10) into Promoter, Passive, or Detractor.
   */
  static categorizeScore(score: number): "PROMOTER" | "PASSIVE" | "DETRACTOR" {
    if (score >= 9) return "PROMOTER";
    if (score >= 7) return "PASSIVE";
    return "DETRACTOR";
  }

  /**
   * Compute comprehensive eNPS campaign result from response scores.
   */
  static calculateEnps(input: EnpsCalculationInput): EnpsCalculationResult {
    const totalResponses = input.scores.length;

    if (totalResponses === 0) {
      return {
        totalResponses: 0,
        promotersCount: 0,
        passivesCount: 0,
        detractorsCount: 0,
        promoterPercentage: 0,
        passivePercentage: 0,
        detractorPercentage: 0,
        enpsScore: 0,
        ratingTier: "NEEDS_IMPROVEMENT"
      };
    }

    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    for (const score of input.scores) {
      const category = this.categorizeScore(score);
      if (category === "PROMOTER") promoters++;
      else if (category === "PASSIVE") passives++;
      else detractors++;
    }

    const promoterPercentage = Math.round((promoters / totalResponses) * 1000) / 10;
    const passivePercentage = Math.round((passives / totalResponses) * 1000) / 10;
    const detractorPercentage = Math.round((detractors / totalResponses) * 1000) / 10;

    // Standard formula: % Promoters - % Detractors
    const rawEnps = ((promoters - detractors) / totalResponses) * 100;
    const enpsScore = Math.round(rawEnps * 10) / 10;

    let ratingTier: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "CRITICAL" = "NEEDS_IMPROVEMENT";
    if (enpsScore >= 50) ratingTier = "EXCELLENT";
    else if (enpsScore >= 20) ratingTier = "GOOD";
    else if (enpsScore >= 0) ratingTier = "NEEDS_IMPROVEMENT";
    else ratingTier = "CRITICAL";

    return {
      totalResponses,
      promotersCount: promoters,
      passivesCount: passives,
      detractorsCount: detractors,
      promoterPercentage,
      passivePercentage,
      detractorPercentage,
      enpsScore,
      ratingTier
    };
  }
}
