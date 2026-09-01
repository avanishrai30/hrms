"use client";

import { useState } from "react";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function AdminReviewCyclesPage() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [cycles, setCycles] = useState([
    {
      id: "rc-1",
      name: "Q3 2026 Appraisal & OKR Cycle",
      startDate: "2026-07-01",
      endDate: "2026-09-30",
      status: "MANAGER_REVIEW",
      reviewsCount: 124,
      calibratedCount: 38
    },
    {
      id: "rc-2",
      name: "Q2 2026 Appraisal & Calibration",
      startDate: "2026-04-01",
      endDate: "2026-06-30",
      status: "FINALIZED",
      reviewsCount: 118,
      calibratedCount: 118
    },
    {
      id: "rc-3",
      name: "Q4 2026 Strategy & Goals Setup",
      startDate: "2026-10-01",
      endDate: "2026-12-31",
      status: "DRAFT",
      reviewsCount: 0,
      calibratedCount: 0
    }
  ]);

  const advanceCycleStage = (cycleId: string, nextStatus: string) => {
    setCycles((prev) =>
      prev.map((c) => (c.id === cycleId ? { ...c, status: nextStatus } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">⏳ Appraisal Review Cycles</h1>
          <p className="text-sm text-zinc-500">
            Orchestrate appraisal lifecycle phases (Self Review → Manager Evaluation → Calibration → Finalization).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>+ Create Review Cycle</Button>
        </div>
      </div>

      {/* Cycles Table */}
      <Panel className="overflow-hidden p-0">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-600">
            <tr>
              <th className="p-4">Cycle Name</th>
              <th className="p-4">Timeline</th>
              <th className="p-4 text-center">Reviews</th>
              <th className="p-4 text-center">Calibrated</th>
              <th className="p-4">Current Stage</th>
              <th className="p-4 text-right">Stage Progression</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {cycles.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50/60 transition">
                <td className="p-4 font-semibold text-zinc-900">{c.name}</td>
                <td className="p-4 text-zinc-500">{c.startDate} to {c.endDate}</td>
                <td className="p-4 text-center font-bold text-zinc-900">{c.reviewsCount}</td>
                <td className="p-4 text-center font-bold text-indigo-600">{c.calibratedCount}</td>
                <td className="p-4">
                  <Badge tone={c.status === "FINALIZED" ? "success" : c.status === "DRAFT" ? "neutral" : "warning"}>
                    {c.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {c.status === "DRAFT" && (
                      <Button variant="secondary" onClick={() => advanceCycleStage(c.id, "SELF_REVIEW")}>
                        Activate Self Review →
                      </Button>
                    )}
                    {c.status === "SELF_REVIEW" && (
                      <Button variant="secondary" onClick={() => advanceCycleStage(c.id, "MANAGER_REVIEW")}>
                        Start Manager Review →
                      </Button>
                    )}
                    {c.status === "MANAGER_REVIEW" && (
                      <Button variant="primary" onClick={() => advanceCycleStage(c.id, "CALIBRATION")}>
                        Begin HR Calibration →
                      </Button>
                    )}
                    {c.status === "CALIBRATION" && (
                      <Button variant="primary" onClick={() => advanceCycleStage(c.id, "FINALIZED")}>
                        Lock & Finalize Cycle →
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">Create New Review Cycle</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Cycle Name</label>
                <Input placeholder="e.g. Q4 2026 Annual Performance Review" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Start Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">End Date</label>
                  <Input type="date" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowCreateModal(false)}>Create Cycle</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
