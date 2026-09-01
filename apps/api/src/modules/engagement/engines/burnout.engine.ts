/**
 * TASK 31 — BURNOUT RISK DETECTION ENGINE
 * Multi-dimensional analysis synthesizing overtime load, leave utilization, stress ratings, and sentiment decay.
 */

export interface BurnoutAssessmentInput {
  overtimeHoursLastMonth: number;
  daysSinceLastLeaveTaken: number;
  pulseStressRating: number; // 1 (Relaxed) to 5 (Extremely Stressed)
  pulseEnergyRating: number; // 1 (Exhausted) to 5 (Vibrant)
  recentSentimentScore: number; // -1.0 to +1.0
  consecutiveWorkingDays?: number;
}

export interface BurnoutAssessmentResult {
  burnoutRiskScore: number; // 0 to 100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskFactors: string[];
  recommendedAction: string;
}

export class BurnoutEngine {
  /**
   * Evaluate burnout vulnerability for an individual employee.
   */
  static assessBurnoutRisk(input: BurnoutAssessmentInput): BurnoutAssessmentResult {
    let riskPoints = 0;
    const riskFactors: string[] = [];

    // 1. Overtime hours (Max 30 pts)
    if (input.overtimeHoursLastMonth >= 35) {
      riskPoints += 30;
      riskFactors.push("High overtime load (>35 hours in month)");
    } else if (input.overtimeHoursLastMonth >= 20) {
      riskPoints += 20;
      riskFactors.push("Moderate overtime load (20-35 hours)");
    } else if (input.overtimeHoursLastMonth >= 10) {
      riskPoints += 10;
    }

    // 2. Days without taking leave (Max 25 pts)
    if (input.daysSinceLastLeaveTaken >= 120) {
      riskPoints += 25;
      riskFactors.push("No time-off or vacation taken in over 120 days");
    } else if (input.daysSinceLastLeaveTaken >= 75) {
      riskPoints += 15;
      riskFactors.push("Over 75 days since last leave taken");
    }

    // 3. Pulse Survey Stress & Energy (Max 30 pts)
    if (input.pulseStressRating >= 4) {
      riskPoints += 15;
      riskFactors.push("High self-reported stress levels");
    }
    if (input.pulseEnergyRating <= 2) {
      riskPoints += 15;
      riskFactors.push("Depleted energy / chronic fatigue reported in pulse checks");
    }

    // 4. Negative Sentiment (Max 15 pts)
    if (input.recentSentimentScore <= -0.4) {
      riskPoints += 15;
      riskFactors.push("Pronounced negative sentiment in feedback comments");
    } else if (input.recentSentimentScore < 0) {
      riskPoints += 8;
    }

    const burnoutRiskScore = Math.min(100, riskPoints);

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    let recommendedAction = "Maintain healthy work rhythms and regular 1:1 check-ins.";

    if (burnoutRiskScore >= 80) {
      riskLevel = "CRITICAL";
      recommendedAction = "Immediate manager 1:1 intervention required. Mandate compensatory rest days and redistribute workload.";
    } else if (burnoutRiskScore >= 60) {
      riskLevel = "HIGH";
      recommendedAction = "Encourage taking scheduled annual leave and review overtime allocations.";
    } else if (burnoutRiskScore >= 35) {
      riskLevel = "MEDIUM";
      recommendedAction = "Monitor upcoming shifts and ensure balanced team task distribution.";
    }

    return {
      burnoutRiskScore,
      riskLevel,
      riskFactors,
      recommendedAction
    };
  }
}
