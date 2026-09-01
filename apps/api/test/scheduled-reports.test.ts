/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Scheduled Reports Engine", () => {
  let service: AnalyticsService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockReportEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => {
    mockPrisma = {
      reportSchedule: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "sched-1",
            tenantId,
            name: "Weekly Attendance Summary",
            frequency: "WEEKLY",
            format: "CSV",
            recipients: ["hr@vcorganics.com"],
            isActive: true
          }
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: "sched-1",
          tenantId,
          name: "Weekly Attendance Summary",
          frequency: "WEEKLY",
          format: "CSV",
          recipients: ["hr@vcorganics.com"],
          savedReport: {
            id: "sr-1",
            columns: ["employeeCode", "fullName", "department", "status"],
            reportDefinition: { sourceModule: "EMPLOYEE" }
          }
        }),
        create: vi.fn().mockResolvedValue({
          id: "sched-2",
          tenantId,
          name: "Monthly Executive Report",
          frequency: "MONTHLY",
          format: "PDF",
          recipients: ["ceo@vcorganics.com"]
        }),
        update: vi.fn().mockResolvedValue({
          id: "sched-1",
          lastRunAt: new Date(),
          nextRunAt: new Date(Date.now() + 86400000 * 7)
        })
      }
    };

    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    mockReportEngine = {
      buildAndExecuteReport: vi.fn().mockResolvedValue({
        columns: [{ key: "employeeCode", header: "Emp Code" }],
        rows: [{ employeeCode: "EMP001" }],
        totalCount: 1
      })
    };

    service = new AnalyticsService(
      mockPrisma,
      mockAudit,
      {} as any,
      mockReportEngine,
      {} as any,
      {} as any
    );
  });

  it("lists all configured report schedules for tenant", async () => {
    const list = await service.listSchedules(tenantId);
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe("Weekly Attendance Summary");
  });

  it("creates a new schedule with audit recording", async () => {
    const created = await service.createSchedule(
      tenantId,
      {
        savedReportId: "36d1acc3-4fd0-4587-82f0-7fe302242ec4",
        name: "Monthly Executive Report",
        frequency: "MONTHLY",
        recipients: ["ceo@vcorganics.com"],
        format: "PDF"
      },
      userId
    );

    expect(created.name).toBe("Monthly Executive Report");
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "analytics.schedule.created",
        resourceType: "report_schedule"
      })
    );
  });

  it("triggers schedule manual execution and updates nextRunAt", async () => {
    const res = await service.triggerScheduleRun(tenantId, "sched-1", userId);

    expect(res.message).toContain("executed and dispatched");
    expect(mockReportEngine.buildAndExecuteReport).toHaveBeenCalled();
    expect(mockPrisma.reportSchedule.update).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "analytics.schedule.triggered",
        resourceType: "report_schedule"
      })
    );
  });
});
