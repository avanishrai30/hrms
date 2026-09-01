import { describe, expect, it } from "vitest";
import {
  createReportScheduleSchema,
  createSavedReportSchema,
  executeReportSchema,
  exportReportSchema,
  saveWidgetsSchema
} from "./analytics.schemas.js";

describe("Analytics Schemas", () => {
  it("validates createSavedReportSchema", () => {
    const valid = createSavedReportSchema.safeParse({
      reportDefinitionId: "36d1acc3-4fd0-4587-82f0-7fe302242ec4",
      name: "Engineering Monthly Attendance",
      description: "Custom attendance query",
      filters: { department: "Engineering" },
      columns: ["employeeCode", "fullName", "presentDays"],
      isShared: true
    });
    expect(valid.success).toBe(true);

    const invalid = createSavedReportSchema.safeParse({
      reportDefinitionId: "invalid-uuid",
      name: "E"
    });
    expect(invalid.success).toBe(false);
  });

  it("validates executeReportSchema & exportReportSchema", () => {
    const validExec = executeReportSchema.safeParse({
      reportDefinitionCode: "EMPLOYEE_DIRECTORY",
      format: "JSON"
    });
    expect(validExec.success).toBe(true);

    const validExport = exportReportSchema.safeParse({
      reportDefinitionCode: "PAYROLL_MASTER",
      format: "CSV"
    });
    expect(validExport.success).toBe(true);
  });

  it("validates createReportScheduleSchema", () => {
    const valid = createReportScheduleSchema.safeParse({
      savedReportId: "36d1acc3-4fd0-4587-82f0-7fe302242ec4",
      name: "Executive Weekly Digest",
      frequency: "WEEKLY",
      recipients: ["hr@vcorganics.com", "finance@vcorganics.com"],
      format: "PDF"
    });
    expect(valid.success).toBe(true);
  });

  it("validates saveWidgetsSchema", () => {
    const valid = saveWidgetsSchema.safeParse({
      widgets: [
        {
          widgetType: "ATTENDANCE_GAUGE",
          title: "Today's Attendance Rate",
          gridPosition: { x: 0, y: 0, w: 6, h: 4 },
          config: {}
        }
      ]
    });
    expect(valid.success).toBe(true);
  });
});
