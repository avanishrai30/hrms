import { describe, expect, it } from "vitest";
import {
  addPayrollAdjustmentSchema,
  approvePayrollRunSchema,
  createPayrollRunSchema,
  lockPayrollRunSchema
} from "./payroll.schemas.js";

describe("Payroll Schemas", () => {
  it("validates valid payroll run creation", () => {
    const valid = { month: 4, year: 2026, notes: "April 2026 Monthly Payroll" };
    const parsed = createPayrollRunSchema.parse(valid);
    expect(parsed.month).toBe(4);
    expect(parsed.year).toBe(2026);
  });

  it("rejects invalid month numbers", () => {
    expect(() => createPayrollRunSchema.parse({ month: 13, year: 2026 })).toThrow();
    expect(() => createPayrollRunSchema.parse({ month: 0, year: 2026 })).toThrow();
  });

  it("validates payroll adjustments", () => {
    const valid = {
      payrollRunEmployeeId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      type: "BONUS",
      title: "Festive Bonus",
      amount: 2500,
      reason: "Diwali festival disbursement"
    };
    const parsed = addPayrollAdjustmentSchema.parse(valid);
    expect(parsed.amount).toBe(2500);
  });

  it("rejects zero amount adjustments", () => {
    expect(() =>
      addPayrollAdjustmentSchema.parse({
        payrollRunEmployeeId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        type: "BONUS",
        title: "Zero",
        amount: 0,
        reason: "Test"
      })
    ).toThrow();
  });

  it("validates approval and locking payloads", () => {
    expect(approvePayrollRunSchema.parse({ note: "Approved by HR" }).note).toBe("Approved by HR");
    expect(lockPayrollRunSchema.parse({ note: "Locked by Tenant Admin" }).note).toBe("Locked by Tenant Admin");
  });
});
