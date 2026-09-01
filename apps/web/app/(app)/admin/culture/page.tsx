"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Panel } from "../../../../components/ui";

export default function AdminCulturePage() {
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🌱 Workplace Culture & Values Architecture</h1>
          <p className="text-sm text-slate-600">
            Define organizational core values, track psychological safety metrics, and align performance with culture.
          </p>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-5 space-y-2 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🤝</span>
            <Badge tone="success">92% ALIGNMENT</Badge>
          </div>
          <h2 className="text-base font-bold text-slate-900">Psychological Safety</h2>
          <p className="text-xs text-slate-600">
            Employees feel empowered to voice feedback, take calculated risks, and ask questions without fear of retribution.
          </p>
        </Panel>

        <Panel className="p-5 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-2xl">⚖️</span>
            <Badge tone="success">88% ALIGNMENT</Badge>
          </div>
          <h2 className="text-base font-bold text-slate-900">Work-Life Harmony</h2>
          <p className="text-xs text-slate-600">
            Enforced rest periods, shift swap flexibility, and structured overtime protection policies.
          </p>
        </Panel>

        <Panel className="p-5 space-y-2 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🎯</span>
            <Badge tone="success">95% ALIGNMENT</Badge>
          </div>
          <h2 className="text-base font-bold text-slate-900">Meritocracy & Recognition</h2>
          <p className="text-xs text-slate-600">
            Transparent performance appraisals, peer appreciation points, and values-based award celebrations.
          </p>
        </Panel>
      </div>
    </div>
  );
}
