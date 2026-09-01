/**
 * TASK 31 — REWARDS WALLET & REDEMPTION ENGINE
 * Validates reward point accruals, wallet balances, redemption eligibility, and stock availability.
 */

export interface WalletTransactionInput {
  currentBalance: number;
  points: number;
  type: "POINTS_EARNED" | "POINTS_REDEEMED" | "POINTS_EXPIRED" | "POINTS_ADJUSTED";
}

export interface RedemptionValidationInput {
  employeeCurrentBalance: number;
  itemPointsCost: number;
  itemStockQuantity: number;
  isItemActive: boolean;
}

export interface RedemptionValidationResult {
  isValid: boolean;
  errorMessage?: string;
  newBalanceAfterRedemption: number;
}

export class RewardEngine {
  /**
   * Compute new wallet balance after a transaction.
   */
  static applyTransaction(input: WalletTransactionInput): { newBalance: number } {
    let newBalance = input.currentBalance;

    if (input.type === "POINTS_EARNED" || input.type === "POINTS_ADJUSTED") {
      newBalance += input.points;
    } else if (input.type === "POINTS_REDEEMED" || input.type === "POINTS_EXPIRED") {
      newBalance = Math.max(0, newBalance - input.points);
    }

    return { newBalance };
  }

  /**
   * Validate if an employee is eligible to redeem a catalog reward item.
   */
  static validateRedemption(input: RedemptionValidationInput): RedemptionValidationResult {
    if (!input.isItemActive) {
      return {
        isValid: false,
        errorMessage: "Reward item is currently inactive in the catalog.",
        newBalanceAfterRedemption: input.employeeCurrentBalance
      };
    }

    if (input.itemStockQuantity <= 0) {
      return {
        isValid: false,
        errorMessage: "Reward item is currently out of stock.",
        newBalanceAfterRedemption: input.employeeCurrentBalance
      };
    }

    if (input.employeeCurrentBalance < input.itemPointsCost) {
      return {
        isValid: false,
        errorMessage: `Insufficient reward points. You have ${input.employeeCurrentBalance} points, but item requires ${input.itemPointsCost} points.`,
        newBalanceAfterRedemption: input.employeeCurrentBalance
      };
    }

    return {
      isValid: true,
      newBalanceAfterRedemption: input.employeeCurrentBalance - input.itemPointsCost
    };
  }
}
