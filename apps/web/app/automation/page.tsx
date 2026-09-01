"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function AutomationOverviewPage() {
  const [rules] = useState([
    {
      id: "r-1",
      name: "Onboarding Welcome & IT Asset Auto-Provisioning",
      trigger: "EMPLOYEE_CREATED",
      conditions: "Department == 'Engineering'",
      actions: "Send Slack Welcome + Create Asset Ticket + Email Creds",
      runsMonth: 28,
      status: "ACTIVE"
    },
    {
      id: "r-2",
      name: "Auto-Alert on Excessive Shift Overtime (> 4 hrs)",
      trigger: "ATTENDANCE_MARKED",
      conditions: "OvertimeHours > 4",
      actions: "Notify Manager via WhatsApp + Flag in Compliance Log",
      runsMonth: 142,
      status: "ACTIVE"
    },
    {
      id: "r-3",
      name: "Finance Expense Escalation (> ₹50,000)",
      trigger: "EXPENSE_SUBMITTED",
      conditions: "Amount > 50000",
      actions: "Route to CFO Approval + Post in Finance Channel",
      runsMonth: 15,
      status: "ACTIVE"
    },
    {
      id: "r-4",
      name: "Candidate Offer Letter Auto-Dispatch & Preboarding",
      trigger: "CANDIDATE_HIRED",
      conditions: "OfferAccepted == true",
      actions: "Generate PDF Offer + Create Portal Account + Send SMS",
      runsMonth: 12,
      status: "ACTIVE"
    },
    {
      id: "r-5",
      name: "VIP Visitor Alert to Executive Security",
      trigger: "VISITOR_CHECKED_IN",
      conditions: "VisitorType == 'VIP'",
      actions: "Dispatch Push Notification + Reserve Executive Suite",
      runsMonth: 6,
      status: "ACTIVE"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">⚙️ Workflow Automation Platform</h1>
          <p className="text-sm text-slate-600">
            Automate multi-step business logic across HR, Attendance, Payroll, Finance, and IT with zero code.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={"/automation/templates" as Route}>
            <Button variant="secondary">📋 Templates Library</Button>
          </Link>
          <Link href={"/automation/history" as Route}>
            <Button variant="secondary">📜 Execution History</Button>
          </Link>
          <Link href={"/automation/builder" as Route}>
            <Button variant="primary">+ Build New Workflow</Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Automation Rules</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">5 Rules Running</div>
          <div className="mt-1 text-xs text-slate-600">Evaluating 9 Event Trigger Types</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Executions This Month</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">203 Runs</div>
          <div className="mt-1 text-xs text-slate-600">100% Success Rate (0 Failures)</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Manual Hours Saved</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">~68.5 Hours</div>
          <div className="mt-1 text-xs text-slate-600">Calculated on 20 mins avg manual task</div>
        </Panel>
      </div>

      {/* Rules Table */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Configured Automation Rules</h2>
          <Link href={"/automation/builder" as Route}>
            <Button variant="primary">+ Create Rule</Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Workflow Name</th>
                <th className="py-3 px-4">Trigger Event</th>
                <th className="py-3 px-4">Condition Filter</th>
                <th className="py-3 px-4">Triggered Actions</th>
                <th className="py-3 px-4">Runs (30d)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{r.name}</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-mono font-semibold text-blue-700">
                      {r.trigger}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{r.conditions}</td>
                  <td className="py-3 px-4 text-xs text-slate-700">{r.actions}</td>
                  <td className="py-3 px-4 font-mono text-xs">{r.runsMonth}</td>
                  <td className="py-3 px-4">
                    <Badge tone="success">{r.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={"/automation/builder" as Route}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
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
