/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Face Analytics Service & Engine", () => {
  let service: AnalyticsService;
  let mockAnalyticsEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockAnalyticsEngine = {
      calculateFaceAnalytics: vi.fn().mockResolvedValue({
        matchSuccessPercentage: 99.2,
        matchFailurePercentage: 0.8,
        averageMatchScore: 0.95,
        averageLivenessScore: 0.97,
        spoofAttemptsCount: 0,
        failureReasonsBreakdown: [
          { reason: "Low lighting", count: 2, percentage: 100 }
        ],
        verificationLatencyMs: { averageMs: 320, p95Ms: 510 },
        cameraLightingMetrics: { averageQualityScore: 0.94, lowLightAttemptsCount: 2, blurCount: 1 },
        deviceBreakdown: [
          { deviceType: "Mobile PWA", count: 80, percentage: 80.0 },
          { deviceType: "Tablet Kiosk", count: 20, percentage: 20.0 }
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

  it("fetches face biometrics accuracy, liveness, and latency", async () => {
    const res = await service.getFaceAnalytics(tenantId);
    expect(res.matchSuccessPercentage).toBe(99.2);
    expect(res.averageMatchScore).toBe(0.95);
    expect(res.averageLivenessScore).toBe(0.97);
    expect(res.verificationLatencyMs.averageMs).toBe(320);
    expect(mockAnalyticsEngine.calculateFaceAnalytics).toHaveBeenCalledWith(tenantId);
  });
});
