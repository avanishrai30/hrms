"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AttendanceIntelligencePage() {
  const [intel] = useState({
    totalWorkforce: 240,
    activeMusterRoll: 212,
    punctualityRate: 94.3,
    avgShiftFillRate: 98.5,
    unplannedAbsenteeism: 5.4,
    monthlyOvertimeCost: "₹2.45 Lakhs"
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/attendance/command-center" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Attendance Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📊 Executive Attendance & Labor Intelligence Cockpit</h1>
          <p className="text-sm text-slate-600">
            Strategic operations intelligence, shift labor fill rates, absenteeism hot spots, and overtime wage cost drivers.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/device-monitoring" as Route}>
            <Button variant="secondary">📟 Device Monitor</Button>
          </Link>
          <Link href={"/admin/workforce-operations" as Route}>
            <Button variant="primary">⚙️ Operations Hub</Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Muster Roll Active</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{intel.activeMusterRoll} / {intel.totalWorkforce}</div>
          <div className="mt-1 text-xs text-slate-600">88.3% Active Today</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shift Fill Rate</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{intel.avgShiftFillRate}%</div>
          <div className="mt-1 text-xs text-slate-600">Optimal plant line staffing</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unplanned Absenteeism</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{intel.unplannedAbsenteeism}%</div>
          <div className="mt-1 text-xs text-slate-600">Within manufacturing tolerance (&lt;6%)</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly OT Wage Bill</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{intel.monthlyOvertimeCost}</div>
          <div className="mt-1 text-xs text-slate-600">184 approved OT hours</div>
        </Panel>
      </div>

      {/* Strategic Summary */}
      <Panel className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Workforce Operations & Compliance Overview</h2>
          <Badge tone="success">HEALTHY OPERATIONS</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Muster Roll Integrity</span>
            <div className="font-mono text-2xl font-bold text-slate-900">99.8% Logged</div>
            <p className="text-xs text-slate-500">Zero unverified punches recorded across shifts.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Biometric Fleet Uptime</span>
            <div className="font-mono text-2xl font-bold text-emerald-700">99.2% Uptime</div>
            <p className="text-xs text-slate-500">11 of 12 hardware terminals operational.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Contractor Wage Control</span>
            <div className="font-mono text-2xl font-bold text-primary">₹1.85 L (MTD)</div>
            <p className="text-xs text-slate-500">42 gate-verified contract workers.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
