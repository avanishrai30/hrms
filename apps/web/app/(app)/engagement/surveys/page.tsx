"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeSurveysPage() {
  const [surveys] = useState([
    {
      id: "surv-1",
      title: "Annual Employee Engagement & Culture Survey 2026",
      type: "ANNUAL_ENGAGEMENT",
      questionsCount: 15,
      timeEstimate: "5 mins",
      isAnonymous: true,
      deadline: "Sep 30, 2026",
      status: "OPEN"
    },
    {
      id: "surv-2",
      title: "Remote & Hybrid Work Experience Survey",
      type: "CULTURE",
      questionsCount: 8,
      timeEstimate: "3 mins",
      isAnonymous: true,
      deadline: "Oct 15, 2026",
      status: "OPEN"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/engagement" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Engagement Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📝 Active Engagement Surveys</h1>
          <p className="text-sm text-slate-600">
            Confidential and anonymous surveys to help leadership continually improve organizational culture, leadership, and benefits.
          </p>
        </div>
      </div>

      {/* Survey Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {surveys.map((s) => (
          <Panel key={s.id} className="p-6 space-y-4 border-l-4 border-l-primary flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge tone="success">100% ANONYMOUS</Badge>
                <span className="text-xs font-mono text-slate-500 font-bold">⏱️ {s.timeEstimate}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
              <p className="text-xs text-slate-600">
                Category: {s.type.replace("_", " ")} • {s.questionsCount} Questions • Deadline: {s.deadline}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button variant="primary">Start Survey →</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
