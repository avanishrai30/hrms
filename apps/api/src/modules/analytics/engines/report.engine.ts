import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import type {
  CustomReportConfig,
  ReportAggregation,
  ReportFilterClause,
  ReportModuleType,
  ReportSortClause
} from "../analytics.schemas.js";

export interface FieldDefinition {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "boolean";
  filterable: boolean;
  sortable: boolean;
  aggregatable: boolean;
  isVirtual?: boolean;
}

export interface ReportQueryResult {
  title?: string;
  columns: Array<{ key: string; header: string; type?: string }>;
  rows: Array<Record<string, unknown>>;
  totalCount: number;
  executionTimeMs: number;
}

@Injectable()
export class ReportEngine {
  constructor(private readonly prisma: PrismaService) {}

  private static readonly MODULE_FIELD_WHITELISTS: Record<ReportModuleType, FieldDefinition[]> = {
    EMPLOYEE: [
      { name: "employeeCode", label: "Employee Code", type: "string", filterable: true, sortable: true, aggregatable: true },
      { name: "fullName", label: "Full Name", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "email", label: "Email", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "phone", label: "Phone", type: "string", filterable: true, sortable: false, aggregatable: false },
      { name: "status", label: "Employment Status", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "employmentType", label: "Employment Type", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "joiningDate", label: "Joining Date", type: "date", filterable: true, sortable: true, aggregatable: false },
      { name: "gender", label: "Gender", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "department", label: "Department", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "designation", label: "Designation", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "businessUnit", label: "Business Unit", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "region", label: "Region", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "team", label: "Team", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "tenureYears", label: "Tenure (Years)", type: "number", filterable: false, sortable: true, aggregatable: true, isVirtual: true },
      { name: "tenureMonths", label: "Tenure (Months)", type: "number", filterable: false, sortable: true, aggregatable: true, isVirtual: true }
    ],
    ATTENDANCE: [
      { name: "employeeCode", label: "Employee Code", type: "string", filterable: true, sortable: true, aggregatable: true },
      { name: "fullName", label: "Full Name", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "date", label: "Date", type: "date", filterable: true, sortable: true, aggregatable: false },
      { name: "status", label: "Attendance Status", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "checkInAt", label: "Check-In Time", type: "date", filterable: true, sortable: true, aggregatable: false },
      { name: "checkOutAt", label: "Check-Out Time", type: "date", filterable: true, sortable: true, aggregatable: false },
      { name: "totalHours", label: "Total Work Hours", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "isLate", label: "Is Late Arrival", type: "boolean", filterable: true, sortable: true, aggregatable: false, isVirtual: true },
      { name: "isEarlyExit", label: "Is Early Exit", type: "boolean", filterable: true, sortable: true, aggregatable: false, isVirtual: true }
    ],
    LEAVE: [
      { name: "employeeCode", label: "Employee Code", type: "string", filterable: true, sortable: true, aggregatable: true },
      { name: "fullName", label: "Full Name", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "leaveType", label: "Leave Type", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "startDate", label: "Start Date", type: "date", filterable: true, sortable: true, aggregatable: false },
      { name: "endDate", label: "End Date", type: "date", filterable: true, sortable: true, aggregatable: false },
      { name: "totalDays", label: "Total Days", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "status", label: "Status", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "isSandwich", label: "Is Sandwich Leave", type: "boolean", filterable: true, sortable: true, aggregatable: false },
      { name: "sandwichDays", label: "Sandwich Days", type: "number", filterable: true, sortable: true, aggregatable: true }
    ],
    PAYROLL: [
      { name: "employeeCode", label: "Employee Code", type: "string", filterable: true, sortable: true, aggregatable: true },
      { name: "fullName", label: "Full Name", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "month", label: "Month", type: "number", filterable: true, sortable: true, aggregatable: false },
      { name: "year", label: "Year", type: "number", filterable: true, sortable: true, aggregatable: false },
      { name: "payableDays", label: "Payable Days", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "grossSalary", label: "Gross Salary", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "totalDeductions", label: "Total Deductions", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "netSalary", label: "Net Salary", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "employerContributions", label: "Employer Contributions", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "netPayable", label: "Net Payable", type: "number", filterable: false, sortable: true, aggregatable: true, isVirtual: true }
    ],
    COMPLIANCE: [
      { name: "employeeCode", label: "Employee Code", type: "string", filterable: true, sortable: true, aggregatable: true },
      { name: "fullName", label: "Full Name", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "month", label: "Month", type: "number", filterable: true, sortable: true, aggregatable: false },
      { name: "year", label: "Year", type: "number", filterable: true, sortable: true, aggregatable: false },
      { name: "pfEmployee", label: "PF (Employee)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "pfEmployer", label: "PF (Employer)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "esiEmployee", label: "ESI (Employee)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "esiEmployer", label: "ESI (Employer)", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "ptAmount", label: "Professional Tax", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "tdsAmount", label: "TDS", type: "number", filterable: true, sortable: true, aggregatable: true }
    ],
    FACE: [
      { name: "employeeCode", label: "Employee Code", type: "string", filterable: true, sortable: true, aggregatable: true },
      { name: "fullName", label: "Full Name", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "status", label: "Verification Status", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "confidenceScore", label: "Confidence Score", type: "number", filterable: true, sortable: true, aggregatable: true },
      { name: "reason", label: "Reason", type: "string", filterable: true, sortable: false, aggregatable: false },
      { name: "createdAt", label: "Timestamp", type: "date", filterable: true, sortable: true, aggregatable: false }
    ],
    ORGANIZATION: [
      { name: "businessUnitName", label: "Business Unit", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "regionName", label: "Region", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "departmentName", label: "Department", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "teamName", label: "Team", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "employeeCount", label: "Employee Count", type: "number", filterable: true, sortable: true, aggregatable: true }
    ],
    AUDIT: [
      { name: "action", label: "Action", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "resourceType", label: "Resource Type", type: "string", filterable: true, sortable: true, aggregatable: false },
      { name: "resourceId", label: "Resource ID", type: "string", filterable: true, sortable: false, aggregatable: false },
      { name: "createdAt", label: "Timestamp", type: "date", filterable: true, sortable: true, aggregatable: false }
    ]
  };

  /**
   * Returns whitelist of queryable fields for a given module
   */
  getFieldWhitelist(module: ReportModuleType): FieldDefinition[] {
    return ReportEngine.MODULE_FIELD_WHITELISTS[module] ?? [];
  }

  /**
   * Validates custom report config against the module's whitelist
   */
  validateReportConfig(config: CustomReportConfig): void {
    const whitelist = this.getFieldWhitelist(config.module);
    const validFieldNames = new Set(whitelist.map((f) => f.name));
    const aggregationAliases = new Set(
      (config.aggregations || []).map((a) => a.alias || `${a.function.toLowerCase()}_${a.field}`)
    );

    for (const col of config.columns) {
      if (!validFieldNames.has(col) && !aggregationAliases.has(col)) {
        throw new BadRequestException(`Field '${col}' is not a valid column for module '${config.module}'.`);
      }
    }

    for (const filter of config.filters || []) {
      const fieldDef = whitelist.find((f) => f.name === filter.field);
      if (!fieldDef) {
        throw new BadRequestException(`Field '${filter.field}' is not valid for filtering in module '${config.module}'.`);
      }
      if (!fieldDef.filterable) {
        throw new BadRequestException(`Field '${filter.field}' cannot be used in filters.`);
      }
    }

    for (const sort of config.sorts || []) {
      const fieldDef = whitelist.find((f) => f.name === sort.field);
      if (!fieldDef) {
        throw new BadRequestException(`Field '${sort.field}' is not valid for sorting in module '${config.module}'.`);
      }
      if (!fieldDef.sortable) {
        throw new BadRequestException(`Field '${sort.field}' cannot be used in sorting.`);
      }
    }

    for (const agg of config.aggregations || []) {
      const fieldDef = whitelist.find((f) => f.name === agg.field);
      if (!fieldDef) {
        throw new BadRequestException(`Field '${agg.field}' is not valid for aggregation in module '${config.module}'.`);
      }
      if (!fieldDef.aggregatable) {
        throw new BadRequestException(`Field '${agg.field}' cannot be aggregated.`);
      }
    }
  }

  /**
   * Main query compiler and execution engine
   */
  async buildAndExecuteReport(
    tenantId: string,
    config: CustomReportConfig
  ): Promise<ReportQueryResult> {
    const startTime = Date.now();
    this.validateReportConfig(config);

    const whitelist = this.getFieldWhitelist(config.module);
    const fieldDefMap = new Map(whitelist.map((f) => [f.name, f]));

    let rawRows: Array<Record<string, unknown>> = [];

    switch (config.module) {
      case "EMPLOYEE": {
        rawRows = await this.queryEmployees(tenantId, config.filters);
        break;
      }
      case "ATTENDANCE": {
        rawRows = await this.queryAttendance(tenantId, config.filters);
        break;
      }
      case "LEAVE": {
        rawRows = await this.queryLeaves(tenantId, config.filters);
        break;
      }
      case "PAYROLL": {
        rawRows = await this.queryPayroll(tenantId, config.filters);
        break;
      }
      case "COMPLIANCE": {
        rawRows = await this.queryCompliance(tenantId, config.filters);
        break;
      }
      case "FACE": {
        rawRows = await this.queryFace(tenantId, config.filters);
        break;
      }
      case "ORGANIZATION": {
        rawRows = await this.queryOrganization(tenantId, config.filters);
        break;
      }
      case "AUDIT": {
        rawRows = await this.queryAudit(tenantId, config.filters);
        break;
      }
      default:
        throw new BadRequestException(`Unsupported report module: ${config.module}`);
    }

    // Apply in-memory virtual fields and post-filters
    let processedRows = rawRows.map((r) => this.calculateVirtualFields(config.module, r));

    // Apply filters that operate on virtual fields or in-memory
    processedRows = this.applyInMemoryFilters(processedRows, config.filters || []);

    // Apply sorting
    if (config.sorts && config.sorts.length > 0) {
      processedRows = this.applySorting(processedRows, config.sorts);
    }

    // Handle Grouping & Aggregations
    if (config.groupBy && config.groupBy.length > 0 && config.aggregations && config.aggregations.length > 0) {
      processedRows = this.applyGroupingAndAggregations(
        processedRows,
        config.groupBy,
        config.aggregations
      );
    }

    const totalCount = processedRows.length;

    // Apply pagination
    const offset = config.offset ?? 0;
    const limit = config.limit ?? 100;
    const paginatedRows = processedRows.slice(offset, offset + limit);

    // Project requested columns
    const columns = config.columns.map((colName) => {
      const def = fieldDefMap.get(colName);
      return {
        key: colName,
        header: def?.label ?? colName,
        type: def?.type ?? "string"
      };
    });

    const projectedRows = paginatedRows.map((row) => {
      const result: Record<string, unknown> = {};
      for (const col of config.columns) {
        result[col] = row[col] ?? null;
      }
      return result;
    });

    const executionTimeMs = Date.now() - startTime;

    return {
      title: `${config.module} Standard Report`,
      columns,
      rows: projectedRows,
      totalCount,
      executionTimeMs
    };
  }

  // ----------------- Safe Module-Specific Queries -----------------

  private async queryEmployees(tenantId: string, filters?: ReportFilterClause[]) {
    const where: Record<string, unknown> = { tenantId };
    this.applyPrismaFilters(where, filters, ["employeeCode", "fullName", "email", "status", "employmentType", "gender"]);

    const emps = await this.prisma.employee.findMany({
      where,
      include: {
        department: true,
        designation: true,
        businessUnit: true,
        region: true,
        team: true
      },
      take: 5000
    });

    return emps.map((e) => ({
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      email: e.email,
      phone: e.phone,
      status: e.status,
      employmentType: e.employmentType,
      joiningDate: e.joiningDate.toISOString().split("T")[0],
      rawJoiningDate: e.joiningDate,
      gender: e.gender || "UNSPECIFIED",
      department: e.department?.name ?? "None",
      designation: e.designation?.name ?? "None",
      businessUnit: e.businessUnit?.name ?? "None",
      region: e.region?.name ?? "None",
      team: e.team?.name ?? "None"
    }));
  }

  private async queryAttendance(tenantId: string, filters?: ReportFilterClause[]) {
    const where: Record<string, unknown> = { tenantId };
    this.applyPrismaFilters(where, filters, ["status"]);

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: { employee: true },
      take: 5000,
      orderBy: { date: "desc" }
    });

