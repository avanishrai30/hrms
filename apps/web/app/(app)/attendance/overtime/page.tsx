"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function OvertimePage() {
  const [otRequests] = useState([
    {
      id: "ot-1",
      employee: "Rajesh Kumar (EMP-001)",
      dept: "Warehouse & Logistics",
      date: "Aug 30, 2026",
      type: "DAILY_OT",
      minutes: 120,
      hours: "2.0 hrs",
      multiplier: "1.5x",
      estCost: "₹1,200",
      reason: "Unloading express cold-chain shipment from Nashik",
      status: "MANAGER_APPROVED"
    },
    {
      id: "ot-2",
      employee: "Sunil Patil (EMP-014)",
      dept: "Warehouse & Logistics",
      date: "Aug 31, 2026",
      type: "HOLIDAY_OT",
      minutes: 240,
      hours: "4.0 hrs",
      multiplier: "2.0x",
      estCost: "₹2,800",
      reason: "Emergency plant inventory dispatch",
      status: "HR_APPROVED"
    },
    {
      id: "ot-3",
      employee: "Aarav Sharma (EMP-042)",
      dept: "Software Engineering",
      date: "Sep 01, 2026",
      type: "NIGHT_SHIFT_OT",
      minutes: 180,
      hours: "3.0 hrs",
      multiplier: "1.75x",
      estCost: "₹3,150",
      reason: "Production database maintenance migration",
      status: "PENDING"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⏱️ Overtime Management & Payroll Bridge</h1>
          <p className="text-sm text-slate-600">
            Statutory overtime calculation (1.5x daily, 2.0x weekly off & holiday), multi-stage approvals, and automated payroll sync.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Request Overtime</Button>
        </div>
      </div>

      {/* Overtime Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Overtime Claims & Approvals ({otRequests.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">OT Date & Type</th>
                <th className="py-3 px-4">Duration & Multiplier</th>
                <th className="py-3 px-4">Estimated Pay</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {otRequests.map((ot) => (
                <tr key={ot.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-semibold text-slate-900">{ot.employee}</div>
                    <div className="text-slate-500">{ot.dept}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-medium text-slate-900">{ot.date}</div>
                    <div className="text-slate-500">{ot.type.replace(/_/g, " ")}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <span className="font-bold text-slate-900">{ot.hours}</span> · <span className="font-bold text-primary">{ot.multiplier}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{ot.estCost}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">{ot.reason}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={ot.status === "HR_APPROVED" ? "success" : ot.status === "MANAGER_APPROVED" ? "neutral" : "warning"}>
                      {ot.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {ot.status === "PENDING" && (
                      <Button variant="secondary">Review OT</Button>
                    )}
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
