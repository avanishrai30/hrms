/**
 * TASK 31 — MANAGER EFFECTIVENESS & LEADERSHIP INDEX ENGINE
 * Calculates manager leadership scores based on upward team feedback, 1:1 check-in cadences, recognition frequency, and team retention.
 */

export interface ManagerAssessmentInput {
  managerEmployeeId: string;
  directReportsCount: number;
  upwardFeedbackRatingAvg: number; // 1 to 5
  teamAverageHappinessRating: number; // 1 to 5
  monthlyRecognitionsGivenCount: number; // Recognitions sent to team
  teamTurnoverRatePercent: number; // e.g. 5%
}

export interface ManagerEffectivenessResult {
  managerEmployeeId: string;
  leadershipScore: number; // 0 to 100
  leadershipTier: "EXEMPLARY" | "EFFECTIVE" | "DEVELOPING" | "COACHING_REQUIRED";
  strengths: string[];
  growthAreas: string[];
}

export class ManagerEffectivenessEngine {
  /**
   * Compute comprehensive manager effectiveness score.
   */
  static assessManager(input: ManagerAssessmentInput): ManagerEffectivenessResult {
    // 1. Upward feedback (40% weight): (avg / 5) * 40
    const upwardScore = (input.upwardFeedbackRatingAvg / 5) * 40;

    // 2. Team happiness (30% weight): (avg / 5) * 30
    const happinessScore = (input.teamAverageHappinessRating / 5) * 30;

    // 3. Active Recognition Habit (15% weight): target >= 1 recognition per direct report per month
    const targetRecognitions = Math.max(1, input.directReportsCount);
    const recognitionRatio = Math.min(1.0, input.monthlyRecognitionsGivenCount / targetRecognitions);
    const recognitionScore = recognitionRatio * 15;

    // 4. Team Retention (15% weight): (100 - turnover) * 0.15
    const retentionScore = Math.max(0, (100 - input.teamTurnoverRatePercent) * 0.15);

    const leadershipScore = Math.round((upwardScore + happinessScore + recognitionScore + retentionScore) * 10) / 10;

    const strengths: string[] = [];
    const growthAreas: string[] = [];

    if (input.upwardFeedbackRatingAvg >= 4.2) {
      strengths.push("High trust and positive leadership ratings from direct reports.");
    } else if (input.upwardFeedbackRatingAvg < 3.5) {
      growthAreas.push("Upward feedback indicates opportunities to improve communication and psychological safety.");
    }

    if (input.monthlyRecognitionsGivenCount >= input.directReportsCount) {
      strengths.push("Active appreciation champion: Consistently recognizes team achievements.");
    } else {
      growthAreas.push("Increase frequency of specific, timely recognition for direct reports.");
    }

    if (input.teamTurnoverRatePercent <= 5) {
      strengths.push("Excellent team stability and talent retention.");
    }

    let leadershipTier: "EXEMPLARY" | "EFFECTIVE" | "DEVELOPING" | "COACHING_REQUIRED" = "EFFECTIVE";
    if (leadershipScore >= 85) leadershipTier = "EXEMPLARY";
    else if (leadershipScore >= 70) leadershipTier = "EFFECTIVE";
    else if (leadershipScore >= 55) leadershipTier = "DEVELOPING";
    else leadershipTier = "COACHING_REQUIRED";

    return {
      managerEmployeeId: input.managerEmployeeId,
      leadershipScore,
      leadershipTier,
      strengths,
      growthAreas
    };
  }
}