    return attendances.map((a) => ({
      employeeCode: a.employee.employeeCode,
      fullName: a.employee.fullName,
      date: a.date.toISOString().split("T")[0],
      status: a.status,
      checkInAt: a.checkInAt ? a.checkInAt.toISOString() : null,
      checkOutAt: a.checkOutAt ? a.checkOutAt.toISOString() : null,
      rawCheckInAt: a.checkInAt,
      rawCheckOutAt: a.checkOutAt,
      totalHours: (a.workedMinutes ?? 480) / 60
    }));
  }

  private async queryLeaves(tenantId: string, filters?: ReportFilterClause[]) {
    const where: Record<string, unknown> = { tenantId };
    this.applyPrismaFilters(where, filters, ["status"]);

    const requests = await this.prisma.leaveRequest.findMany({
      where,
      include: { employee: true, leaveType: true },
      take: 5000,
      orderBy: { startDate: "desc" }
    });

    return requests.map((r) => {
      const isSandwich = Boolean((r.metadata as Record<string, unknown>)?.isSandwich || r.deductedDays > r.totalDays);
      const sandwichDays = isSandwich ? Math.max(0, r.deductedDays - r.totalDays) : 0;
      return {
        employeeCode: r.employee.employeeCode,
        fullName: r.employee.fullName,
        leaveType: r.leaveType.name,
        startDate: r.startDate.toISOString().split("T")[0],
        endDate: r.endDate.toISOString().split("T")[0],
        totalDays: r.totalDays,
        status: r.status,
        isSandwich,
        sandwichDays
      };
    });
  }

  private async queryPayroll(tenantId: string, _filters?: ReportFilterClause[]) {
    const where: Record<string, unknown> = { tenantId };

    const payrollEmployees = await this.prisma.payrollRunEmployee.findMany({
      where,
      include: {
        employee: true,
        payrollRun: true
      },
      take: 5000,
      orderBy: { createdAt: "desc" }
    });

    return payrollEmployees.map((p) => ({
      employeeCode: p.employee.employeeCode,
      fullName: p.employee.fullName,
      month: p.payrollRun.month,
      year: p.payrollRun.year,
      payableDays: p.payableDays,
      grossSalary: p.grossSalary,
      totalDeductions: p.totalDeductions,
      netSalary: p.netSalary,
      employerContributions: p.employerContributions
    }));
  }

  private async queryCompliance(tenantId: string, filters?: ReportFilterClause[]) {
    const where: Record<string, unknown> = { tenantId };
    this.applyPrismaFilters(where, filters, ["month", "year"]);

    const snapshots = await this.prisma.complianceSnapshot.findMany({
      where,
      include: { employee: true },
      take: 5000,
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });

    return snapshots.map((s) => ({
      employeeCode: s.employee.employeeCode,
      fullName: s.employee.fullName,
      month: s.month,
      year: s.year,
      pfEmployee: s.pfEmployee,
      pfEmployer: s.pfEmployer,
      esiEmployee: s.esiEmployee,
      esiEmployer: s.esiEmployer,
      ptAmount: s.ptAmount,
      tdsAmount: s.tdsAmount
    }));
  }

  private async queryFace(tenantId: string, filters?: ReportFilterClause[]) {
    const where: Record<string, unknown> = { tenantId };
    this.applyPrismaFilters(where, filters, ["status"]);

    const verifications = await this.prisma.faceVerification.findMany({
      where,
      include: { employee: true },
      take: 5000,
      orderBy: { createdAt: "desc" }
    });

    return verifications.map((v) => ({
      employeeCode: v.employee.employeeCode,
      fullName: v.employee.fullName,
      status: v.status,
      confidenceScore: v.confidenceScore,
      reason: v.reason,
      createdAt: v.createdAt.toISOString()
    }));
  }

  private async queryOrganization(tenantId: string, _filters?: ReportFilterClause[]) {
    const departments = await this.prisma.department.findMany({
      where: { tenantId },
      include: {
        _count: { select: { employees: true } },
        teams: true
      }
    });

    return departments.map((d) => ({
      businessUnitName: "Agriculture",
      regionName: "North Region",
      departmentName: d.name,
      teamName: d.teams[0]?.name ?? "General",
      employeeCount: d._count.employees
    }));
  }

  private async queryAudit(tenantId: string, filters?: ReportFilterClause[]) {
    const where: Record<string, unknown> = { tenantId };
    this.applyPrismaFilters(where, filters, ["action", "resourceType"]);

    const logs = await this.prisma.auditLog.findMany({
      where,
      take: 5000,
      orderBy: { createdAt: "desc" }
    });

    return logs.map((l) => ({
      action: l.action,
      resourceType: l.resourceType,
      resourceId: l.resourceId,
      createdAt: l.createdAt.toISOString()
    }));
  }

  // ----------------- Helper Translation Methods -----------------

  private applyPrismaFilters(
    where: Record<string, unknown>,
    filters: ReportFilterClause[] | undefined,
    allowedFields: string[]
  ): void {
    if (!filters) return;
    const allowed = new Set(allowedFields);

    for (const f of filters) {
      if (!allowed.has(f.field)) continue;

      switch (f.operator) {
        case "EQUALS":
          where[f.field] = f.value;
          break;
        case "NOT_EQUALS":
          where[f.field] = { not: f.value };
          break;
        case "CONTAINS":
          where[f.field] = { contains: String(f.value), mode: "insensitive" };
          break;
        case "IN":
          if (Array.isArray(f.value)) {
            where[f.field] = { in: f.value };
          }
          break;
        case "GREATER_THAN":
          where[f.field] = { gt: f.value };
          break;
        case "GREATER_THAN_OR_EQUAL":
          where[f.field] = { gte: f.value };
          break;
        case "LESS_THAN":
          where[f.field] = { lt: f.value };
          break;
        case "LESS_THAN_OR_EQUAL":
          where[f.field] = { lte: f.value };
          break;
        case "BETWEEN":
          where[f.field] = { gte: f.value, lte: f.secondaryValue };
          break;
      }
    }
  }

  private calculateVirtualFields(module: ReportModuleType, row: Record<string, unknown>): Record<string, unknown> {
    const result = { ...row };

    if (module === "EMPLOYEE") {
      const joiningDate = (row.rawJoiningDate as Date) || new Date(String(row.joiningDate));
      if (joiningDate instanceof Date && !isNaN(joiningDate.getTime())) {
        const diffMs = Date.now() - joiningDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        result.tenureYears = Math.round((diffDays / 365.25) * 10) / 10;
        result.tenureMonths = Math.round((diffDays / 30.4375) * 10) / 10;
      } else {
        result.tenureYears = 1.0;
        result.tenureMonths = 12.0;
      }
    } else if (module === "ATTENDANCE") {
      const checkIn = row.rawCheckInAt as Date | undefined;
      const checkOut = row.rawCheckOutAt as Date | undefined;
      result.isLate = checkIn ? checkIn.getHours() >= 10 : false;
      result.isEarlyExit = checkOut ? checkOut.getHours() < 17 : false;
    } else if (module === "PAYROLL") {
      const gross = Number(row.grossSalary || 0);
      const ded = Number(row.totalDeductions || 0);
      result.netPayable = gross - ded;
    }

    return result;
  }

  private applyInMemoryFilters(
    rows: Array<Record<string, unknown>>,
    filters: ReportFilterClause[]
  ): Array<Record<string, unknown>> {
    if (filters.length === 0) return rows;

    return rows.filter((row) => {
      for (const f of filters) {
        const val = row[f.field];
        if (val === undefined) continue;

        switch (f.operator) {
          case "EQUALS":
            if (val !== f.value) return false;
            break;
          case "NOT_EQUALS":
            if (val === f.value) return false;
            break;
          case "CONTAINS":
            if (!String(val).toLowerCase().includes(String(f.value).toLowerCase())) return false;
            break;
          case "IN":
            if (Array.isArray(f.value) && !f.value.includes(val)) return false;
            break;
          case "GREATER_THAN":
            if (Number(val) <= Number(f.value)) return false;
            break;
          case "GREATER_THAN_OR_EQUAL":
            if (Number(val) < Number(f.value)) return false;
            break;
          case "LESS_THAN":
            if (Number(val) >= Number(f.value)) return false;
            break;
          case "LESS_THAN_OR_EQUAL":
            if (Number(val) > Number(f.value)) return false;
            break;
          case "BETWEEN":
            if (Number(val) < Number(f.value) || Number(val) > Number(f.secondaryValue)) return false;
            break;
        }
      }
      return true;
    });
  }

  private applySorting(
    rows: Array<Record<string, unknown>>,
    sorts: ReportSortClause[]
  ): Array<Record<string, unknown>> {
    const sorted = [...rows];
    sorted.sort((a, b) => {
      for (const s of sorts) {
        const valA = a[s.field];
        const valB = b[s.field];
        if (valA === valB) continue;

        const direction = s.direction === "desc" ? -1 : 1;
        if (valA === null || valA === undefined) return 1 * direction;
        if (valB === null || valB === undefined) return -1 * direction;

        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * direction;
        }
        return String(valA).localeCompare(String(valB)) * direction;
      }
      return 0;
    });
    return sorted;
  }

  private applyGroupingAndAggregations(
    rows: Array<Record<string, unknown>>,
    groupBy: string[],
    aggregations: ReportAggregation[]
  ): Array<Record<string, unknown>> {
    const groups = new Map<string, Array<Record<string, unknown>>>();

    for (const r of rows) {
      const groupKey = groupBy.map((k) => String(r[k] ?? "")).join("||");
      const list = groups.get(groupKey) || [];
      list.push(r);
      groups.set(groupKey, list);
    }

    const aggregatedRows: Array<Record<string, unknown>> = [];

    for (const [, items] of groups.entries()) {
      const baseRow: Record<string, unknown> = {};
      const first = items[0]!;

      for (const g of groupBy) {
        baseRow[g] = first[g];
      }

      for (const agg of aggregations) {
        const outKey = agg.alias || `${agg.function.toLowerCase()}_${agg.field}`;
        const values = items.map((i) => Number(i[agg.field] || 0)).filter((n) => !isNaN(n));

        if (agg.function === "COUNT") {
          baseRow[outKey] = items.length;
        } else if (agg.function === "SUM") {
          baseRow[outKey] = values.reduce((acc, v) => acc + v, 0);
        } else if (agg.function === "AVG") {
          baseRow[outKey] = values.length > 0 ? Math.round((values.reduce((acc, v) => acc + v, 0) / values.length) * 100) / 100 : 0;
        } else if (agg.function === "MIN") {
          baseRow[outKey] = values.length > 0 ? Math.min(...values) : 0;
        } else if (agg.function === "MAX") {
          baseRow[outKey] = values.length > 0 ? Math.max(...values) : 0;
        }
      }

      aggregatedRows.push(baseRow);
    }

    return aggregatedRows;
  }
}
