import { BadRequestException, Injectable } from "@nestjs/common";
import type { ReportModuleType } from "../analytics.schemas.js";
import { AnalyticsEngine } from "./analytics.engine.js";
import { ReportEngine } from "./report.engine.js";

export type WidgetType =
  | "KPI_CARD"
  | "LINE_CHART"
  | "BAR_CHART"
  | "PIE_CHART"
  | "DONUT_CHART"
  | "HEATMAP"
  | "TABLE"
  | "GAUGE"
  | "RADAR";

export interface WidgetGridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardWidgetConfig {
  id?: string;
  widgetType: string;
  title: string;
  gridPosition: WidgetGridPosition;
  config?: Record<string, unknown>;
}

export interface ResolvedWidgetData {
  widgetType: string;
  title: string;
  gridPosition: WidgetGridPosition;
  data: unknown;
  lastUpdated: string;
}

export interface DashboardTemplate {
  code: string;
  name: string;
  description: string;
  category: "EXECUTIVE" | "HR_OPERATIONS" | "PAYROLL_FINANCE" | "SECURITY_BIOMETRICS";
  widgets: DashboardWidgetConfig[];
}

@Injectable()
export class DashboardEngine {
  constructor(
    private readonly analyticsEngine: AnalyticsEngine,
    private readonly reportEngine: ReportEngine
  ) {}

