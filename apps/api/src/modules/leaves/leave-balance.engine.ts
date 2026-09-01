export interface BalanceRecord {
  allocatedDays: number;
  accruedDays: number;
  carriedForwardDays: number;
  usedDays: number;
  pendingDays: number;
  expiredDays: number;
  manualAdjustedDays: number;
}

export interface PolicyRules {
  allowNegativeBalance: boolean;
  maxNegativeBalanceDays: number;
  maxConsecutiveDays: number;
}

export class LeaveBalanceEngine {
  /**
   * Calculates the real-time available leave days.
   */
  static calculateAvailableDays(balance: BalanceRecord): number {
    const totalCredits =
      (balance.allocatedDays || 0) +
      (balance.accruedDays || 0) +
      (balance.carriedForwardDays || 0) +
      (balance.manualAdjustedDays || 0);

    const totalDebits =
      (balance.usedDays || 0) +
      (balance.pendingDays || 0) +
      (balance.expiredDays || 0);

    const available = totalCredits - totalDebits;
    return Math.round(available * 100) / 100;
  }

  /**
   * Validates if a requested leave duration can be accommodated by the balance & policy.
   */
  static validateRequest(
    balance: BalanceRecord,
    policy: PolicyRules,
    requestedDays: number
  ): { valid: boolean; availableDays: number; deficit: number; reason?: string } {
    if (requestedDays <= 0) {
      return { valid: false, availableDays: 0, deficit: 0, reason: "Requested days must be greater than zero." };
    }

    if (requestedDays > policy.maxConsecutiveDays) {
      return {
        valid: false,
        availableDays: 0,
        deficit: 0,
        reason: `Requested duration (${requestedDays} days) exceeds policy max consecutive days (${policy.maxConsecutiveDays} days).`
      };
    }

    const available = this.calculateAvailableDays(balance);
    const balanceAfter = available - requestedDays;

    if (balanceAfter < 0) {
      if (!policy.allowNegativeBalance) {
        return {
          valid: false,
          availableDays: available,
          deficit: Math.abs(balanceAfter),
          reason: `Insufficient leave balance. Available: ${available} days, Requested: ${requestedDays} days.`
        };
      }

      if (Math.abs(balanceAfter) > policy.maxNegativeBalanceDays) {
        return {
          valid: false,
          availableDays: available,
          deficit: Math.abs(balanceAfter) - policy.maxNegativeBalanceDays,
          reason: `Requested leave exceeds allowed negative balance threshold (Max negative allowed: -${policy.maxNegativeBalanceDays} days).`
        };
      }
    }

    return {
      valid: true,
      availableDays: available,
      deficit: 0
    };
  }
}
