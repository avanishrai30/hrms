"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Panel } from "../../../components/ui";

export default function WorkforceForecastingPage() {
  const [activeHorizon, setActiveHorizon] = useState<6 | 12 | 24>(12);

  const forecastData = {
    6: {
      startingHC: 240,
      attritionReplacements: 14,
      expansionHires: 18,
      totalHiringDemand: 32,
      endingHC: 258,
      netGrowthPercent: 7.5,
      workforceCost: "₹10.8 Cr",
      monthlyRecruitmentPace: "5.3 Hires/Mo"
    },
    12: {
      startingHC: 240,
      attritionReplacements: 28,
      expansionHires: 36,
      totalHiringDemand: 64,
      endingHC: 276,
      netGrowthPercent: 15.0,
      workforceCost: "₹22.5 Cr",
      monthlyRecruitmentPace: "5.3 Hires/Mo"
    },
    24: {
      startingHC: 240,
      attritionReplacements: 58,
      expansionHires: 85,
      totalHiringDemand: 143,
      endingHC: 325,
      netGrowthPercent: 35.4,
      workforceCost: "₹52.0 Cr",
      monthlyRecruitmentPace: "6.0 Hires/Mo"
    }
  };

  const current = forecastData[activeHorizon];

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📈 Multi-Horizon Workforce Forecasting Engine</h1>
          <p className="text-sm text-slate-600">
            Simulate 6-month, 12-month, and 24-month hiring velocity, organic attrition backfill demand, and payroll run-rates.
          </p>
        </div>
        <div className="flex gap-2 border border-slate-200 rounded-lg p-1 bg-surface">
          {([6, 12, 24] as const).map((h) => (
            <button
              key={h}
              onClick={() => setActiveHorizon(h)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                activeHorizon === h ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {h} Months
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Projected Ending Headcount</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{current.endingHC} Employees</div>
          <div className="mt-1 text-xs text-slate-600">+{current.netGrowthPercent}% Net Workforce Expansion</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Hiring Requisitions</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{current.totalHiringDemand} Hires</div>
          <div className="mt-1 text-xs text-slate-600">{current.monthlyRecruitmentPace} required pace</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Projected Attrition Backfills</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{current.attritionReplacements} Backfills</div>
          <div className="mt-1 text-xs text-slate-600">Based on 11.5% baseline attrition</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimated Workforce Outlay</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{current.workforceCost}</div>
          <div className="mt-1 text-xs text-slate-600">Fully loaded run-rate</div>
        </Panel>
      </div>

      {/* Trajectory Breakdown */}
      <Panel className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Workforce Pipeline Composition ({activeHorizon}-Month Horizon)</h2>
          <Badge tone="success">PREDICTIVE SIMULATION</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Starting Active Base</span>
            <div className="font-mono text-2xl font-bold text-slate-900">{current.startingHC} ICs</div>
            <p className="text-xs text-slate-500">Current baseline at start of simulation period</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-1">
            <span className="text-xs font-semibold text-blue-700 uppercase">Net Expansion Additions</span>
            <div className="font-mono text-2xl font-bold text-blue-800">+{current.expansionHires} Net Roles</div>
            <p className="text-xs text-slate-600">New headcount created from approved business growth</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-1">
            <span className="text-xs font-semibold text-emerald-700 uppercase">Ending Headcount Target</span>
            <div className="font-mono text-2xl font-bold text-emerald-800">{current.endingHC} ICs</div>
            <p className="text-xs text-slate-600">Target workforce size at month {activeHorizon}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
