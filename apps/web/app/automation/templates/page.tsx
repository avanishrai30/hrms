"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function AutomationTemplatesPage() {
  const templates = [
    {
      id: "t-1",
      title: "Complete New Hire Onboarding Sequence",
      category: "HR & ONBOARDING",
      desc: "Triggered on employee creation. Automatically sends welcome email, provisions Google Workspace account, creates IT asset ticket, and schedules day-1 orientation.",
      trigger: "EMPLOYEE_CREATED",
      steps: 4
    },
    {
      id: "t-2",
      title: "Critical Geofence / Shift Breach Escalation",
      category: "ATTENDANCE",
      desc: "Detects unauthorized clock-in attempts outside authorized geofence radius and immediately dispatches WhatsApp and email to shift supervisor.",
      trigger: "ATTENDANCE_MARKED",
      steps: 2
    },
    {
      id: "t-3",
      title: "Automated Exit Clearance Sign-off Sequence",
      category: "OFFBOARDING",
      desc: "Initiates 5-department clearance tasks (IT, HR, Finance, Admin, Manager), sends asset return reminders, and revokes SSO/OAuth credentials upon completion.",
      trigger: "EMPLOYEE_UPDATED",
      steps: 5
    },
    {
      id: "t-4",
      title: "Finance Multi-Level Approval Escalation",
      category: "FINANCE",
      desc: "Routes claims exceeding ₹25,000 to Department Head and ₹1,00,000 to CFO. Dispatches Slack approval requests with interactive buttons.",
      trigger: "EXPENSE_SUBMITTED",
      steps: 3
    },
    {
      id: "t-5",
      title: "SLA Breach Auto-Escalation Engine",
      category: "ITSM",
      desc: "Monitors ticket SLA timers. Automatically escalates P1 tickets to Level 2 engineering leads when response timer hits 80% threshold.",
      trigger: "TICKET_CLOSED",
      steps: 2
    }
  ];

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📋 Workflow Templates Library</h1>
          <p className="text-sm text-slate-600">
            One-click deployment of battle-tested enterprise automation blueprints across HR, IT, and Finance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <Panel key={tpl.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <Badge tone="neutral">{tpl.category}</Badge>
                <span className="text-xs font-mono text-slate-500">{tpl.steps} Steps</span>
              </div>
              <h3 className="mt-3 font-bold text-slate-900">{tpl.title}</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{tpl.desc}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {tpl.trigger}
              </span>
              <Link href={"/automation/builder" as Route}>
                <Button variant="primary">Use Template</Button>
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
