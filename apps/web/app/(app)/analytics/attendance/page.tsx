"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "../components/analytics-filter-bar";

interface AttendanceAnalyticsResult {
  dailyTrends: Array<{ date: string; present: number; absent: number; late: number; onLeave: number; halfDay: number }>;
  weeklyTrends: Array<{ week: string; presentPercentage: number; lateArrivalsCount: number; missingCheckoutsCount: number }>;
  monthlyTrends: Array<{ month: string; presentPercentage: number; lateArrivalsCount: number; missingCheckoutsCount: number }>;
  attendanceHeatmap: Array<{ dayOfWeek: string; hour: number; count: number }>;
  geofenceViolationsPerLocation: Array<{ locationName: string; violationsCount: number; totalAttempts: number; complianceRate: number }>;
  exceptionsBreakdown: Array<{ exceptionType: string; count: number; percentage: number }>;
  biometricMatchStats: {
    successRate: number;
    failureRate: number;
    totalAttempts: number;
  };
  livenessFailures: {
    totalFailures: number;
    failureRate: number;
    breakdown: Array<{ reason: string; count: number }>;
  };
  fraudIndicators: {
    cooldownViolationsCount: number;
    suspiciousDevicePunchesCount: number;
    fakeGpsAttemptsCount: number;
  };
}

