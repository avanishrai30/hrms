"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function CareerDevelopmentPage() {
  const [plans] = useState([
    {
      id: "idp-1",
      employee: "Aarav Sharma",
      title: "Staff Engineer Technical Leadership Track",
      targetRole: "Staff Software Engineer (L6)",
      mentor: "Rajan Pillai (VP Engineering)",
      targetDate: "Q1 2027",
      overallProgress: 75,
      goals: [
        { name: "Complete AWS Certified Solutions Architect Professional", type: "CERTIFICATION", status: "COMPLETED", progress: 100 },
        { name: "Deliver High-Throughput Webhook Ingestion Engine (>10k events/s)", type: "PROJECT_MILESTONE", status: "COMPLETED", progress: 100 },
        { name: "Mentor 2 Junior Engineers through Fullstack Feature Delivery", type: "LEADERSHIP", status: "IN_PROGRESS", progress: 60 },
        { name: "Publish 2 Internal Tech RFCs on Data Isolation & Multi-Tenancy", type: "ARCHITECTURE", status: "IN_PROGRESS", progress: 50 }
      ]
    },
    {
      id: "idp-2",
      employee: "Meera Nair",
      title: "Design System Lead Growth Plan",
      targetRole: "Principal Product Designer (L5)",
      mentor: "Ananya Roy (Head of Design)",
      targetDate: "Q4 2026",
      overallProgress: 80,
      goals: [
        { name: "Establish Unified React & Tailwind Component Library Tokens", type: "DESIGN_SYSTEM", status: "COMPLETED", progress: 100 },
        { name: "Conduct 15 Usability Research Sessions with Warehouse Operators", type: "USER_RESEARCH", status: "COMPLETED", progress: 100 },
        { name: "Lead Accessibility (WCAG 2.1 AA) Audit across all Admin Portals", type: "COMPLIANCE", status: "IN_PROGRESS", progress: 40 }
      ]
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🌱 Career Development Plans & Skill Milestones</h1>
          <p className="text-sm text-slate-600">
            Individual Development Plans (IDP), competency mastery roadmaps, mentorship pairings, and certification tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/performance/career-paths" as Route}>
            <Button variant="secondary">🧭 Career Path Ladders</Button>
          </Link>
          <Button variant="primary">+ Create New IDP</Button>
        </div>
      </div>

      {/* IDP Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plans.map((idp) => (
          <Panel key={idp.id} className="space-y-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-primary uppercase">{idp.targetRole}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{idp.title}</h3>
                <p className="text-xs text-slate-500">
                  Owner: <span className="font-semibold text-slate-700">{idp.employee}</span> · Mentor: {idp.mentor} · Target: {idp.targetDate}
                </p>
              </div>
              <Badge tone="success">{idp.overallProgress}% Complete</Badge>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-600" style={{ width: `${idp.overallProgress}%` }}></div>
            </div>

            {/* Milestones */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Growth Milestones ({idp.goals.length})</span>
              <div className="space-y-2">
                {idp.goals.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${g.status === "COMPLETED" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                      <span className="font-medium text-slate-900">{g.name}</span>
                    </div>
                    <span className="font-mono text-slate-600 font-semibold">{g.progress}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
              <Button variant="secondary">Review with Mentor</Button>
              <Button variant="primary">Update Milestones</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
