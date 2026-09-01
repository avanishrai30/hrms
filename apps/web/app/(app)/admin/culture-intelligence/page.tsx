"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function ExecutiveCultureIntelligencePage() {
  const [aiInsights] = useState([
    {
      department: "Manufacturing & Plant Ops",
      health: "WATCH",
      riskSignals: [
        "Elevated shift overtime (>35h/mo) across 4 technicians",
        "Recent 0.3 point dip in weekly pulse energy scores"
      ],
      interventions: [
        "Mandate compensatory off-days for night shift staff",
        "Review machinery maintenance schedule to reduce emergency shift calls"
      ]
    },
    {
      department: "Engineering & R&D",
      health: "HEALTHY",
      riskSignals: ["High engagement (+54 eNPS) with top peer appreciation velocity"],
      interventions: ["Recognize sprint leaders and sustain weekly architecture knowledge sharing"]
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🧠 Executive Culture & Retention Intelligence Cockpit</h1>
          <p className="text-sm text-slate-600">
            C-Suite predictive analytics synthesizing engagement indices, flight risk signals, manager effectiveness, and sentiment trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">Export Board Report 📄</Button>
        </div>
      </div>

      {/* Executive Metric Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 font-mono">
        <Panel className="p-4 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Culture Health Index</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">84.5 / 100</div>
          <span className="text-xs font-sans text-emerald-600 font-medium">Grade A (Healthy)</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Corporate eNPS</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">+48.6</div>
          <span className="text-xs font-sans text-slate-500">Industry Top 10%</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Retention Health</span>
          <div className="mt-1 text-2xl font-bold text-blue-700">96.2%</div>
          <span className="text-xs font-sans text-emerald-600 font-medium">3.8% annual turnover</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Manager Score</span>
          <div className="mt-1 text-2xl font-bold text-purple-700">88.2 / 100</div>
          <span className="text-xs font-sans text-slate-500">Exemplary Tier</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Burnout Watch</span>
          <div className="mt-1 text-2xl font-bold text-amber-700">7 Staff</div>
          <span className="text-xs font-sans text-slate-500">Early prevention active</span>
        </Panel>
      </div>

      {/* AI Risk & Intervention Matrix */}
      <Panel className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">🤖 AI Predictive Culture Insights & Interventions</h2>
          <Badge tone="neutral">Auto-generated weekly</Badge>
        </div>

        <div className="space-y-4">
          {aiInsights.map((item) => (
            <div key={item.department} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{item.department}</h3>
                <Badge tone={item.health === "HEALTHY" ? "success" : "warning"}>
                  {item.health}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Detected Signals:</span>
                  <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                    {item.riskSignals.map((sig, idx) => (
                      <li key={idx}>{sig}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Prescribed Interventions:</span>
                  <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                    {item.interventions.map((intv, idx) => (
                      <li key={idx}>{intv}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
