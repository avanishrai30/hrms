import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res
} from "@nestjs/common";
import { type ReportCategory } from "@prisma/client";
import type { Response } from "express";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  createDashboardSchema,
  createReportDefinitionSchema,
  createReportScheduleSchema,
  createSavedReportSchema,
  executeReportSchema,
  exportReportSchema,
  saveWidgetsSchema,
  updateDashboardSchema,
  updateReportDefinitionSchema,
  updateSavedReportSchema
} from "./analytics.schemas.js";
import { AnalyticsService } from "./analytics.service.js";

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ==================== CROSS-DOMAIN ANALYTICS ====================

  @Get(["analytics/executive", "analytics/overview"])
  @RequirePermissions("analytics.view")
  async getExecutiveAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getExecutiveAnalytics(tenant.tenantId);
  }

  @Get("analytics/workforce")
  @RequirePermissions("analytics.view")
  async getWorkforceAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getWorkforceAnalytics(tenant.tenantId);
  }

  @Get("analytics/attendance")
  @RequirePermissions("analytics.view")
  async getAttendanceAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getAttendanceAnalytics(tenant.tenantId);
  }

  @Get(["analytics/leave", "analytics/leaves"])
  @RequirePermissions("analytics.view")
  async getLeaveAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getLeaveAnalytics(tenant.tenantId);
  }

  @Get("analytics/payroll")
  @RequirePermissions("payroll.analytics")
  async getPayrollAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getPayrollAnalytics(tenant.tenantId);
  }

  @Get("analytics/compliance")
  @RequirePermissions("analytics.view")
  async getComplianceAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getComplianceAnalytics(tenant.tenantId);
  }

  @Get("analytics/face")
  @RequirePermissions("analytics.view")
  async getFaceAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getFaceAnalytics(tenant.tenantId);
  }

  @Get("analytics/organization")
  @RequirePermissions("analytics.view")
  async getOrganizationAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getOrganizationAnalytics(tenant.tenantId);
  }

  // ==================== REPORT DEFINITIONS & SAVED REPORTS ====================

  @Get(["reports", "reports/definitions", "analytics/reports/definitions"])
  @RequirePermissions("reports.view")
  async listDefinitions(
    @Req() req: AuthenticatedRequest,
    @Query("category") category?: ReportCategory
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.listDefinitions(tenant.tenantId, category);
  }

  @Post(["reports", "reports/definitions", "analytics/reports/definitions"])
  @RequirePermissions("reports.create")
  async createDefinition(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createReportDefinitionSchema.parse(body);
    return this.analyticsService.createDefinition(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Get(["reports/:id", "reports/definitions/:id"])
  @RequirePermissions("reports.view")
  async getDefinition(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getDefinition(tenant.tenantId, id);
  }

  @Put(["reports/:id", "reports/definitions/:id"])
  @RequirePermissions("reports.create")
  async updateDefinition(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = updateReportDefinitionSchema.parse(body);
    return this.analyticsService.updateDefinition(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId
    );
  }

  @Get(["reports/saved", "analytics/reports/saved"])
  @RequirePermissions("reports.view")
  async listSavedReports(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.listSavedReports(tenant.tenantId);
  }

  @Post(["reports/saved", "analytics/reports/saved"])
  @RequirePermissions("reports.create")
  async createSavedReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createSavedReportSchema.parse(body);
    return this.analyticsService.createSavedReport(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Get("reports/saved/:id")
  @RequirePermissions("reports.view")
  async getSavedReport(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getSavedReport(tenant.tenantId, id);
  }

  @Put("reports/saved/:id")
  @RequirePermissions("reports.create")
  async updateSavedReport(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = updateSavedReportSchema.parse(body);
    return this.analyticsService.updateSavedReport(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId
    );
  }

  @Delete("reports/saved/:id")
  @RequirePermissions("reports.create")
  async deleteSavedReport(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.deleteSavedReport(
      tenant.tenantId,
      id,
      tenant.userId
    );
  }

  // ==================== REPORT EXECUTION & EXPORT ====================

  @Post(["reports/execute", "analytics/reports/execute"])
  @RequirePermissions("reports.view")
  async executeReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = executeReportSchema.parse(body);
    return this.analyticsService.executeReport(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Post(["reports/export", "analytics/reports/export"])
  @RequirePermissions("reports.export")
  async exportReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown,
    @Res() res: Response
  ) {
    const tenant = requireTenantContext(req);
    const parsed = exportReportSchema.parse(body);
    const result = await this.analyticsService.exportReport(
      tenant.tenantId,
      parsed,
      tenant.userId
    );

    if (result.isAsync) {
      return res.json({
        message: "Report export queued for background generation.",
        filename: result.filename,
        isAsync: true,
        jobId: result.jobId
      });
    }

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.setHeader("Content-Length", result.buffer.length);
    res.end(result.buffer);
  }

  // ==================== REPORT SCHEDULES ====================

  @Get(["reports/schedules", "analytics/reports/schedules"])
  @RequirePermissions("reports.schedule")
  async listSchedules(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.listSchedules(tenant.tenantId);
  }

  @Post(["reports/schedule", "reports/schedules", "analytics/reports/schedules"])
  @RequirePermissions("reports.schedule")
  async createSchedule(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createReportScheduleSchema.parse(body);
    return this.analyticsService.createSchedule(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Get("reports/schedules/:id")
  @RequirePermissions("reports.schedule")
  async getSchedule(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getSchedule(tenant.tenantId, id);
  }

  @Post(["reports/schedules/:id/run", "analytics/reports/schedules/:id/run"])
  @RequirePermissions("reports.schedule")
  async triggerScheduleRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.triggerScheduleRun(
      tenant.tenantId,
      id,
      tenant.userId
    );
  }

  // ==================== DASHBOARDS & WIDGETS ====================

  @Get(["dashboards", "analytics/dashboards"])
  @RequirePermissions("dashboard.view")
  async listDashboards(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.listDashboards(tenant.tenantId);
  }

  @Post(["dashboards", "analytics/dashboards"])
  @RequirePermissions("dashboard.manage")
  async createDashboard(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createDashboardSchema.parse(body);
    return this.analyticsService.createDashboard(
      tenant.tenantId,
      parsed,
      tenant.userId
    );
  }

  @Get(["dashboards/widgets", "widgets", "analytics/widgets"])
  @RequirePermissions("dashboard.view")
  async getWidgets(
    @Req() req: AuthenticatedRequest,
    @Query("dashboardId") dashboardId?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getWidgets(tenant.tenantId, tenant.userId, dashboardId);
  }

  @Get("dashboards/templates")
  @RequirePermissions("dashboard.view")
  async getDashboardTemplates() {
    return this.analyticsService.getDashboardTemplates();
  }

  @Get(["dashboards/:id", "analytics/dashboards/:id"])
  @RequirePermissions("dashboard.view")
  async getDashboard(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getDashboard(tenant.tenantId, id);
  }

  @Put(["dashboards/:id", "analytics/dashboards/:id"])
  @RequirePermissions("dashboard.manage")
  async updateDashboard(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = updateDashboardSchema.parse(body);
    return this.analyticsService.updateDashboard(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId
    );
  }

  @Delete(["dashboards/:id", "analytics/dashboards/:id"])
  @RequirePermissions("dashboard.manage")
  async deleteDashboard(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.deleteDashboard(
      tenant.tenantId,
      id,
      tenant.userId
    );
  }

  @Put(["widgets", "analytics/widgets"])
  @RequirePermissions("analytics.manage")
  async saveWidgets(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = saveWidgetsSchema.parse(body);
    return this.analyticsService.saveWidgets(
      tenant.tenantId,
      tenant.userId,
      parsed
    );
  }

  // ==================== AUDIT ====================

  @Get(["audit", "analytics/audit"])
  @RequirePermissions("reports.audit")
  async getAnalyticsAudit(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.analyticsService.getAnalyticsAudit(
      tenant.tenantId,
      limit ? parseInt(limit, 10) : 50
    );
  }
}
