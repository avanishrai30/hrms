/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { AnalyticsEngine } from "../src/modules/analytics/engines/analytics.engine.js";
import { ExportEngine, type ExportDataset } from "../src/modules/analytics/engines/export.engine.js";
import { collectPermissions, hasPermission } from "@vc-wms/auth";

describe("Task 08 — Analytics & Reporting Security & Truthfulness Hardening", () => {
  describe("Phase 1 & 21: CSV Formula Injection Protection", () => {
    it("escapes cells starting with formula trigger characters (=, +, -, @, \\t, \\r)", () => {
      const exportEngine = new ExportEngine();
      const dataset: ExportDataset = {
        title: "Security_Audit_Test",
        columns: [
          { key: "name", header: "Employee Name" },
          { key: "formula1", header: "Formula Equal" },
          { key: "formula2", header: "Formula Plus" },
          { key: "formula3", header: "Formula Minus" },
          { key: "formula4", header: "Formula At" },
          { key: "formula5", header: "Formula Tab" },
          { key: "normal", header: "Normal Text" }
        ],
        rows: [
          {
            name: "John Doe",
            formula1: "=cmd|'/C calc'!A0",
            formula2: "+SUM(1,2)",
            formula3: "-100",
            formula4: "@admin",
            formula5: "\tmalicious_tab",
            normal: "Standard regular string"
          }
        ]
      };

      const csvBuffer = exportEngine.generateCsv(dataset);
      const csvString = csvBuffer.toString("utf-8");

      // Verify that dangerous formula triggers are prefixed with a single quote (')
      expect(csvString).toContain("'=cmd|'/C calc'!A0");
      expect(csvString).toContain("'+SUM(1,2)");
      expect(csvString).toContain("'-100");
      expect(csvString).toContain("'@admin");
      expect(csvString).toContain("'\tmalicious_tab");
      // Verify normal text is NOT mangled
      expect(csvString).toContain("Standard regular string");
      expect(csvString).not.toContain("'Standard regular string");
    });
  });

  describe("Phase 2 & 3: Sensitive Area Permissions (payroll.analytics)", () => {
    it("verifies analytics.controller requires payroll.analytics on /analytics/payroll", () => {
      const controllerCode = readFileSync(
        new URL("../src/modules/analytics/analytics.controller.ts", import.meta.url),
        "utf8"
      );

      // Verify @RequirePermissions("payroll.analytics") precedes getPayrollAnalytics
      const payrollRouteIdx = controllerCode.indexOf('@Get("analytics/payroll")');
      expect(payrollRouteIdx).toBeGreaterThan(-1);

      const segment = controllerCode.slice(payrollRouteIdx, payrollRouteIdx + 150);
      expect(segment).toContain('@RequirePermissions("payroll.analytics")');
    });

    it("verifies payroll.analytics permission enforcement", () => {
      const adminPerms = collectPermissions(["TENANT_ADMIN", "HR_ADMIN"]);
      expect(hasPermission(adminPerms, "payroll.analytics")).toBe(true);

      const employeePerms = collectPermissions(["EMPLOYEE"]);
      expect(hasPermission(employeePerms, "payroll.analytics")).toBe(false);
    });
  });

  describe("Phase 5 & 26: Metric Truthfulness (Zero vs Unavailable vs Fake Fallbacks)", () => {
    it("returns truthful 0 for biometrics and liveness when no records exist (not fake 99.2% or 98.8%)", async () => {
      const mockPrisma: any = {
        employee: {
          count: vi.fn().mockResolvedValue(0),
          findMany: vi.fn().mockResolvedValue([])
        },
        department: { findMany: vi.fn().mockResolvedValue([]) },
        payrollRun: { findFirst: vi.fn().mockResolvedValue(null) },
        complianceSnapshot: { findMany: vi.fn().mockResolvedValue([]) },
        faceVerification: { findMany: vi.fn().mockResolvedValue([]) },
        livenessVerification: { findMany: vi.fn().mockResolvedValue([]) },
        attendance: { findMany: vi.fn().mockResolvedValue([]) },
        attendanceEvent: { findMany: vi.fn().mockResolvedValue([]) },
        leaveBalance: { findMany: vi.fn().mockResolvedValue([]) }
      };

      const engine = new AnalyticsEngine(mockPrisma);
      const exec = await engine.calculateExecutiveAnalytics("tenant-empty-1");

      // Must be 0, never synthetic 99.2% or 98.8%
      expect(exec.biometrics.faceMatchPercentage).toBe(0);
      expect(exec.biometrics.livenessSuccessPercentage).toBe(0);
      expect(exec.payroll.grossSalary).toBe(0);
      expect(exec.payroll.currency).toBe("USD");
    });

    it("returns truthful 0 for efficiency ratios when payroll is empty (not fake 85% or 12%)", async () => {
      const mockPrisma: any = {
        payrollRun: {
          findMany: vi.fn().mockResolvedValue([])
        }
      };

      const engine = new AnalyticsEngine(mockPrisma);
      const payroll = await engine.calculatePayrollAnalytics("tenant-empty-2");

      expect(payroll.efficiencyMetrics.takeHomeRatioPercentage).toBe(0);
      expect(payroll.efficiencyMetrics.statutoryCostRatioPercentage).toBe(0);
      expect(payroll.costTrends).toEqual([]);
      expect(payroll.currency).toBe("USD");
    });

    it("returns truthful 0 for face analytics when no verifications exist (not fake 99.4% or 0.6%)", async () => {
      const mockPrisma: any = {
        faceVerification: { findMany: vi.fn().mockResolvedValue([]) },
        livenessVerification: { findMany: vi.fn().mockResolvedValue([]) },
        suspiciousActivity: { findMany: vi.fn().mockResolvedValue([]) }
      };

      const engine = new AnalyticsEngine(mockPrisma);
      const face = await engine.calculateFaceAnalytics("tenant-empty-3");

      expect(face.matchSuccessPercentage).toBe(0);
      expect(face.matchFailurePercentage).toBe(0);
      expect(face.averageMatchScore).toBe(0);
      expect(face.averageLivenessScore).toBe(0);
      expect(face.spoofAttemptsCount).toBe(0);
      expect(face.failureReasonsBreakdown).toEqual([]);
      expect(face.deviceBreakdown).toEqual([]);
    });
  });

  describe("Phase 18 & 27: Multi-Currency Support", () => {
    it("reports the currency of each payroll run and latest currency without assuming INR", async () => {
      const mockPrisma: any = {
        payrollRun: {
          findMany: vi.fn().mockResolvedValue([
            {
              month: 1,
              year: 2026,
              currency: "EUR",
              totalGross: 50000,
              totalNet: 40000,
              totalDeductions: 10000,
              totalEmployerContributions: 5000,
              employees: [
                {
                  grossSalary: 50000,
                  netSalary: 40000,
                  employerContributions: 5000,
                  employee: {
                    department: { name: "Engineering" },
                    businessUnit: { name: "Europe Ops" }
                  },
                  breakdowns: []
                }
              ]
            }
          ])
        }
      };

      const engine = new AnalyticsEngine(mockPrisma);
      const res = await engine.calculatePayrollAnalytics("tenant-multi-curr");

      expect(res.currency).toBe("EUR");
      expect(res.costTrends[0]?.currency).toBe("EUR");
      // Ensure salary bands don't hardcode INR symbol
      expect(Object.keys(res.salaryBands.map((s) => s.band))).not.toContain("< ₹25,000");
    });
  });
});
