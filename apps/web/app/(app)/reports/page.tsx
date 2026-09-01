"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type {
  ReportDefinitionView,
  ReportFormat,
  SavedReportView,
  ReportScheduleView
} from "@vc-wms/shared-types";

interface ReportExecutionResult {
  title: string;
  columns: Array<{ key: string; header: string; name?: string; label?: string }>;
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  totalCount?: number;
  executionTimeMs: number;
}

const MODULE_OPTIONS: Array<{ key: string; label: string; icon: string }> = [
  { key: "ALL", label: "All Modules", icon: "📊" },
  { key: "EMPLOYEE", label: "Employee", icon: "👥" },
  { key: "ATTENDANCE", label: "Attendance", icon: "⏱️" },
  { key: "LEAVE", label: "Leaves", icon: "🌴" },
  { key: "PAYROLL", label: "Payroll", icon: "💰" },
  { key: "COMPLIANCE", label: "Compliance", icon: "⚖️" },
  { key: "FACE", label: "Biometrics", icon: "👤" },
  { key: "ORGANIZATION", label: "Organization", icon: "🏢" },
  { key: "AUDIT", label: "Audit & Security", icon: "🛡️" }
];

const PREBUILT_SYSTEM_REPORTS = [
  {
    code: "EMPLOYEE_DIRECTORY",
    name: "Employee Master Directory",
    description: "Complete employee headcount roster with department, designation, employment type, salary type, and joining dates.",
    module: "EMPLOYEE",
    category: "EMPLOYEE",
    columns: ["Emp Code", "Full Name", "Department", "Designation", "Status", "Salary Type", "Joining Date"]
  },
  {
    code: "ATTENDANCE_SUMMARY",
    name: "Daily Attendance & Punch Log",
    description: "Comprehensive daily attendance summary with check-in, check-out, working hours, and verification status.",
    module: "ATTENDANCE",
    category: "ATTENDANCE",
    columns: ["Emp Code", "Full Name", "Date", "Status", "Check-in", "Check-out", "Working Hours"]
  },
  {
    code: "LEAVE_REGISTER",
    name: "Leave Accrual & Balance Statement",
    description: "Employee leave balances, taken days, pending approvals, and statutory sandwich policy deductions.",
    module: "LEAVE",
    category: "LEAVE",
    columns: ["Emp Code", "Full Name", "Leave Type", "Total Days", "Start Date", "End Date", "Status"]
  },
  {
    code: "PAYROLL_MASTER",
    name: "Payroll Master & Payout Register",
    description: "Gross compensation, allowances, statutory deductions (PF, ESI, PT, TDS), and net payout statement.",
    module: "PAYROLL",
    category: "PAYROLL",
    columns: ["Emp Code", "Full Name", "Period", "Gross Salary", "Deductions", "Net Salary", "Employer PF/ESI"]
  },
  {
    code: "COMPLIANCE_STATEMENT",
    name: "Statutory Compliance Audit Statement",
    description: "Detailed PF, ESI, Professional Tax, and Income Tax liability snapshots across monthly cycles.",
    module: "COMPLIANCE",
    category: "COMPLIANCE",
    columns: ["Emp Code", "Full Name", "Period", "PF Employee", "PF Employer", "ESI Employee", "PT Amount", "TDS"]
  },
  {
    code: "FACE_LOGS",
    name: "Biometric & Face Recognition Log",
    description: "Real-time face verification events, liveness check scores, matching confidence, and spoof detections.",
    module: "FACE",
    category: "EXECUTIVE",
    columns: ["Emp Code", "Full Name", "Status", "Confidence", "Liveness", "Device Info", "Timestamp"]
  },
  {
    code: "ORG_STRUCTURE",
    name: "Organization Structure & Hierarchy Roster",
    description: "Business units, departments, reporting spans, and team headcount distribution breakdown.",
    module: "ORGANIZATION",
    category: "EXECUTIVE",
    columns: ["Dept Code", "Department Name", "Business Unit", "Headcount", "Status"]
  },
  {
    code: "AUDIT_ACTIVITY",
    name: "System Security & Activity Trail",
    description: "Immutable security audit log of administrative actions, report exports, and role permission mutations.",
    module: "AUDIT",
    category: "EXECUTIVE",
    columns: ["Action", "Resource Type", "Resource ID", "Actor User", "IP Address", "Timestamp"]
  }
];

