"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function HeadcountPlanningPage() {
  const [plans] = useState([
    {
      id: "pln-1",
      name: "FY 2026-27 Annual Corporate Headcount Master Plan",
      fiscalYear: 2026,
      periodType: "ANNUAL",
      department: "All Enterprise Departments",
      currentHC: 240,
      approvedHC: 280,
      forecastHC: 275,
      vacancyHC: 40,
      budgetHC: 280,
      status: "APPROVED"
    },
    {
      id: "pln-2",
      name: "Q3 Factory & Plant Expansion Demand Plan",
      fiscalYear: 2026,
      periodType: "QUARTERLY",
      department: "Warehouse & Processing Plants",
      currentHC: 120,
      approvedHC: 145,
      forecastHC: 140,
      vacancyHC: 25,
      budgetHC: 145,
      status: "ACTIVE"
    }
  ]);

  const [scenarios] = useState([
    {
      name: "Aggressive Sales & Retail Expansion",
      growthCase: "BEST_CASE",
      deltaHC: "+35 Hires",
      budgetDelta: "+₹1.8 Cr",
      scenarioCost: "₹22.2 Cr",
      impact: "Accelerates tier-2 city distribution hubs by 4 months"
    },
    {
      name: "Baseline Organic Expansion",
      growthCase: "EXPECTED_CASE",
      deltaHC: "+20 Hires",
      budgetDelta: "+₹95 L",
      scenarioCost: "₹21.35 Cr",
      impact: "Standard hiring aligned with revenue growth forecasts"
    },
    {
      name: "Hiring Freeze & Essential Replacements Only",
      growthCase: "WORST_CASE",
      deltaHC: "+5 Hires",
      budgetDelta: "+₹25 L",
      scenarioCost: "₹20.65 Cr",
      impact: "Protects cash flow; backfills critical roles only"
    }
  ]);

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📊 Headcount Planning & Growth Scenarios</h1>
          <p className="text-sm text-slate-600">
            Model annual and quarterly workforce demand, vacancy gaps, and Best/Expected/Worst case scenarios.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/workforce/cost-planning" as Route}>
            <Button variant="primary">💰 Cost Simulator</Button>
          </Link>
        </div>
      </div>

      {/* Headcount Plans Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Approved Headcount Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Plan Name & Scope</th>
                <th className="py-3 px-4">Fiscal Year</th>
                <th className="py-3 px-4">Current HC</th>
                <th className="py-3 px-4">Approved HC</th>
                <th className="py-3 px-4">Forecast Target</th>
                <th className="py-3 px-4">Open Vacancies</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.department}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">FY {p.fiscalYear}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.currentHC}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{p.approvedHC}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{p.forecastHC}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-600">+{p.vacancyHC} Vacancies</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Headcount Scenarios */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Workforce Demand Scenario Triad (Best / Expected / Worst)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {scenarios.map((sc, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge tone={sc.growthCase === "BEST_CASE" ? "success" : sc.growthCase === "EXPECTED_CASE" ? "neutral" : "warning"}>
                  {sc.growthCase.replace(/_/g, " ")}
                </Badge>
                <span className="font-mono text-xs font-bold text-primary">{sc.deltaHC}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{sc.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{sc.impact}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Budget Impact:</span>
                <span className="font-mono font-bold text-slate-900">{sc.budgetDelta}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Projected Run-rate:</span>
                <span className="font-mono font-bold text-emerald-700">{sc.scenarioCost}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
