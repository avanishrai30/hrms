import { describe, expect, it } from "vitest";
import { LeaveBalanceEngine } from "./leave-balance.engine.js";

describe("LeaveBalanceEngine", () => {
  it("calculates real-time available leave days accurately", () => {
    const balance = {
      allocatedDays: 12,
      accruedDays: 2,
      carriedForwardDays: 3,
      manualAdjustedDays: 1,
      usedDays: 4,
      pendingDays: 2,
      expiredDays: 0
    };

    // Total Credits = 12 + 2 + 3 + 1 = 18
    // Total Debits = 4 + 2 + 0 = 6
    // Available = 18 - 6 = 12
    const available = LeaveBalanceEngine.calculateAvailableDays(balance);
    expect(available).toBe(12);
  });

  it("validates request within available balance", () => {
    const balance = {
      allocatedDays: 10,
      accruedDays: 0,
      carriedForwardDays: 0,
      manualAdjustedDays: 0,
      usedDays: 2,
      pendingDays: 1,
      expiredDays: 0
    }; // Available = 7

    const policy = {
      allowNegativeBalance: false,
      maxNegativeBalanceDays: 0,
      maxConsecutiveDays: 10
    };

    const result = LeaveBalanceEngine.validateRequest(balance, policy, 5);
    expect(result.valid).toBe(true);
    expect(result.availableDays).toBe(7);
  });

  it("rejects request exceeding available balance when negative balance is disabled", () => {
    const balance = {
      allocatedDays: 5,
      accruedDays: 0,
      carriedForwardDays: 0,
      manualAdjustedDays: 0,
      usedDays: 3,
      pendingDays: 0,
      expiredDays: 0
    }; // Available = 2

    const policy = {
      allowNegativeBalance: false,
      maxNegativeBalanceDays: 0,
      maxConsecutiveDays: 10
    };

    const result = LeaveBalanceEngine.validateRequest(balance, policy, 4);
    expect(result.valid).toBe(false);
    expect(result.deficit).toBe(2);
    expect(result.reason).toContain("Insufficient leave balance");
  });

  it("allows negative balance up to policy limit", () => {
    const balance = {
      allocatedDays: 2,
      accruedDays: 0,
      carriedForwardDays: 0,
      manualAdjustedDays: 0,
      usedDays: 1,
      pendingDays: 0,
      expiredDays: 0
    }; // Available = 1

    const policy = {
      allowNegativeBalance: true,
      maxNegativeBalanceDays: 3,
      maxConsecutiveDays: 10
    };

    // Request 3 days -> Balance after = 1 - 3 = -2 (within -3 limit)
    const result = LeaveBalanceEngine.validateRequest(balance, policy, 3);
    expect(result.valid).toBe(true);

    // Request 5 days -> Balance after = 1 - 5 = -4 (exceeds -3 limit)
    const resultOver = LeaveBalanceEngine.validateRequest(balance, policy, 5);
    expect(resultOver.valid).toBe(false);
    expect(resultOver.reason).toContain("exceeds allowed negative balance threshold");
  });

  it("rejects request exceeding max consecutive days rule", () => {
    const balance = {
      allocatedDays: 30,
      accruedDays: 0,
      carriedForwardDays: 0,
      manualAdjustedDays: 0,
      usedDays: 0,
      pendingDays: 0,
      expiredDays: 0
    };

    const policy = {
      allowNegativeBalance: false,
      maxNegativeBalanceDays: 0,
      maxConsecutiveDays: 5
    };

    const result = LeaveBalanceEngine.validateRequest(balance, policy, 8);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("exceeds policy max consecutive days");
  });
});
