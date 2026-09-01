"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function CareerPathsPage() {
  const [selectedTrack, setSelectedTrack] = useState("ENGINEERING");

  const tracks = {
    ENGINEERING: [
      { level: "L3", title: "Software Engineer", tenure: "1 - 2 Years", competencies: ["Core TypeScript/NodeJS", "Unit Testing", "Git Flow", "Feature Delivery"], salaryBand: "₹8L - ₹14L" },
      { level: "L4", title: "Senior Software Engineer", tenure: "2 - 4 Years", competencies: ["Distributed Systems", "SQL Indexing & Tuning", "Code Reviews", "Module Ownership"], salaryBand: "₹15L - ₹25L" },
      { level: "L5", title: "Lead Engineer / Tech Lead", tenure: "4 - 7 Years", competencies: ["System Architecture", "Mentorship", "Cross-Pod Alignment", "SLA & Observability"], salaryBand: "₹26L - ₹40L" },
      { level: "L6", title: "Staff Engineer / Architect", tenure: "7+ Years", competencies: ["Multi-Tenant Scalability", "Tech Strategy & RFCs", "Organization-wide Influence"], salaryBand: "₹42L - ₹65L" }
    ],
    PRODUCT: [
      { level: "L3", title: "Associate Product Manager", tenure: "1 - 2 Years", competencies: ["User Stories & Backlog", "Sprint Execution", "Metrics Tracking"], salaryBand: "₹8L - ₹13L" },
      { level: "L4", title: "Product Manager", tenure: "2 - 5 Years", competencies: ["PRD Authoring", "GTM Execution", "Customer Discovery", "A/B Testing"], salaryBand: "₹14L - ₹24L" },
      { level: "L5", title: "Senior Product Manager", tenure: "5 - 8 Years", competencies: ["Product Strategy", "P&L Ownership", "Cross-Functional Leadership"], salaryBand: "₹25L - ₹38L" }
    ],
    OPERATIONS: [
      { level: "L2", title: "Warehouse Operations Executive", tenure: "1 - 2 Years", competencies: ["Inward Dispatch", "Barcode Scanning", "FIFO Inventory"], salaryBand: "₹4L - ₹7L" },
      { level: "L3", title: "Shift Supervisor", tenure: "2 - 4 Years", competencies: ["Shift Rostering", "Safety Compliance", "Attendance Auditing"], salaryBand: "₹7L - ₹11L" },
      { level: "L4", title: "Operations Manager", tenure: "4 - 7 Years", competencies: ["Fleet Logistics", "Vendor SLAs", "Capex Budgeting"], salaryBand: "₹12L - ₹20L" }
    ]
  };

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🧭 Career Path Ladders & Progression Matrix</h1>
          <p className="text-sm text-slate-600">
            Transparent competency benchmarks, tenure expectations, and compensation bands across technical and leadership dual tracks.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/performance/development" as Route}>
            <Button variant="secondary">🌱 View My IDP</Button>
          </Link>
        </div>
      </div>

      {/* Track Selector */}
      <div className="flex gap-2">
        {(["ENGINEERING", "PRODUCT", "OPERATIONS"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTrack(t)}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              selectedTrack === t ? "bg-primary text-white" : "bg-surface text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t} LADDER
          </button>
        ))}
      </div>

      {/* Ladder Sequence */}
      <div className="space-y-4">
        {tracks[selectedTrack as keyof typeof tracks].map((step, idx) => (
          <Panel key={step.level} className="p-5 border-l-4 border-l-primary space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold font-mono text-primary">
                  {step.level}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <span className="text-xs text-slate-500 font-medium">Expected Tenure: {step.tenure} · Band: {step.salaryBand}</span>
                </div>
              </div>
              <Badge tone="neutral">STEP {idx + 1} OF {tracks[selectedTrack as keyof typeof tracks].length}</Badge>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Competency Milestones:</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {step.competencies.map((comp) => (
                  <span key={comp} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                    ✓ {comp}
                  </span>
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
