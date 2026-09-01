/**
 * TASK 28 — ATTRITION PREDICTION & FLIGHT RISK ENGINE
 * Explainable AI-driven attrition scoring (0-100) with primary risk drivers,
 * mitigating factors, and proactive retention playbooks.
 */

export interface AttritionInputFactors {
  tenureMonths: number;
  monthsSinceLastPromotion: number;
  monthsSinceLastSalaryIncrement: number;
  compensationCompaRatio: number; // e.g. 0.85 = 85% of market median
  recentPerformanceRating: number; // 1.0 - 5.0
  leaveSpikeLast90Days: boolean; // Sudden increase in single-day leaves
  attendanceIrregularityRate: number; // 0.0 - 1.0
  lmsEngagementScore: number; // 0.0 - 1.0 (active learning activity)
  managerChangesLast12Months: number;
}

export interface AttritionRiskOutput {
  riskScore: number; // 0 - 100
  riskCategory: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  primaryDrivers: string[];
  mitigatingFactors: string[];
  recommendedActions: string[];
}

export class AttritionEngine {
  /**
   * Evaluate employee flight risk and generate explainable drivers and mitigation playbooks.
   */
  static evaluateAttritionRisk(input: AttritionInputFactors): AttritionRiskOutput {
    let score = 20; // Base baseline attrition risk
    const drivers: string[] = [];
    const mitigating: string[] = [];
    const actions: string[] = [];

    // 1. Stagnation Factors
    if (input.monthsSinceLastPromotion > 24 && input.recentPerformanceRating >= 4.0) {
      score += 25;
      drivers.push("High performer without promotion for over 24 months");
      actions.push("Evaluate for immediate promotion or leadership pathway in upcoming cycle");
    } else if (input.monthsSinceLastPromotion > 36) {
      score += 15;
      drivers.push("Over 3 years in current role without career band progression");
    }

    // 2. Compensation Factors
    if (input.compensationCompaRatio < 0.85) {
      score += 20;
      drivers.push("Compensation is below 85% of designation benchmark median");
      actions.push("Conduct off-cycle market equity compensation correction");
    } else if (input.compensationCompaRatio >= 1.05) {
      score -= 10;
      mitigating.push("Competitive compensation above 105% of market median");
    }

    if (input.monthsSinceLastSalaryIncrement > 18) {
      score += 15;
      drivers.push("No salary revision in the last 18+ months");
    }

    // 3. Behavioral Disengagement Signals
    if (input.leaveSpikeLast90Days) {
      score += 15;
      drivers.push("Elevated single-day unplanned leave frequency in last 90 days");
      actions.push("Manager check-in to discuss work-life balance and project burnout");
    }

    if (input.attendanceIrregularityRate > 0.25) {
      score += 10;
      drivers.push("High attendance variance and irregular punch patterns");
    }

    // 4. Organizational Churn
    if (input.managerChangesLast12Months >= 2) {
      score += 10;
      drivers.push("Frequent reporting changes (2+ managers in 12 months)");
    }

    // 5. Positive Engagement Mitigations
    if (input.lmsEngagementScore >= 0.7) {
      score -= 10;
      mitigating.push("High LMS Academy engagement and active skill certification pursuits");
    }

    if (input.tenureMonths > 36 && input.tenureMonths < 84) {
      score -= 5;
      mitigating.push("Solid institutional tenure and established internal network");
    }

    // Bound final score between 5 and 98
    const riskScore = Math.max(5, Math.min(98, Math.round(score)));

    let riskCategory: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    if (riskScore >= 75) {
      riskCategory = "CRITICAL";
    } else if (riskScore >= 55) {
      riskCategory = "HIGH";
    } else if (riskScore >= 35) {
      riskCategory = "MEDIUM";
    } else {
      riskCategory = "LOW";
    }

    if (actions.length === 0) {
      actions.push("Maintain standard quarterly check-in cadence and continuous feedback.");
    }

    return {
      riskScore,
      riskCategory,
      primaryDrivers: drivers,
      mitigatingFactors: mitigating,
      recommendedActions: actions
    };
  }
}
