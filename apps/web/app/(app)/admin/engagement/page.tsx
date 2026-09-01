"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AdminEngagementDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏢 HR Engagement & Culture Command Center</h1>
          <p className="text-sm text-slate-600">
            Monitor organizational morale, launch company-wide surveys, audit recognition budgets, and manage communities.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/surveys" as Route}>
            <Button variant="primary">+ Launch Survey</Button>
          </Link>
          <Link href={"/admin/enps" as Route}>
            <Button variant="secondary">Run eNPS Campaign</Button>
          </Link>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono">
        <Panel className="p-4 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Culture Health Index</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">84.5 / 100</div>
          <span className="text-xs font-sans text-emerald-600 font-medium">Grade A (Healthy)</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Current eNPS</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">+42.5</div>
          <span className="text-xs font-sans text-slate-500">62% Promoters</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Monthly Recognitions</span>
          <div className="mt-1 text-2xl font-bold text-blue-700">342 Kudos</div>
          <span className="text-xs font-sans text-blue-600">1.8 per employee</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Burnout Watchlist</span>
          <div className="mt-1 text-2xl font-bold text-amber-700">7 Staff</div>
          <span className="text-xs font-sans text-slate-500">Early intervention alerts</span>
        </Panel>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={"/admin/surveys" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📝</span>
              <Badge tone="success">SURVEY ENGINE</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Survey & Pulse Management</h3>
            <p className="mt-1 text-xs text-slate-600">
              Create multi-category engagement surveys, configure branch logic, and schedule weekly pulses.
            </p>
          </Panel>
        </Link>

        <Link href={"/admin/recognition" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏆</span>
              <Badge tone="neutral">RECOGNITION AUDIT</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Recognition & Rewards Admin</h3>
            <p className="mt-1 text-xs text-slate-600">
              Configure values badges, audit point distribution ledgers, and manage catalog item redemptions.
            </p>
          </Panel>
        </Link>

        <Link href={"/admin/culture-intelligence" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🧠</span>
              <Badge tone="warning">EXECUTIVE AI</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Culture Intelligence Cockpit</h3>
            <p className="mt-1 text-xs text-slate-600">
              Executive view of burnout risks, team sentiment heatmaps, and retention signal predictions.
            </p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