export default function ReportsCatalogPage() {
  const [definitions, setDefinitions] = useState<ReportDefinitionView[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReportView[]>([]);
  const [schedules, setSchedules] = useState<ReportScheduleView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Runner / Preview Modal State
  const [activeReportCode, setActiveReportCode] = useState<string | null>(null);
  const [activeReportTitle, setActiveReportTitle] = useState("");
  const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ReportFormat>("CSV");
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageSize, setPreviewPageSize] = useState(10);
  const [previewFilter, setPreviewFilter] = useState("");

  const loadHubData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [defsRes, savedRes, schedRes] = await Promise.allSettled([
        apiRequest<ReportDefinitionView[]>("/reports/definitions"),
        apiRequest<SavedReportView[]>("/reports/saved"),
        apiRequest<ReportScheduleView[]>("/reports/schedules")
      ]);

      if (defsRes.status === "fulfilled") {
        setDefinitions(defsRes.value ?? []);
      }
      if (savedRes.status === "fulfilled") {
        setSavedReports(savedRes.value ?? []);
      }
      if (schedRes.status === "fulfilled") {
        setSchedules(schedRes.value ?? []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHubData();
  }, []);

  // Merge pre-built and database definitions
  const allReports = useMemo(() => {
    const dbMap = new Map(definitions.map((d) => [d.code, d]));
    return PREBUILT_SYSTEM_REPORTS.map((p) => {
      const dbMatch = dbMap.get(p.code);
      return {
        ...p,
        id: dbMatch?.id,
        name: dbMatch?.name ?? p.name,
        description: dbMatch?.description ?? p.description,
        sourceModule: dbMatch?.sourceModule ?? p.module,
        category: dbMatch?.category ?? p.category
      };
    });
  }, [definitions]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return allReports.filter((rep) => {
      const matchesSearch =
        !searchQuery ||
        rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule =
        selectedModule === "ALL" || rep.sourceModule.toUpperCase() === selectedModule.toUpperCase();

      const matchesCategory =
        selectedCategory === "ALL" || rep.category.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesModule && matchesCategory;
    });
  }, [allReports, searchQuery, selectedModule, selectedCategory]);

  const handleRunReport = async (code: string, name: string) => {
    try {
      setActiveReportCode(code);
      setActiveReportTitle(name);
      setIsRunning(true);
      setError(null);
      setPreviewPage(1);

      const res = await apiRequest<ReportExecutionResult>("/reports/execute", {
        method: "POST",
        body: JSON.stringify({
          reportDefinitionCode: code,
          format: "JSON"
        })
      });

      setExecutionResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute report.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async (code: string, format: ReportFormat) => {
    try {
      setIsExporting(true);
      setError(null);

      const response = await fetch("/api/v1/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDefinitionCode: code,
          format
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate export file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "EXCEL" ? "xls" : format.toLowerCase();
      a.download = `${code.toLowerCase()}_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to download export.");
    } finally {
      setIsExporting(false);
    }
  };

  // Preview filtering & pagination
  const previewRows = useMemo(() => {
    if (!executionResult?.rows) return [];
    let rows = executionResult.rows;
    if (previewFilter.trim()) {
      const q = previewFilter.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((val) => String(val ?? "").toLowerCase().includes(q))
      );
    }
    return rows;
  }, [executionResult, previewFilter]);

  const paginatedPreviewRows = useMemo(() => {
    const start = (previewPage - 1) * previewPageSize;
    return previewRows.slice(start, start + previewPageSize);
  }, [previewRows, previewPage, previewPageSize]);

  const totalPreviewPages = Math.max(1, Math.ceil(previewRows.length / previewPageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Enterprise Reports Catalog
            </h1>
            <Badge tone="success">Production Hub</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Access pre-built system reports, build custom queries across 8 enterprise modules, and schedule automated dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={"/reports/builder" as Route}>
            <Button variant="primary">
              + Custom Report Builder
            </Button>
          </Link>
          <Link href={"/reports/saved" as Route}>
            <Button variant="secondary">
              Saved Reports ({savedReports.length})
            </Button>
          </Link>
          <Link href={"/reports/scheduled" as Route}>
            <Button variant="secondary">
              Schedules ({schedules.length})
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-panel border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold" type="button">
            ✕
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-xs text-zinc-500 animate-pulse">Loading reports catalog and schedules...</div>
      )}

      {/* KPI Metric Summary Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Panel className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase">Standard Catalog</p>
            <p className="text-2xl font-bold text-zinc-950 mt-1">{PREBUILT_SYSTEM_REPORTS.length}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">8 Enterprise domains</p>
          </div>
          <div className="h-10 w-10 rounded-panel bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            📚
          </div>
        </Panel>

        <Panel className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase">Custom Saved</p>
            <p className="text-2xl font-bold text-zinc-950 mt-1">{savedReports.length}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">User-created filters</p>
          </div>
          <div className="h-10 w-10 rounded-panel bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            💾
          </div>
        </Panel>

        <Panel className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase">Active Schedules</p>
            <p className="text-2xl font-bold text-zinc-950 mt-1">{schedules.filter((s) => s.isActive !== false).length}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Automated delivery</p>
          </div>
          <div className="h-10 w-10 rounded-panel bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            ⏱️
          </div>
        </Panel>

        <Panel className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase">Export Formats</p>
            <p className="text-2xl font-bold text-zinc-950 mt-1">4 Types</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">CSV, Excel, PDF, JSON</p>
          </div>
          <div className="h-10 w-10 rounded-panel bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            📥
          </div>
        </Panel>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={"/reports/builder" as Route}
          className="group rounded-panel border border-border bg-surface p-4 shadow-sm hover:border-primary transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 group-hover:text-primary transition">
                Interactive Report Builder
              </p>
              <p className="text-xs text-zinc-500">Pick columns, dynamic filters, grouping, and aggregations.</p>
            </div>
          </div>
        </Link>

        <Link
          href={"/reports/saved" as Route}
          className="group rounded-panel border border-border bg-surface p-4 shadow-sm hover:border-primary transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📂</span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 group-hover:text-primary transition">
                Saved & Shared Queries
              </p>
              <p className="text-xs text-zinc-500">Manage team reports, clone definitions, and run on-demand.</p>
            </div>
          </div>
        </Link>

        <Link
          href={"/reports/scheduled" as Route}
          className="group rounded-panel border border-border bg-surface p-4 shadow-sm hover:border-primary transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📬</span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 group-hover:text-primary transition">
                Scheduled Dispatches
              </p>
              <p className="text-xs text-zinc-500">Automate recurring email delivery and track execution logs.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Search & Module Filters */}
      <Panel className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search reports by title, keyword, or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary"
            >
              <option value="ALL">All Categories</option>
              <option value="EXECUTIVE">Executive Analytics</option>
              <option value="EMPLOYEE">Employee Master</option>
              <option value="ATTENDANCE">Attendance & Time</option>
              <option value="LEAVE">Leave Management</option>
              <option value="PAYROLL">Payroll & Payouts</option>
              <option value="COMPLIANCE">Statutory Compliance</option>
            </select>
          </div>
        </div>

        {/* Module Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {MODULE_OPTIONS.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedModule(m.key)}
              className={`inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-xs font-semibold transition ${
                selectedModule === m.key
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "border border-border bg-surface text-zinc-600 hover:bg-muted"
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      {/* Reports Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.length === 0 ? (
          <Panel className="col-span-full p-12 text-center text-sm text-zinc-500">
            No report templates matched your search criteria.
          </Panel>
        ) : (
          filteredReports.map((report) => (
            <Panel key={report.code} className="p-5 flex flex-col justify-between space-y-4 hover:border-zinc-300 transition">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{report.sourceModule}</Badge>
                    <Badge tone="success">{report.category}</Badge>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">{report.code}</span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 mt-2">{report.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{report.description}</p>

                {/* Available Column Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {report.columns.map((col) => (
                    <span
                      key={col}
                      className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-zinc-600"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-4 flex items-center justify-between gap-2">
                <Link
                  href={`/reports/builder?module=${report.sourceModule}&code=${report.code}` as Route}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Edit in Builder &rarr;
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    onClick={() => handleRunReport(report.code, report.name)}
                    disabled={isRunning && activeReportCode === report.code}
                  >
                    {isRunning && activeReportCode === report.code ? "Executing..." : "🔍 Run Live"}
                  </Button>

                  <div className="relative inline-flex">
                    <select
                      onChange={(e) => {
                        const fmt = e.target.value as ReportFormat;
                        if (fmt) {
                          void handleExport(report.code, fmt);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                      className="h-8 rounded-control border border-border bg-surface px-2.5 text-xs font-semibold text-zinc-700 hover:bg-muted cursor-pointer outline-none"
                    >
                      <option value="" disabled>
                        ⬇ Export
                      </option>
                      <option value="CSV">CSV Spreadsheet</option>
                      <option value="EXCEL">Excel (.xls)</option>
                      <option value="PDF">PDF Summary</option>
                      <option value="JSON">JSON Data</option>
                    </select>
                  </div>
                </div>
              </div>
            </Panel>
          ))
        )}
      </div>

      {/* Live Preview Modal */}
      {activeReportCode && executionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-overlay bg-surface shadow-2xl border border-border overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-muted/40">
              <div>
                <h3 className="text-base font-bold text-zinc-950">{activeReportTitle}</h3>
                <p className="text-xs text-zinc-500">
                  {executionResult.rowCount} rows returned in {executionResult.executionTimeMs}ms
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ReportFormat)}
                    className="h-8 rounded-control border border-border bg-surface px-2 text-xs text-zinc-900"
                  >
                    <option value="CSV">CSV</option>
                    <option value="EXCEL">Excel (XLS)</option>
                    <option value="PDF">PDF</option>
                    <option value="JSON">JSON</option>
                  </select>

                  <Button
                    variant="primary"
                    className="h-8 px-3 text-xs"
                    onClick={() => handleExport(activeReportCode, exportFormat)}
                    disabled={isExporting}
                  >
                    {isExporting ? "Exporting..." : `Download ${exportFormat}`}
                  </Button>
                </div>

                <button
                  onClick={() => {
                    setActiveReportCode(null);
                    setExecutionResult(null);
                  }}
                  className="h-8 w-8 rounded-control border border-border flex items-center justify-center text-zinc-500 hover:bg-muted text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter Search within modal */}
            <div className="p-3 border-b border-border bg-surface flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Filter results in preview..."
                value={previewFilter}
                onChange={(e) => {
                  setPreviewFilter(e.target.value);
                  setPreviewPage(1);
                }}
                className="h-8 w-64 rounded-control border border-border px-2.5 text-xs text-zinc-900 outline-none focus:border-primary"
              />

              <div className="text-xs text-zinc-500">
                Showing {(previewPage - 1) * previewPageSize + 1} -{" "}
                {Math.min(previewPage * previewPageSize, previewRows.length)} of {previewRows.length} rows
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left text-xs text-zinc-700">
                <thead className="bg-muted text-[11px] font-semibold uppercase text-zinc-500 sticky top-0 border-b border-border">
                  <tr>
                    {executionResult.columns.map((c) => (
                      <th key={c.key || c.name} className="px-3 py-2.5 whitespace-nowrap">
                        {c.header || c.label || c.key || c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedPreviewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/50">
                      {executionResult.columns.map((c) => {
                        const k = c.key || c.name || "";
                        const val = row[k];
                        return (
                          <td key={k} className="px-3 py-2 font-medium text-zinc-900 whitespace-nowrap">
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
            </div>

            {/* Modal Pagination Footer */}
            <div className="flex items-center justify-between border-t border-border p-3 bg-muted/20 text-xs">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={previewPageSize}
                  onChange={(e) => {
                    setPreviewPageSize(Number(e.target.value));
                    setPreviewPage(1);
                  }}
                  className="rounded border border-border bg-surface px-2 py-1 text-xs"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
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
                  Page {previewPage} of {totalPreviewPages}
                </span>
                <Button
                  variant="secondary"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                  disabled={previewPage >= totalPreviewPages}
                >
                  Next &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
