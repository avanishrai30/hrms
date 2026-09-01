/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEngine } from "../src/modules/analytics/engines/analytics.engine.js";

describe("AnalyticsEngine", () => {
  let engine: AnalyticsEngine;
  let mockPrisma: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockPrisma = {
      employee: {
        count: vi.fn().mockImplementation(({ where }) => {
          if (where?.status === "ACTIVE") return Promise.resolve(45);
          if (where?.status === "PROBATION") return Promise.resolve(5);
          if (where?.status === "NOTICE_PERIOD") return Promise.resolve(2);
          if (where?.joiningDate) return Promise.resolve(4);
          return Promise.resolve(52);
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "emp-1",
            employeeCode: "EMP001",
            fullName: "Alice Johnson",
            gender: "FEMALE",
            employmentType: "FULL_TIME",
            status: "ACTIVE",
            joiningDate: new Date("2025-01-15"),
            dateOfBirth: new Date("1992-05-10"),
            departmentId: "dept-1",
            designationId: "desig-1",
            managerEmployeeId: null,
            department: { name: "Engineering" },
            designation: { name: "Senior Developer" }
          },
          {
            id: "emp-2",
            employeeCode: "EMP002",
            fullName: "Bob Smith",
            gender: "MALE",
            employmentType: "FULL_TIME",
            status: "ACTIVE",
            joiningDate: new Date("2025-06-01"),
            dateOfBirth: new Date("1988-08-20"),
            departmentId: "dept-1",
            designationId: "desig-2",
            managerEmployeeId: "emp-1",
            department: { name: "Engineering" },
            designation: { name: "Tech Lead" }
          }
        ])
      },
      department: {
        findMany: vi.fn().mockResolvedValue([
          { id: "dept-1", name: "Engineering", _count: { employees: 25 }, teams: [{ name: "Backend" }] },
          { id: "dept-2", name: "Operations", _count: { employees: 20 }, teams: [{ name: "Logistics" }] }
        ])
      },
      designation: {
        findMany: vi.fn().mockResolvedValue([
          { id: "desig-1", name: "Developer", _count: { employees: 15 } },
          { id: "desig-2", name: "Manager", _count: { employees: 5 } }
        ])
      },
      businessUnit: {
        findMany: vi.fn().mockResolvedValue([
          { id: "bu-1", name: "Agriculture", _count: { employees: 30 } },
          { id: "bu-2", name: "Supply Chain", _count: { employees: 15 } }
        ])
      },
      region: {
        findMany: vi.fn().mockResolvedValue([
          { id: "reg-1", name: "North", _count: { employees: 25 } },
          { id: "reg-2", name: "West", _count: { employees: 20 } }
        ])
      },
      team: {
        findMany: vi.fn().mockResolvedValue([
          { id: "team-1", name: "Agronomy", _count: { employees: 10 } }
        ])
      },
      employeeStatusHistory: {
        findMany: vi.fn().mockResolvedValue([
          { id: "sh-1", newStatus: "INACTIVE", createdAt: new Date("2026-03-01") }
        ])
      },
      attendance: {
        findMany: vi.fn().mockResolvedValue([
          { date: new Date(), status: "PRESENT", workedMinutes: 480 },
          { date: new Date(), status: "LATE", workedMinutes: 450 }
        ])
      },
      attendanceEvent: {
        findMany: vi.fn().mockResolvedValue([
          { id: "ev-1", employeeId: "emp-1", eventType: "CHECK_IN", timestamp: new Date() },
          { id: "ev-2", employeeId: "emp-2", eventType: "CHECK_IN", timestamp: new Date() }
        ])
      },
      attendanceException: {
        findMany: vi.fn().mockResolvedValue([
          { id: "exc-1", exceptionType: "LATE_ARRIVAL", createdAt: new Date() }
        ])
      },
      location: {
        findMany: vi.fn().mockResolvedValue([
          { id: "loc-1", name: "HQ Pune", _count: { verifications: 100 } }
        ])
      },
      leaveBalance: {
        findMany: vi.fn().mockResolvedValue([
          { id: "lb-1", allocatedDays: 18, usedDays: 6, leaveType: { name: "Casual Leave" } },
          { id: "lb-2", allocatedDays: 12, usedDays: 3, leaveType: { name: "Sick Leave" } }
        ])
      },
      leaveRequest: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "lr-1",
            employeeId: "emp-1",
            leaveTypeId: "lt-1",
            startDate: new Date("2026-08-10"),
            endDate: new Date("2026-08-12"),
            totalDays: 3,
            deductedDays: 3,
            status: "APPROVED",
            metadata: {},
            createdAt: new Date("2026-08-01T08:00:00Z"),
            updatedAt: new Date("2026-08-01T14:00:00Z"),
            leaveType: { id: "lt-1", code: "CL", name: "Casual Leave", isPaid: true }
          }
        ])
      },
      leaveType: {
        findMany: vi.fn().mockResolvedValue([
          { id: "lt-1", code: "CL", name: "Casual Leave", isPaid: true }
        ])
      },
      payrollRun: {
        findFirst: vi.fn().mockResolvedValue({
          id: "run-1",
          month: 8,
          year: 2026,
          employees: [
            {
              id: "pre-1",
              grossSalary: 60000,
              netSalary: 52000,
              totalDeductions: 8000,
              employerContributions: 7200,
              totalAdjustments: 2000,
              employee: { department: { name: "Engineering" }, businessUnit: { name: "Tech" } },
              breakdowns: [
                { type: "EARNING", code: "BASIC", name: "Basic Salary", proratedAmount: 30000 },
                { type: "DEDUCTION", code: "PF", name: "Provident Fund", proratedAmount: 3600 }
              ]
            }
          ]
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "run-1",
            month: 8,
            year: 2026,
            totalGross: 60000,
            totalNet: 52000,
            totalDeductions: 8000,
            totalEmployerContributions: 7200,
            employees: [
              {
                grossSalary: 60000,
                netSalary: 52000,
                totalDeductions: 8000,
                employerContributions: 7200,
                totalAdjustments: 2000,
                employee: { department: { name: "Engineering" }, businessUnit: { name: "Tech" } },
                breakdowns: [
                  { type: "EARNING", code: "BASIC", name: "Basic Salary", proratedAmount: 30000 },
                  { type: "DEDUCTION", code: "PF", name: "Provident Fund", proratedAmount: 3600 }
                ]
              }
            ]
          }
        ])
      },
      complianceSnapshot: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "cs-1",
            month: 8,
            year: 2026,
            pfEmployee: 3600,
            pfEmployer: 3600,
            esiEmployee: 500,
            esiEmployer: 1500,
            ptAmount: 200,
            ptState: "Maharashtra",
            tdsAmount: 2500
          }
        ])
      },
      faceVerification: {
        findMany: vi.fn().mockResolvedValue([
          { id: "fv-1", status: "MATCHED", confidenceScore: 0.96, reason: "Match verified", createdAt: new Date() },
          { id: "fv-2", status: "MATCHED", confidenceScore: 0.94, reason: "Match verified", createdAt: new Date() }
        ])
      },
      livenessVerification: {
        findMany: vi.fn().mockResolvedValue([
          { id: "lv-1", status: "PASSED", livenessScore: 0.98, reason: "Passed challenge", createdAt: new Date() }
        ])
      },
      suspiciousActivity: {
        findMany: vi.fn().mockResolvedValue([])
      }
    };

    engine = new AnalyticsEngine(mockPrisma);
  });

  it("calculates executive analytics successfully", async () => {
    const result = await engine.calculateExecutiveAnalytics(tenantId);

    expect(result.headcount.total).toBe(52);
    expect(result.headcount.active).toBe(45);
    expect(result.newHiresThisMonth).toBe(4);
    expect(result.payroll.totalCost).toBe(67200);
    expect(result.statutoryLiabilities.totalPf).toBe(7200);
    expect(result.distributions.department).toHaveLength(2);
    expect(result.biometrics.faceMatchPercentage).toBeGreaterThanOrEqual(90);
  });

  it("calculates workforce analytics with 12-month trajectories and manager span", async () => {
    const result = await engine.calculateWorkforceAnalytics(tenantId);

    expect(result.headcountTrends).toHaveLength(12);
    expect(result.hiringTrends).toHaveLength(12);
    expect(result.attritionTrends).toHaveLength(12);
    expect(result.managerSpanAnalysis.maxSpan).toBeDefined();
    expect(result.ageBands).toBeDefined();
    expect(result.organizationDistribution.businessUnits).toHaveLength(2);
  });

  it("calculates attendance analytics with heatmap matrix and biometric rates", async () => {
    const result = await engine.calculateAttendanceAnalytics(tenantId);

    expect(result.attendanceHeatmap).toHaveLength(7 * 24);
    expect(result.biometricMatchStats.successRate).toBeGreaterThan(90);
    expect(result.geofenceViolationsPerLocation).toHaveLength(1);
    expect(result.dailyTrends).toBeDefined();
  });

  it("calculates leave analytics with burn rate and department usage", async () => {
    const result = await engine.calculateLeaveAnalytics(tenantId);

    expect(result.utilizationPercentage).toBe(30);
    expect(result.leaveBalanceForecast.allocatedDays).toBe(30);
    expect(result.leaveBalanceForecast.usedDays).toBe(9);
    expect(result.leaveCostAnalysis.paidDaysCount).toBe(3);
    expect(result.approvalTurnaround.averageHours).toBeGreaterThan(0);
  });

  it("calculates payroll analytics with salary bands and cost components", async () => {
    const result = await engine.calculatePayrollAnalytics(tenantId);

    expect(result.costTrends).toHaveLength(1);
    expect(result.departmentCostBreakdown[0]?.departmentName).toBe("Engineering");
    expect(result.allowanceComponentBreakdown).toBeDefined();
    expect(result.deductionComponentBreakdown).toBeDefined();
    expect(result.efficiencyMetrics.takeHomeRatioPercentage).toBeGreaterThan(80);
  });

  it("calculates compliance analytics with risk score and statutory trends", async () => {
    const result = await engine.calculateComplianceAnalytics(tenantId);

    expect(result.pfContributionTrends).toHaveLength(1);
    expect(result.ptStateTrends[0]?.state).toBe("Maharashtra");
    expect(result.complianceRiskScore).toBe(12);
    expect(result.complianceHealthIndex.status).toBe("EXCELLENT");
  });

  it("calculates face biometrics and liveness analytics", async () => {
    const result = await engine.calculateFaceAnalytics(tenantId);

    expect(result.matchSuccessPercentage).toBe(100);
    expect(result.averageMatchScore).toBe(0.95);
    expect(result.deviceBreakdown).toHaveLength(3);
  });

  it("calculates organization hierarchy, distribution, and health score", async () => {
    const result = await engine.calculateOrganizationAnalytics(tenantId);

    expect(result.businessUnitDistribution).toHaveLength(2);
    expect(result.managerHierarchy.maxDepth).toBeGreaterThanOrEqual(1);
    expect(result.orgHealthScore.score).toBe(91);
  });
});