export default function AttendanceAnalyticsPage() {
  const [data, setData] = useState<AttendanceAnalyticsResult | null>(null);
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
      const res = await apiRequest<AttendanceAnalyticsResult>("/analytics/attendance");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load attendance analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hoursLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  const totalLate = data?.dailyTrends?.reduce((acc, d) => acc + d.late, 0) ?? 0;
  const totalAbsent = data?.dailyTrends?.reduce((acc, d) => acc + d.absent, 0) ?? 0;
  const totalPresent = data?.dailyTrends?.reduce((acc, d) => acc + d.present, 0) ?? 0;
  const latestDaily = data?.dailyTrends?.length ? data.dailyTrends[data.dailyTrends.length - 1] : null;

  // Compute heatmap cell lookup
  const heatmapMap = new Map<string, number>();
  if (data?.attendanceHeatmap) {
    for (const h of data.attendanceHeatmap) {
      heatmapMap.set(`${h.dayOfWeek}-${h.hour}`, h.count);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Attendance Intelligence & 24x7 Heatmap
            </h1>
            <Badge tone="neutral">Operational Telemetry</Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            24-hour presence matrix, late arrivals, missing checkouts, geofence radius enforcement, and biometric anti-fraud alerts.
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
            href={"/attendance" as Route}
            className="inline-flex h-9 items-center justify-center rounded-control bg-primary px-3 text-xs font-medium text-white shadow-sm transition hover:brightness-95"
          >
            Live Muster Roll &rarr;
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
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Today Present</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {latestDaily ? latestDaily.present : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">On-duty check-ins</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Late Arrivals</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {data ? totalLate : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Period total</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Absences</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            {data ? totalAbsent : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Unplanned absent</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Biometric Match Rate</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {data?.biometricMatchStats ? `${data.biometricMatchStats.successRate}%` : (isLoading ? "—" : "0%")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Face verifications</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Biometric Attempts</p>
          <p className="text-2xl font-extrabold text-zinc-900 mt-1">
            {data?.biometricMatchStats ? data.biometricMatchStats.totalAttempts : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Verification events</p>
        </div>

        <div className="rounded-panel border border-border bg-surface p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase">Liveness Failures</p>
          <p className="text-2xl font-extrabold text-zinc-900 mt-1">
            {data?.livenessFailures ? data.livenessFailures.totalFailures : (isLoading ? "—" : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Anti-spoof triggers</p>
        </div>
      </div>

      {/* 7-Day x 24-Hour Attendance Heatmap Grid */}
      <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Workforce Presence Heatmap (24 Hours)</h2>
            <p className="text-xs text-zinc-500">Punch density and real-time on-site presence across hour slots.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Low</span>
            <div className="flex gap-1">
              <span className="h-3.5 w-3.5 rounded bg-muted/40" />
              <span className="h-3.5 w-3.5 rounded bg-primary/20" />
              <span className="h-3.5 w-3.5 rounded bg-primary/50" />
              <span className="h-3.5 w-3.5 rounded bg-primary" />
            </div>
            <span>High Density</span>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <div className="min-w-[700px] space-y-2">
            {/* Hour headers */}
            <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 text-center text-[10px] text-zinc-400 font-mono">
              <div />
              {hoursLabels.map((h, i) => (
                <div key={i} className="truncate">
                  {i % 3 === 0 ? h.split(":")[0] : ""}
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {daysOfWeek.map((day) => (
              <div key={day} className="grid grid-cols-[60px_repeat(24,1fr)] gap-1 items-center">
                <span className="text-xs font-bold text-zinc-800">{day}</span>
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = heatmapMap.get(`${day}-${hour}`) ?? 0;
                  let bgClass = "bg-muted/30";
                  if (count > 20) bgClass = "bg-primary text-white";
                  else if (count > 10) bgClass = "bg-primary/80 text-white";
                  else if (count > 5) bgClass = "bg-primary/50 text-zinc-950";
                  else if (count > 0) bgClass = "bg-primary/20 text-zinc-700";

                  return (
                    <div
                      key={hour}
                      className={`h-7 rounded flex items-center justify-center text-[9px] font-mono transition-transform hover:scale-110 cursor-pointer ${bgClass}`}
                      title={`${day} @ ${hoursLabels[hour]}: ${count} punches`}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geofence Compliance & Fraud Telemetry Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Geofence Violations by Location */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Geofence Compliance by Location</h2>
              <p className="text-xs text-zinc-500">Perimeter adherence across workplace sites.</p>
            </div>
            <Badge tone="neutral">{data?.geofenceViolationsPerLocation.length ?? 0} Sites</Badge>
          </div>

          {data?.geofenceViolationsPerLocation?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-muted/60 uppercase font-semibold text-zinc-500 border-b border-border">
                  <tr>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2 text-center">Punches</th>
                    <th className="px-3 py-2 text-center text-red-600">Violations</th>
                    <th className="px-3 py-2 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.geofenceViolationsPerLocation.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 transition">
                      <td className="px-3 py-2 font-medium text-zinc-900">{loc.locationName}</td>
                      <td className="px-3 py-2 text-center">{loc.totalAttempts}</td>
                      <td className="px-3 py-2 text-center font-bold text-red-600">{loc.violationsCount}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-600">{loc.complianceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500">
              {isLoading ? "Loading location data..." : "No geofenced location records found."}
            </div>
          )}
        </div>

        {/* Fraud Indicators & Security Alerts */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Fraud & Anti-Spoof Telemetry</h2>
              <p className="text-xs text-zinc-500">Automated security triggers and biometric challenges.</p>
            </div>
            <Badge tone="neutral">Security Monitor</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-control border border-border bg-muted/20 p-3 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Rapid Cooldown</p>
              <p className="text-xl font-bold text-zinc-900 mt-1">
                {data?.fraudIndicators.cooldownViolationsCount ?? 0}
              </p>
            </div>
            <div className="rounded-control border border-border bg-muted/20 p-3 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Suspicious Devices</p>
              <p className="text-xl font-bold text-zinc-900 mt-1">
                {data?.fraudIndicators.suspiciousDevicePunchesCount ?? 0}
              </p>
            </div>
            <div className="rounded-control border border-border bg-muted/20 p-3 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Fake GPS Attempts</p>
              <p className="text-xl font-bold text-zinc-900 mt-1">
                {data?.fraudIndicators.fakeGpsAttemptsCount ?? 0}
              </p>
            </div>
          </div>

          {data?.livenessFailures.breakdown?.length ? (
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-zinc-800">Liveness Failure Causes</h4>
              {data.livenessFailures.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <span className="text-zinc-600">{item.reason}</span>
                  <span className="font-bold text-zinc-900">{item.count} occurrences</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-400">
              No anti-spoof liveness failures detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
