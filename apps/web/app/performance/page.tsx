"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function PerformanceOverviewPage() {
  const [stats] = useState({
    activeGoalCycle: "Q3 2026 Enterprise OKRs",
    companyGoalProgress: 76.4,
    activeReviews: 124,
    calibratedPercent: 68,
    promotionReadyCount: 9,
    feedbackGivenCount: 142
  });

  const [activeCycle] = useState({
    name: "Q3 2026 Appraisal & OKR Cycle",
    daysRemaining: 18,
    stage: "SELF & MANAGER REVIEWS",
    completionPct: 72
  });

  const [topGoals] = useState([
    { id: "g-1", title: "Achieve 99.95% Core Uptime & Latency SLA", owner: "Engineering Team", progress: 85, status: "IN_PROGRESS", category: "OKR" },
    { id: "g-2", title: "Enterprise ARR Growth to ₹1.5 Cr", owner: "Sales Team", progress: 68, status: "IN_PROGRESS", category: "OKR" },
    { id: "g-3", title: "Automate 80% of Warehouse Invoicing Workflows", owner: "Operations Team", progress: 92, status: "COMPLETED", category: "KRA" }
  ]);

  const [recentReviews] = useState([
    { id: "rev-1", employee: "Aarav Sharma", role: "Senior Backend Engineer", dept: "Engineering", score: 4.4, status: "HR_CALIBRATION", rating: "EXCEEDS_EXPECTATIONS" },
    { id: "rev-2", employee: "Meera Nair", role: "Product Designer", dept: "Product", score: 4.8, status: "FINALIZED", rating: "OUTSTANDING" },
    { id: "rev-3", employee: "Karan Patel", role: "Operations Specialist", dept: "Operations", score: 3.6, status: "MANAGER_REVIEW", rating: "MEETS_EXPECTATIONS" }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Performance Management System (PMS)</h1>
          <p className="text-sm text-zinc-500">
            Enterprise OKRs, KRAs, Continuous 360 Feedback, Bell Curve Calibration, and Promotion Readiness.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={"/performance/feedback" as Route}>
            <Button variant="secondary">💬 Give Feedback</Button>
          </Link>
          <Link href={"/performance/goals" as Route}>
            <Button variant="primary">🎯 Manage OKRs</Button>
          </Link>
        </div>
      </div>

      {/* Cycle Banner */}
      <Panel className="border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-sky-50/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge tone="warning">ACTIVE CYCLE</Badge>
              <span className="text-xs font-semibold text-zinc-500">{activeCycle.daysRemaining} days left</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900">{activeCycle.name}</h2>
            <p className="text-sm text-zinc-600">Current Phase: <strong className="text-indigo-600">{activeCycle.stage}</strong></p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-medium">Cycle Completion</p>
              <p className="text-2xl font-black text-indigo-600">{activeCycle.completionPct}%</p>
            </div>
            <Link href={"/performance/reviews" as Route}>
              <Button variant="primary">Go to Review Hub →</Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${activeCycle.completionPct}%` }} />
        </div>
      </Panel>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Company Goal Progress</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-zinc-900">{stats.companyGoalProgress}%</p>
            <Badge tone="success">+4.2% MoM</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Across 68 strategic objectives</p>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Active Appraisals</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-zinc-900">{stats.activeReviews}</p>
            <Badge tone="neutral">{stats.calibratedPercent}% Calibrated</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400">360 multi-rater reviews underway</p>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Promotion Ready</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-emerald-600">{stats.promotionReadyCount}</p>
            <Badge tone="success">Ready Now</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Readiness score &gt;= 85 pts</p>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Peer Recognitions</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-zinc-900">{stats.feedbackGivenCount}</p>
            <Badge tone="warning">38 Badges</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Continuous feedback this quarter</p>
        </Panel>
      </div>

      {/* Main Grid: OKRs vs Reviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strategic OKRs */}
        <Panel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900">Key Strategic Objectives</h3>
              <p className="text-xs text-zinc-500">High-priority organizational OKRs & KRAs</p>
            </div>
            <Link href={"/performance/goals" as Route} className="text-xs font-semibold text-indigo-600 hover:underline">
              View All Goals →
            </Link>
          </div>

          <div className="space-y-4">
            {topGoals.map((goal) => (
              <div key={goal.id} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition hover:bg-zinc-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge tone={goal.category === "OKR" ? "warning" : "neutral"}>{goal.category}</Badge>
                    <h4 className="text-sm font-semibold text-zinc-900">{goal.title}</h4>
                  </div>
                  <span className="text-xs font-bold text-zinc-700">{goal.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>Owner: {goal.owner}</span>
                  <Badge tone={goal.status === "COMPLETED" ? "success" : "warning"}>{goal.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Recent Reviews & Calibration Status */}
        <Panel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900">Recent Appraisals & Calibration</h3>
              <p className="text-xs text-zinc-500">Continuous scoring & 360 multi-rater results</p>
            </div>
            <Link href={"/performance/appraisals" as Route} className="text-xs font-semibold text-indigo-600 hover:underline">
              View All Appraisals →
            </Link>
          </div>

          <div className="space-y-3">
            {recentReviews.map((rev) => (
              <div key={rev.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 hover:bg-zinc-50">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-zinc-900">{rev.employee}</p>
                  <p className="text-xs text-zinc-500">{rev.role} • {rev.dept}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">{rev.score} / 5.0</p>
                    <p className="text-[10px] text-zinc-400">{rev.rating.replace(/_/g, " ")}</p>
                  </div>
                  <Badge tone={rev.status === "FINALIZED" ? "success" : "warning"}>
                    {rev.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Fast Navigation Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={"/performance/1on1" as Route} className="block group">
          <Panel className="p-4 transition group-hover:border-indigo-200 group-hover:shadow-sm">
            <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600">🤝 1:1 Check-ins</h4>
            <p className="mt-1 text-xs text-zinc-500">Shared agendas, coaching notes, and action tracking.</p>
          </Panel>
        </Link>
        <Link href={"/performance/calibration" as Route} className="block group">
          <Panel className="p-4 transition group-hover:border-indigo-200 group-hover:shadow-sm">
            <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600">⚖️ Bell Curve Calibration</h4>
            <p className="mt-1 text-xs text-zinc-500">Enterprise quota distribution (5/15/60/15/5) validator.</p>
          </Panel>
        </Link>
        <Link href={"/performance/promotions" as Route} className="block group">
          <Panel className="p-4 transition group-hover:border-indigo-200 group-hover:shadow-sm">
            <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600">🚀 Promotion Readiness</h4>
            <p className="mt-1 text-xs text-zinc-500">Multi-factor point scoring & compensation bumps.</p>
          </Panel>
        </Link>
        <Link href={"/performance/succession" as Route} className="block group">
          <Panel className="p-4 transition group-hover:border-indigo-200 group-hover:shadow-sm">
            <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600">🗺️ 9-Box Succession</h4>
            <p className="mt-1 text-xs text-zinc-500">Performance vs. Potential grid & emergency successor pools.</p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
