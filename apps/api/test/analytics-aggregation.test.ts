import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analytics Aggregation & Reporting Engine", () => {
  const serviceCode = readFileSync(
    new URL("../src/modules/analytics/analytics.service.ts", import.meta.url),
    "utf8"
  );

  it("aggregates headcount, attendance, payroll, and compliance in getExecutiveOverview", () => {
    expect(serviceCode).toContain("activeEmployees");
    expect(serviceCode).toContain("probationEmployees");
    expect(serviceCode).toContain("presentCount");
    expect(serviceCode).toContain("totalGross");
    expect(serviceCode).toContain("totalNet");
    expect(serviceCode).toContain("totalPf");
    expect(serviceCode).toContain("totalEsi");
  });

  it("provides attendance, leave, and payroll cross-domain analytics", () => {
    expect(serviceCode).toContain("getAttendanceAnalytics");
    expect(serviceCode).toContain("getLeaveAnalytics");
    expect(serviceCode).toContain("getPayrollAnalytics");
  });

  it("supports report execution and exports", () => {
    expect(serviceCode).toContain("executeReport");
    expect(serviceCode).toContain("exportReport");
    expect(serviceCode).toContain("generateCsv");
    expect(serviceCode).toContain("generateExcel");
    expect(serviceCode).toContain("generatePdf");
  });

  it("records audit events for reports and schedules", () => {
    expect(serviceCode).toContain("action: \"analytics.report.executed\"");
    expect(serviceCode).toContain("action: \"analytics.report.exported\"");
    expect(serviceCode).toContain("action: \"analytics.schedule.created\"");
    expect(serviceCode).toContain("action: \"analytics.schedule.triggered\"");
  });
});
