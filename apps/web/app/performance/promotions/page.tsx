"use client";

import { useState } from "react";
import { Badge, Button, Panel } from "../../../components/ui";

export default function PromotionEnginePage() {
  const [promotions] = useState([
    {
      id: "pr-1",
      employeeName: "Aarav Sharma",
      currentRole: "Senior Backend Engineer",
      targetRole: "Staff Software Engineer / Tech Lead",
      performanceScore: 4.8,
      competencyScore: 4.6,
      tenureMonths: 28,
      potentialScore: 4.5,
      readinessScore: 94.2,
      readinessRating: "READY_NOW",
      proposedSalaryBumpPct: 18.0,
      status: "PENDING_APPROVAL",
      justification: "Led backend architecture for high-throughput inventory indexing, zero-downtime database rollout, and mentors 4 junior engineers."
    },
    {
      id: "pr-2",
      employeeName: "Meera Nair",
      currentRole: "Product Designer",
      targetRole: "Lead Product Designer",
      performanceScore: 4.6,
      competencyScore: 4.2,
      tenureMonths: 20,
      potentialScore: 4.0,
      readinessScore: 86.4,
      readinessRating: "READY_NOW",
      proposedSalaryBumpPct: 15.0,
      status: "APPROVED",
      justification: "Created and unified design tokens across mobile and web with 100% component accessibility adherence."
    },
    {
      id: "pr-3",
      employeeName: "Karan Patel",
      currentRole: "Operations Specialist",
      targetRole: "Senior Operations Specialist",
      performanceScore: 3.8,
      competencyScore: 3.5,
      tenureMonths: 14,
      potentialScore: 3.5,
      readinessScore: 71.5,
      readinessRating: "READY_IN_6_MONTHS",
      proposedSalaryBumpPct: 12.0,
      status: "IN_DEVELOPMENT",
      justification: "Strong daily execution; recommended to complete cross-warehouse fulfillment rotation before promotion."
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">🚀 Promotion Engine & Readiness</h1>
          <p className="text-sm text-zinc-500">
            Multi-factor point evaluation (Performance 40% + Competency 30% + Tenure 15% + Potential 15%) & compensation planning.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary">+ Evaluate Candidate</Button>
        </div>
      </div>

      {/* Promotion Candidates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <Panel key={promo.id} className="p-5 flex flex-col justify-between hover:border-indigo-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <Badge tone={promo.readinessRating === "READY_NOW" ? "success" : "warning"}>
                  {promo.readinessRating.replace(/_/g, " ")}
                </Badge>
                <Badge tone={promo.status === "APPROVED" ? "success" : "neutral"}>
                  {promo.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-zinc-900 mt-3">{promo.employeeName}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Current: <strong className="text-zinc-700">{promo.currentRole}</strong>
              </p>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                Target: <strong>{promo.targetRole}</strong>
              </p>

              {/* Point Score Breakdown */}
              <div className="mt-4 rounded-xl bg-zinc-50 p-3 border border-zinc-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Readiness Score:</span>
                  <span className="font-black text-indigo-600 text-sm">{promo.readinessScore} / 100 pts</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${promo.readinessScore}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-500 pt-1">
                  <span>Performance: {promo.performanceScore}/5</span>
                  <span>Competency: {promo.competencyScore}/5</span>
                  <span>Tenure: {promo.tenureMonths} mos</span>
                  <span>Potential: {promo.potentialScore}/5</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-zinc-600">
                <strong className="text-zinc-900">Justification:</strong>
                <p className="mt-1 line-clamp-3 italic text-zinc-500">"{promo.justification}"</p>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-100 pt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Salary Bump:</span>
                <p className="text-sm font-bold text-emerald-600">+{promo.proposedSalaryBumpPct}%</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Review</Button>
                {promo.status === "PENDING_APPROVAL" && (
                  <Button variant="primary">Approve</Button>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
