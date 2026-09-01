import { describe, expect, it } from "vitest";
import { SLAEngine } from "../src/modules/helpdesk/engines/sla.engine.js";
import { TicketPriority } from "@prisma/client";

describe("Helpdesk SLA & Performance Engine (Task 22)", () => {
  it("computes accurate response and resolution due dates for priorities", () => {
    const baseTime = new Date("2026-09-01T10:00:00.000Z");

    // CRITICAL: 15m response, 2h (120m) resolution
    const crit = SLAEngine.computeDueDates(TicketPriority.CRITICAL, baseTime);
    expect(crit.responseDueAt.toISOString()).toBe("2026-09-01T10:15:00.000Z");
    expect(crit.resolutionDueAt.toISOString()).toBe("2026-09-01T12:00:00.000Z");

    // HIGH: 2h response, 8h resolution
    const high = SLAEngine.computeDueDates(TicketPriority.HIGH, baseTime);
    expect(high.responseDueAt.toISOString()).toBe("2026-09-01T12:00:00.000Z");
    expect(high.resolutionDueAt.toISOString()).toBe("2026-09-01T18:00:00.000Z");

    // MEDIUM: 8h response, 24h resolution
    const med = SLAEngine.computeDueDates(TicketPriority.MEDIUM, baseTime);
    expect(med.responseDueAt.toISOString()).toBe("2026-09-01T18:00:00.000Z");
    expect(med.resolutionDueAt.toISOString()).toBe("2026-09-02T10:00:00.000Z");

    // LOW: 24h response, 72h resolution
    const low = SLAEngine.computeDueDates(TicketPriority.LOW, baseTime);
    expect(low.responseDueAt.toISOString()).toBe("2026-09-02T10:00:00.000Z");
    expect(low.resolutionDueAt.toISOString()).toBe("2026-09-04T10:00:00.000Z");
  });

  it("detects SLA breaches correctly", () => {
    const dueAt = new Date("2026-09-01T12:00:00.000Z");
    const beforeDue = new Date("2026-09-01T11:59:00.000Z");
    const afterDue = new Date("2026-09-01T12:01:00.000Z");

    expect(SLAEngine.isBreached(dueAt, beforeDue)).toBe(false);
    expect(SLAEngine.isBreached(dueAt, afterDue)).toBe(true);
  });

  it("calculates MTTR in hours accurately", () => {
    const tickets = [
      {
        createdAt: new Date("2026-09-01T10:00:00.000Z"),
        resolvedAt: new Date("2026-09-01T12:00:00.000Z") // 2 hours
      },
      {
        createdAt: new Date("2026-09-01T10:00:00.000Z"),
        resolvedAt: new Date("2026-09-01T14:00:00.000Z") // 4 hours
      },
      {
        createdAt: new Date("2026-09-01T10:00:00.000Z"),
        resolvedAt: null // uncompleted
      }
    ];

    const mttr = SLAEngine.calculateMTTR(tickets);
    expect(mttr).toBe(3.0); // (2 + 4) / 2 = 3.0 hours
  });

  it("computes SLA compliance statistics across categories", () => {
    const tickets = [
      {
        priority: TicketPriority.CRITICAL,
        createdAt: new Date("2026-09-01T10:00:00.000Z"),
        firstRespondedAt: new Date("2026-09-01T10:10:00.000Z"),
        resolvedAt: new Date("2026-09-01T11:30:00.000Z"),
        resolutionDueAt: new Date("2026-09-01T12:00:00.000Z"),
        isSlaBreached: false
      },
      {
        priority: TicketPriority.CRITICAL,
        createdAt: new Date("2026-09-01T10:00:00.000Z"),
        firstRespondedAt: new Date("2026-09-01T10:20:00.000Z"),
        resolvedAt: new Date("2026-09-01T13:00:00.000Z"),
        resolutionDueAt: new Date("2026-09-01T12:00:00.000Z"),
        isSlaBreached: true
      }
    ];

    const stats = SLAEngine.computeSLAStats(tickets);
    const criticalStat = stats.find((s) => s.priority === "CRITICAL");
    expect(criticalStat?.totalTickets).toBe(2);
    expect(criticalStat?.breachedCount).toBe(1);
    expect(criticalStat?.compliancePercentage).toBe(50);
  });
});
