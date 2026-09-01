/**
 * TASK 31 — EMPLOYEE RECOGNITION & PEER APPRECIATION ENGINE
 * Analyzes recognition frequency, values-based distributions, sender/receiver ratios, and top recognized employees.
 */

export interface RecognitionRecord {
  id: string;
  senderEmployeeId: string;
  receiverEmployeeId: string;
  recognitionType: string;
  pointsAwarded: number;
  badgeCategory?: string;
  isMilestone?: boolean;
}

export interface RecognitionAnalyticsResult {
  totalRecognitionsCount: number;
  totalPointsDistributed: number;
  peerToManagerRatio: number;
  topValueCategory: string;
  categoryDistribution: Record<string, number>;
  mostRecognizedEmployeeId?: string;
  mostActiveSenderEmployeeId?: string;
}

export class RecognitionEngine {
  /**
   * Synthesize recognition activities across the workforce.
   */
  static analyzeRecognitions(recognitions: RecognitionRecord[]): RecognitionAnalyticsResult {
    if (recognitions.length === 0) {
      return {
        totalRecognitionsCount: 0,
        totalPointsDistributed: 0,
        peerToManagerRatio: 0,
        topValueCategory: "N/A",
        categoryDistribution: {}
      };
    }

    let totalPoints = 0;
    let peerCount = 0;
    let managerCount = 0;

    const categoryCounts: Record<string, number> = {};
    const receiverCounts: Record<string, number> = {};
    const senderCounts: Record<string, number> = {};

    for (const r of recognitions) {
      totalPoints += r.pointsAwarded;

      if (r.recognitionType === "PEER_APPRECIATION") peerCount++;
      else managerCount++;

      const category = r.badgeCategory || "CORE_VALUES";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      receiverCounts[r.receiverEmployeeId] = (receiverCounts[r.receiverEmployeeId] || 0) + 1;
      senderCounts[r.senderEmployeeId] = (senderCounts[r.senderEmployeeId] || 0) + 1;
    }

    const peerToManagerRatio =
      managerCount > 0
        ? Math.round((peerCount / managerCount) * 100) / 100
        : peerCount;

    let topCategory = "CORE_VALUES";
    let maxCategoryCount = -1;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCategoryCount) {
        maxCategoryCount = count;
        topCategory = cat;
      }
    }

    const getTopId = (map: Record<string, number>) => {
      let topId: string | undefined;
      let max = -1;
      for (const [id, count] of Object.entries(map)) {
        if (count > max) {
          max = count;
          topId = id;
        }
      }
      return topId;
    };

    return {
      totalRecognitionsCount: recognitions.length,
      totalPointsDistributed: totalPoints,
      peerToManagerRatio,
      topValueCategory: topCategory,
      categoryDistribution: categoryCounts,
      mostRecognizedEmployeeId: getTopId(receiverCounts),
      mostActiveSenderEmployeeId: getTopId(senderCounts)
    };
  }
}
