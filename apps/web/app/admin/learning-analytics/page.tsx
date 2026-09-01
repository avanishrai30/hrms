"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function LearningAnalyticsAdminPage() {
  const [departmentAdoption] = useState([
    { dept: "Factory & Warehouse Operations", learners: 120, avgHours: 14.2, completionRate: 96.4 },
    { dept: "Software Engineering & DevOps", learners: 45, avgHours: 22.8, completionRate: 88.0 },
    { dept: "Quality Assurance & Regulatory", learners: 28, avgHours: 18.5, completionRate: 98.2 },
    { dept: "Sales & Client Operations", learners: 32, avgHours: 9.4, completionRate: 82.5 },
    { dept: "Finance & Human Resources", learners: 15, avgHours: 11.0, completionRate: 91.0 }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/training" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Training Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📈 Executive LMS Telemetry & Training ROI</h1>
          <p className="text-sm text-slate-600">
            Workforce learning adoption, training hours logged, department compliance heatmaps, and certification throughput.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">📥 Export PDF Summary</Button>
          <Button variant="primary">📊 Export Excel Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workforce Adoption Rate</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">92.4%</div>
          <div className="mt-1 text-xs text-slate-600">222 of 240 active learners</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Learning Hours</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">3,420 Hours</div>
          <div className="mt-1 text-xs text-slate-600">+14.2% YoY growth</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assessment Pass Rate</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">94.8%</div>
          <div className="mt-1 text-xs text-slate-600">On first or second attempt</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Certifications Active</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">184 Verified</div>
          <div className="mt-1 text-xs text-slate-600">96.2% Compliance Coverage</div>
        </Panel>
      </div>

      {/* Department Breakdown */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Department Learning Velocity & Completion Rates</h2>
          <Badge tone="success">REAL-TIME TELEMETRY</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Active Learners</th>
                <th className="py-3 px-4">Avg Learning Hours / IC</th>
                <th className="py-3 px-4">Course Completion %</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentAdoption.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{d.dept}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{d.learners}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{d.avgHours} Hrs</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${d.completionRate}%` }}></div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900">{d.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge tone={d.completionRate >= 90 ? "success" : "warning"}>
                      {d.completionRate >= 90 ? "OPTIMAL" : "MONITOR"}
                    </Badge>
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
