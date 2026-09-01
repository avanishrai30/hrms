"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function BenchStrengthPage() {
  const [benchPositions] = useState([
    {
      id: "b-1",
      title: "VP of Warehouse & Supply Chain Operations",
      totalSuccessors: 2,
      readyNow: 1,
      ready1Year: 1,
      avgReadiness: 85,
      ragStatus: "YELLOW",
      vacancyRisk: "MEDIUM",
      recommendation: "Accelerate IDP for pipeline candidate Sunil Patil to build ready-now redundancy."
    },
    {
      id: "b-2",
      title: "Principal Distributed Systems Architect",
      totalSuccessors: 2,
      readyNow: 1,
      ready1Year: 0,
      avgReadiness: 78,
      ragStatus: "YELLOW",
      vacancyRisk: "MEDIUM",
      recommendation: "Ready-now candidate Aarav Sharma has moderate flight risk. Review retention equity."
    },
    {
      id: "b-3",
      title: "Chief Financial Officer (CFO)",
      totalSuccessors: 0,
      readyNow: 0,
      ready1Year: 0,
      avgReadiness: 0,
      ragStatus: "RED",
      vacancyRisk: "CRITICAL",
      recommendation: "CRITICAL SUCCESSION GAP: Zero identified internal successors. Initiate executive talent search."
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛡️ Critical Role Bench Strength & RAG Matrix</h1>
          <p className="text-sm text-slate-600">
            Automated Red/Amber/Green vacancy risk analysis, ready-now successor coverage ratios, and emergency backup readiness.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/workforce/succession" as Route}>
            <Button variant="secondary">🗺️ Succession Pools</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Green (Strong Bench)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">6 Roles</div>
          <div className="mt-1 text-xs text-slate-600">2+ Ready-Now successors identified</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Yellow (Moderate Risk)</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">5 Roles</div>
          <div className="mt-1 text-xs text-slate-600">1 Ready-Now or multiple Ready in 1-Year</div>
        </Panel>
        <Panel className="border-l-4 border-l-rose-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Red (Critical Gap)</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">3 Roles</div>
          <div className="mt-1 text-xs text-slate-600">Zero Ready-Now successors; immediate action required</div>
        </Panel>
      </div>

      {/* Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Critical Position Bench Coverage Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Position Title</th>
                <th className="py-3 px-4">Total Pool</th>
                <th className="py-3 px-4">Ready Now</th>
                <th className="py-3 px-4">Ready in 1 Yr</th>
                <th className="py-3 px-4">RAG Status</th>
                <th className="py-3 px-4">Vacancy Risk</th>
                <th className="py-3 px-4">Strategic Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchPositions.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{b.title}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.totalSuccessors}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{b.readyNow}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{b.ready1Year}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={b.ragStatus === "GREEN" ? "success" : b.ragStatus === "YELLOW" ? "warning" : "danger"}>
                      {b.ragStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">{b.vacancyRisk}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs leading-relaxed">{b.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
