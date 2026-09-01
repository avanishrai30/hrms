/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Compliance Analytics Service & Engine", () => {
  let service: AnalyticsService;
  let mockAnalyticsEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockAnalyticsEngine = {
      calculateComplianceAnalytics: vi.fn().mockResolvedValue({
        pfContributionTrends: [
          { month: 8, year: 2026, employeeContribution: 72000, employerContribution: 72000, totalPf: 144000 }
        ],
        esiContributionTrends: [
          { month: 8, year: 2026, employeeContribution: 9000, employerContribution: 27000, totalEsi: 36000 }
        ],
        ptStateTrends: [
          { state: "Maharashtra", totalAmount: 4000, employeeCount: 20 }
        ],
        tdsDeductionTrends: [
          { month: 8, year: 2026, totalTds: 45000, avgTdsPerEmployee: 2250 }
        ],
        liabilitiesSummary: {
          monthlyLiabilities: [
            { period: "2026-08", pf: 144000, esi: 36000, pt: 4000, tds: 45000, total: 229000 }
          ],
          quarterlyLiabilities: [{ quarter: "Q2 2026", totalLiability: 687000 }]
        },
        complianceRiskScore: 10,
        missingFilingsCount: 0,
        pendingFilingsCount: 0,
        complianceHealthIndex: {
          score: 98,
          status: "EXCELLENT",
          unresolvedDiscrepanciesCount: 0
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

  it("fetches compliance analytics with statutory liabilities and risk scoring", async () => {
    const res = await service.getComplianceAnalytics(tenantId);
    expect(res.pfContributionTrends[0]?.totalPf).toBe(144000);
    expect(res.liabilitiesSummary.monthlyLiabilities[0]?.total).toBe(229000);
    expect(res.complianceRiskScore).toBe(10);
    expect(res.complianceHealthIndex.status).toBe("EXCELLENT");
    expect(mockAnalyticsEngine.calculateComplianceAnalytics).toHaveBeenCalledWith(tenantId);
  });
});
