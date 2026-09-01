import { Injectable } from "@nestjs/common";
import type { ReviewRatingLabel } from "@prisma/client";

export interface RaterScoreInput {
  raterType: "SELF" | "MANAGER" | "PEER" | "SKIP_MANAGER" | "CROSS_FUNCTIONAL" | string;
  score: number;
  weightage?: number;
}

export interface Appraisal360Result {
  finalScore: number;
  ratingLabel: ReviewRatingLabel;
  scoreBreakdown: {
    selfScore: number | null;
    managerScore: number | null;
    peerScore: number | null;
    skipLevelScore: number | null;
    crossFunctionalScore: number | null;
  };
}

@Injectable()
export class Appraisal360Engine {
  // Default standard weightages
  private readonly DEFAULT_WEIGHTS = {
    SELF: 0.20,
    MANAGER: 0.40,
    PEER: 0.20,
    SKIP_MANAGER: 0.10,
    CROSS_FUNCTIONAL: 0.10
  };

  /**
   * Aggregates 360 multi-rater scores with weighted normalization
   */
  calculate360AppraisalScore(raterScores: RaterScoreInput[]): Appraisal360Result {
    if (!raterScores || raterScores.length === 0) {
      return {
        finalScore: 0,
        ratingLabel: "MEETS_EXPECTATIONS",
        scoreBreakdown: {
          selfScore: null,
          managerScore: null,
          peerScore: null,
          skipLevelScore: null,
          crossFunctionalScore: null
        }
      };
    }

    const selfScores = raterScores.filter((r) => r.raterType === "SELF").map((r) => r.score);
    const managerScores = raterScores.filter((r) => r.raterType === "MANAGER").map((r) => r.score);
    const peerScores = raterScores.filter((r) => r.raterType === "PEER").map((r) => r.score);
    const skipScores = raterScores.filter((r) => r.raterType === "SKIP_MANAGER").map((r) => r.score);
    const crossScores = raterScores.filter((r) => r.raterType === "CROSS_FUNCTIONAL").map((r) => r.score);

    const avg = (arr: number[]): number | null => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

    const selfAvg = avg(selfScores);
    const managerAvg = avg(managerScores);
    const peerAvg = avg(peerScores);
    const skipAvg = avg(skipScores);
    const crossAvg = avg(crossScores);

    // Dynamic weighting based on available raters
    let totalWeight = 0;
    let weightedSum = 0;

    if (selfAvg !== null) {
      weightedSum += selfAvg * this.DEFAULT_WEIGHTS.SELF;
      totalWeight += this.DEFAULT_WEIGHTS.SELF;
    }
    if (managerAvg !== null) {
      weightedSum += managerAvg * this.DEFAULT_WEIGHTS.MANAGER;
      totalWeight += this.DEFAULT_WEIGHTS.MANAGER;
    }
    if (peerAvg !== null) {
      weightedSum += peerAvg * this.DEFAULT_WEIGHTS.PEER;
      totalWeight += this.DEFAULT_WEIGHTS.PEER;
    }
    if (skipAvg !== null) {
      weightedSum += skipAvg * this.DEFAULT_WEIGHTS.SKIP_MANAGER;
      totalWeight += this.DEFAULT_WEIGHTS.SKIP_MANAGER;
    }
    if (crossAvg !== null) {
      weightedSum += crossAvg * this.DEFAULT_WEIGHTS.CROSS_FUNCTIONAL;
      totalWeight += this.DEFAULT_WEIGHTS.CROSS_FUNCTIONAL;
    }

    const finalScore = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
    const ratingLabel = this.determineRatingLabel(finalScore);

    return {
      finalScore,
      ratingLabel,
      scoreBreakdown: {
        selfScore: selfAvg !== null ? Number(selfAvg.toFixed(2)) : null,
        managerScore: managerAvg !== null ? Number(managerAvg.toFixed(2)) : null,
        peerScore: peerAvg !== null ? Number(peerAvg.toFixed(2)) : null,
        skipLevelScore: skipAvg !== null ? Number(skipAvg.toFixed(2)) : null,
        crossFunctionalScore: crossAvg !== null ? Number(crossAvg.toFixed(2)) : null
      }
    };
  }

  /**
   * Translates 1.0 - 5.0 continuous score to structured rating label
   */
  determineRatingLabel(score: number): ReviewRatingLabel {
    if (score >= 4.5) return "OUTSTANDING";
    if (score >= 3.8) return "EXCEEDS_EXPECTATIONS";
    if (score >= 2.8) return "MEETS_EXPECTATIONS";
    if (score >= 2.0) return "NEEDS_IMPROVEMENT";
    return "UNSATISFACTORY";
  }
}
