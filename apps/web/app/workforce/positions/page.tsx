"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function PositionsMasterPage() {
  const [showModal, setShowModal] = useState(false);
  const [posCode, setPosCode] = useState("");
  const [posTitle, setPosTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [isCritical, setIsCritical] = useState(false);

  const [positions] = useState([
    {
      id: "pos-1",
      code: "ENG-L6-ARCH",
      title: "Principal Distributed Systems Architect",
      department: "Software Engineering",
      grade: "L6",
      reportsTo: "VP of Engineering",
      approvedHC: 2,
      filledHC: 1,
      openHC: 1,
      budget: "₹45,00,000",
      isCritical: true,
      status: "ACTIVE"
    },
    {
      id: "pos-2",
      code: "OPS-L4-SUPV",
      title: "Warehouse Shift Operations Supervisor",
      department: "Warehouse & Logistics",
      grade: "L4",
      reportsTo: "Plant Operations Head",
      approvedHC: 6,
      filledHC: 5,
      openHC: 1,
      budget: "₹12,00,000",
      isCritical: true,
      status: "ACTIVE"
    },
    {
      id: "pos-3",
      code: "QA-L5-LEAD",
      title: "Quality Assurance & GMP Compliance Lead",
      department: "Quality & Regulatory",
      grade: "L5",
      reportsTo: "Head of Quality",
      approvedHC: 2,
      filledHC: 2,
      openHC: 0,
      budget: "₹24,00,000",
      isCritical: true,
      status: "ACTIVE"
    },
    {
      id: "pos-4",
      code: "SALES-L3-REP",
      title: "Institutional Accounts Business Executive",
      department: "Sales & Marketing",
      grade: "L3",
      reportsTo: "Regional Sales Manager",
      approvedHC: 12,
      filledHC: 8,
      openHC: 4,
      budget: "₹9,50,000",
      isCritical: false,
      status: "FROZEN"
    }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏛️ Position Master & Lifecycle Management</h1>
          <p className="text-sm text-slate-600">
            Define corporate position architecture, approved headcount budgets, critical role flags, and freeze/close controls.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Position
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Define New Corporate Position</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Position Code">
                <Input placeholder="e.g. ENG-L5-LEAD" value={posCode} onChange={(e) => setPosCode(e.target.value)} />
              </Field>
              <Field label="Department">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none"
                >
                  <option value="Engineering">Software Engineering</option>
                  <option value="Operations">Warehouse & Operations</option>
                  <option value="Quality">Quality & Regulatory</option>
                  <option value="Sales">Sales & Marketing</option>
                </select>
              </Field>
            </div>
            <Field label="Position Title">
              <Input placeholder="e.g. Staff Backend Infrastructure Engineer" value={posTitle} onChange={(e) => setPosTitle(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Approved Headcount">
                <Input type="number" defaultValue="1" />
              </Field>
              <Field label="Annual Budget (INR)">
                <Input type="number" defaultValue="2500000" />
              </Field>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="crit"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary"
              />
              <label htmlFor="crit" className="text-xs font-semibold text-slate-700">
                Flag as Business-Critical Position (Requires Succession Bench)
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save Position
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Positions Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Configured Positions ({positions.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Position Title & Code</th>
                <th className="py-3 px-4">Department & Reports To</th>
                <th className="py-3 px-4">Approved / Filled / Open</th>
                <th className="py-3 px-4">Annual Budget</th>
                <th className="py-3 px-4">Role Criticality</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{p.title}</div>
                    <div className="font-mono text-xs text-slate-500">{p.code} · Grade {p.grade}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-medium text-slate-900">{p.department}</div>
                    <div className="text-slate-500">Reports to: {p.reportsTo}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <span className="font-bold text-slate-900">{p.approvedHC} Approved</span> · <span className="font-bold text-emerald-700">{p.filledHC} Filled</span> · <span className="font-bold text-rose-600">{p.openHC} Open</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{p.budget}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={p.isCritical ? "danger" : "neutral"}>
                      {p.isCritical ? "CRITICAL ROLE" : "STANDARD"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge tone={p.status === "ACTIVE" ? "success" : "warning"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Button variant="secondary">Manage</Button>
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
