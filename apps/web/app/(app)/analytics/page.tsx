"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "./components/analytics-filter-bar";
import type { ExecutiveDashboardView } from "@vc-wms/shared-types";

export default function AnalyticsHubPage() {
  const [data, setData] = useState<ExecutiveDashboardView | null>(null);
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
      const res = await apiRequest<ExecutiveDashboardView>("/analytics/overview");
      setData(res);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load analytics overview.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  const domainDashboards = [
    {
      title: "Executive Intelligence",
      href: "/analytics/executive" as Route,
      badge: "CXO Suite",
      badgeTone: "success" as const,
      description: "Holistic multi-dimensional KPI command center: headcount, attrition velocity, payroll burn, and statutory health.",
      kpis: [
        { label: "Active Staff", value: data ? String(data.headcount.active) : "—" },
        { label: "Attendance Rate", value: data ? `${data.attendanceToday.attendanceRate}%` : "—" },
        { label: "Gross Payroll", value: data?.payrollLiability ? data.payrollLiability.totalGross.toLocaleString() : "—" }
      ],
      icon: "🏢"
    },
    {
      title: "Workforce Demographics",
      href: "/analytics/workforce" as Route,
      badge: "Demographics",
      badgeTone: "neutral" as const,
      description: "12-month headcount trajectory, hiring vs attrition delta, department growth, age brackets, and manager span of control.",
      kpis: [
        { label: "Total Headcount", value: data ? String(data.headcount.total) : "—" },
        { label: "Probation", value: data ? String(data.headcount.probation) : "—" },
        { label: "Notice Period", value: data ? String(data.headcount.notice) : "—" }
      ],
      icon: "👥"
    },
    {
      title: "Attendance & Heatmap",
      href: "/analytics/attendance" as Route,
      badge: "Operations",
      badgeTone: "neutral" as const,
      description: "24x7 punch density heatmap, punctuality indexes, missing checkouts, geofence radius adherence, and fraud telemetry.",
      kpis: [
        { label: "Today Present", value: data ? String(data.attendanceToday.present) : "—" },
        { label: "Late Arrivals", value: data ? String(data.attendanceToday.late) : "—" },
        { label: "Absences", value: data ? String(data.attendanceToday.absent) : "—" }
      ],
      icon: "⏱️"
    },
    {
      title: "Leave & Accrual Analytics",
      href: "/analytics/leave" as Route,
      badge: "Utilization",
      badgeTone: "warning" as const,
      description: "Accrual velocity, balance burn forecast, sandwich penalty impact, approval turnaround time, and seasonal leave surges.",
      kpis: [
        { label: "Today on Leave", value: data ? String(data.attendanceToday.onLeave) : "—" },
        { label: "Half Day", value: data ? String(data.attendanceToday.halfDay) : "—" },
        { label: "Status", value: data ? "Active Tracking" : "—" }
      ],
      icon: "🌴"
    },
    {
      title: "Payroll Cost & Bands",
      href: "/analytics/payroll" as Route,
      badge: "Finance",
      badgeTone: "success" as const,
      description: "12-month expense trajectory, net payable disbursal, salary band distribution, allowance/deduction split, and budget variance.",
      kpis: [
        { label: "Gross Spend", value: data?.payrollLiability ? data.payrollLiability.totalGross.toLocaleString() : "—" },
        { label: "Net Disbursed", value: data?.payrollLiability ? data.payrollLiability.totalNet.toLocaleString() : "—" },
        { label: "Employer Contrib", value: data?.payrollLiability ? data.payrollLiability.totalEmployerContributions.toLocaleString() : "—" }
      ],
      icon: "💰"
    },
    {
      title: "Statutory Compliance",
      href: "/analytics/compliance" as Route,
      badge: "Audit Ready",
      badgeTone: "success" as const,
      description: "Statutory Health Index (PF, ESI, PT, TDS), overdue returns tracker, monthly challan liabilities, and penalty risk gauges.",
      kpis: [
        { label: "Total Liability", value: data?.statutoryLiability ? data.statutoryLiability.totalLiability.toLocaleString() : "—" },
        { label: "PF Liability", value: data?.statutoryLiability ? data.statutoryLiability.totalPf.toLocaleString() : "—" },
        { label: "TDS Liability", value: data?.statutoryLiability ? data.statutoryLiability.totalTds.toLocaleString() : "—" }
      ],
      icon: "⚖️"
    },
    {
      title: "Face Biometrics & Spoof",
      href: "/analytics/face" as Route,
      badge: "AI Security",
      badgeTone: "danger" as const,
      description: "Liveness verification pass rates, anti-spoof attack telemetry, camera sensor quality, and sub-second matching latency metrics.",
      kpis: [
        { label: "Modality", value: "Face Liveness" },
        { label: "Telemetry", value: "Real-time" },
        { label: "Audit Trail", value: "Verified" }
      ],
      icon: "👁️"
    },
    {
      title: "Organization & Health",
      href: "/analytics/organization" as Route,
      badge: "Governance",
      badgeTone: "neutral" as const,
      description: "Business units, operating regions, team hierarchy depth, manager workload balance, and cross-functional distribution.",
      kpis: [
        { label: "Departments", value: data ? `${data.departmentDistribution.length} Active` : "—" },
        { label: "Workforce", value: data ? String(data.headcount.total) : "—" },
        { label: "Status", value: data ? "Healthy" : "—" }
      ],
      icon: "🏛️"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span>Enterprise Suite</span>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Analytics & Intelligence Hub</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
            Workforce Intelligence Platform
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time analytics engine across workforce, attendance, payroll, compliance, and biometrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={"/analytics/reports" as Route}
            className="rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-muted transition flex items-center gap-1.5"
          >
            <span>📑</span>
            <span>Reports & Muster</span>
          </Link>
          <Link
            href={"/analytics/executive" as Route}
            className="rounded-control bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>Executive CXO View</span>
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

      {/* Top KPI Command Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Headcount */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Workforce
            </span>
            <Badge tone="success">{data ? `${data.headcount.active} Active` : "—"}</Badge>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-zinc-950">
            {data ? data.headcount.total : "—"}
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
            <span className="font-medium text-zinc-700">{data ? data.headcount.probation : "—"}</span> Probation •{" "}
            <span className="font-medium text-zinc-700">{data ? data.headcount.notice : "—"}</span> Notice
          </div>
        </div>

        {/* Real-time Attendance */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Today Attendance
            </span>
            <Badge tone="neutral">{data ? `${data.attendanceToday.attendanceRate}% Rate` : "—"}</Badge>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-primary">
            {data ? data.attendanceToday.present : "—"}
            <span className="text-sm font-normal text-zinc-500 ml-1.5">Present</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
            <span className="text-red-600 font-medium">{data ? data.attendanceToday.absent : "—"}</span> Absent •{" "}
            <span className="text-amber-600 font-medium">{data ? data.attendanceToday.late : "—"}</span> Late Arrivals
          </div>
        </div>

        {/* Monthly Payroll Burn */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Monthly Payroll Run
            </span>
            <span className="text-[11px] font-mono text-zinc-400 font-medium">
              {data?.payrollLiability ? `${String(data.payrollLiability.latestMonth).padStart(2, "0")}/${data.payrollLiability.latestYear}` : "—"}
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-zinc-950">
            {data?.payrollLiability ? data.payrollLiability.totalGross.toLocaleString() : "—"}
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
            Net: <span className="font-semibold text-zinc-800">{data?.payrollLiability ? data.payrollLiability.totalNet.toLocaleString() : "—"}</span> • 
            Employer: <span className="font-semibold text-zinc-800">{data?.payrollLiability ? data.payrollLiability.totalEmployerContributions.toLocaleString() : "—"}</span>
          </div>
        </div>

        {/* Statutory Compliance Index */}
        <div className="rounded-panel border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Statutory Liability
            </span>
            <Badge tone="warning">PF + ESI + PT + TDS</Badge>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-amber-600">
            {data?.statutoryLiability ? data.statutoryLiability.totalLiability.toLocaleString() : "—"}
          </div>
          <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
            PF: <span className="font-semibold text-zinc-800">{data?.statutoryLiability ? data.statutoryLiability.totalPf.toLocaleString() : "—"}</span> • TDS: <span className="font-semibold text-zinc-800">{data?.statutoryLiability ? data.statutoryLiability.totalTds.toLocaleString() : "—"}</span>
          </div>
        </div>
      </div>

      {/* Domain Dashboards Grid (8 Dashboards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h2 className="text-base font-bold text-zinc-950">
              Domain Intelligence Dashboards
            </h2>
            <p className="text-xs text-zinc-500">
              Access deep specialized analytical telemetry across 8 core operational domains.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {domainDashboards.map((dash) => (
            <Link
              key={dash.href}
              href={dash.href}
              className="group flex flex-col justify-between rounded-panel border border-border bg-surface p-5 shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{dash.icon}</span>
                  <Badge tone={dash.badgeTone}>{dash.badge}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-primary transition">
                    {dash.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {dash.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-border/60 pt-3">
                <div className="grid grid-cols-3 gap-1 text-center">
                  {dash.kpis.map((kpi, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-[10px] text-zinc-400 uppercase font-medium truncate">
                        {kpi.label}
                      </p>
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {kpi.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-end text-xs font-medium text-primary group-hover:translate-x-0.5 transition">
                  Open Dashboard &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Report & Intelligence Shortcuts */}
      <div className="rounded-panel border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Quick Analytical Reports & Muster Shortcuts</h2>
            <p className="text-xs text-zinc-500">
              One-click access to statutory exports, workforce directories, and audit trails.
            </p>
          </div>
          <Link
            href={"/analytics/reports" as Route}
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All Reports &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href={"/analytics/reports" as Route}
            className="rounded-control border border-border p-3.5 hover:bg-muted transition text-left space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Employee Master Directory</span>
              <Badge tone="neutral">CSV / PDF</Badge>
            </div>
            <p className="text-[11px] text-zinc-500">
              Complete employee census with department, CTC, and role hierarchy.
            </p>
          </Link>

          <Link
            href={"/analytics/reports" as Route}
            className="rounded-control border border-border p-3.5 hover:bg-muted transition text-left space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Monthly Muster Roll</span>
              <Badge tone="neutral">Form II</Badge>
            </div>
            <p className="text-[11px] text-zinc-500">
              Statutory attendance ledger with worked hours and overtime minutes.
            </p>
          </Link>

          <Link
            href={"/analytics/reports" as Route}
            className="rounded-control border border-border p-3.5 hover:bg-muted transition text-left space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Statutory PF/ESI Summary</span>
              <Badge tone="warning">Challans</Badge>
            </div>
            <p className="text-[11px] text-zinc-500">
              EPF ECR monthly wage breakup and ESI contribution statements.
            </p>
          </Link>

          <Link
            href={"/admin/biometric-audit" as Route}
            className="rounded-control border border-border p-3.5 hover:bg-muted transition text-left space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Biometric & Spoof Logs</span>
              <Badge tone="danger">Live Audit</Badge>
            </div>
            <p className="text-[11px] text-zinc-500">
              Real-time telemetry of face match vectors and spoof challenges.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
