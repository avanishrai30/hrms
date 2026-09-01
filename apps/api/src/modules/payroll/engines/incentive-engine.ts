/**
 * TASK 30 — SALES COMMISSION & KPI INCENTIVE ENGINE
 * Computes tiered commission and KPI achievement bonuses based on performance thresholds.
 */

export interface IncentiveTierRule {
  minAchievementPercent: number; // e.g. 80%
  maxAchievementPercent: number; // e.g. 100%
  payoutRateMultiplier: number; // e.g. 1.0x or 5% of base sales volume
}

export interface IncentiveCalculationInput {
  targetAmount: number;
  achievedAmount: number;
  baseIncentivePool: number;
  tiers?: IncentiveTierRule[];
}

export interface IncentiveCalculationResult {
  targetAmount: number;
  achievedAmount: number;
  achievementPercent: number;
  appliedMultiplier: number;
  totalIncentivePayout: number;
}

export class IncentiveEngine {
  static readonly DEFAULT_TIERS: IncentiveTierRule[] = [
    { minAchievementPercent: 0, maxAchievementPercent: 79.99, payoutRateMultiplier: 0.0 },
    { minAchievementPercent: 80, maxAchievementPercent: 99.99, payoutRateMultiplier: 0.8 },
    { minAchievementPercent: 100, maxAchievementPercent: 120, payoutRateMultiplier: 1.0 },
    { minAchievementPercent: 120.01, maxAchievementPercent: 9999, payoutRateMultiplier: 1.25 }
  ];

  /**
   * Calculate incentive payout according to performance tier thresholds.
   */
  static calculateIncentive(input: IncentiveCalculationInput): IncentiveCalculationResult {
    const achievementPercent =
      input.targetAmount > 0
        ? Math.round((input.achievedAmount / input.targetAmount) * 1000) / 10
        : 0;

    const tiers = input.tiers ?? this.DEFAULT_TIERS;
    let appliedMultiplier = 0.0;

    for (const tier of tiers) {
      if (
        achievementPercent >= tier.minAchievementPercent &&
        achievementPercent <= tier.maxAchievementPercent
      ) {
        appliedMultiplier = tier.payoutRateMultiplier;
        break;
      }
    }

    const totalIncentivePayout = Math.round(input.baseIncentivePool * appliedMultiplier);

    return {
      targetAmount: input.targetAmount,
      achievedAmount: input.achievedAmount,
      achievementPercent,
      appliedMultiplier,
      totalIncentivePayout
    };
  }
}
