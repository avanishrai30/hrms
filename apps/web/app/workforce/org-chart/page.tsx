"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function OrgChartPage() {
  const [metrics] = useState({
    totalNodes: 240,
    totalManagers: 28,
    maxLayers: 5,
    avgSpanOfControl: 7.6,
    managerRatio: "1 : 7.6",
    complexityScore: 4.8
  });

  const [topSpans] = useState([
    { manager: "Rajesh Varma (VP Operations)", title: "VP Operations", reports: 14, dept: "Warehouse" },
    { manager: "Pooja Hegde (Engineering Director)", title: "Director", reports: 11, dept: "Engineering" },
    { manager: "Ananya Iyer (Head of Quality)", title: "QA Head", reports: 8, dept: "Quality" }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🌲 Corporate Hierarchy & Span of Control</h1>
          <p className="text-sm text-slate-600">
            Interactive organizational structure, manager-to-IC ratios, organizational depth layers, and restructuring models.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/org-design" as Route}>
            <Button variant="secondary">🛠️ Org Restructure Sandbox</Button>
          </Link>
        </div>
      </div>

      {/* Org Health Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hierarchy Depth</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.maxLayers} Layers</div>
          <div className="mt-1 text-xs text-slate-600">CEO → VP → Dir → Mgr → IC</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Span of Control</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{metrics.avgSpanOfControl} Directs</div>
          <div className="mt-1 text-xs text-slate-600">Optimal span: 6-9 directs</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Manager to IC Ratio</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{metrics.managerRatio}</div>
          <div className="mt-1 text-xs text-slate-600">{metrics.totalManagers} People Managers</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Org Complexity Index</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{metrics.complexityScore} / 10</div>
          <div className="mt-1 text-xs text-slate-600">Low structural friction</div>
        </Panel>
      </div>

      {/* Visual Org Tree Mockup */}
      <Panel className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Executive Leadership Tree</h2>
          <Badge tone="success">ACTIVE HIERARCHY</Badge>
        </div>

        {/* Level 1: CEO */}
        <div className="flex flex-col items-center">
          <div className="w-64 rounded-xl border-2 border-primary bg-primary/5 p-4 text-center shadow-sm">
            <div className="font-bold text-slate-900 text-sm">Vikramaditya Chauhan</div>
            <div className="text-xs text-primary font-semibold">Chief Executive Officer (L8)</div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono">6 Direct Reports</div>
          </div>
          <div className="h-6 w-0.5 bg-slate-300 my-1"></div>

          {/* Level 2: C-Suite & VPs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full pt-2">
            <div className="rounded-xl border border-slate-200 bg-surface p-4 text-center">
              <div className="font-bold text-slate-900 text-xs">Pooja Hegde</div>
              <div className="text-[11px] text-slate-600 font-medium">VP of Engineering (L7)</div>
              <div className="mt-1 text-[10px] text-slate-400 font-mono">45 Total Org Headcount</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-surface p-4 text-center">
              <div className="font-bold text-slate-900 text-xs">Rajesh Varma</div>
              <div className="text-[11px] text-slate-600 font-medium">VP Warehouse & Supply Chain (L7)</div>
              <div className="mt-1 text-[10px] text-slate-400 font-mono">120 Total Org Headcount</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-surface p-4 text-center">
              <div className="font-bold text-slate-900 text-xs">Neha Sen</div>
              <div className="text-[11px] text-slate-600 font-medium">Chief Human Resources Officer (L7)</div>
              <div className="mt-1 text-[10px] text-slate-400 font-mono">15 Total Org Headcount</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Top Spans */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Widest Manager Spans of Control</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Manager Name</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4">Direct Reports</th>
                <th className="py-3 px-4">Span Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topSpans.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.manager}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{s.title} · {s.dept}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.reports} Direct Reports</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={s.reports > 12 ? "warning" : "success"}>
                      {s.reports > 12 ? "HIGH LOAD (CONSIDER SUB-LEAD)" : "OPTIMAL"}
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
