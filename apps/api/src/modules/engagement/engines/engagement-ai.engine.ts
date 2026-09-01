/**
 * TASK 31 — AI ENGAGEMENT & RETENTION INTELLIGENCE ENGINE
 * Predicts flight risks, flags disengagement signals, generates sentiment heatmaps, and prescribes targeted culture interventions.
 */

export interface TeamSignalInput {
  departmentName: string;
  headcount: number;
  participationRate: number; // 0 to 100%
  enpsScore: number; // -100 to +100
  averageHappinessScore: number; // 1 to 5
  burnoutRiskCount: number;
  unresolvedSuggestionsCount: number;
}

export interface AiCultureInsight {
  departmentName: string;
  healthLevel: "HEALTHY" | "WATCH" | "CRITICAL";
  riskSignals: string[];
  recommendedInterventions: string[];
}

export class EngagementAiEngine {
  /**
   * Run AI rule-based and predictive analysis on team engagement signals.
   */
  static generateTeamInsights(signals: TeamSignalInput[]): AiCultureInsight[] {
    return signals.map((s) => {
      const riskSignals: string[] = [];
      const recommendedInterventions: string[] = [];
      let healthLevel: "HEALTHY" | "WATCH" | "CRITICAL" = "HEALTHY";

      if (s.enpsScore < 0) {
        riskSignals.push(`Negative eNPS (${s.enpsScore}): More detractors than promoters.`);
        recommendedInterventions.push("Conduct anonymous focus groups to isolate core employee friction points.");
        healthLevel = "WATCH";
      }

      if (s.participationRate < 60) {
        riskSignals.push(`Low survey participation (${s.participationRate}%): Potential apathy or survey fatigue.`);
        recommendedInterventions.push("Shorten survey lengths and communicate past feedback implementation wins.");
      }

      if (s.burnoutRiskCount > 0) {
        const burnoutRatio = (s.burnoutRiskCount / s.headcount) * 100;
        if (burnoutRatio >= 25) {
          healthLevel = "CRITICAL";
          riskSignals.push(`High burnout vulnerability: ${s.burnoutRiskCount} staff (${Math.round(burnoutRatio)}%) flagged.`);
          recommendedInterventions.push("Mandate immediate overtime cap and schedule mandatory team rest days.");
        } else {
          riskSignals.push(`${s.burnoutRiskCount} team member(s) flagged for burnout risk.`);
        }
      }

      if (s.unresolvedSuggestionsCount >= 5) {
        riskSignals.push(`${s.unresolvedSuggestionsCount} pending employee suggestions awaiting management response.`);
        recommendedInterventions.push("Review and update innovation/suggestion tickets to foster psychological safety.");
      }

      if (riskSignals.length === 0) {
        recommendedInterventions.push("Maintain current positive team rituals and celebrate high engagement.");
      }

      return {
        departmentName: s.departmentName,
        healthLevel,
        riskSignals,
        recommendedInterventions
      };
    });
  }
}
