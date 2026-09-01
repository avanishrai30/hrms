"use client";

import { useState } from "react";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function ContinuousFeedbackPage() {
  const [activeTab, setActiveTab] = useState<"RECEIVED" | "GIVEN">("RECEIVED");
  const [showGiveModal, setShowGiveModal] = useState<boolean>(false);

  const [feedbacks] = useState([
    {
      id: "fb-1",
      from: "Sneha Patel",
      role: "Engineering Manager",
      category: "SPOT_AWARD",
      badge: "🚀 Speed Demon",
      rating: 5,
      strengths: "Architected the automated deployment pipeline and zero-downtime database migration flawlessly.",
      improvements: "Continue sharing architecture designs early in RFC sessions.",
      visibility: "EMPLOYEE_VISIBLE",
      date: "2 days ago"
    },
    {
      id: "fb-2",
      from: "Karan Patel",
      role: "Operations Lead",
      category: "PEER_FEEDBACK",
      badge: "🤝 Team Player",
      rating: 5,
      strengths: "Helped our warehouse team resolve the barcode scanner latency issue in record time.",
      improvements: "None, fantastic cross-functional collaboration!",
      visibility: "EMPLOYEE_VISIBLE",
      date: "1 week ago"
    },
    {
      id: "fb-3",
      from: "Vikram Mehta",
      role: "VP of Engineering",
      category: "MANAGER_COACHING",
      badge: "💡 Innovator",
      rating: 4,
      strengths: "High technical craftsmanship and ownership of core platform reliability.",
      improvements: "Mentor upcoming junior hires on observability best practices.",
      visibility: "MANAGER_ONLY",
      date: "2 weeks ago"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">💬 Continuous Feedback & Recognition</h1>
          <p className="text-sm text-zinc-500">Real-time peer reviews, manager coaching notes, spot awards, and cultural badges.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => setShowGiveModal(true)}>+ Give Feedback / Award</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab("RECEIVED")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "RECEIVED" ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Received Feedback ({feedbacks.length})
        </button>
        <button
          onClick={() => setActiveTab("GIVEN")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === "GIVEN" ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Given by Me (8)
        </button>
      </div>

      {/* Feedbacks Stream */}
      <div className="space-y-4">
        {feedbacks.map((fb) => (
          <Panel key={fb.id} className="p-5 hover:border-zinc-300 transition">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm">
                  {fb.from.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900">{fb.from}</h3>
                    <Badge tone={fb.category === "SPOT_AWARD" ? "warning" : "neutral"}>
                      {fb.category.replace(/_/g, " ")}
                    </Badge>
                    {fb.badge && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                        {fb.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{fb.role} • {fb.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500">{"★".repeat(fb.rating)}</span>
                <span className="text-xs text-zinc-400 font-medium">({fb.rating}/5)</span>
                <Badge tone="neutral">{fb.visibility.replace(/_/g, " ")}</Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 rounded-xl bg-zinc-50/70 p-4 border border-zinc-100 text-xs">
              <div>
                <strong className="text-emerald-700 font-semibold">Key Strengths:</strong>
                <p className="mt-1 text-zinc-700">{fb.strengths}</p>
              </div>
              <div>
                <strong className="text-indigo-700 font-semibold">Areas for Growth:</strong>
                <p className="mt-1 text-zinc-700">{fb.improvements}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* Give Feedback Modal */}
      {showGiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">Give Feedback or Recognition</h2>
            <p className="text-xs text-zinc-500 mt-1">Recognize a colleague or provide constructive coaching.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Recipient</label>
                <Input placeholder="Search employee name or email..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Feedback Type</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>PEER_FEEDBACK</option>
                    <option>SPOT_AWARD</option>
                    <option>MANAGER_COACHING</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Visibility</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>EMPLOYEE_VISIBLE</option>
                    <option>MANAGER_ONLY</option>
                    <option>HR_VISIBLE</option>
                    <option>PRIVATE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700">What went well? (Strengths)</label>
                <textarea className="w-full rounded-lg border border-zinc-200 p-2 text-xs" rows={2} />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700">What could be better? (Growth)</label>
                <textarea className="w-full rounded-lg border border-zinc-200 p-2 text-xs" rows={2} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowGiveModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowGiveModal(false)}>Submit Feedback</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
