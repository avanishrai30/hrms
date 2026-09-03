"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface OrganizationAnalyticsResult {
  businessUnitDistribution: Array<{
    id: string;
    name: string;
    code: string;
    employeeCount: number;
    percentage: number;
  }>;
  regionDistribution: Array<{
    id: string;
    name: string;
    code: string;
    employeeCount: number;
    percentage: number;
  }>;
  teamDistribution: Array<{
    id: string;
    name: string;
    employeeCount: number;
    percentage: number;
  }>;
  managerHierarchy: {
    maxDepth: number;
    averageSpanOfControl: number;
    managerCount: number;
  };
  orgQuarterlyGrowth: Array<{
    quarter: string;
    headcount: number;
    growthRatePercentage: number;
  }>;
  crossTeamMobility: {
    totalTransfersLast12Months: number;
    transferRatePercentage: number;
  };
  orgHealthScore: {
    score: number;
    status: "EXCELLENT" | "GOOD" | "ATTENTION_REQUIRED" | "CRITICAL";
    spanBalanceScore: number;
    retentionScore: number;
  };
}

export default function OrganizationAnalyticsPage() {
  const [data, setData] = useState<OrganizationAnalyticsResult | null>(null);
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
      const res = await apiRequest<OrganizationAnalyticsResult>("/analytics/organization");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load organization analytics.");
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
              Organization Health & Structure Analytics
            </h1>
            <Badge tone="neutral">Structural Governance</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Enterprise business units, geographic corridors, organizational depth, and managerial span.
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
            href={"/organization" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-xs font-medium text-white shadow-sm transition hover:brightness-95"
          >
            Org Hierarchy &rarr;
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
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Business Units</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? data.businessUnitDistribution.length : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Operating entities</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Operating Regions</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? data.regionDistribution.length : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Geographic hubs</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Squads & Teams</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {data ? data.teamDistribution.length : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Functional teams</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Hierarchy Depth</p>
          <p className="text-2xl font-extrabold text-zinc-900 mt-1">
            {data ? `${data.managerHierarchy.maxDepth}` : (isLoading ? "—" : 0)}
            <span className="text-xs font-normal text-zinc-500 ml-1">Levels</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Max manager chain</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Span of Control</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data ? `1 : ${data.managerHierarchy.averageSpanOfControl}` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Directs / manager</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Org Health Score</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data ? `${data.orgHealthScore.score} / 100` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {data?.orgHealthScore ? data.orgHealthScore.status : "—"}
          </p>
        </div>
      </div>

      {/* Business Unit Distribution Cards */}
      <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Business Unit Structure</h2>
            <p className="text-xs text-zinc-500">Headcount and organizational share per business unit division.</p>
          </div>
          <Badge tone="neutral">{data?.businessUnitDistribution.length ?? 0} Units</Badge>
        </div>

        {data?.businessUnitDistribution?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.businessUnitDistribution.map((bu, idx) => (
              <div key={idx} className="rounded-control border border-border bg-muted/20 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">{bu.code}</span>
                  <span className="rounded bg-surface border border-border px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {bu.employeeCount} Staff
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{bu.name}</h3>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px] text-zinc-500">
                  <div className="flex justify-between">
                    <span>Workforce Share:</span>
                    <strong className="text-zinc-800">{bu.percentage}%</strong>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${bu.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            {isLoading ? "Loading business units..." : "No business unit records configured."}
          </div>
        )}
      </div>

      {/* Regional Distribution & Teams Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Regional Hubs */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Operating Regions & Geographic Distribution</h2>
              <p className="text-xs text-zinc-500">Workforce distribution across regional operating offices.</p>
            </div>
            <Badge tone="neutral">{data?.regionDistribution.length ?? 0} Regions</Badge>
          </div>

          {data?.regionDistribution?.length ? (
            <div className="space-y-3">
              {data.regionDistribution.map((reg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900">{reg.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({reg.code})</span>
                    </div>
                    <span className="text-zinc-500 font-medium">
                      {reg.employeeCount} Staff ({reg.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${reg.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading regions..." : "No regional divisions configured."}
            </div>
          )}
        </div>

        {/* Team Distribution */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Functional Teams & Squads</h2>
              <p className="text-xs text-zinc-500">Distribution across operational and development teams.</p>
            </div>
            <Badge tone="neutral">{data?.teamDistribution.length ?? 0} Teams</Badge>
          </div>

          {data?.teamDistribution?.length ? (
            <div className="space-y-3">
              {data.teamDistribution.map((team, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">{team.name}</span>
                    <span className="text-zinc-500 font-medium">
                      {team.employeeCount} Staff ({team.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${team.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading teams..." : "No teams configured."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
