"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function WorkforceAnalyticsPage() {
  const [departmentProductivity] = useState([
    { dept: "Warehouse & Operations", hc: 120, avgTenure: "3.4 Yrs", attrition: "9.2%", costPerHead: "₹6.8 L" },
    { dept: "Software Engineering", hc: 45, avgTenure: "2.8 Yrs", attrition: "12.5%", costPerHead: "₹18.4 L" },
    { dept: "Quality Assurance", hc: 28, avgTenure: "4.1 Yrs", attrition: "4.8%", costPerHead: "₹11.2 L" },
    { dept: "Sales & Client Ops", hc: 32, avgTenure: "2.2 Yrs", attrition: "15.0%", costPerHead: "₹9.8 L" },
    { dept: "HR & Finance", hc: 15, avgTenure: "3.8 Yrs", attrition: "6.7%", costPerHead: "₹10.5 L" }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📈 Strategic Workforce Analytics & Productivity</h1>
          <p className="text-sm text-slate-600">
            Workforce unit economics, tenure distribution, department turnover variance, and revenue per FTE metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">📥 Export Analytics Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue per Employee</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">₹32.0 Lakhs</div>
          <div className="mt-1 text-xs text-slate-600">+12.4% YoY productivity gain</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Workforce Tenure</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">3.2 Years</div>
          <div className="mt-1 text-xs text-slate-600">Healthy institutional retention</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workforce Cost Ratio</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">26.5%</div>
          <div className="mt-1 text-xs text-slate-600">Of total corporate top-line revenue</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Internal Promotion Rate</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">18.4%</div>
          <div className="mt-1 text-xs text-slate-600">44 promotions in last 12 months</div>
        </Panel>
      </div>

      {/* Department Breakdown */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Department Workforce Metrics & Unit Cost Profile</h2>
          <Badge tone="success">REAL-TIME TELEMETRY</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Active HC</th>
                <th className="py-3 px-4">Avg Tenure</th>
                <th className="py-3 px-4">Annualized Attrition</th>
                <th className="py-3 px-4">Fully Loaded Cost / Head</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentProductivity.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{d.dept}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{d.hc}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{d.avgTenure}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{d.attrition}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{d.costPerHead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