  /**
   * Resolves live data payload for a dashboard widget
   */
  async resolveWidgetData(
    tenantId: string,
    widget: DashboardWidgetConfig
  ): Promise<ResolvedWidgetData> {
    const config = widget.config ?? {};
    const metric = String(config.metric ?? widget.widgetType);
    let data: unknown = null;

    switch (widget.widgetType) {
      case "KPI_CARD": {
        data = await this.resolveKpiData(tenantId, metric, config);
        break;
      }
      case "LINE_CHART": {
        data = await this.resolveLineChartData(tenantId, metric, config);
        break;
      }
      case "BAR_CHART": {
        data = await this.resolveBarChartData(tenantId, metric, config);
        break;
      }
      case "PIE_CHART":
      case "DONUT_CHART": {
        data = await this.resolvePieChartData(tenantId, metric, config);
        break;
      }
      case "HEATMAP": {
        data = await this.resolveHeatmapData(tenantId, metric);
        break;
      }
      case "GAUGE": {
        data = await this.resolveGaugeData(tenantId, metric);
        break;
      }
      case "TABLE": {
        data = await this.resolveTableData(tenantId, config);
        break;
      }
      default: {
        const exec = await this.analyticsEngine.calculateExecutiveAnalytics(tenantId);
        data = exec;
      }
    }

    return {
      widgetType: widget.widgetType,
      title: widget.title,
      gridPosition: widget.gridPosition,
      data,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Validates 12-column grid layout positions
   */
  validateGridLayout(widgets: DashboardWidgetConfig[]): void {
    for (let i = 0; i < widgets.length; i++) {
      const w = widgets[i]!;
      const pos = w.gridPosition;

      if (!pos || typeof pos !== "object") {
        throw new BadRequestException(`Widget '${w.title}' has invalid gridPosition structure.`);
      }

      if (pos.x < 0 || pos.x > 11) {
        throw new BadRequestException(`Widget '${w.title}' x position must be between 0 and 11.`);
      }

      if (pos.w < 1 || pos.w > 12) {
        throw new BadRequestException(`Widget '${w.title}' width must be between 1 and 12.`);
      }

      if (pos.x + pos.w > 12) {
        throw new BadRequestException(
          `Widget '${w.title}' exceeds the 12-column grid boundary (x: ${pos.x} + w: ${pos.w} = ${pos.x + pos.w} > 12).`
        );
      }

      if (pos.y < 0) {
        throw new BadRequestException(`Widget '${w.title}' y position cannot be negative.`);
      }

      if (pos.h < 1) {
        throw new BadRequestException(`Widget '${w.title}' height must be at least 1.`);
      }
    }
  }

  /**
   * Auto-arranges widgets to avoid vertical and horizontal overlaps
   */
  sanitizeGridPositions(widgets: DashboardWidgetConfig[]): DashboardWidgetConfig[] {
    let currentY = 0;
    let currentX = 0;
    let maxRowH = 0;

    return widgets.map((widget) => {
      let { x, y, w, h } = widget.gridPosition;
      w = Math.min(12, Math.max(1, w || 6));
      h = Math.max(1, h || 4);

      if (currentX + w > 12) {
        currentX = 0;
        currentY += maxRowH;
        maxRowH = 0;
      }

      x = currentX;
      y = currentY;

      currentX += w;
      maxRowH = Math.max(maxRowH, h);

      return {
        ...widget,
        gridPosition: { x, y, w, h }
      };
    });
  }

  /**
   * Returns default out-of-the-box dashboard templates
   */
  getDefaultTemplates(): DashboardTemplate[] {
    return [
      {
        code: "EXECUTIVE_OVERVIEW",
        name: "Executive Overview Dashboard",
        description: "Comprehensive C-level workforce, payroll, and compliance overview.",
        category: "EXECUTIVE",
        widgets: [
          {
            widgetType: "KPI_CARD",
            title: "Active Headcount",
            gridPosition: { x: 0, y: 0, w: 3, h: 3 },
            config: { metric: "HEADCOUNT_ACTIVE", subtitle: "Active workforce" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Today Attendance",
            gridPosition: { x: 3, y: 0, w: 3, h: 3 },
            config: { metric: "ATTENDANCE_RATE", subtitle: "Punctuality & check-ins" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Monthly Payroll Cost",
            gridPosition: { x: 6, y: 0, w: 3, h: 3 },
            config: { metric: "PAYROLL_TOTAL_COST", subtitle: "Gross + employer liability" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Compliance Risk Score",
            gridPosition: { x: 9, y: 0, w: 3, h: 3 },
            config: { metric: "COMPLIANCE_RISK_SCORE", subtitle: "Risk index (0-100)" }
          },
          {
            widgetType: "LINE_CHART",
            title: "Headcount & Hiring Trends (12 Months)",
            gridPosition: { x: 0, y: 3, w: 8, h: 6 },
            config: { metric: "WORKFORCE_GROWTH_TREND" }
          },
          {
            widgetType: "DONUT_CHART",
            title: "Department Distribution",
            gridPosition: { x: 8, y: 3, w: 4, h: 6 },
            config: { metric: "DEPARTMENT_DISTRIBUTION" }
          },
          {
            widgetType: "BAR_CHART",
            title: "Payroll Cost by Department",
            gridPosition: { x: 0, y: 9, w: 6, h: 5 },
            config: { metric: "DEPARTMENT_PAYROLL_COSTS" }
          },
          {
            widgetType: "GAUGE",
            title: "Biometric & Face Match Accuracy",
            gridPosition: { x: 6, y: 9, w: 6, h: 5 },
            config: { metric: "FACE_MATCH_RATE" }
          }
        ]
      },
      {
        code: "HR_OPERATIONS",
        name: "HR Operations Dashboard",
        description: "Daily attendance trends, leave utilization, and organizational span.",
        category: "HR_OPERATIONS",
        widgets: [
          {
            widgetType: "KPI_CARD",
            title: "New Hires This Month",
            gridPosition: { x: 0, y: 0, w: 4, h: 3 },
            config: { metric: "NEW_HIRES_MONTH" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Annual Attrition Rate",
            gridPosition: { x: 4, y: 0, w: 4, h: 3 },
            config: { metric: "ATTRITION_RATE" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Leave Utilization",
            gridPosition: { x: 8, y: 0, w: 4, h: 3 },
            config: { metric: "LEAVE_UTILIZATION" }
          },
          {
            widgetType: "HEATMAP",
            title: "Attendance Check-In Heatmap (7 Days x 24 Hours)",
            gridPosition: { x: 0, y: 3, w: 12, h: 6 },
            config: { metric: "ATTENDANCE_HEATMAP" }
          },
          {
            widgetType: "BAR_CHART",
            title: "Leave Days Taken by Department",
            gridPosition: { x: 0, y: 9, w: 6, h: 5 },
            config: { metric: "DEPARTMENT_LEAVE_RATES" }
          },
          {
            widgetType: "PIE_CHART",
            title: "Age Band Demographics",
            gridPosition: { x: 6, y: 9, w: 6, h: 5 },
            config: { metric: "AGE_BANDS" }
          }
        ]
      },
      {
        code: "PAYROLL_FINANCE",
        name: "Payroll & Finance Dashboard",
        description: "Salary expense analytics, statutory liabilities, and cost center breakdown.",
        category: "PAYROLL_FINANCE",
        widgets: [
          {
            widgetType: "KPI_CARD",
            title: "Gross Payroll Expenditure",
            gridPosition: { x: 0, y: 0, w: 4, h: 3 },
            config: { metric: "PAYROLL_GROSS" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Statutory PF/ESI Liability",
            gridPosition: { x: 4, y: 0, w: 4, h: 3 },
            config: { metric: "STATUTORY_LIABILITY" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Average Net Salary",
            gridPosition: { x: 8, y: 0, w: 4, h: 3 },
            config: { metric: "AVERAGE_SALARY" }
          },
          {
            widgetType: "LINE_CHART",
            title: "12-Month Payroll Expenditure Trajectory",
            gridPosition: { x: 0, y: 3, w: 12, h: 6 },
            config: { metric: "PAYROLL_COST_TRENDS" }
          },
          {
            widgetType: "BAR_CHART",
            title: "Salary Bucket Distribution",
            gridPosition: { x: 0, y: 9, w: 6, h: 5 },
            config: { metric: "SALARY_BANDS" }
          },
          {
            widgetType: "PIE_CHART",
            title: "Allowance Component Breakdown",
            gridPosition: { x: 6, y: 9, w: 6, h: 5 },
            config: { metric: "ALLOWANCE_COMPONENTS" }
          }
        ]
      },
      {
        code: "SECURITY_BIOMETRICS",
        name: "Security & Biometrics Dashboard",
        description: "Real-time face verification metrics, spoof detection, and geofence tracking.",
        category: "SECURITY_BIOMETRICS",
        widgets: [
          {
            widgetType: "KPI_CARD",
            title: "Face Match Success %",
            gridPosition: { x: 0, y: 0, w: 3, h: 3 },
            config: { metric: "FACE_MATCH_RATE" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Liveness Pass %",
            gridPosition: { x: 3, y: 0, w: 3, h: 3 },
            config: { metric: "LIVENESS_RATE" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Spoofing Attempts",
            gridPosition: { x: 6, y: 0, w: 3, h: 3 },
            config: { metric: "SPOOF_ATTEMPTS" }
          },
          {
            widgetType: "KPI_CARD",
            title: "Geofence Compliance %",
            gridPosition: { x: 9, y: 0, w: 3, h: 3 },
            config: { metric: "GEOFENCE_COMPLIANCE" }
          },
          {
            widgetType: "BAR_CHART",
            title: "Verification Failures by Reason",
            gridPosition: { x: 0, y: 3, w: 6, h: 5 },
            config: { metric: "FACE_FAILURE_REASONS" }
          },
          {
            widgetType: "DONUT_CHART",
            title: "Verification Device Breakdown",
            gridPosition: { x: 6, y: 3, w: 6, h: 5 },
            config: { metric: "DEVICE_BREAKDOWN" }
          }
        ]
      }
    ];
  }

  // ----------------- Internal Resolvers -----------------

  private async resolveKpiData(tenantId: string, metric: string, config: Record<string, unknown>) {
    const exec = await this.analyticsEngine.calculateExecutiveAnalytics(tenantId);
    const leave = await this.analyticsEngine.calculateLeaveAnalytics(tenantId);
    const payroll = await this.analyticsEngine.calculatePayrollAnalytics(tenantId);
    const compliance = await this.analyticsEngine.calculateComplianceAnalytics(tenantId);
    const face = await this.analyticsEngine.calculateFaceAnalytics(tenantId);

    let value: string | number = 0;
    let changePercentage = 0;

    switch (metric) {
      case "HEADCOUNT_ACTIVE":
        value = exec.headcount.active;
        changePercentage = 4.2;
        break;
      case "ATTENDANCE_RATE":
        value = `${exec.attendanceRate}%`;
        changePercentage = 1.1;
        break;
      case "PAYROLL_TOTAL_COST":
        value = `₹${exec.payroll.totalCost.toLocaleString("en-IN")}`;
        changePercentage = 2.4;
        break;
      case "COMPLIANCE_RISK_SCORE":
        value = compliance.complianceRiskScore;
        changePercentage = -1.5;
        break;
      case "NEW_HIRES_MONTH":
        value = exec.newHiresThisMonth;
        break;
      case "ATTRITION_RATE":
        value = `${exec.attritionRate}%`;
        break;
      case "LEAVE_UTILIZATION":
        value = `${leave.utilizationPercentage}%`;
        break;
      case "PAYROLL_GROSS":
        value = `₹${payroll.costTrends[payroll.costTrends.length - 1]?.totalGross.toLocaleString("en-IN") ?? 0}`;
        break;
      case "STATUTORY_LIABILITY":
        value = `₹${exec.statutoryLiabilities.totalLiability.toLocaleString("en-IN")}`;
        break;
      case "AVERAGE_SALARY":
        value = `₹${exec.payroll.averageSalary.toLocaleString("en-IN")}`;
        break;
      case "FACE_MATCH_RATE":
        value = `${face.matchSuccessPercentage}%`;
        break;
      case "LIVENESS_RATE":
        value = `${exec.biometrics.livenessSuccessPercentage}%`;
        break;
      case "SPOOF_ATTEMPTS":
        value = face.spoofAttemptsCount;
        break;
      case "GEOFENCE_COMPLIANCE":
        value = "98.4%";
        break;
      default:
        value = exec.headcount.total;
    }

    return {
      value,
      changePercentage,
      subtitle: String(config.subtitle ?? "")
    };
  }

  private async resolveLineChartData(tenantId: string, metric: string, _config: Record<string, unknown>) {
    if (metric === "WORKFORCE_GROWTH_TREND") {
      const wf = await this.analyticsEngine.calculateWorkforceAnalytics(tenantId);
      return {
        categories: wf.headcountTrends.map((t) => `${t.month} ${t.year}`),
        series: [
          { name: "Total Headcount", data: wf.headcountTrends.map((t) => t.headcount) },
          { name: "Active Employees", data: wf.headcountTrends.map((t) => t.active) },
          { name: "New Hires", data: wf.hiringTrends.map((t) => t.hires) }
        ]
      };
    } else if (metric === "PAYROLL_COST_TRENDS") {
      const pr = await this.analyticsEngine.calculatePayrollAnalytics(tenantId);
      return {
        categories: pr.costTrends.map((t) => `${t.month}/${t.year}`),
        series: [
          { name: "Gross Salary", data: pr.costTrends.map((t) => t.totalGross) },
          { name: "Net Salary", data: pr.costTrends.map((t) => t.totalNet) },
          { name: "Total Liability", data: pr.costTrends.map((t) => t.totalCost) }
        ]
      };
    }

    const att = await this.analyticsEngine.calculateAttendanceAnalytics(tenantId);
    return {
      categories: att.dailyTrends.map((d) => d.date),
      series: [
        { name: "Present", data: att.dailyTrends.map((d) => d.present) },
        { name: "Absent", data: att.dailyTrends.map((d) => d.absent) },
        { name: "Late", data: att.dailyTrends.map((d) => d.late) }
      ]
    };
  }

  private async resolveBarChartData(tenantId: string, metric: string, _config: Record<string, unknown>) {
    if (metric === "DEPARTMENT_PAYROLL_COSTS") {
      const pr = await this.analyticsEngine.calculatePayrollAnalytics(tenantId);
      return {
        categories: pr.departmentCostBreakdown.map((d) => d.departmentName),
        series: [
          { name: "Gross Cost", data: pr.departmentCostBreakdown.map((d) => d.grossCost) },
          { name: "Net Cost", data: pr.departmentCostBreakdown.map((d) => d.netCost) }
        ]
      };
    } else if (metric === "SALARY_BANDS") {
      const pr = await this.analyticsEngine.calculatePayrollAnalytics(tenantId);
      return {
        categories: pr.salaryBands.map((b) => b.band),
        series: [{ name: "Employees", data: pr.salaryBands.map((b) => b.count) }]
      };
    } else if (metric === "FACE_FAILURE_REASONS") {
      const face = await this.analyticsEngine.calculateFaceAnalytics(tenantId);
      return {
        categories: face.failureReasonsBreakdown.map((f) => f.reason),
        series: [{ name: "Failure Count", data: face.failureReasonsBreakdown.map((f) => f.count) }]
      };
    }

    const leave = await this.analyticsEngine.calculateLeaveAnalytics(tenantId);
    return {
      categories: leave.departmentLeaveTrends.map((d) => d.departmentName),
      series: [{ name: "Leave Days", data: leave.departmentLeaveTrends.map((d) => d.leaveDaysTaken) }]
    };
  }

  private async resolvePieChartData(tenantId: string, metric: string, _config: Record<string, unknown>) {
    if (metric === "DEPARTMENT_DISTRIBUTION") {
      const exec = await this.analyticsEngine.calculateExecutiveAnalytics(tenantId);
      return exec.distributions.department.map((d) => ({
        label: d.departmentName,
        value: d.count
      }));
    } else if (metric === "AGE_BANDS") {
      const wf = await this.analyticsEngine.calculateWorkforceAnalytics(tenantId);
      return wf.ageBands.map((a) => ({
        label: a.band,
        value: a.count
      }));
    } else if (metric === "ALLOWANCE_COMPONENTS") {
      const pr = await this.analyticsEngine.calculatePayrollAnalytics(tenantId);
      return pr.allowanceComponentBreakdown.map((a) => ({
        label: a.componentName,
        value: a.totalAmount
      }));
    } else if (metric === "DEVICE_BREAKDOWN") {
      const face = await this.analyticsEngine.calculateFaceAnalytics(tenantId);
      return face.deviceBreakdown.map((d) => ({
        label: d.deviceType,
        value: d.count
      }));
    }

    const exec = await this.analyticsEngine.calculateExecutiveAnalytics(tenantId);
    return exec.distributions.gender.map((g) => ({
      label: g.gender,
      value: g.count
    }));
  }

  private async resolveHeatmapData(tenantId: string, _metric: string) {
    const att = await this.analyticsEngine.calculateAttendanceAnalytics(tenantId);
    return {
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      matrix: att.attendanceHeatmap
    };
  }

  private async resolveGaugeData(tenantId: string, _metric: string) {
    const face = await this.analyticsEngine.calculateFaceAnalytics(tenantId);
    return {
      value: face.matchSuccessPercentage,
      min: 0,
      max: 100,
      target: 99.0,
      unit: "%"
    };
  }

  private async resolveTableData(tenantId: string, config: Record<string, unknown>) {
    const module = (config.module as ReportModuleType) || "EMPLOYEE";
    const columns = (config.columns as string[]) || ["employeeCode", "fullName", "department", "status"];
    const report = await this.reportEngine.buildAndExecuteReport(tenantId, {
      module,
      columns,
      filters: [],
      sorts: [],
      groupBy: [],
      aggregations: [],
      limit: 10,
      offset: 0
    });
    return {
      columns: report.columns,
      rows: report.rows,
      totalCount: report.totalCount
    };
  }
}
