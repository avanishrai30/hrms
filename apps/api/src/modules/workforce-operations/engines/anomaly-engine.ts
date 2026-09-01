/**
 * TASK 29 — ATTENDANCE ANOMALY ENGINE
 * Detects missing punches, double punches, excessive tardiness, early exits, and geofence breaches.
 */

export interface PunchRecordContext {
  employeeId: string;
  date: string;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  shiftStartsAtMinute: number; // e.g. 540 (09:00 AM)
  shiftEndsAtMinute: number; // e.g. 1080 (06:00 PM)
  isGeofenceBreached?: boolean;
  isSpoofAttempted?: boolean;
  totalPunchesCountToday: number;
}

export interface AnomalyDetectionResult {
  hasAnomaly: boolean;
  anomalies: Array<{
    type:
      | "MISSING_PUNCH"
      | "DOUBLE_PUNCH"
      | "EXCESSIVE_LATE"
      | "EARLY_EXIT"
      | "GEOFENCE_BREACH"
      | "SPOOF_ATTEMPT"
      | "UNUSUAL_HOURS";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    explanation: string;
    recommendedAction: string;
  }>;
}

export class AttendanceAnomalyEngine {
  /**
   * Scan punch record and evaluate all compliance and fraud anomalies.
   */
  static scanPunchesForAnomalies(ctx: PunchRecordContext): AnomalyDetectionResult {
    const anomalies: AnomalyDetectionResult["anomalies"] = [];

    // 1. Spoof Attempt
    if (ctx.isSpoofAttempted) {
      anomalies.push({
        type: "SPOOF_ATTEMPT",
        severity: "CRITICAL",
        explanation: "Biometric or facial recognition anti-spoofing alert triggered during punch.",
        recommendedAction: "Freeze automated attendance credit and notify Security & HR Admin."
      });
    }

    // 2. Geofence Breach
    if (ctx.isGeofenceBreached) {
      anomalies.push({
        type: "GEOFENCE_BREACH",
        severity: "HIGH",
        explanation: "Punch submitted outside authorized perimeter coordinates.",
        recommendedAction: "Request manager verification or GPS correction workflow."
      });
    }

    // 3. Missing Check-Out
    if (ctx.checkInTime && !ctx.checkOutTime) {
      anomalies.push({
        type: "MISSING_PUNCH",
        severity: "MEDIUM",
        explanation: "Check-in logged without corresponding check-out punch.",
        recommendedAction: "Prompt employee in ESS to submit attendance regularization."
      });
    }

    // 4. Excessive Tardiness (> 60 minutes late)
    if (ctx.checkInTime) {
      const checkInMinutes = ctx.checkInTime.getHours() * 60 + ctx.checkInTime.getMinutes();
      if (checkInMinutes > ctx.shiftStartsAtMinute + 60) {
        anomalies.push({
          type: "EXCESSIVE_LATE",
          severity: "MEDIUM",
          explanation: `Employee checked in ${checkInMinutes - ctx.shiftStartsAtMinute} minutes past scheduled shift start.`,
          recommendedAction: "Apply half-day late deduction rule or manager dispensation."
        });
      }
    }

    // 5. Excessive Early Exit (> 60 minutes before shift end)
    if (ctx.checkOutTime) {
      const checkOutMinutes = ctx.checkOutTime.getHours() * 60 + ctx.checkOutTime.getMinutes();
      if (checkOutMinutes < ctx.shiftEndsAtMinute - 60) {
        anomalies.push({
          type: "EARLY_EXIT",
          severity: "MEDIUM",
          explanation: `Employee checked out ${ctx.shiftEndsAtMinute - checkOutMinutes} minutes prior to shift completion.`,
          recommendedAction: "Verify if partial day permission or half-day leave was approved."
        });
      }
    }

    // 6. Double Punch / Excessive Punches (> 6 punches in single day)
    if (ctx.totalPunchesCountToday > 6) {
      anomalies.push({
        type: "DOUBLE_PUNCH",
        severity: "LOW",
        explanation: `Unusually high punch frequency detected (${ctx.totalPunchesCountToday} punches today).`,
        recommendedAction: "Inspect terminal hardware for bounce triggers or clean duplicate records."
      });
    }

    return {
      hasAnomaly: anomalies.length > 0,
      anomalies
    };
  }
}
