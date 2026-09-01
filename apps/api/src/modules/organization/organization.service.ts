import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { OrgHierarchyNode } from "@vc-wms/shared-types";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AssignEmployeeOrgDto,
  AssignReportingManagerDto,
  CreateBusinessUnitDto,
  CreateRegionDto,
  CreateTeamDto,
  OrganizationFilterDto,
  UpdateBusinessUnitDto,
  UpdateRegionDto,
  UpdateTeamDto
} from "./organization.schemas.js";

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private auditJson(data: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
  }

  // ==================== BUSINESS UNITS ====================

  async listBusinessUnits(tenantId: string, query?: OrganizationFilterDto) {
    const where: Prisma.BusinessUnitWhereInput = {
      tenantId,
      ...(query?.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query?.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    return this.prisma.businessUnit.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            regions: true,
            employees: true,
            children: true
          }
        }
      },
      orderBy: [{ name: "asc" }]
    });
  }

  async getBusinessUnit(tenantId: string, id: string) {
    const businessUnit = await this.prisma.businessUnit.findFirst({
      where: { id, tenantId },
      include: {
        parent: true,
        children: true,
        regions: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            regions: true,
            employees: true,
            children: true
          }
        }
      }
    });

    if (!businessUnit) {
      throw new NotFoundException("Business unit not found.");
    }

    return businessUnit;
  }

  async createBusinessUnit(
    tenantId: string,
    input: CreateBusinessUnitDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.businessUnit.findFirst({
      where: { tenantId, code: input.code }
    });

    if (existing) {
      throw new BadRequestException(`Business unit with code "${input.code}" already exists.`);
    }

    if (input.parentId) {
      const parent = await this.prisma.businessUnit.findFirst({
        where: { id: input.parentId, tenantId }
      });
      if (!parent) {
        throw new BadRequestException("Parent business unit does not exist.");
      }
    }

    const businessUnit = await this.prisma.businessUnit.create({
      data: {
        tenantId,
        name: input.name,
        code: input.code,
        description: input.description ?? null,
        headUserId: input.headUserId ?? null,
        parentId: input.parentId ?? null,
        isActive: input.isActive ?? true
      },
      include: {
        parent: true,
        children: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.business_unit.created",
      resourceType: "business_unit",
      resourceId: businessUnit.id,
      after: this.auditJson(businessUnit)
    });

    return businessUnit;
  }

  async updateBusinessUnit(
    tenantId: string,
    id: string,
    input: UpdateBusinessUnitDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.getBusinessUnit(tenantId, id);

    if (input.parentId) {
      if (input.parentId === id) {
        throw new BadRequestException("A business unit cannot be its own parent.");
      }

      const parent = await this.prisma.businessUnit.findFirst({
        where: { id: input.parentId, tenantId }
      });
      if (!parent) {
        throw new BadRequestException("Parent business unit does not exist.");
      }

      // Cycle detection: climb from parentId up to check if id is encountered
      let currentParentId: string | null = parent.parentId;
      const visited = new Set<string>([id, input.parentId]);
      while (currentParentId) {
        if (currentParentId === id) {
          throw new BadRequestException("Circular hierarchy detected in business units.");
        }
        if (visited.has(currentParentId)) break;
        visited.add(currentParentId);
        const ancestor = await this.prisma.businessUnit.findUnique({
          where: { id: currentParentId },
          select: { parentId: true }
        });
        currentParentId = ancestor?.parentId ?? null;
      }
    }

    const updated = await this.prisma.businessUnit.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.headUserId !== undefined ? { headUserId: input.headUserId } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      },
      include: {
        parent: true,
        children: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.business_unit.updated",
      resourceType: "business_unit",
      resourceId: updated.id,
      before: this.auditJson(before),
      after: this.auditJson(updated)
    });

    return updated;
  }

  async deleteBusinessUnit(
    tenantId: string,
    id: string,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.getBusinessUnit(tenantId, id);

    // Unlink children and attached regions
    await this.prisma.businessUnit.updateMany({
      where: { parentId: id, tenantId },
      data: { parentId: null }
    });

    await this.prisma.region.updateMany({
      where: { businessUnitId: id, tenantId },
      data: { businessUnitId: null }
    });

    await this.prisma.employee.updateMany({
      where: { businessUnitId: id, tenantId },
      data: { businessUnitId: null }
    });

    await this.prisma.businessUnit.delete({
      where: { id }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.business_unit.deleted",
      resourceType: "business_unit",
      resourceId: id,
      before: this.auditJson(before)
    });

    return { success: true, id };
  }

  // ==================== REGIONS ====================

  async listRegions(tenantId: string, query?: OrganizationFilterDto) {
    const where: Prisma.RegionWhereInput = {
      tenantId,
      ...(query?.businessUnitId ? { businessUnitId: query.businessUnitId } : {}),
      ...(query?.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query?.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    return this.prisma.region.findMany({
      where,
      include: {
        businessUnit: true,
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: [{ name: "asc" }]
    });
  }

  async getRegion(tenantId: string, id: string) {
    const region = await this.prisma.region.findFirst({
      where: { id, tenantId },
      include: {
        businessUnit: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    if (!region) {
      throw new NotFoundException("Region not found.");
    }

    return region;
  }

  async createRegion(
    tenantId: string,
    input: CreateRegionDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.region.findFirst({
      where: { tenantId, code: input.code }
    });

    if (existing) {
      throw new BadRequestException(`Region with code "${input.code}" already exists.`);
    }

    if (input.businessUnitId) {
      const bu = await this.prisma.businessUnit.findFirst({
        where: { id: input.businessUnitId, tenantId }
      });
      if (!bu) {
        throw new BadRequestException("Business unit does not exist.");
      }
    }

    const region = await this.prisma.region.create({
      data: {
        tenantId,
        name: input.name,
        code: input.code,
        description: input.description ?? null,
        businessUnitId: input.businessUnitId ?? null,
        headUserId: input.headUserId ?? null,
        isActive: input.isActive ?? true
      },
      include: {
        businessUnit: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.region.created",
      resourceType: "region",
      resourceId: region.id,
      after: this.auditJson(region)
    });

    return region;
  }

  async updateRegion(
    tenantId: string,
    id: string,
    input: UpdateRegionDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.getRegion(tenantId, id);

    if (input.businessUnitId) {
      const bu = await this.prisma.businessUnit.findFirst({
        where: { id: input.businessUnitId, tenantId }
      });
      if (!bu) {
        throw new BadRequestException("Business unit does not exist.");
      }
    }

    const updated = await this.prisma.region.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.businessUnitId !== undefined ? { businessUnitId: input.businessUnitId } : {}),
        ...(input.headUserId !== undefined ? { headUserId: input.headUserId } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      },
      include: {
        businessUnit: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.region.updated",
      resourceType: "region",
      resourceId: updated.id,
      before: this.auditJson(before),
      after: this.auditJson(updated)
    });

    return updated;
  }

  async deleteRegion(
    tenantId: string,
    id: string,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.getRegion(tenantId, id);

    await this.prisma.employee.updateMany({
      where: { regionId: id, tenantId },
      data: { regionId: null }
    });

    await this.prisma.region.delete({
      where: { id }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.region.deleted",
      resourceType: "region",
      resourceId: id,
      before: this.auditJson(before)
    });

    return { success: true, id };
  }

  // ==================== TEAMS ====================

  async listTeams(tenantId: string, query?: OrganizationFilterDto) {
    const where: Prisma.TeamWhereInput = {
      tenantId,
      ...(query?.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query?.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query?.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    return this.prisma.team.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: [{ name: "asc" }]
    });
  }

  async getTeam(tenantId: string, id: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, tenantId },
      include: {
        department: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    if (!team) {
      throw new NotFoundException("Team not found.");
    }

    return team;
  }

  async createTeam(
    tenantId: string,
    input: CreateTeamDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.team.findFirst({
      where: { tenantId, code: input.code }
    });

    if (existing) {
      throw new BadRequestException(`Team with code "${input.code}" already exists.`);
    }

    if (input.departmentId) {
      const dept = await this.prisma.department.findFirst({
        where: { id: input.departmentId, tenantId }
      });
      if (!dept) {
        throw new BadRequestException("Department does not exist.");
      }
    }

    const team = await this.prisma.team.create({
      data: {
        tenantId,
        name: input.name,
        code: input.code,
        description: input.description ?? null,
        departmentId: input.departmentId ?? null,
        leadUserId: input.leadUserId ?? null,
        isActive: input.isActive ?? true
      },
      include: {
        department: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.team.created",
      resourceType: "team",
      resourceId: team.id,
      after: this.auditJson(team)
    });

    return team;
  }

  async updateTeam(
    tenantId: string,
    id: string,
    input: UpdateTeamDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.getTeam(tenantId, id);

    if (input.departmentId) {
      const dept = await this.prisma.department.findFirst({
        where: { id: input.departmentId, tenantId }
      });
      if (!dept) {
        throw new BadRequestException("Department does not exist.");
      }
    }

    const updated = await this.prisma.team.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
        ...(input.leadUserId !== undefined ? { leadUserId: input.leadUserId } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      },
      include: {
        department: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.team.updated",
      resourceType: "team",
      resourceId: updated.id,
      before: this.auditJson(before),
      after: this.auditJson(updated)
    });

    return updated;
  }

  async deleteTeam(
    tenantId: string,
    id: string,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const before = await this.getTeam(tenantId, id);

    await this.prisma.employee.updateMany({
      where: { teamId: id, tenantId },
      data: { teamId: null }
    });

    await this.prisma.team.delete({
      where: { id }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.team.deleted",
      resourceType: "team",
      resourceId: id,
      before: this.auditJson(before)
    });

    return { success: true, id };
  }

  // ==================== ORG HIERARCHY TREE ====================

  async getOrgTree(tenantId: string): Promise<OrgHierarchyNode[]> {
    const [businessUnits, regions, departments, teams] = await Promise.all([
      this.prisma.businessUnit.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: "asc" }
      }),
      this.prisma.region.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: "asc" }
      }),
      this.prisma.department.findMany({
        where: { tenantId },
        orderBy: { name: "asc" }
      }),
      this.prisma.team.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: "asc" }
      })
    ]);

    // Build department nodes with their teams
    const departmentNodes: OrgHierarchyNode[] = departments.map((dept) => {
      const deptTeams = teams.filter((t) => t.departmentId === dept.id);
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        type: "DEPARTMENT",
        head: null,
        children: deptTeams.map((team) => ({
          id: team.id,
          name: team.name,
          code: team.code,
          type: "TEAM",
          head: team.leadUserId,
          children: []
        }))
      };
    });

    // Standalone teams without a department
    const standaloneTeams: OrgHierarchyNode[] = teams
      .filter((t) => !t.departmentId)
      .map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        type: "TEAM",
        head: t.leadUserId,
        children: []
      }));

    // Build region nodes
    const regionNodesMap = new Map<string, OrgHierarchyNode>();
    for (const region of regions) {
      regionNodesMap.set(region.id, {
        id: region.id,
        name: region.name,
        code: region.code,
        type: "REGION",
        head: region.headUserId,
        children: []
      });
    }

    // Build BU nodes recursively
    const buMap = new Map<string, typeof businessUnits[0]>();
    for (const bu of businessUnits) {
      buMap.set(bu.id, bu);
    }

    const buildBuNode = (bu: typeof businessUnits[0]): OrgHierarchyNode => {
      const childBUs = businessUnits.filter((child) => child.parentId === bu.id);
      const buRegions = regions
        .filter((r) => r.businessUnitId === bu.id)
        .map((r) => regionNodesMap.get(r.id)!);

      return {
        id: bu.id,
        name: bu.name,
        code: bu.code,
        type: "BUSINESS_UNIT",
        head: bu.headUserId,
        children: [
          ...childBUs.map(buildBuNode),
          ...buRegions
        ]
      };
    };

    // Root business units
    const rootBUs = businessUnits.filter((bu) => !bu.parentId).map(buildBuNode);

    // Standalone regions not associated with any BU
    const standaloneRegions = regions
      .filter((r) => !r.businessUnitId)
      .map((r) => regionNodesMap.get(r.id)!);

    // Combine top-level structure
    const tree: OrgHierarchyNode[] = [
      ...rootBUs,
      ...standaloneRegions,
      ...departmentNodes,
      ...standaloneTeams
    ];

    return tree;
  }

  // ==================== REPORTING LINE RESOLUTION ====================

  async getReportingChain(tenantId: string, employeeId: string) {
    const rootEmployee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: {
        department: true,
        designation: true,
        businessUnit: true,
        region: true,
        team: true
      }
    });

    if (!rootEmployee) {
      throw new NotFoundException("Employee not found.");
    }

    const chain: Array<{
      id: string;
      employeeCode: string;
      fullName: string;
      email: string;
      status: string;
      department?: { id: string; name: string; code: string } | null;
      designation?: { id: string; name: string; code: string } | null;
      businessUnit?: { id: string; name: string; code: string } | null;
      region?: { id: string; name: string; code: string } | null;
      team?: { id: string; name: string; code: string } | null;
      managerEmployeeId?: string | null;
      level: number;
    }> = [];

    // Add target employee at level 0
    chain.push({
      id: rootEmployee.id,
      employeeCode: rootEmployee.employeeCode,
      fullName: rootEmployee.fullName,
      email: rootEmployee.email,
      status: rootEmployee.status,
      department: rootEmployee.department,
      designation: rootEmployee.designation,
      businessUnit: rootEmployee.businessUnit,
      region: rootEmployee.region,
      team: rootEmployee.team,
      managerEmployeeId: rootEmployee.managerEmployeeId,
      level: 0
    });

    let currentManagerId = rootEmployee.managerEmployeeId;
    const visited = new Set<string>([rootEmployee.id]);
    let currentLevel = 1;

    while (currentManagerId && !visited.has(currentManagerId)) {
      visited.add(currentManagerId);
      const manager = await this.prisma.employee.findFirst({
        where: { id: currentManagerId, tenantId },
        include: {
          department: true,
          designation: true,
          businessUnit: true,
          region: true,
          team: true
        }
      });

      if (!manager) break;

      chain.push({
        id: manager.id,
        employeeCode: manager.employeeCode,
        fullName: manager.fullName,
        email: manager.email,
        status: manager.status,
        department: manager.department,
        designation: manager.designation,
        businessUnit: manager.businessUnit,
        region: manager.region,
        team: manager.team,
        managerEmployeeId: manager.managerEmployeeId,
        level: currentLevel
      });

      currentManagerId = manager.managerEmployeeId;
      currentLevel += 1;
      if (currentLevel > 50) break; // Safeguard against deep circular structures
    }

    return chain;
  }

  async assignReportingManager(
    tenantId: string,
    input: AssignReportingManagerDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const employeeId = input.employeeId;
    const managerId = input.managerId ?? input.managerEmployeeId ?? null;

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId }
    });

    if (!employee) {
      throw new NotFoundException("Employee not found.");
    }

    if (managerId) {
      if (managerId === employeeId) {
        throw new BadRequestException("An employee cannot be assigned as their own manager.");
      }

      const manager = await this.prisma.employee.findFirst({
        where: { id: managerId, tenantId }
      });

      if (!manager) {
        throw new NotFoundException("Designated manager does not exist in this tenant.");
      }

      // Check circular reporting: climb up from managerId
      let currentCheckId: string | null = manager.managerEmployeeId;
      const visited = new Set<string>([employeeId, managerId]);

      while (currentCheckId) {
        if (currentCheckId === employeeId) {
          throw new BadRequestException("Circular reporting chain detected. Cannot assign this manager.");
        }
        if (visited.has(currentCheckId)) break;
        visited.add(currentCheckId);

        const ancestor = await this.prisma.employee.findFirst({
          where: { id: currentCheckId, tenantId },
          select: { managerEmployeeId: true }
        });
        currentCheckId = ancestor?.managerEmployeeId ?? null;
      }
    }

    const before = { managerEmployeeId: employee.managerEmployeeId };

    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        managerEmployeeId: managerId
      },
      include: {
        department: true,
        designation: true,
        businessUnit: true,
        region: true,
        team: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.reporting_manager.assigned",
      resourceType: "employee",
      resourceId: employeeId,
      before: this.auditJson(before),
      after: this.auditJson({ managerEmployeeId: managerId })
    });

    return updated;
  }

  async assignEmployeeOrg(
    tenantId: string,
    employeeId: string,
    input: AssignEmployeeOrgDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId }
    });

    if (!employee) {
      throw new NotFoundException("Employee not found.");
    }

    if (input.businessUnitId) {
      const bu = await this.prisma.businessUnit.findFirst({
        where: { id: input.businessUnitId, tenantId }
      });
      if (!bu) {
        throw new NotFoundException("Business unit not found.");
      }
    }

    if (input.regionId) {
      const region = await this.prisma.region.findFirst({
        where: { id: input.regionId, tenantId }
      });
      if (!region) {
        throw new NotFoundException("Region not found.");
      }
    }

    if (input.teamId) {
      const team = await this.prisma.team.findFirst({
        where: { id: input.teamId, tenantId }
      });
      if (!team) {
        throw new NotFoundException("Team not found.");
      }
    }

    const before = {
      businessUnitId: employee.businessUnitId,
      regionId: employee.regionId,
      teamId: employee.teamId
    };

    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        ...(input.businessUnitId !== undefined ? { businessUnitId: input.businessUnitId } : {}),
        ...(input.regionId !== undefined ? { regionId: input.regionId } : {}),
        ...(input.teamId !== undefined ? { teamId: input.teamId } : {})
      },
      include: {
        department: true,
        designation: true,
        businessUnit: true,
        region: true,
        team: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "organization.employee_org.assigned",
      resourceType: "employee",
      resourceId: employeeId,
      before: this.auditJson(before),
      after: this.auditJson(input)
    });

    return updated;
  }
}
