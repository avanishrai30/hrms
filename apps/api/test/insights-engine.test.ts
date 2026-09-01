/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InsightsEngine } from "../src/modules/ai/engines/insights.engine.js";

describe("Smart Insights Engine Tests (Task 19)", () => {
  let insightsEngine: InsightsEngine;
  let mockPrisma: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockPrisma = {
      attendance: {
        findMany: vi.fn().mockImplementation(({ where }) => {
          // Mock drop in attendance for recent week
          if (where.date?.gte && !where.date?.lt) {
            return Promise.resolve([
              { status: "PRESENT", workedMinutes: 480 },
              { status: "ABSENT", workedMinutes: 0 },
              { status: "ABSENT", workedMinutes: 0 }
            ]);
          }
          return Promise.resolve([
            { status: "PRESENT", workedMinutes: 480 },
            { status: "PRESENT", workedMinutes: 480 },
            { status: "PRESENT", workedMinutes: 480 }
          ]);
        })
      },
      leaveRequest: {
        findMany: vi.fn().mockResolvedValue([
          { id: "l-1", status: "PENDING_MANAGER" },
          { id: "l-2", status: "PENDING_MANAGER" },
          { id: "l-3", status: "PENDING_MANAGER" },
          { id: "l-4", status: "PENDING_MANAGER" },
          { id: "l-5", status: "PENDING_MANAGER" },
          { id: "l-6", status: "PENDING_MANAGER" }
        ])
      },
      employee: {
        count: vi.fn().mockResolvedValue(50)
      },
      aiSmartInsight: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          id: "ins-1",
          ...data,
          isDismissed: false,
          generatedAt: new Date()
        })),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "ins-1",
            tenantId,
            category: "ATTENDANCE",
            title: "Attendance Dropped 66.7% This Week",
            narrative: "Significant attendance dip detected.",
            severity: "CRITICAL",
            metricChangePercent: -66.7,
            isDismissed: false,
            generatedAt: new Date()
          }
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 })
      }
    };

    insightsEngine = new InsightsEngine(mockPrisma);
  });

  it("should detect attendance drop and generate proactive critical insight", async () => {
    const generated = await insightsEngine.generateTenantInsights(tenantId);
    expect(generated.length).toBeGreaterThan(0);
    const attendanceInsight = generated.find((g: any) => g.category === "ATTENDANCE");
    expect(attendanceInsight).toBeDefined();
    expect(attendanceInsight?.title).toContain("Attendance");
  });

  it("should allow dismissing active insights", async () => {
    const res = await insightsEngine.dismissInsight(tenantId, "ins-1");
    expect(res.success).toBe(true);
    expect(mockPrisma.aiSmartInsight.updateMany).toHaveBeenCalledWith({
      where: { id: "ins-1", tenantId },
      data: { isDismissed: true }
    });
  });
});
