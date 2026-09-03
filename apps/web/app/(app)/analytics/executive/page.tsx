"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface ExecutiveAnalyticsResult {
  headcount: {
    total: number;
    active: number;
    inactive: number;
    probation: number;
    notice: number;
  };
  newHiresThisMonth: number;
  attritionRate: number;
  attendanceRate: number;
  leaveUtilizationPercentage: number;
  payroll: {
    totalCost: number;
    overtimeCost: number;
    grossSalary: number;
    netSalary: number;
    averageSalary: number;
    employerContributions: number;
    currency?: string;
  };
  statutoryLiabilities: {
    totalPf: number;
    totalEsi: number;
    totalPt: number;
    totalTds: number;
    totalLiability: number;
  };
  distributions: {
    department: Array<{ departmentName: string; count: number; percentage: number }>;
    gender: Array<{ gender: string; count: number; percentage: number }>;
    employmentType: Array<{ employmentType: string; count: number; percentage: number }>;
  };
  biometrics: {
    faceMatchPercentage: number;
    livenessSuccessPercentage: number;
  };
}

export default function ExecutiveIntelligenceDashboardPage() {
  const [data, setData] = useState<ExecutiveAnalyticsResult | null>(null);
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
      const res = await apiRequest<ExecutiveAnalyticsResult>("/analytics/executive");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load executive analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  const currency = data?.payroll.currency ?? "USD";
  const totalCount = data?.headcount.total ?? 0;
  const activeCount = data?.headcount.active ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Link href={"/analytics" as Route} className="hover:text-zinc-900 transition">
              Analytics Hub
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Executive CXO Suite</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
            Executive Intelligence Command Center
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Cross-domain KPI overview: workforce stability, payroll expenditure, and statutory liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={"/analytics" as Route}
            className="rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-muted transition"
          >
            &larr; Hub View
          </Link>
          <Link
            href={"/analytics/reports" as Route}
            className="rounded-control bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
          >
            Executive Export &rarr;
          </Link>
        </div>
      </div>

      {/* Global Filter Bar */}
      <AnalyticsFilterBar
        state={filters}
        onChange={setFilters}
        onRefresh={() => void loadData()}
        isLoading={isLoading}
      />

      {error && (
        <div className="rounded-panel border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Top 10 KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* 1. Total Headcount */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Headcount</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? totalCount : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {data ? `${activeCount} active contracts` : "—"}
          </p>
        </div>

        {/* 2. Active Staff Ratio */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Active Staff Ratio</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {data ? `${data.headcount.probation} probation • ${data.headcount.notice} notice` : "—"}
          </p>
        </div>

        {/* 3. New Hires This Month */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">New Hires</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? `+${data.newHiresThisMonth}` : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Current month joined</p>
        </div>

        {/* 4. Attrition Rate */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Attrition Rate</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? `${data.attritionRate}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Annualized turnover</p>
        </div>

        {/* 5. Attendance Rate */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Attendance Rate</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {data ? `${data.attendanceRate}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">On-duty workforce</p>
        </div>

        {/* 6. Leave Utilization */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Leave Utilization</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? `${data.leaveUtilizationPercentage}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Of allocated quota</p>
        </div>

        {/* 7. Gross Payroll Cost */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Gross Payroll</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? `${currency} ${data.payroll.grossSalary.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Net: {data ? `${currency} ${data.payroll.netSalary.toLocaleString()}` : "—"}
          </p>
        </div>

        {/* 8. Overtime Cost */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Overtime Payouts</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? `${currency} ${data.payroll.overtimeCost.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Adjustments & extra hours</p>
        </div>

        {/* 9. Statutory Liabilities */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Statutory Total</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {data ? `${currency} ${data.statutoryLiabilities.totalLiability.toLocaleString()}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">PF + ESI + PT + TDS</p>
        </div>

        {/* 10. Biometric Match */}
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Biometric Match</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data ? `${data.biometrics.faceMatchPercentage}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Face match success</p>
        </div>
      </div>

      {/* Distributions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Distribution Table */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Department Distribution</h2>
              <p className="text-xs text-zinc-500">Employee distribution across departments.</p>
            </div>
            <Badge tone="neutral">{data?.distributions.department.length ?? 0} Departments</Badge>
          </div>

          {data?.distributions.department?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-muted/60 uppercase font-semibold text-zinc-500 border-b border-border">
                  <tr>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2 text-center">Headcount</th>
                    <th className="px-3 py-2 text-right">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.distributions.department.map((d, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition">
                      <td className="px-3 py-2 font-medium text-zinc-900">{d.departmentName}</td>
                      <td className="px-3 py-2 text-center font-bold text-zinc-900">{d.count}</td>
                      <td className="px-3 py-2 text-right text-zinc-600">{d.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading department distribution..." : "No department records found."}
            </div>
          )}
        </div>

        {/* Employment Type Distribution */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Employment Type Breakdown</h2>
              <p className="text-xs text-zinc-500">Workforce distribution by contract type.</p>
            </div>
            <Badge tone="neutral">Contract Mix</Badge>
          </div>

          {data?.distributions.employmentType?.length ? (
            <div className="space-y-3">
              {data.distributions.employmentType.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">{item.employmentType}</span>
                    <span className="text-zinc-500 font-mono">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading employment types..." : "No employment types recorded."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
