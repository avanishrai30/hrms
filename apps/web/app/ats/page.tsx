"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function AtsDashboardPage() {
  const [stats] = useState({
    openPositions: 8,
    activeCandidates: 42,
    scheduledInterviews: 14,
    pendingOffers: 5,
    avgTimeToHire: "24 days",
    offerAcceptanceRate: "88%"
  });

  const [recentReqs] = useState([
    { code: "REQ-2026-001", title: "Senior Full Stack Engineer", dept: "Engineering", openings: 3, applicants: 18, status: "PUBLISHED" },
    { code: "REQ-2026-002", title: "Product Operations Lead", dept: "Operations", openings: 1, applicants: 9, status: "PUBLISHED" },
    { code: "REQ-2026-003", title: "Talent Acquisition Specialist", dept: "Human Resources", openings: 2, applicants: 15, status: "APPROVED" }
  ]);

  useEffect(() => {
    // Analytics telemetry
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Talent Acquisition & ATS</h1>
          <p className="text-sm text-zinc-500">Manage hiring requisitions, candidate pipelines, interview scorecards, and offer releases.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/ats/pipeline" as Route}>
            <Button variant="secondary">📋 Kanban Pipeline</Button>
          </Link>
          <Link href={"/ats/jobs" as Route}>
            <Button variant="primary">+ New Requisition</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Panel className="p-4 border-l-4 border-l-primary">
          <p className="text-xs font-medium text-zinc-500 uppercase">Open Positions</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.openPositions}</p>
          <span className="text-xs text-emerald-600 font-medium">↑ 2 new this week</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-sky-500">
          <p className="text-xs font-medium text-zinc-500 uppercase">Active Candidates</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.activeCandidates}</p>
          <span className="text-xs text-zinc-400">across 6 stages</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-zinc-500 uppercase">Scheduled Rounds</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.scheduledInterviews}</p>
          <span className="text-xs text-amber-600 font-medium">4 today</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-zinc-500 uppercase">Offers Pending</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.pendingOffers}</p>
          <span className="text-xs text-purple-600 font-medium">2 ready for release</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-zinc-500 uppercase">Time to Hire</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.avgTimeToHire}</p>
          <span className="text-xs text-emerald-600 font-medium">↓ 4 days faster</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-indigo-500">
          <p className="text-xs font-medium text-zinc-500 uppercase">Offer Acceptance</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.offerAcceptanceRate}</p>
          <span className="text-xs text-indigo-600 font-medium">Industry leading</span>
        </Panel>
      </div>

      {/* Quick Navigation Hub */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Link href={"/ats/pipeline" as Route} className="group">
          <Panel className="p-5 hover:border-primary transition duration-150 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">📋</span>
                <Badge tone="neutral">ATS Kanban</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 group-hover:text-primary">Pipeline Board</h3>
              <p className="mt-1 text-xs text-zinc-500">Drag and drop candidates across Screening, Technical, Manager, and Offer stages.</p>
            </div>
            <p className="mt-4 text-xs font-semibold text-primary">Open Pipeline →</p>
          </Panel>
        </Link>

        <Link href={"/ats/candidates" as Route} className="group">
          <Panel className="p-5 hover:border-primary transition duration-150 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">👥</span>
                <Badge tone="neutral">Talent Pool</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 group-hover:text-primary">Candidate Database</h3>
              <p className="mt-1 text-xs text-zinc-500">Search resumes, view AI skill rankings, match scores, and interview histories.</p>
            </div>
            <p className="mt-4 text-xs font-semibold text-primary">Browse Candidates →</p>
          </Panel>
        </Link>

        <Link href={"/ats/interviews" as Route} className="group">
          <Panel className="p-5 hover:border-primary transition duration-150 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🗓️</span>
                <Badge tone="neutral">Evaluation</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 group-hover:text-primary">Interview Scorecards</h3>
              <p className="mt-1 text-xs text-zinc-500">Schedule panel rounds and submit weighted 6-criteria candidate feedback.</p>
            </div>
            <p className="mt-4 text-xs font-semibold text-primary">Manage Rounds →</p>
          </Panel>
        </Link>

        <Link href={"/admin/recruitment-dashboard" as Route} className="group">
          <Panel className="p-5 hover:border-primary transition duration-150 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🤖</span>
                <Badge tone="warning">AI Intelligence</Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 group-hover:text-primary">Talent Risk Radar</h3>
              <p className="mt-1 text-xs text-zinc-500">Predict offer decline risks, notice period bottlenecks, and talent shortages.</p>
            </div>
            <p className="mt-4 text-xs font-semibold text-primary">Launch Radar →</p>
          </Panel>
        </Link>
      </div>

      {/* Active Job Requisitions Table */}
      <Panel className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Active Job Requisitions</h2>
            <p className="text-xs text-zinc-500">Open positions currently sourcing talent</p>
          </div>
          <Link href={"/ats/jobs" as Route}>
            <Button variant="ghost">View All ({recentReqs.length}) →</Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
              <tr>
                <th className="py-2.5 px-3">Req Code</th>
                <th className="py-2.5 px-3">Job Title</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Openings</th>
                <th className="py-2.5 px-3 text-center">Applicants</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentReqs.map((req) => (
                <tr key={req.code} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-3 font-mono text-xs text-zinc-500">{req.code}</td>
                  <td className="py-3 px-3 font-medium text-zinc-900">{req.title}</td>
                  <td className="py-3 px-3">{req.dept}</td>
                  <td className="py-3 px-3 text-center font-semibold">{req.openings}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs">
                      {req.applicants}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge tone={req.status === "PUBLISHED" ? "success" : "neutral"}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link href={`/ats/pipeline?req=${req.code}` as Route}>
                      <Button variant="secondary">View Pipeline</Button>
                    </Link>
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
