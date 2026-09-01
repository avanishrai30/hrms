"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function SkillSupplyDemandPage() {
  const [skillForecasts] = useState([
    {
      id: "skf-1",
      skillName: "Distributed Systems & Multi-Tenant PostgreSQL",
      category: "Technical",
      currentSupply: 8,
      futureDemand: 18,
      gapCount: 10,
      deficitPercent: 55.6,
      horizon: "12 Months",
      strategy: "UPSKILL_INTERNAL",
      trainingTrack: "Distributed Systems Architecture Academy Track"
    },
    {
      id: "skf-2",
      skillName: "Automated Cold-Chain IoT Sensor Operations",
      category: "Operations",
      currentSupply: 12,
      futureDemand: 30,
      gapCount: 18,
      deficitPercent: 60.0,
      horizon: "6 Months",
      strategy: "EXTERNAL_HIRE",
      trainingTrack: "IoT Cold-Chain Warehouse Certification"
    },
    {
      id: "skf-3",
      skillName: "Good Manufacturing Practices (GMP) Hygiene",
      category: "Functional",
      currentSupply: 118,
      futureDemand: 125,
      gapCount: 7,
      deficitPercent: 5.6,
      horizon: "12 Months",
      strategy: "UPSKILL_INTERNAL",
      trainingTrack: "Annual GMP Refresher & SOPs"
    },
    {
      id: "skf-4",
      skillName: "Engineering People Leadership & 1:1 Coaching",
      category: "Leadership",
      currentSupply: 11,
      futureDemand: 18,
      gapCount: 7,
      deficitPercent: 38.9,
      horizon: "12 Months",
      strategy: "UPSKILL_INTERNAL",
      trainingTrack: "First-Time People Manager Track"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🧠 Strategic Skill Supply & Demand Forecasting</h1>
          <p className="text-sm text-slate-600">
            Compare current internal workforce competency pools against 6-24 month strategic business expansions to build or buy talent.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/catalog" as Route}>
            <Button variant="primary">📚 LMS Academy Tracks</Button>
          </Link>
        </div>
      </div>

      {/* Skill Forecast Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Workforce Skill Deficit Analysis ({skillForecasts.length} Critical Skills)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Skill & Category</th>
                <th className="py-3 px-4">Current Supply</th>
                <th className="py-3 px-4">Future Demand</th>
                <th className="py-3 px-4">Net Deficit</th>
                <th className="py-3 px-4">Horizon</th>
                <th className="py-3 px-4">Recommended Strategy</th>
                <th className="py-3 px-4">Training Bridge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillForecasts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{s.skillName}</div>
                    <div className="text-xs text-slate-500">{s.category}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.currentSupply} Proficient</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{s.futureDemand} Required</td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-rose-600">-{s.gapCount} ({s.deficitPercent}%)</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{s.horizon}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={s.strategy === "EXTERNAL_HIRE" ? "danger" : "success"}>
                      {s.strategy.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-primary">
                    {s.trainingTrack}
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
