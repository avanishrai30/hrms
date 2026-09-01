/**
 * TASK 29 — WORKFORCE PRODUCTIVITY ANALYTICS ENGINE
 * Calculates punctuality scores, attendance ratios, absenteeism rates, and overtime utilization.
 */

export interface EmployeeAttendanceStats {
  totalScheduledDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  absentDays: number;
  overtimeHoursTotal: number;
  totalWorkedHours: number;
}

export interface EmployeeProductivityResult {
  attendancePercentage: number;
  punctualityScore: number; // 0 - 100
  absenteeismRate: number;
  effectiveWorkingHoursPerDay: number;
  productivityRating: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "POOR";
}

export class WorkforceProductivityEngine {
  /**
   * Compute comprehensive productivity score for an employee or department.
   */
  static calculateProductivityMetrics(stats: EmployeeAttendanceStats): EmployeeProductivityResult {
    if (stats.totalScheduledDays === 0) {
      return {
        attendancePercentage: 100,
        punctualityScore: 100,
        absenteeismRate: 0,
        effectiveWorkingHoursPerDay: 8.0,
        productivityRating: "EXCELLENT"
      };
    }

    const effectivePresentDays = stats.presentDays + stats.halfDays * 0.5;
    const attendancePercentage =
      Math.round((effectivePresentDays / stats.totalScheduledDays) * 1000) / 10;

    const onTimeDays = Math.max(0, stats.presentDays - stats.lateDays);
    const punctualityScore =
      stats.presentDays > 0 ? Math.round((onTimeDays / stats.presentDays) * 1000) / 10 : 100;

    const absenteeismRate =
      Math.round((stats.absentDays / stats.totalScheduledDays) * 1000) / 10;

    const effectiveWorkingHoursPerDay =
      effectivePresentDays > 0
        ? Math.round((stats.totalWorkedHours / effectivePresentDays) * 10) / 10
        : 0;

    let productivityRating: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "POOR" = "EXCELLENT";
    if (attendancePercentage >= 95 && punctualityScore >= 90) {
      productivityRating = "EXCELLENT";
    } else if (attendancePercentage >= 85 && punctualityScore >= 75) {
      productivityRating = "GOOD";
    } else if (attendancePercentage >= 70) {
      productivityRating = "NEEDS_IMPROVEMENT";
    } else {
      productivityRating = "POOR";
    }

    return {
      attendancePercentage,
      punctualityScore,
      absenteeismRate,
      effectiveWorkingHoursPerDay,
      productivityRating
    };
  }
}
