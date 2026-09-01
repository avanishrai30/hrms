"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function RostersPage() {
  const [selectedDept, setSelectedDept] = useState("Warehouse");

  const [rosterData] = useState([
    {
      employee: "Rajesh Kumar (EMP-001)",
      dept: "Warehouse",
      mon: "PLANT-A (06-14)",
      tue: "PLANT-A (06-14)",
      wed: "PLANT-A (06-14)",
      thu: "PLANT-A (06-14)",
      fri: "PLANT-A (06-14)",
      sat: "WEEKLY_OFF",
      sun: "WEEKLY_OFF"
    },
    {
      employee: "Sunil Patil (EMP-014)",
      dept: "Warehouse",
      mon: "PLANT-B (14-22)",
      tue: "PLANT-B (14-22)",
      wed: "PLANT-B (14-22)",
      thu: "PLANT-B (14-22)",
      fri: "PLANT-B (14-22)",
      sat: "WEEKLY_OFF",
      sun: "WEEKLY_OFF"
    },
    {
      employee: "Ramesh Pawar (EMP-031)",
      dept: "Warehouse",
      mon: "NIGHT-C (22-06)",
      tue: "NIGHT-C (22-06)",
      wed: "NIGHT-C (22-06)",
      thu: "NIGHT-C (22-06)",
      fri: "NIGHT-C (22-06)",
      sat: "WEEKLY_OFF",
      sun: "WEEKLY_OFF"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📅 Workforce Shift Rosters & Scheduling</h1>
          <p className="text-sm text-slate-600">
            Multi-shift rotational matrix, weekly off allocations, department schedule publishes, and auto-balancing.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/attendance/swaps" as Route}>
            <Button variant="secondary">🔄 Shift Swaps</Button>
          </Link>
          <Link href={"/attendance/workforce-scheduling" as Route}>
            <Button variant="primary">⚡ Auto-Scheduler</Button>
          </Link>
        </div>
      </div>

      {/* Roster Controls */}
      <Panel className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 uppercase">Department Scope:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900"
          >
            <option value="Warehouse">Warehouse & Supply Chain</option>
            <option value="Engineering">Software Engineering</option>
            <option value="Quality">Quality & Lab Operations</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Badge tone="success">WEEK 36 (SEP 01 - SEP 07)</Badge>
        </div>
      </Panel>

      {/* Roster Grid */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Weekly Shift Schedule ({rosterData.length} Rostered ICs)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-2">Mon (01)</th>
                <th className="py-3 px-2">Tue (02)</th>
                <th className="py-3 px-2">Wed (03)</th>
                <th className="py-3 px-2">Thu (04)</th>
                <th className="py-3 px-2">Fri (05)</th>
                <th className="py-3 px-2">Sat (06)</th>
                <th className="py-3 px-2">Sun (07)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {rosterData.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-sans font-semibold text-slate-900">{r.employee}</td>
                  <td className="py-3 px-2 text-primary font-bold">{r.mon}</td>
                  <td className="py-3 px-2 text-primary font-bold">{r.tue}</td>
                  <td className="py-3 px-2 text-primary font-bold">{r.wed}</td>
                  <td className="py-3 px-2 text-primary font-bold">{r.thu}</td>
                  <td className="py-3 px-2 text-primary font-bold">{r.fri}</td>
                  <td className="py-3 px-2 text-slate-400 font-medium">{r.sat}</td>
                  <td className="py-3 px-2 text-slate-400 font-medium">{r.sun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
