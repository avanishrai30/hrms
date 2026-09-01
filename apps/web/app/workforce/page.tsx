"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function WorkforceOverviewPage() {
  const [stats] = useState({
    totalHeadcount: 240,
    approvedPositions: 268,
    openRequisitions: 28,
    vacancyRate: 10.4,
    criticalRolesCount: 14,
    successionCoverage: 78.5,
    annualAttritionRate: 11.2,
    totalAnnualBudget: "₹20.4 Cr"
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🌐 Strategic Workforce Planning & Org Intelligence</h1>
          <p className="text-sm text-slate-600">
            Enterprise position management, headcount budgeting, succession bench strength, AI attrition prediction, and org design.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={"/workforce/positions" as Route}>
            <Button variant="primary">+ Manage Positions</Button>
          </Link>
          <Link href={"/workforce/headcount" as Route}>
            <Button variant="secondary">📊 Headcount Plan</Button>
          </Link>
          <Link href={"/admin/chro-dashboard" as Route}>
            <Button variant="secondary">👔 CHRO Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Workforce</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.totalHeadcount} Employees</div>
          <div className="mt-1 text-xs text-slate-600">Across 8 departments & plants</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved Positions</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{stats.approvedPositions} Positions</div>
          <div className="mt-1 text-xs text-slate-600">{stats.openRequisitions} Open Requisitions ({stats.vacancyRate}% Vacancy)</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Succession Coverage</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{stats.successionCoverage}%</div>
          <div className="mt-1 text-xs text-slate-600">11 of {stats.criticalRolesCount} critical roles covered</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Annualized Attrition</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{stats.annualAttritionRate}%</div>
          <div className="mt-1 text-xs text-slate-600">Within optimal industry benchmark (&lt;12%)</div>
        </Panel>
      </div>

      {/* Strategic Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href={"/workforce/positions" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏛️</span>
              <Badge tone="success">MASTER</Badge>
            </div>
            <h3 className="font-bold text-slate-900">Position Architecture & Lifecycle</h3>
            <p className="text-xs text-slate-500">Track approved vs filled headcount, critical role tags, freeze/close states, and budget allocations.</p>
          </Panel>
        </Link>
        <Link href={"/workforce/headcount" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📈</span>
              <Badge tone="neutral">PLANNING</Badge>
            </div>
            <h3 className="font-bold text-slate-900">Headcount Planning & Scenarios</h3>
            <p className="text-xs text-slate-500">Annual and quarterly workforce demand forecasting with Best/Expected/Worst case simulation.</p>
          </Panel>
        </Link>
        <Link href={"/workforce/cost-planning" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">💰</span>
              <Badge tone="neutral">FINANCE</Badge>
            </div>
            <h3 className="font-bold text-slate-900">Workforce Cost Simulator</h3>
            <p className="text-xs text-slate-500">Model fully loaded salary, benefits, employer contributions, recruitment, and asset expenses.</p>
          </Panel>
        </Link>
        <Link href={"/workforce/org-chart" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🌲</span>
              <Badge tone="success">INTERACTIVE</Badge>
            </div>
            <h3 className="font-bold text-slate-900">Dynamic Org Chart & Span of Control</h3>
            <p className="text-xs text-slate-500">Visual corporate hierarchy, layer depth analysis, manager-to-IC ratios, and restructuring sandbox.</p>
          </Panel>
        </Link>
        <Link href={"/workforce/bench-strength" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🛡️</span>
              <Badge tone="warning">TALENT RISK</Badge>
            </div>
            <h3 className="font-bold text-slate-900">Succession Bench Strength (RAG)</h3>
            <p className="text-xs text-slate-500">Multi-tier readiness bands (Ready Now / 1 Year / 2 Years) and vacancy risk categorization.</p>
          </Panel>
        </Link>
        <Link href={"/workforce/attrition" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🔮</span>
              <Badge tone="danger">AI PREDICTIVE</Badge>
            </div>
            <h3 className="font-bold text-slate-900">Explainable AI Flight Risk</h3>
            <p className="text-xs text-slate-500">Transparent 0-100 retention scoring, primary flight drivers, and automated intervention playbooks.</p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
