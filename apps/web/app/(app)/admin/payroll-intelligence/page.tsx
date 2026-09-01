"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function ExecutivePayrollIntelligencePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/admin" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Admin Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">👔 Executive Payroll & Compensation Cockpit</h1>
          <p className="text-sm text-slate-600">
            C-Suite executive dashboard for organizational compensation benchmarks, compa-ratio health, wage inflation trends, and workforce cost simulations.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/finance/payroll" as Route}>
            <Button variant="secondary">💰 Go to Payroll Hub</Button>
          </Link>
          <Button variant="primary">📥 Export Board Financial Deck</Button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono">
        <Panel className="p-4 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Annualized Payroll Run-Rate</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">₹9.78 Cr</div>
          <span className="text-xs font-sans text-emerald-600">+4.2% YoY Inflation</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Enterprise Compa-Ratio</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">98.4%</div>
          <span className="text-xs font-sans text-slate-500">Aligned with Market Median</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Total Employer Contributions</span>
          <div className="mt-1 text-2xl font-bold text-blue-700">₹1.17 Cr</div>
          <span className="text-xs font-sans text-blue-600">EPF, ESIC & Gratuity</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Variable Pay Effectiveness</span>
          <div className="mt-1 text-2xl font-bold text-purple-700">112.4%</div>
          <span className="text-xs font-sans text-purple-600">Target Achievement Multiplier</span>
        </Panel>
      </div>

      {/* Strategic Insights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Panel className="space-y-4 p-5">
          <h2 className="text-base font-bold text-slate-900">Compensation Health & Market Competitiveness</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Engineering & Technology</span>
              <Badge tone="success">P75 Market Percentile (Aggressive)</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Supply Chain & Operations</span>
              <Badge tone="neutral">P50 Market Percentile (Competitive)</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="font-medium text-slate-700">Quality & Agritech Labs</span>
              <Badge tone="success">P65 Market Percentile (Retentive)</Badge>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-4 p-5">
          <h2 className="text-base font-bold text-slate-900">Statutory Compliance Health Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/50 border border-emerald-200 p-3">
              <span className="font-medium text-emerald-900">EPFO & ESIC Returns</span>
              <Badge tone="success">100% On-Time Filed</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/50 border border-emerald-200 p-3">
              <span className="font-medium text-emerald-900">Quarterly Form 24Q TDS</span>
              <Badge tone="success">TRACES Reconciled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/50 border border-emerald-200 p-3">
              <span className="font-medium text-emerald-900">Gratuity Trust Fund Provision</span>
              <Badge tone="success">Fully Funded Actuarial</Badge>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
