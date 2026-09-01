"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type { PayrollRunView } from "@vc-wms/shared-types";

export default function PayrollDashboardPage() {
  const [latestRun, setLatestRun] = useState<PayrollRunView | null>(null);
  const [recentRuns, setRecentRuns] = useState<PayrollRunView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month generation modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [runNotes, setRunNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [latest, list] = await Promise.all([
        apiRequest<PayrollRunView | null>("/payroll/runs/latest"),
        apiRequest<{ runs: PayrollRunView[] }>("/payroll/runs?limit=10")
      ]);
      setLatestRun(latest);
      setRecentRuns(list.runs ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payroll data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      setError(null);
      const newRun = await apiRequest<PayrollRunView>("/payroll/runs", {
        method: "POST",
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          notes: runNotes || undefined
        })
      });

      setShowGenerateModal(false);
      setRunNotes("");
      setLatestRun(newRun);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate payroll run.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LOCKED":
        return <Badge tone="neutral">🔒 Locked</Badge>;
      case "APPROVED":
        return <Badge tone="success">✓ Approved</Badge>;
      case "GENERATED":
        return <Badge tone="warning">Generated (Draft)</Badge>;
      case "CANCELLED":
        return <Badge tone="danger">Cancelled</Badge>;
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payroll Engine</h1>
          <p className="text-sm text-slate-500">
            Attendance-integrated payroll calculations, proration, adjustments, and immutable disbursement runs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/payroll/history" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Payroll History
          </Link>
          <Link
            href={"/payroll/run" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Run Workbench
          </Link>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            + Process New Month
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Primary Month Banner / Active Run */}
      {latestRun ? (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  Latest Payroll Cycle
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {getStatusBadge(latestRun.status)}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {monthNames[latestRun.month - 1]} {latestRun.year}
              </h2>
              <p className="text-xs text-slate-400">
                Processed {latestRun.totalEmployees} employees • Created by {latestRun.createdBy?.email ?? "System HR"}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-700/60 pt-4 lg:pt-0 lg:pl-6">
              <div>
                <span className="text-[11px] text-slate-400 uppercase">Gross Earnings</span>
                <div className="text-lg font-bold mt-0.5 text-white">
                  ₹{latestRun.totalGross.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase">Total Deductions</span>
                <div className="text-lg font-bold mt-0.5 text-amber-400">
                  ₹{latestRun.totalDeductions.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase">Net Disbursed</span>
                <div className="text-lg font-bold mt-0.5 text-emerald-400">
                  ₹{latestRun.totalNet.toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <Link
                href={"/payroll/run" as Route}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 shadow-sm transition"
              >
                Inspect & Manage Run &rarr;
              </Link>
            </div>
          </div>
        </div>
      ) : !isLoading && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-3">
          <div className="text-3xl">💳</div>
          <h3 className="text-base font-bold text-slate-900">No Payroll Runs Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generate your first attendance and leave integrated payroll run to compute payable days and prorated take-home salaries.
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Start First Payroll Run
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Runs Completed</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{recentRuns.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Recorded payroll cycles</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Locked Cycles</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {recentRuns.filter((r) => r.status === "LOCKED").length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Immutable finalized runs</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Pending Approval</span>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {recentRuns.filter((r) => r.status === "GENERATED").length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Draft reviews awaiting HR sign-off</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Employer Contributions</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{(latestRun?.totalEmployerContributions ?? 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Latest cycle PF & ESI match</span>
        </div>
      </div>

      {/* Recent Payroll Runs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Payroll Runs</h2>
            <p className="text-xs text-slate-500">History of generated and disbursed monthly payrolls</p>
          </div>
          <Link
            href={"/payroll/history" as Route}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading payroll history...</div>
        ) : recentRuns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No runs recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Month / Year</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Gross Salary</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Disbursed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {monthNames[r.month - 1]} {r.year}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{r.totalEmployees}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      ₹{r.totalGross.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-amber-700">
                      ₹{r.totalDeductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      ₹{r.totalNet.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={"/payroll/run" as Route}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white px-2.5 py-1 rounded shadow-xs"
                      >
                        Workbench
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Process Monthly Payroll</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    min={2020}
                    max={2030}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={runNotes}
                  onChange={(e) => setRunNotes(e.target.value)}
                  placeholder="e.g. Regular monthly disbursement cycle..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-[11px] space-y-1">
                <div className="font-bold">⚡ Attendance & Leave Integration</div>
                <div>
                  The system will automatically calculate payable days from daily check-ins, approved leaves, and public holidays.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {isGenerating ? "Processing..." : "Generate Payroll Run"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
