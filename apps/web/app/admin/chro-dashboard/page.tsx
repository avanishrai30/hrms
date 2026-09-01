"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function ChroDashboardPage() {
  const [chroMetrics] = useState({
    criticalRoles: 14,
    successorsCovered: 11,
    benchHealth: "HEALTHY",
    highFlightRiskEmployees: 6,
    avgTimeToFillDays: 28,
    learningHoursPerEmployee: 24.5,
    internalMobilityRate: 21.2
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/workforce" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Workforce Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">👔 Chief Human Resources Officer (CHRO) Strategic Cockpit</h1>
          <p className="text-sm text-slate-600">
            Executive leadership visibility into talent bench strength, succession readiness, flight risk hot spots, and internal mobility.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/workforce-intelligence" as Route}>
            <Button variant="secondary">🌐 CEO Workforce Intelligence</Button>
          </Link>
          <Button variant="primary">📥 Export CHRO Board Pack</Button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bench Strength Health</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">HEALTHY (78.5%)</div>
          <div className="mt-1 text-xs text-slate-600">{chroMetrics.successorsCovered} of {chroMetrics.criticalRoles} roles covered</div>
        </Panel>
        <Panel className="border-l-4 border-l-rose-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Elevated Flight Risk Pool</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">{chroMetrics.highFlightRiskEmployees} Key People</div>
          <div className="mt-1 text-xs text-slate-600">Active retention playbooks assigned</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Time-to-Fill (ATS)</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{chroMetrics.avgTimeToFillDays} Days</div>
          <div className="mt-1 text-xs text-slate-600">-6 days vs prior quarter</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">LMS Learning Investment</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{chroMetrics.learningHoursPerEmployee} Hrs/IC</div>
          <div className="mt-1 text-xs text-slate-600">96.2% Compliance Certification</div>
        </Panel>
      </div>

      {/* Strategic Focus Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">🛡️ Critical Succession Gaps (Requires Immediate Sourcing)</h2>
            <Badge tone="danger">ACTION REQUIRED</Badge>
          </div>
          <div className="space-y-3 text-xs">
            <div className="rounded-lg bg-rose-50 p-3 border border-rose-200">
              <div className="font-bold text-slate-900">Chief Financial Officer (CFO)</div>
              <p className="text-slate-600 mt-1">Zero identified Ready-Now successors. Executive search engagement initiated with external partners.</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
              <div className="font-bold text-slate-900">Principal Distributed Systems Architect</div>
              <p className="text-slate-600 mt-1">1 Ready-Now candidate identified with moderate flight risk. Accelerated equity vesting proposed.</p>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">🚀 Internal Talent Mobility & Promotion Velocity</h2>
            <Badge tone="success">HEALTHY PIPELINE</Badge>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Internal Fill Rate for L5+ Leadership Roles:</span>
              <span className="font-mono font-bold text-slate-900">68.4%</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Average Promotion Cycle Duration:</span>
              <span className="font-mono font-bold text-slate-900">22.4 Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">High-Potential Talent Retention (Top 9-Box):</span>
              <span className="font-mono font-bold text-emerald-700">96.8%</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
