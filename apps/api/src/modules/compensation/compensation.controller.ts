import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  assignEmployeeCompensationSchema,
  calculateBreakdownSchema,
  compensationFilterSchema,
  createCompensationTemplateSchema,
  createSalaryComponentSchema,
  reviseEmployeeCompensationSchema,
  updateCompensationTemplateSchema,
  updateSalaryComponentSchema
} from "./compensation.schemas.js";
import { CompensationService } from "./compensation.service.js";

@Controller(["compensation", "api/v1/compensation"])
export class CompensationController {
  constructor(
    private readonly compensationService: CompensationService,
    private readonly prisma: PrismaService
  ) {}

  // ----------------- Salary Components -----------------

  @Get("components")
  @RequirePermissions("compensation.view")
  async listComponents(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.compensationService.listComponents(tenant.tenantId);
  }

  @Post("components")
  @RequirePermissions("compensation.manage")
  async createComponent(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createSalaryComponentSchema.parse(body);
    return this.compensationService.createComponent(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Patch("components/:id")
  @RequirePermissions("compensation.manage")
  async updateComponent(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = updateSalaryComponentSchema.parse(body);
    return this.compensationService.updateComponent(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  // ----------------- Compensation Templates -----------------

  @Get("templates")
  @RequirePermissions("compensation.view")
  async listTemplates(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.compensationService.listTemplates(tenant.tenantId);
  }

  @Post("templates")
  @RequirePermissions("compensation.manage")
  async createTemplate(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createCompensationTemplateSchema.parse(body);
    return this.compensationService.createTemplate(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Patch("templates/:id")
  @RequirePermissions("compensation.manage")
  async updateTemplate(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = updateCompensationTemplateSchema.parse(body);
    return this.compensationService.updateTemplate(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  // ----------------- Calculation Preview -----------------

  @Post("preview")
  @RequirePermissions("compensation.view")
  async calculatePreview(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = calculateBreakdownSchema.parse(body);
    return this.compensationService.calculatePreview(tenant.tenantId, parsed);
  }

  // ----------------- Employee Compensation Directory -----------------

  @Get("all")
  @RequirePermissions("compensation.view")
  async listAllCompensations(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = compensationFilterSchema.parse(query);
    return this.compensationService.listAllCompensations(tenant.tenantId, parsed);
  }

  @Get("me")
  @RequirePermissions("compensation.view")
  async getMyCompensation(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    const actorUserId = tenant.userId;
    if (!actorUserId) {
      throw new BadRequestException("User ID is required.");
    }

    const employee = await this.prisma.employee.findFirst({
      where: {
        tenantId: tenant.tenantId,
        memberships: { some: { userId: actorUserId } }
      }
    });

    if (!employee) {
      throw new NotFoundException("Employee profile not linked to current user.");
    }

    return this.compensationService.getEmployeeCompensation(tenant.tenantId, employee.id);
  }

  @Get("employees/:employeeId")
  @RequirePermissions("compensation.view")
  async getEmployeeCompensation(
    @Req() req: AuthenticatedRequest,
    @Param("employeeId") employeeId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.compensationService.getEmployeeCompensation(tenant.tenantId, employeeId);
  }

  @Post("employees/:employeeId/assign")
  @RequirePermissions("compensation.manage")
  async assignCompensation(
    @Req() req: AuthenticatedRequest,
    @Param("employeeId") employeeId: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = assignEmployeeCompensationSchema.parse(body);
    return this.compensationService.assignCompensation(
      tenant.tenantId,
      employeeId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("employees/:employeeId/revise")
  @RequirePermissions("compensation.manage")
  async reviseCompensation(
    @Req() req: AuthenticatedRequest,
    @Param("employeeId") employeeId: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = reviseEmployeeCompensationSchema.parse(body);
    return this.compensationService.reviseCompensation(
      tenant.tenantId,
      employeeId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("history/:employeeId")
  @RequirePermissions("compensation.view")
  async getEmployeeHistory(
    @Req() req: AuthenticatedRequest,
    @Param("employeeId") employeeId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.compensationService.getEmployeeHistory(tenant.tenantId, employeeId);
  }

  @Get("audit")
  @RequirePermissions("compensation.audit")
  async getAuditLogs(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.compensationService.getAuditLogs(
      tenant.tenantId,
      limit ? parseInt(limit, 10) : 50
    );
  }
}
