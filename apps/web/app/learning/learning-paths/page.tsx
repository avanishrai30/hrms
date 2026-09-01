"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function LearningPathsPage() {
  const [paths] = useState([
    {
      id: "path-1",
      name: "New Hire Engineering Onboarding Track",
      targetRole: "All Software & DevOps Engineers",
      estimatedHours: "12 Hours",
      coursesCount: 5,
      isMandatory: true,
      progress: 60,
      courses: [
        "VC Organics Tech Architecture Overview",
        "Multi-Tenant PostgreSQL Isolation Deep Dive",
        "Coding Standards, Pure ESM & Vitest CI Pipelines",
        "Security, Prompt Injection & RBAC Enforcement",
        "Production Incident Response SOPs"
      ]
    },
    {
      id: "path-2",
      name: "Warehouse Shift Supervisor Safety & Compliance Path",
      targetRole: "Warehouse Supervisors (L3-L4)",
      estimatedHours: "8 Hours",
      coursesCount: 4,
      isMandatory: true,
      progress: 100,
      courses: [
        "Good Manufacturing Practices (GMP) Refresher",
        "Fire Safety & Emergency Evacuation Drill SOP",
        "FIFO Barcode Inward/Outward Dispatch Reconciliation",
        "Shift Attendance Rostering & Overtime Policies"
      ]
    },
    {
      id: "path-3",
      name: "People Manager Leadership Acceleration Journey",
      targetRole: "Team Leads & Engineering Managers (L5+)",
      estimatedHours: "16 Hours",
      coursesCount: 6,
      isMandatory: false,
      progress: 35,
      courses: [
        "Effective 1:1 Meetings & Agenda Management",
        "Continuous Feedback Delivery & Coaching",
        "Bell Curve Appraisal Calibration & Normalization",
        "Succession Planning & 9-Box Matrix Calibration",
        "High-Potential Talent Retention & Flight Risk Mitigation"
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/learning" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Learning Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛣️ Structured Learning Paths & Journeys</h1>
          <p className="text-sm text-slate-600">
            Role-based structured curricula, automated onboarding tracks, and promotion development roadmaps.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/catalog" as Route}>
            <Button variant="secondary">📚 Individual Courses</Button>
          </Link>
        </div>
      </div>

      {/* Learning Path Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((path) => (
          <Panel key={path.id} className="flex flex-col justify-between space-y-4 p-5">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase">{path.targetRole}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{path.name}</h3>
                </div>
                {path.isMandatory && <Badge tone="danger">MANDATORY</Badge>}
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Track Progress</span>
                  <span className="font-mono text-primary">{path.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${path.progress}%` }}></div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Included Courses ({path.coursesCount}):</span>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {path.courses.map((c, idx) => (
                    <li key={idx} className="line-clamp-1">{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">⏱️ {path.estimatedHours}</span>
              <Button variant="primary">Continue Path →</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
