"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function TalentIntelligenceAdminPage() {
  const flightRiskRadar = [
    { employee: "Gaurav M.", role: "Senior Frontend Engineer", riskLevel: "HIGH", factors: "3 months no feedback, high overtime hours, missed 2 1:1 syncs", suggestedAction: "Schedule Skip-Level retention discussion & review compensation parity" },
    { employee: "Neha Gupta", role: "Product Designer", riskLevel: "MEDIUM", factors: "Completed IDP milestones with no recent promotion review", suggestedAction: "Evaluate promotion readiness for L5 Senior Designer" }
  ];

  const highPotentialPipeline = [
    { employee: "Aarav Sharma", role: "Senior Backend Lead", readiness: "READY_NOW", targetRole: "Staff Software Engineer (L6)", score: 96.4 },
    { employee: "Meera Nair", role: "Product Designer", readiness: "READY_IN_6_MONTHS", targetRole: "Principal Product Designer (L5)", score: 94.2 },
    { employee: "Karan Patel", role: "Operations Specialist", readiness: "READY_NOW", targetRole: "Assistant Operations Manager (L4)", score: 91.8 }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🤖 AI Talent Intelligence & Flight Risk Radar</h1>
          <p className="text-sm text-slate-600">
            Explainable AI predictions for employee flight risk, promotion readiness scoring, and successor bench strength analysis.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/performance/talent-review" as Route}>
            <Button variant="secondary">🏛️ 9-Box Workbench</Button>
          </Link>
          <Button variant="primary">🔄 Re-run Predictive Engine</Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">High-Potential Bench</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">14 Identified</div>
          <div className="mt-1 text-xs text-slate-600">Top 12% of workforce across 9-Box Stars</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Elevated Flight Risk</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">2 Key Roles</div>
          <div className="mt-1 text-xs text-slate-600">Predicted based on engagement & 1:1 telemetry</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Succession Coverage Ratio</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">84.2%</div>
          <div className="mt-1 text-xs text-slate-600">16 of 19 Critical Roles have Ready Successors</div>
        </Panel>
      </div>

      {/* High Potential Promotion Pipeline */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">AI Promotion Readiness Pipeline</h2>
          <Badge tone="success">100% EXPLAINABLE MODEL</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Current Designation</th>
                <th className="py-3 px-4">Target Designation</th>
                <th className="py-3 px-4">Readiness State</th>
                <th className="py-3 px-4">Readiness Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highPotentialPipeline.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{p.employee}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{p.role}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-primary">{p.targetRole}</td>
                  <td className="py-3 px-4">
                    <Badge tone={p.readiness === "READY_NOW" ? "success" : "warning"}>
                      {p.readiness.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-bold text-slate-900">{p.score}%</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={"/performance/promotions" as Route}>
                      <Button variant="primary">Initiate Case</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Flight Risk Radar */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">🚨 Retention & Flight Risk Warnings</h2>
        <div className="space-y-3">
          {flightRiskRadar.map((r, idx) => (
            <div key={idx} className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{r.employee}</span>
                  <span className="text-xs text-slate-500">({r.role})</span>
                </div>
                <Badge tone="danger">{r.riskLevel} FLIGHT RISK</Badge>
              </div>
              <p className="text-xs text-slate-700"><span className="font-bold">Contributing Factors:</span> {r.factors}</p>
              <div className="rounded bg-white p-2.5 text-xs text-emerald-800 border border-emerald-200">
                <span className="font-bold">💡 Recommended AI Mitigation:</span> {r.suggestedAction}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
