import { describe, expect, it } from "vitest";
import { AttendanceAnomalyEngine } from "../src/modules/workforce-operations/engines/anomaly-engine.js";

describe("TASK 29 — Attendance Anomaly Engine", () => {
  it("should flag missing check-out punch", () => {
    const checkIn = new Date("2026-09-01T09:00:00Z");
    const result = AttendanceAnomalyEngine.scanPunchesForAnomalies({
      employeeId: "emp-1",
      date: "2026-09-01",
      checkInTime: checkIn,
      checkOutTime: null,
      shiftStartsAtMinute: 540,
      shiftEndsAtMinute: 1080,
      totalPunchesCountToday: 1
    });

    expect(result.hasAnomaly).toBe(true);
    expect(result.anomalies.some((a) => a.type === "MISSING_PUNCH")).toBe(true);
  });

  it("should flag excessive tardiness when checked in >60 mins late", () => {
    const checkIn = new Date();
    checkIn.setHours(10, 30, 0, 0); // 10:30 AM (90 mins after 09:00)
    const checkOut = new Date();
    checkOut.setHours(18, 0, 0, 0);

    const result = AttendanceAnomalyEngine.scanPunchesForAnomalies({
      employeeId: "emp-2",
      date: "2026-09-01",
      checkInTime: checkIn,
      checkOutTime: checkOut,
      shiftStartsAtMinute: 540, // 09:00 AM
      shiftEndsAtMinute: 1080,
      totalPunchesCountToday: 2
    });

    expect(result.hasAnomaly).toBe(true);
    expect(result.anomalies.some((a) => a.type === "EXCESSIVE_LATE")).toBe(true);
  });

  it("should flag critical severity for spoofing attempts and geofence breaches", () => {
    const result = AttendanceAnomalyEngine.scanPunchesForAnomalies({
      employeeId: "emp-3",
      date: "2026-09-01",
      checkInTime: new Date(),
      checkOutTime: new Date(),
      shiftStartsAtMinute: 540,
      shiftEndsAtMinute: 1080,
      isSpoofAttempted: true,
      isGeofenceBreached: true,
      totalPunchesCountToday: 2
    });

    expect(result.anomalies.some((a) => a.type === "SPOOF_ATTEMPT" && a.severity === "CRITICAL")).toBe(true);
    expect(result.anomalies.some((a) => a.type === "GEOFENCE_BREACH" && a.severity === "HIGH")).toBe(true);
  });
});
