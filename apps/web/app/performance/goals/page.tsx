"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function GoalsManagementPage() {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [goals] = useState([
    {
      id: "goal-101",
      title: "Improve API Latency & Ensure 99.95% Availability",
      category: "OKR",
      weightage: 30,
      progressPercent: 85,
      status: "IN_PROGRESS",
      cycleName: "Q3 2026 Enterprise Cycle",
      employeeName: "Aarav Sharma",
      keyResultsCount: 3,
      dueDate: "2026-09-30"
    },
    {
      id: "goal-102",
      title: "Deliver Next-Gen Talent & Recruitment Suite",
      category: "KRA",
      weightage: 40,
      progressPercent: 100,
      status: "COMPLETED",
      cycleName: "Q3 2026 Enterprise Cycle",
      employeeName: "Aarav Sharma",
      keyResultsCount: 2,
      dueDate: "2026-09-15"
    },
    {
      id: "goal-103",
      title: "Enterprise Architecture & System Scalability Certification",
      category: "DEVELOPMENT",
      weightage: 30,
      progressPercent: 60,
      status: "IN_PROGRESS",
      cycleName: "Q3 2026 Enterprise Cycle",
      employeeName: "Aarav Sharma",
      keyResultsCount: 1,
      dueDate: "2026-10-15"
    },
    {
      id: "goal-104",
      title: "Accelerate Enterprise Revenue Growth to ₹1.5 Cr",
      category: "OKR",
      weightage: 50,
      progressPercent: 72,
      status: "IN_PROGRESS",
      cycleName: "Q3 2026 Enterprise Cycle",
      employeeName: "Meera Nair",
      keyResultsCount: 3,
      dueDate: "2026-09-30"
    }
  ]);

  const filteredGoals = goals.filter((g) => {
    if (filterCategory !== "ALL" && g.category !== filterCategory) return false;
    if (filterStatus !== "ALL" && g.status !== filterStatus) return false;
    if (searchQuery && !g.title.toLowerCase().includes(searchQuery.toLowerCase()) && !g.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">🎯 Goals & OKRs</h1>
          <p className="text-sm text-zinc-500">Track measurable Objectives, Key Results, and KRAs aligned with organizational growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>+ Create Objective</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Panel className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search goals or owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Category:</span>
            <select
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="OKR">OKR</option>
              <option value="KRA">KRA</option>
              <option value="DEVELOPMENT">Personal Development</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Status:</span>
            <select
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
          </div>
        </div>
      </Panel>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredGoals.map((goal) => (
          <Panel key={goal.id} className="p-5 flex flex-col justify-between hover:border-indigo-200 transition">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={goal.category === "OKR" ? "warning" : goal.category === "KRA" ? "warning" : "neutral"}>
                    {goal.category}
                  </Badge>
                  <span className="text-xs font-semibold text-zinc-400">Weight: {goal.weightage}%</span>
                </div>
                <Badge tone={goal.status === "COMPLETED" ? "success" : "warning"}>
                  {goal.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <Link href={`/performance/goals/${goal.id}` as Route} className="block group mt-2">
                <h3 className="text-base font-semibold text-zinc-900 group-hover:text-indigo-600 transition">
                  {goal.title}
                </h3>
              </Link>
              <p className="text-xs text-zinc-500 mt-1">Owner: <strong className="text-zinc-700">{goal.employeeName}</strong> • {goal.cycleName}</p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500">Achievement</span>
                  <span className="text-indigo-600">{goal.progressPercent}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.progressPercent >= 100 ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
              <span>{goal.keyResultsCount} Key Results</span>
              <span>Due: {goal.dueDate}</span>
              <Link href={`/performance/goals/${goal.id}` as Route}>
                <Button variant="secondary">View & Update →</Button>
              </Link>
            </div>
          </Panel>
        ))}
      </div>

      {/* Modal Mock */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">Create New Goal / OKR</h2>
            <p className="text-xs text-zinc-500 mt-1">Define an objective and align it with key results.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Objective Title</label>
                <Input placeholder="e.g. Optimize Microservice Latency & Reliability" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Category</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>OKR</option>
                    <option>KRA</option>
                    <option>DEVELOPMENT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Weightage (%)</label>
                  <Input type="number" defaultValue="25" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowCreateModal(false)}>Save Objective</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
