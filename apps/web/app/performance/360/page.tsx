"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function ThreeSixtyFeedbackPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "received" | "campaigns">("pending");

  const [pendingRequests] = useState([
    {
      id: "req-1",
      targetEmployee: "Meera Nair",
      targetRole: "Product Designer",
      relationship: "PEER",
      competencies: ["Cross-Functional Collaboration", "Design Thinking", "Communication"],
      deadline: "Sep 15, 2026",
      isAnonymous: true
    },
    {
      id: "req-2",
      targetEmployee: "Aarav Sharma",
      targetRole: "Senior Backend Lead",
      relationship: "DIRECT_REPORT",
      competencies: ["Technical Mentorship", "Sprint Planning", "Empathy"],
      deadline: "Sep 18, 2026",
      isAnonymous: true
    }
  ]);

  const [receivedFeedback] = useState([
    {
      id: "fb-1",
      reviewerRole: "Peer Reviewer (Anonymous)",
      date: "Aug 24, 2026",
      rating: 4.8,
      strengths: "Exceptionally strong architecture foresight. Solved complex distributed transaction rollback challenges seamlessly.",
      improvements: "Could delegate minor pull request reviews to junior developers to conserve focus.",
      sentimentScore: "VERY_POSITIVE"
    },
    {
      id: "fb-2",
      reviewerRole: "Skip-Level Manager",
      date: "Aug 20, 2026",
      rating: 4.5,
      strengths: "Clear communication in cross-functional stakeholder alignments.",
      improvements: "Take more ownership in presenting quarterly tech debt roadmap to executive staff.",
      sentimentScore: "POSITIVE"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/performance" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Performance Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🔄 360° Multi-Rater Continuous Feedback</h1>
          <p className="text-sm text-slate-600">
            Structured, confidential questionnaires across Peers, Direct Reports, Managers, and Cross-Functional partners with AI sentiment analysis.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/performance/feedback" as Route}>
            <Button variant="secondary">💬 Praise Badge</Button>
          </Link>
          <Button variant="primary">+ Request 360° Feedback</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
            activeTab === "pending" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📥 Pending Requests for You ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
            activeTab === "received" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🌟 Received 360° Reviews ({receivedFeedback.length})
        </button>
      </div>

      {/* Tab 1: Pending */}
      {activeTab === "pending" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pendingRequests.map((req) => (
            <Panel key={req.id} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{req.targetEmployee}</h3>
                    <p className="text-xs text-slate-500">{req.targetRole} · {req.relationship}</p>
                  </div>
                  <Badge tone="warning">Due {req.deadline}</Badge>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-700">Competencies to Evaluate:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {req.competencies.map((c) => (
                      <span key={c} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {req.isAnonymous && (
                  <p className="mt-3 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded">
                    🔒 Protected Review: Your identity is strictly anonymous and aggregated into final scoring.
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <Button variant="primary">Fill Questionnaire →</Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Tab 2: Received */}
      {activeTab === "received" && (
        <div className="space-y-4">
          {receivedFeedback.map((fb) => (
            <Panel key={fb.id} className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{fb.reviewerRole}</h3>
                  <span className="text-xs text-slate-500">Submitted on {fb.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="success">{fb.sentimentScore}</Badge>
                  <span className="font-mono text-base font-bold text-primary">{fb.rating} / 5.0</span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 text-xs text-slate-800 space-y-2">
                <div>
                  <span className="font-bold text-emerald-800">💪 Core Strengths:</span> {fb.strengths}
                </div>
                <div>
                  <span className="font-bold text-amber-800">🌱 Growth Areas:</span> {fb.improvements}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
