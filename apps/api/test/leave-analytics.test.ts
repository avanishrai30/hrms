/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Leave Analytics Service & Engine", () => {
  let service: AnalyticsService;
  let mockAnalyticsEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockAnalyticsEngine = {
      calculateLeaveAnalytics: vi.fn().mockResolvedValue({
        utilizationPercentage: 42.5,
        departmentLeaveTrends: [
          { departmentName: "Agronomy", leaveDaysTaken: 18, employeeCount: 10, avgDaysPerEmployee: 1.8 }
        ],
        leaveBalanceForecast: {
          allocatedDays: 120,
          usedDays: 51,
          remainingDays: 69,
          projectedBurnRate: 6.4
        },
        leaveCostAnalysis: {
          paidDaysCount: 48,
          unpaidDaysCount: 3,
          estimatedPaidLeaveCost: 96000,
          unpaidSalaryDeductions: 6000
        },
        sandwichLeaveImpact: {
          instancesCount: 4,
          sandwichDaysCount: 6,
          estimatedCostImpact: 12000
        },
        approvalTurnaround: {
          averageHours: 8.5,
          medianHours: 6.0
        },
        rejectionTrendsByType: [
          { leaveType: "Casual Leave", totalRequested: 20, rejectedCount: 1, rejectionRate: 5.0 }
        ],
        mostUsedLeaveTypes: [
          { typeCode: "CL", typeName: "Casual Leave", daysTaken: 25, percentage: 49.0 }
        ],
        leaveSeasonalityIndex: [
          { month: "Aug", year: 2026, daysTaken: 12, seasonalityScore: 1.1 }
        ]
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

  it("fetches leave analytics with utilization, cost impact, and turnaround", async () => {
    const res = await service.getLeaveAnalytics(tenantId);
    expect(res.utilizationPercentage).toBe(42.5);
    expect(res.leaveCostAnalysis.estimatedPaidLeaveCost).toBe(96000);
    expect(res.sandwichLeaveImpact.instancesCount).toBe(4);
    expect(res.approvalTurnaround.averageHours).toBe(8.5);
    expect(mockAnalyticsEngine.calculateLeaveAnalytics).toHaveBeenCalledWith(tenantId);
  });
});
