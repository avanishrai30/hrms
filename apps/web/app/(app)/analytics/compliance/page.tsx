"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface ComplianceAnalyticsResult {
  pfContributionTrends: Array<{
    month: number;
    year: number;
    employeeContribution: number;
    employerContribution: number;
    totalPf: number;
  }>;
  esiContributionTrends: Array<{
    month: number;
    year: number;
    employeeContribution: number;
    employerContribution: number;
    totalEsi: number;
  }>;
  ptStateTrends: Array<{
    state: string;
    totalAmount: number;
    employeeCount: number;
  }>;
  tdsDeductionTrends: Array<{
    month: number;
    year: number;
    totalTds: number;
    avgTdsPerEmployee: number;
  }>;
  liabilitiesSummary: {
    monthlyLiabilities: Array<{
      period: string;
      pf: number;
      esi: number;
      pt: number;
      tds: number;
      total: number;
    }>;
    quarterlyLiabilities: Array<{
      quarter: string;
      totalLiability: number;
    }>;
  };
  complianceRiskScore: number;
  missingFilingsCount: number;
  pendingFilingsCount: number;
  complianceHealthIndex: {
    score: number;
    status: "EXCELLENT" | "HEALTHY" | "MODERATE" | "AT_RISK";
    unresolvedDiscrepanciesCount: number;
  };
}

export default function ComplianceStatutoryAnalyticsPage() {
  const [data, setData] = useState<ComplianceAnalyticsResult | null>(null);
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
      const res = await apiRequest<ComplianceAnalyticsResult>("/analytics/compliance");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load compliance analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  const latestMonth = data?.liabilitiesSummary.monthlyLiabilities?.length
    ? data.liabilitiesSummary.monthlyLiabilities[data.liabilitiesSummary.monthlyLiabilities.length - 1]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Statutory Compliance & Liability Analytics
            </h1>
            <Badge tone="neutral">Statutory Telemetry</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time evaluation against statutory rules: Provident Fund, State Insurance, Professional Tax, and TDS deposits.
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
            href={"/compliance" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-xs font-medium text-white shadow-sm transition hover:brightness-95"
          >
            Compliance Center &rarr;
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

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Compliance Health</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data?.complianceHealthIndex ? `${data.complianceHealthIndex.score} / 100` : (isLoading ? "—" : "—")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Status: {data?.complianceHealthIndex ? data.complianceHealthIndex.status : "—"}
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Monthly Liability</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {latestMonth ? latestMonth.total.toLocaleString() : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {latestMonth ? `Period ${latestMonth.period}` : "Latest period"}
          </p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Compliance Risk</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {data ? `${data.complianceRiskScore}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Risk index score</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Missing Filings</p>
          <p className="text-2xl font-extrabold text-zinc-900 mt-1">
            {data ? data.missingFilingsCount : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Overdue statutory returns</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Pending Challans</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {data ? data.pendingFilingsCount : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Due for filing</p>
        </div>
      </div>

      {/* Monthly Liabilities Trajectory */}
      <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Statutory Liability Trajectory</h2>
            <p className="text-xs text-zinc-500">Aggregated monthly PF, ESI, PT, and TDS obligations.</p>
          </div>
        </div>

        {data?.liabilitiesSummary.monthlyLiabilities?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4">
            {data.liabilitiesSummary.monthlyLiabilities.map((m, idx) => (
              <div key={idx} className="rounded-control border border-border bg-muted/20 p-3 space-y-1">
                <span className="text-xs font-bold text-zinc-800">{m.period}</span>
                <p className="text-base font-extrabold text-zinc-900">{m.total.toLocaleString()}</p>
                <div className="text-[10px] text-zinc-500 space-y-0.5 pt-1">
                  <div>PF: {m.pf.toLocaleString()}</div>
                  <div>ESI: {m.esi.toLocaleString()}</div>
                  <div>PT: {m.pt.toLocaleString()}</div>
                  <div>TDS: {m.tds.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            {isLoading ? "Loading liability trends..." : "No statutory snapshot records found."}
          </div>
        )}
      </div>

      {/* Quarterly Liabilities & Professional Tax State Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quarterly Liabilities */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Quarterly Liabilities Summary</h2>
              <p className="text-xs text-zinc-500">Aggregated statutory liabilities by fiscal quarter.</p>
            </div>
            <Badge tone="neutral">{data?.liabilitiesSummary.quarterlyLiabilities.length ?? 0} Quarters</Badge>
          </div>

          {data?.liabilitiesSummary.quarterlyLiabilities?.length ? (
            <div className="space-y-2">
              {data.liabilitiesSummary.quarterlyLiabilities.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-control border border-border/70 p-3 text-xs">
                  <span className="font-semibold text-zinc-900">{q.quarter}</span>
                  <span className="font-bold text-zinc-900">{q.totalLiability.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading quarterly data..." : "No quarterly liabilities recorded."}
            </div>
          )}
        </div>

        {/* State Professional Tax */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Professional Tax by State</h2>
              <p className="text-xs text-zinc-500">Jurisdictional PT collections and covered employees.</p>
            </div>
            <Badge tone="neutral">{data?.ptStateTrends.length ?? 0} States</Badge>
          </div>

          {data?.ptStateTrends?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-muted/60 uppercase font-semibold text-zinc-500 border-b border-border">
                  <tr>
                    <th className="px-3 py-2">State / Jurisdiction</th>
                    <th className="px-3 py-2 text-center">Employees</th>
                    <th className="px-3 py-2 text-right">Total PT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.ptStateTrends.map((s, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition">
                      <td className="px-3 py-2 font-medium text-zinc-900">{s.state}</td>
                      <td className="px-3 py-2 text-center">{s.employeeCount}</td>
                      <td className="px-3 py-2 text-right font-bold text-zinc-900">{s.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading PT state records..." : "No state PT records recorded."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
