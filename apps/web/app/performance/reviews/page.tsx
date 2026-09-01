"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function PerformanceReviewsPage() {
  const [activeTab, setActiveTab] = useState<"MY_REVIEWS" | "TEAM_REVIEWS">("TEAM_REVIEWS");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const [reviews] = useState([
    {
      id: "rev-1",
      employeeName: "Aarav Sharma",
      role: "Senior Backend Engineer",
      department: "Engineering",
      cycleName: "Q3 2026 Appraisal Cycle",
      selfScore: 4.5,
      managerScore: 4.2,
      finalScore: 4.3,
      ratingLabel: "EXCEEDS_EXPECTATIONS",
      status: "MANAGER_REVIEW",
      dueDate: "2026-09-30"
    },
    {
      id: "rev-2",
      employeeName: "Meera Nair",
      role: "Product Designer",
      department: "Design",
      cycleName: "Q3 2026 Appraisal Cycle",
      selfScore: 4.8,
      managerScore: 4.8,
      finalScore: 4.8,
      ratingLabel: "OUTSTANDING",
      status: "HR_CALIBRATION",
      dueDate: "2026-09-30"
    },
    {
      id: "rev-3",
      employeeName: "Karan Patel",
      role: "Operations Specialist",
      department: "Operations",
      cycleName: "Q3 2026 Appraisal Cycle",
      selfScore: 3.8,
      managerScore: 3.5,
      finalScore: 3.6,
      ratingLabel: "MEETS_EXPECTATIONS",
      status: "FINALIZED",
      dueDate: "2026-09-30"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">📑 Performance Reviews Hub</h1>
          <p className="text-sm text-zinc-500">Manage self assessments, manager evaluations, and appraisal cycle sign-offs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/performance/appraisals" as Route}>
            <Button variant="secondary">🔄 360° Multi-Rater Breakdown</Button>
          </Link>
          <Link href={"/performance/calibration" as Route}>
            <Button variant="primary">⚖️ Bell Curve Calibration</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab("TEAM_REVIEWS")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "TEAM_REVIEWS" ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Team Appraisals ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab("MY_REVIEWS")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "MY_REVIEWS" ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          My Self-Assessment (1)
        </button>
      </div>

      {/* Reviews Table */}
      <Panel className="overflow-hidden p-0">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-600">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Cycle</th>
              <th className="p-4 text-center">Self Score</th>
              <th className="p-4 text-center">Manager Score</th>
              <th className="p-4 text-center">Overall Score</th>
              <th className="p-4">Rating Label</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {reviews.map((rev) => (
              <tr key={rev.id} className="hover:bg-zinc-50/60 transition">
                <td className="p-4">
                  <p className="font-semibold text-zinc-900">{rev.employeeName}</p>
                  <p className="text-[11px] text-zinc-400">{rev.role} • {rev.department}</p>
                </td>
                <td className="p-4 text-zinc-600">{rev.cycleName}</td>
                <td className="p-4 text-center font-semibold text-zinc-800">{rev.selfScore} / 5</td>
                <td className="p-4 text-center font-semibold text-indigo-600">{rev.managerScore} / 5</td>
                <td className="p-4 text-center font-bold text-zinc-900">{rev.finalScore} / 5</td>
                <td className="p-4">
                  <Badge tone={rev.ratingLabel === "OUTSTANDING" ? "success" : rev.ratingLabel === "EXCEEDS_EXPECTATIONS" ? "warning" : "neutral"}>
                    {rev.ratingLabel.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge tone={rev.status === "FINALIZED" ? "success" : "warning"}>
                    {rev.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="secondary" onClick={() => setSelectedReviewId(rev.id)}>
                    Evaluate →
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Review Modal / Drawer */}
      {selectedReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Manager Appraisal Assessment</h2>
                <p className="text-xs text-zinc-500">Submit score and competency evaluation for Aarav Sharma.</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedReviewId(null)}>✕</Button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-zinc-700">Manager Overall Score (1.0 - 5.0)</label>
                  <Input type="number" step="0.1" defaultValue="4.2" min="1" max="5" />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700">Rating Classification</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>EXCEEDS_EXPECTATIONS</option>
                    <option>OUTSTANDING</option>
                    <option>MEETS_EXPECTATIONS</option>
                    <option>NEEDS_IMPROVEMENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700">Key Strengths & Notable Achievements</label>
                <textarea className="w-full rounded-lg border border-zinc-200 p-2 text-xs" rows={2} defaultValue="Exceptional technical architecture and high speed of feature delivery." />
              </div>

              <div>
                <label className="font-semibold text-zinc-700">Growth Recommendations & Action Areas</label>
                <textarea className="w-full rounded-lg border border-zinc-200 p-2 text-xs" rows={2} defaultValue="Expand cross-functional leadership in platform engineering discussions." />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3">
              <Button variant="ghost" onClick={() => setSelectedReviewId(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => setSelectedReviewId(null)}>Submit Review</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
