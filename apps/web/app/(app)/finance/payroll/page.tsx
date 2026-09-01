"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinancePayrollOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/finance" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Finance Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">💰 Enterprise Payroll & Compensation Command Center</h1>
          <p className="text-sm text-slate-600">
            End-to-end payroll processing, statutory compliance, tax engines, compensation structures, and executive cost analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/finance/payroll-runs" as Route}>
            <Button variant="primary">▶ Process Payroll Run</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono">
        <Panel className="p-4 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Monthly Gross Payroll</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">₹81,50,000</div>
          <span className="text-xs font-sans text-emerald-600 font-medium">110 Active Employees</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Total Net Disbursement</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">₹69,27,500</div>
          <span className="text-xs font-sans text-slate-500">Auto-Disbursement Active</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Statutory Dues (PF/ESI/TDS)</span>
          <div className="mt-1 text-2xl font-bold text-blue-700">₹12,22,500</div>
          <span className="text-xs font-sans text-blue-600">Compliant for August</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Overtime & Incentives</span>
          <div className="mt-1 text-2xl font-bold text-purple-700">₹5,25,000</div>
          <span className="text-xs font-sans text-slate-500">6.4% of Gross Payroll</span>
        </Panel>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={"/finance/payroll-runs" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚙️</span>
              <Badge tone="success">ACTIVE</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Payroll Runs & Engine</h3>
            <p className="mt-1 text-xs text-slate-600">
              Run monthly payroll batches, compute LOP proration, apply adjustments, and distribute payslips.
            </p>
          </Panel>
        </Link>

        <Link href={"/finance/tax-center" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚖️</span>
              <Badge tone="neutral">ITR 2026-27</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Tax & TDS Center</h3>
            <p className="mt-1 text-xs text-slate-600">
              Old vs New tax regimes, Chapter VI-A verification, quarterly 24Q filing reports, and Form 16 generation.
            </p>
          </Panel>
        </Link>

        <Link href={"/finance/statutory" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏛️</span>
              <Badge tone="success">EPFO & ESIC</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Statutory Compliance</h3>
            <p className="mt-1 text-xs text-slate-600">
              Generate EPFO ECR text challans, ESIC monthly return files, Professional Tax (PT), and LWF reports.
            </p>
          </Panel>
        </Link>

        <Link href={"/finance/salary-structures" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📊</span>
              <Badge tone="neutral">GRADES & BANDS</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Salary Bands & Structures</h3>
            <p className="mt-1 text-xs text-slate-600">
              Define compensation templates, salary bands (min/mid/max), and market compensation benchmarks.
            </p>
          </Panel>
        </Link>

        <Link href={"/finance/fnf" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🚪</span>
              <Badge tone="warning">SETTLEMENTS</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Full & Final (FnF) Engine</h3>
            <p className="mt-1 text-xs text-slate-600">
              Process exit settlements, notice pay recovery, leave encashment, gratuity dues, and loan clearances.
            </p>
          </Panel>
        </Link>

        <Link href={"/finance/payroll-analytics" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📈</span>
              <Badge tone="success">ANALYTICS</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Payroll Cost Intelligence</h3>
            <p className="mt-1 text-xs text-slate-600">
              Departmental wage trends, overtime cost ratios, compa-ratio distribution, and workforce cost forecasts.
            </p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
