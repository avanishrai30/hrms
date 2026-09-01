"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Panel } from "../../../components/ui";

export default function AutomationHistoryPage() {
  const [logs] = useState([
    {
      id: "run-101",
      ruleName: "Onboarding Welcome & IT Asset Auto-Provisioning",
      trigger: "EMPLOYEE_CREATED",
      triggeredBy: "emp_7b8a (Aarav Sharma)",
      status: "COMPLETED",
      actionsExecuted: 3,
      durationMs: 340,
      timestamp: "Today at 04:12 PM"
    },
    {
      id: "run-102",
      ruleName: "Auto-Alert on Excessive Shift Overtime (> 4 hrs)",
      trigger: "ATTENDANCE_MARKED",
      triggeredBy: "emp_4412 (Rohan Verma)",
      status: "COMPLETED",
      actionsExecuted: 2,
      durationMs: 180,
      timestamp: "Today at 03:45 PM"
    },
    {
      id: "run-103",
      ruleName: "Candidate Offer Letter Auto-Dispatch",
      trigger: "CANDIDATE_HIRED",
      triggeredBy: "cand_9921 (Pooja Hegde)",
      status: "COMPLETED",
      actionsExecuted: 3,
      durationMs: 512,
      timestamp: "Yesterday at 11:20 AM"
    },
    {
      id: "run-104",
      ruleName: "Finance Expense Escalation (> ₹50,000)",
      trigger: "EXPENSE_SUBMITTED",
      triggeredBy: "claim_8832 (Vikram Malhotra)",
      status: "COMPLETED",
      actionsExecuted: 2,
      durationMs: 220,
      timestamp: "Yesterday at 09:14 AM"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/automation" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Workflows
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📜 Automation Execution History</h1>
          <p className="text-sm text-slate-600">
            Immutable audit log of all automated workflow executions, action statuses, and execution latency.
          </p>
        </div>
      </div>

      <Panel className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-4">Workflow Rule</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4">Context Object</th>
                <th className="py-3 px-4">Steps Executed</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-800 font-bold">{log.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{log.ruleName}</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-mono font-semibold text-blue-700">
                      {log.trigger}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">{log.triggeredBy}</td>
                  <td className="py-3 px-4 text-xs font-bold text-slate-700">{log.actionsExecuted} actions</td>
                  <td className="py-3 px-4 text-xs font-mono">{log.durationMs}ms</td>
                  <td className="py-3 px-4 text-xs">{log.timestamp}</td>
                  <td className="py-3 px-4">
                    <Badge tone="success">{log.status}</Badge>
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
