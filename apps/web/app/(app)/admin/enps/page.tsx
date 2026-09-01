"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AdminENPSPage() {
  const [campaigns] = useState([
    {
      id: "enps-1",
      title: "Q3 2026 eNPS Campaign",
      quarter: "Q3",
      year: 2026,
      total: 185,
      promoters: 115,
      passives: 45,
      detractors: 25,
      score: "+48.6",
      status: "ACTIVE"
    },
    {
      id: "enps-2",
      title: "Q2 2026 eNPS Campaign",
      quarter: "Q2",
      year: 2026,
      total: 172,
      promoters: 98,
      passives: 48,
      detractors: 26,
      score: "+41.8",
      status: "CLOSED"
    },
    {
      id: "enps-3",
      title: "Q1 2026 eNPS Campaign",
      quarter: "Q1",
      year: 2026,
      total: 160,
      promoters: 85,
      passives: 47,
      detractors: 28,
      score: "+35.6",
      status: "CLOSED"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/engagement" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Engagement Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📊 Employee Net Promoter Score (eNPS) Engine</h1>
          <p className="text-sm text-slate-600">
            Track workforce advocacy, quarter-over-quarter NPS trajectory, and verbatim sentiment analysis.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Launch New Campaign</Button>
        </div>
      </div>

      {/* Campaigns Table */}
      <Panel className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-sans">Campaign</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Responses</th>
                <th className="py-2.5 px-3 text-emerald-600">Promoters (9-10)</th>
                <th className="py-2.5 px-3 text-amber-600">Passives (7-8)</th>
                <th className="py-2.5 px-3 text-rose-600">Detractors (0-6)</th>
                <th className="py-2.5 px-3">eNPS Score</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">{c.title}</td>
                  <td className="py-3 px-3">{c.quarter} {c.year}</td>
                  <td className="py-3 px-3">{c.total}</td>
                  <td className="py-3 px-3 text-emerald-600 font-bold">{c.promoters} ({Math.round((c.promoters/c.total)*100)}%)</td>
                  <td className="py-3 px-3 text-amber-600 font-bold">{c.passives} ({Math.round((c.passives/c.total)*100)}%)</td>
                  <td className="py-3 px-3 text-rose-600 font-bold">{c.detractors} ({Math.round((c.detractors/c.total)*100)}%)</td>
                  <td className="py-3 px-3 text-base font-bold text-primary">{c.score}</td>
                  <td className="py-3 px-3">
                    <Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>
                      {c.status}
                    </Badge>
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
