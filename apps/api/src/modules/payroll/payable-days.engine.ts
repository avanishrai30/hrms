import type { PayableDaysResultView } from "@vc-wms/shared-types";

export interface AttendanceRecordInput {
  date: Date | string;
  status: string; // "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE" | "WORK_FROM_HOME" | "HOLIDAY" | "WEEK_OFF"
  workedMinutes?: number;
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
}

export interface ApprovedLeaveInput {
  startDate: Date | string;
  endDate: Date | string;
  isPaid: boolean;
  totalDays: number;
}

export interface HolidayInput {
  date: Date | string;
  name: string;
}

export class PayableDaysEngine {
  /**
   * Calculates payable days breakdown from attendance, leaves, and holidays.
   */
  static calculatePayableDays(params: {
    month: number; // 1-12
    year: number;
    workingDaysOverride?: number;
    attendances: AttendanceRecordInput[];
    approvedLeaves: ApprovedLeaveInput[];
    holidays: HolidayInput[];
  }): PayableDaysResultView {
    const { month, year, workingDaysOverride, attendances, approvedLeaves, holidays } = params;

    // Number of days in the specified month
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays = workingDaysOverride ?? Math.min(26, daysInMonth);

    let presentDays = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;
    let holidayDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let earlyExitDays = 0;

    // Map holidays by YYYY-MM-DD
    const holidayDateSet = new Set<string>();
    for (const h of holidays) {
      const d = new Date(h.date).toISOString().split("T")[0];
      if (d) holidayDateSet.add(d);
    }

    // Map leaves by covered dates
    const paidLeaveDates = new Set<string>();
    const unpaidLeaveDates = new Set<string>();

    for (const l of approvedLeaves) {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);

      for (let curr = new Date(start); curr <= end; curr.setDate(curr.getDate() + 1)) {
        const currMonth = curr.getMonth() + 1;
        const currYear = curr.getFullYear();

        if (currMonth === month && currYear === year) {
          const dateStr = curr.toISOString().split("T")[0];
          if (dateStr) {
            if (l.isPaid) {
              paidLeaveDates.add(dateStr);
            } else {
              unpaidLeaveDates.add(dateStr);
            }
          }
        }
      }
    }

    // Map attendances by YYYY-MM-DD
    const attendanceMap = new Map<string, AttendanceRecordInput>();
    for (const a of attendances) {
      const d = new Date(a.date).toISOString().split("T")[0];
      if (d) {
        attendanceMap.set(d, a);
      }
    }

    // Evaluate each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      const dateStr = dateObj.toISOString().split("T")[0]!;

      // 1. Holiday Check
      if (holidayDateSet.has(dateStr)) {
        holidayDays += 1;
        continue;
      }

      // 2. Approved Leave Check
      if (paidLeaveDates.has(dateStr)) {
        paidLeaveDays += 1;
        continue;
      }
      if (unpaidLeaveDates.has(dateStr)) {
        unpaidLeaveDays += 1;
        continue;
      }

      // 3. Daily Attendance Record Check
      const att = attendanceMap.get(dateStr);
      if (att) {
        if (att.lateMinutes && att.lateMinutes > 0) {
          lateDays += 1;
        }
        if (att.earlyDepartureMinutes && att.earlyDepartureMinutes > 0) {
          earlyExitDays += 1;
        }

        switch (att.status) {
          case "PRESENT":
          case "WORK_FROM_HOME":
            presentDays += 1;
            break;
          case "HALF_DAY":
            halfDays += 1;
            break;
          case "HOLIDAY":
            holidayDays += 1;
            break;
          case "ON_LEAVE":
            paidLeaveDays += 1;
            break;
          case "ABSENT":
            absentDays += 1;
            break;
          default:
            break;
        }
      }
    }

    // Calculate Payable Days
    // Formula: Present + Paid Leave + Holiday + (0.5 * Half Days)
    const rawPayable = presentDays + paidLeaveDays + holidayDays + 0.5 * halfDays;
    const payableDays = Math.min(workingDays, Math.round(rawPayable * 10) / 10);

    return {
      workingDays,
      presentDays,
      paidLeaveDays,
      unpaidLeaveDays,
      holidayDays,
      halfDays,
      absentDays,
      lateDays,
      earlyExitDays,
      payableDays
    };
  }
}
