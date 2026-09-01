/**
 * TASK 28 — SUCCESSION READINESS ENGINE
 * Computes multi-factor successor readiness scores based on Performance (30%), Potential (25%),
 * Competencies (20%), Certifications (15%), and Manager Assessment (10%).
 */

export interface SuccessorReadinessInput {
  performanceRating: number; // 1.0 - 5.0
  potentialRating: number; // 1.0 - 5.0
  competencyScorePercent: number; // 0 - 100
  certificationsCompletedRatio: number; // 0.0 - 1.0
  managerAssessmentRating: number; // 1.0 - 5.0
}

export interface SuccessorReadinessResult {
  readinessScorePercent: number;
  readinessBand: "READY_NOW" | "READY_1_YEAR" | "READY_2_YEARS" | "FUTURE_TALENT";
  breakdown: {
    performanceScore: number;
    potentialScore: number;
    competencyScore: number;
    certificationScore: number;
    managerScore: number;
  };
}

export class SuccessionEngine {
  /**
   * Calculate comprehensive readiness score and assign successor readiness band.
   */
  static calculateSuccessorReadiness(input: SuccessorReadinessInput): SuccessorReadinessResult {
    // Normalize 1-5 scales to 100%
    const perfNormalized = Math.min(100, Math.max(0, (input.performanceRating / 5.0) * 100));
    const potNormalized = Math.min(100, Math.max(0, (input.potentialRating / 5.0) * 100));
    const compNormalized = Math.min(100, Math.max(0, input.competencyScorePercent));
    const certNormalized = Math.min(100, Math.max(0, input.certificationsCompletedRatio * 100));
    const mgrNormalized = Math.min(100, Math.max(0, (input.managerAssessmentRating / 5.0) * 100));

    // Weighted synthesis
    const weightedScore =
      perfNormalized * 0.3 +
      potNormalized * 0.25 +
      compNormalized * 0.2 +
      certNormalized * 0.15 +
      mgrNormalized * 0.1;

    const readinessScorePercent = Math.min(100, Math.round(weightedScore * 10) / 10);

    let readinessBand: "READY_NOW" | "READY_1_YEAR" | "READY_2_YEARS" | "FUTURE_TALENT";
    if (readinessScorePercent >= 85) {
      readinessBand = "READY_NOW";
    } else if (readinessScorePercent >= 70) {
      readinessBand = "READY_1_YEAR";
    } else if (readinessScorePercent >= 55) {
      readinessBand = "READY_2_YEARS";
    } else {
      readinessBand = "FUTURE_TALENT";
    }

    return {
      readinessScorePercent,
      readinessBand,
      breakdown: {
        performanceScore: Math.round(perfNormalized),
        potentialScore: Math.round(potNormalized),
        competencyScore: Math.round(compNormalized),
        certificationScore: Math.round(certNormalized),
        managerScore: Math.round(mgrNormalized)
      }
    };
  }
}
