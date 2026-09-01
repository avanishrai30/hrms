import { describe, expect, it } from "vitest";
import { LeaveAccrualEngine } from "./leave-accrual.engine.js";

describe("LeaveAccrualEngine", () => {
  describe("calculateCarryForward", () => {
    it("caps carry forward at maxCarryForwardDays", () => {
      const policy = { maxCarryForwardDays: 5, carryForwardExpiryMonths: 12 };
      const result = LeaveAccrualEngine.calculateCarryForward(8.5, policy);

      expect(result.carriedForwardDays).toBe(5);
      expect(result.lapsedDays).toBe(3.5);
    });

    it("allows full balance when within maxCarryForwardDays limit", () => {
      const policy = { maxCarryForwardDays: 10, carryForwardExpiryMonths: 12 };
      const result = LeaveAccrualEngine.calculateCarryForward(4, policy);

      expect(result.carriedForwardDays).toBe(4);
      expect(result.lapsedDays).toBe(0);
    });

    it("allows unlimited carry forward when maxCarryForwardDays is -1", () => {
      const policy = { maxCarryForwardDays: -1, carryForwardExpiryMonths: 24 };
      const result = LeaveAccrualEngine.calculateCarryForward(18.5, policy);

      expect(result.carriedForwardDays).toBe(18.5);
      expect(result.lapsedDays).toBe(0);
    });

    it("allows zero carry forward when maxCarryForwardDays is 0", () => {
      const policy = { maxCarryForwardDays: 0, carryForwardExpiryMonths: 12 };
      const result = LeaveAccrualEngine.calculateCarryForward(12, policy);

      expect(result.carriedForwardDays).toBe(0);
      expect(result.lapsedDays).toBe(12);
    });
  });

  describe("calculateAccrualIncrement", () => {
    it("calculates monthly accrual step", () => {
      const increment = LeaveAccrualEngine.calculateAccrualIncrement(18, "MONTHLY");
      expect(increment).toBe(1.5);
    });

    it("calculates quarterly accrual step", () => {
      const increment = LeaveAccrualEngine.calculateAccrualIncrement(12, "QUARTERLY");
      expect(increment).toBe(3);
    });

    it("calculates yearly allocation", () => {
      const increment = LeaveAccrualEngine.calculateAccrualIncrement(24, "YEARLY");
      expect(increment).toBe(24);
    });
  });
});
