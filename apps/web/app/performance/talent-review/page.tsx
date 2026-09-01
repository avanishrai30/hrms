"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function TalentReviewWorkbenchPage() {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);

  const nineBoxMatrix = [
    { id: "star", title: "★ Stars (High Perf / High Pot)", count: 8, tone: "success" as const, desc: "Future C-Suite / Principal Leads", employees: ["Aarav Sharma", "Meera Nair", "Priya Sundaram"] },
    { id: "high_growth", title: "High Growth (Med Perf / High Pot)", count: 12, tone: "success" as const, desc: "Accelerated development track", employees: ["Vikram Roy", "Tanvi Joshi"] },
    { id: "enigma", title: "Enigmas (Low Perf / High Pot)", count: 4, tone: "warning" as const, desc: "Role misfit or skill mismatch", employees: ["Devendra K."] },
    { id: "high_perf", title: "High Performers (High Perf / Med Pot)", count: 18, tone: "success" as const, desc: "Key domain subject matter experts", employees: ["Karan Patel", "Sneha Rao"] },
    { id: "core", title: "Core Contributors (Med Perf / Med Pot)", count: 42, tone: "neutral" as const, desc: "Solid backbone of steady delivery", employees: ["Amit Shah", "Rohan Verma"] },
    { id: "dilemma", title: "Dilemmas (Low Perf / Med Pot)", count: 6, tone: "warning" as const, desc: "Requires structured coaching plan", employees: ["Neha Gupta"] },
    { id: "trusted_pro", title: "Trusted Pros (High Perf / Low Pot)", count: 14, tone: "neutral" as const, desc: "Master specialists in current scope", employees: ["Rajesh Kumar"] },
    { id: "effective", title: "Effective (Med Perf / Low Pot)", count: 9, tone: "neutral" as const, desc: "Consistent execution within role", employees: ["Sunita V."] },
    { id: "underperformer", title: "Underperformers (Low Perf / Low Pot)", count: 3, tone: "danger" as const, desc: "Performance Improvement Plan (PIP)", employees: ["Gaurav M."] }
  ];

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏛️ 9-Box Talent Review & Succession Workbench</h1>
          <p className="text-sm text-slate-600">
            Calibrate workforce potential vs performance, identify high-potential talent bench strength, and document council decisions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/performance/succession" as Route}>
            <Button variant="secondary">🗺️ Succession Pools</Button>
          </Link>
          <Link href={"/performance/promotions" as Route}>
            <Button variant="primary">🚀 Promotion Pipeline</Button>
          </Link>
        </div>
      </div>

      {/* 9 Box Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">9-Box Talent Distribution (116 Evaluated)</h2>
          <span className="text-xs text-slate-500 font-mono">Cycle: Q3 2026 Appraisal</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {nineBoxMatrix.map((box) => (
            <div key={box.id} onClick={() => setSelectedBox(box.id)} className="cursor-pointer">
              <Panel
                className={`p-4 transition border-2 ${
                  selectedBox === box.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{box.title}</h3>
                  <Badge tone={box.tone}>{box.count} People</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{box.desc}</p>

                <div className="mt-3 border-t border-slate-100 pt-2 text-xs">
                  <span className="font-bold text-slate-700">Sample Placements:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {box.employees.map((e) => (
                      <span key={e} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-800">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </div>

      {/* Talent Council Actions */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Talent Review Council Decisions & Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-1">
            <span className="text-xs font-bold uppercase text-emerald-800">High-Potential Acceleration</span>
            <p className="text-xs text-slate-700">8 Star employees approved for accelerated promotion and equity retention grants.</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3.5 space-y-1">
            <span className="text-xs font-bold uppercase text-blue-800">Cross-Pod Rotation</span>
            <p className="text-xs text-slate-700">4 Enigma employees scheduled for lateral transfer into core warehouse architecture.</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3.5 space-y-1">
            <span className="text-xs font-bold uppercase text-amber-800">Targeted Coaching</span>
            <p className="text-xs text-slate-700">3 Underperformers enrolled in 60-day measurable technical competency bootcamp.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
