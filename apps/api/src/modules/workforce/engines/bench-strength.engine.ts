/**
 * TASK 28 — BENCH STRENGTH ANALYTICS ENGINE
 * Computes critical role bench strength, successor coverage ratio, and RAG risk status.
 */

export interface CriticalPositionBenchInput {
  positionId: string;
  positionTitle: string;
  isCritical: boolean;
  successors: Array<{
    successorId: string;
    readinessBand: "READY_NOW" | "READY_1_YEAR" | "READY_2_YEARS" | "FUTURE_TALENT";
    readinessScore: number;
    flightRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>;
}

export interface BenchStrengthEvaluation {
  positionId: string;
  positionTitle: string;
  totalSuccessorsCount: number;
  readyNowCount: number;
  readyIn1YearCount: number;
  averageReadinessScore: number;
  ragStatus: "GREEN" | "YELLOW" | "RED";
  vacancyRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
}

export class BenchStrengthEngine {
  /**
   * Evaluate bench strength for a position and determine RAG (Red/Amber/Green) risk.
   */
  static evaluatePositionBench(input: CriticalPositionBenchInput): BenchStrengthEvaluation {
    const totalCount = input.successors.length;
    const readyNow = input.successors.filter((s) => s.readinessBand === "READY_NOW").length;
    const readyIn1Year = input.successors.filter((s) => s.readinessBand === "READY_1_YEAR").length;

    const avgReadiness =
      totalCount > 0
        ? Math.round((input.successors.reduce((sum, s) => sum + s.readinessScore, 0) / totalCount) * 10) / 10
        : 0;

    let ragStatus: "GREEN" | "YELLOW" | "RED";
    let vacancyRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    const recommendations: string[] = [];

    if (readyNow >= 2) {
      ragStatus = "GREEN";
      vacancyRisk = "LOW";
    } else if (readyNow === 1 || readyIn1Year >= 2) {
      ragStatus = "YELLOW";
      vacancyRisk = "MEDIUM";
      recommendations.push("Accelerate IDP for pipeline candidates to build ready-now redundancy.");
    } else if (totalCount >= 1) {
      ragStatus = "RED";
      vacancyRisk = "HIGH";
      recommendations.push("Immediate talent pipeline intervention needed: No Ready-Now successors.");
    } else {
      ragStatus = "RED";
      vacancyRisk = "CRITICAL";
      recommendations.push("CRITICAL SUCCESSION GAP: Zero identified successors for this critical role.");
    }

    const highFlightRiskCount = input.successors.filter(
      (s) => s.flightRisk === "HIGH" || s.flightRisk === "CRITICAL"
    ).length;

    if (highFlightRiskCount > 0) {
      recommendations.push(
        `Warning: ${highFlightRiskCount} key successor(s) flagged with elevated flight risk.`
      );
    }

    return {
      positionId: input.positionId,
      positionTitle: input.positionTitle,
      totalSuccessorsCount: totalCount,
      readyNowCount: readyNow,
      readyIn1YearCount: readyIn1Year,
      averageReadinessScore: avgReadiness,
      ragStatus,
      vacancyRisk,
      recommendations
    };
  }
}
