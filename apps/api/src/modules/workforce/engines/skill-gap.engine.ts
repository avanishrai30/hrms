/**
 * TASK 28 — SKILL SUPPLY & DEMAND INTELLIGENCE ENGINE
 * Analyzes current workforce skill inventory vs strategic future demands.
 */

export interface SkillDemandItem {
  skillId: string;
  skillName: string;
  category: string;
  currentProficientCount: number; // Current Supply
  futureRequiredCount: number; // Future Demand
}

export interface SkillGapAnalysisResult {
  skillId: string;
  skillName: string;
  category: string;
  currentSupplyCount: number;
  futureDemandCount: number;
  gapCount: number;
  deficitPercent: number;
  urgencyBand: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  recommendedStrategy: "UPSKILL_INTERNAL" | "EXTERNAL_HIRE" | "CONTRACTOR_BURST";
}

export class SkillGapEngine {
  /**
   * Calculate supply-demand delta and formulate talent acquisition vs training strategies.
   */
  static analyzeSkillSupplyAndDemand(skills: SkillDemandItem[]): SkillGapAnalysisResult[] {
    return skills.map((s) => {
      const gapCount = Math.max(0, s.futureRequiredCount - s.currentProficientCount);
      const deficitPercent =
        s.futureRequiredCount > 0
          ? Math.round((gapCount / s.futureRequiredCount) * 1000) / 10
          : 0;

      let urgencyBand: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
      let recommendedStrategy: "UPSKILL_INTERNAL" | "EXTERNAL_HIRE" | "CONTRACTOR_BURST";

      if (deficitPercent >= 60) {
        urgencyBand = "CRITICAL";
        recommendedStrategy = "EXTERNAL_HIRE";
      } else if (deficitPercent >= 40) {
        urgencyBand = "HIGH";
        recommendedStrategy = "UPSKILL_INTERNAL";
      } else if (deficitPercent >= 20) {
        urgencyBand = "MODERATE";
        recommendedStrategy = "UPSKILL_INTERNAL";
      } else {
        urgencyBand = "LOW";
        recommendedStrategy = "UPSKILL_INTERNAL";
      }

      return {
        skillId: s.skillId,
        skillName: s.skillName,
        category: s.category,
        currentSupplyCount: s.currentProficientCount,
        futureDemandCount: s.futureRequiredCount,
        gapCount,
        deficitPercent,
        urgencyBand,
        recommendedStrategy
      };
    });
  }
}
