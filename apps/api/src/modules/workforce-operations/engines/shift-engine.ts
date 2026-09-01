/**
 * TASK 29 — ADVANCED SHIFT & ROSTER ENGINE
 * Evaluates shift rules, late grace periods, half-day deductions, split shifts, and shift swaps.
 */

export interface ShiftRuleConfig {
  shiftCode: string;
  startsAtMinute: number; // e.g. 540 = 09:00 AM
  endsAtMinute: number; // e.g. 1080 = 06:00 PM
  breakDurationMinutes: number; // e.g. 60
  gracePeriodMinutes: number; // e.g. 15
  lateThresholdMinutes: number; // e.g. 60
  halfDayThresholdMinutes: number; // e.g. 240 (min 4 hrs work)
  fullDayThresholdMinutes: number; // e.g. 480 (min 8 hrs work)
}

export interface ShiftEvaluationResult {
  isLate: boolean;
  lateMinutes: number;
  isEarlyExit: boolean;
  earlyExitMinutes: number;
  totalWorkedMinutes: number;
  attendanceStatus: "PRESENT" | "HALF_DAY" | "ABSENT" | "LATE";
  effectivePayableUnits: 1.0 | 0.5 | 0.0;
}

export class ShiftEngine {
  /**
   * Evaluate a punch-in and punch-out against shift template rules.
   */
  static evaluateShiftAttendance(
    checkInMinute: number,
    checkOutMinute: number,
    rule: ShiftRuleConfig
  ): ShiftEvaluationResult {
    const rawWorkedMinutes = Math.max(0, checkOutMinute - checkInMinute - rule.breakDurationMinutes);

    const isLate = checkInMinute > rule.startsAtMinute + rule.gracePeriodMinutes;
    const lateMinutes = isLate ? Math.max(0, checkInMinute - rule.startsAtMinute) : 0;

    const isEarlyExit = checkOutMinute < rule.endsAtMinute;
    const earlyExitMinutes = isEarlyExit ? Math.max(0, rule.endsAtMinute - checkOutMinute) : 0;

    let attendanceStatus: "PRESENT" | "HALF_DAY" | "ABSENT" | "LATE" = "PRESENT";
    let effectivePayableUnits: 1.0 | 0.5 | 0.0 = 1.0;

    if (rawWorkedMinutes < rule.halfDayThresholdMinutes) {
      attendanceStatus = "ABSENT";
      effectivePayableUnits = 0.0;
    } else if (
      rawWorkedMinutes < (rule.fullDayThresholdMinutes - rule.lateThresholdMinutes) ||
      checkInMinute > rule.startsAtMinute + rule.lateThresholdMinutes
    ) {
      attendanceStatus = "HALF_DAY";
      effectivePayableUnits = 0.5;
    } else if (isLate) {
      attendanceStatus = "LATE";
      effectivePayableUnits = 1.0;
    }

    return {
      isLate,
      lateMinutes,
      isEarlyExit,
      earlyExitMinutes,
      totalWorkedMinutes: rawWorkedMinutes,
      attendanceStatus,
      effectivePayableUnits
    };
  }

  /**
   * Validate shift swap eligibility between two employees.
   */
  static validateShiftSwap(
    requesterCurrentShiftId: string,
    targetCurrentShiftId: string,
    swapDate: Date
  ): { isValid: boolean; errorReason?: string } {
    if (requesterCurrentShiftId === targetCurrentShiftId) {
      return { isValid: false, errorReason: "Cannot swap identical shifts on the same day." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const swapDay = new Date(swapDate);
    swapDay.setHours(0, 0, 0, 0);

    if (swapDay.getTime() < today.getTime()) {
      return { isValid: false, errorReason: "Cannot request shift swap for a past date." };
    }

    return { isValid: true };
  }
}
