import { z } from "zod";

export const reportCategorySchema = z.enum([
  "EXECUTIVE",
  "ATTENDANCE",
  "LEAVE",
  "PAYROLL",
  "COMPLIANCE",
  "EMPLOYEE",
  "FACE",
  "ORGANIZATION",
  "AUDIT"
]);

export const reportModuleSchema = z.enum([
  "EMPLOYEE",
  "ATTENDANCE",
  "LEAVE",
  "PAYROLL",
  "COMPLIANCE",
  "FACE",
  "ORGANIZATION",
  "AUDIT"
]);

export const reportFormatSchema = z.enum(["CSV", "EXCEL", "JSON", "PDF"]);
export const scheduleFrequencySchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"]);

export const filterOperatorSchema = z.enum([
  "EQUALS",
  "NOT_EQUALS",
  "CONTAINS",
  "IN",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "BETWEEN"
]);

export const aggregationFunctionSchema = z.enum(["COUNT", "SUM", "AVG", "MIN", "MAX"]);

export const reportFilterClauseSchema = z.object({
  field: z.string().min(1),
  operator: filterOperatorSchema,
  value: z.unknown(),
  secondaryValue: z.unknown().optional()
});

export const reportSortClauseSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(["asc", "desc"]).default("asc")
});

export const reportAggregationSchema = z.object({
  field: z.string().min(1),
  function: aggregationFunctionSchema,
  alias: z.string().optional()
});

export const customReportConfigSchema = z.object({
  module: reportModuleSchema,
  columns: z.array(z.string()).min(1, "At least one column is required"),
  filters: z.array(reportFilterClauseSchema).optional().default([]),
  sorts: z.array(reportSortClauseSchema).optional().default([]),
  groupBy: z.array(z.string()).optional().default([]),
  aggregations: z.array(reportAggregationSchema).optional().default([]),
  limit: z.number().int().min(1).max(10000).optional().default(100),
  offset: z.number().int().min(0).optional().default(0)
});

