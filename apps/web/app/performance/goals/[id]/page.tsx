"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../../../components/ui";

export default function GoalDetailPage() {
  const params = useParams();
  const goalId = params.id as string;

  const [goal, setGoal] = useState({
    id: goalId,
    title: "Improve API Latency & Ensure 99.95% System Availability",
    category: "OKR",
    weightage: 30,
    progressPercent: 82,
    status: "IN_PROGRESS",
    cycleName: "Q3 2026 Enterprise Cycle",
    employeeName: "Aarav Sharma",
    employeeRole: "Senior Backend Engineer",
    dueDate: "2026-09-30",
    description: "Architect distributed caching layers and optimize database index queries to consistently meet enterprise SLAs under heavy load.",
    evidenceText: "Deployed Redis cluster and reduced P99 latency on checkout endpoints from 320ms to 125ms.",
    evidenceUrl: "https://monitoring.vc-organics.internal/dashboards/latency",
    managerComments: "Solid improvement in query performance; ensure load tests are run during peak hours."
  });

  const [keyResults, setKeyResults] = useState([
    {
      id: "kr-1",
      title: "Reduce P99 API latency across core services to under 150ms",
      metricType: "NUMERIC",
      startValue: 320,
      targetValue: 150,
      currentValue: 135,
      weightage: 40,
      progressPercent: 100
    },
    {
      id: "kr-2",
      title: "Achieve 99.95% production uptime SLA",
      metricType: "PERCENTAGE",
      startValue: 99.0,
      targetValue: 99.95,
      currentValue: 99.92,
      weightage: 30,
      progressPercent: 96
    },
    {
      id: "kr-3",
      title: "Increase automated integration test coverage to >= 85%",
      metricType: "PERCENTAGE",
      startValue: 65,
      targetValue: 85,
      currentValue: 75,
      weightage: 30,
      progressPercent: 50
    }
  ]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUpdateKR = (krId: string, newVal: number) => {
    setKeyResults((prev) =>
      prev.map((kr) => {
        if (kr.id === krId) {
          const delta = kr.targetValue - kr.startValue;
          const achieved = newVal - kr.startValue;
          const progress = delta === 0 ? 100 : Math.max(0, Math.min(100, (achieved / delta) * 100));
          return { ...kr, currentValue: newVal, progressPercent: Math.round(progress) };
        }
        return kr;
      })
    );
  };

  const handleSaveAll = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccessMessage("Goal and Key Results updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link href={"/performance/goals" as Route} className="text-xs font-semibold text-indigo-600 hover:underline">
          ← Back to Goals Hub
        </Link>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone={goal.category === "OKR" ? "warning" : "neutral"}>{goal.category}</Badge>
              <Badge tone={goal.status === "COMPLETED" ? "success" : "warning"}>{goal.status}</Badge>
              <span className="text-xs font-semibold text-zinc-400">Weight: {goal.weightage}%</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">{goal.title}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Assigned to <strong>{goal.employeeName}</strong> ({goal.employeeRole}) • {goal.cycleName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleSaveAll} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          ✓ {successMessage}
        </div>
      )}

      {/* Overall Progress Gauge */}
      <Panel className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">Overall Objective Progress</p>
            <p className="text-3xl font-black mt-1 text-white">{goal.progressPercent}%</p>
            <p className="text-xs text-zinc-400 mt-1">Calculated via weighted aggregation of {keyResults.length} Key Results</p>
          </div>
          <div className="w-full sm:w-1/2">
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${goal.progressPercent}%` }} />
            </div>
          </div>
        </div>
      </Panel>

      {/* Key Results Tracker */}
      <Panel className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900">Key Results (KRs)</h3>
            <p className="text-xs text-zinc-500">Measurable milestones that define objective achievement</p>
          </div>
          <Button variant="secondary" onClick={() => {}}>+ Add Key Result</Button>
        </div>

        <div className="space-y-4">
          {keyResults.map((kr) => (
            <div key={kr.id} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Weight: {kr.weightage}%</span>
                  <h4 className="text-sm font-semibold text-zinc-900">{kr.title}</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-zinc-500">Current / Target:</span>
                    <p className="text-sm font-bold text-zinc-900">{kr.currentValue} / {kr.targetValue}</p>
                  </div>
                  <Badge tone={kr.progressPercent >= 100 ? "success" : "neutral"}>
                    {kr.progressPercent}%
                  </Badge>
                </div>
              </div>

              {/* Range Slider for Quick Updating */}
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min={Math.min(kr.startValue, kr.targetValue)}
                  max={Math.max(kr.startValue, kr.targetValue)}
                  step="1"
                  value={kr.currentValue}
                  onChange={(e) => handleUpdateKR(kr.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Evidence & Manager Review */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="p-6">
          <h3 className="font-semibold text-zinc-900">Evidence & Deliverables</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Attach documentation or pull request links demonstrating achievement.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">Evidence Summary</label>
              <textarea
                className="w-full rounded-xl border border-zinc-200 p-3 text-xs text-zinc-800"
                rows={3}
                value={goal.evidenceText}
                onChange={(e) => setGoal({ ...goal, evidenceText: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700">Evidence URL</label>
              <Input
                value={goal.evidenceUrl}
                onChange={(e) => setGoal({ ...goal, evidenceUrl: e.target.value })}
              />
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <h3 className="font-semibold text-zinc-900">Manager Evaluation & Coaching</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Reviewer feedback and alignment comments.</p>
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <p className="text-xs font-semibold text-indigo-900">Manager Note:</p>
            <p className="text-xs text-indigo-800 mt-1 italic">"{goal.managerComments}"</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => {}}>Approve Goal</Button>
            <Button variant="ghost" onClick={() => {}}>Request Changes</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
