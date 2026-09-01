"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function WorkforceIntelligencePage() {
  const [ceoStats] = useState({
    totalHeadcount: 240,
    annualWorkforceCost: "₹20.4 Cr",
    annualRevenue: "₹76.8 Cr",
    revenuePerEmployee: "₹32.0 Lakhs",
    productivityIndex: 32.0,
    costRatio: "26.5%",
    vacancyRate: "10.4%",
    talentRiskScore: 28.4
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🌐 Executive CEO Workforce Intelligence</h1>
          <p className="text-sm text-slate-600">
            C-Suite workforce unit economics, talent productivity indicators, corporate wage bill ratios, and organization scale capacity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/chro-dashboard" as Route}>
            <Button variant="secondary">👔 CHRO Dashboard</Button>
          </Link>
          <Button variant="primary">📊 Board Deck Export</Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue per Employee</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{ceoStats.revenuePerEmployee}</div>
          <div className="mt-1 text-xs text-slate-600">Top quartile organic FMCG benchmark</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workforce Cost Ratio</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{ceoStats.costRatio}</div>
          <div className="mt-1 text-xs text-slate-600">{ceoStats.annualWorkforceCost} on {ceoStats.annualRevenue} revenue</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Talent Health Score</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">71.6 / 100</div>
          <div className="mt-1 text-xs text-slate-600">Talent Risk Index at {ceoStats.talentRiskScore}% (Low)</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Corporate Vacancy Rate</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{ceoStats.vacancyRate}</div>
          <div className="mt-1 text-xs text-slate-600">28 active positions across business units</div>
        </Panel>
      </div>

      {/* Strategic Summary */}
      <Panel className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Workforce Scalability & Financial Health Summary</h2>
          <Badge tone="success">OPTIMAL EXPANSION PROFILE</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Headcount Capacity</span>
            <div className="font-mono text-2xl font-bold text-slate-900">325 Max Cap</div>
            <p className="text-xs text-slate-500">Current facilities support up to 325 personnel without plant expansion.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Wage Bill Margin Safety</span>
            <div className="font-mono text-2xl font-bold text-emerald-700">14.2% Headroom</div>
            <p className="text-xs text-slate-500">Operating cash flows comfortably cover planned FY27 expansion hires.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Executive Succession Resilience</span>
            <div className="font-mono text-2xl font-bold text-primary">78.5% Ready</div>
            <p className="text-xs text-slate-500">11 of 14 key leadership positions have identified ready-now pipelines.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
