"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface WorkforceAnalyticsResult {
  headcountTrends: Array<{ month: string; year: number; headcount: number; active: number }>;
  hiringTrends: Array<{ month: string; year: number; hires: number }>;
  attritionTrends: Array<{ month: string; year: number; exits: number }>;
  departmentGrowth: Array<{ departmentName: string; count: number; growthRate: number }>;
  spanOfControl: {
    averageSpan: number;
    maxSpan: number;
    distribution: Array<{ spanRange: string; managerCount: number }>;
  };
  ageBands: Array<{ bracket: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  employmentTypeDistribution: Array<{ employmentType: string; count: number; percentage: number }>;
  designationDistribution: Array<{ designationName: string; count: number; percentage: number }>;
  businessUnitDistribution: Array<{ businessUnitName: string; count: number; percentage: number }>;
}

export default function WorkforceAnalyticsPage() {
  const [data, setData] = useState<WorkforceAnalyticsResult | null>(null);
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
      const res = await apiRequest<WorkforceAnalyticsResult>("/analytics/workforce");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load workforce analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  const latestHeadcount = data?.headcountTrends?.length
    ? data.headcountTrends[data.headcountTrends.length - 1]
    : null;
  const totalHires = data?.hiringTrends?.reduce((acc, h) => acc + h.hires, 0) ?? 0;
  const totalExits = data?.attritionTrends?.reduce((acc, e) => acc + e.exits, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Workforce Analytics & Demographics
            </h1>
            <Badge tone="neutral">Demographic Telemetry</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            In-depth workforce planning metrics: hiring velocity vs attrition, department growth comparisons, span of control, and age/gender distributions.
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
            href={"/employees" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-xs font-medium text-white shadow-sm transition hover:brightness-95"
          >
            Employee Directory &rarr;
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
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

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Workforce Base</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {latestHeadcount ? latestHeadcount.headcount : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {latestHeadcount ? `${latestHeadcount.active} active contracts` : "—"}
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Total Hires (12M)</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data ? `+${totalHires}` : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            New employees joined
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Total Exits (12M)</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? totalExits : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Departures recorded
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Avg Span of Control</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {data ? `1 : ${data.spanOfControl.averageSpan}` : "—"}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Avg direct reports / manager
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Max Span</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {data ? data.spanOfControl.maxSpan : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Highest individual span
          </p>
        </div>
      </div>

      {/* 12-Month Headcount & Hiring vs Attrition Trend */}
      <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">12-Month Hiring vs Attrition Velocity</h2>
            <p className="text-xs text-zinc-500">Monthly new hires added vs voluntary/involuntary exits.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
              <span>Hires</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-red-400" />
              <span>Exits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-primary" />
              <span>Total Headcount</span>
            </div>
          </div>
        </div>

        {data?.headcountTrends?.length ? (
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4">
            {data.headcountTrends.map((m, idx) => {
              const hireItem = data.hiringTrends[idx];
              const exitItem = data.attritionTrends[idx];
              const hires = hireItem ? hireItem.hires : 0;
              const exits = exitItem ? exitItem.exits : 0;
              const maxVal = Math.max(1, ...data.hiringTrends.map((h) => h.hires), ...data.attritionTrends.map((e) => e.exits));

              return (
                <div key={idx} className="flex flex-col items-center justify-end space-y-2 h-44">
                  <span className="text-[10px] font-mono font-bold text-zinc-800">
                    {m.headcount}
                  </span>
                  <div className="w-full flex items-end justify-center gap-1 h-28 bg-muted/30 rounded p-1">
                    <div
                      className="w-2.5 bg-emerald-500 rounded-t transition-all"
                      style={{ height: `${Math.max(4, (hires / maxVal) * 100)}%` }}
                      title={`Hires: +${hires}`}
                    />
                    <div
                      className="w-2.5 bg-red-400 rounded-t transition-all"
                      style={{ height: `${Math.max(4, (exits / maxVal) * 100)}%` }}
                      title={`Exits: -${exits}`}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-zinc-500 truncate w-full text-center">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            {isLoading ? "Loading trend data..." : "No historical headcount trends available."}
          </div>
        )}
      </div>

      {/* Department Growth Comparison Table */}
      <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Department Headcount & Growth</h2>
            <p className="text-xs text-zinc-500">Department distribution and 12-month net expansion velocity.</p>
          </div>
          <Badge tone="neutral">{data?.departmentGrowth.length ?? 0} Departments</Badge>
        </div>

        {data?.departmentGrowth?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-muted/60 uppercase font-semibold text-zinc-500 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-center font-bold text-zinc-900">Current Headcount</th>
                  <th className="px-4 py-3 text-right">Net Growth %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.departmentGrowth.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3 font-semibold text-zinc-900">{dept.departmentName}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-zinc-900">{dept.count}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${dept.growthRate >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {dept.growthRate >= 0 ? `+${dept.growthRate}%` : `${dept.growthRate}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            {isLoading ? "Loading department data..." : "No department records found."}
          </div>
        )}
      </div>

      {/* Manager Span of Control & Demographics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Manager Span of Control Analysis */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Manager Span of Control Analysis</h2>
              <p className="text-xs text-zinc-500">Distribution of team sizes across organizational leads.</p>
            </div>
            <span className="text-xs font-mono font-bold text-primary">
              Avg 1 : {data?.spanOfControl.averageSpan ?? 0}
            </span>
          </div>

          {data?.spanOfControl.distribution?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {data.spanOfControl.distribution.map((b, idx) => (
                <div key={idx} className="rounded-control border border-border bg-muted/20 p-2.5 text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 font-medium">{b.spanRange}</span>
                  <p className="text-base font-extrabold text-zinc-900">{b.managerCount} Leads</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading span data..." : "No manager hierarchy recorded."}
            </div>
          )}
        </div>

        {/* Age & Gender Distribution */}
        <div className="space-y-6">
          {/* Age Distribution Brackets */}
          <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-zinc-950">Age Demographics</h3>
              <Badge tone="neutral">Workforce Mix</Badge>
            </div>

            {data?.ageBands?.length ? (
              <div className="space-y-2 pt-1">
                {data.ageBands.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-700">{item.bracket}</span>
                      <span className="font-semibold text-zinc-900">{item.count} staff ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500">
                {isLoading ? "Loading age brackets..." : "No date of birth data recorded."}
              </div>
            )}
          </div>

          {/* Gender Ratio */}
          <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-zinc-950">Gender Distribution</h3>
              <Badge tone="neutral">Demographics</Badge>
            </div>

            {data?.genderDistribution?.length ? (
              <div className="space-y-2 pt-1">
                {data.genderDistribution.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-none">
                    <span className="font-medium text-zinc-800">{g.gender}</span>
                    <span className="font-bold text-zinc-900">{g.count} ({g.percentage}%)</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500">
                {isLoading ? "Loading gender distribution..." : "No gender records found."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
