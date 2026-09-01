"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function ComplianceTrainingAdminPage() {
  const [compliancePrograms] = useState([
    {
      id: "prog-1",
      title: "Prevention of Sexual Harassment (POSH) 2026 Refresher",
      code: "COMP-102",
      targetAudience: "All 240 Employees",
      frequency: "ANNUAL",
      completedCount: 228,
      overdueCount: 12,
      completionRate: 95.0,
      deadline: "Sep 30, 2026",
      status: "ON_TRACK"
    },
    {
      id: "prog-2",
      title: "Good Manufacturing Practices (GMP) Hygiene Protocols",
      code: "COMP-101",
      targetAudience: "120 Factory & Warehouse Operators",
      frequency: "BI-ANNUAL",
      completedCount: 116,
      overdueCount: 4,
      completionRate: 96.6,
      deadline: "Sep 15, 2026",
      status: "ON_TRACK"
    },
    {
      id: "prog-3",
      title: "Workplace Fire Safety & Evacuation Drills",
      code: "COMP-103",
      targetAudience: "All 240 Employees",
      frequency: "ANNUAL",
      completedCount: 180,
      overdueCount: 60,
      completionRate: 75.0,
      deadline: "Oct 15, 2026",
      status: "NEEDS_ATTENTION"
    }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛡️ Statutory Compliance & Mandatory Training</h1>
          <p className="text-sm text-slate-600">
            Monitor completion percentages for POSH, GMP, and Fire Safety programs with automated reminder escalations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">📢 Send Bulk Escalation Reminder</Button>
        </div>
      </div>

      {/* Program Cards */}
      <div className="space-y-4">
        {compliancePrograms.map((prog) => (
          <Panel key={prog.id} className="p-5 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{prog.code}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{prog.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Audience: {prog.targetAudience} · Cadence: {prog.frequency} · Deadline: {prog.deadline}</p>
              </div>
              <Badge tone={prog.status === "ON_TRACK" ? "success" : "warning"}>
                {prog.completionRate}% COMPLETED
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${prog.completionRate >= 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${prog.completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-700 gap-2">
              <div>
                <span className="font-bold text-emerald-700">{prog.completedCount} Completed</span> · <span className="font-bold text-rose-600">{prog.overdueCount} Overdue / Pending</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">View Non-Compliant List</Button>
                <Button variant="primary">Trigger Reminder Email</Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
