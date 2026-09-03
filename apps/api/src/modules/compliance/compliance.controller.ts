import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { type ComplianceType } from "@prisma/client";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  calculatePreviewSchema,
  complianceReportFilterSchema,
  createComplianceRuleSchema,
  createRuleVersionSchema
} from "./compliance.schemas.js";
import { ComplianceService } from "./compliance.service.js";

@Controller(["compliance", "api/v1/compliance"])
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get("rules")
  @RequirePermissions("compliance.view")
  async listRules(
    @Req() req: AuthenticatedRequest,
    @Query("type") type?: ComplianceType
  ) {
    const tenant = requireTenantContext(req);
    return this.complianceService.listRules(tenant.tenantId, type);
  }

  @Post("rules")
  @RequirePermissions("compliance.manage")
  async createRule(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createComplianceRuleSchema.parse(body);
    return this.complianceService.createRule(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("rules/:id/versions")
  @RequirePermissions("compliance.manage")
  async createRuleVersion(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createRuleVersionSchema.parse(body);
    return this.complianceService.createRuleVersion(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("calculate/preview")
  @RequirePermissions("compliance.view")
  async calculatePreview(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = calculatePreviewSchema.parse(body);
    return this.complianceService.calculatePreview(tenant.tenantId, parsed);
  }

  @Get("snapshots")
  @RequirePermissions("compliance.view")
  async listSnapshots(
    @Req() req: AuthenticatedRequest,
    @Query("month") month?: string,
    @Query("year") year?: string,
    @Query("runId") runId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.complianceService.listSnapshots(
      tenant.tenantId,
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined,
      runId
    );
  }

  @Post("snapshots/freeze/:runId")
  @RequirePermissions("compliance.manage")
  async freezeComplianceSnapshotForRun(
    @Req() req: AuthenticatedRequest,
    @Param("runId") runId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.complianceService.freezeComplianceSnapshotForRun(
      tenant.tenantId,
      runId,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("reports/summary")
  @RequirePermissions("compliance.report")
  async getMonthlyComplianceSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = complianceReportFilterSchema.parse(query);
    return this.complianceService.getMonthlyComplianceSummary(
      tenant.tenantId,
      parsed.month,
      parsed.year,
      parsed.payrollRunId
    );
  }

  @Get("reports/pf")
  @RequirePermissions("compliance.report")
  async getPfSummaryReport(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = complianceReportFilterSchema.parse(query);
    return this.complianceService.getPfSummaryReport(
      tenant.tenantId,
      parsed.month,
      parsed.year,
      parsed.payrollRunId
    );
  }

  @Get("reports/esi")
  @RequirePermissions("compliance.report")
  async getEsiSummaryReport(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = complianceReportFilterSchema.parse(query);
    return this.complianceService.getEsiSummaryReport(
      tenant.tenantId,
      parsed.month,
      parsed.year,
      parsed.payrollRunId
    );
  }

  @Get("reports/pt")
  @RequirePermissions("compliance.report")
  async getPtSummaryReport(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = complianceReportFilterSchema.parse(query);
    return this.complianceService.getPtSummaryReport(
      tenant.tenantId,
      parsed.month,
      parsed.year,
      parsed.payrollRunId
    );
  }

  @Get("reports/tds")
  @RequirePermissions("compliance.report")
  async getTdsSummaryReport(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = complianceReportFilterSchema.parse(query);
    return this.complianceService.getTdsSummaryReport(
      tenant.tenantId,
      parsed.month,
      parsed.year,
      parsed.payrollRunId
    );
  }

  @Get("audit")
  @RequirePermissions("compliance.audit")
  async getComplianceAudit(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.complianceService.getComplianceAudit(
      tenant.tenantId,
      limit ? parseInt(limit, 10) : 50
    );
  }
}
