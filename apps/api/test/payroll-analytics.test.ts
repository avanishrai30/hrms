/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Payroll Analytics Service & Engine", () => {
  let service: AnalyticsService;
  let mockAnalyticsEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockAnalyticsEngine = {
      calculatePayrollAnalytics: vi.fn().mockResolvedValue({
        costTrends: [
          { month: 8, year: 2026, totalGross: 1200000, totalNet: 1020000, totalDeductions: 180000, totalEmployerContributions: 144000, totalCost: 1344000 }
        ],
        departmentCostBreakdown: [
          { departmentName: "Farming Ops", grossCost: 700000, netCost: 610000, employeeCount: 20, averageCostPerEmployee: 35000 }
        ],
        salaryBands: [
          { band: "₹25,000 - ₹50,000", count: 18, totalCost: 650000, percentage: 90.0 }
        ],
        allowanceComponentBreakdown: [
          { componentName: "Basic", code: "BASIC", totalAmount: 600000, percentage: 50.0 }
        ],
        deductionComponentBreakdown: [
          { componentName: "Provident Fund", code: "PF", totalAmount: 72000, percentage: 40.0 }
        ],
        overtimeCostTrend: [{ month: 8, year: 2026, amount: 48000 }],
        growthRate: { monthlyPercentage: 2.5, yearlyPercentage: 8.0 },
        costCenterAnalysis: [
          { businessUnitName: "North Farm", grossCost: 700000, employeeCount: 20 }
        ],
        efficiencyMetrics: {
          averageCostPerEmployee: 60000,
          takeHomeRatioPercentage: 85.0,
          statutoryCostRatioPercentage: 12.0
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

  it("fetches payroll analytics with salary bands and efficiency metrics", async () => {
    const res = await service.getPayrollAnalytics(tenantId);
    expect(res.costTrends).toHaveLength(1);
    expect(res.costTrends[0]?.totalCost).toBe(1344000);
    expect(res.departmentCostBreakdown[0]?.departmentName).toBe("Farming Ops");
    expect(res.efficiencyMetrics.takeHomeRatioPercentage).toBe(85.0);
    expect(mockAnalyticsEngine.calculatePayrollAnalytics).toHaveBeenCalledWith(tenantId);
  });
});
