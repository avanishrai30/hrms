"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { PayrollRunView, PayslipView } from "@vc-wms/shared-types";

export default function AdminPayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipView[]>([]);
  const [lockedRuns, setLockedRuns] = useState<PayrollRunView[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [selectedPayslipIds, setSelectedPayslipIds] = useState<string[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterMonth) params.set("month", filterMonth);
      if (filterYear) params.set("year", filterYear);
      params.set("limit", "100");

      const [payslipsRes, runsRes] = await Promise.all([
        apiRequest<{ payslips: PayslipView[] }>(`/payslips?${params.toString()}`),
        apiRequest<{ runs: PayrollRunView[] }>("/payroll/runs?limit=20")
      ]);

      setPayslips(payslipsRes.payslips ?? []);
      const locked = (runsRes.runs ?? []).filter((r) => r.status === "LOCKED");
      setLockedRuns(locked);
      if (locked.length > 0 && !selectedRunId) {
        setSelectedRunId(locked[0]?.id ?? "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payslips.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filterMonth, filterYear]);

  const handleGeneratePayslips = async () => {
    if (!selectedRunId) {
      alert("Please select a locked payroll run.");
      return;
    }
    try {
      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);
      const res = await apiRequest<{ message: string }>(
        `/payslips/generate/run/${selectedRunId}`,
        { method: "POST" }
      );
      setSuccessMessage(res.message);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate payslips.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDistributeSelected = async () => {
    if (selectedPayslipIds.length === 0) {
      alert("Please select at least one payslip to distribute.");
      return;
    }
    try {
      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);
      const res = await apiRequest<{ message: string }>("/payslips/distribute", {
        method: "POST",
        body: JSON.stringify({ payslipIds: selectedPayslipIds, channel: "EMAIL" })
      });
      setSuccessMessage(res.message);
      setSelectedPayslipIds([]);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to distribute payslips.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayslipIds(payslips.map((p) => p.id));
    } else {
      setSelectedPayslipIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedPayslipIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DOWNLOADED":
        return <Badge tone="success">Downloaded</Badge>;
      case "VIEWED":
        return <Badge tone="neutral">Viewed</Badge>;
      case "DISTRIBUTED":
        return <Badge tone="success">Distributed</Badge>;
      case "GENERATED":
        return <Badge tone="warning">Generated</Badge>;
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payslip Management & Distribution
          </h1>
          <p className="text-sm text-slate-500">
            Generate high-DPI A4 PDF payslips for locked cycles and dispatch automated email distributions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/admin/payslip-distribution" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Delivery Monitor
          </Link>
          <Link
            href={"/admin/payslip-audit" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Payslip Audit
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 font-semibold">
          ✓ {successMessage}
        </div>
      )}

      {/* Generation & Batch Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Release & Generate Box */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Release Payslips from Locked Cycle</h2>
            <span className="text-xs text-emerald-700 font-semibold">🔒 Locked Only</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {lockedRuns.length === 0 ? (
                <option value="">No locked payroll runs available</option>
              ) : (
                lockedRuns.map((r) => (
                  <option key={r.id} value={r.id}>
                    {monthNames[r.month - 1]} {r.year} ({r.totalEmployees} employees - ₹{r.totalNet.toLocaleString()})
                  </option>
                ))
              )}
            </select>
            <button
              onClick={handleGeneratePayslips}
              disabled={isProcessing || lockedRuns.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Generate PDF Payslips"}
            </button>
          </div>
        </div>

        {/* Batch Email Distribution Box */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Batch Email Distribution</h2>
            <span className="text-xs text-slate-500">{selectedPayslipIds.length} payslips selected</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Dispatches automated email notifications with download links to employee inboxes.
            </p>
            <button
              onClick={handleDistributeSelected}
              disabled={isProcessing || selectedPayslipIds.length === 0}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition disabled:opacity-50 whitespace-nowrap"
            >
              ✉ Distribute Selected
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Payslips Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Released Employee Payslips</h2>
            <p className="text-xs text-slate-500">List of all generated and archived payslip documents</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
            >
              <option value="">All Months</option>
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              placeholder="Year"
              className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading payslip inventory...</div>
        ) : payslips.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No payslips found for the selected period. Generate payslips above from a locked payroll cycle.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedPayslipIds.length === payslips.length && payslips.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Gross Salary</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Salary</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedPayslipIds.includes(p.id)}
                        onChange={() => handleToggleSelect(p.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <div>{p.employee?.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {p.employee?.employeeCode} • {p.employee?.department?.name ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800">
                      {monthNames[p.month - 1]} {p.year}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      ₹{p.grossSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-amber-700">
                      ₹{p.deductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      ₹{p.netSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600">v{p.version}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(p.status)}</td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Link
                        href={`/payslips/${p.id}` as Route}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white px-2.5 py-1 rounded shadow-xs"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => window.open(`/api/v1/payslips/${p.id}/download`, "_blank")}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded"
                      >
                        ⬇ PDF
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
  );
}
