import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  addPayrollAdjustmentSchema,
  approvePayrollRunSchema,
  createPayrollRunSchema,
  lockPayrollRunSchema,
  payrollFilterSchema
} from "./payroll.schemas.js";
import { PayrollService } from "./payroll.service.js";

@Controller("api/v1/payroll")
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post("runs")
  @RequirePermissions("payroll.generate")
  async generatePayrollRun(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createPayrollRunSchema.parse(body);
    return this.payrollService.generatePayrollRun(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("runs")
  @RequirePermissions("payroll.view")
  async listPayrollRuns(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = payrollFilterSchema.parse(query);
    return this.payrollService.listPayrollRuns(tenant.tenantId, parsed);
  }

  @Get("runs/latest")
  @RequirePermissions("payroll.view")
  async getLatestPayrollRun(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getLatestPayrollRun(tenant.tenantId);
  }

  @Get("runs/:id")
  @RequirePermissions("payroll.view")
  async getPayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getPayrollRun(tenant.tenantId, id);
  }

  @Post("runs/:id/recalculate")
  @RequirePermissions("payroll.generate")
  async recalculatePayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.recalculatePayrollRun(
      tenant.tenantId,
      id,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("runs/:id/adjustments")
  @RequirePermissions("payroll.generate")
  async addAdjustment(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = addPayrollAdjustmentSchema.parse(body);
    return this.payrollService.addAdjustment(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Delete("runs/:id/adjustments/:adjustmentId")
  @RequirePermissions("payroll.generate")
  async removeAdjustment(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Param("adjustmentId") adjustmentId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.removeAdjustment(
      tenant.tenantId,
      id,
      adjustmentId,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("runs/:id/approve")
  @RequirePermissions("payroll.approve")
  async approvePayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = approvePayrollRunSchema.parse(body);
    const primaryRole = tenant.roles[0] ?? "HR_ADMIN";
    return this.payrollService.approvePayrollRun(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      primaryRole,
      tenant.membershipId
    );
  }

  @Post("runs/:id/lock")
  @RequirePermissions("payroll.lock")
  async lockPayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = lockPayrollRunSchema.parse(body);
    const primaryRole = tenant.roles[0] ?? "TENANT_ADMIN";
    return this.payrollService.lockPayrollRun(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      primaryRole,
      tenant.membershipId
    );
  }

  @Post("runs/:id/cancel")
  @RequirePermissions("payroll.generate")
  async cancelPayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.cancelPayrollRun(
      tenant.tenantId,
      id,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("employees/:payrollRunEmployeeId")
  @RequirePermissions("payroll.view")
  async getEmployeePayroll(
    @Req() req: AuthenticatedRequest,
    @Param("payrollRunEmployeeId") payrollRunEmployeeId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getEmployeePayroll(tenant.tenantId, payrollRunEmployeeId);
  }

  @Get("me")
  @RequirePermissions("payroll.view")
  async getMyPayroll(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    if (!tenant.userId) {
      throw new BadRequestException("User ID required.");
    }
    return this.payrollService.getMyPayroll(tenant.tenantId, tenant.userId);
  }

  @Get("audit")
  @RequirePermissions("payroll.audit")
  async getPayrollAudit(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getPayrollAudit(
      tenant.tenantId,
      limit ? parseInt(limit, 10) : 50
    );
  }
}
