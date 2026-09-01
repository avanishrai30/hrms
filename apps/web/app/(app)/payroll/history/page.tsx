"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { PayrollRunView } from "@vc-wms/shared-types";

export default function PayrollHistoryPage() {
  const [runs, setRuns] = useState<PayrollRunView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<{ runs: PayrollRunView[] }>("/payroll/runs?limit=50");
      setRuns(res.runs ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payroll history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LOCKED":
        return <Badge tone="neutral">🔒 Locked</Badge>;
      case "APPROVED":
        return <Badge tone="success">✓ Approved</Badge>;
      case "GENERATED":
        return <Badge tone="warning">Draft</Badge>;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payroll Disbursement History
          </h1>
          <p className="text-sm text-slate-500">
            Immutable historical record of finalized and disbursed monthly payroll runs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/payroll" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Payroll Dashboard
          </Link>
          <Link
            href={"/payroll/run" as Route}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            Run Workbench &rarr;
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Monthly Payroll Runs</h2>
            <p className="text-xs text-slate-500">{runs.length} recorded disbursement cycles</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading history...</div>
        ) : runs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No payroll cycles recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Month / Year</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Gross Earnings</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net Disbursed</th>
                  <th className="px-4 py-3">Employer PF/ESI</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.map((r) => (
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
                    <td className="px-4 py-3.5 font-bold text-emerald-700 text-base">
                      ₹{r.totalNet.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      ₹{r.totalEmployerContributions.toLocaleString()}
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
    </div>
  );
}
