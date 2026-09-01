import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { requireTenantContext } from "../common/tenant-context.js";
import type { AuthenticatedRequest } from "../common/request-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  archiveEmployeeSchema,
  bulkEmployeeUpdateSchema,
  createDepartmentSchema,
  createDesignationSchema,
  createDocumentMetadataSchema,
  createEmployeeSchema,
  employeeExportSchema,
  employeeImportCommitSchema,
  employeeImportPreviewSchema,
  employeeSearchSchema,
  transitionEmployeeStatusSchema,
  updateDepartmentSchema,
  updateDesignationSchema,
  updateDocumentMetadataSchema,
  updateEmployeeSchema,
  type ArchiveEmployeeDto,
  type BulkEmployeeUpdateDto,
  type CreateDepartmentDto,
  type CreateDesignationDto,
  type CreateDocumentMetadataDto,
  type CreateEmployeeDto,
  type EmployeeExportDto,
  type EmployeeImportCommitDto,
  type EmployeeImportPreviewDto,
  type EmployeeSearchDto,
  type TransitionEmployeeStatusDto,
  type UpdateDepartmentDto,
  type UpdateDesignationDto,
  type UpdateDocumentMetadataDto,
  type UpdateEmployeeDto
} from "./employees.schemas.js";
import { EmployeesService } from "./employees.service.js";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @RequirePermissions("employees.read")
  list(@Query(new ZodValidationPipe(employeeSearchSchema)) query: EmployeeSearchDto, @Req() request: AuthenticatedRequest) {
    return this.employeesService.listEmployees(requireTenantContext(request).tenantId, query);
  }

  @Post("import/preview")
  @RequirePermissions("employees.import")
  previewImport(@Body(new ZodValidationPipe(employeeImportPreviewSchema)) body: EmployeeImportPreviewDto, @Req() request: AuthenticatedRequest) {
    return this.employeesService.previewImport(requireTenantContext(request).tenantId, body);
  }

  @Post("import/commit")
  @RequirePermissions("employees.import")
  commitImport(@Body(new ZodValidationPipe(employeeImportCommitSchema)) body: EmployeeImportCommitDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.employeesService.commitImport(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Post("export")
  @RequirePermissions("employees.export")
  export(@Body(new ZodValidationPipe(employeeExportSchema)) body: EmployeeExportDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.employeesService.exportEmployees(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Post("bulk")
  @RequirePermissions("employees.bulk.update")
  bulk(@Body(new ZodValidationPipe(bulkEmployeeUpdateSchema)) body: BulkEmployeeUpdateDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.employeesService.bulkUpdate(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Post()
  @RequirePermissions("employees.create")
  create(@Body(new ZodValidationPipe(createEmployeeSchema)) body: CreateEmployeeDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.employeesService.createEmployee(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get(":employeeId")
  @RequirePermissions("employees.read")
  get(@Param("employeeId") employeeId: string, @Req() request: AuthenticatedRequest) {
    return this.employeesService.getEmployee(requireTenantContext(request).tenantId, employeeId);
  }

  @Patch(":employeeId")
  @RequirePermissions("employees.update")
  update(
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) body: UpdateEmployeeDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.employeesService.updateEmployee(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":employeeId/status")
  @RequirePermissions("employees.status.update")
  transitionStatus(
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(transitionEmployeeStatusSchema)) body: TransitionEmployeeStatusDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.employeesService.transitionStatus(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":employeeId/archive")
  @RequirePermissions("employees.archive")
  archive(
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(archiveEmployeeSchema)) body: ArchiveEmployeeDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.employeesService.archiveEmployee(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }

  @Get(":employeeId/documents")
  @RequirePermissions("documents.read")
  documents(@Param("employeeId") employeeId: string, @Req() request: AuthenticatedRequest) {
    return this.employeesService.listDocuments(requireTenantContext(request).tenantId, employeeId);
  }

  @Post(":employeeId/documents")
  @RequirePermissions("documents.metadata.create")
  createDocument(
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(createDocumentMetadataSchema)) body: CreateDocumentMetadataDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.employeesService.createDocumentMetadata(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":employeeId/documents/:documentId")
  @RequirePermissions("documents.metadata.update")
  updateDocument(
    @Param("employeeId") employeeId: string,
    @Param("documentId") documentId: string,
    @Body(new ZodValidationPipe(updateDocumentMetadataSchema)) body: UpdateDocumentMetadataDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.employeesService.updateDocumentMetadata(tenant.tenantId, employeeId, documentId, body, tenant.userId, tenant.membershipId);
  }

  @Get(":employeeId/timeline")
  @RequirePermissions("employees.read")
  timeline(@Param("employeeId") employeeId: string, @Req() request: AuthenticatedRequest) {
    return this.employeesService.listTimeline(requireTenantContext(request).tenantId, employeeId);
  }
}

@Controller("departments")
export class DepartmentsController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @RequirePermissions("departments.read")
  list(@Req() request: AuthenticatedRequest) {
    return this.employeesService.listDepartments(requireTenantContext(request).tenantId);
  }

  @Post()
  @RequirePermissions("departments.create")
  create(@Body(new ZodValidationPipe(createDepartmentSchema)) body: CreateDepartmentDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.employeesService.createDepartment(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":departmentId")
  @RequirePermissions("departments.update")
  update(
    @Param("departmentId") departmentId: string,
    @Body(new ZodValidationPipe(updateDepartmentSchema)) body: UpdateDepartmentDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.employeesService.updateDepartment(tenant.tenantId, departmentId, body, tenant.userId, tenant.membershipId);
  }
}

@Controller("designations")
export class DesignationsController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @RequirePermissions("designations.read")
  list(@Req() request: AuthenticatedRequest) {
    return this.employeesService.listDesignations(requireTenantContext(request).tenantId);
  }

  @Post()
  @RequirePermissions("designations.create")
  create(@Body(new ZodValidationPipe(createDesignationSchema)) body: CreateDesignationDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.employeesService.createDesignation(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":designationId")
  @RequirePermissions("designations.update")
  update(
    @Param("designationId") designationId: string,
    @Body(new ZodValidationPipe(updateDesignationSchema)) body: UpdateDesignationDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.employeesService.updateDesignation(tenant.tenantId, designationId, body, tenant.userId, tenant.membershipId);
  }
}
