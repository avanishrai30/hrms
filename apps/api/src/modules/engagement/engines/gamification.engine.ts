/**
 * TASK 31 — GAMIFICATION & BADGE ASSIGNMENT ENGINE
 * Calculates employee experience levels, achievement tiers, badge qualification, and leaderboard rankings.
 */

export interface EmployeeGamificationProfile {
  employeeId: string;
  totalPointsEarnedLifetime: number;
  recognitionsReceivedCount: number;
  recognitionsGivenCount: number;
  surveysCompletedCount: number;
  suggestionsAcceptedCount: number;
  challengesWonCount: number;
}

export interface GamificationRankResult {
  employeeId: string;
  level: number;
  levelTitle: string;
  nextLevelPointsThreshold: number;
  progressPercentToNextLevel: number;
  unlockedBadgeCodes: string[];
}

export class GamificationEngine {
  /**
   * Determine employee level and unlocked achievement badges.
   */
  static evaluateProfile(profile: EmployeeGamificationProfile): GamificationRankResult {
    const pts = profile.totalPointsEarnedLifetime;

    let level = 1;
    let levelTitle = "Culture Explorer";
    let nextThreshold = 500;
    let baseThreshold = 0;

    if (pts >= 10000) {
      level = 5;
      levelTitle = "Culture Icon & Pillar";
      nextThreshold = 25000;
      baseThreshold = 10000;
    } else if (pts >= 5000) {
      level = 4;
      levelTitle = "Culture Champion";
      nextThreshold = 10000;
      baseThreshold = 5000;
    } else if (pts >= 2000) {
      level = 3;
      levelTitle = "Values Ambassador";
      nextThreshold = 5000;
      baseThreshold = 2000;
    } else if (pts >= 500) {
      level = 2;
      levelTitle = "Active Contributor";
      nextThreshold = 2000;
      baseThreshold = 500;
    }

    const range = nextThreshold - baseThreshold;
    const progressInLevel = Math.max(0, pts - baseThreshold);
    const progressPercentToNextLevel =
      range > 0 ? Math.min(100, Math.round((progressInLevel / range) * 1000) / 10) : 100;

    const unlockedBadgeCodes: string[] = [];

    if (profile.recognitionsGivenCount >= 10) unlockedBadgeCodes.push("KUDOS_GIVER_GOLD");
    if (profile.recognitionsReceivedCount >= 15) unlockedBadgeCodes.push("TEAM_FAVORITE_STAR");
    if (profile.surveysCompletedCount >= 5) unlockedBadgeCodes.push("VOICE_OF_CULTURE");
    if (profile.suggestionsAcceptedCount >= 1) unlockedBadgeCodes.push("INNOVATION_SPARK");
    if (profile.challengesWonCount >= 1) unlockedBadgeCodes.push("CHALLENGE_CHAMPION");

    return {
      employeeId: profile.employeeId,
      level,
      levelTitle,
      nextLevelPointsThreshold: nextThreshold,
      progressPercentToNextLevel,
      unlockedBadgeCodes
    };
  }
}
