import { describe, expect, it } from "vitest";
import { ServiceDeliveryEngine } from "../src/modules/helpdesk/engines/service-delivery.engine.js";

describe("ServiceDeliveryEngine", () => {
  it("should compute accurate SLA compliance, first response SLA, and CSAT metrics", () => {
    const result = ServiceDeliveryEngine.computeMetrics({
      totalTickets: 100,
      resolvedTickets: 90,
      slaBreachedCount: 4,
      firstResponseWithinSlaCount: 96,
      totalResolutionHours: 270, // 270 / 90 = 3.0 hrs
      totalFirstResponseMinutes: 1500, // 1500 / 100 = 15 mins
      categoryCounts: {
        PAYROLL: 45,
        LEAVE: 30,
        IT_SUPPORT: 25
      },
      csatRatings: [5, 5, 4, 5, 5, 4]
    });

    expect(result.totalTickets).toBe(100);
    expect(result.resolvedTickets).toBe(90);
    expect(result.openTickets).toBe(10);
    expect(result.slaCompliancePercent).toBe(96.0);
    expect(result.firstResponseSlaPercent).toBe(96.0);
    expect(result.avgResolutionHours).toBe(3.0);
    expect(result.avgFirstResponseMinutes).toBe(15.0);
    expect(result.topTicketCategory).toBe("PAYROLL");
    expect(result.healthStatus).toBe("EXCELLENT");
  });

  it("should categorize health as AT_RISK or CRITICAL when SLA breaches are high", () => {
    const result = ServiceDeliveryEngine.computeMetrics({
      totalTickets: 50,
      resolvedTickets: 30,
      slaBreachedCount: 20, // 60% compliance
      firstResponseWithinSlaCount: 30,
      totalResolutionHours: 150,
      totalFirstResponseMinutes: 1000,
      categoryCounts: { GENERAL: 50 },
      csatRatings: [3, 2, 4, 3]
    });

    expect(result.slaCompliancePercent).toBe(60.0);
    expect(result.healthStatus).toBe("CRITICAL");
  });
});
