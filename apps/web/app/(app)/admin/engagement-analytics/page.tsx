"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Panel } from "../../../../components/ui";

export default function AdminEngagementAnalyticsPage() {
  const [departments] = useState([
    { name: "Engineering & R&D", headcount: 65, participation: "88%", happiness: "4.4 / 5", enps: "+54", burnoutRisk: 1 },
    { name: "Manufacturing & Plant Ops", headcount: 95, participation: "76%", happiness: "4.1 / 5", enps: "+38", burnoutRisk: 4 },
    { name: "Supply Chain & Warehouse", headcount: 45, participation: "79%", happiness: "4.0 / 5", enps: "+35", burnoutRisk: 2 },
    { name: "Sales & Marketing", headcount: 30, participation: "84%", happiness: "4.3 / 5", enps: "+46", burnoutRisk: 0 },
    { name: "Finance & HR", headcount: 15, participation: "92%", happiness: "4.5 / 5", enps: "+60", burnoutRisk: 0 }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📈 Department Engagement & Morale Analytics</h1>
          <p className="text-sm text-slate-600">
            Compare survey response rates, happiness trends, eNPS scores, and burnout indicators across departments.
          </p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <Panel className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-sans">Department</th>
                <th className="py-2.5 px-3">Headcount</th>
                <th className="py-2.5 px-3">Participation</th>
                <th className="py-2.5 px-3">Happiness</th>
                <th className="py-2.5 px-3">eNPS</th>
                <th className="py-2.5 px-3">Burnout Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {departments.map((d) => (
                <tr key={d.name}>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">{d.name}</td>
                  <td className="py-3 px-3">{d.headcount}</td>
                  <td className="py-3 px-3 text-emerald-600 font-bold">{d.participation}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{d.happiness}</td>
                  <td className="py-3 px-3 font-bold text-primary">{d.enps}</td>
                  <td className="py-3 px-3">
                    <Badge tone={d.burnoutRisk > 2 ? "danger" : d.burnoutRisk > 0 ? "warning" : "success"}>
                      {d.burnoutRisk} Flagged
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
