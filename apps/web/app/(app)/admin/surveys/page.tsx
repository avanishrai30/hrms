"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function AdminSurveysPage() {
  const [surveys] = useState([
    {
      id: "surv-1",
      title: "Annual Employee Engagement & Culture Survey 2026",
      surveyType: "ANNUAL_ENGAGEMENT",
      invited: 250,
      responded: 198,
      participation: "79.2%",
      score: "82.4 / 100",
      status: "ACTIVE",
      created: "Aug 01, 2026"
    },
    {
      id: "surv-2",
      title: "Workplace Psychological Safety & Culture Audit",
      surveyType: "CULTURE",
      invited: 250,
      responded: 215,
      participation: "86.0%",
      score: "88.1 / 100",
      status: "CLOSED",
      created: "May 15, 2026"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📝 Survey Management & Question Engine</h1>
          <p className="text-sm text-slate-600">
            Design, schedule, and analyze anonymous workforce engagement, onboarding, and exit surveys.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Create Survey</Button>
        </div>
      </div>

      {/* Survey List */}
      <Panel className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-sans">Survey Title</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Invited</th>
                <th className="py-2.5 px-3">Responded</th>
                <th className="py-2.5 px-3">Participation</th>
                <th className="py-2.5 px-3">Avg Score</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {surveys.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">{s.title}</td>
                  <td className="py-3 px-3 text-xs">{s.surveyType}</td>
                  <td className="py-3 px-3">{s.invited}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{s.responded}</td>
                  <td className="py-3 px-3 text-emerald-600 font-bold">{s.participation}</td>
                  <td className="py-3 px-3 font-bold text-primary">{s.score}</td>
                  <td className="py-3 px-3">
                    <Badge tone={s.status === "ACTIVE" ? "success" : "neutral"}>
                      {s.status}
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
