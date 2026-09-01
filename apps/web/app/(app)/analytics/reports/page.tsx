"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type {
  ReportDefinitionView,
  ReportFormat,
  ReportScheduleView,
  SavedReportView,
  ScheduleFrequency
} from "@vc-wms/shared-types";

export default function ReportsCenterPage() {
  const [definitions, setDefinitions] = useState<ReportDefinitionView[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReportView[]>([]);
  const [schedules, setSchedules] = useState<ReportScheduleView[]>([]);
  const [activeTab, setActiveTab] = useState<"RUN" | "SAVED" | "SCHEDULES">("RUN");

  // Selected Report execution state
  const [selectedDefCode, setSelectedDefCode] = useState<string>("EMPLOYEE_DIRECTORY");
  const [exportFormat, setExportFormat] = useState<ReportFormat>("CSV");
  const [reportResult, setReportResult] = useState<Record<string, unknown> | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedName, setSchedName] = useState("");
  const [schedSavedId, setSchedSavedId] = useState("");
  const [schedFreq, setSchedFreq] = useState<ScheduleFrequency>("MONTHLY");
  const [schedEmails, setSchedEmails] = useState("hr@vcorganics.com");
  const [schedFormat, setSchedFormat] = useState<ReportFormat>("CSV");
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const [defs, saved, sched] = await Promise.all([
        apiRequest<ReportDefinitionView[]>("/analytics/reports/definitions"),
        apiRequest<SavedReportView[]>("/analytics/reports/saved"),
        apiRequest<ReportScheduleView[]>("/analytics/reports/schedules")
      ]);
      setDefinitions(defs ?? []);
      setSavedReports(saved ?? []);
      setSchedules(sched ?? []);
      if (saved && saved.length > 0 && !schedSavedId) {
        setSchedSavedId(saved[0]?.id ?? "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report definitions.");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRunReport = async () => {
    try {
      setIsExecuting(true);
      setError(null);
      const res = await apiRequest<Record<string, unknown>>("/analytics/reports/execute", {
        method: "POST",
        body: JSON.stringify({
          reportDefinitionCode: selectedDefCode,
          format: "JSON"
        })
      });
      setReportResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute report.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      const res = await fetch("/api/v1/analytics/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDefinitionCode: selectedDefCode,
          format: exportFormat
        })
      });

      if (!res.ok) {
        throw new Error("Failed to export report.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedDefCode.toLowerCase()}_${Date.now()}.${exportFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to download export file.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingSchedule(true);
      setError(null);
      await apiRequest("/analytics/reports/schedules", {
        method: "POST",
        body: JSON.stringify({
          savedReportId: schedSavedId,
          name: schedName,
          frequency: schedFreq,
          recipients: schedEmails.split(",").map((em) => em.trim()),
          format: schedFormat
        })
      });
      setShowScheduleModal(false);
      setSuccessMsg("Scheduled automated report delivery successfully.");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create report schedule.");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleTriggerSchedule = async (id: string) => {
    try {
      setSuccessMsg(null);
      const res = await apiRequest<{ message: string }>(
        `/analytics/reports/schedules/${id}/run`,
        { method: "POST" }
      );
      setSuccessMsg(res.message);
      await loadData();
    } catch {
      setError("Failed to run schedule.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Unified Report Center
          </h1>
          <p className="text-sm text-slate-500">
            Execute standard system reports, query custom datasets, export to CSV/Excel/PDF, and schedule automated dispatches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/analytics" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Executive Analytics
          </Link>
          <Link
            href={"/admin/analytics-audit" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Audit Log
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 font-semibold">
          ✓ {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("RUN")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "RUN"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Run & Export Standard Reports
        </button>
        <button
          onClick={() => setActiveTab("SAVED")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "SAVED"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Saved Custom Queries ({savedReports.length})
        </button>
        <button
          onClick={() => setActiveTab("SCHEDULES")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === "SCHEDULES"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Scheduled Automated Delivery ({schedules.length})
        </button>
      </div>

      {/* Tab 1: Run & Export */}
      {activeTab === "RUN" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Select Standard Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Report Category / Type</label>
                <select
                  value={selectedDefCode}
                  onChange={(e) => setSelectedDefCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-semibold"
                >
                  {definitions.length > 0 ? (
                    definitions.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.name} ({d.category})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="EMPLOYEE_DIRECTORY">Employee Master Directory (Staff & Roles)</option>
                      <option value="ATTENDANCE_SUMMARY">Attendance Summary & Check-in Timestamps</option>
                      <option value="PAYROLL_MASTER">Payroll Master Statement (Gross, Net & Payouts)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Export File Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ReportFormat)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="CSV">Comma-Separated Values (CSV)</option>
                  <option value="EXCEL">Microsoft Excel (XLS / TSV)</option>
                  <option value="JSON">Structured Data (JSON)</option>
                  <option value="PDF">Vector PDF Summary Document (PDF)</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={handleRunReport}
                  disabled={isExecuting}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition shadow-sm"
                >
                  {isExecuting ? "Executing..." : "🔍 Preview Results"}
                </button>
                <button
                  onClick={handleExportReport}
                  disabled={isExporting}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  {isExporting ? "Exporting..." : `⬇ Export ${exportFormat}`}
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {reportResult && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{reportResult.title as string}</h3>
                  <p className="text-xs text-slate-500">
                    {reportResult.rowCount as number} rows returned in {reportResult.executionTimeMs as number}ms
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      {(reportResult.columns as Array<{ key: string; header: string }>).map((c) => (
                        <th key={c.key} className="px-4 py-3">
                          {c.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(reportResult.rows as Array<Record<string, unknown>>).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        {(reportResult.columns as Array<{ key: string; header: string }>).map((c) => (
                          <td key={c.key} className="px-4 py-3 font-medium text-slate-800">
                            {String(row[c.key] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Reports */}
      {activeTab === "SAVED" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedReports.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
                No custom saved reports found. Create a custom query to save filters.
              </div>
            ) : (
              savedReports.map((saved) => (
                <div key={saved.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {saved.reportDefinition?.category ?? "CUSTOM"}
                    </span>
                    <Badge tone={saved.isShared ? "success" : "neutral"}>
                      {saved.isShared ? "Shared" : "Private"}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{saved.name}</h3>
                  <p className="text-xs text-slate-500">{saved.description || "Custom filter query."}</p>
                  <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 flex justify-between">
                    <span>By: {saved.createdBy?.email ?? "User"}</span>
                    <span>{new Date(saved.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Schedules */}
      {activeTab === "SCHEDULES" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={savedReports.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              + Create Automated Schedule
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Configured Report Dispatches</h2>
            {schedules.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No automated report schedules configured.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Schedule Name</th>
                      <th className="px-4 py-3">Frequency</th>
                      <th className="px-4 py-3">Format</th>
                      <th className="px-4 py-3">Recipients</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.frequency}</td>
                        <td className="px-4 py-3">
                          <Badge tone="neutral">{s.format}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                          {s.recipients.join(", ")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleTriggerSchedule(s.id)}
                            className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition"
                          >
                            Trigger Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Automated Report Schedule</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Schedule Name</label>
                <input
                  type="text"
                  value={schedName}
                  onChange={(e) => setSchedName(e.target.value)}
                  placeholder="e.g. Monthly Executive Digest"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Saved Query</label>
                <select
                  value={schedSavedId}
                  onChange={(e) => setSchedSavedId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  required
                >
                  {savedReports.map((sr) => (
                    <option key={sr.id} value={sr.id}>
                      {sr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={schedFreq}
                  onChange={(e) => setSchedFreq(e.target.value as ScheduleFrequency)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="DAILY">Daily (09:00 AM)</option>
                  <option value="WEEKLY">Weekly (Monday)</option>
                  <option value="MONTHLY">Monthly (1st Day)</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipients (comma separated)</label>
                <input
                  type="text"
                  value={schedEmails}
                  onChange={(e) => setSchedEmails(e.target.value)}
                  placeholder="hr@company.com, ceo@company.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attachment Format</label>
                <select
                  value={schedFormat}
                  onChange={(e) => setSchedFormat(e.target.value as ReportFormat)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="CSV">CSV Spreadsheet</option>
                  <option value="EXCEL">Microsoft Excel (XLS)</option>
                  <option value="PDF">Vector PDF Summary</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingSchedule ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
