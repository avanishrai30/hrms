import { Injectable } from "@nestjs/common";

export interface KeyResultInput {
  metricType: "PERCENTAGE" | "NUMERIC" | "CURRENCY" | "BOOLEAN";
  startValue: number;
  targetValue: number;
  currentValue: number;
  weightage: number;
}

@Injectable()
export class OkrGoalEngine {
  /**
   * Calculates the progress percentage for a single key result
   */
  calculateKeyResultProgress(kr: KeyResultInput): number {
    if (kr.metricType === "BOOLEAN") {
      return kr.currentValue >= 1 ? 100 : 0;
    }

    const delta = kr.targetValue - kr.startValue;
    if (delta === 0) return kr.currentValue >= kr.targetValue ? 100 : 0;

    const achieved = kr.currentValue - kr.startValue;
    const pct = (achieved / delta) * 100;
    return Math.max(0, Math.min(100, Number(pct.toFixed(2))));
  }

  /**
   * Calculates overall goal progress based on its key results or direct metrics
   */
  calculateGoalProgress(
    targetValue: number,
    achievedValue: number,
    keyResults: KeyResultInput[] = []
  ): number {
    if (keyResults.length === 0) {
      if (targetValue <= 0) return achievedValue > 0 ? 100 : 0;
      const pct = (achievedValue / targetValue) * 100;
      return Math.max(0, Math.min(100, Number(pct.toFixed(2))));
    }

    const totalWeight = keyResults.reduce((acc, kr) => acc + (kr.weightage || 0), 0);
    if (totalWeight <= 0) {
      // Simple average
      const sum = keyResults.reduce((acc, kr) => acc + this.calculateKeyResultProgress(kr), 0);
      return Number((sum / keyResults.length).toFixed(2));
    }

    // Weighted average
    const weightedSum = keyResults.reduce((acc, kr) => {
      const krProgress = this.calculateKeyResultProgress(kr);
      return acc + (krProgress * (kr.weightage / totalWeight));
    }, 0);

    return Math.max(0, Math.min(100, Number(weightedSum.toFixed(2))));
  }

  /**
   * Calculates overall cycle progress across multiple goals
   */
  calculateCycleProgress(
    goals: Array<{ progressPercent: number; weightage: number }>
  ): { overallProgress: number; goalsCount: number; completedCount: number } {
    if (goals.length === 0) {
      return { overallProgress: 0, goalsCount: 0, completedCount: 0 };
    }

    const totalWeight = goals.reduce((acc, g) => acc + (g.weightage || 10), 0);
    const weightedSum = goals.reduce((acc, g) => {
      const weight = g.weightage || 10;
      return acc + (g.progressPercent * (weight / totalWeight));
    }, 0);

    const completed = goals.filter((g) => g.progressPercent >= 100).length;

    return {
      overallProgress: Math.max(0, Math.min(100, Number(weightedSum.toFixed(2)))),
      goalsCount: goals.length,
      completedCount: completed
    };
  }
}
