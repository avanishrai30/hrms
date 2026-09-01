"use client";

import { useState } from "react";
import { Badge, Button, Panel } from "../../../components/ui";

export default function PerformanceAnalyticsPage() {
  const [analytics] = useState({
    kpis: {
      avgGoalAchievement: 78.4,
      activeReviews: 124,
      highPerformersPercent: 22.5,
      lowPerformersPercent: 6.0,
      promotionReadyCount: 9,
      calibratedCount: 88
    },
    departmentComparison: [
      { name: "Engineering", score: 4.35, goalPct: 86.2, completionRate: 94 },
      { name: "Product & Design", score: 4.40, goalPct: 82.0, completionRate: 90 },
      { name: "Operations", score: 3.85, goalPct: 74.5, completionRate: 88 },
      { name: "Sales & Marketing", score: 4.10, goalPct: 79.0, completionRate: 92 }
    ],
    competencies: [
      { name: "System Architecture", avgScore: 4.3, gap: 0.7 },
      { name: "Delivery Speed", avgScore: 4.1, gap: 0.9 },
      { name: "Collaboration & Empathy", avgScore: 4.0, gap: 1.0 },
      { name: "Ownership & Leadership", avgScore: 3.7, gap: 1.3 }
    ]
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">📈 PMS Executive Analytics & Insights</h1>
          <p className="text-sm text-zinc-500">
            Workforce goal velocity, department performance benchmarks, and competency heatmaps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">📥 Export PDF Summary</Button>
          <Button variant="primary">Generate AI Executive Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Average Goal Achievement</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-indigo-600">{analytics.kpis.avgGoalAchievement}%</p>
            <Badge tone="success">+3.5% vs Q2</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Across 182 active company OKRs</p>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Top Tier Performers</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-emerald-600">{analytics.kpis.highPerformersPercent}%</p>
            <Badge tone="success">Outstanding & Exceeds</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">28 high potential employees</p>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Calibrated Appraisals</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-zinc-900">{analytics.kpis.calibratedCount} / {analytics.kpis.activeReviews}</p>
            <Badge tone="neutral">71% Done</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">36 reviews in calibration stage</p>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Promotion Ready Bench</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-black text-purple-600">{analytics.kpis.promotionReadyCount}</p>
            <Badge tone="success">Ready Now</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Readiness score &gt;= 85 pts</p>
        </Panel>
      </div>

      {/* Main Charts & Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Performance Benchmarks */}
        <Panel className="p-6">
          <h3 className="font-semibold text-zinc-900">Department Performance & OKR Velocity</h3>
          <p className="text-xs text-zinc-500">Average appraisal score & goal achievement by business unit</p>

          <div className="mt-4 space-y-4">
            {analytics.departmentComparison.map((dept) => (
              <div key={dept.name} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-zinc-900">{dept.name}</h4>
                  <span className="text-xs font-bold text-indigo-600">Score: {dept.score} / 5</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>Goal Achievement: {dept.goalPct}%</span>
                  <span>Completion: {dept.completionRate}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${dept.goalPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Competency Gap Heatmap */}
        <Panel className="p-6">
          <h3 className="font-semibold text-zinc-900">Competency Mastery & Gap Analysis</h3>
          <p className="text-xs text-zinc-500">Organization-wide proficiency evaluated against 5.0 mastery benchmark</p>

          <div className="mt-4 space-y-4">
            {analytics.competencies.map((comp) => (
              <div key={comp.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-800">{comp.name}</span>
                  <span className="text-zinc-500">{comp.avgScore} / 5.0 (Gap: -{comp.gap})</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(comp.avgScore / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
