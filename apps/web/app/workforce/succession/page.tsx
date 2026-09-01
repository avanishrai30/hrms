"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function SuccessionPlanningPage() {
  const [successionPlans] = useState([
    {
      id: "succ-1",
      positionTitle: "VP of Warehouse & Supply Chain Operations",
      criticality: "CRITICAL",
      riskOfLoss: "MEDIUM",
      impactOfLoss: "CRITICAL",
      successors: [
        { name: "Rajesh Kumar", readiness: "READY_NOW", score: 92, flightRisk: "LOW" },
        { name: "Sunil Patil", readiness: "READY_1_YEAR", score: 78, flightRisk: "LOW" }
      ]
    },
    {
      id: "succ-2",
      positionTitle: "Principal Distributed Systems Architect",
      criticality: "CRITICAL",
      riskOfLoss: "HIGH",
      impactOfLoss: "CRITICAL",
      successors: [
        { name: "Aarav Sharma", readiness: "READY_NOW", score: 94, flightRisk: "MEDIUM" },
        { name: "Kavita Rao", readiness: "READY_2_YEARS", score: 62, flightRisk: "LOW" }
      ]
    },
    {
      id: "succ-3",
      positionTitle: "Head of Regulatory & Food Safety Compliance",
      criticality: "HIGH",
      riskOfLoss: "LOW",
      impactOfLoss: "HIGH",
      successors: [
        { name: "Ananya Iyer", readiness: "READY_1_YEAR", score: 81, flightRisk: "LOW" }
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/workforce" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Workforce Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🗺️ Critical Role Succession Management</h1>
          <p className="text-sm text-slate-600">
            Identify successors for mission-critical roles, calculate multi-factor readiness scores, and track 9-Box talent placement.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/workforce/bench-strength" as Route}>
            <Button variant="primary">🛡️ Bench Strength RAG</Button>
          </Link>
        </div>
      </div>

      {/* Succession Cards */}
      <div className="space-y-4">
        {successionPlans.map((plan) => (
          <Panel key={plan.id} className="p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase">Critical Leadership Role</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{plan.positionTitle}</h3>
              </div>
              <div className="flex gap-2">
                <Badge tone="danger">{plan.criticality}</Badge>
                <Badge tone={plan.riskOfLoss === "HIGH" ? "warning" : "neutral"}>Risk: {plan.riskOfLoss}</Badge>
              </div>
            </div>

            {/* Successors Pool */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase">Identified Successor Candidates ({plan.successors.length}):</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {plan.successors.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-slate-500 mt-0.5">Readiness Score: <span className="font-mono font-bold text-primary">{s.score}%</span></div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge tone={s.readiness === "READY_NOW" ? "success" : "warning"}>
                        {s.readiness.replace(/_/g, " ")}
                      </Badge>
                      <div className="text-[10px] text-slate-500">Flight Risk: {s.flightRisk}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary">+ Nominate Successor</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
