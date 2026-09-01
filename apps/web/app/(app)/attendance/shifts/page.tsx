"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";

export default function ShiftsPage() {
  const [showModal, setShowModal] = useState(false);
  const [shiftName, setShiftName] = useState("");
  const [shiftCode, setShiftCode] = useState("");

  const [shifts] = useState([
    {
      id: "sh-1",
      name: "General Corporate Shift",
      code: "GEN-0918",
      timing: "09:00 AM - 06:00 PM",
      breakMins: 60,
      graceMins: 15,
      lateThreshold: 60,
      assignedEmployees: 110,
      type: "GENERAL"
    },
    {
      id: "sh-2",
      name: "Plant Morning Production Shift (A)",
      code: "PLANT-A",
      timing: "06:00 AM - 02:30 PM",
      breakMins: 30,
      graceMins: 10,
      lateThreshold: 45,
      assignedEmployees: 65,
      type: "ROTATIONAL"
    },
    {
      id: "sh-3",
      name: "Plant Evening Processing Shift (B)",
      code: "PLANT-B",
      timing: "02:00 PM - 10:30 PM",
      breakMins: 30,
      graceMins: 10,
      lateThreshold: 45,
      assignedEmployees: 50,
      type: "ROTATIONAL"
    },
    {
      id: "sh-4",
      name: "Cold-Chain Night Operations Shift (C)",
      code: "NIGHT-C",
      timing: "10:00 PM - 06:30 AM",
      breakMins: 30,
      graceMins: 10,
      lateThreshold: 30,
      assignedEmployees: 25,
      type: "NIGHT"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⏰ Shift Templates & Grace Policy Rules</h1>
          <p className="text-sm text-slate-600">
            Define work shift templates, punch grace allowances, half-day deductions, split shifts, and night shift overtime premiums.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Shift Template
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Define Shift Template</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Shift Name">
                <Input placeholder="e.g. Warehouse Shift A" value={shiftName} onChange={(e) => setShiftName(e.target.value)} />
              </Field>
              <Field label="Shift Code">
                <Input placeholder="e.g. SHIFT-WH-A" value={shiftCode} onChange={(e) => setShiftCode(e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time">
                <Input type="time" defaultValue="09:00" />
              </Field>
              <Field label="End Time">
                <Input type="time" defaultValue="18:00" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Break (Mins)">
                <Input type="number" defaultValue="60" />
              </Field>
              <Field label="Grace (Mins)">
                <Input type="number" defaultValue="15" />
              </Field>
              <Field label="Late Cutoff (Mins)">
                <Input type="number" defaultValue="60" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save Shift
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Shifts Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Active Shift Templates ({shifts.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Shift Name & Code</th>
                <th className="py-3 px-4">Operating Hours</th>
                <th className="py-3 px-4">Break Duration</th>
                <th className="py-3 px-4">Grace Window</th>
                <th className="py-3 px-4">Assigned Personnel</th>
                <th className="py-3 px-4">Shift Category</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="font-mono text-xs text-slate-500">{s.code}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{s.timing}</td>
                  <td className="py-3.5 px-4 text-slate-700">{s.breakMins} mins</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{s.graceMins}m Grace</Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{s.assignedEmployees} Rostered</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={s.type === "NIGHT" ? "warning" : "neutral"}>
                      {s.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Configure</Button>
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
