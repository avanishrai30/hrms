"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface LeaveAnalyticsResult {
  utilizationMetrics: {
    totalAllocatedDays: number;
    totalUsedDays: number;
    totalRemainingDays: number;
    utilizationPercentage: number;
    projectedBurnRate: number;
  };
  departmentLeaveTrends: Array<{
    departmentName: string;
    leaveDaysTaken: number;
    employeeCount: number;
    avgDaysPerEmployee: number;
  }>;
  leaveTypeBreakdown: Array<{
    leaveTypeName: string;
    code: string;
    daysTaken: number;
    percentage: number;
  }>;
  leaveCostAnalysis: {
    paidDaysCount: number;
    unpaidDaysCount: number;
    estimatedPaidLeaveCost: number;
    unpaidSalaryDeductions: number;
  };
  sandwichLeaveImpact: {
    instancesCount: number;
    sandwichDaysCount: number;
    estimatedCostImpact: number;
  };
  approvalTurnaroundHours: {
    averageHours: number;
    medianHours: number;
  };
}

export default function LeaveAccrualAnalyticsPage() {
  const [data, setData] = useState<LeaveAnalyticsResult | null>(null);
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
      const res = await apiRequest<LeaveAnalyticsResult>("/analytics/leaves");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load leave analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Leave & Accrual Burn Analytics
            </h1>
            <Badge tone="neutral">Accrual Telemetry</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Leave balance burn forecasting, financial liability impact, sandwich rule penalties, and manager SLA turnaround times.
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
            href={"/leave" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-xs font-medium text-white shadow-sm transition hover:brightness-95"
          >
            Leave Master &rarr;
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
        <div className="rounded-panel border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Leave Burn Rate</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {data?.utilizationMetrics ? `${data.utilizationMetrics.utilizationPercentage}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Of allocated balance</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Days Consumed</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data?.utilizationMetrics ? data.utilizationMetrics.totalUsedDays : (isLoading ? "—" : 0)}
            <span className="text-xs font-normal text-zinc-500 ml-1">days</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {data ? `${data.leaveCostAnalysis.paidDaysCount} paid / ${data.leaveCostAnalysis.unpaidDaysCount} unpaid` : "—"}
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Remaining Days</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data?.utilizationMetrics ? data.utilizationMetrics.totalRemainingDays : (isLoading ? "—" : 0)}
            <span className="text-xs font-normal text-zinc-500 ml-1">days</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Available balance</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Sandwich Deducted</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {data?.sandwichLeaveImpact ? data.sandwichLeaveImpact.sandwichDaysCount : (isLoading ? "—" : 0)}
            <span className="text-xs font-normal text-zinc-500 ml-1">days</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {data?.sandwichLeaveImpact ? `${data.sandwichLeaveImpact.instancesCount} instances` : "—"}
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Avg Approval TAT</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data?.approvalTurnaroundHours ? `${data.approvalTurnaroundHours.averageHours}h` : (isLoading ? "—" : "0h")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Median: {data?.approvalTurnaroundHours ? `${data.approvalTurnaroundHours.medianHours}h` : "—"}
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Allocated Days</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data?.utilizationMetrics ? data.utilizationMetrics.totalAllocatedDays : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Total policy quota</p>
        </div>
      </div>

      {/* Leave Types Breakdown & Department Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Leave Utilization Table */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Department Leave Utilization</h2>
              <p className="text-xs text-zinc-500">Days taken and per-employee average across departments.</p>
            </div>
            <Badge tone="neutral">{data?.departmentLeaveTrends.length ?? 0} Departments</Badge>
          </div>

          {data?.departmentLeaveTrends?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-muted/60 uppercase font-semibold text-zinc-500 border-b border-border">
                  <tr>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2 text-center">Headcount</th>
                    <th className="px-3 py-2 text-center">Days Taken</th>
                    <th className="px-3 py-2 text-right">Avg / Employee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.departmentLeaveTrends.map((d, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition">
                      <td className="px-3 py-2 font-medium text-zinc-900">{d.departmentName}</td>
                      <td className="px-3 py-2 text-center">{d.employeeCount}</td>
                      <td className="px-3 py-2 text-center font-bold text-zinc-900">{d.leaveDaysTaken}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">{d.avgDaysPerEmployee} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading department trends..." : "No department leave records found."}
            </div>
          )}
        </div>

        {/* Leave Type Split */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Leave Type Distribution</h2>
              <p className="text-xs text-zinc-500">Breakdown of leave categories utilized.</p>
            </div>
            <Badge tone="neutral">{data?.leaveTypeBreakdown.length ?? 0} Types</Badge>
          </div>

          {data?.leaveTypeBreakdown?.length ? (
            <div className="space-y-3 pt-1">
              {data.leaveTypeBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700">{item.leaveTypeName} ({item.code})</span>
                    <span className="font-semibold text-zinc-900">{item.daysTaken} days ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading leave types..." : "No leave types recorded."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
