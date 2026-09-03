"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface PayrollAnalyticsResult {
  currency: string;
  costTrends: Array<{
    month: number;
    year: number;
    totalGross: number;
    totalNet: number;
    totalDeductions: number;
    totalEmployerContributions: number;
    totalCost: number;
    currency?: string;
  }>;
  departmentCostBreakdown: Array<{
    departmentName: string;
    grossCost: number;
    netCost: number;
    employeeCount: number;
    averageCostPerEmployee: number;
  }>;
  salaryBands: Array<{
    band: string;
    count: number;
    totalCost: number;
    percentage: number;
  }>;
  allowanceComponentBreakdown: Array<{
    componentName: string;
    code: string;
    totalAmount: number;
    percentage: number;
  }>;
  deductionComponentBreakdown: Array<{
    componentName: string;
    code: string;
    totalAmount: number;
    percentage: number;
  }>;
  overtimeCostTrend: Array<{
    month: number;
    year: number;
    amount: number;
  }>;
  growthRate: {
    monthlyPercentage: number;
    yearlyPercentage: number;
  };
  costCenterAnalysis: Array<{
    businessUnitName: string;
    grossCost: number;
    employeeCount: number;
  }>;
  efficiencyMetrics: {
    averageCostPerEmployee: number;
    takeHomeRatioPercentage: number;
    statutoryCostRatioPercentage: number;
  };
}

export default function PayrollCostBandAnalyticsPage() {
  const [data, setData] = useState<PayrollAnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilterState>({
    dateRange: "Current Month",
    department: "All Departments",
    businessUnit: "All Business Units"
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<PayrollAnalyticsResult>("/analytics/payroll");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load payroll analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  const latestRun = data?.costTrends?.length
    ? data.costTrends[data.costTrends.length - 1]
    : null;
  const currency = data?.currency ?? "USD";

  const isForbidden = error?.includes("403") || error?.toLowerCase().includes("permission") || error?.toLowerCase().includes("forbidden");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Payroll Cost & Band Analytics
            </h1>
            <Badge tone="success">Financial Intelligence</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Historical payroll spend trajectory, salary band distributions, allowance/deduction split, and department costs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/analytics" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control border border-border bg-surface px-3 text-xs font-medium text-zinc-900 shadow-sm transition hover:bg-muted"
          >
            &larr; Hub
          </Link>
          <Link
            href={"/payroll" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-xs font-medium text-white shadow-sm transition hover:brightness-95"
          >
            Payroll Master &rarr;
          </Link>
        </div>
      </div>

      {/* Filter Controls */}
      <AnalyticsFilterBar
        state={filters}
        onChange={setFilters}
        onRefresh={() => void loadData()}
        isLoading={isLoading}
      />

      {error && (
        <div className={`rounded-panel border p-4 text-sm ${isForbidden ? "border-amber-300 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-700"}`}>
          {isForbidden ? (
            <div>
              <p className="font-bold">Access Restricted</p>
              <p className="text-xs mt-0.5">
                You do not have the required <code className="font-mono font-semibold">payroll.analytics</code> permission to view compensation data.
              </p>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Gross Spend</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {latestRun ? `${currency} ${latestRun.totalGross.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {latestRun ? `Cycle ${latestRun.month}/${latestRun.year}` : "Latest processed run"}
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Net Disbursed</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {latestRun ? `${currency} ${latestRun.totalNet.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Net payable to employees</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Total Deductions</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {latestRun ? `${currency} ${latestRun.totalDeductions.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Statutory & voluntary</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Employer Contrib.</p>
          <p className="text-2xl font-extrabold text-zinc-900 mt-1">
            {latestRun ? `${currency} ${latestRun.totalEmployerContributions.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">PF & ESI statutory match</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Avg Cost / Employee</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {data ? `${currency} ${data.efficiencyMetrics.averageCostPerEmployee.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Per payroll cycle</p>
        </div>
      </div>

      {/* 12-Month Payroll Cost Trend */}
      <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Payroll Cost & Disbursal Trajectory</h2>
            <p className="text-xs text-zinc-500">Gross earnings calculated vs net payable bank disbursements.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-primary" />
              <span>Gross Cost</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
              <span>Net Pay</span>
            </div>
          </div>
        </div>

        {data?.costTrends?.length ? (
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4">
            {data.costTrends.map((t, idx) => {
              const maxVal = Math.max(1, ...data.costTrends.map((c) => c.totalCost));
              return (
                <div key={idx} className="flex flex-col items-center justify-end space-y-2 h-44">
                  <span className="text-[9px] font-mono font-bold text-zinc-700">
                    {Math.round(t.totalCost / 1000)}k
                  </span>
                  <div className="w-full flex items-end justify-center gap-1 h-28 bg-muted/30 rounded p-1">
                    <div
                      className="w-2.5 bg-primary rounded-t transition-all"
                      style={{ height: `${Math.max(4, (t.totalGross / maxVal) * 100)}%` }}
                      title={`Gross: ${t.currency ?? currency} ${t.totalGross.toLocaleString()}`}
                    />
                    <div
                      className="w-2.5 bg-emerald-500 rounded-t transition-all"
                      style={{ height: `${Math.max(4, (t.totalNet / maxVal) * 100)}%` }}
                      title={`Net: ${t.currency ?? currency} ${t.totalNet.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-zinc-500 truncate w-full text-center">
                    {t.month}/{t.year}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            {isLoading ? "Loading payroll trends..." : "No payroll runs recorded."}
          </div>
        )}
      </div>

      {/* Salary Bands & Department Cost Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Cost Breakdown Table */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Department Cost Breakdown</h2>
              <p className="text-xs text-zinc-500">Gross spend and employee counts by department.</p>
            </div>
            <Badge tone="neutral">{data?.departmentCostBreakdown.length ?? 0} Departments</Badge>
          </div>

          {data?.departmentCostBreakdown?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-muted/60 uppercase font-semibold text-zinc-500 border-b border-border">
                  <tr>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2 text-center">Employees</th>
                    <th className="px-3 py-2 text-right">Gross Cost</th>
                    <th className="px-3 py-2 text-right">Avg / Emp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.departmentCostBreakdown.map((d, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition">
                      <td className="px-3 py-2 font-medium text-zinc-900">{d.departmentName}</td>
                      <td className="px-3 py-2 text-center">{d.employeeCount}</td>
                      <td className="px-3 py-2 text-right font-bold text-zinc-900">
                        {currency} {d.grossCost.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-zinc-500">
                        {currency} {d.averageCostPerEmployee.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading department costs..." : "No department payroll data available."}
            </div>
          )}
        </div>

        {/* Salary Bands Distribution */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Salary Band Distribution</h2>
              <p className="text-xs text-zinc-500">Compensation distribution brackets.</p>
            </div>
            <Badge tone="neutral">Salary Bands</Badge>
          </div>

          {data?.salaryBands?.length ? (
            <div className="space-y-3 pt-1">
              {data.salaryBands.map((band, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700">{band.band}</span>
                    <span className="font-semibold text-zinc-900">
                      {band.count} employees ({band.percentage}%) • {currency} {band.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${band.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading salary bands..." : "No salary band data recorded."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
