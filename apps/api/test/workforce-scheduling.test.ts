import { describe, expect, it } from "vitest";
import { SchedulingEngine } from "../src/modules/workforce-operations/engines/scheduling-engine.js";
import { ShiftEngine } from "../src/modules/workforce-operations/engines/shift-engine.js";
import { WorkforceProductivityEngine } from "../src/modules/workforce-operations/engines/productivity-engine.js";

describe("TASK 29 — Workforce Scheduling, Shift Rules & Productivity", () => {
  describe("SchedulingEngine.generateSchedule", () => {
    it("should assign skilled available employees to shift demand slots", () => {
      const slots = [
        { shiftId: "s1", shiftName: "Plant Morning A", requiredHeadcount: 2, requiredSkills: ["GMP"] },
        { shiftId: "s2", shiftName: "Plant Evening B", requiredHeadcount: 1 }
      ];

      const employees = [
        { id: "e1", name: "Rajesh", skills: ["GMP", "Forklift"], isOnLeave: false },
        { id: "e2", name: "Sunil", skills: ["GMP"], isOnLeave: false },
        { id: "e3", name: "Anil", skills: ["General"], isOnLeave: false },
        { id: "e4", name: "Pooja", skills: ["GMP"], isOnLeave: true } // on leave
      ];

      const result = SchedulingEngine.generateSchedule(slots, employees);

      expect(result.totalRequiredHeadcount).toBe(3);
      expect(result.totalAssignedHeadcount).toBe(3);
      expect(result.coveragePercent).toBe(100);
      expect(result.assignments[0]?.assignedEmployees.length).toBe(2);
    });
  });

  describe("ShiftEngine.evaluateShiftAttendance", () => {
    const defaultRule = {
      shiftCode: "GEN",
      startsAtMinute: 540, // 09:00 AM
      endsAtMinute: 1080, // 06:00 PM
      breakDurationMinutes: 60,
      gracePeriodMinutes: 15,
      lateThresholdMinutes: 60,
      halfDayThresholdMinutes: 240,
      fullDayThresholdMinutes: 480
    };

    it("should mark PRESENT for on-time full day punch", () => {
      const result = ShiftEngine.evaluateShiftAttendance(545, 1080, defaultRule); // 09:05 AM to 06:00 PM
      expect(result.isLate).toBe(false);
      expect(result.attendanceStatus).toBe("PRESENT");
      expect(result.effectivePayableUnits).toBe(1.0);
    });

    it("should mark LATE when checked in during grace cutoff window", () => {
      const result = ShiftEngine.evaluateShiftAttendance(560, 1080, defaultRule); // 09:20 AM (grace is 15m)
      expect(result.isLate).toBe(true);
      expect(result.attendanceStatus).toBe("LATE");
      expect(result.effectivePayableUnits).toBe(1.0);
    });

    it("should mark HALF_DAY when worked minutes are below full-day threshold", () => {
      const result = ShiftEngine.evaluateShiftAttendance(540, 840, defaultRule); // 09:00 AM to 02:00 PM (4 hrs)
      expect(result.attendanceStatus).toBe("HALF_DAY");
      expect(result.effectivePayableUnits).toBe(0.5);
    });
  });

  describe("WorkforceProductivityEngine.calculateProductivityMetrics", () => {
    it("should calculate attendance and punctuality scores accurately", () => {
      const metrics = WorkforceProductivityEngine.calculateProductivityMetrics({
        totalScheduledDays: 20,
        presentDays: 19,
        lateDays: 1,
        halfDays: 1,
        absentDays: 0,
        overtimeHoursTotal: 4.0,
        totalWorkedHours: 158
      });

      expect(metrics.attendancePercentage).toBeGreaterThan(95);
      expect(metrics.punctualityScore).toBeGreaterThan(90);
      expect(metrics.productivityRating).toBe("EXCELLENT");
    });
  });
});
