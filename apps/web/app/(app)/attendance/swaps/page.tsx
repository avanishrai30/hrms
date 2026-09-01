"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";

export default function ShiftSwapsPage() {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const [swapRequests] = useState([
    {
      id: "sw-1",
      requester: "Sunil Patil (EMP-014)",
      target: "Rajesh Kumar (EMP-001)",
      sourceShift: "PLANT-B (14:00 - 22:30)",
      targetShift: "PLANT-A (06:00 - 14:30)",
      swapDate: "Sep 04, 2026",
      reason: "Family emergency in evening; swapping for morning shift",
      status: "PENDING"
    },
    {
      id: "sw-2",
      requester: "Aarav Sharma (EMP-042)",
      target: "Kavita Rao (EMP-077)",
      sourceShift: "GEN-0918",
      targetShift: "GEN-0918",
      swapDate: "Aug 28, 2026",
      reason: "Doctor appointment adjustment",
      status: "APPROVED"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🔄 Shift Swap Exchange & Trade Requests</h1>
          <p className="text-sm text-slate-600">
            Submit shift trades with peers, track manager approvals, and ensure uninterrupted production line coverage.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Request Shift Swap
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Request Peer Shift Swap</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Select Peer Colleague">
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none">
                <option value="emp-1">Rajesh Kumar (Plant Morning Shift A)</option>
                <option value="emp-2">Sunil Patil (Plant Evening Shift B)</option>
                <option value="emp-3">Ramesh Pawar (Plant Night Shift C)</option>
              </select>
            </Field>
            <Field label="Swap Target Date">
              <Input type="date" defaultValue="2026-09-05" />
            </Field>
            <Field label="Reason for Swap">
              <Input placeholder="Describe operational reason for exchange" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Submit Swap Request
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Swaps Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Shift Swap Requests ({swapRequests.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Requester & Peer</th>
                <th className="py-3 px-4">Source Shift</th>
                <th className="py-3 px-4">Target Shift</th>
                <th className="py-3 px-4">Swap Date</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {swapRequests.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-semibold text-slate-900">{s.requester}</div>
                    <div className="text-slate-500">↔ {s.target}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700">{s.sourceShift}</td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-primary">{s.targetShift}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{s.swapDate}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">{s.reason}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={s.status === "APPROVED" ? "success" : "warning"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {s.status === "PENDING" && (
                      <>
                        <Button variant="primary">Approve</Button>
                        <Button variant="secondary">Reject</Button>
                      </>
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
