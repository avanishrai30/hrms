import { describe, expect, it } from "vitest";
import {
  attendanceFilterSchema,
  attendanceRuleSchema,
  checkInSchema,
  checkOutSchema,
  createCorrectionSchema,
  manualAttendanceSchema,
  reviewCorrectionSchema,
  updateAttendanceSchema
} from "./attendance.schemas.js";

describe("attendance validation schemas", () => {
  it("validates check-in payload with defaults and optional device metadata", () => {
    const valid = checkInSchema.safeParse({ notes: "Early arrival", deviceMetadata: { browser: "Chrome" } });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.source).toBe("WEB");
    }

    const empty = checkInSchema.safeParse({});
    expect(empty.success).toBe(true);
  });

  it("validates check-out payload", () => {
    const valid = checkOutSchema.safeParse({ notes: "Completed daily tasks" });
    expect(valid.success).toBe(true);
  });

  it("validates manual attendance payload requiring 8-char reason and valid UUIDs", () => {
    const valid = manualAttendanceSchema.safeParse({
      employeeId: "11111111-1111-1111-1111-111111111111",
      date: "2026-08-31T00:00:00.000Z",
      status: "PRESENT",
      checkInAt: "2026-08-31T09:00:00.000Z",
      checkOutAt: "2026-08-31T18:00:00.000Z",
      reason: "Manual entry approved by HR"
    });
    expect(valid.success).toBe(true);

    const invalidShortReason = manualAttendanceSchema.safeParse({
      employeeId: "11111111-1111-1111-1111-111111111111",
      date: "2026-08-31",
      reason: "short"
    });
    expect(invalidShortReason.success).toBe(false);
  });

  it("validates update attendance payload", () => {
    const valid = updateAttendanceSchema.safeParse({
      status: "HALF_DAY",
      reason: "Left early for doctor appointment"
    });
    expect(valid.success).toBe(true);

    const invalid = updateAttendanceSchema.safeParse({
      status: "INVALID_STATUS",
      reason: "Valid reason text"
    });
    expect(invalid.success).toBe(false);
  });

  it("validates correction request payload", () => {
    const valid = createCorrectionSchema.safeParse({
      attendanceId: "22222222-2222-2222-2222-222222222222",
      reason: "Forgot to check out before leaving office",
      requestedChange: {
        date: "2026-08-31",
        checkOutAt: "2026-08-31T18:00:00.000Z",
        status: "PRESENT"
      }
    });
    expect(valid.success).toBe(true);

    const missingReason = createCorrectionSchema.safeParse({
      reason: "short",
      requestedChange: { date: "2026-08-31" }
    });
    expect(missingReason.success).toBe(false);
  });

  it("validates correction review payload", () => {
    const approve = reviewCorrectionSchema.safeParse({
      status: "APPROVED",
      reviewNote: "Verified with manager"
    });
    expect(approve.success).toBe(true);

    const reject = reviewCorrectionSchema.safeParse({
      status: "REJECTED",
      reviewNote: "No records found"
    });
    expect(reject.success).toBe(true);

    const invalidStatus = reviewCorrectionSchema.safeParse({
      status: "PENDING",
      reviewNote: "Invalid review status"
    });
    expect(invalidStatus.success).toBe(false);
  });

  it("validates attendance filter query parameters with pagination defaults", () => {
    const parsed = attendanceFilterSchema.parse({
      status: "PRESENT",
      isManual: "true"
    });
    expect(parsed.status).toBe("PRESENT");
    expect(parsed.isManual).toBe(true);
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(50);
  });

  it("validates attendance rules configuration payload", () => {
    const valid = attendanceRuleSchema.safeParse({
      lateThresholdMinutes: 20,
      gracePeriodMinutes: 15,
      allowSelfCheckIn: true
    });
    expect(valid.success).toBe(true);
  });
});
