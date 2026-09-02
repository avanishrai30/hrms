/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmployeesService } from "../src/modules/employees/employees.service.js";
import { EssService } from "../src/modules/ess/ess.service.js";
import { LeavesService } from "../src/modules/leaves/leaves.service.js";
import { OrganizationService } from "../src/modules/organization/organization.service.js";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("People, Organization & MSS Tenant Isolation & Authorization Tests", () => {
  const tenantA = "11111111-1111-1111-1111-111111111111";
  const tenantB = "22222222-2222-2222-2222-222222222222";

  let mockPrisma: any;
  let mockAudit: any;
  let employeesService: EmployeesService;
  let essService: EssService;
  let leavesService: LeavesService;
  let orgService: OrganizationService;

  beforeEach(() => {
    mockAudit = { record: vi.fn().mockResolvedValue({}) };
    mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb) => cb(mockPrisma)),
      employee: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.id === "emp-a") {
            return Promise.resolve({
              id: "emp-a",
              tenantId: tenantA,
              fullName: "Alice A",
              departmentId: "dept-a",
              designationId: "desig-a",
              managerEmployeeId: null,
              memberships: []
            });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.managerEmployeeId === "manager-a") {
            return Promise.resolve([
              {
                id: "emp-report-1",
                tenantId: tenantA,
                fullName: "Report 1",
                employeeCode: "RPT1",
                department: { name: "Engineering" },
                designation: { name: "Developer" },
                joiningDate: new Date("2024-01-01"),
                status: "ACTIVE"
              }
            ]);
          }
          if (where.tenantId === tenantB) {
            return Promise.resolve([]);
          }
          return Promise.resolve([]);
        })
      },
      tenantMembership: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.userId === "user-manager-a") {
            return Promise.resolve({ employeeId: "manager-a" });
          }
          if (where.tenantId === tenantA && where.userId === "user-wrong-manager") {
            return Promise.resolve({ employeeId: "manager-b" });
          }
          return Promise.resolve(null);
        })
      },
      department: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.id === "dept-a") {
            return Promise.resolve({ id: "dept-a", tenantId: tenantA, name: "Engineering" });
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "dept-new", ...data }))
      },
      designation: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.id === "desig-a") {
            return Promise.resolve({ id: "desig-a", tenantId: tenantA, name: "Developer", departmentId: "dept-a" });
          }
          return Promise.resolve(null);
        })
      },
      businessUnit: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.id === "bu-a") {
            return Promise.resolve({
              id: "bu-a",
              tenantId: tenantA,
              name: "Consumer Goods",
              code: "CG",
              isActive: true
            });
          }
          return Promise.resolve(null);
        })
      },

      leaveRequest: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.id === "leave-req-a") {
            return Promise.resolve({
              id: "leave-req-a",
              tenantId: tenantA,
              status: "PENDING_MANAGER",
              startDate: new Date("2025-06-01"),
              employeeId: "emp-report-1",
              leaveTypeId: "lt-annual",
              deductedDays: 2,
              leaveType: { policies: [{ requiresHrApproval: false }] },
              employee: { id: "emp-report-1", managerEmployeeId: "manager-a" }
            });
          }
          return Promise.resolve(null);
        }),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "leave-req-a", ...data }))
      },
      leaveApproval: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "approval-1", ...data }))
      },
      leaveBalance: {
        findFirst: vi.fn().mockResolvedValue(null)
      },
      employeeRequest: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0)
      }
    };

    employeesService = new EmployeesService(mockPrisma, mockAudit);
    essService = new EssService(mockPrisma, mockAudit);
    leavesService = new LeavesService(mockPrisma, mockAudit);
    orgService = new OrganizationService(mockPrisma, mockAudit);
  });

  describe("Employee Tenant Isolation", () => {
    it("rejects cross-tenant employee retrieval with NotFoundException", async () => {
      await expect(employeesService.getEmployee(tenantB, "emp-a")).rejects.toThrow(NotFoundException);
    });

    it("successfully retrieves employee within correct tenant", async () => {
      const emp = await employeesService.getEmployee(tenantA, "emp-a");
      expect(emp.id).toBe("emp-a");
      expect(emp.tenantId).toBe(tenantA);
    });
  });

  describe("MSS Manager Scope & Tenant Isolation", () => {
    it("returns direct reports scoped strictly to the authenticated manager and tenant", async () => {
      const team = await essService.getMssTeam(tenantA, "manager-a");
      expect(team.length).toBe(1);
      expect(team[0].fullName).toBe("Report 1");
      expect(team[0].tenantId).toBe(tenantA);
    });

    it("returns empty team for foreign tenant or non-existent manager", async () => {
      const team = await essService.getMssTeam(tenantB, "manager-a");
      expect(team.length).toBe(0);
    });
  });

  describe("Manager Same-Tenant Authorization & Cross-Tenant Boundary", () => {
    it("rejects leave approval review across tenants with NotFoundException", async () => {
      await expect(
        leavesService.reviewLeaveRequest(
          tenantB,
          "leave-req-a",
          { action: "APPROVED" },
          "MANAGER",
          "user-b"
        )
      ).rejects.toThrow(NotFoundException);
    });

    it("rejects same-tenant wrong manager leave review with ForbiddenException", async () => {
      await expect(
        leavesService.reviewLeaveRequest(
          tenantA,
          "leave-req-a",
          { action: "APPROVED" },
          "MANAGER",
          "user-wrong-manager"
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it("allows correct direct-report manager to review and approve leave request", async () => {
      const res = await leavesService.reviewLeaveRequest(
        tenantA,
        "leave-req-a",
        { action: "APPROVED" },
        "MANAGER",
        "user-manager-a"
      );
      expect(res.status).toBe("APPROVED");
      expect(mockPrisma.leaveApproval.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: tenantA,
            leaveRequestId: "leave-req-a",
            action: "APPROVED"
          })
        })
      );
    });

    it("allows HR_ADMIN with broader authority to approve leave request", async () => {
      const res = await leavesService.reviewLeaveRequest(
        tenantA,
        "leave-req-a",
        { action: "APPROVED" },
        "HR_ADMIN",
        "user-hr-admin"
      );
      expect(res.status).toBe("APPROVED");
    });
  });

  describe("Organization Resource Tenant Isolation", () => {
    it("rejects cross-tenant business unit retrieval with NotFoundException", async () => {
      await expect(orgService.getBusinessUnit(tenantB, "bu-a")).rejects.toThrow(NotFoundException);
    });

    it("successfully retrieves business unit within correct tenant", async () => {
      const bu = await orgService.getBusinessUnit(tenantA, "bu-a");
      expect(bu.id).toBe("bu-a");
      expect(bu.tenantId).toBe(tenantA);
      expect(bu.name).toBe("Consumer Goods");
    });
  });
});


