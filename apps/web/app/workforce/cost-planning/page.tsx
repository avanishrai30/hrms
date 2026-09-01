"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button, Field, Input, Panel } from "../../../components/ui";

export default function WorkforceCostPlanningPage() {
  const [baseHeadcount, setBaseHeadcount] = useState(240);
  const [avgSalary, setAvgSalary] = useState(850000);
  const [headcountDelta, setHeadcountDelta] = useState(20);
  const [benefitsRatio] = useState(0.20);
  const [contributionsRatio] = useState(0.12);

  // Pure calculations
  const projectedHeadcount = Math.max(0, baseHeadcount + headcountDelta);
  const projectedSalaryCost = projectedHeadcount * avgSalary;
  const projectedBenefitsCost = projectedSalaryCost * benefitsRatio;
  const projectedContributionsCost = projectedSalaryCost * contributionsRatio;
  const oneTimeOnboarding = Math.max(0, headcountDelta) * (25000 + 50000 + 75000);
  const totalCost = projectedSalaryCost + projectedBenefitsCost + projectedContributionsCost + oneTimeOnboarding;

  const currentBaseCost = baseHeadcount * avgSalary * (1 + benefitsRatio + contributionsRatio);
  const costDelta = totalCost - currentBaseCost;
  const percentDelta = Math.round((costDelta / currentBaseCost) * 1000) / 10;

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">💰 Workforce Cost Planning & Simulation</h1>
          <p className="text-sm text-slate-600">
            Calculate fully loaded workforce expenses including base salary, statutory benefits, employer PF/ESI, recruitment, and IT equipment.
          </p>
        </div>
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Parameters */}
        <Panel className="space-y-4 p-5">
          <h2 className="text-base font-bold text-slate-900">Simulation Variables</h2>
          <Field label="Current Base Headcount">
            <Input
              type="number"
              value={baseHeadcount}
              onChange={(e) => setBaseHeadcount(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <Field label="Avg Annual Base Salary / Head (INR)">
            <Input
              type="number"
              value={avgSalary}
              onChange={(e) => setAvgSalary(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="Net Headcount Addition (+/-)">
            <Input
              type="number"
              value={headcountDelta}
              onChange={(e) => setHeadcountDelta(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1 font-medium">
            <div>• Statutory Benefits Factor: <span className="font-bold text-slate-900">20%</span></div>
            <div>• Employer Taxes & Contributions: <span className="font-bold text-slate-900">12%</span></div>
            <div>• Onboarding & Asset Pack / Hire: <span className="font-bold text-slate-900">₹1,50,000</span></div>
          </div>
          <Button variant="primary" className="w-full">
            🔄 Recalculate Simulation
          </Button>
        </Panel>

        {/* Breakdown Output */}
        <Panel className="lg:col-span-2 space-y-5 p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Annual Workforce Run-rate</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                ₹{(totalCost / 10000000).toFixed(2)} Crores
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Impact</span>
              <div className={`text-xl font-bold mt-1 ${costDelta >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {costDelta >= 0 ? "+" : ""}₹{(costDelta / 100000).toFixed(1)} Lakhs ({percentDelta}%)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Base Salary Outlay:</span>
              <div className="font-mono text-base font-bold text-slate-900">₹{(projectedSalaryCost / 100000).toFixed(1)} Lakhs</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Benefits & Insurance (20%):</span>
              <div className="font-mono text-base font-bold text-slate-900">₹{(projectedBenefitsCost / 100000).toFixed(1)} Lakhs</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Employer Contributions (12%):</span>
              <div className="font-mono text-base font-bold text-slate-900">₹{(projectedContributionsCost / 100000).toFixed(1)} Lakhs</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">One-Time Onboarding & Assets:</span>
              <div className="font-mono text-base font-bold text-slate-900">₹{(oneTimeOnboarding / 100000).toFixed(1)} Lakhs</div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Target Headcount: <strong className="text-slate-900">{projectedHeadcount} Active Personnel</strong></span>
            <span>Fully Loaded Cost / Head: <strong className="text-primary">₹{Math.round(totalCost / projectedHeadcount).toLocaleString("en-IN")}/yr</strong></span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
