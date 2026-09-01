import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { OrganizationService } from "../src/modules/organization/organization.service.js";

describe("Organization Module", () => {
  let service: OrganizationService;
  let mockPrisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;
  let mockAuditService: { record: ReturnType<typeof vi.fn> };

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "22222222-2222-2222-2222-222222222222";
  const membershipId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockPrisma = {
      businessUnit: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn()
      },
      region: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn()
      },
      team: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn()
      },
      department: {
        findMany: vi.fn(),
        findFirst: vi.fn()
      },
      employee: {
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn()
      }
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    service = new OrganizationService(mockPrisma as never, mockAuditService as never);
  });

  describe("Business Units CRUD", () => {
    it("lists business units scoped to tenantId", async () => {
      mockPrisma.businessUnit.findMany.mockResolvedValue([
        { id: "bu-1", name: "Agriculture", code: "AGRI", tenantId }
      ]);

      const result = await service.listBusinessUnits(tenantId);
      expect(result).toHaveLength(1);
      expect(mockPrisma.businessUnit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId })
        })
      );
    });

    it("creates a business unit and records audit log", async () => {
      mockPrisma.businessUnit.findFirst.mockResolvedValue(null);
      mockPrisma.businessUnit.create.mockResolvedValue({
        id: "bu-1",
        name: "Logistics",
        code: "LOG",
        tenantId
      });

      const result = await service.createBusinessUnit(
        tenantId,
        { name: "Logistics", code: "LOG", isActive: true },
        userId,
        membershipId
      );

      expect(result.code).toBe("LOG");
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "organization.business_unit.created",
          resourceType: "business_unit"
        })
      );
    });

    it("prevents duplicate business unit code", async () => {
      mockPrisma.businessUnit.findFirst.mockResolvedValue({ id: "bu-1", code: "LOG" });

      await expect(
        service.createBusinessUnit(tenantId, { name: "Logistics", code: "LOG", isActive: true })
      ).rejects.toThrow(BadRequestException);
    });

    it("prevents self-parenting in business unit update", async () => {
      mockPrisma.businessUnit.findFirst.mockResolvedValue({ id: "bu-1", tenantId });

      await expect(
        service.updateBusinessUnit(tenantId, "bu-1", { parentId: "bu-1" })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Regions CRUD", () => {
    it("creates a region linked to a business unit", async () => {
      mockPrisma.region.findFirst.mockResolvedValue(null);
      mockPrisma.businessUnit.findFirst.mockResolvedValue({ id: "bu-1", tenantId });
      mockPrisma.region.create.mockResolvedValue({
        id: "reg-1",
        name: "North Region",
        code: "NORTH",
        businessUnitId: "bu-1",
        tenantId
      });

      const result = await service.createRegion(
        tenantId,
        { name: "North Region", code: "NORTH", businessUnitId: "bu-1", isActive: true },
        userId,
        membershipId
      );

      expect(result.code).toBe("NORTH");
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "organization.region.created",
          resourceType: "region"
        })
      );
    });
  });

  describe("Teams CRUD", () => {
    it("creates a team linked to a department", async () => {
      mockPrisma.team.findFirst.mockResolvedValue(null);
      mockPrisma.department.findFirst.mockResolvedValue({ id: "dept-1", tenantId });
      mockPrisma.team.create.mockResolvedValue({
        id: "team-1",
        name: "Harvesting Alpha",
        code: "HARV_A",
        departmentId: "dept-1",
        tenantId
      });

      const result = await service.createTeam(
        tenantId,
        { name: "Harvesting Alpha", code: "HARV_A", departmentId: "dept-1", isActive: true },
        userId,
        membershipId
      );

      expect(result.code).toBe("HARV_A");
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "organization.team.created",
          resourceType: "team"
        })
      );
    });
  });

  describe("Org Hierarchy Tree (getOrgTree)", () => {
    it("builds a hierarchical tree from BUs, Regions, Departments, and Teams", async () => {
      mockPrisma.businessUnit.findMany.mockResolvedValue([
        { id: "bu-1", name: "Farming Ops", code: "FARM", parentId: null, headUserId: null, tenantId }
      ]);
      mockPrisma.region.findMany.mockResolvedValue([
        { id: "reg-1", name: "Punjab Sector", code: "PB", businessUnitId: "bu-1", headUserId: null, tenantId }
      ]);
      mockPrisma.department.findMany.mockResolvedValue([
        { id: "dept-1", name: "Agronomy", code: "AGRO", tenantId }
      ]);
      mockPrisma.team.findMany.mockResolvedValue([
        { id: "team-1", name: "Soil Quality", code: "SOIL", departmentId: "dept-1", leadUserId: null, tenantId }
      ]);

      const tree = await service.getOrgTree(tenantId);
      expect(tree).toBeDefined();
      expect(Array.isArray(tree)).toBe(true);

      const buNode = tree.find((n) => n.id === "bu-1");
      expect(buNode).toBeDefined();
      expect(buNode?.type).toBe("BUSINESS_UNIT");
      expect(buNode?.children).toHaveLength(1);
      expect(buNode?.children[0]?.id).toBe("reg-1");

      const deptNode = tree.find((n) => n.id === "dept-1");
      expect(deptNode).toBeDefined();
      expect(deptNode?.type).toBe("DEPARTMENT");
      expect(deptNode?.children).toHaveLength(1);
      expect(deptNode?.children[0]?.id).toBe("team-1");
    });
  });

  describe("Reporting Line (getReportingChain & assignReportingManager)", () => {
    it("resolves multi-level manager hierarchy without loops", async () => {
      const empA = { id: "emp-a", employeeCode: "E001", fullName: "Alice", email: "a@vc.com", managerEmployeeId: "emp-b", tenantId, status: "ACTIVE" };
      const empB = { id: "emp-b", employeeCode: "E002", fullName: "Bob", email: "b@vc.com", managerEmployeeId: "emp-c", tenantId, status: "ACTIVE" };
      const empC = { id: "emp-c", employeeCode: "E003", fullName: "Charlie", email: "c@vc.com", managerEmployeeId: null, tenantId, status: "ACTIVE" };

      mockPrisma.employee.findFirst
        .mockResolvedValueOnce(empA)
        .mockResolvedValueOnce(empB)
        .mockResolvedValueOnce(empC);

      const chain = await service.getReportingChain(tenantId, "emp-a");
      expect(chain).toHaveLength(3);
      expect(chain[0]?.id).toBe("emp-a");
      expect(chain[1]?.id).toBe("emp-b");
      expect(chain[2]?.id).toBe("emp-c");
    });

    it("prevents self-assignment as manager", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: "emp-a", tenantId });

      await expect(
        service.assignReportingManager(tenantId, { employeeId: "emp-a", managerId: "emp-a" })
      ).rejects.toThrow(BadRequestException);
    });

    it("prevents circular manager reporting chain", async () => {
      const empA = { id: "emp-a", tenantId, managerEmployeeId: null };
      const empB = { id: "emp-b", tenantId, managerEmployeeId: "emp-a" };

      mockPrisma.employee.findFirst
        .mockResolvedValueOnce(empA) // employee
        .mockResolvedValueOnce(empB) // target manager
        .mockResolvedValueOnce(empA); // climb manager's parent

      await expect(
        service.assignReportingManager(tenantId, { employeeId: "emp-a", managerId: "emp-b" })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Assign Employee Org", () => {
    it("updates employee BU, Region, and Team with audit trail", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: "emp-1",
        tenantId,
        businessUnitId: null,
        regionId: null,
        teamId: null
      });
      mockPrisma.businessUnit.findFirst.mockResolvedValue({ id: "bu-1", tenantId });
      mockPrisma.region.findFirst.mockResolvedValue({ id: "reg-1", tenantId });
      mockPrisma.team.findFirst.mockResolvedValue({ id: "team-1", tenantId });
      mockPrisma.employee.update.mockResolvedValue({
        id: "emp-1",
        tenantId,
        businessUnitId: "bu-1",
        regionId: "reg-1",
        teamId: "team-1"
      });

      const result = await service.assignEmployeeOrg(
        tenantId,
        "emp-1",
        { businessUnitId: "bu-1", regionId: "reg-1", teamId: "team-1" },
        userId,
        membershipId
      );

      expect(result.businessUnitId).toBe("bu-1");
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "organization.employee_org.assigned",
          resourceType: "employee"
        })
      );
    });
  });
});
