import { AttendanceStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  AttendanceRulesEngine,
  DEFAULT_ATTENDANCE_RULES,
  type ShiftDefinition
} from "./attendance-rules.engine.js";

describe("attendance rules engine", () => {
  const standardShift: ShiftDefinition = {
    id: "shift-001",
    name: "General Shift",
    code: "GEN_09_18",
    startsAtMinute: 9 * 60,  // 09:00 (540 min)
    endsAtMinute: 18 * 60,   // 18:00 (1080 min)
    timezone: "Asia/Kolkata"
  };

  const testDate = new Date(Date.UTC(2026, 7, 31)); // 2026-08-31

  it("calculates expected shift boundaries correctly", () => {
    const boundaries = AttendanceRulesEngine.getShiftBoundaries(testDate, standardShift);
    expect(boundaries.expectedStart.toISOString()).toBe("2026-08-31T09:00:00.000Z");
    expect(boundaries.expectedEnd.toISOString()).toBe("2026-08-31T18:00:00.000Z");
  });

  it("handles overnight shifts crossing midnight", () => {
    const nightShift: ShiftDefinition = {
      id: "shift-002",
      name: "Night Shift",
      code: "NIGHT_22_06",
      startsAtMinute: 22 * 60, // 22:00
      endsAtMinute: 6 * 60,    // 06:00
      timezone: "Asia/Kolkata"
    };

    const boundaries = AttendanceRulesEngine.getShiftBoundaries(testDate, nightShift);
    expect(boundaries.expectedStart.toISOString()).toBe("2026-08-31T22:00:00.000Z");
    expect(boundaries.expectedEnd.toISOString()).toBe("2026-09-01T06:00:00.000Z");
  });

  it("calculates zero late minutes when checking in within grace period", () => {
    const { expectedStart } = AttendanceRulesEngine.getShiftBoundaries(testDate, standardShift);
    // Checked in at 09:08 (grace period is 10 mins)
    const checkInAt = new Date(expectedStart.getTime() + 8 * 60 * 1000);
    const late = AttendanceRulesEngine.calculateLateMinutes(checkInAt, expectedStart, 10);
    expect(late).toBe(0);
  });

  it("calculates accurate late minutes when checking in after grace period", () => {
    const { expectedStart } = AttendanceRulesEngine.getShiftBoundaries(testDate, standardShift);
    // Checked in at 09:35 (35 mins after start, grace period 10 mins)
    const checkInAt = new Date(expectedStart.getTime() + 35 * 60 * 1000);
    const late = AttendanceRulesEngine.calculateLateMinutes(checkInAt, expectedStart, 10);
    expect(late).toBe(35);
  });

  it("calculates early departure minutes when checking out before shift end", () => {
    const { expectedEnd } = AttendanceRulesEngine.getShiftBoundaries(testDate, standardShift);
    // Checked out at 17:15 (45 mins early)
    const checkOutAt = new Date(expectedEnd.getTime() - 45 * 60 * 1000);
    const early = AttendanceRulesEngine.calculateEarlyDepartureMinutes(checkOutAt, expectedEnd);
    expect(early).toBe(45);
  });

  it("calculates zero early departure when checking out on or after shift end", () => {
    const { expectedEnd } = AttendanceRulesEngine.getShiftBoundaries(testDate, standardShift);
    const checkOutAt = new Date(expectedEnd.getTime() + 15 * 60 * 1000);
    const early = AttendanceRulesEngine.calculateEarlyDepartureMinutes(checkOutAt, expectedEnd);
    expect(early).toBe(0);
  });

  it("calculates worked minutes and overtime minutes accurately", () => {
    const checkInAt = new Date("2026-08-31T09:00:00.000Z");
    const checkOutAt = new Date("2026-08-31T18:30:00.000Z"); // 9.5 hours = 570 mins

    const worked = AttendanceRulesEngine.calculateWorkedMinutes(checkInAt, checkOutAt);
    expect(worked).toBe(570);

    const overtime = AttendanceRulesEngine.calculateOvertimeMinutes(worked, DEFAULT_ATTENDANCE_RULES.overtimeThresholdMinutes);
    expect(overtime).toBe(90); // 570 - 480
  });

  it("evaluates status as PRESENT for full day work on time", () => {
    const status = AttendanceRulesEngine.evaluateStatus({
      checkInAt: new Date("2026-08-31T09:00:00.000Z"),
      checkOutAt: new Date("2026-08-31T18:00:00.000Z"),
      lateMinutes: 0,
      workedMinutes: 540,
      rules: DEFAULT_ATTENDANCE_RULES
    });
    expect(status).toBe(AttendanceStatus.PRESENT);
  });

  it("evaluates status as LATE when late arrival exceeds threshold", () => {
    const status = AttendanceRulesEngine.evaluateStatus({
      checkInAt: new Date("2026-08-31T09:40:00.000Z"),
      checkOutAt: new Date("2026-08-31T18:00:00.000Z"),
      lateMinutes: 40,
      workedMinutes: 500,
      rules: DEFAULT_ATTENDANCE_RULES
    });
    expect(status).toBe(AttendanceStatus.LATE);
  });

  it("evaluates status as HALF_DAY when worked minutes is between half-day and full-day threshold", () => {
    const status = AttendanceRulesEngine.evaluateStatus({
      checkInAt: new Date("2026-08-31T09:00:00.000Z"),
      checkOutAt: new Date("2026-08-31T14:00:00.000Z"),
      lateMinutes: 0,
      workedMinutes: 300, // 5 hours (>= 240, < 480)
      rules: DEFAULT_ATTENDANCE_RULES
    });
    expect(status).toBe(AttendanceStatus.HALF_DAY);
  });

  it("detects week-off correctly based on work calendar days", () => {
    // 2026-08-30 is a Sunday (day 0)
    const sunday = new Date("2026-08-30T00:00:00.000Z");
    // 2026-08-31 is a Monday (day 1)
    const monday = new Date("2026-08-31T00:00:00.000Z");

    const workingDays = [1, 2, 3, 4, 5]; // Mon-Fri
    expect(AttendanceRulesEngine.isWeekOff(sunday, workingDays)).toBe(true);
    expect(AttendanceRulesEngine.isWeekOff(monday, workingDays)).toBe(false);
  });

  it("detects holidays correctly based on holiday calendar", () => {
    const holidayDate = new Date("2026-08-15T00:00:00.000Z");
    const regularDate = new Date("2026-08-16T00:00:00.000Z");

    const holidays = [
      { date: "2026-08-15", name: "Independence Day" },
      { date: "2026-10-02", name: "Gandhi Jayanti" }
    ];

    const result1 = AttendanceRulesEngine.isHoliday(holidayDate, holidays);
    expect(result1.isHoliday).toBe(true);
    expect(result1.name).toBe("Independence Day");

    const result2 = AttendanceRulesEngine.isHoliday(regularDate, holidays);
    expect(result2.isHoliday).toBe(false);
  });
});
