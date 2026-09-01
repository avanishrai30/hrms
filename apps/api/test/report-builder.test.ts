/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReportEngine } from "../src/modules/analytics/engines/report.engine.js";

describe("ReportBuilder Engine (ReportEngine)", () => {
  let engine: ReportEngine;
  let mockPrisma: any;
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "emp-1",
            employeeCode: "EMP001",
            fullName: "Alice Johnson",
            email: "alice@vcorganics.com",
            phone: "+919876543210",
            status: "ACTIVE",
            employmentType: "FULL_TIME",
            joiningDate: new Date("2024-01-15"),
            gender: "FEMALE",
            department: { name: "Engineering" },
            designation: { name: "Senior Developer" },
            businessUnit: { name: "Tech" },
            region: { name: "North" },
            team: { name: "Platform" }
          },
          {
            id: "emp-2",
            employeeCode: "EMP002",
            fullName: "Bob Smith",
            email: "bob@vcorganics.com",
            phone: "+919876543211",
            status: "ACTIVE",
            employmentType: "FULL_TIME",
            joiningDate: new Date("2025-06-01"),
            gender: "MALE",
            department: { name: "Operations" },
            designation: { name: "Operations Lead" },
            businessUnit: { name: "Supply Chain" },
            region: { name: "West" },
            team: { name: "Logistics" }
          }
        ])
      },
      attendance: {
        findMany: vi.fn().mockResolvedValue([
          {
            employee: { employeeCode: "EMP001", fullName: "Alice Johnson" },
            date: new Date("2026-08-30"),
            status: "PRESENT",
            checkInAt: new Date("2026-08-30T09:15:00Z"),
            checkOutAt: new Date("2026-08-30T17:45:00Z"),
            workedMinutes: 510
          }
        ])
      },
      leaveRequest: {
        findMany: vi.fn().mockResolvedValue([
          {
            employee: { employeeCode: "EMP001", fullName: "Alice Johnson" },
            leaveType: { name: "Casual Leave" },
            startDate: new Date("2026-08-10"),
            endDate: new Date("2026-08-12"),
            totalDays: 3,
            deductedDays: 3,
            status: "APPROVED",
            metadata: {}
          }
        ])
      },
      payrollRunEmployee: {
        findMany: vi.fn().mockResolvedValue([
          {
            employee: { employeeCode: "EMP001", fullName: "Alice Johnson" },
            payrollRun: { month: 8, year: 2026 },
            payableDays: 31,
            grossSalary: 60000,
            totalDeductions: 8000,
            netSalary: 52000,
            employerContributions: 7200
          }
        ])
      },
      complianceSnapshot: {
        findMany: vi.fn().mockResolvedValue([])
      },
      faceVerification: {
        findMany: vi.fn().mockResolvedValue([])
      },
      department: {
        findMany: vi.fn().mockResolvedValue([])
      },
      auditLog: {
        findMany: vi.fn().mockResolvedValue([])
      }
    };

    engine = new ReportEngine(mockPrisma);
  });

  it("validates whitelisted fields for all 8 modules", () => {
    const modules = [
      "EMPLOYEE",
      "ATTENDANCE",
      "LEAVE",
      "PAYROLL",
      "COMPLIANCE",
      "FACE",
      "ORGANIZATION",
      "AUDIT"
    ] as const;

    for (const m of modules) {
      const fields = engine.getFieldWhitelist(m);
      expect(fields.length).toBeGreaterThan(0);
      expect(fields.every((f) => f.name && f.label && f.type)).toBe(true);
    }
  });

  it("rejects non-whitelisted column requests safely", async () => {
    await expect(
      engine.buildAndExecuteReport(tenantId, {
        module: "EMPLOYEE",
        columns: ["malicious_sql_column"],
        filters: [],
        sorts: [],
        groupBy: [],
        aggregations: [],
        limit: 100,
        offset: 0
      })
    ).rejects.toThrow();
  });

  it("executes safe Employee query and calculates tenure virtual fields", async () => {
    const result = await engine.buildAndExecuteReport(tenantId, {
      module: "EMPLOYEE",
      columns: ["employeeCode", "fullName", "department", "tenureYears"],
      filters: [],
      sorts: [],
      groupBy: [],
      aggregations: [],
      limit: 100,
      offset: 0
    });

    expect(result.rows).toHaveLength(2);
    expect(result.columns).toHaveLength(4);
    expect(result.rows[0]?.employeeCode).toBe("EMP001");
    expect(result.rows[0]?.department).toBe("Engineering");
    expect(typeof result.rows[0]?.tenureYears).toBe("number");
  });

  it("executes Attendance report with check-in/out and work hours", async () => {
    const result = await engine.buildAndExecuteReport(tenantId, {
      module: "ATTENDANCE",
      columns: ["employeeCode", "fullName", "date", "status", "totalHours", "isLate"],
      filters: [],
      sorts: [],
      groupBy: [],
      aggregations: [],
      limit: 100,
      offset: 0
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.totalHours).toBe(8.5);
  });

  it("executes Payroll report with net payable calculation", async () => {
    const result = await engine.buildAndExecuteReport(tenantId, {
      module: "PAYROLL",
      columns: ["employeeCode", "grossSalary", "totalDeductions", "netSalary", "netPayable"],
      filters: [],
      sorts: [],
      groupBy: [],
      aggregations: [],
      limit: 100,
      offset: 0
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.netPayable).toBe(52000);
  });

  it("performs grouping and aggregations (SUM, COUNT, AVG)", async () => {
    const result = await engine.buildAndExecuteReport(tenantId, {
      module: "EMPLOYEE",
      columns: ["department", "total_employees", "avg_tenure"],
      filters: [],
      sorts: [],
      groupBy: ["department"],
      aggregations: [
        { field: "employeeCode", function: "COUNT", alias: "total_employees" },
        { field: "tenureYears", function: "AVG", alias: "avg_tenure" }
      ],
      limit: 100,
      offset: 0
    });

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.department).toBeDefined();
    expect(result.rows[0]?.total_employees).toBe(1);
  });
});
