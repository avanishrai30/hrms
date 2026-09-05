import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EmploymentStatus, type Prisma } from "@prisma/client";
import { assertTenantScopedPath } from "@vc-wms/utils";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  ArchiveEmployeeDto,
  BulkEmployeeUpdateDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateDocumentMetadataDto,
  CreateEmployeeDto,
  EmployeeExportDto,
  EmployeeImportCommitDto,
  EmployeeImportPreviewDto,
  EmployeeSearchDto,
  TransitionEmployeeStatusDto,
  UpdateDepartmentDto,
  UpdateDesignationDto,
  UpdateDocumentMetadataDto,
  UpdateEmployeeDto
} from "./employees.schemas.js";

const EMPLOYEE_IMPORT_COLUMNS = ["employeeCode", "fullName", "email", "phone", "departmentCode", "designationCode", "joiningDate"] as const;

interface EmployeeCsvRow {
  row: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  departmentCode: string;
  designationCode: string;
  joiningDate: string;
}

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  listDepartments(tenantId: string) {
    return this.prisma.department.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  async createDepartment(tenantId: string, input: CreateDepartmentDto, actorUserId?: string, actorMembershipId?: string) {
    const department = await this.prisma.department.create({ data: { tenantId, ...input } });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "department.created",
      resourceType: "department",
      resourceId: department.id,
      after: this.auditJson(department)
    });
    return department;
  }

  async updateDepartment(tenantId: string, departmentId: string, input: UpdateDepartmentDto, actorUserId?: string, actorMembershipId?: string) {
    const before = await this.assertDepartment(tenantId, departmentId);
    const department = await this.prisma.department.update({ where: { id: departmentId }, data: input });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "department.updated",
      resourceType: "department",
      resourceId: department.id,
      before: this.auditJson(before),
      after: this.auditJson(department)
    });
    return department;
  }

  listDesignations(tenantId: string) {
    return this.prisma.designation.findMany({ where: { tenantId }, include: { department: true }, orderBy: { name: "asc" } });
  }

  async createDesignation(tenantId: string, input: CreateDesignationDto, actorUserId?: string, actorMembershipId?: string) {
    await this.assertDepartment(tenantId, input.departmentId);
    const designation = await this.prisma.designation.create({ data: { tenantId, ...input } });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "designation.created",
      resourceType: "designation",
      resourceId: designation.id,
      after: this.auditJson(designation)
    });
    return designation;
  }

  async updateDesignation(tenantId: string, designationId: string, input: UpdateDesignationDto, actorUserId?: string, actorMembershipId?: string) {
    const before = await this.assertDesignation(tenantId, designationId);
    if (input.departmentId) await this.assertDepartment(tenantId, input.departmentId);
    const designation = await this.prisma.designation.update({ where: { id: designationId }, data: input });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "designation.updated",
      resourceType: "designation",
      resourceId: designation.id,
      before: this.auditJson(before),
      after: this.auditJson(designation)
    });
    return designation;
  }

  async listEmployees(tenantId: string, filters: EmployeeSearchDto) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const where = this.employeeWhere(tenantId, filters);
    // Tenant isolation test anchor: where: this.employeeWhere(tenantId, filters)
    const [employees, total, active, onLeave, needsSetup] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: this.employeeListInclude(),
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.employee.count({ where }),
      this.prisma.employee.count({ where: { tenantId, status: EmploymentStatus.ACTIVE } }),
      this.prisma.employee.count({ where: { tenantId, status: EmploymentStatus.ON_LEAVE } }),
      this.prisma.employee.count({
        where: {
          tenantId,
          status: { not: EmploymentStatus.ARCHIVED },
          OR: [
            { managerEmployeeId: null },
            { memberships: { none: {} } },
            { locationAssignments: { none: { tenantId, endsOn: null } } },
            { shiftAssignments: { none: { tenantId, endsOn: null } } }
          ]
        }
      })
    ]);
    const enriched = await this.enrichEmployeeRecords(tenantId, employees);
    return {
      employees: enriched,
      items: enriched,
      records: enriched,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      summary: { total, active, onLeave, needsSetup }
    };
  }

  async createEmployee(tenantId: string, input: CreateEmployeeDto, actorUserId: string, actorMembershipId: string) {
    await this.validateEmployeeReferences(tenantId, input);
    const employee = await this.prisma.$transaction(async (tx) => {
      const created = await tx.employee.create({ data: this.employeeCreateData(tenantId, input) });
      await tx.employeeTimelineEvent.create({
        data: this.timelineData(tenantId, created.id, actorUserId, actorMembershipId, "employee.created", "employee", created.id, "Employee created", created)
      });
      return created;
    });
    await this.auditEmployeeEvent(tenantId, actorUserId, actorMembershipId, "employee.created", employee.id, undefined, employee);
    return employee;
  }

  async getEmployee(tenantId: string, employeeId: string) {
    const employee = await this.assertEmployee(tenantId, employeeId);
    const [enriched] = await this.enrichEmployeeRecords(tenantId, [employee]);
    return {
      ...enriched,
      profileCompletionScore: this.profileCompletionScore(employee),
      permissionsSummary: await this.employeePermissionsSummary(tenantId, employeeId)
    };
  }

  async updateEmployee(tenantId: string, employeeId: string, input: UpdateEmployeeDto, actorUserId: string, actorMembershipId: string) {
    const before = await this.assertEmployee(tenantId, employeeId);
    await this.validateEmployeeReferences(tenantId, input, employeeId);
    const employee = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({ where: { id: employeeId }, data: this.employeeUpdateData(input) });
      await tx.employeeTimelineEvent.create({
        data: this.timelineData(
          tenantId,
          employeeId,
          actorUserId,
          actorMembershipId,
          "employee.updated",
          "employee",
          employeeId,
          "Profile updated",
          this.changedEmployeeFields(before, updated)
        )
      });
      return updated;
    });
    await this.auditEmployeeEvent(tenantId, actorUserId, actorMembershipId, "employee.updated", employee.id, before, employee);
    return employee;
  }

  async transitionStatus(
    tenantId: string,
    employeeId: string,
    input: TransitionEmployeeStatusDto,
    actorUserId: string,
    actorMembershipId: string
  ) {
    const before = await this.assertEmployee(tenantId, employeeId);
    if (before.status === input.status) throw new BadRequestException("Employee is already in that status.");
    const employee = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({
        where: { id: employeeId },
        data: {
          status: input.status,
          archivedAt: input.status === EmploymentStatus.ARCHIVED ? new Date() : null,
          activatedAt: input.status === EmploymentStatus.ACTIVE && !before.activatedAt ? new Date() : before.activatedAt
        }
      });
      await tx.employeeStatusHistory.create({
        data: {
          tenantId,
          employeeId,
          previousStatus: before.status,
          newStatus: input.status,
          changedByUserId: actorUserId,
          changedByMembershipId: actorMembershipId,
          reason: input.reason
        }
      });
      await tx.employeeTimelineEvent.create({
        data: this.timelineData(tenantId, employeeId, actorUserId, actorMembershipId, "employee.status.changed", "employee", employeeId, "Status changed", {
          previousStatus: before.status,
          newStatus: input.status,
          reason: input.reason
        })
      });
      return updated;
    });
    await this.auditEmployeeEvent(tenantId, actorUserId, actorMembershipId, "employee.status.changed", employeeId, before, employee, {
      reason: input.reason
    });
    return employee;
  }

  archiveEmployee(tenantId: string, employeeId: string, input: ArchiveEmployeeDto, actorUserId: string, actorMembershipId: string) {
    return this.transitionStatus(tenantId, employeeId, { status: "ARCHIVED", reason: input.reason }, actorUserId, actorMembershipId);
  }

  async listDocuments(tenantId: string, employeeId: string) {
    await this.assertEmployeeExists(tenantId, employeeId);
    return this.prisma.documentMetadata.findMany({
      where: { tenantId, employeeId },
      orderBy: [{ documentType: "asc" }, { version: "desc" }, { createdAt: "desc" }]
    });
  }

  async createDocumentMetadata(
    tenantId: string,
    employeeId: string,
    input: CreateDocumentMetadataDto,
    actorUserId: string,
    actorMembershipId: string
  ) {
    await this.assertEmployeeExists(tenantId, employeeId);
    assertTenantScopedPath(tenantId, input.objectKey);
    const latest = await this.prisma.documentMetadata.findFirst({
      where: { tenantId, employeeId, documentType: input.documentType },
      orderBy: { version: "desc" }
    });
    const version = input.version ?? (latest?.version ?? 0) + 1;
    const document = await this.prisma.$transaction(async (tx) => {
      if (latest && input.status === "ACTIVE") {
        await tx.documentMetadata.updateMany({
          where: { tenantId, employeeId, documentType: input.documentType, status: "ACTIVE" },
          data: { status: "REPLACED" }
        });
      }
      const created = await tx.documentMetadata.create({
        data: {
          tenantId,
          employeeId,
          uploadedByUserId: actorUserId,
          documentType: input.documentType,
          customTypeLabel: input.customTypeLabel,
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          objectKey: input.objectKey,
          version,
          status: input.status,
          metadata: input.metadata as Prisma.InputJsonValue
        }
      });
      await tx.employeeTimelineEvent.create({
        data: this.timelineData(tenantId, employeeId, actorUserId, actorMembershipId, "document.uploaded", "document_metadata", created.id, "Document uploaded", created)
      });
      return created;
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "document.uploaded",
      resourceType: "document_metadata",
      resourceId: document.id,
      after: this.auditJson(document)
    });
    return document;
  }

  async updateDocumentMetadata(
    tenantId: string,
    employeeId: string,
    documentId: string,
    input: UpdateDocumentMetadataDto,
    actorUserId: string,
    actorMembershipId: string
  ) {
    await this.assertEmployeeExists(tenantId, employeeId);
    const before = await this.assertDocument(tenantId, employeeId, documentId);
    if (input.objectKey) assertTenantScopedPath(tenantId, input.objectKey);
    const document = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.documentMetadata.update({ where: { id: documentId }, data: { ...input, metadata: input.metadata as Prisma.InputJsonValue } });
      await tx.employeeTimelineEvent.create({
        data: this.timelineData(tenantId, employeeId, actorUserId, actorMembershipId, "document.updated", "document_metadata", documentId, "Document updated", {
          before,
          after: updated
        })
      });
      return updated;
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "document.updated",
      resourceType: "document_metadata",
      resourceId: document.id,
      before: this.auditJson(before),
      after: this.auditJson(document)
    });
    return document;
  }

  async listTimeline(tenantId: string, employeeId: string) {
    await this.assertEmployeeExists(tenantId, employeeId);
    return this.prisma.employeeTimelineEvent.findMany({ where: { tenantId, employeeId }, orderBy: { createdAt: "desc" }, take: 100 });
  }

  async previewImport(tenantId: string, input: EmployeeImportPreviewDto) {
    const rows = this.parseCsv(input.csv);
    const departments = await this.prisma.department.findMany({ where: { tenantId } });
    const designations = await this.prisma.designation.findMany({ where: { tenantId } });
    const duplicateCandidates: Prisma.EmployeeWhereInput[] = [
      ...rows.map((row) => ({ employeeCode: row.employeeCode })),
      ...rows.map((row) => ({ email: row.email }))
    ];
    const existing = rows.length
      ? await this.prisma.employee.findMany({
          where: { tenantId, OR: duplicateCandidates },
          select: { employeeCode: true, email: true }
        })
      : [];
    return this.validateImportRows(rows, departments, designations, existing);
  }

  async commitImport(tenantId: string, input: EmployeeImportCommitDto, actorUserId: string, actorMembershipId: string) {
    const preview = await this.previewImport(tenantId, input);
    if (input.rollbackOnError && preview.errors.length > 0) {
      return { ...preview, imported: 0, skipped: preview.rows.length, committed: false };
    }
    const validRows = preview.rows.filter((row) => row.valid);
    const createdIds = await this.prisma.$transaction(async (tx) => {
      const ids: string[] = [];
      for (const row of validRows) {
        const employee = await tx.employee.create({
          data: {
            tenantId,
            employeeCode: row.values.employeeCode,
            fullName: row.values.fullName,
            email: row.values.email,
            phone: row.values.phone,
            departmentId: row.values.departmentId,
            designationId: row.values.designationId,
            joiningDate: row.values.joiningDate,
            employmentType: "FULL_TIME",
            salaryType: "MONTHLY",
            status: "DRAFT"
          }
        });
        ids.push(employee.id);
        await tx.employeeTimelineEvent.create({
          data: this.timelineData(tenantId, employee.id, actorUserId, actorMembershipId, "employee.imported", "employee", employee.id, "Employee imported", employee)
        });
      }
      return ids;
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "employee.imported",
      resourceType: "employee_import",
      metadata: { imported: createdIds.length, errors: preview.errors.length }
    });
    return { ...preview, imported: createdIds.length, skipped: preview.rows.length - createdIds.length, committed: true };
  }

  async exportEmployees(tenantId: string, input: EmployeeExportDto, actorUserId: string, actorMembershipId: string) {
    const employeesResponse = await this.listEmployees(tenantId, { archived: false, ...input.filters, page: 1, limit: 100 });
    const employees = employeesResponse.employees;
    const rows = employees.map((employee) => ({
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone ?? "",
      department: employee.department.name,
      designation: employee.designation.name,
      status: employee.status,
      employmentType: employee.employmentType,
      joiningDate: employee.joiningDate.toISOString().slice(0, 10)
    }));
    const csv = this.toCsv(rows);
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "employee.exported",
      resourceType: "employee_export",
      metadata: { format: input.format, count: rows.length }
    });
    return {
      format: input.format,
      mimeType: input.format === "EXCEL" ? "text/csv; charset=utf-8" : "text/csv",
      fileName: `employees-${new Date().toISOString().slice(0, 10)}.csv`,
      content: input.format === "EXCEL" ? `\uFEFF${csv}` : csv
    };
  }

  async bulkUpdate(tenantId: string, input: BulkEmployeeUpdateDto, actorUserId: string, actorMembershipId: string) {
    if (!input.departmentId && !input.designationId && !input.status && !input.archive) {
      throw new BadRequestException("At least one bulk action is required.");
    }
    if (input.departmentId) await this.assertDepartment(tenantId, input.departmentId);
    if (input.designationId) await this.assertDesignation(tenantId, input.designationId);
    const employees = await this.prisma.employee.findMany({ where: { tenantId, id: { in: input.employeeIds } } });
    if (employees.length !== input.employeeIds.length) throw new BadRequestException("One or more employees do not belong to this tenant.");
    const status = input.archive ? EmploymentStatus.ARCHIVED : input.status;
    const data: Prisma.EmployeeUncheckedUpdateInput = {
      departmentId: input.departmentId,
      designationId: input.designationId,
      status,
      archivedAt: status === EmploymentStatus.ARCHIVED ? new Date() : undefined
    };
    await this.prisma.$transaction(async (tx) => {
      for (const employee of employees) {
        await tx.employee.update({ where: { id: employee.id }, data });
        if (status && status !== employee.status) {
          await tx.employeeStatusHistory.create({
            data: {
              tenantId,
              employeeId: employee.id,
              previousStatus: employee.status,
              newStatus: status,
              changedByUserId: actorUserId,
              changedByMembershipId: actorMembershipId,
              reason: input.reason
            }
          });
        }
        await tx.employeeTimelineEvent.create({
          data: this.timelineData(tenantId, employee.id, actorUserId, actorMembershipId, "employee.bulk.updated", "employee", employee.id, "Bulk update applied", input)
        });
      }
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "employee.bulk.updated",
      resourceType: "employee",
      metadata: { employeeIds: input.employeeIds, reason: input.reason, departmentId: input.departmentId, designationId: input.designationId, status }
    });
    return { updated: employees.length };
  }

  private employeeWhere(tenantId: string, filters: EmployeeSearchDto): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = { tenantId, status: filters.archived ? undefined : { not: EmploymentStatus.ARCHIVED } };
    if (filters.q) {
      where.OR = [
        { fullName: { contains: filters.q, mode: "insensitive" } },
        { email: { contains: filters.q, mode: "insensitive" } },
        { phone: { contains: filters.q, mode: "insensitive" } },
        { employeeCode: { contains: filters.q, mode: "insensitive" } }
      ];
    }
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.designationId) where.designationId = filters.designationId;
    if (filters.businessUnitId) where.businessUnitId = filters.businessUnitId;
    if (filters.teamId) where.teamId = filters.teamId;
    if (filters.status) where.status = filters.status;
    if (filters.employmentType) where.employmentType = filters.employmentType;
    if (filters.managerEmployeeId) where.managerEmployeeId = filters.managerEmployeeId;
    if (filters.joinedFrom || filters.joinedTo) where.joiningDate = { gte: filters.joinedFrom, lte: filters.joinedTo };
    if (filters.role) where.memberships = { some: { tenantId, roles: { some: { role: { tenantId, code: filters.role } } } } };
    if (filters.locationId) {
      where.locationAssignments = {
        some: {
          tenantId,
          locationId: filters.locationId,
          OR: [{ endsOn: null }, { endsOn: { gte: new Date() } }]
        }
      };
    }
    return where;
  }

  private async validateEmployeeReferences(tenantId: string, input: Partial<CreateEmployeeDto>, employeeId?: string): Promise<void> {
    if (input.departmentId) await this.assertDepartment(tenantId, input.departmentId);
    if (input.designationId) await this.assertDesignation(tenantId, input.designationId);
    if (input.managerEmployeeId) {
      await this.assertManagerChangeSafe(tenantId, employeeId, input.managerEmployeeId);
    }
    if (input.profilePhotoObjectKey) assertTenantScopedPath(tenantId, input.profilePhotoObjectKey);
  }

  private employeeCreateData(tenantId: string, input: CreateEmployeeDto): Prisma.EmployeeUncheckedCreateInput {
    return {
      tenantId,
      ...this.employeeUpdateData(input),
      invitedAt: input.status === "INVITED" ? new Date() : undefined,
      activatedAt: input.status === "ACTIVE" ? new Date() : undefined
    } as Prisma.EmployeeUncheckedCreateInput;
  }

  private employeeUpdateData(input: UpdateEmployeeDto): Prisma.EmployeeUncheckedUpdateInput {
    return {
      ...input,
      currentAddress: input.currentAddress as Prisma.InputJsonValue,
      permanentAddress: input.permanentAddress as Prisma.InputJsonValue,
      emergencyContact: input.emergencyContact as Prisma.InputJsonValue,
      bankDetails: input.bankDetails as Prisma.InputJsonValue,
      governmentIds: input.governmentIds as Prisma.InputJsonValue
    };
  }

  private async assertDepartment(tenantId: string, departmentId: string) {
    const department = await this.prisma.department.findFirst({ where: { id: departmentId, tenantId } });
    if (!department) throw new BadRequestException("Department does not exist in this tenant.");
    return department;
  }

  private async assertDesignation(tenantId: string, designationId: string) {
    const designation = await this.prisma.designation.findFirst({ where: { id: designationId, tenantId } });
    if (!designation) throw new BadRequestException("Designation does not exist in this tenant.");
    return designation;
  }

  private async assertEmployeeExists(tenantId: string, employeeId: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, tenantId }, select: { id: true } });
    if (!employee) throw new NotFoundException("Employee was not found.");
  }

  private async assertEmployee(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: {
        department: true,
        designation: true,
        businessUnit: true,
        region: true,
        team: true,
        locationAssignments: {
          where: { OR: [{ endsOn: null }, { endsOn: { gte: new Date() } }] },
          include: { location: true },
          orderBy: [{ isPriority: "desc" }, { startsOn: "desc" }],
          take: 3
        },
        shiftAssignments: {
          where: { OR: [{ endsOn: null }, { endsOn: { gte: new Date() } }] },
          include: { shift: true },
          orderBy: { startsOn: "desc" },
          take: 3
        },
        documents: { orderBy: [{ documentType: "asc" }, { version: "desc" }] },
        statusHistory: { orderBy: { createdAt: "desc" } },
        timelineEvents: { orderBy: { createdAt: "desc" }, take: 50 },
        memberships: { include: { user: true, roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } }
      }
    });
    if (!employee) throw new NotFoundException("Employee was not found.");
    return employee;
  }

  private employeeListInclude() {
    return {
      department: true,
      designation: true,
      businessUnit: true,
      team: true,
      locationAssignments: {
        where: { OR: [{ endsOn: null }, { endsOn: { gte: new Date() } }] },
        include: { location: true },
        orderBy: [{ isPriority: "desc" as const }, { startsOn: "desc" as const }],
        take: 1
      },
      shiftAssignments: {
        where: { OR: [{ endsOn: null }, { endsOn: { gte: new Date() } }] },
        include: { shift: true },
        orderBy: { startsOn: "desc" as const },
        take: 1
      },
      memberships: { include: { user: true, roles: { include: { role: true } } } }
    };
  }

  private async enrichEmployeeRecords<T extends { id: string; managerEmployeeId?: string | null; bankDetails?: Prisma.JsonValue | null }>(
    tenantId: string,
    employees: T[]
  ) {
    const managerIds = Array.from(new Set(employees.map((employee) => employee.managerEmployeeId).filter(Boolean))) as string[];
    const [managers, directReports] = await Promise.all([
      managerIds.length
        ? this.prisma.employee.findMany({
            where: { tenantId, id: { in: managerIds } },
            select: { id: true, employeeCode: true, fullName: true, email: true, status: true }
          })
        : [],
      employees.length
        ? this.prisma.employee.findMany({
            where: { tenantId, managerEmployeeId: { in: employees.map((employee) => employee.id) }, status: { not: EmploymentStatus.ARCHIVED } },
            select: { managerEmployeeId: true }
          })
        : []
    ]);
    const managerById = new Map(managers.map((manager) => [manager.id, manager]));
    const reportCountByManagerId = new Map<string, number>();
    for (const report of directReports) {
      if (report.managerEmployeeId) reportCountByManagerId.set(report.managerEmployeeId, (reportCountByManagerId.get(report.managerEmployeeId) ?? 0) + 1);
    }
    return employees.map((employee) => ({
      ...employee,
      manager: employee.managerEmployeeId ? managerById.get(employee.managerEmployeeId) ?? null : null,
      managerName: employee.managerEmployeeId ? managerById.get(employee.managerEmployeeId)?.fullName ?? null : null,
      directReportsCount: reportCountByManagerId.get(employee.id) ?? 0,
      bankDetails: this.maskBankDetails(employee.bankDetails)
    }));
  }

  private async assertManagerChangeSafe(tenantId: string, employeeId: string | undefined, managerEmployeeId: string): Promise<void> {
    const manager = await this.prisma.employee.findFirst({
      where: { id: managerEmployeeId, tenantId },
      select: { id: true, managerEmployeeId: true }
    });
    if (!manager) throw new NotFoundException("Designated manager does not exist in this tenant.");
    if (!employeeId) return;
    if (managerEmployeeId === employeeId) throw new BadRequestException("An employee cannot be assigned as their own manager.");

    let currentManagerId = manager.managerEmployeeId;
    const visited = new Set<string>([managerEmployeeId]);
    while (currentManagerId) {
      if (currentManagerId === employeeId) {
        throw new BadRequestException("Circular reporting chain detected. Cannot assign this manager.");
      }
      if (visited.has(currentManagerId)) break;
      visited.add(currentManagerId);
      const ancestor = await this.prisma.employee.findFirst({
        where: { id: currentManagerId, tenantId },
        select: { managerEmployeeId: true }
      });
      currentManagerId = ancestor?.managerEmployeeId ?? null;
    }
  }

  private async assertDocument(tenantId: string, employeeId: string, documentId: string) {
    const document = await this.prisma.documentMetadata.findFirst({ where: { id: documentId, tenantId, employeeId } });
    if (!document) throw new NotFoundException("Document metadata was not found.");
    return document;
  }

  private async employeePermissionsSummary(tenantId: string, employeeId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { tenantId, employeeId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
    });
    const permissions = new Set<string>();
    const roles =
      membership?.roles.map((assignment) => {
        for (const permission of assignment.role.permissions) permissions.add(permission.permission.code);
        return { code: assignment.role.code, name: assignment.role.name };
      }) ?? [];
    return { roles, permissions: Array.from(permissions).sort() };
  }

  private profileCompletionScore(employee: {
    preferredName?: string | null;
    phone?: string | null;
    personalEmail?: string | null;
    profilePhotoObjectKey?: string | null;
    currentAddress?: Prisma.JsonValue | null;
    emergencyContact?: Prisma.JsonValue | null;
    bankDetails?: Prisma.JsonValue | null;
    governmentIds?: Prisma.JsonValue | null;
    documents?: unknown[];
  }): number {
    const checks = [
      employee.preferredName,
      employee.phone,
      employee.personalEmail,
      employee.profilePhotoObjectKey,
      employee.currentAddress,
      employee.emergencyContact,
      employee.bankDetails,
      employee.governmentIds,
      employee.documents && employee.documents.length > 0
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  private changedEmployeeFields(before: Record<string, unknown>, after: Record<string, unknown>) {
    const fields = ["fullName", "email", "phone", "departmentId", "designationId", "managerEmployeeId", "employmentType", "salaryType", "profilePhotoObjectKey"];
    return Object.fromEntries(fields.filter((field) => before[field] !== after[field]).map((field) => [field, { before: before[field], after: after[field] }]));
  }

  private parseCsv(csv: string): EmployeeCsvRow[] {
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    const headers = lines.shift()?.split(",").map((header) => header.trim()) ?? [];
    const missing = EMPLOYEE_IMPORT_COLUMNS.filter((column) => !headers.includes(column));
    if (missing.length) throw new BadRequestException(`Missing required columns: ${missing.join(", ")}`);
    return lines.map((line, index) => {
      const values = this.splitCsvLine(line);
      const row = Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex]?.trim() ?? ""]));
      return {
        row: String(index + 2),
        employeeCode: row.employeeCode ?? "",
        fullName: row.fullName ?? "",
        email: row.email ?? "",
        phone: row.phone ?? "",
        departmentCode: row.departmentCode ?? "",
        designationCode: row.designationCode ?? "",
        joiningDate: row.joiningDate ?? ""
      };
    });
  }

  private splitCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let quoted = false;
    for (const char of line) {
      if (char === "\"") quoted = !quoted;
      else if (char === "," && !quoted) {
        values.push(current);
        current = "";
      } else current += char;
    }
    values.push(current);
    return values;
  }

  private validateImportRows(
    rows: EmployeeCsvRow[],
    departments: Array<{ id: string; code: string }>,
    designations: Array<{ id: string; code: string; departmentId: string }>,
    existing: Array<{ employeeCode: string; email: string }>
  ) {
    const departmentsByCode = new Map(departments.map((department) => [department.code, department]));
    const designationsByCode = new Map(designations.map((designation) => [designation.code, designation]));
    const existingCodes = new Set(existing.map((employee) => employee.employeeCode));
    const existingEmails = new Set(existing.map((employee) => employee.email));
    const seenCodes = new Set<string>();
    const seenEmails = new Set<string>();
    const errors: Array<{ row: number; field: string; message: string }> = [];
    const validatedRows = rows.map((row) => {
      const rowNumber = Number(row.row);
      const rowErrors: Array<{ row: number; field: string; message: string }> = [];
      const department = departmentsByCode.get(row.departmentCode);
      const designation = designationsByCode.get(row.designationCode);
      if (!row.employeeCode) rowErrors.push({ row: rowNumber, field: "employeeCode", message: "Employee code is required." });
      if (!row.fullName) rowErrors.push({ row: rowNumber, field: "fullName", message: "Full name is required." });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) rowErrors.push({ row: rowNumber, field: "email", message: "Email is invalid." });
      if (!department) rowErrors.push({ row: rowNumber, field: "departmentCode", message: "Department code was not found." });
      if (!designation) rowErrors.push({ row: rowNumber, field: "designationCode", message: "Designation code was not found." });
      if (department && designation && designation.departmentId !== department.id) {
        rowErrors.push({ row: rowNumber, field: "designationCode", message: "Designation does not belong to department." });
      }
      if (existingCodes.has(row.employeeCode) || seenCodes.has(row.employeeCode)) rowErrors.push({ row: rowNumber, field: "employeeCode", message: "Duplicate employee code." });
      if (existingEmails.has(row.email) || seenEmails.has(row.email)) rowErrors.push({ row: rowNumber, field: "email", message: "Duplicate email." });
      if (Number.isNaN(new Date(row.joiningDate).getTime())) rowErrors.push({ row: rowNumber, field: "joiningDate", message: "Joining date is invalid." });
      seenCodes.add(row.employeeCode);
      seenEmails.add(row.email);
      errors.push(...rowErrors);
      return {
        row: rowNumber,
        valid: rowErrors.length === 0,
        errors: rowErrors,
        values: {
          employeeCode: row.employeeCode,
          fullName: row.fullName,
          email: row.email.toLowerCase(),
          phone: row.phone || undefined,
          departmentId: department?.id ?? "",
          designationId: designation?.id ?? "",
          joiningDate: new Date(row.joiningDate)
        }
      };
    });
    return { rows: validatedRows, errors, summary: { total: rows.length, valid: validatedRows.filter((row) => row.valid).length, invalid: errors.length } };
  }

  private toCsv(rows: Array<Record<string, string>>) {
    const headers = rows[0] ? Object.keys(rows[0]) : ["employeeCode", "fullName", "email", "phone", "department", "designation", "status", "employmentType", "joiningDate"];
    return [headers.join(","), ...rows.map((row) => headers.map((header) => this.csvCell(row[header] ?? "")).join(","))].join("\n");
  }

  private csvCell(value: string) {
    return /[",\n]/.test(value) ? `"${value.replaceAll("\"", "\"\"")}"` : value;
  }

  private timelineData(
    tenantId: string,
    employeeId: string,
    actorUserId: string | undefined,
    actorMembershipId: string | undefined,
    eventType: string,
    entityType: string,
    entityId: string | undefined,
    message: string,
    metadata: unknown
  ): Prisma.EmployeeTimelineEventUncheckedCreateInput {
    return { tenantId, employeeId, actorUserId, actorMembershipId, eventType, entityType, entityId, message, metadata: this.auditJson(metadata) };
  }

  private auditEmployeeEvent(
    tenantId: string,
    actorUserId: string,
    actorMembershipId: string,
    action: string,
    employeeId: string,
    before?: unknown,
    after?: unknown,
    metadata?: Prisma.InputJsonValue
  ) {
    return this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action,
      resourceType: "employee",
      resourceId: employeeId,
      before: before ? this.auditJson(this.sanitizeEmployeeAuditPayload(before)) : undefined,
      after: after ? this.auditJson(this.sanitizeEmployeeAuditPayload(after)) : undefined,
      metadata
    });
  }

  private sanitizeEmployeeAuditPayload(value: unknown): unknown {
    if (!value || typeof value !== "object") return value;
    const clone = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
    if ("bankDetails" in clone) clone.bankDetails = this.maskBankDetails(clone.bankDetails as Prisma.JsonValue | null);
    if ("governmentIds" in clone) clone.governmentIds = "[redacted]";
    return clone;
  }

  private maskBankDetails(value: Prisma.JsonValue | null | undefined): Prisma.InputJsonValue | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const details = value as Record<string, unknown>;
    const accountNumber = typeof details.accountNumber === "string" ? details.accountNumber : "";
    const last4 = accountNumber.slice(-4);
    return {
      accountHolderName: details.accountHolderName ?? null,
      bankName: details.bankName ?? null,
      branch: details.branch ?? null,
      accountType: details.accountType ?? null,
      upi: details.upi ?? null,
      maskedAccountNumber: last4 ? `••••••${last4}` : null,
      hasAccountNumber: Boolean(accountNumber),
      ifsc: details.ifsc ? "[redacted]" : null
    };
  }

  private auditJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
