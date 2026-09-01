"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../../components/ui";

interface CalibrationReviewItem {
  id: string;
  name: string;
  score: number;
  managerRating: string;
  calibratedScore: number;
  calibratedRating: string;
  status: string;
}

export default function BellCurveCalibrationPage() {
  const [selectedSession] = useState({
    name: "Engineering & Tech Q3 2026 Calibration",
    department: "Engineering",
    totalEmployees: 40,
    status: "IN_PROGRESS"
  });

  const [distribution] = useState([
    { label: "OUTSTANDING", target: 5, actual: 7.5, count: 3, delta: "+2.5%" },
    { label: "EXCEEDS_EXPECTATIONS", target: 15, actual: 22.5, count: 9, delta: "+7.5%" },
    { label: "MEETS_EXPECTATIONS", target: 60, actual: 55.0, count: 22, delta: "-5.0%" },
    { label: "NEEDS_IMPROVEMENT", target: 15, actual: 12.5, count: 5, delta: "-2.5%" },
    { label: "UNSATISFACTORY", target: 5, actual: 2.5, count: 1, delta: "-2.5%" }
  ]);

  const [reviewsToCalibrate] = useState<CalibrationReviewItem[]>([
    { id: "r1", name: "Aarav Sharma", score: 4.4, managerRating: "EXCEEDS_EXPECTATIONS", calibratedScore: 4.4, calibratedRating: "EXCEEDS_EXPECTATIONS", status: "PENDING" },
    { id: "r2", name: "Rohan Verma", score: 4.2, managerRating: "OUTSTANDING", calibratedScore: 4.0, calibratedRating: "EXCEEDS_EXPECTATIONS", status: "ADJUSTED" },
    { id: "r3", name: "Sneha Patel", score: 4.9, managerRating: "OUTSTANDING", calibratedScore: 4.9, calibratedRating: "OUTSTANDING", status: "APPROVED" },
    { id: "r4", name: "Karan Johar", score: 2.6, managerRating: "MEETS_EXPECTATIONS", calibratedScore: 2.4, calibratedRating: "NEEDS_IMPROVEMENT", status: "ADJUSTED" }
  ]);

  const [adjustModal, setAdjustModal] = useState<{ open: boolean; review: CalibrationReviewItem | null }>({
    open: false,
    review: null
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">⚖️ Bell Curve Calibration Session</h1>
          <p className="text-sm text-zinc-500">
            Harmonize managerial grading bias, evaluate standard enterprise quotas, and finalize calibrated scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/admin/calibration" as Route}>
            <Button variant="secondary">Manage All Sessions</Button>
          </Link>
          <Button variant="primary">Finalize Calibration Session</Button>
        </div>
      </div>

      {/* Session Banner */}
      <Panel className="p-6 bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="warning">CALIBRATION IN PROGRESS</Badge>
              <span className="text-xs text-zinc-300 font-semibold">{selectedSession.department} Department</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{selectedSession.name}</h2>
            <p className="text-xs text-zinc-400">Total reviews in cohort: <strong>{selectedSession.totalEmployees} employees</strong></p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/10 text-xs">
            <p className="font-semibold text-indigo-300">Enterprise Target Curve:</p>
            <p className="text-zinc-200 mt-0.5">5% Outstanding • 15% Exceeds • 60% Meets • 15% Needs Imp • 5% Poor</p>
          </div>
        </div>
      </Panel>

      {/* Bell Curve Visual Comparison Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {distribution.map((d) => (
          <Panel key={d.label} className="p-4 border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{d.label.replace(/_/g, " ")}</span>
              <Badge tone={d.delta.startsWith("+") ? "warning" : "neutral"}>{d.delta}</Badge>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-2xl font-black text-zinc-900">{d.actual}%</p>
              <p className="text-xs text-zinc-400">Target: {d.target}%</p>
            </div>
            <p className="text-xs text-zinc-500 mt-1">{d.count} Employees</p>

            {/* Target vs Actual Visual Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 relative">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, d.actual * 1.5)}%` }} />
            </div>
          </Panel>
        ))}
      </div>

      {/* Employees Calibration Table */}
      <Panel className="p-6">
        <h3 className="font-semibold text-zinc-900">Cohort Employee Ratings & Adjustments</h3>
        <p className="text-xs text-zinc-500">Review manager submitted ratings and apply calibration overrides with audit justification</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-600">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3 text-center">Manager Score</th>
                <th className="p-3">Manager Rating</th>
                <th className="p-3 text-center">Calibrated Score</th>
                <th className="p-3">Calibrated Rating</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {reviewsToCalibrate.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/60 transition">
                  <td className="p-3 font-semibold text-zinc-900">{r.name}</td>
                  <td className="p-3 text-center font-bold text-zinc-700">{r.score} / 5</td>
                  <td className="p-3">
                    <Badge tone="neutral">{r.managerRating.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="p-3 text-center font-black text-indigo-600">{r.calibratedScore} / 5</td>
                  <td className="p-3">
                    <Badge tone={r.calibratedRating === "OUTSTANDING" ? "success" : r.calibratedRating === "EXCEEDS_EXPECTATIONS" ? "warning" : "neutral"}>
                      {r.calibratedRating.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge tone={r.status === "ADJUSTED" ? "warning" : r.status === "APPROVED" ? "success" : "neutral"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => setAdjustModal({ open: true, review: r })}
                    >
                      Adjust Rating
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Adjust Rating Modal */}
      {adjustModal.open && adjustModal.review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900">Adjust Calibrated Rating</h2>
            <p className="text-xs text-zinc-500">Employee: <strong>{adjustModal.review.name}</strong></p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700">Calibrated Score</label>
                  <Input type="number" step="0.1" defaultValue={adjustModal.review.calibratedScore} />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700">Calibrated Classification</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs" defaultValue={adjustModal.review.calibratedRating}>
                    <option>OUTSTANDING</option>
                    <option>EXCEEDS_EXPECTATIONS</option>
                    <option>MEETS_EXPECTATIONS</option>
                    <option>NEEDS_IMPROVEMENT</option>
                    <option>UNSATISFACTORY</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold text-zinc-700">Calibration Committee Justification</label>
                <textarea className="w-full rounded-lg border border-zinc-200 p-2 text-xs" rows={3} placeholder="Provide audit reason for bell curve adjustment..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3">
              <Button variant="ghost" onClick={() => setAdjustModal({ open: false, review: null })}>Cancel</Button>
              <Button variant="primary" onClick={() => setAdjustModal({ open: false, review: null })}>Save Calibration</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
