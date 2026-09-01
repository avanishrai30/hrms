"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../../components/ui";

export default function FinancePayrollAnalyticsPage() {
  const [departments] = useState([
    {
      name: "Warehouse Operations & Fulfillment",
      headcount: 50,
      grossCost: "₹22,50,000",
      overtime: "₹1,20,000 (5.3%)",
      incentives: "₹85,000",
      avgCtc: "₹45,000"
    },
    {
      name: "Software Engineering & Product",
      headcount: 40,
      grossCost: "₹48,00,000",
      overtime: "₹45,000 (0.9%)",
      incentives: "₹2,00,000",
      avgCtc: "₹1,20,000"
    },
    {
      name: "Quality Assurance & Agritech Labs",
      headcount: 20,
      grossCost: "₹11,00,000",
      overtime: "₹60,000 (5.5%)",
      incentives: "₹40,000",
      avgCtc: "₹55,000"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/finance/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Payroll Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📈 Payroll Cost & Compensation Intelligence</h1>
          <p className="text-sm text-slate-600">
            Strategic breakdown of organizational payroll expenditures, overtime run-rates, variable pay ratios, and workforce wage benchmarking.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/payroll-intelligence" as Route}>
            <Button variant="primary">📊 Open Executive Intelligence Cockpit</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono">
        <Panel className="p-4 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Total Headcount</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">110 Staff</div>
          <span className="text-xs font-sans text-emerald-600">3 Business Units</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Monthly Payroll Spend</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">₹81,50,000</div>
          <span className="text-xs font-sans text-slate-500">Avg ₹74,090 / employee</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Total Overtime Spend</span>
          <div className="mt-1 text-2xl font-bold text-purple-700">₹2,25,000</div>
          <span className="text-xs font-sans text-purple-600">2.8% of Total Payroll</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Performance Incentives</span>
          <div className="mt-1 text-2xl font-bold text-amber-700">₹3,25,000</div>
          <span className="text-xs font-sans text-amber-600">4.0% of Total Payroll</span>
        </Panel>
      </div>

      {/* Departmental Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Departmental Payroll Cost Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Monthly Gross Wages</th>
                <th className="py-3 px-4">Overtime Payout</th>
                <th className="py-3 px-4">Incentives Payout</th>
                <th className="py-3 px-4">Average CTC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {departments.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{d.name}</td>
                  <td className="py-3.5 px-4 text-slate-700">{d.headcount}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{d.grossCost}</td>
                  <td className="py-3.5 px-4 text-purple-700">{d.overtime}</td>
                  <td className="py-3.5 px-4 text-amber-700">{d.incentives}</td>
                  <td className="py-3.5 px-4 font-bold text-primary">{d.avgCtc}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View Trends</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
