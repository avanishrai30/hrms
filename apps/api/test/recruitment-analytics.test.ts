import { describe, expect, it } from "vitest";
import type { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { RecruitmentAnalyticsService } from "../src/modules/recruitment/engines/recruitment-analytics.service.js";

describe("Recruitment Analytics Service (Task 20)", () => {
  const fakePrisma = {
    jobRequisition: {
      count: async () => 4,
      findMany: async () => [
        {
          id: "req-1",
          requisitionCode: "REQ-2026-001",
          jobTitle: "Senior Frontend Engineer",
          applications: [{ id: "app-1" }, { id: "app-2" }]
        },
        {
          id: "req-2",
          requisitionCode: "REQ-2026-002",
          jobTitle: "Backend Lead",
          applications: []
        }
      ]
    },
    candidate: {
      count: async () => 12
    },
    application: {
      findMany: async () => [
        { stage: "APPLIED", appliedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { stage: "APPLIED", appliedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { stage: "SCREENING", appliedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { stage: "TECHNICAL_ROUND", appliedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { stage: "OFFER", appliedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { stage: "JOINED", appliedAt: new Date(), createdAt: new Date(), updatedAt: new Date() }
      ]
    },
    offer: {
      findMany: async () => [
        {
          status: "ACCEPTED",
          totalCtc: 2400000,
          createdAt: new Date(),
          respondedAt: new Date(),
          offerCode: "OFF-2026-001",
          candidate: { fullName: "Aarav Gupta", noticePeriodDays: 30 }
        },
        {
          status: "RELEASED",
          totalCtc: 1800000,
          createdAt: new Date(),
          respondedAt: null,
          offerCode: "OFF-2026-002",
          candidate: { fullName: "Meera Nair", noticePeriodDays: 60 }
        }
      ]
    },
    recruitmentSource: {
      findMany: async () => [
        { sourceName: "Careers Portal", candidatesCount: 8, hiresCount: 2, costIncurred: 0 },
        { sourceName: "LinkedIn", candidatesCount: 4, hiresCount: 1, costIncurred: 25000 }
      ]
    },
    hiringRequest: {
      findMany: async () => [
        { vacancies: 3, hiringManager: { fullName: "Rahul Verma" } }
      ]
    }
  };

  const analyticsService = new RecruitmentAnalyticsService(fakePrisma as unknown as PrismaService);

  it("calculates executive recruitment KPIs and pipeline funnel", async () => {
    const analytics = await analyticsService.getRecruitmentAnalytics("tenant-123");

    expect(analytics.kpis.openPositions).toBe(4);
    expect(analytics.kpis.totalApplicants).toBe(12);
    expect(analytics.kpis.offersReleased).toBe(2);
    expect(analytics.kpis.offerAcceptanceRate).toBe(50); // 1 accepted of 2
    expect(analytics.pipelineFunnel.length).toBe(7);
    expect(analytics.sourcePerformance.length).toBe(2);
  });

  it("produces AI recruitment intelligence with delayed req risks and decline forecasting", async () => {
    const intelligence = await analyticsService.getAiRecruitmentIntelligence("tenant-123");

    expect(intelligence.hiringRisks.length).toBe(2);
    expect(intelligence.hiringRisks.some((r) => r.riskFactor.includes("Critical Pipeline Shortage"))).toBe(true);
    expect(intelligence.offerDeclinePredictions.length).toBe(2);
    expect(intelligence.offerDeclinePredictions.some((p) => p.declineProbability > 30)).toBe(true);
  });
});
