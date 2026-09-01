"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function ExitClearancePage() {
  const [selectedClearance, setSelectedClearance] = useState<string>("cl-1");

  const [clearances] = useState([
    {
      id: "cl-1",
      employee: "Karan Patel",
      employeeCode: "OPS019",
      designation: "Operations Specialist",
      department: "Warehouse & Operations",
      resignationDate: "2026-08-01",
      lastWorkingDay: "2026-08-31",
      status: "IN_PROGRESS",
      completedTasks: 3,
      totalTasks: 5,
      tasks: [
        {
          id: "t-it",
          dept: "IT DEPARTMENT",
          task: "Hardware Return & System Access Revocation",
          desc: "Collect ThinkPad laptop, charger, security token; deactivate Google Workspace and SSO.",
          isCompleted: true,
          assignee: "Rajesh IT",
          remarks: "MacBook & YubiKey collected in good condition. SSO revoked."
        },
        {
          id: "t-admin",
          dept: "ADMIN & FACILITIES",
          task: "Physical ID & Access Badge Surrender",
          desc: "Collect NFC ID card, desk locker keys, and vehicle parking tag.",
          isCompleted: true,
          assignee: "Ramesh Admin",
          remarks: "NFC card & locker keys handed over."
        },
        {
          id: "t-fin",
          dept: "FINANCE & ACCOUNTS",
          task: "Pending Dues, Loans & Expense Settlement",
          desc: "Verify company advances, travel vouchers, and final FnF payroll dues.",
          isCompleted: false,
          assignee: "Priya Menon",
          remarks: "Awaiting final travel receipt of ₹4,200 from August trip."
        },
        {
          id: "t-mgr",
          dept: "REPORTING MANAGER",
          task: "Knowledge Transfer (KT) & Project Handover",
          desc: "Verify handover documentation in Notion and repo commit rights transition.",
          isCompleted: true,
          assignee: "Sunil Verma",
          remarks: "All warehouse standard operating docs signed off."
        },
        {
          id: "t-hr",
          dept: "HUMAN RESOURCES",
          task: "Exit Interview & Relieving Letter Prep",
          desc: "Conduct exit survey, re-affirm NDA terms, and issue relieving certificate.",
          isCompleted: false,
          assignee: "Kavita HR",
          remarks: "Exit survey completed. Pending finance signoff."
        }
      ]
    },
    {
      id: "cl-2",
      employee: "Vikram Malhotra",
      employeeCode: "SAL008",
      designation: "Enterprise Account Executive",
      department: "Sales",
      resignationDate: "2026-08-15",
      lastWorkingDay: "2026-09-15",
      status: "INITIATED",
      completedTasks: 1,
      totalTasks: 5,
      tasks: []
    }
  ]);

  const activeClearance = clearances.find((c) => c.id === selectedClearance) || clearances[0]!;
  const progressPct = Math.round((activeClearance.completedTasks / activeClearance.totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📤 Employee Exit Clearance & Asset Recovery</h1>
          <p className="text-sm text-slate-600">
            5-Department strict clearance workflow: IT, Admin, Finance, HR, and Manager sign-offs before FnF release.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">💻 Asset Register</Button>
          </Link>
          <Button variant="primary">+ Initiate Exit Clearance</Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Active Clearances List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Active Exit Requests</h2>
          {clearances.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedClearance(c.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedClearance === c.id
                  ? "bg-emerald-50/60 border-emerald-500 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-slate-900 text-sm">{c.employee}</span>
                <Badge tone={c.status === "IN_PROGRESS" ? "warning" : "neutral"}>
                  {c.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{c.designation} • {c.department}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>LWD: {c.lastWorkingDay}</span>
                <span className="font-semibold text-emerald-800">{c.completedTasks} / {c.totalTasks} Depts Signed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Clearance Checklist Workbench */}
        <div className="lg:col-span-8 space-y-4">
          <Panel className="p-6 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{activeClearance.employee} ({activeClearance.employeeCode})</h2>
                <p className="text-xs text-slate-500">
                  Last Working Day: <span className="font-semibold text-slate-700">{activeClearance.lastWorkingDay}</span> • Resignation: {activeClearance.resignationDate}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">Overall Progress</span>
                <div className="text-xl font-bold text-emerald-700">{progressPct}%</div>
              </div>
            </div>

            {/* Strict Notice Alert */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              ⚠️ <span className="font-bold">Strict Audit Enforcement:</span> Final settlement & relieving letter cannot be issued until all 5 departmental checklists are marked complete.
            </div>

            {/* Department Tasks Checklist */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Departmental Clearance Sign-Offs</h3>
              {activeClearance.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    task.isCompleted
                      ? "bg-emerald-50/40 border-emerald-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {task.dept}
                        </span>
                        <span className="text-xs text-slate-500">Assigned to: {task.assignee}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{task.task}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{task.desc}</p>
                    </div>
                    <Badge tone={task.isCompleted ? "success" : "warning"}>
                      {task.isCompleted ? "COMPLETED" : "PENDING"}
                    </Badge>
                  </div>

                  {task.remarks && (
                    <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-100 text-slate-700">
                      <span className="font-semibold text-slate-900">Remarks:</span> {task.remarks}
                    </div>
                  )}

                  {!task.isCompleted && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                      <Button variant="primary">Sign Off & Complete</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
