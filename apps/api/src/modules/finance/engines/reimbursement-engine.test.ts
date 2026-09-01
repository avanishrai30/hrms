import { describe, expect, it } from "vitest";
import { ReimbursementEngine } from "./reimbursement-engine.js";

describe("ReimbursementEngine", () => {
  it("adjusts advances before calculating pending reimbursement", () => {
    const ledger = new ReimbursementEngine().calculate({
      sourceType: "TRAVEL",
      sourceId: "travel-1",
      employeeId: "employee-1",
      currency: "INR",
      requestedAmount: 10000,
      approvedAmount: 9000,
      advanceAmount: 3000
    });

    expect(ledger.advanceAdjusted).toBe(3000);
    expect(ledger.amountPaid).toBe(6000);
    expect(ledger.balancePending).toBe(0);
    expect(ledger.recoveryAmount).toBe(0);
  });
});
