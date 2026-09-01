"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function Appraisals360Page() {
  const [selectedEmployee] = useState({
    name: "Aarav Sharma",
    role: "Senior Backend Engineer",
    department: "Core Engineering",
    finalScore: 4.28,
    ratingLabel: "EXCEEDS_EXPECTATIONS"
  });

  const [raterBreakdown] = useState([
    { raterType: "SELF", weight: "20%", score: 4.5, count: 1, feedback: "Met all core latency SLAs and built resilient distributed transaction engine." },
    { raterType: "MANAGER", weight: "40%", score: 4.2, count: 1, feedback: "High technical autonomy and strong mentorship in code reviews." },
    { raterType: "PEER", weight: "20%", score: 4.4, count: 3, feedback: "Great collaboration during the checkout database migration sprint." },
    { raterType: "SKIP_MANAGER", weight: "10%", score: 4.0, count: 1, feedback: "Consistent engineering quality; recommend cross-team tech talk." },
    { raterType: "CROSS_FUNCTIONAL", weight: "10%", score: 4.5, count: 2, feedback: "Very responsive and proactive in helping product operations teams." }
  ]);

  const [competencyScores] = useState([
    { name: "Technical Mastery & System Architecture", self: 4.8, manager: 4.5, peer: 4.6, benchmark: 4.0 },
    { name: "Execution Speed & Delivery", self: 4.5, manager: 4.2, peer: 4.4, benchmark: 4.0 },
    { name: "Cross-Functional Collaboration", self: 4.2, manager: 4.0, peer: 4.5, benchmark: 3.5 },
    { name: "Leadership & Mentorship", self: 4.0, manager: 3.8, peer: 4.1, benchmark: 3.5 }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">🔄 360° Multi-Rater Appraisals</h1>
          <p className="text-sm text-zinc-500">Holistic performance evaluation weighted across self, manager, peer, and cross-functional raters.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/performance/reviews" as Route}>
            <Button variant="secondary">← Back to Reviews</Button>
          </Link>
          <Link href={"/performance/calibration" as Route}>
            <Button variant="primary">Calibrate Rating →</Button>
          </Link>
        </div>
      </div>

      {/* Employee Overview Card */}
      <Panel className="p-6 bg-gradient-to-r from-indigo-900 to-zinc-900 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">360° EVALUATION</Badge>
              <span className="text-xs text-zinc-300 font-semibold">{selectedEmployee.department}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{selectedEmployee.name}</h2>
            <p className="text-xs text-zinc-400">{selectedEmployee.role}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-zinc-400 font-medium">Aggregated 360 Score</p>
              <p className="text-3xl font-black text-indigo-400">{selectedEmployee.finalScore} / 5.0</p>
            </div>
            <Badge tone="success">
              {selectedEmployee.ratingLabel.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
      </Panel>

      {/* Rater Weightage Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {raterBreakdown.map((r) => (
          <Panel key={r.raterType} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{r.raterType.replace(/_/g, " ")}</span>
              <span className="text-xs font-bold text-indigo-600">Weight {r.weight}</span>
            </div>
            <p className="text-2xl font-black text-zinc-900 mt-2">{r.score} <span className="text-xs font-normal text-zinc-400">/ 5</span></p>
            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 italic">"{r.feedback}"</p>
          </Panel>
        ))}
      </div>

      {/* Competency Gap Analysis Table */}
      <Panel className="p-6">
        <h3 className="font-semibold text-zinc-900">Competency Framework Evaluation</h3>
        <p className="text-xs text-zinc-500">Multi-rater comparison across core behavioral and technical competencies</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-600">
              <tr>
                <th className="p-3">Competency</th>
                <th className="p-3 text-center">Self (20%)</th>
                <th className="p-3 text-center">Manager (40%)</th>
                <th className="p-3 text-center">Peer (20%)</th>
                <th className="p-3 text-center">Benchmark</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {competencyScores.map((c) => (
                <tr key={c.name} className="hover:bg-zinc-50/60">
                  <td className="p-3 font-semibold text-zinc-900">{c.name}</td>
                  <td className="p-3 text-center text-zinc-600">{c.self}</td>
                  <td className="p-3 text-center font-bold text-indigo-600">{c.manager}</td>
                  <td className="p-3 text-center text-zinc-600">{c.peer}</td>
                  <td className="p-3 text-center text-zinc-400">{c.benchmark}</td>
                  <td className="p-3 text-right">
                    <Badge tone="success">Exceeds Benchmark</Badge>
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
