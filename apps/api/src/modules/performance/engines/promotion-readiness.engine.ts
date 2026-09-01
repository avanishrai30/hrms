import { Injectable } from "@nestjs/common";
import type { SuccessorReadiness } from "@prisma/client";

export interface PromotionEvaluationInput {
  performanceScore: number; // 1.0 - 5.0
  competencyScore: number; // 1.0 - 5.0
  tenureMonths: number;
  potentialScore: number; // 1.0 - 5.0
  minTenureMonths?: number;
}

export interface PromotionEvaluationResult {
  readinessScore: number; // 0 - 100
  readinessRating: SuccessorReadiness;
  isEligibleForPromotion: boolean;
  suggestedSalaryBumpPct: number;
  scoreBreakdown: {
    performancePoints: number; // max 40
    competencyPoints: number; // max 30
    tenurePoints: number; // max 15
    potentialPoints: number; // max 15
  };
  gapAnalysis: string[];
}

@Injectable()
export class PromotionReadinessEngine {
  /**
   * Calculates comprehensive promotion readiness score
   */
  evaluatePromotionReadiness(input: PromotionEvaluationInput): PromotionEvaluationResult {
    const minTenure = input.minTenureMonths ?? 18;

    // 1. Performance Points (40% weight): (score / 5.0) * 40
    const normalizedPerf = Math.max(1, Math.min(5, input.performanceScore));
    const performancePoints = Number(((normalizedPerf / 5.0) * 40).toFixed(2));

    // 2. Competency Points (30% weight): (score / 5.0) * 30
    const normalizedComp = Math.max(1, Math.min(5, input.competencyScore));
    const competencyPoints = Number(((normalizedComp / 5.0) * 30).toFixed(2));

    // 3. Tenure Points (15% weight): (min(tenure, minTenure) / minTenure) * 15
    const tenureRatio = Math.min(1.0, Math.max(0, input.tenureMonths / minTenure));
    const tenurePoints = Number((tenureRatio * 15).toFixed(2));

    // 4. Potential Points (15% weight): (score / 5.0) * 15
    const normalizedPot = Math.max(1, Math.min(5, input.potentialScore));
    const potentialPoints = Number(((normalizedPot / 5.0) * 15).toFixed(2));

    const readinessScore = Number(
      (performancePoints + competencyPoints + tenurePoints + potentialPoints).toFixed(2)
    );

    let readinessRating: SuccessorReadiness = "READY_IN_2_YEARS";
    let isEligibleForPromotion = false;
    let suggestedSalaryBumpPct = 10.0;

    if (readinessScore >= 85 && input.tenureMonths >= minTenure) {
      readinessRating = "READY_NOW";
      isEligibleForPromotion = true;
      suggestedSalaryBumpPct = 18.0;
    } else if (readinessScore >= 70) {
      readinessRating = "READY_IN_6_MONTHS";
      isEligibleForPromotion = false;
      suggestedSalaryBumpPct = 15.0;
    } else if (readinessScore >= 55) {
      readinessRating = "READY_IN_1_YEAR";
      isEligibleForPromotion = false;
      suggestedSalaryBumpPct = 12.0;
    } else {
      readinessRating = "READY_IN_2_YEARS";
      isEligibleForPromotion = false;
      suggestedSalaryBumpPct = 8.0;
    }

    const gapAnalysis: string[] = [];
    if (input.tenureMonths < minTenure) {
      gapAnalysis.push(`Tenure in current role (${input.tenureMonths} mos) is below recommended benchmark of ${minTenure} months.`);
    }
    if (input.competencyScore < 4.0) {
      gapAnalysis.push(`Competency gap detected: Assessed at ${input.competencyScore}/5.0 (recommended >= 4.0 for promotion).`);
    }
    if (input.performanceScore < 4.0) {
      gapAnalysis.push(`Performance consistency gap: Score is ${input.performanceScore}/5.0.`);
    }

    return {
      readinessScore,
      readinessRating,
      isEligibleForPromotion,
      suggestedSalaryBumpPct,
      scoreBreakdown: {
        performancePoints,
        competencyPoints,
        tenurePoints,
        potentialPoints
      },
      gapAnalysis
    };
  }
}
