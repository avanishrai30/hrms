import { Injectable } from "@nestjs/common";
import type { ReviewRatingLabel } from "@prisma/client";

export interface BellCurveTarget {
  OUTSTANDING: number; // e.g. 5%
  EXCEEDS_EXPECTATIONS: number; // e.g. 15%
  MEETS_EXPECTATIONS: number; // e.g. 60%
  NEEDS_IMPROVEMENT: number; // e.g. 15%
  UNSATISFACTORY: number; // e.g. 5%
}

export interface CalibrationAnalysisResult {
  totalEmployees: number;
  meanScore: number;
  standardDeviation: number;
  targetDistribution: BellCurveTarget;
  actualDistribution: {
    counts: Record<ReviewRatingLabel, number>;
    percentages: Record<ReviewRatingLabel, number>;
  };
  varianceFromTarget: Record<ReviewRatingLabel, number>;
  isConforming: boolean;
  recommendations: string[];
}

@Injectable()
export class BellCurveCalibrationEngine {
  readonly DEFAULT_TARGET: BellCurveTarget = {
    OUTSTANDING: 5,
    EXCEEDS_EXPECTATIONS: 15,
    MEETS_EXPECTATIONS: 60,
    NEEDS_IMPROVEMENT: 15,
    UNSATISFACTORY: 5
  };

  /**
   * Evaluates department rating distribution against the configured bell curve
   */
  analyzeDistribution(
    reviews: Array<{ score: number; ratingLabel: ReviewRatingLabel }>,
    customTarget?: Partial<BellCurveTarget>
  ): CalibrationAnalysisResult {
    const target: BellCurveTarget = { ...this.DEFAULT_TARGET, ...customTarget };
    const total = reviews.length;

    const counts: Record<ReviewRatingLabel, number> = {
      OUTSTANDING: 0,
      EXCEEDS_EXPECTATIONS: 0,
      MEETS_EXPECTATIONS: 0,
      NEEDS_IMPROVEMENT: 0,
      UNSATISFACTORY: 0
    };

    if (total === 0) {
      return {
        totalEmployees: 0,
        meanScore: 0,
        standardDeviation: 0,
        targetDistribution: target,
        actualDistribution: {
          counts,
          percentages: {
            OUTSTANDING: 0,
            EXCEEDS_EXPECTATIONS: 0,
            MEETS_EXPECTATIONS: 0,
            NEEDS_IMPROVEMENT: 0,
            UNSATISFACTORY: 0
          }
        },
        varianceFromTarget: {
          OUTSTANDING: 0,
          EXCEEDS_EXPECTATIONS: 0,
          MEETS_EXPECTATIONS: 0,
          NEEDS_IMPROVEMENT: 0,
          UNSATISFACTORY: 0
        },
        isConforming: true,
        recommendations: ["No review data available for calibration."]
      };
    }

    let sum = 0;
    for (const r of reviews) {
      sum += r.score;
      if (counts[r.ratingLabel] !== undefined) {
        counts[r.ratingLabel]++;
      } else {
        counts.MEETS_EXPECTATIONS++;
      }
    }

    const mean = sum / total;
    const varianceSum = reviews.reduce((acc, r) => acc + Math.pow(r.score - mean, 2), 0);
    const standardDeviation = Math.sqrt(varianceSum / total);

    const percentages: Record<ReviewRatingLabel, number> = {
      OUTSTANDING: Number(((counts.OUTSTANDING / total) * 100).toFixed(1)),
      EXCEEDS_EXPECTATIONS: Number(((counts.EXCEEDS_EXPECTATIONS / total) * 100).toFixed(1)),
      MEETS_EXPECTATIONS: Number(((counts.MEETS_EXPECTATIONS / total) * 100).toFixed(1)),
      NEEDS_IMPROVEMENT: Number(((counts.NEEDS_IMPROVEMENT / total) * 100).toFixed(1)),
      UNSATISFACTORY: Number(((counts.UNSATISFACTORY / total) * 100).toFixed(1))
    };

    const varianceFromTarget: Record<ReviewRatingLabel, number> = {
      OUTSTANDING: Number((percentages.OUTSTANDING - target.OUTSTANDING).toFixed(1)),
      EXCEEDS_EXPECTATIONS: Number((percentages.EXCEEDS_EXPECTATIONS - target.EXCEEDS_EXPECTATIONS).toFixed(1)),
      MEETS_EXPECTATIONS: Number((percentages.MEETS_EXPECTATIONS - target.MEETS_EXPECTATIONS).toFixed(1)),
      NEEDS_IMPROVEMENT: Number((percentages.NEEDS_IMPROVEMENT - target.NEEDS_IMPROVEMENT).toFixed(1)),
      UNSATISFACTORY: Number((percentages.UNSATISFACTORY - target.UNSATISFACTORY).toFixed(1))
    };

    const recommendations: string[] = [];
    const TOLERANCE_PCT = 5.0; // +/- 5% allowance

    if (varianceFromTarget.OUTSTANDING > TOLERANCE_PCT) {
      recommendations.push(
        `Top Tier Inflation: 'Outstanding' exceeds quota by ${varianceFromTarget.OUTSTANDING}%. Consider moving borderline candidates to 'Exceeds'.`
      );
    }
    if (varianceFromTarget.EXCEEDS_EXPECTATIONS > TOLERANCE_PCT) {
      recommendations.push(
        `High Performer Skew: 'Exceeds Expectations' is overrepresented by ${varianceFromTarget.EXCEEDS_EXPECTATIONS}%.`
      );
    }
    if (varianceFromTarget.NEEDS_IMPROVEMENT < -TOLERANCE_PCT && total >= 20) {
      recommendations.push(
        `Leniency Bias: Zero/low 'Needs Improvement' ratings detected (${percentages.NEEDS_IMPROVEMENT}% vs target ${target.NEEDS_IMPROVEMENT}%).`
      );
    }

    const isConforming =
      Math.abs(varianceFromTarget.OUTSTANDING) <= TOLERANCE_PCT &&
      Math.abs(varianceFromTarget.EXCEEDS_EXPECTATIONS) <= TOLERANCE_PCT &&
      Math.abs(varianceFromTarget.MEETS_EXPECTATIONS) <= TOLERANCE_PCT;

    if (isConforming) {
      recommendations.push("Distribution aligns within standard enterprise bell-curve tolerances.");
    }

    return {
      totalEmployees: total,
      meanScore: Number(mean.toFixed(2)),
      standardDeviation: Number(standardDeviation.toFixed(2)),
      targetDistribution: target,
      actualDistribution: {
        counts,
        percentages
      },
      varianceFromTarget,
      isConforming,
      recommendations
    };
  }
}
