export interface CarryForwardPolicy {
  maxCarryForwardDays: number; // 0 = none, -1 = unlimited
  carryForwardExpiryMonths: number;
}

export class LeaveAccrualEngine {
  /**
   * Calculates carry forward days allowed from remaining available balance of the previous year.
   */
  static calculateCarryForward(
    previousYearAvailable: number,
    policy: CarryForwardPolicy
  ): { carriedForwardDays: number; lapsedDays: number } {
    if (previousYearAvailable <= 0 || policy.maxCarryForwardDays === 0) {
      return { carriedForwardDays: 0, lapsedDays: Math.max(0, previousYearAvailable) };
    }

    if (policy.maxCarryForwardDays === -1) {
      // Unlimited carry forward
      return { carriedForwardDays: previousYearAvailable, lapsedDays: 0 };
    }

    const carried = Math.min(previousYearAvailable, policy.maxCarryForwardDays);
    const lapsed = Math.max(0, previousYearAvailable - carried);

    return {
      carriedForwardDays: Math.round(carried * 100) / 100,
      lapsedDays: Math.round(lapsed * 100) / 100
    };
  }

  /**
   * Calculates periodic accrual increment based on policy frequency.
   */
  static calculateAccrualIncrement(
    annualAllocation: number,
    frequency: "MONTHLY" | "QUARTERLY" | "YEARLY" | "MANUAL"
  ): number {
    if (frequency === "MONTHLY") {
      return Math.round((annualAllocation / 12) * 100) / 100;
    }
    if (frequency === "QUARTERLY") {
      return Math.round((annualAllocation / 4) * 100) / 100;
    }
    if (frequency === "YEARLY") {
      return annualAllocation;
    }
    return 0;
  }
}
