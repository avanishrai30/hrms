import { describe, expect, it } from "vitest";
import {
  distributePayslipsSchema,
  distributionFilterSchema,
  generateEmployeePayslipSchema,
  generateRunPayslipsSchema,
  payslipFilterSchema
} from "./payslips.schemas.js";

describe("Payslips Schemas", () => {
  it("validates generateRunPayslipsSchema", () => {
    const valid = generateRunPayslipsSchema.safeParse({
      payrollRunId: "a0000000-0000-0000-0000-000000000001"
    });
    expect(valid.success).toBe(true);

    const invalid = generateRunPayslipsSchema.safeParse({
      payrollRunId: "invalid-uuid"
    });
    expect(invalid.success).toBe(false);
  });

  it("validates generateEmployeePayslipSchema", () => {
    const valid = generateEmployeePayslipSchema.safeParse({
      payrollRunEmployeeId: "a0000000-0000-0000-0000-000000000002"
    });
    expect(valid.success).toBe(true);
  });

  it("validates distributePayslipsSchema", () => {
    const valid = distributePayslipsSchema.safeParse({
      payslipIds: ["a0000000-0000-0000-0000-000000000003"],
      channel: "EMAIL"
    });
    expect(valid.success).toBe(true);

    const empty = distributePayslipsSchema.safeParse({
      payslipIds: []
    });
    expect(empty.success).toBe(false);
  });

  it("validates payslipFilterSchema", () => {
    const valid = payslipFilterSchema.safeParse({
      month: "8",
      year: "2026",
      status: "GENERATED",
      page: "1",
      limit: "25"
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.month).toBe(8);
      expect(valid.data.year).toBe(2026);
      expect(valid.data.limit).toBe(25);
    }
  });

  it("validates distributionFilterSchema", () => {
    const valid = distributionFilterSchema.safeParse({
      status: "DELIVERED",
      page: "2",
      limit: "10"
    });
    expect(valid.success).toBe(true);
  });
});
