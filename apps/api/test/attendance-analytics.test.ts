/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Attendance Analytics Service & Engine", () => {
  let service: AnalyticsService;
  let mockAnalyticsEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockAnalyticsEngine = {
      calculateAttendanceAnalytics: vi.fn().mockResolvedValue({
        dailyTrends: [
          { date: "2026-08-30", present: 45, absent: 3, late: 2, halfDay: 0, onLeave: 1 }
        ],
        weeklyTrends: [
          { week: "Week 1", presentRate: 95.2, lateCount: 4 }
        ],
        monthlyTrends: [
          { month: "Aug 2026", presentRate: 94.8, absenteeismRate: 3.9 }
        ],
        lateArrivalTrend: [{ period: "2026-08-30", count: 2 }],
        earlyExitTrend: [{ period: "2026-08-30", count: 1 }],
        missingCheckInTrend: [{ period: "2026-08-30", count: 0 }],
        attendanceHeatmap: [{ dayOfWeek: 1, hour: 9, count: 42 }],
        geofenceViolationsPerLocation: [
          { locationName: "Plant 1", locationId: "loc-1", violationsCount: 2, complianceRate: 98.0 }
        ],
        locationDistribution: [{ locationName: "Plant 1", count: 45, percentage: 100 }],
        exceptionsBreakdown: [{ exceptionType: "LATE_ARRIVAL", count: 2, percentage: 100 }],
        biometricMatchStats: { successRate: 99.4, failureRate: 0.6, totalAttempts: 150 },
        livenessFailures: { totalFailures: 1, failureRate: 0.6, breakdown: [] },
        fraudIndicators: {
          rapidPunchCount: 0,
          impossibleTravelCount: 0,
          mockGpsCount: 0,
          totalSuspiciousEvents: 0
        }
      })
    };

    service = new AnalyticsService(
      {} as any,
      {} as any,
      mockAnalyticsEngine,
      {} as any,
      {} as any,
      {} as any
    );
  });

  it("fetches attendance analytics with heatmap and fraud indicators", async () => {
    const res = await service.getAttendanceAnalytics(tenantId);
    expect(res.dailyTrends).toHaveLength(1);
    expect(res.biometricMatchStats.successRate).toBe(99.4);
    expect(res.fraudIndicators.rapidPunchCount).toBe(0);
    expect(mockAnalyticsEngine.calculateAttendanceAnalytics).toHaveBeenCalledWith(tenantId);
  });
});
