"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface FaceAnalyticsResult {
  matchSuccessPercentage: number;
  matchFailurePercentage: number;
  averageMatchScore: number;
  averageLivenessScore: number;
  spoofAttemptsCount: number;
  failureReasonsBreakdown: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  verificationLatencyMs: {
    averageMs: number;
    p95Ms: number;
  };
  cameraLightingMetrics: {
    averageQualityScore: number;
    lowLightAttemptsCount: number;
    blurCount: number;
  };
  deviceBreakdown: Array<{
    deviceType: string;
    count: number;
    percentage: number;
  }>;
}

export default function FaceBiometricsSpoofTelemetryPage() {
  const [data, setData] = useState<FaceAnalyticsResult | null>(null);
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
      const res = await apiRequest<FaceAnalyticsResult>("/analytics/face");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load face biometrics analytics.");
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
              Face Biometrics & Anti-Spoof Telemetry
            </h1>
            <Badge tone="neutral">AI Security</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time biometric matching performance, passive liveness evaluations, spoof challenge telemetry, and sensor metrics.
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
            href={"/admin/biometric-audit" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-xs font-medium text-white shadow-sm transition hover:brightness-95"
          >
            Verification Audit Logs &rarr;
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
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Match Success Rate</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data ? `${data.matchSuccessPercentage}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Biometric cosine threshold</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Avg Match Score</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? data.averageMatchScore : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Confidence score</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Avg Liveness Score</p>
          <p className="text-2xl font-extrabold text-zinc-950 mt-1">
            {data ? data.averageLivenessScore : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Texture / motion probe</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Spoof Attempts</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            {data ? data.spoofAttemptsCount : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Intercepted challenges</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">P95 Latency</p>
          <p className="text-2xl font-extrabold text-zinc-900 mt-1">
            {data ? `${data.verificationLatencyMs.p95Ms} ms` : (isLoading ? "—" : "0 ms")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Avg: {data ? `${data.verificationLatencyMs.averageMs} ms` : "—"}
          </p>
        </div>
      </div>

      {/* Verification Failure Reasons & Device Telemetry Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Failure Reasons */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Verification Anomaly & Failure Causes</h2>
              <p className="text-xs text-zinc-500">Distribution of unmatched or challenged face verification scans.</p>
            </div>
            <Badge tone="neutral">{data?.failureReasonsBreakdown.length ?? 0} Reasons</Badge>
          </div>

          {data?.failureReasonsBreakdown?.length ? (
            <div className="space-y-3">
              {data.failureReasonsBreakdown.map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">{f.reason}</span>
                    <span className="text-zinc-500 font-mono">
                      {f.count} ({f.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${f.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading failure telemetry..." : "No verification failures recorded."}
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Device Telemetry & Modality</h2>
              <p className="text-xs text-zinc-500">Verifications by hardware terminal type.</p>
            </div>
            <Badge tone="neutral">Hardware Mix</Badge>
          </div>

          {data?.deviceBreakdown?.length ? (
            <div className="space-y-2.5">
              {data.deviceBreakdown.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-control border border-border/80 p-3 text-xs">
                  <span className="font-semibold text-zinc-900">{d.deviceType}</span>
                  <span className="font-bold text-zinc-900">{d.count} punches ({d.percentage}%)</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading device breakdown..." : "No device telemetry records found."}
            </div>
          )}

          {data?.cameraLightingMetrics && (
            <div className="pt-2 border-t border-border/60">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-control bg-muted/20 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase">Avg Quality</p>
                  <p className="font-bold text-zinc-900 mt-0.5">{data.cameraLightingMetrics.averageQualityScore}</p>
                </div>
                <div className="rounded-control bg-muted/20 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase">Low Light</p>
                  <p className="font-bold text-zinc-900 mt-0.5">{data.cameraLightingMetrics.lowLightAttemptsCount}</p>
                </div>
                <div className="rounded-control bg-muted/20 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase">Blur Detects</p>
                  <p className="font-bold text-zinc-900 mt-0.5">{data.cameraLightingMetrics.blurCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
