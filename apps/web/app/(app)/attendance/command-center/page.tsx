"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AttendanceCommandCenterPage() {
  const [telemetry] = useState({
    rostered: 240,
    present: 212,
    late: 12,
    onLeave: 15,
    absent: 13,
    remote: 28,
    field: 18,
    contractors: 42,
    livePresentPercentage: 88.3,
    punctualityRate: 94.3,
    deviceHealthScore: 92
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Operations Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛰️ Real-Time Attendance Command Center</h1>
          <p className="text-sm text-slate-600">
            Enterprise live workforce telemetry, plant muster roll presence, active shift rosters, and biometric terminal status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={"/attendance/devices" as Route}>
            <Button variant="secondary">📟 Device Master</Button>
          </Link>
          <Link href={"/attendance/anomalies" as Route}>
            <Button variant="secondary">⚠️ Anomalies</Button>
          </Link>
          <Link href={"/admin/attendance-intelligence" as Route}>
            <Button variant="primary">📊 Intelligence Cockpit</Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Present Workforce</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{telemetry.present} Employees</div>
          <div className="mt-1 text-xs text-slate-600">{telemetry.livePresentPercentage}% of {telemetry.rostered} scheduled</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contractor & Temp Staff</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{telemetry.contractors} Active</div>
          <div className="mt-1 text-xs text-slate-600">Across 3 warehouse & plant gates</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Punctuality Score</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{telemetry.punctualityRate}%</div>
          <div className="mt-1 text-xs text-slate-600">{telemetry.late} employees checked in after grace period</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Biometric Sync Health</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{telemetry.deviceHealthScore}% Online</div>
          <div className="mt-1 text-xs text-slate-600">11 of 12 terminals syncing in real-time</div>
        </Panel>
      </div>

      {/* Workforce Presence Breakdown */}
      <Panel className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Muster Roll & Workforce Deployment Spectrum</h2>
          <Badge tone="success">REAL-TIME TELEMETRY</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">On-Site Office & Plant</span>
            <div className="font-mono text-2xl font-bold text-slate-900">166 ICs</div>
            <p className="text-xs text-slate-500">Biometric & Face Kiosk Verified</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-1">
            <span className="text-xs font-semibold text-blue-700 uppercase">Remote WFH</span>
            <div className="font-mono text-2xl font-bold text-blue-800">{telemetry.remote} ICs</div>
            <p className="text-xs text-slate-600">IP & Web Check-in</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-1">
            <span className="text-xs font-semibold text-emerald-700 uppercase">Field Sales & Logistics</span>
            <div className="font-mono text-2xl font-bold text-emerald-800">{telemetry.field} ICs</div>
            <p className="text-xs text-slate-600">GPS Geofence Verified</p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 space-y-1">
            <span className="text-xs font-semibold text-rose-700 uppercase">Approved Leave</span>
            <div className="font-mono text-2xl font-bold text-rose-800">{telemetry.onLeave} ICs</div>
            <p className="text-xs text-slate-600">Integrated with Leave Engine</p>
          </div>
        </div>
      </Panel>

      {/* Operational Modules Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href={"/attendance/shifts" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">⏰</span>
            <h3 className="font-bold text-slate-900">Shift Templates & Grace Rules</h3>
            <p className="text-xs text-slate-500">General, Rotational, Split, and Night shift templates with half-day deductions.</p>
          </Panel>
        </Link>
        <Link href={"/attendance/rosters" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">📅</span>
            <h3 className="font-bold text-slate-900">Shift Rosters & Assignments</h3>
            <p className="text-xs text-slate-500">Daily, weekly, and monthly team rostering with bulk scheduling capabilities.</p>
          </Panel>
        </Link>
        <Link href={"/attendance/swaps" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">🔄</span>
            <h3 className="font-bold text-slate-900">Shift Swap Exchange</h3>
            <p className="text-xs text-slate-500">Employee-to-employee shift trade workflows with automated manager approvals.</p>
          </Panel>
        </Link>
        <Link href={"/attendance/devices" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">📟</span>
            <h3 className="font-bold text-slate-900">Biometric Terminal Fleet</h3>
            <p className="text-xs text-slate-500">Unified eSSL, ZKTeco, Matrix, and Suprema device sync engine and punch logs.</p>
          </Panel>
        </Link>
        <Link href={"/attendance/geofence" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">📍</span>
            <h3 className="font-bold text-slate-900">GPS Geofence Perimeters</h3>
            <p className="text-xs text-slate-500">Radius boundary controls, client site coords, and mock GPS location defense.</p>
          </Panel>
        </Link>
        <Link href={"/attendance/overtime" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">⏱️</span>
            <h3 className="font-bold text-slate-900">Overtime & Payroll Bridge</h3>
            <p className="text-xs text-slate-500">Daily, holiday, and night shift OT approval workflows with payroll integration.</p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
