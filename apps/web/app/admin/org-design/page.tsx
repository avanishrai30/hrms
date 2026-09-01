"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function OrgDesignPage() {
  const [showModal, setShowModal] = useState(false);
  const [versionName, setVersionName] = useState("");

  const [versions] = useState([
    {
      id: "v-1",
      name: "Q3 2026 Production Baseline Hierarchy",
      status: "ACTIVE",
      effectiveDate: "Jul 01, 2026",
      nodes: 240,
      layers: 5,
      avgSpan: 7.6,
      complexity: 4.8
    },
    {
      id: "v-2",
      name: "2027 Proposed Tier-2 Plant Realignment",
      status: "DRAFT",
      effectiveDate: "Jan 01, 2027",
      nodes: 275,
      layers: 5,
      avgSpan: 8.1,
      complexity: 5.1
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛠️ Organization Design & Restructuring Sandbox</h1>
          <p className="text-sm text-slate-600">
            Model restructuring scenarios, simulate reporting changes, calculate organizational friction, and save immutable snapshot versions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Snapshot Org Version
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Snapshot New Org Structure Version</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Version Name / Restructure Title">
              <Input placeholder="e.g. FY27 Supply Chain Realignment" value={versionName} onChange={(e) => setVersionName(e.target.value)} />
            </Field>
            <Field label="Effective Target Date">
              <Input type="date" defaultValue="2027-01-01" />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save Snapshot Version
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Versions Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Saved Org Structure Versions & Simulation Snapshots</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Version Name</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Nodes (Headcount)</th>
                <th className="py-3 px-4">Max Layers</th>
                <th className="py-3 px-4">Avg Span of Control</th>
                <th className="py-3 px-4">Complexity Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{v.name}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{v.effectiveDate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{v.nodes} Nodes</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{v.layers} Layers</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{v.avgSpan} Directs</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{v.complexity} / 10</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={v.status === "ACTIVE" ? "success" : "neutral"}>{v.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Inspect Model</Button>
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
