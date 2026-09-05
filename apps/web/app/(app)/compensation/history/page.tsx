"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { formatMoney } from "../../../../lib/money";
import { normalizeEmployeePageResponse, type EmployeePageResponse } from "../../../../lib/queries/use-people-queries";
import type { EmployeeCompensationHistoryView } from "@vc-wms/shared-types";

interface EmployeeOption {
  id: string;
  fullName: string;
  employeeCode: string;
}

export default function CompensationHistoryPage() {
  const [historyList, setHistoryList] = useState<EmployeeCompensationHistoryView[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const empData = await apiRequest<EmployeeOption[] | EmployeePageResponse<EmployeeOption>>("/employees?limit=100");
      const normalizedEmployees = normalizeEmployeePageResponse(empData).employees;
      setEmployees(normalizedEmployees);

      if (normalizedEmployees.length > 0) {
        const empId = selectedEmployeeId || (normalizedEmployees[0]?.id ?? "");
        setSelectedEmployeeId(empId);
        const histData = await apiRequest<EmployeeCompensationHistoryView[]>(
          `/compensation/history/${empId}`
        );
        setHistoryList(histData ?? []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load revision history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleEmployeeChange = async (empId: string) => {
    setSelectedEmployeeId(empId);
    try {
      setIsLoading(true);
      const histData = await apiRequest<EmployeeCompensationHistoryView[]>(
        `/compensation/history/${empId}`
      );
      setHistoryList(histData ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setIsLoading(false);
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "PROMOTION_INCREASE":
        return <Badge tone="success">Promotion Increase</Badge>;
      case "ANNUAL_REVISION":
        return <Badge tone="warning">Annual Appraisal</Badge>;
      case "JOINING_SALARY":
        return <Badge tone="neutral">Joining Salary</Badge>;
      case "MANUAL_ADJUSTMENT":
        return <Badge tone="neutral">Market Adjustment</Badge>;
      default:
        return <Badge tone="neutral">{reason}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Salary Revision & Promotion History
          </h1>
          <p className="text-sm text-slate-500">
            Immutable historical ledger of salary increments, promotion revisions, and appraisals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/compensation" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Salary Directory
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter by employee */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-800">Select Employee Timeline:</div>
        <div className="w-full sm:w-80">
          <select
            value={selectedEmployeeId}
            onChange={(e) => void handleEmployeeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading revision timeline...</div>
        ) : historyList.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            ✨ No salary revisions recorded for this employee yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-4">
            {historyList.map((h, idx) => {
              const diffMonthly = h.newMonthlyCtc - h.previousMonthlyCtc;
              const percentDiff =
                h.previousMonthlyCtc > 0
                  ? ((diffMonthly / h.previousMonthlyCtc) * 100).toFixed(1)
                  : "N/A";

              return (
                <div key={h.id} className="relative pl-6">
                  {/* Timeline bullet */}
                  <span className="absolute -left-2 top-2 h-4 w-4 rounded-full border-2 border-white bg-emerald-600 shadow-sm" />

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-base">
                          Revision #{historyList.length - idx}
                        </span>
                        {getReasonBadge(h.reason)}
                      </div>
                      <div className="text-xs text-slate-400">
                        Effective: {new Date(h.effectiveFrom).toLocaleDateString()} • Recorded:{" "}
                        {new Date(h.revisionDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Before vs After Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <span className="text-[11px] text-slate-500 uppercase">Previous CTC</span>
                        <div className="text-base font-semibold text-slate-700 mt-1">
                          {formatMoney(h.previousMonthlyCtc, h.currency)} <span className="text-xs font-normal">/ mo</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{formatMoney(h.previousAnnualCtc, h.currency)} / yr</div>
                      </div>

                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                        <span className="text-[11px] text-emerald-800 uppercase font-semibold">
                          Revised New CTC
                        </span>
                        <div className="text-base font-bold text-emerald-950 mt-1">
                          {formatMoney(h.newMonthlyCtc, h.currency)} <span className="text-xs font-normal">/ mo</span>
                        </div>
                        <div className="text-[11px] text-emerald-700">{formatMoney(h.newAnnualCtc, h.currency)} / yr</div>
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex flex-col justify-between">
                        <span className="text-[11px] text-slate-500 uppercase">Net Increment</span>
                        <div className="text-base font-bold text-emerald-600">
                          {diffMonthly >= 0
                            ? `+${formatMoney(diffMonthly, h.currency)}`
                            : `-${formatMoney(Math.abs(diffMonthly), h.currency)}`}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {percentDiff !== "N/A" ? `${percentDiff}% increase` : "Initial Salary"}
                        </span>
                      </div>
                    </div>

                    {/* Notes & Approver */}
                    <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-700">Notes:</span> {h.notes ?? "No notes specified"}
                      </div>
                      <div className="text-slate-400 whitespace-nowrap">
                        Approved by: {h.approvedBy?.email ?? "System HR"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