export const createReportDefinitionSchema = z.object({
  code: z.string().min(2).max(100),
  name: z.string().min(2, "Report name must be at least 2 characters"),
  description: z.string().optional(),
  category: reportCategorySchema,
  sourceModule: reportModuleSchema.default("EMPLOYEE"),
  config: customReportConfigSchema.optional().default({
    module: "EMPLOYEE",
    columns: ["employeeCode", "fullName", "department", "designation", "status"]
  }),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export const updateReportDefinitionSchema = createReportDefinitionSchema.partial();

export const widgetGridPositionSchema = z.object({
  x: z.number().min(0).max(11).default(0),
  y: z.number().min(0).default(0),
  w: z.number().min(1).max(12).default(6),
  h: z.number().min(1).max(24).default(4)
});

export const createSavedReportSchema = z.object({
  reportDefinitionId: z.string().optional(),
  reportDefinitionCode: z.string().optional(),
  name: z.string().min(2, "Report name must be at least 2 characters"),
  description: z.string().optional(),
  sourceModule: z.string().optional(),
  filters: z.union([z.record(z.unknown()), z.array(z.unknown())]).default({}),
  columns: z.array(z.string()).default([]),
  sort: z.array(z.unknown()).optional(),
  sorts: z.array(reportSortClauseSchema).optional().default([]),
  groupBy: z.array(z.string()).optional().default([]),
  grouping: z.array(z.string()).optional().default([]),
  aggregations: z.array(z.unknown()).optional(),
  customConfig: customReportConfigSchema.optional(),
  isShared: z.boolean().default(false),
  isPublic: z.boolean().default(false)
});

export const updateSavedReportSchema = createSavedReportSchema.partial();

export const executeReportSchema = z.object({
  reportDefinitionCode: z.string().optional(),
  reportDefinitionId: z.string().optional(),
  savedReportId: z.string().optional(),
  sourceModule: z.string().optional(),
  columns: z.array(z.string()).optional(),
  filters: z.union([z.record(z.unknown()), z.array(z.unknown())]).optional(),
  sort: z.array(z.unknown()).optional(),
  sorts: z.array(reportSortClauseSchema).optional(),
  groupBy: z.array(z.string()).optional(),
  aggregations: z.array(z.unknown()).optional(),
  customConfig: customReportConfigSchema.optional(),
  parameters: z.record(z.unknown()).default({}),
  format: reportFormatSchema.default("JSON"),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(10000).optional(),
  offset: z.number().int().min(0).optional()
});

export const exportReportSchema = z.object({
  reportDefinitionCode: z.string().optional(),
  reportDefinitionId: z.string().optional(),
  savedReportId: z.string().optional(),
  sourceModule: z.string().optional(),
  columns: z.array(z.string()).optional(),
  filters: z.union([z.record(z.unknown()), z.array(z.unknown())]).optional(),
  sort: z.array(z.unknown()).optional(),
  sorts: z.array(reportSortClauseSchema).optional(),
  groupBy: z.array(z.string()).optional(),
  aggregations: z.array(z.unknown()).optional(),
  customConfig: customReportConfigSchema.optional(),
  parameters: z.record(z.unknown()).default({}),
  format: reportFormatSchema.default("CSV"),
  asyncExport: z.boolean().optional().default(false)
});

export const createReportScheduleSchema = z.object({
  savedReportId: z.string().uuid(),
  name: z.string().min(2, "Schedule name must be at least 2 characters"),
  frequency: scheduleFrequencySchema.default("MONTHLY"),
  recipients: z.array(z.string().email()).min(1, "At least one recipient email is required"),
  format: reportFormatSchema.default("CSV"),
  isActive: z.boolean().optional().default(true)
});

export const saveWidgetsSchema = z.object({
  dashboardId: z.string().uuid().optional(),
  widgets: z.array(
    z.object({
      widgetType: z.string(),
      title: z.string(),
      gridPosition: z.object({
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number()
      }).optional(),
      positionX: z.number().optional(),
      positionY: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      config: z.record(z.unknown()).default({})
    })
  )
});

export const createDashboardSchema = z.object({
  name: z.string().min(2, "Dashboard name must be at least 2 characters"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  widgets: z
    .array(
      z.object({
        widgetType: z.string(),
        title: z.string(),
        gridPosition: widgetGridPositionSchema.optional(),
        positionX: z.number().optional().default(0),
        positionY: z.number().optional().default(0),
        width: z.number().optional().default(6),
        height: z.number().optional().default(4),
        config: z.record(z.unknown()).optional().default({})
      })
    )
    .optional()
    .default([])
});

export const updateDashboardSchema = createDashboardSchema.partial();

export type ReportCategoryType = z.infer<typeof reportCategorySchema>;
export type ReportModuleType = z.infer<typeof reportModuleSchema>;
export type ReportFormatType = z.infer<typeof reportFormatSchema>;
export type ScheduleFrequencyType = z.infer<typeof scheduleFrequencySchema>;
export type ReportFilterOperator = z.infer<typeof filterOperatorSchema>;
export type ReportFilterClause = z.infer<typeof reportFilterClauseSchema>;
export type ReportSortClause = z.infer<typeof reportSortClauseSchema>;
export type ReportAggregation = z.infer<typeof reportAggregationSchema>;
export type CustomReportConfig = z.infer<typeof customReportConfigSchema>;
export type CreateReportDefinitionDto = z.infer<typeof createReportDefinitionSchema>;
export type UpdateReportDefinitionDto = z.infer<typeof updateReportDefinitionSchema>;
export type CreateSavedReportDto = z.infer<typeof createSavedReportSchema>;
export type UpdateSavedReportDto = z.infer<typeof updateSavedReportSchema>;
export type ExecuteReportDto = z.infer<typeof executeReportSchema>;
export type ExportReportDto = z.infer<typeof exportReportSchema>;
export type CreateReportScheduleDto = z.infer<typeof createReportScheduleSchema>;
export type SaveWidgetsDto = z.infer<typeof saveWidgetsSchema>;
export type CreateDashboardDto = z.infer<typeof createDashboardSchema>;
export type UpdateDashboardDto = z.infer<typeof updateDashboardSchema>;
