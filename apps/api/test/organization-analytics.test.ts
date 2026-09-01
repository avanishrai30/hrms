/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Organization Analytics Service & Engine", () => {
  let service: AnalyticsService;
  let mockAnalyticsEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockAnalyticsEngine = {
      calculateOrganizationAnalytics: vi.fn().mockResolvedValue({
        businessUnitDistribution: [
          { id: "bu-1", name: "Agriculture", employeeCount: 30, percentage: 60.0 },
          { id: "bu-2", name: "Logistics", employeeCount: 20, percentage: 40.0 }
        ],
        regionDistribution: [
          { id: "reg-1", name: "North", employeeCount: 25, percentage: 50.0 },
          { id: "reg-2", name: "West", employeeCount: 25, percentage: 50.0 }
        ],
        teamDistribution: [
          { id: "team-1", name: "Harvesting", employeeCount: 15, percentage: 30.0 }
        ],
        managerHierarchy: {
          maxDepth: 3,
          averageSpanOfControl: 5.5,
          managerCount: 8
        },
        orgQuarterlyGrowth: [
          { quarter: "Q2 2026", headcount: 50, growthRatePercentage: 6.5 }
        ],
        crossTeamMobility: {
          totalTransfersLast12Months: 3,
          transferRatePercentage: 6.0
        },
        orgHealthScore: {
          score: 93,
          status: "EXCELLENT",
          spanBalanceScore: 94,
          retentionScore: 92
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

  it("fetches organization analytics with hierarchy depth, mobility, and health score", async () => {
    const res = await service.getOrganizationAnalytics(tenantId);
    expect(res.businessUnitDistribution).toHaveLength(2);
    expect(res.managerHierarchy.maxDepth).toBe(3);
    expect(res.managerHierarchy.averageSpanOfControl).toBe(5.5);
    expect(res.orgHealthScore.score).toBe(93);
    expect(mockAnalyticsEngine.calculateOrganizationAnalytics).toHaveBeenCalledWith(tenantId);
  });
});
