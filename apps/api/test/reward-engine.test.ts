import { describe, expect, it } from "vitest";
import { RewardEngine } from "../src/modules/engagement/engines/reward.engine.js";

describe("RewardEngine", () => {
  it("accrues points and computes new wallet balance accurately", () => {
    const res1 = RewardEngine.applyTransaction({
      currentBalance: 500,
      points: 150,
      type: "POINTS_EARNED"
    });
    expect(res1.newBalance).toBe(650);

    const res2 = RewardEngine.applyTransaction({
      currentBalance: 650,
      points: 200,
      type: "POINTS_REDEEMED"
    });
    expect(res2.newBalance).toBe(450);
  });

  it("validates successful reward redemption against sufficient points and active stock", () => {
    const valid = RewardEngine.validateRedemption({
      employeeCurrentBalance: 1500,
      itemPointsCost: 1000,
      itemStockQuantity: 10,
      isItemActive: true
    });

    expect(valid.isValid).toBe(true);
    expect(valid.newBalanceAfterRedemption).toBe(500);
  });

  it("rejects redemption if points balance is insufficient", () => {
    const invalid = RewardEngine.validateRedemption({
      employeeCurrentBalance: 400,
      itemPointsCost: 1000,
      itemStockQuantity: 10,
      isItemActive: true
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errorMessage).toContain("Insufficient reward points");
    expect(invalid.newBalanceAfterRedemption).toBe(400);
  });

  it("rejects redemption if item is out of stock", () => {
    const invalid = RewardEngine.validateRedemption({
      employeeCurrentBalance: 2000,
      itemPointsCost: 1000,
      itemStockQuantity: 0,
      isItemActive: true
    });

    expect(invalid.isValid).toBe(false);
    expect(invalid.errorMessage).toContain("out of stock");
  });
});
