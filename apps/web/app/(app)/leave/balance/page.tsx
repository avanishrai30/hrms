"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../../lib/api";
import type { LeaveBalanceView } from "@vc-wms/shared-types";

export default function LeaveBalanceLedgerPage() {
  const [balances, setBalances] = useState<LeaveBalanceView[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiRequest<LeaveBalanceView[]>(
          `/leaves/balances/me?year=${selectedYear}`
        );
        setBalances(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load balance ledger.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leave Balance Ledger</h1>
          <p className="text-sm text-slate-500">
            Comprehensive breakdown of annual allocations, monthly accruals, carry forwards, and deductions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
          <Link
            href={"/leave" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Leave Balances Ledger — Year {selectedYear}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading ledger data...</div>
        ) : balances.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No balance records found for year {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Leave Type</th>
                  <th className="px-6 py-3">Allocated</th>
                  <th className="px-6 py-3">Accrued</th>
                  <th className="px-6 py-3">Carry Forward</th>
                  <th className="px-6 py-3">Adjusted</th>
                  <th className="px-6 py-3">Used</th>
                  <th className="px-6 py-3">Pending</th>
                  <th className="px-6 py-3 text-right">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balances.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: b.leaveType?.color ?? "#3B82F6" }}
                        />
                        <span>{b.leaveType?.name ?? "Leave"}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({b.leaveType?.code})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{b.allocatedDays}d</td>
                    <td className="px-6 py-4">{b.accruedDays}d</td>
                    <td className="px-6 py-4">{b.carriedForwardDays}d</td>
                    <td className="px-6 py-4">
                      {b.manualAdjustedDays > 0 ? `+${b.manualAdjustedDays}d` : `${b.manualAdjustedDays}d`}
                    </td>
                    <td className="px-6 py-4 text-amber-600 font-medium">{b.usedDays}d</td>
                    <td className="px-6 py-4 text-slate-500">{b.pendingDays}d</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600 text-base">
                      {b.availableDays} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance Formula Explanation */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">How Available Leave is Calculated</h3>
        <p className="text-xs font-mono bg-white border border-slate-200 rounded-lg p-3 text-slate-800 leading-relaxed">
          Available Leave = (Annual Allocated + Periodic Accrued + Carried Forward + Manual Adjusted) - (Approved Used + Pending Approval + Expired)
        </p>
        <p className="text-xs text-slate-500">
          * Note: If sandwich leave policies are active in your tenant, weekend and holiday intervals spanning across your leave dates will be deducted automatically upon request approval.
        </p>
      </div>
    </div>
  );
}
