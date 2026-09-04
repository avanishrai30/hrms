import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { type Prisma, type ReportCategory } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateDashboardDto,
  CreateReportDefinitionDto,
  CreateReportScheduleDto,
  CreateSavedReportDto,
  CustomReportConfig,
  ExecuteReportDto,
  ExportReportDto,
  ReportCategoryType,
  ReportModuleType,
  ReportFilterClause,
  ReportSortClause,
  ReportAggregation,
  SaveWidgetsDto,
  UpdateDashboardDto,
  UpdateReportDefinitionDto,
  UpdateSavedReportDto
} from "./analytics.schemas.js";
import { AnalyticsEngine } from "./engines/analytics.engine.js";
import {
  DashboardEngine,
  type DashboardWidgetConfig
} from "./engines/dashboard.engine.js";
import { ExportEngine, type ExportDataset } from "./engines/export.engine.js";
import { ReportEngine } from "./engines/report.engine.js";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly analyticsEngine: AnalyticsEngine,
    private readonly reportEngine: ReportEngine,
    private readonly dashboardEngine: DashboardEngine,
    private readonly exportEngine: ExportEngine
  ) {}

  // ----------------- Cross-Domain Analytics Calculations -----------------

  async getExecutiveAnalytics(tenantId: string) {
    return this.analyticsEngine.calculateExecutiveAnalytics(tenantId);
  }

  async getExecutiveOverview(tenantId: string) {
    // Aggregates activeEmployees, probationEmployees, presentCount, totalGross, totalNet, totalPf, totalEsi
    return this.analyticsEngine.calculateExecutiveAnalytics(tenantId);
  }

  async getWorkforceAnalytics(tenantId: string) {
    return this.analyticsEngine.calculateWorkforceAnalytics(tenantId);
  }

  async getAttendanceAnalytics(tenantId: string, options?: { days?: number }) {
    return options
      ? this.analyticsEngine.calculateAttendanceAnalytics(tenantId, options)
      : this.analyticsEngine.calculateAttendanceAnalytics(tenantId);
  }

  async getLeaveAnalytics(tenantId: string) {
    return this.analyticsEngine.calculateLeaveAnalytics(tenantId);
  }

  async getPayrollAnalytics(tenantId: string) {
    return this.analyticsEngine.calculatePayrollAnalytics(tenantId);
  }

  async getComplianceAnalytics(tenantId: string) {
    return this.analyticsEngine.calculateComplianceAnalytics(tenantId);
  }

  async getFaceAnalytics(tenantId: string) {
    return this.analyticsEngine.calculateFaceAnalytics(tenantId);
  }

  async getOrganizationAnalytics(tenantId: string) {
    return this.analyticsEngine.calculateOrganizationAnalytics(tenantId);
  }

  // ----------------- Report Definitions CRUD -----------------

  async listDefinitions(tenantId: string, category?: ReportCategoryType) {
    const count = await this.prisma.reportDefinition.count({ where: { tenantId } });
    if (count === 0) {
      await this.seedDefaultReportDefinitions(tenantId);
    }

    return this.prisma.reportDefinition.findMany({
      where: {
        tenantId,
        ...(category ? { category: category as ReportCategory } : {})
      },
      orderBy: [{ category: "asc" }, { name: "asc" }]
    });
  }

  async getDefinition(tenantId: string, id: string) {
    const def = await this.prisma.reportDefinition.findFirst({
      where: { id, tenantId }
    });
    if (!def) {
      throw new NotFoundException("Report definition not found.");
    }
    return def;
  }

  async createDefinition(tenantId: string, input: CreateReportDefinitionDto, userId: string) {
    const existing = await this.prisma.reportDefinition.findFirst({
      where: { tenantId, code: input.code }
    });
    if (existing) {
      throw new BadRequestException(`Report definition with code '${input.code}' already exists.`);
    }

    const definition = await this.prisma.reportDefinition.create({
      data: {
        tenantId,
        code: input.code,
        name: input.name,
        description: input.description,
        category: input.category as ReportCategory,
        sourceModule: input.sourceModule,
        config: input.config as unknown as Prisma.InputJsonValue,
        configurationJson: input.config as unknown as Prisma.InputJsonValue,
        isSystem: input.isSystem,
        isActive: input.isActive,
        createdById: userId
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.report_definition.created",
      resourceType: "report_definition",
      resourceId: definition.id,
      after: { code: definition.code, name: definition.name }
    });

    return definition;
  }

  async updateDefinition(tenantId: string, id: string, input: UpdateReportDefinitionDto, userId: string) {
    const def = await this.getDefinition(tenantId, id);

    const updated = await this.prisma.reportDefinition.update({
      where: { id: def.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.category ? { category: input.category as ReportCategory } : {}),
        ...(input.sourceModule ? { sourceModule: input.sourceModule } : {}),
        ...(input.config ? { config: input.config as unknown as Prisma.InputJsonValue, configurationJson: input.config as unknown as Prisma.InputJsonValue } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.report_definition.updated",
      resourceType: "report_definition",
      resourceId: updated.id,
      after: { name: updated.name }
    });

    return updated;
  }

  // ----------------- Saved Reports CRUD -----------------

  async listSavedReports(tenantId: string) {
    return this.prisma.savedReport.findMany({
      where: { tenantId },
      include: {
        reportDefinition: true,
        createdBy: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getSavedReport(tenantId: string, id: string) {
    const report = await this.prisma.savedReport.findFirst({
      where: { id, tenantId },
      include: { reportDefinition: true, createdBy: { select: { id: true, email: true } } }
    });
    if (!report) {
      throw new NotFoundException("Saved report not found.");
    }
    return report;
  }

  async createSavedReport(tenantId: string, input: CreateSavedReportDto, userId: string) {
    let reportDefinitionId = input.reportDefinitionId;

    if (!reportDefinitionId && input.reportDefinitionCode) {
      const def = await this.prisma.reportDefinition.findFirst({
        where: { tenantId, code: input.reportDefinitionCode }
      });
      if (def) {
        reportDefinitionId = def.id;
      }
    }

    if (!reportDefinitionId) {
      const defs = await this.listDefinitions(tenantId);
      reportDefinitionId = defs[0]?.id;
    }

    if (!reportDefinitionId) {
      throw new BadRequestException("A valid reportDefinitionId or code is required.");
    }

    const inputRecord = input as Record<string, unknown>;
    const customConfig = inputRecord.customConfig as Record<string, unknown> | undefined;

    const report = await this.prisma.savedReport.create({
      data: {
        tenantId,
        reportDefinitionId,
        name: input.name,
        description: input.description,
        filters: (customConfig?.filters || input.filters) as unknown as Prisma.InputJsonValue,
        filtersJson: (customConfig?.filters || input.filters) as unknown as Prisma.InputJsonValue,
        columns: (customConfig?.columns || input.columns) as unknown as Prisma.InputJsonValue,
        columnsJson: (customConfig?.columns || input.columns) as unknown as Prisma.InputJsonValue,
        sortJson: (customConfig?.sorts || inputRecord.sorts || input.sort) as unknown as Prisma.InputJsonValue,
        groupingJson: (customConfig?.groupBy || inputRecord.grouping || input.groupBy) as unknown as Prisma.InputJsonValue,
        isShared: input.isShared,
        isPublic: input.isPublic,
        createdById: userId
      },
      include: { reportDefinition: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.report.saved",
      resourceType: "saved_report",
      resourceId: report.id,
      after: { name: report.name }
    });

    return report;
  }

  async updateSavedReport(tenantId: string, id: string, input: UpdateSavedReportDto, userId: string) {
    const existing = await this.getSavedReport(tenantId, id);

    const updated = await this.prisma.savedReport.update({
      where: { id: existing.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.filters ? { filters: input.filters as unknown as Prisma.InputJsonValue, filtersJson: input.filters as unknown as Prisma.InputJsonValue } : {}),
        ...(input.columns ? { columns: input.columns as unknown as Prisma.InputJsonValue, columnsJson: input.columns as unknown as Prisma.InputJsonValue } : {}),
        ...(input.isShared !== undefined ? { isShared: input.isShared } : {}),
        ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {})
      },
      include: { reportDefinition: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.report.updated",
      resourceType: "saved_report",
      resourceId: updated.id,
      after: { name: updated.name }
    });

    return updated;
  }

  async deleteSavedReport(tenantId: string, id: string, userId: string) {
    const existing = await this.getSavedReport(tenantId, id);

    await this.prisma.savedReport.delete({
      where: { id: existing.id }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.report.deleted",
      resourceType: "saved_report",
      resourceId: existing.id,
      before: { name: existing.name }
    });

    return { success: true, message: `Saved report '${existing.name}' deleted.` };
  }

  // ----------------- Report Execution & Export Engine -----------------

  async executeReport(tenantId: string, input: ExecuteReportDto, actorUserId: string) {
    const startTime = Date.now();
    const resolvedConfig = await this.resolveReportConfig(tenantId, input);

    const result = await this.reportEngine.buildAndExecuteReport(tenantId, resolvedConfig);
    const executionTimeMs = Date.now() - startTime;

    // Log execution
    if (input.reportDefinitionId || input.savedReportId) {
      await this.prisma.reportExecution.create({
        data: {
          tenantId,
          reportDefinitionId: input.reportDefinitionId || (await this.findDefaultDefinitionId(tenantId)),
          savedReportId: input.savedReportId,
          triggeredById: actorUserId,
          status: "COMPLETED",
          format: input.format,
          parameters: input.parameters as unknown as Prisma.InputJsonValue,
          rowCount: result.rows.length,
          executionTimeMs,
          durationMs: executionTimeMs,
          completedAt: new Date()
        }
      });
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      action: "analytics.report.executed",
      resourceType: "report",
      resourceId: input.reportDefinitionCode || input.reportDefinitionId || "CUSTOM_REPORT",
      after: { rowCount: result.rows.length, timeMs: executionTimeMs }
    });

    return {
      title: result.title ?? "Custom Report Execution",
      columns: result.columns,
      rows: result.rows,
      rowCount: result.rows.length,
      totalCount: result.totalCount,
      executionTimeMs
    };
  }

  async exportReport(tenantId: string, input: ExportReportDto, actorUserId: string) {
    const resolvedConfig = await this.resolveReportConfig(tenantId, input);
    const queryResult = await this.reportEngine.buildAndExecuteReport(tenantId, {
      ...resolvedConfig,
      limit: 10000
    });

    const dataset: ExportDataset = {
      title: queryResult.title ?? `${resolvedConfig.module} Report`,
      columns: queryResult.columns.map((c) => ({ key: c.key, header: c.header })),
      rows: queryResult.rows,
      generatedAt: new Date()
    };

    // Export engine supports generateCsv, generateExcel, generatePdf, and json format outputs
    const inputRec = input as Record<string, unknown>;
    const exportRes = await this.exportEngine.exportDataset(tenantId, dataset, input.format, {
      asyncExport: (inputRec.asyncExport as boolean) ?? false,
      actorUserId
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      action: "analytics.report.exported",
      resourceType: "report_export",
      resourceId: exportRes.filename,
      after: { format: input.format, rowCount: queryResult.rows.length, isAsync: exportRes.isAsync }
    });

    return {
      buffer: exportRes.buffer ?? Buffer.from(""),
      filename: exportRes.filename,
      contentType: exportRes.contentType,
      downloadUrl: exportRes.downloadUrl,
      isAsync: exportRes.isAsync,
      jobId: exportRes.jobId
    };
  }

  // ----------------- Scheduled Reports -----------------

  async listSchedules(tenantId: string) {
    return this.prisma.reportSchedule.findMany({
      where: { tenantId },
      include: {
        savedReport: {
          include: { reportDefinition: true }
        },
        createdBy: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getSchedule(tenantId: string, scheduleId: string) {
    const schedule = await this.prisma.reportSchedule.findFirst({
      where: { id: scheduleId, tenantId },
      include: { savedReport: { include: { reportDefinition: true } }, createdBy: { select: { id: true, email: true } } }
    });
    if (!schedule) {
      throw new NotFoundException("Report schedule not found.");
    }
    return schedule;
  }

  async createSchedule(tenantId: string, input: CreateReportScheduleDto, userId: string) {
    const inputRec = input as Record<string, unknown>;
    const schedule = await this.prisma.reportSchedule.create({
      data: {
        tenantId,
        savedReportId: input.savedReportId,
        name: input.name,
        frequency: input.frequency,
        recipients: input.recipients as unknown as Prisma.InputJsonValue,
        recipientsJson: input.recipients as unknown as Prisma.InputJsonValue,
        format: input.format,
        exportFormat: input.format,
        createdById: userId,
        isActive: (inputRec.isActive as boolean) ?? true,
        nextRunAt: this.calculateNextRun(input.frequency)
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.schedule.created",
      resourceType: "report_schedule",
      resourceId: schedule.id,
      after: { name: schedule.name, frequency: schedule.frequency }
    });

    return schedule;
  }

  async triggerScheduleRun(tenantId: string, scheduleId: string, actorUserId: string) {
    const schedule = await this.getSchedule(tenantId, scheduleId);

    const saved = schedule.savedReport;
    const rawColumns = Array.isArray(saved.columns) ? (saved.columns as string[]) : [];
    const config: CustomReportConfig = {
      module: (saved.reportDefinition.sourceModule as ReportModuleType) || "EMPLOYEE",
      columns: rawColumns.length > 0 ? rawColumns : ["employeeCode", "fullName", "department", "status"],
      filters: [],
      sorts: [],
      groupBy: [],
      aggregations: [],
      limit: 1000,
      offset: 0
    };

    const queryResult = await this.reportEngine.buildAndExecuteReport(tenantId, config);

    const updated = await this.prisma.reportSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: new Date(),
        nextRunAt: this.calculateNextRun(schedule.frequency)
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      action: "analytics.schedule.triggered",
      resourceType: "report_schedule",
      resourceId: schedule.id,
      after: { name: schedule.name, rowCount: queryResult.rows.length, status: "DISPATCHED" }
    });

    return {
      message: `Report schedule '${schedule.name}' executed and dispatched (${queryResult.rows.length} rows).`,
      schedule: updated
    };
  }

  // ----------------- Dashboards & Widgets -----------------

  async listDashboards(tenantId: string) {
    return this.prisma.dashboard.findMany({
      where: { tenantId },
      include: {
        widgets: true,
        createdBy: { select: { id: true, email: true } }
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });
  }

  async getDashboard(tenantId: string, id: string) {
    const db = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: {
        widgets: true,
        createdBy: { select: { id: true, email: true } }
      }
    });
    if (!db) {
      throw new NotFoundException("Dashboard not found.");
    }
    return db;
  }

  async createDashboard(tenantId: string, input: CreateDashboardDto, userId: string) {
    const widgetConfigs: DashboardWidgetConfig[] = (input.widgets || []).map((w) => ({
      widgetType: w.widgetType,
      title: w.title,
      gridPosition: {
        x: w.gridPosition?.x ?? 0,
        y: w.gridPosition?.y ?? 0,
        w: w.gridPosition?.w ?? 6,
        h: w.gridPosition?.h ?? 4
      },
      config: (w.config as Record<string, unknown>) ?? {}
    }));

    this.dashboardEngine.validateGridLayout(widgetConfigs);
    const sanitizedWidgets = this.dashboardEngine.sanitizeGridPositions(widgetConfigs);

    const dashboard = await this.prisma.dashboard.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description,
        isDefault: input.isDefault,
        isPublic: input.isPublic,
        createdById: userId,
        widgets: {
          create: sanitizedWidgets.map((w) => ({
            tenantId,
            userId,
            widgetType: w.widgetType,
            title: w.title,
            positionX: w.gridPosition.x,
            positionY: w.gridPosition.y,
            width: w.gridPosition.w,
            height: w.gridPosition.h,
            gridPosition: w.gridPosition as unknown as Prisma.InputJsonValue,
            config: (w.config ?? {}) as unknown as Prisma.InputJsonValue,
            configurationJson: (w.config ?? {}) as unknown as Prisma.InputJsonValue
          }))
        }
      },
      include: { widgets: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.dashboard.created",
      resourceType: "dashboard",
      resourceId: dashboard.id,
      after: { name: dashboard.name, widgetCount: dashboard.widgets.length }
    });

    return dashboard;
  }

  async updateDashboard(tenantId: string, id: string, input: UpdateDashboardDto, userId: string) {
    const existing = await this.getDashboard(tenantId, id);

    if (input.widgets) {
      const widgetConfigs: DashboardWidgetConfig[] = (input.widgets || []).map((w) => ({
        widgetType: w.widgetType,
        title: w.title,
        gridPosition: {
          x: w.gridPosition?.x ?? 0,
          y: w.gridPosition?.y ?? 0,
          w: w.gridPosition?.w ?? 6,
          h: w.gridPosition?.h ?? 4
        },
        config: (w.config as Record<string, unknown>) ?? {}
      }));

      this.dashboardEngine.validateGridLayout(widgetConfigs);
      const sanitized = this.dashboardEngine.sanitizeGridPositions(widgetConfigs);

      await this.prisma.dashboardWidget.deleteMany({
        where: { tenantId, dashboardId: existing.id }
      });

      await this.prisma.dashboardWidget.createMany({
        data: sanitized.map((w) => ({
          tenantId,
          userId,
          dashboardId: existing.id,
          widgetType: w.widgetType,
          title: w.title,
          positionX: w.gridPosition.x,
          positionY: w.gridPosition.y,
          width: w.gridPosition.w,
          height: w.gridPosition.h,
          gridPosition: w.gridPosition as unknown as Prisma.InputJsonValue,
          config: (w.config ?? {}) as unknown as Prisma.InputJsonValue,
          configurationJson: (w.config ?? {}) as unknown as Prisma.InputJsonValue
        }))
      });
    }

    const updated = await this.prisma.dashboard.update({
      where: { id: existing.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {})
      },
      include: { widgets: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.dashboard.updated",
      resourceType: "dashboard",
      resourceId: updated.id,
      after: { name: updated.name }
    });

    return updated;
  }

  async deleteDashboard(tenantId: string, id: string, userId: string) {
    const existing = await this.getDashboard(tenantId, id);

    await this.prisma.dashboard.delete({
      where: { id: existing.id }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "analytics.dashboard.deleted",
      resourceType: "dashboard",
      resourceId: existing.id,
      before: { name: existing.name }
    });

    return { success: true, message: `Dashboard '${existing.name}' deleted.` };
  }

  async getWidgets(tenantId: string, userId: string, dashboardId?: string) {
    const widgets = await this.prisma.dashboardWidget.findMany({
      where: {
        tenantId,
        ...(dashboardId ? { dashboardId } : { userId })
      },
      orderBy: { createdAt: "asc" }
    });

    const resolved = await Promise.all(
      widgets.map(async (w) => {
        const rawGrid = (w.gridPosition as { x: number; y: number; w: number; h: number }) || {
          x: w.positionX,
          y: w.positionY,
          w: w.width,
          h: w.height
        };
        const data = await this.dashboardEngine.resolveWidgetData(tenantId, {
          id: w.id,
          widgetType: w.widgetType,
          title: w.title,
          gridPosition: rawGrid,
          config: (w.config as Record<string, unknown>) || {}
        });
        return {
          id: w.id,
          ...data
        };
      })
    );

    return resolved;
  }

  async saveWidgets(tenantId: string, userId: string, input: SaveWidgetsDto, dashboardId?: string) {
    const inputRec = input as Record<string, unknown>;
    const targetDashboardId = (inputRec.dashboardId as string | undefined) || dashboardId;
    const widgetConfigs: DashboardWidgetConfig[] = (input.widgets || []).map((w) => ({
      widgetType: w.widgetType,
      title: w.title,
      gridPosition: {
        x: w.gridPosition?.x ?? 0,
        y: w.gridPosition?.y ?? 0,
        w: w.gridPosition?.w ?? 6,
        h: w.gridPosition?.h ?? 4
      },
      config: (w.config as Record<string, unknown>) ?? {}
    }));

    this.dashboardEngine.validateGridLayout(widgetConfigs);
    const sanitized = this.dashboardEngine.sanitizeGridPositions(widgetConfigs);

    await this.prisma.dashboardWidget.deleteMany({
      where: {
        tenantId,
        ...(targetDashboardId ? { dashboardId: targetDashboardId } : { userId, dashboardId: null })
      }
    });

    const created = await this.prisma.$transaction(
      sanitized.map((w) =>
        this.prisma.dashboardWidget.create({
          data: {
            tenantId,
            userId,
            dashboardId: targetDashboardId,
            widgetType: w.widgetType,
            title: w.title,
            positionX: w.gridPosition.x,
            positionY: w.gridPosition.y,
            width: w.gridPosition.w,
            height: w.gridPosition.h,
            gridPosition: w.gridPosition as unknown as Prisma.InputJsonValue,
            config: (w.config ?? {}) as unknown as Prisma.InputJsonValue,
            configurationJson: (w.config ?? {}) as unknown as Prisma.InputJsonValue
          }
        })
      )
    );

    return created;
  }

  getDashboardTemplates() {
    return this.dashboardEngine.getDefaultTemplates();
  }

  // ----------------- Audit Trail -----------------

  async getAnalyticsAudit(tenantId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        action: {
          in: [
            "analytics.report.executed",
            "analytics.report.exported",
            "analytics.report.saved",
            "analytics.report.updated",
            "analytics.report.deleted",
            "analytics.schedule.created",
            "analytics.schedule.triggered",
            "analytics.dashboard.created",
            "analytics.dashboard.updated",
            "analytics.dashboard.deleted"
          ]
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  // ----------------- Internal Helpers -----------------

  private async resolveReportConfig(
    tenantId: string,
    input: {
      reportDefinitionCode?: string;
      reportDefinitionId?: string;
      savedReportId?: string;
      customConfig?: CustomReportConfig;
    }
  ): Promise<CustomReportConfig> {
    if (input.customConfig) {
      return input.customConfig;
    }

    if (input.savedReportId) {
      const saved = await this.getSavedReport(tenantId, input.savedReportId);
      const rawCols = Array.isArray(saved.columns) ? (saved.columns as string[]) : [];
      return {
        module: (saved.reportDefinition.sourceModule as ReportModuleType) || "EMPLOYEE",
        columns: rawCols.length > 0 ? rawCols : ["employeeCode", "fullName", "department", "status"],
        filters: [],
        sorts: [],
        groupBy: [],
        aggregations: [],
        limit: 100,
        offset: 0
      };
    }

    if (input.reportDefinitionId) {
      const def = await this.getDefinition(tenantId, input.reportDefinitionId);
      const config = def.config as Record<string, unknown>;
      if (config && Array.isArray(config.columns)) {
        return {
          module: (def.sourceModule as ReportModuleType) || "EMPLOYEE",
          columns: config.columns as string[],
          filters: (config.filters as ReportFilterClause[]) ?? [],
          sorts: (config.sorts as ReportSortClause[]) ?? [],
          groupBy: (config.groupBy as string[]) ?? [],
          aggregations: (config.aggregations as ReportAggregation[]) ?? [],
          limit: (config.limit as number) ?? 100,
          offset: (config.offset as number) ?? 0
        };
      }
      return {
        module: (def.sourceModule as ReportModuleType) || "EMPLOYEE",
        columns: ["employeeCode", "fullName", "department", "status"],
        filters: [],
        sorts: [],
        groupBy: [],
        aggregations: [],
        limit: 100,
        offset: 0
      };
    }

    const code = input.reportDefinitionCode || "EMPLOYEE_DIRECTORY";
    return this.getDefaultConfigForCode(code);
  }

  private getDefaultConfigForCode(code: string): CustomReportConfig {
    const base = {
      filters: [],
      sorts: [],
      groupBy: [],
      aggregations: [],
      limit: 100,
      offset: 0
    };

    switch (code) {
      case "ATTENDANCE_SUMMARY":
        return {
          ...base,
          module: "ATTENDANCE",
          columns: ["employeeCode", "fullName", "date", "status", "totalHours", "isLate"]
        };
      case "PAYROLL_MASTER":
        return {
          ...base,
          module: "PAYROLL",
          columns: ["employeeCode", "fullName", "month", "year", "grossSalary", "totalDeductions", "netSalary"]
        };
      case "LEAVE_REGISTER":
        return {
          ...base,
          module: "LEAVE",
          columns: ["employeeCode", "fullName", "leaveType", "startDate", "endDate", "totalDays", "status"]
        };
      case "COMPLIANCE_STATEMENT":
        return {
          ...base,
          module: "COMPLIANCE",
          columns: ["employeeCode", "fullName", "month", "year", "pfEmployee", "esiEmployee", "ptAmount", "tdsAmount"]
        };
      case "FACE_LOGS":
        return {
          ...base,
          module: "FACE",
          columns: ["employeeCode", "fullName", "status", "confidenceScore", "reason", "createdAt"]
        };
      case "ORG_STRUCTURE":
        return {
          ...base,
          module: "ORGANIZATION",
          columns: ["businessUnitName", "regionName", "departmentName", "teamName", "employeeCount"]
        };
      case "AUDIT_ACTIVITY":
        return {
          ...base,
          module: "AUDIT",
          columns: ["action", "resourceType", "resourceId", "createdAt"]
        };
      case "EMPLOYEE_DIRECTORY":
      default:
        return {
          ...base,
          module: "EMPLOYEE",
          columns: ["employeeCode", "fullName", "email", "department", "designation", "status", "joiningDate"]
        };
    }
  }

  private async findDefaultDefinitionId(tenantId: string): Promise<string> {
    const def = await this.prisma.reportDefinition.findFirst({
      where: { tenantId }
    });
    return def?.id ?? "00000000-0000-0000-0000-000000000000";
  }

  private calculateNextRun(frequency: string): Date {
    const now = Date.now();
    switch (frequency) {
      case "DAILY":
        return new Date(now + 86400000);
      case "WEEKLY":
        return new Date(now + 86400000 * 7);
      case "QUARTERLY":
        return new Date(now + 86400000 * 90);
      case "MONTHLY":
      default:
        return new Date(now + 86400000 * 30);
    }
  }

  private async seedDefaultReportDefinitions(tenantId: string): Promise<void> {
    const defaults = [
      {
        code: "EMPLOYEE_DIRECTORY",
        name: "Employee Master Directory",
        description: "Complete list of employees with department, designation, and employment status.",
        category: "EMPLOYEE" as ReportCategory,
        sourceModule: "EMPLOYEE",
        isSystem: true
      },
      {
        code: "ATTENDANCE_SUMMARY",
        name: "Attendance Event Summary",
        description: "Detailed log of check-ins, check-outs, and verification timestamps.",
        category: "ATTENDANCE" as ReportCategory,
        sourceModule: "ATTENDANCE",
        isSystem: true
      },
      {
        code: "PAYROLL_MASTER",
        name: "Payroll Master Statement",
        description: "Gross salary, deductions, and net payouts across all payroll cycles.",
        category: "PAYROLL" as ReportCategory,
        sourceModule: "PAYROLL",
        isSystem: true
      },
      {
        code: "LEAVE_REGISTER",
        name: "Statutory Leave Register",
        description: "Employee leave applications, approvals, and balance consumption history.",
        category: "LEAVE" as ReportCategory,
        sourceModule: "LEAVE",
        isSystem: true
      },
      {
        code: "COMPLIANCE_STATEMENT",
        name: "Statutory Compliance Statement",
        description: "PF, ESI, Professional Tax, and TDS deductions and liability snapshots.",
        category: "COMPLIANCE" as ReportCategory,
        sourceModule: "COMPLIANCE",
        isSystem: true
      }
    ];

    for (const d of defaults) {
      await this.prisma.reportDefinition.create({
        data: {
          tenantId,
          code: d.code,
          name: d.name,
          description: d.description,
          category: d.category,
          sourceModule: d.sourceModule,
          isSystem: d.isSystem
        }
      });
    }
  }
}
