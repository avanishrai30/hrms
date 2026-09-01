"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function GoalCheckInsPage() {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState("85");
  const [confidence, setConfidence] = useState("HIGH");
  const [notes, setNotes] = useState("");

  const [checkIns] = useState([
    {
      id: "chk-1",
      goalTitle: "Achieve 99.95% Core Uptime & Latency SLA",
      employee: "Aarav Sharma",
      metric: "Uptime %",
      previousValue: "99.88%",
      currentValue: "99.94%",
      progressPercent: 88,
      confidenceScore: "HIGH",
      checkInDate: "Aug 28, 2026",
      notes: "Redis multi-region cluster migration completed. Latency p95 reduced from 65ms to 38ms.",
      blockers: "None at present"
    },
    {
      id: "chk-2",
      goalTitle: "Automate 80% of Warehouse Invoicing Workflows",
      employee: "Karan Patel",
      metric: "Invoices Automated",
      previousValue: "60%",
      currentValue: "78%",
      progressPercent: 92,
      confidenceScore: "HIGH",
      checkInDate: "Aug 26, 2026",
      notes: "Integrated GST e-invoicing API with automated error reconciliation loop.",
      blockers: "Minor retry timeout on state portal"
    },
    {
      id: "chk-3",
      goalTitle: "Hire 12 Senior Fullstack Engineers across Pods",
      employee: "Priya Sundaram",
      metric: "Offers Accepted",
      previousValue: "6 / 12",
      currentValue: "9 / 12",
      progressPercent: 75,
      confidenceScore: "MEDIUM",
      checkInDate: "Aug 22, 2026",
      notes: "Completed 28 technical panel interviews. 3 offers in pipeline awaiting candidate sign-off.",
      blockers: "Notice period negotiation delays"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⏱️ Weekly & Monthly OKR Goal Check-Ins</h1>
          <p className="text-sm text-slate-600">
            Continuous progress tracking, milestone velocity updates, confidence ratings, and blocker identification.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/performance/goals" as Route}>
            <Button variant="secondary">🎯 All OKR Goals</Button>
          </Link>
          <Button
            variant="primary"
            onClick={() => {
              setActiveGoal("Achieve 99.95% Core Uptime & Latency SLA");
              setShowCheckInModal(true);
            }}
          >
            + Post Goal Check-In
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Check-In Cadence</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">Bi-Weekly Sync</div>
          <div className="mt-1 text-xs text-slate-600">92% Compliance across Active Goals</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average OKR Confidence</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">High (8.6 / 10)</div>
          <div className="mt-1 text-xs text-slate-600">Based on 64 self-reported check-ins</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flagged Blockers</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">3 Open Blockers</div>
          <div className="mt-1 text-xs text-slate-600">Escalated to Department Heads</div>
        </Panel>
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Post Goal Check-In</h2>
              <button onClick={() => setShowCheckInModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Goal</label>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{activeGoal}</p>
            </div>
            <Field label="Current Progress %">
              <Input
                type="number"
                min="0"
                max="100"
                value={progressVal}
                onChange={(e) => setProgressVal(e.target.value)}
              />
            </Field>
            <Field label="Confidence Score">
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none font-medium"
              >
                <option value="HIGH">🟢 High Confidence (On Track)</option>
                <option value="MEDIUM">🟡 Medium Confidence (Needs Monitoring)</option>
                <option value="LOW">🔴 Low Confidence (At Risk / Blocked)</option>
              </select>
            </Field>
            <Field label="Progress Updates & Accomplishments">
              <textarea
                rows={3}
                placeholder="What was completed since the last check-in?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-control border border-border bg-surface p-3 text-sm text-slate-900 outline-none"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowCheckInModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowCheckInModal(false)}>
                Submit Check-In
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Check-In Journal List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Recent Check-In Submissions</h2>
        <div className="grid grid-cols-1 gap-4">
          {checkIns.map((chk) => (
            <Panel key={chk.id} className="space-y-3 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{chk.goalTitle}</h3>
                  <p className="text-xs text-slate-500">
                    Owner: <span className="font-semibold text-slate-700">{chk.employee}</span> · Check-in Date: {chk.checkInDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={chk.confidenceScore === "HIGH" ? "success" : "warning"}>
                    {chk.confidenceScore} CONFIDENCE
                  </Badge>
                  <span className="font-mono text-sm font-bold text-primary">{chk.progressPercent}% Complete</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${chk.progressPercent}%` }}></div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                <div><span className="font-bold text-slate-800">Key Result Metric:</span> {chk.metric} ({chk.previousValue} → <span className="font-semibold text-emerald-700">{chk.currentValue}</span>)</div>
                <div><span className="font-bold text-slate-800">Check-in Notes:</span> {chk.notes}</div>
                {chk.blockers !== "None at present" && (
                  <div className="text-amber-800"><span className="font-bold">Blockers:</span> {chk.blockers}</div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
