"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../../lib/api";
import type { ComplianceSnapshotView, PayrollRunView } from "@vc-wms/shared-types";

export default function ComplianceSnapshotsPage() {
  const [snapshots, setSnapshots] = useState<ComplianceSnapshotView[]>([]);
  const [runs, setRuns] = useState<PayrollRunView[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [freezeRunId, setFreezeRunId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFreezing, setIsFreezing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [snapRes, runsRes] = await Promise.all([
        apiRequest<ComplianceSnapshotView[]>(
          `/compliance/snapshots?month=${selectedMonth}&year=${selectedYear}`
        ),
        apiRequest<{ runs: PayrollRunView[] }>("/payroll/runs?limit=20")
      ]);
      setSnapshots(snapRes ?? []);
      setRuns(runsRes.runs ?? []);
      if (runsRes.runs && runsRes.runs.length > 0 && !freezeRunId) {
        setFreezeRunId(runsRes.runs[0]?.id ?? "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load compliance snapshots.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedMonth, selectedYear]);

  const handleFreezeSnapshots = async () => {
    if (!freezeRunId) {
      alert("Please select a payroll run to freeze.");
      return;
    }
    try {
      setIsFreezing(true);
      setError(null);
      setSuccessMsg(null);
      const res = await apiRequest<{ message: string }>(
        `/compliance/snapshots/freeze/${freezeRunId}`,
        { method: "POST" }
      );
      setSuccessMsg(res.message);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to freeze compliance snapshots.");
    } finally {
      setIsFreezing(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Compliance Snapshots Explorer
          </h1>
          <p className="text-sm text-slate-500">
            Immutable frozen statutory calculations, wage basis logs, and active rule version records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/compliance" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Dashboard
          </Link>
          <Link
            href={"/compliance/reports" as Route}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            Statutory Reports &rarr;
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

      {/* Freeze Action Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Freeze Statutory Compliance Snapshot</h2>
            <p className="text-xs text-slate-500">
              Freezes PF, ESI, PT, and TDS calculations alongside active rule versions for a payroll run.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={freezeRunId}
            onChange={(e) => setFreezeRunId(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {monthNames[r.month - 1]} {r.year} ({r.totalEmployees} employees - {r.status})
              </option>
            ))}
          </select>
          <button
            onClick={handleFreezeSnapshots}
            disabled={isFreezing || runs.length === 0}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition disabled:opacity-50 whitespace-nowrap"
          >
            {isFreezing ? "Freezing..." : "❄ Freeze Compliance Run"}
          </button>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Frozen Employee Records</h2>
            <p className="text-xs text-slate-500">{snapshots.length} frozen employee calculations</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading snapshots...</div>
        ) : snapshots.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No compliance snapshots found for {monthNames[selectedMonth - 1]} {selectedYear}. Freeze a snapshot above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">PF Wage Basis</th>
                  <th className="px-4 py-3">PF (Emp / Empr)</th>
                  <th className="px-4 py-3">ESI (Emp / Empr)</th>
                  <th className="px-4 py-3">PT Amount</th>
                  <th className="px-4 py-3">TDS (Regime)</th>
                  <th className="px-4 py-3 text-right">Frozen Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {snapshots.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <div>{s.employee?.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {s.employee?.employeeCode} • {s.employee?.department?.name ?? "General"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      ₹{s.pfWageBasis.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-900">
                      <span className="font-semibold text-slate-900">₹{s.pfEmployee.toLocaleString()}</span>
                      <span className="text-xs text-slate-400"> / ₹{s.pfEmployer.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {s.esiWageBasis > 0 ? (
                        <>
                          <span className="font-semibold text-slate-900">₹{s.esiEmployee.toLocaleString()}</span>
                          <span className="text-xs text-slate-400"> / ₹{s.esiEmployer.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Exempt (&gt;21k)</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-amber-700">
                      ₹{s.ptAmount.toLocaleString()} {s.ptState ? `(${s.ptState})` : ""}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900">₹{s.tdsAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 ml-1 font-mono">({s.tdsRegime})</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs font-mono text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
