/**
 * TASK 31 — EMPLOYEE ENGAGEMENT CALCULATION ENGINE
 * Aggregates survey participation rates, question category distributions, and overall engagement indices.
 */

export interface QuestionResponseStat {
  questionId: string;
  category: string;
  totalResponses: number;
  averageRating: number; // 1 to 5 scale
}

export interface EngagementIndexInput {
  totalEmployeesInvited: number;
  totalEmployeesResponded: number;
  questionStats: QuestionResponseStat[];
}

export interface EngagementIndexResult {
  participationRate: number; // Percentage 0 - 100%
  overallEngagementScore: number; // 0 - 100 scale
  categoryScores: Record<string, number>;
  topDriverCategory: string;
  lowestDriverCategory: string;
}

export class EngagementEngine {
  /**
   * Calculate overall organizational engagement score and category breakdowns.
   */
  static calculateEngagementIndex(input: EngagementIndexInput): EngagementIndexResult {
    const participationRate =
      input.totalEmployeesInvited > 0
        ? Math.min(100, Math.round((input.totalEmployeesResponded / input.totalEmployeesInvited) * 1000) / 10)
        : 0;

    if (!input.questionStats || input.questionStats.length === 0) {
      return {
        participationRate,
        overallEngagementScore: 0,
        categoryScores: {},
        topDriverCategory: "N/A",
        lowestDriverCategory: "N/A"
      };
    }

    const categorySums: Record<string, { totalRating: number; count: number }> = {};
    let totalScoreSum = 0;

    for (const stat of input.questionStats) {
      const normalizedScore = (stat.averageRating / 5) * 100; // convert 1-5 to 0-100%
      totalScoreSum += normalizedScore;

      const catEntry = categorySums[stat.category] ?? { totalRating: 0, count: 0 };
      catEntry.totalRating += normalizedScore;
      catEntry.count += 1;
      categorySums[stat.category] = catEntry;
    }

    const overallEngagementScore = Math.round((totalScoreSum / input.questionStats.length) * 10) / 10;

    const categoryScores: Record<string, number> = {};
    let topCategory = "";
    let topScore = -1;
    let lowestCategory = "";
    let lowestScore = 101;

    for (const [cat, data] of Object.entries(categorySums)) {
      const avg = Math.round((data.totalRating / data.count) * 10) / 10;
      categoryScores[cat] = avg;

      if (avg > topScore) {
        topScore = avg;
        topCategory = cat;
      }
      if (avg < lowestScore) {
        lowestScore = avg;
        lowestCategory = cat;
      }
    }

    return {
      participationRate,
      overallEngagementScore,
      categoryScores,
      topDriverCategory: topCategory,
      lowestDriverCategory: lowestCategory
    };
  }
}
