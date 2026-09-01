"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function AdminCalibrationPage() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [sessions] = useState([
    {
      id: "cs-1",
      name: "Engineering & Architecture Q3 Calibration",
      department: "Engineering",
      cycleName: "Q3 2026 Appraisal Cycle",
      status: "IN_PROGRESS",
      reviewsCount: 40,
      calibratedBy: "Admin / HR Panel",
      createdAt: "2026-08-25"
    },
    {
      id: "cs-2",
      name: "Product, Design & Growth Q3 Calibration",
      department: "Product",
      cycleName: "Q3 2026 Appraisal Cycle",
      status: "IN_PROGRESS",
      reviewsCount: 22,
      calibratedBy: "Admin / HR Panel",
      createdAt: "2026-08-26"
    },
    {
      id: "cs-3",
      name: "Warehouse Operations Q3 Calibration",
      department: "Operations",
      cycleName: "Q3 2026 Appraisal Cycle",
      status: "FINALIZED",
      reviewsCount: 56,
      calibratedBy: "Admin / HR Panel",
      createdAt: "2026-08-20"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">🏛️ Calibration Sessions Admin</h1>
          <p className="text-sm text-zinc-500">
            Schedule department calibration cohorts, assign reviewers, and audit normalized rating curves.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>+ Schedule Calibration Cohort</Button>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <Panel key={s.id} className="p-5 flex flex-col justify-between hover:border-indigo-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <Badge tone={s.status === "FINALIZED" ? "success" : "warning"}>
                  {s.status.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs font-semibold text-zinc-400">{s.department}</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mt-2">{s.name}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{s.cycleName}</p>

              <div className="mt-4 rounded-xl bg-zinc-50 p-3 border border-zinc-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Reviews:</span>
                  <span className="font-bold text-zinc-900">{s.reviewsCount} Employees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Moderator:</span>
                  <span className="text-zinc-700">{s.calibratedBy}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-100 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Created: {s.createdAt}</span>
              <Link href={"/performance/calibration" as Route}>
                <Button variant="primary">Enter Session →</Button>
              </Link>
            </div>
          </Panel>
        ))}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">Schedule Calibration Cohort</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Cohort Session Name</label>
                <Input placeholder="e.g. Sales & BD Q3 2026 Calibration" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Department</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>Engineering</option>
                    <option>Product & Design</option>
                    <option>Operations</option>
                    <option>Sales & Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Review Cycle</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>Q3 2026 Appraisal Cycle</option>
                    <option>Q4 2026 Annual Cycle</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowCreateModal(false)}>Create Cohort</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
