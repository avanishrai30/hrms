"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type {
  AnalyticsSourceModule,
  ReportAggregation,
  ReportFieldDescriptor,
  ReportFilterClause,
  ReportFilterOperator,
  ReportFormat,
  ReportSortClause,
  SavedReportView
} from "@vc-wms/shared-types";

// Field Descriptors by Source Module
const MODULE_FIELD_DEFINITIONS: Record<AnalyticsSourceModule, ReportFieldDescriptor[]> = {
  EMPLOYEE: [
    { key: "employeeCode", label: "Employee Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "fullName", label: "Full Name", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "email", label: "Work Email", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "phone", label: "Phone Number", type: "string", isFilterable: true, isSortable: false, isAggregatable: false },
    { key: "department", label: "Department", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "designation", label: "Designation / Role", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "status", label: "Employment Status", type: "enum", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "employmentType", label: "Employment Type", type: "enum", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "salaryType", label: "Salary Type", type: "enum", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "joiningDate", label: "Joining Date", type: "date", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "businessUnit", label: "Business Unit", type: "string", isFilterable: true, isSortable: true, isAggregatable: false }
  ],
  ATTENDANCE: [
    { key: "employeeCode", label: "Employee Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "fullName", label: "Full Name", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "date", label: "Attendance Date", type: "date", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "status", label: "Attendance Status", type: "enum", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "checkInAt", label: "Check-In Timestamp", type: "date", isFilterable: false, isSortable: true, isAggregatable: false },
    { key: "checkOutAt", label: "Check-Out Timestamp", type: "date", isFilterable: false, isSortable: true, isAggregatable: false },
    { key: "workedMinutes", label: "Worked Minutes", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "totalHours", label: "Total Hours", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "lateMinutes", label: "Late Minutes", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "overtimeMinutes", label: "Overtime Minutes", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "isManual", label: "Manual Entry Flag", type: "boolean", isFilterable: true, isSortable: false, isAggregatable: false }
  ],
  LEAVE: [
    { key: "employeeCode", label: "Employee Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "fullName", label: "Full Name", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "leaveType", label: "Leave Type", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "startDate", label: "Start Date", type: "date", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "endDate", label: "End Date", type: "date", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "totalDays", label: "Total Requested Days", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "deductedDays", label: "Deducted Days", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "status", label: "Leave Status", type: "enum", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "isSandwich", label: "Sandwich Policy Applied", type: "boolean", isFilterable: true, isSortable: false, isAggregatable: false },
    { key: "reason", label: "Reason / Notes", type: "string", isFilterable: true, isSortable: false, isAggregatable: false }
  ],
  PAYROLL: [
    { key: "employeeCode", label: "Employee Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "fullName", label: "Full Name", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "period", label: "Payroll Cycle / Period", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "grossSalary", label: "Gross Salary (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "totalDeductions", label: "Total Deductions (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "netSalary", label: "Net Payout (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "employerContributions", label: "Employer Contributions (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "status", label: "Payout Status", type: "string", isFilterable: true, isSortable: true, isAggregatable: false }
  ],
  COMPLIANCE: [
    { key: "employeeCode", label: "Employee Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "fullName", label: "Full Name", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "period", label: "Compliance Period", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "pfEmployee", label: "PF Employee (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "pfEmployer", label: "PF Employer (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "esiEmployee", label: "ESI Employee (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "esiEmployer", label: "ESI Employer (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "ptAmount", label: "Professional Tax (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "tdsAmount", label: "TDS / Income Tax (₹)", type: "number", isFilterable: true, isSortable: true, isAggregatable: true }
  ],
  FACE: [
    { key: "employeeCode", label: "Employee Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "fullName", label: "Full Name", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "status", label: "Verification Status", type: "enum", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "confidenceScore", label: "Match Confidence", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "enrolledVersion", label: "Model Version", type: "string", isFilterable: true, isSortable: false, isAggregatable: false },
    { key: "lastUpdated", label: "Last Verified Date", type: "date", isFilterable: true, isSortable: true, isAggregatable: false }
  ],
  ORGANIZATION: [
    { key: "code", label: "Department / Unit Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "name", label: "Department Name", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "businessUnit", label: "Business Unit", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "employeeCount", label: "Total Headcount", type: "number", isFilterable: true, isSortable: true, isAggregatable: true },
    { key: "status", label: "Active Status", type: "string", isFilterable: true, isSortable: true, isAggregatable: false }
  ],
  AUDIT: [
    { key: "action", label: "Security Action Code", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "resourceType", label: "Resource Domain", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "resourceId", label: "Resource ID", type: "string", isFilterable: true, isSortable: false, isAggregatable: false },
    { key: "actorUserId", label: "Actor User ID", type: "string", isFilterable: true, isSortable: true, isAggregatable: false },
    { key: "ipAddress", label: "Client IP Address", type: "string", isFilterable: true, isSortable: false, isAggregatable: false },
    { key: "createdAt", label: "Timestamp", type: "date", isFilterable: true, isSortable: true, isAggregatable: false }
  ]
};

const OPERATORS: Array<{ value: ReportFilterOperator; label: string }> = [
  { value: "EQUALS", label: "Equals (=)" },
  { value: "NOT_EQUALS", label: "Not Equals (!=)" },
  { value: "CONTAINS", label: "Contains (text)" },
  { value: "IN", label: "In List (comma separated)" },
  { value: "GREATER_THAN", label: "Greater Than (>)" },
  { value: "GREATER_THAN_OR_EQUAL", label: "Greater or Equal (>=)" },
  { value: "LESS_THAN", label: "Less Than (<)" },
  { value: "LESS_THAN_OR_EQUAL", label: "Less or Equal (<=)" },
  { value: "BETWEEN", label: "Between (range)" }
];

export default function ReportBuilderPage() {
  const router = useRouter();

  // Builder Config State
  const [reportTitle] = useState("Custom Executive Query");
  const [reportDescription] = useState("");
  const [selectedModule, setSelectedModule] = useState<AnalyticsSourceModule>("EMPLOYEE");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "employeeCode",
    "fullName",
    "department",
    "designation",
    "status",
    "joiningDate"
  ]);

  // Search in column picker
  const [columnSearch, setColumnSearch] = useState("");

  // Filters state
  const [filters, setFilters] = useState<ReportFilterClause[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Group By
  const [groupByField, setGroupByField] = useState<string>("");

  // Aggregations state
  const [aggregations, setAggregations] = useState<ReportAggregation[]>([]);

  // Execution & Live Preview State
  const [previewResult, setPreviewResult] = useState<{
    title: string;
    columns: Array<{ key: string; header: string }>;
    rows: Array<Record<string, unknown>>;
    rowCount: number;
    executionTimeMs: number;
  } | null>(null);

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination for live preview
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageSize, setPreviewPageSize] = useState(10);
  const [previewSearch, setPreviewSearch] = useState("");

  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [saveIsShared, setSaveIsShared] = useState(false);
  const [saveIsPublic, setSaveIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedName, setSchedName] = useState("");
  const [schedFreq, setSchedFreq] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY">("MONTHLY");
  const [schedEmails, setSchedEmails] = useState("reports@vcorganics.com");
  const [schedFormat, setSchedFormat] = useState<ReportFormat>("CSV");
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  const availableFields = useMemo(() => {
    return MODULE_FIELD_DEFINITIONS[selectedModule] || [];
  }, [selectedModule]);

  // When module changes, reset columns to standard defaults
  const handleModuleChange = (newMod: AnalyticsSourceModule) => {
    setSelectedModule(newMod);
    const defaults = (MODULE_FIELD_DEFINITIONS[newMod] || []).slice(0, 6).map((f) => f.key);
    setSelectedColumns(defaults);
    setFilters([]);
    setSortField("");
    setGroupByField("");
    setAggregations([]);
    setPreviewResult(null);
  };

  // Column Picker helpers
  const filteredAvailableFields = useMemo(() => {
    if (!columnSearch.trim()) return availableFields;
    const q = columnSearch.toLowerCase();
    return availableFields.filter((f) => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q));
  }, [availableFields, columnSearch]);

  const toggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length === 1) return; // keep at least 1 column
      setSelectedColumns(selectedColumns.filter((c) => c !== key));
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  const selectAllColumns = () => {
    setSelectedColumns(availableFields.map((f) => f.key));
  };

  const clearColumns = () => {
    if (availableFields[0]) {
      setSelectedColumns([availableFields[0].key]);
    }
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedColumns.length) return;
    const next = [...selectedColumns];
    const item = next[index];
    if (item !== undefined) {
      next.splice(index, 1);
      next.splice(newIdx, 0, item);
      setSelectedColumns(next);
    }
  };

  // Filter Row Management
  const addFilterRow = () => {
    const firstField = availableFields[0]?.key || "status";
    setFilters([
      ...filters,
      {
        field: firstField,
        operator: "EQUALS",
        value: ""
      }
    ]);
  };

  const updateFilterRow = (index: number, patch: Partial<ReportFilterClause>) => {
    const next = [...filters];
    if (next[index]) {
      next[index] = { ...next[index]!, ...patch };
      setFilters(next);
    }
  };

  const removeFilterRow = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Aggregation Management
  const addAggregationRow = () => {
    const numericFields = availableFields.filter((f) => f.isAggregatable || f.type === "number");
    const targetField = numericFields[0]?.key || availableFields[0]?.key || "status";
    setAggregations([
      ...aggregations,
      {
        field: targetField,
        function: "COUNT",
        alias: `Total ${targetField}`
      }
    ]);
  };

  const updateAggregationRow = (index: number, patch: Partial<ReportAggregation>) => {
    const next = [...aggregations];
    if (next[index]) {
      next[index] = { ...next[index]!, ...patch };
      setAggregations(next);
    }
  };

  const removeAggregationRow = (index: number) => {
    setAggregations(aggregations.filter((_, i) => i !== index));
  };

  // Execute Live Query Preview
  const handleExecutePreview = async () => {
    try {
      setIsLoadingPreview(true);
      setError(null);
      setPreviewPage(1);

      const sortClauses: ReportSortClause[] = sortField
        ? [{ field: sortField, direction: sortDirection }]
        : [];

      const payload = {
        sourceModule: selectedModule,
        columns: selectedColumns,
        filters,
        sort: sortClauses,
        groupBy: groupByField ? [groupByField] : [],
        aggregations,
        format: "JSON"
      };

      const res = await apiRequest<{
        title: string;
        columns: Array<{ key: string; header: string }>;
        rows: Array<Record<string, unknown>>;
        rowCount: number;
        executionTimeMs: number;
      }>("/reports/execute", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setPreviewResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute report preview.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    void handleExecutePreview();
  }, [selectedModule]);

  // Export from Builder
  const handleExport = async (format: ReportFormat) => {
    try {
      setIsExporting(true);
      setError(null);

      const payload = {
        sourceModule: selectedModule,
        columns: selectedColumns,
        filters,
        sort: sortField ? [{ field: sortField, direction: sortDirection }] : [],
        groupBy: groupByField ? [groupByField] : [],
        aggregations,
        format
      };

      const res = await fetch("/api/v1/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to generate export file.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "EXCEL" ? "xls" : format.toLowerCase();
      a.download = `${selectedModule.toLowerCase()}_report_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to export report.");
    } finally {
      setIsExporting(false);
    }
  };

  // Save Report Modal Submit
  const handleSaveReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);

      const saved = await apiRequest<SavedReportView>("/reports/saved", {
        method: "POST",
        body: JSON.stringify({
          name: saveName || reportTitle,
          description: saveDesc || reportDescription,
          sourceModule: selectedModule,
          columns: selectedColumns,
          filters,
          sort: sortField ? [{ field: sortField, direction: sortDirection }] : [],
          groupBy: groupByField ? [groupByField] : [],
          aggregations,
          isShared: saveIsShared,
          isPublic: saveIsPublic
        })
      });

      setShowSaveModal(false);
      setSuccessMsg(`Report '${saved.name}' saved successfully to your directory!`);
      setTimeout(() => {
        router.push("/reports/saved" as Route);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save report.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Schedule Modal Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingSchedule(true);
      setError(null);

      // First save report definition to get a savedReportId
      const saved = await apiRequest<SavedReportView>("/reports/saved", {
        method: "POST",
        body: JSON.stringify({
          name: schedName || `${reportTitle} Schedule Source`,
          description: "Source report for automated schedule.",
          sourceModule: selectedModule,
          columns: selectedColumns,
          filters,
          sort: sortField ? [{ field: sortField, direction: sortDirection }] : [],
          groupBy: groupByField ? [groupByField] : [],
          aggregations,
          isShared: true,
          isPublic: true
        })
      });

      // Then create schedule
      await apiRequest("/reports/schedules", {
        method: "POST",
        body: JSON.stringify({
          savedReportId: saved.id,
          name: schedName || `${reportTitle} Automated Delivery`,
          frequency: schedFreq,
          recipients: schedEmails.split(",").map((em) => em.trim()),
          format: schedFormat
        })
      });

      setShowScheduleModal(false);
      setSuccessMsg("Automated report delivery scheduled successfully!");
      setTimeout(() => {
        router.push("/reports/scheduled" as Route);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to schedule report.");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // Paginated Preview Rows
  const filteredPreviewRows = useMemo(() => {
    if (!previewResult?.rows) return [];
    let rows = previewResult.rows;
    if (previewSearch.trim()) {
      const q = previewSearch.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((val) => String(val ?? "").toLowerCase().includes(q))
      );
    }
    return rows;
  }, [previewResult, previewSearch]);

  const paginatedRows = useMemo(() => {
    const start = (previewPage - 1) * previewPageSize;
    return filteredPreviewRows.slice(start, start + previewPageSize);
  }, [filteredPreviewRows, previewPage, previewPageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredPreviewRows.length / previewPageSize));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href={"/reports" as Route} className="text-xs font-medium text-zinc-500 hover:text-zinc-950">
              &larr; Catalog Hub
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-xs font-semibold text-zinc-950">Interactive Builder</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 mt-1">
            Custom Report Builder
          </h1>
          <p className="text-sm text-zinc-500">
            Design multi-attribute cross-domain queries with live table previews, dynamic filters, and instant exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => handleExecutePreview()}
            disabled={isLoadingPreview}
          >
            {isLoadingPreview ? "Querying..." : "⚡ Run Live Preview"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setSaveName(reportTitle);
              setShowSaveModal(true);
            }}
          >
            💾 Save Query
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setSchedName(`${reportTitle} Dispatch`);
              setShowScheduleModal(true);
            }}
          >
            📬 Schedule Automation
          </Button>

          <div className="relative inline-flex">
            <select
              disabled={isExporting}
              onChange={(e) => {
                const fmt = e.target.value as ReportFormat;
                if (fmt) {
                  void handleExport(fmt);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="h-11 rounded-control bg-primary text-white px-3 text-sm font-medium hover:brightness-95 cursor-pointer outline-none"
            >
              <option value="" disabled className="bg-white text-zinc-900">
                ⬇ Export Report
              </option>
              <option value="CSV" className="bg-white text-zinc-900">CSV Spreadsheet</option>
              <option value="EXCEL" className="bg-white text-zinc-900">Microsoft Excel (.xls)</option>
              <option value="PDF" className="bg-white text-zinc-900">PDF Summary</option>
              <option value="JSON" className="bg-white text-zinc-900">JSON Data</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-panel border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-panel border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          ✓ {successMsg}
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Module Selector */}
          <Panel className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Step 1: Source Domain
              </span>
              <Badge tone="neutral">{selectedModule}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(Object.keys(MODULE_FIELD_DEFINITIONS) as AnalyticsSourceModule[]).map((mod) => (
                <button
                  key={mod}
                  onClick={() => handleModuleChange(mod)}
                  className={`p-2.5 rounded-control text-xs font-semibold border text-center transition ${
                    selectedModule === mod
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                      : "bg-surface text-zinc-700 border-border hover:bg-muted"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </Panel>

          {/* Step 2: Column Picker */}
          <Panel className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Step 2: Selected Columns ({selectedColumns.length})
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">Toggle fields and reorder columns.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllColumns}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Select All
                </button>
                <span className="text-zinc-300">•</span>
                <button
                  onClick={clearColumns}
                  className="text-[11px] font-semibold text-zinc-500 hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Selected Column Chips with Order Controls */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {selectedColumns.map((colKey, index) => {
                const descriptor = availableFields.find((f) => f.key === colKey);
                return (
                  <div
                    key={colKey}
                    className="flex items-center justify-between gap-2 rounded-control border border-border bg-muted/30 px-2.5 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] text-zinc-400">#{index + 1}</span>
                      <span className="font-semibold text-zinc-900">{descriptor?.label || colKey}</span>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] text-zinc-500 uppercase">
                        {descriptor?.type || "string"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveColumn(index, "up")}
                        disabled={index === 0}
                        className="h-6 w-6 rounded hover:bg-muted text-zinc-600 disabled:opacity-30"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveColumn(index, "down")}
                        disabled={index === selectedColumns.length - 1}
                        className="h-6 w-6 rounded hover:bg-muted text-zinc-600 disabled:opacity-30"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => toggleColumn(colKey)}
                        className="h-6 w-6 rounded hover:bg-red-50 text-red-500"
                        title="Remove Column"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column Search & Add Checkboxes */}
            <div className="border-t border-border pt-3 space-y-2">
              <Input
                placeholder="Search available fields..."
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                className="h-9 text-xs"
              />

              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredAvailableFields.map((field) => {
                  const isChecked = selectedColumns.includes(field.key);
                  return (
                    <label
                      key={field.key}
                      className={`flex items-center gap-2 rounded-control border p-2 text-xs cursor-pointer transition ${
                        isChecked
                          ? "border-primary/50 bg-emerald-50/40 text-zinc-950 font-medium"
                          : "border-border bg-surface text-zinc-600 hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumn(field.key)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span className="truncate">{field.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </Panel>

          {/* Step 3: Dynamic Filters */}
          <Panel className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Step 3: Filter Conditions ({filters.length})
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">Filter records matching specific rules.</p>
              </div>

              <Button variant="secondary" className="h-8 px-2.5 text-xs" onClick={addFilterRow}>
                + Add Filter
              </Button>
            </div>

            {filters.length === 0 ? (
              <div className="rounded-control border border-dashed border-border p-4 text-center text-xs text-zinc-400">
                No filters applied. All rows from the module will be queried.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filters.map((flt, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 rounded-control border border-border p-2.5 bg-muted/20">
                    <select
                      value={flt.field}
                      onChange={(e) => updateFilterRow(idx, { field: e.target.value })}
                      className="h-8 w-full sm:w-1/3 rounded-control border border-border bg-surface px-2 text-xs text-zinc-900"
                    >
                      {availableFields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={flt.operator}
                      onChange={(e) => updateFilterRow(idx, { operator: e.target.value as ReportFilterOperator })}
                      className="h-8 w-full sm:w-1/3 rounded-control border border-border bg-surface px-2 text-xs text-zinc-900"
                    >
                      {OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Target value..."
                      value={String(flt.value ?? "")}
                      onChange={(e) => updateFilterRow(idx, { value: e.target.value })}
                      className="h-8 w-full sm:w-1/3 rounded-control border border-border bg-surface px-2 text-xs text-zinc-900"
                    />

                    <button
                      onClick={() => removeFilterRow(idx)}
                      className="h-8 w-8 rounded text-red-500 hover:bg-red-50 text-sm font-bold flex items-center justify-center shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Step 4: Sorting & Grouping */}
          <Panel className="p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Step 4: Sorting & Grouping
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Primary Sort Field</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="h-9 w-full rounded-control border border-border bg-surface px-2.5 text-xs text-zinc-900"
                >
                  <option value="">(No Sorting)</option>
                  {availableFields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Sort Direction</label>
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
                  className="h-9 w-full rounded-control border border-border bg-surface px-2.5 text-xs text-zinc-900"
                >
                  <option value="asc">Ascending (A &rarr; Z / 0 &rarr; 9)</option>
                  <option value="desc">Descending (Z &rarr; A / 9 &rarr; 0)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Group By Category</label>
                <select
                  value={groupByField}
                  onChange={(e) => setGroupByField(e.target.value)}
                  className="h-9 w-full rounded-control border border-border bg-surface px-2.5 text-xs text-zinc-900"
                >
                  <option value="">(No Grouping)</option>
                  {availableFields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Panel>

          {/* Step 5: Aggregations */}
          <Panel className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Step 5: Aggregations ({aggregations.length})
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">Compute counts, sums, averages across groups.</p>
              </div>

              <Button variant="secondary" className="h-8 px-2.5 text-xs" onClick={addAggregationRow}>
                + Add Aggregate
              </Button>
            </div>

            {aggregations.length > 0 && (
              <div className="space-y-2">
                {aggregations.map((agg, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-control border border-border p-2 bg-muted/20 text-xs">
                    <select
                      value={agg.field}
                      onChange={(e) => updateAggregationRow(idx, { field: e.target.value })}
                      className="h-8 rounded-control border border-border bg-surface px-2 text-xs text-zinc-900 w-1/3"
                    >
                      {availableFields.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={agg.function}
                      onChange={(e) =>
                        updateAggregationRow(idx, {
                          function: e.target.value as ReportAggregation["function"]
                        })
                      }
                      className="h-8 rounded-control border border-border bg-surface px-2 text-xs text-zinc-900 w-1/3"
                    >
                      <option value="COUNT">COUNT</option>
                      <option value="SUM">SUM</option>
                      <option value="AVG">AVG</option>
                      <option value="MIN">MIN</option>
                      <option value="MAX">MAX</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Alias..."
                      value={agg.alias || ""}
                      onChange={(e) => updateAggregationRow(idx, { alias: e.target.value })}
                      className="h-8 rounded-control border border-border bg-surface px-2 text-xs text-zinc-900 w-1/3"
                    />

                    <button
                      onClick={() => removeAggregationRow(idx)}
                      className="h-8 w-8 rounded text-red-500 hover:bg-red-50 flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column: Live Interactive Table Preview */}
        <div className="lg:col-span-7 space-y-4">
          <Panel className="p-5 space-y-4 flex flex-col h-full min-h-[600px]">
            {/* Preview Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-950">Live Query Output</h3>
                  <Badge tone="success">Interactive</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {previewResult
                    ? `${previewResult.rowCount} records returned in ${previewResult.executionTimeMs}ms`
                    : "Configure query parameters to see output."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search within preview..."
                  value={previewSearch}
                  onChange={(e) => {
                    setPreviewSearch(e.target.value);
                    setPreviewPage(1);
                  }}
                  className="h-8 w-48 rounded-control border border-border px-2.5 text-xs text-zinc-900 outline-none focus:border-primary"
                />

                <Button
                  variant="primary"
                  className="h-8 px-3 text-xs"
                  onClick={handleExecutePreview}
                  disabled={isLoadingPreview}
                >
                  {isLoadingPreview ? "Running..." : "↻ Refresh"}
                </Button>
              </div>
            </div>

            {/* Results Table */}
            <div className="flex-1 overflow-x-auto rounded-control border border-border">
              {isLoadingPreview ? (
                <div className="p-16 text-center text-xs text-zinc-400">
                  Executing query across {selectedModule} dataset...
                </div>
              ) : !previewResult || filteredPreviewRows.length === 0 ? (
                <div className="p-16 text-center text-xs text-zinc-400">
                  No records returned for current filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-zinc-700">
                  <thead className="bg-muted/60 text-[11px] font-semibold uppercase text-zinc-500 border-b border-border sticky top-0">
                    <tr>
                      {selectedColumns.map((colKey) => {
                        const descriptor = availableFields.find((f) => f.key === colKey);
                        return (
                          <th key={colKey} className="px-3 py-2.5 whitespace-nowrap">
                            {descriptor?.label || colKey}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {paginatedRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-muted/40 transition">
                        {selectedColumns.map((colKey) => {
                          const val = row[colKey];
                          return (
                            <td key={colKey} className="px-3 py-2 font-medium text-zinc-900 whitespace-nowrap">
                              {typeof val === "boolean"
                                ? val
                                  ? "Yes"
                                  : "No"
                                : String(val ?? "—")}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Preview Pagination Footer */}
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Page size:</span>
                <select
                  value={previewPageSize}
                  onChange={(e) => {
                    setPreviewPageSize(Number(e.target.value));
                    setPreviewPage(1);
                  }}
                  className="rounded border border-border bg-surface px-2 py-1 text-xs text-zinc-900"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-zinc-400">
                  ({filteredPreviewRows.length} total matching rows)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                  disabled={previewPage === 1}
                >
                  &larr; Prev
                </Button>
                <span className="font-semibold text-zinc-800">
                  Page {previewPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                  disabled={previewPage >= totalPages}
                >
                  Next &rarr;
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Modal: Save Report */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-overlay bg-surface p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-zinc-950">Save Custom Report Query</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Report Name</label>
                <Input
                  required
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Q3 Engineering Attendance & Leave Balance"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="Detailed context about what this custom query tracks..."
                  className="w-full rounded-control border border-border p-2 text-xs text-zinc-900 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveIsShared}
                    onChange={(e) => setSaveIsShared(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-zinc-800 font-medium">Share with organization members</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveIsPublic}
                    onChange={(e) => setSaveIsPublic(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-zinc-800 font-medium">Make public template in report catalog</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => setShowSaveModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Query"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Report Automation */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-overlay bg-surface p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-zinc-950">Schedule Automated Delivery</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Schedule Name</label>
                <Input
                  required
                  value={schedName}
                  onChange={(e) => setSchedName(e.target.value)}
                  placeholder="e.g. Monthly Executive Digest"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Delivery Frequency</label>
                <select
                  value={schedFreq}
                  onChange={(e) =>
                    setSchedFreq(e.target.value as "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY")
                  }
                  className="h-10 w-full rounded-control border border-border bg-surface px-3 text-xs text-zinc-900"
                >
                  <option value="DAILY">Daily (09:00 AM)</option>
                  <option value="WEEKLY">Weekly (Monday 09:00 AM)</option>
                  <option value="MONTHLY">Monthly (1st Day 09:00 AM)</option>
                  <option value="QUARTERLY">Quarterly (Quarter End)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Recipient Emails (comma separated)</label>
                <Input
                  required
                  value={schedEmails}
                  onChange={(e) => setSchedEmails(e.target.value)}
                  placeholder="hr@company.com, ceo@company.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Export File Attachment Format</label>
                <select
                  value={schedFormat}
                  onChange={(e) => setSchedFormat(e.target.value as ReportFormat)}
                  className="h-10 w-full rounded-control border border-border bg-surface px-3 text-xs text-zinc-900"
                >
                  <option value="CSV">CSV Spreadsheet</option>
                  <option value="EXCEL">Microsoft Excel (.xls)</option>
                  <option value="PDF">PDF Summary Document</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingSchedule}>
                  {isSubmittingSchedule ? "Scheduling..." : "Create Schedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
