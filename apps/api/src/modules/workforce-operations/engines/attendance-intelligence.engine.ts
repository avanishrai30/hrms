/**
 * TASK 29 — ATTENDANCE INTELLIGENCE & COMMAND CENTER ENGINE
 * Aggregates live headcounts, site presence, device health, and workforce operational readiness.
 */

export interface LiveAttendanceFeed {
  totalRosteredEmployees: number;
  presentCount: number;
  lateCount: number;
  onLeaveCount: number;
  remoteCount: number;
  fieldSalesCount: number;
  contractorCount: number;
}

export interface DeviceMonitoringFeed {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  failedPunchesLast24h: number;
}

export interface AttendanceCommandCenterTelemetry {
  livePresentPercentage: number;
  absenteeismPercentage: number;
  activeWorkforceTotal: number;
  punctualityRate: number;
  deviceHealthScore: number; // 0 - 100
  headcountBreakdown: {
    rostered: number;
    present: number;
    late: number;
    onLeave: number;
    absent: number;
    remote: number;
    field: number;
    contractors: number;
  };
  deviceStatusSummary: {
    total: number;
    online: number;
    offline: number;
    syncHealth: "OPTIMAL" | "DEGRADED" | "CRITICAL";
  };
}

export class AttendanceIntelligenceEngine {
  /**
   * Synthesize real-time command center telemetry for operations leaders and HR admins.
   */
  static synthesizeCommandCenter(
    feed: LiveAttendanceFeed,
    devices: DeviceMonitoringFeed
  ): AttendanceCommandCenterTelemetry {
    const presentTotal = feed.presentCount + feed.remoteCount + feed.fieldSalesCount;
    const absentCount = Math.max(
      0,
      feed.totalRosteredEmployees - presentTotal - feed.onLeaveCount
    );

    const livePresentPercentage =
      feed.totalRosteredEmployees > 0
        ? Math.round((presentTotal / feed.totalRosteredEmployees) * 1000) / 10
        : 100;

    const absenteeismPercentage =
      feed.totalRosteredEmployees > 0
        ? Math.round((absentCount / feed.totalRosteredEmployees) * 1000) / 10
        : 0;

    const punctualityRate =
      feed.presentCount > 0
        ? Math.round(((feed.presentCount - feed.lateCount) / feed.presentCount) * 1000) / 10
        : 100;

    const deviceHealthScore =
      devices.totalDevices > 0
        ? Math.round((devices.onlineDevices / devices.totalDevices) * 100)
        : 100;

    let syncHealth: "OPTIMAL" | "DEGRADED" | "CRITICAL" = "OPTIMAL";
    if (devices.offlineDevices > 2 || devices.failedPunchesLast24h > 10) {
      syncHealth = "CRITICAL";
    } else if (devices.offlineDevices > 0 || devices.failedPunchesLast24h > 0) {
      syncHealth = "DEGRADED";
    }

    return {
      livePresentPercentage,
      absenteeismPercentage,
      activeWorkforceTotal: presentTotal + feed.contractorCount,
      punctualityRate,
      deviceHealthScore,
      headcountBreakdown: {
        rostered: feed.totalRosteredEmployees,
        present: feed.presentCount,
        late: feed.lateCount,
        onLeave: feed.onLeaveCount,
        absent: absentCount,
        remote: feed.remoteCount,
        field: feed.fieldSalesCount,
        contractors: feed.contractorCount
      },
      deviceStatusSummary: {
        total: devices.totalDevices,
        online: devices.onlineDevices,
        offline: devices.offlineDevices,
        syncHealth
      }
    };
  }
}
