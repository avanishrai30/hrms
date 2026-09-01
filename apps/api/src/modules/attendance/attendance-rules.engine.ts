import { AttendanceStatus } from "@prisma/client";

export interface ShiftDefinition {
  id: string;
  name: string;
  code: string;
  startsAtMinute: number; // e.g., 540 for 09:00
  endsAtMinute: number;   // e.g., 1080 for 18:00
  timezone: string;
}

export interface RuleConfig {
  lateThresholdMinutes: number;        // default 15
  halfDayThresholdMinutes: number;    // default 240 (4 hrs)
  minimumWorkDurationMinutes: number; // default 480 (8 hrs)
  maximumWorkDurationMinutes: number; // default 720 (12 hrs)
  gracePeriodMinutes: number;         // default 10
  overtimeThresholdMinutes: number;   // default 480 (8 hrs)
}

export const DEFAULT_ATTENDANCE_RULES: RuleConfig = {
  lateThresholdMinutes: 15,
  halfDayThresholdMinutes: 240,
  minimumWorkDurationMinutes: 480,
  maximumWorkDurationMinutes: 720,
  gracePeriodMinutes: 10,
  overtimeThresholdMinutes: 480
};

export class AttendanceRulesEngine {
  /**
   * Calculates shift start and end Date objects for a given calendar date.
   */
  static getShiftBoundaries(date: Date, shift: ShiftDefinition): { expectedStart: Date; expectedEnd: Date } {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    const startHours = Math.floor(shift.startsAtMinute / 60);
    const startMinutes = shift.startsAtMinute % 60;
    const expectedStart = new Date(Date.UTC(year, month, day, startHours, startMinutes, 0, 0));

    const endHours = Math.floor(shift.endsAtMinute / 60);
    const endMinutes = shift.endsAtMinute % 60;
    let expectedEnd = new Date(Date.UTC(year, month, day, endHours, endMinutes, 0, 0));

    // Handle overnight shifts where endsAtMinute <= startsAtMinute
    if (shift.endsAtMinute <= shift.startsAtMinute) {
      expectedEnd = new Date(expectedEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    return { expectedStart, expectedEnd };
  }

  /**
   * Calculates late minutes considering shift start and grace period.
   */
  static calculateLateMinutes(checkInAt: Date, expectedStart: Date, gracePeriodMinutes: number): number {
    const checkInMs = checkInAt.getTime();
    const startMs = expectedStart.getTime();
    const graceMs = gracePeriodMinutes * 60 * 1000;

    if (checkInMs <= startMs + graceMs) {
      return 0;
    }

    return Math.max(0, Math.floor((checkInMs - startMs) / (60 * 1000)));
  }

  /**
   * Calculates early departure minutes considering shift end.
   */
  static calculateEarlyDepartureMinutes(checkOutAt: Date, expectedEnd: Date): number {
    const checkOutMs = checkOutAt.getTime();
    const endMs = expectedEnd.getTime();

    if (checkOutMs >= endMs) {
      return 0;
    }

    return Math.max(0, Math.floor((endMs - checkOutMs) / (60 * 1000)));
  }

  /**
   * Calculates total worked minutes between check-in and check-out.
   */
  static calculateWorkedMinutes(checkInAt: Date, checkOutAt: Date): number {
    const diffMs = checkOutAt.getTime() - checkInAt.getTime();
    if (diffMs <= 0) return 0;
    return Math.floor(diffMs / (60 * 1000));
  }

  /**
   * Calculates overtime minutes exceeding threshold.
   */
  static calculateOvertimeMinutes(workedMinutes: number, overtimeThresholdMinutes: number): number {
    if (workedMinutes <= overtimeThresholdMinutes) return 0;
    return workedMinutes - overtimeThresholdMinutes;
  }

  /**
   * Evaluates attendance status based on worked duration, late arrival, and rules.
   */
  static evaluateStatus(params: {
    checkInAt: Date | null;
    checkOutAt: Date | null;
    lateMinutes: number;
    workedMinutes: number;
    rules: RuleConfig;
    isManual?: boolean;
  }): AttendanceStatus {
    const { checkInAt, checkOutAt, lateMinutes, workedMinutes, rules } = params;

    if (!checkInAt) {
      return AttendanceStatus.ABSENT;
    }

    // Only checked in so far
    if (!checkOutAt) {
      return lateMinutes >= rules.lateThresholdMinutes ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
    }

    // Both checked in and checked out
    if (workedMinutes < rules.halfDayThresholdMinutes) {
      return AttendanceStatus.HALF_DAY;
    }

    if (workedMinutes < rules.minimumWorkDurationMinutes) {
      return AttendanceStatus.HALF_DAY;
    }

    if (lateMinutes >= rules.lateThresholdMinutes) {
      return AttendanceStatus.LATE;
    }

    return AttendanceStatus.PRESENT;
  }

  /**
   * Checks if date is a week off in the work calendar.
   */
  static isWeekOff(date: Date, workingDaysJson?: unknown): boolean {
    if (!workingDaysJson) return false;
    let days: number[] = [];
    if (Array.isArray(workingDaysJson)) {
      days = workingDaysJson.map(Number);
    } else if (typeof workingDaysJson === "object" && workingDaysJson !== null) {
      days = Object.values(workingDaysJson).map(Number);
    }
    if (days.length === 0) return false;

    // JavaScript getUTCDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayOfWeek = date.getUTCDay();
    return !days.includes(dayOfWeek);
  }

  /**
   * Checks if date is a holiday in the holiday calendar.
   */
  static isHoliday(date: Date, holidaysJson?: unknown): { isHoliday: boolean; name?: string } {
    if (!holidaysJson) return { isHoliday: false };
    const dateStr = date.toISOString().split("T")[0];

    if (Array.isArray(holidaysJson)) {
      for (const item of holidaysJson) {
        if (typeof item === "string" && item === dateStr) {
          return { isHoliday: true, name: "Holiday" };
        }
        if (typeof item === "object" && item !== null && (item as { date?: string }).date === dateStr) {
          return { isHoliday: true, name: (item as { name?: string }).name ?? "Holiday" };
        }
      }
    }
    return { isHoliday: false };
  }
}
