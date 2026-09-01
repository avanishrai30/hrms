import { describe, expect, it } from "vitest";
import {
  createHolidaySchema,
  createLeaveRequestSchema,
  createLeaveTypeSchema,
  updateLeavePolicySchema
} from "./leaves.schemas.js";

describe("Leave Zod Schemas", () => {
  it("validates valid createLeaveType payload", () => {
    const valid = {
      name: "Earned Leave",
      code: "EL",
      category: "EARNED",
      color: "#10B981",
      isPaid: true
    };
    const parsed = createLeaveTypeSchema.parse(valid);
    expect(parsed.name).toBe("Earned Leave");
    expect(parsed.code).toBe("EL");
  });

  it("rejects invalid leave type color format", () => {
    const invalid = {
      name: "Casual Leave",
      code: "CL",
      category: "CASUAL",
      color: "blue"
    };
    expect(() => createLeaveTypeSchema.parse(invalid)).toThrow();
  });

  it("validates createLeaveRequest payload", () => {
    const valid = {
      leaveTypeId: "123e4567-e89b-12d3-a456-426614174000",
      startDate: "2026-10-01",
      endDate: "2026-10-03",
      reason: "Family wedding"
    };
    const parsed = createLeaveRequestSchema.parse(valid);
    expect(parsed.startDate).toBe("2026-10-01");
    expect(parsed.endDate).toBe("2026-10-03");
  });

  it("validates updateLeavePolicy with sandwich policy", () => {
    const valid = {
      leaveTypeId: "123e4567-e89b-12d3-a456-426614174000",
      annualAllocationDays: 15,
      accrualFrequency: "MONTHLY",
      accrualDaysPerPeriod: 1.25,
      sandwichPolicy: "WEEKENDS_AND_HOLIDAYS"
    };
    const parsed = updateLeavePolicySchema.parse(valid);
    expect(parsed.sandwichPolicy).toBe("WEEKENDS_AND_HOLIDAYS");
  });

  it("validates holiday payload", () => {
    const valid = {
      name: "Independence Day",
      date: "2026-08-15",
      isOptional: false
    };
    const parsed = createHolidaySchema.parse(valid);
    expect(parsed.name).toBe("Independence Day");
  });
});
