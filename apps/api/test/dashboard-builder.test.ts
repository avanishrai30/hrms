/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { DashboardEngine } from "../src/modules/analytics/engines/dashboard.engine.js";

describe("DashboardEngine (Dashboard Builder)", () => {
  let engine: DashboardEngine;
  let mockAnalyticsEngine: any;
  let mockReportEngine: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockAnalyticsEngine = {
      calculateExecutiveAnalytics: vi.fn().mockResolvedValue({
        headcount: { total: 50, active: 48 },
        attendanceRate: 95.0,
        payroll: { totalCost: 1200000, averageSalary: 25000 },
        statutoryLiabilities: { totalLiability: 150000 },
        distributions: {
          department: [{ departmentName: "Agronomy", count: 30 }],
          gender: [{ gender: "FEMALE", count: 20 }, { gender: "MALE", count: 30 }]
        },
        biometrics: { livenessSuccessPercentage: 99.0 }
      }),
      calculateWorkforceAnalytics: vi.fn().mockResolvedValue({
        headcountTrends: [{ month: "Aug", year: 2026, headcount: 50, active: 48 }],
        hiringTrends: [{ month: "Aug", year: 2026, hires: 5 }],
        ageBands: [{ band: "25-34", count: 35 }]
      }),
      calculateAttendanceAnalytics: vi.fn().mockResolvedValue({
        dailyTrends: [{ date: "2026-08-30", present: 48, absent: 2, late: 1 }],
        attendanceHeatmap: [{ dayOfWeek: 1, hour: 9, count: 45 }]
      }),
      calculateLeaveAnalytics: vi.fn().mockResolvedValue({
        utilizationPercentage: 35.0,
        departmentLeaveTrends: [{ departmentName: "Agronomy", leaveDaysTaken: 12 }]
      }),
      calculatePayrollAnalytics: vi.fn().mockResolvedValue({
        costTrends: [{ month: 8, year: 2026, totalGross: 1200000, totalNet: 1050000, totalCost: 1344000 }],
        departmentCostBreakdown: [{ departmentName: "Agronomy", grossCost: 800000, netCost: 700000 }],
        salaryBands: [{ band: "< ₹25,000", count: 20 }],
        allowanceComponentBreakdown: [{ componentName: "HRA", code: "HRA", totalAmount: 150000 }]
      }),
      calculateComplianceAnalytics: vi.fn().mockResolvedValue({
        complianceRiskScore: 12
      }),
      calculateFaceAnalytics: vi.fn().mockResolvedValue({
        matchSuccessPercentage: 99.5,
        spoofAttemptsCount: 0,
        failureReasonsBreakdown: [{ reason: "Low Light", count: 1 }],
        deviceBreakdown: [{ deviceType: "Mobile", count: 50 }]
      })
    };

    mockReportEngine = {
      buildAndExecuteReport: vi.fn().mockResolvedValue({
        columns: [{ key: "employeeCode", header: "Emp Code" }],
        rows: [{ employeeCode: "EMP001" }],
        totalCount: 1
      })
    };

    engine = new DashboardEngine(mockAnalyticsEngine, mockReportEngine);
  });

  it("validates 12-column grid layout positions correctly", () => {
    expect(() =>
      engine.validateGridLayout([
        { widgetType: "KPI_CARD", title: "Active Count", gridPosition: { x: 0, y: 0, w: 6, h: 4 } },
        { widgetType: "KPI_CARD", title: "Attendance", gridPosition: { x: 6, y: 0, w: 6, h: 4 } }
      ])
    ).not.toThrow();

    // Out of bounds width + x > 12
    expect(() =>
      engine.validateGridLayout([
        { widgetType: "KPI_CARD", title: "Invalid", gridPosition: { x: 8, y: 0, w: 6, h: 4 } }
      ])
    ).toThrow(BadRequestException);
  });

  it("sanitizes overlapping grid layouts sequentially", () => {
    const sanitized = engine.sanitizeGridPositions([
      { widgetType: "KPI_CARD", title: "Card 1", gridPosition: { x: 0, y: 0, w: 6, h: 4 } },
      { widgetType: "KPI_CARD", title: "Card 2", gridPosition: { x: 0, y: 0, w: 8, h: 4 } }
    ]);

    expect(sanitized[0]?.gridPosition.x).toBe(0);
    expect(sanitized[1]?.gridPosition.y).toBe(4);
  });

  it("resolves widget data for KPI_CARD, LINE_CHART, DONUT_CHART, HEATMAP, and TABLE", async () => {
    const kpi = await engine.resolveWidgetData(tenantId, {
      widgetType: "KPI_CARD",
      title: "Active Workforce",
      gridPosition: { x: 0, y: 0, w: 3, h: 3 },
      config: { metric: "HEADCOUNT_ACTIVE" }
    });
    expect((kpi.data as any).value).toBe(48);

    const line = await engine.resolveWidgetData(tenantId, {
      widgetType: "LINE_CHART",
      title: "Growth Trend",
      gridPosition: { x: 0, y: 0, w: 8, h: 6 },
      config: { metric: "WORKFORCE_GROWTH_TREND" }
    });
    expect((line.data as any).series).toHaveLength(3);

    const donut = await engine.resolveWidgetData(tenantId, {
      widgetType: "DONUT_CHART",
      title: "Dept Distribution",
      gridPosition: { x: 0, y: 0, w: 4, h: 6 },
      config: { metric: "DEPARTMENT_DISTRIBUTION" }
    });
    expect(Array.isArray(donut.data)).toBe(true);

    const table = await engine.resolveWidgetData(tenantId, {
      widgetType: "TABLE",
      title: "Employee Directory Table",
      gridPosition: { x: 0, y: 0, w: 12, h: 6 },
      config: { module: "EMPLOYEE", columns: ["employeeCode"] }
    });
    expect((table.data as any).rows).toHaveLength(1);
  });
});
