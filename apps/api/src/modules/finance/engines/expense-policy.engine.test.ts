import { describe, expect, it } from "vitest";
import { ExpensePolicyEngine } from "./expense-policy.engine.js";

describe("ExpensePolicyEngine", () => {
  it("raises hard policy violations for over-limit claims", () => {
    const result = new ExpensePolicyEngine().validateClaim(
      {
        employeeId: "00000000-0000-0000-0000-000000000001",
        title: "Hotel stay",
        currency: "INR",
        items: [
          {
            category: "HOTEL",
            description: "One night stay",
            amount: 7000,
            taxAmount: 0,
            currency: "INR",
            expenseDate: new Date("2026-09-01"),
            receipts: []
          }
        ]
      },
      [
        {
          id: "policy-1",
          tenantId: "tenant-1",
          name: "Hotel cap",
          category: "HOTEL",
          maxAmountPerItem: 5000,
          maxAmountPerDay: null,
          maxAmountPerMonth: null,
          mileageRatePerKm: null,
          perDiemRate: null,
          allowedTravelClass: [],
          hardLimit: true,
          autoReject: false,
          warningThreshold: null,
          requiresPreApproval: false,
          isActive: true,
          currency: "INR",
          metadataJson: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    );

    expect(result.outcome).toBe("FAIL");
    expect(result.violations).toEqual([
      expect.objectContaining({ severity: "HARD_LIMIT", category: "HOTEL", ruleType: "HARD_LIMIT" })
    ]);
  });
});
