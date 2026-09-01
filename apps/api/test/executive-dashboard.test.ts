/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/modules/analytics/analytics.service.js";

describe("Executive Dashboard Analytics", () => {
  let service: AnalyticsService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockAnalyticsEngine: any;
  let mockReportEngine: any;
  let mockDashboardEngine: any;
  let mockExportEngine: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockPrisma = {
      dashboard: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      },
      dashboardWidget: {
        findMany: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
        deleteMany: vi.fn()
      }
    };

    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    mockAnalyticsEngine = {
      calculateExecutiveAnalytics: vi.fn().mockResolvedValue({
        headcount: { total: 100, active: 95, inactive: 5, probation: 8, notice: 2 },
        newHiresThisMonth: 10,
        attritionRate: 5.0,
        attendanceRate: 96.5,
        leaveUtilizationPercentage: 35.2,
        payroll: { totalCost: 1500000, overtimeCost: 40000, averageSalary: 45000 },
        statutoryLiabilities: { totalPf: 120000, totalEsi: 25000, totalPt: 15000, totalTds: 45000, totalLiability: 205000 },
        distributions: { department: [], gender: [], employmentType: [] },
        biometrics: { faceMatchPercentage: 99.1, livenessSuccessPercentage: 98.6 }
      })
    };

    mockReportEngine = {};
    mockDashboardEngine = {
      getDefaultTemplates: vi.fn().mockReturnValue([
        { code: "EXECUTIVE_OVERVIEW", name: "Executive Overview Dashboard", category: "EXECUTIVE", widgets: [] }
      ]),
      validateGridLayout: vi.fn(),
      sanitizeGridPositions: vi.fn().mockImplementation((w) => w)
    };
    mockExportEngine = {};

    service = new AnalyticsService(
      mockPrisma,
      mockAudit,
      mockAnalyticsEngine,
      mockReportEngine,
      mockDashboardEngine,
      mockExportEngine
    );
  });

  it("retrieves executive analytics overview from engine", async () => {
    const data = await service.getExecutiveAnalytics(tenantId);
    expect(data.headcount.total).toBe(100);
    expect(data.headcount.active).toBe(95);
    expect(data.attendanceRate).toBe(96.5);
    expect(data.payroll.totalCost).toBe(1500000);
    expect(data.statutoryLiabilities.totalLiability).toBe(205000);
    expect(mockAnalyticsEngine.calculateExecutiveAnalytics).toHaveBeenCalledWith(tenantId);
  });

  it("retrieves standard dashboard templates", () => {
    const templates = service.getDashboardTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0]?.code).toBe("EXECUTIVE_OVERVIEW");
  });
});
