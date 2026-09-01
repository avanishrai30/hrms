import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res
} from "@nestjs/common";
import { type Response } from "express";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  distributionFilterSchema,
  distributePayslipsSchema,
  payslipFilterSchema
} from "./payslips.schemas.js";
import { PayslipsService } from "./payslips.service.js";

@Controller("api/v1/payslips")
export class PayslipsController {
  constructor(private readonly payslipsService: PayslipsService) {}

  @Post("generate/run/:payrollRunId")
  @RequirePermissions("payslip.generate")
  async generatePayslipsForRun(
    @Req() req: AuthenticatedRequest,
    @Param("payrollRunId") payrollRunId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payslipsService.generatePayslipsForRun(
      tenant.tenantId,
      payrollRunId,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("generate/employee/:payrollRunEmployeeId")
  @RequirePermissions("payslip.generate")
  async generateEmployeePayslip(
    @Req() req: AuthenticatedRequest,
    @Param("payrollRunEmployeeId") payrollRunEmployeeId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payslipsService.generateEmployeePayslip(
      tenant.tenantId,
      payrollRunEmployeeId,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("distribute")
  @RequirePermissions("payslip.distribute")
  async distributePayslips(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = distributePayslipsSchema.parse(body);
    return this.payslipsService.distributePayslips(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get()
  @RequirePermissions("payslip.view")
  async listPayslips(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = payslipFilterSchema.parse(query);
    return this.payslipsService.listPayslips(tenant.tenantId, parsed);
  }

  @Get("me")
  @RequirePermissions("payslip.view")
  async getMyPayslips(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    if (!tenant.userId) {
      throw new BadRequestException("User ID is required.");
    }
    return this.payslipsService.getMyPayslips(tenant.tenantId, tenant.userId);
  }

  @Get("distributions")
  @RequirePermissions("payslip.distribute")
  async listDistributions(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = distributionFilterSchema.parse(query);
    return this.payslipsService.listDistributions(tenant.tenantId, parsed);
  }

  @Get("audit")
  @RequirePermissions("payslip.audit")
  async getPayslipAudit(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payslipsService.getPayslipAudit(
      tenant.tenantId,
      limit ? parseInt(limit, 10) : 50
    );
  }

  @Get(":id")
  @RequirePermissions("payslip.view")
  async viewPayslip(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payslipsService.viewPayslip(
      tenant.tenantId,
      id,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get(":id/download")
  @RequirePermissions("payslip.view")
  @Header("Content-Type", "application/pdf")
  async downloadPayslip(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    const tenant = requireTenantContext(req);
    const fileData = await this.payslipsService.downloadPayslip(
      tenant.tenantId,
      id,
      tenant.userId,
      tenant.membershipId
    );

    res.set({
      "Content-Type": fileData.contentType,
      "Content-Disposition": `attachment; filename="${fileData.filename}"`,
      "Content-Length": fileData.buffer.length
    });

    res.end(fileData.buffer);
  }
}
