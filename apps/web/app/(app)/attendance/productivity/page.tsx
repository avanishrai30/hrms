"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AttendanceProductivityPage() {
  const [productivity] = useState([
    {
      team: "Warehouse Shift Operations (Team Alpha)",
      rostered: 65,
      attendanceRate: "96.4%",
      punctualityScore: "95.2%",
      avgHoursDay: "8.4 hrs",
      overtimeHours: "45.0 hrs",
      rating: "EXCELLENT"
    },
    {
      team: "Cold-Chain Logistics (Team Beta)",
      rostered: 35,
      attendanceRate: "92.0%",
      punctualityScore: "88.5%",
      avgHoursDay: "8.1 hrs",
      overtimeHours: "28.0 hrs",
      rating: "GOOD"
    },
    {
      team: "Core Platform Engineering",
      rostered: 45,
      attendanceRate: "98.2%",
      punctualityScore: "97.4%",
      avgHoursDay: "8.3 hrs",
      overtimeHours: "12.0 hrs",
      rating: "EXCELLENT"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/attendance/command-center" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Attendance Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📊 Workforce Attendance & Productivity Analytics</h1>
          <p className="text-sm text-slate-600">
            Measure employee and team punctuality scores, effective working hours, overtime utilization, and absenteeism trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">📥 Export Productivity Pack</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workforce Attendance Rate</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">95.8%</div>
          <div className="mt-1 text-xs text-slate-600">Top quartile manufacturing benchmark</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Company Punctuality Index</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">94.3%</div>
          <div className="mt-1 text-xs text-slate-600">Punches logged within grace period</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Effective Hours / Day</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">8.25 Hours</div>
          <div className="mt-1 text-xs text-slate-600">Across full-time personnel</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly OT Utilization</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">184 Total Hours</div>
          <div className="mt-1 text-xs text-slate-600">1.8% of total workforce hours</div>
        </Panel>
      </div>

      {/* Team Productivity Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Department & Team Productivity Scores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Team / Shift Unit</th>
                <th className="py-3 px-4">Rostered Count</th>
                <th className="py-3 px-4">Attendance %</th>
                <th className="py-3 px-4">Punctuality Score</th>
                <th className="py-3 px-4">Avg Hours/Day</th>
                <th className="py-3 px-4">Overtime Hours</th>
                <th className="py-3 px-4">Productivity Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productivity.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{p.team}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.rostered}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{p.attendanceRate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{p.punctualityScore}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{p.avgHoursDay}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.overtimeHours}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={p.rating === "EXCELLENT" ? "success" : "neutral"}>
                      {p.rating}
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
