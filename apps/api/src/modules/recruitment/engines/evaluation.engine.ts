import { Injectable } from "@nestjs/common";

export interface CandidateEvaluationScores {
  technicalScore: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
  leadership: number;
  experienceScore: number;
}

export interface EvaluationResult {
  overallScore: number;
  weightedPercent: number;
  breakdown: Record<string, number>;
  recommendation: "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE";
}

const CRITERIA_WEIGHTS = {
  technical: 0.25,
  problemSolving: 0.20,
  experience: 0.20,
  communication: 0.15,
  cultureFit: 0.10,
  leadership: 0.10
};

@Injectable()
export class CandidateEvaluationEngine {
  calculateScore(scores: CandidateEvaluationScores): EvaluationResult {
    const tech = Math.min(5, Math.max(1, scores.technicalScore));
    const comm = Math.min(5, Math.max(1, scores.communication));
    const ps = Math.min(5, Math.max(1, scores.problemSolving));
    const culture = Math.min(5, Math.max(1, scores.cultureFit));
    const leader = Math.min(5, Math.max(1, scores.leadership));
    const exp = Math.min(5, Math.max(1, scores.experienceScore));

    const overall = Number(
      (
        tech * CRITERIA_WEIGHTS.technical +
        ps * CRITERIA_WEIGHTS.problemSolving +
        exp * CRITERIA_WEIGHTS.experience +
        comm * CRITERIA_WEIGHTS.communication +
        culture * CRITERIA_WEIGHTS.cultureFit +
        leader * CRITERIA_WEIGHTS.leadership
      ).toFixed(2)
    );

    const weightedPercent = Number(((overall / 5) * 100).toFixed(1));

    let recommendation: "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE" = "HIRE";
    if (overall >= 4.5) recommendation = "STRONG_HIRE";
    else if (overall >= 3.2) recommendation = "HIRE";
    else if (overall >= 2.0) recommendation = "NO_HIRE";
    else recommendation = "STRONG_NO_HIRE";

    return {
      overallScore: overall,
      weightedPercent,
      breakdown: {
        technical: tech,
        communication: comm,
        problemSolving: ps,
        cultureFit: culture,
        leadership: leader,
        experience: exp
      },
      recommendation
    };
  }

  aggregatePanelScores(feedbacks: CandidateEvaluationScores[]): EvaluationResult {
    if (feedbacks.length === 0) {
      return this.calculateScore({
        technicalScore: 3,
        communication: 3,
        problemSolving: 3,
        cultureFit: 3,
        leadership: 3,
        experienceScore: 3
      });
    }

    const totals = feedbacks.reduce(
      (acc, curr) => ({
        technicalScore: acc.technicalScore + curr.technicalScore,
        communication: acc.communication + curr.communication,
        problemSolving: acc.problemSolving + curr.problemSolving,
        cultureFit: acc.cultureFit + curr.cultureFit,
        leadership: acc.leadership + curr.leadership,
        experienceScore: acc.experienceScore + curr.experienceScore
      }),
      { technicalScore: 0, communication: 0, problemSolving: 0, cultureFit: 0, leadership: 0, experienceScore: 0 }
    );

    const count = feedbacks.length;
    const avgScores: CandidateEvaluationScores = {
      technicalScore: totals.technicalScore / count,
      communication: totals.communication / count,
      problemSolving: totals.problemSolving / count,
      cultureFit: totals.cultureFit / count,
      leadership: totals.leadership / count,
      experienceScore: totals.experienceScore / count
    };

    return this.calculateScore(avgScores);
  }
}
