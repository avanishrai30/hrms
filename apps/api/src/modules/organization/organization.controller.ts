import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  assignEmployeeOrgSchema,
  assignReportingManagerSchema,
  createBusinessUnitSchema,
  createRegionSchema,
  createTeamSchema,
  organizationFilterSchema,
  updateBusinessUnitSchema,
  updateRegionSchema,
  updateTeamSchema,
  type AssignEmployeeOrgDto,
  type AssignReportingManagerDto,
  type CreateBusinessUnitDto,
  type CreateRegionDto,
  type CreateTeamDto,
  type OrganizationFilterDto,
  type UpdateBusinessUnitDto,
  type UpdateRegionDto,
  type UpdateTeamDto
} from "./organization.schemas.js";
import { OrganizationService } from "./organization.service.js";

@Controller("organization")
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ==================== BUSINESS UNITS ====================

  @Get("business-units")
  @RequirePermissions("organization.view")
  listBusinessUnits(
    @Query(new ZodValidationPipe(organizationFilterSchema)) query: OrganizationFilterDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.listBusinessUnits(tenant.tenantId, query);
  }

  @Post("business-units")
  @RequirePermissions("organization.manage")
  createBusinessUnit(
    @Body(new ZodValidationPipe(createBusinessUnitSchema)) body: CreateBusinessUnitDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.createBusinessUnit(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("business-units/:id")
  @RequirePermissions("organization.view")
  getBusinessUnit(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.getBusinessUnit(tenant.tenantId, id);
  }

  @Patch("business-units/:id")
  @RequirePermissions("organization.manage")
  updateBusinessUnit(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateBusinessUnitSchema)) body: UpdateBusinessUnitDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.updateBusinessUnit(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }

  @Delete("business-units/:id")
  @RequirePermissions("organization.manage")
  deleteBusinessUnit(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.deleteBusinessUnit(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  // ==================== REGIONS ====================

  @Get("regions")
  @RequirePermissions("organization.view")
  listRegions(
    @Query(new ZodValidationPipe(organizationFilterSchema)) query: OrganizationFilterDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.listRegions(tenant.tenantId, query);
  }

  @Post("regions")
  @RequirePermissions("organization.manage")
  createRegion(
    @Body(new ZodValidationPipe(createRegionSchema)) body: CreateRegionDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.createRegion(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("regions/:id")
  @RequirePermissions("organization.view")
  getRegion(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.getRegion(tenant.tenantId, id);
  }

  @Patch("regions/:id")
  @RequirePermissions("organization.manage")
  updateRegion(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateRegionSchema)) body: UpdateRegionDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.updateRegion(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }

  @Delete("regions/:id")
  @RequirePermissions("organization.manage")
  deleteRegion(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.deleteRegion(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  // ==================== TEAMS ====================

  @Get("teams")
  @RequirePermissions("organization.view")
  listTeams(
    @Query(new ZodValidationPipe(organizationFilterSchema)) query: OrganizationFilterDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.listTeams(tenant.tenantId, query);
  }

  @Post("teams")
  @RequirePermissions("organization.manage")
  createTeam(
    @Body(new ZodValidationPipe(createTeamSchema)) body: CreateTeamDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.createTeam(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("teams/:id")
  @RequirePermissions("organization.view")
  getTeam(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.getTeam(tenant.tenantId, id);
  }

  @Patch("teams/:id")
  @RequirePermissions("organization.manage")
  updateTeam(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTeamSchema)) body: UpdateTeamDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.updateTeam(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }

  @Delete("teams/:id")
  @RequirePermissions("organization.manage")
  deleteTeam(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.deleteTeam(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  // ==================== TREE & REPORTING ====================

  @Get("tree")
  @RequirePermissions("organization.view")
  getOrgTree(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.getOrgTree(tenant.tenantId);
  }

  @Get("reporting-chain/:employeeId")
  @RequirePermissions("organization.view")
  getReportingChain(@Param("employeeId") employeeId: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.organizationService.getReportingChain(tenant.tenantId, employeeId);
  }

  @Put("reporting-manager")
  @RequirePermissions("organization.manage")
  assignReportingManager(
    @Body(new ZodValidationPipe(assignReportingManagerSchema)) body: AssignReportingManagerDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.assignReportingManager(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Put("employees/:employeeId/assignment")
  @RequirePermissions("organization.manage")
  assignEmployeeOrg(
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(assignEmployeeOrgSchema)) body: AssignEmployeeOrgDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.organizationService.assignEmployeeOrg(tenant.tenantId, employeeId, body, tenant.userId, tenant.membershipId);
  }
}
