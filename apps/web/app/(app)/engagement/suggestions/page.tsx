"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeSuggestionsPage() {
  const [suggestions] = useState([
    {
      id: "sug-1",
      title: "Introduce Electric Vehicle (EV) Charging Stations in Parking Bay",
      author: "Kavita Nair",
      category: "SUSTAINABILITY",
      upvotes: 48,
      status: "ACCEPTED",
      feedback: "Approved by Facilities Management. 4 charging points scheduled for installation in Q4 2026.",
      points: 250
    },
    {
      id: "sug-2",
      title: "Implement Flexible Friday Work-from-Home Policy for Operations Support",
      author: "Anonymous",
      category: "WORKPLACE_CULTURE",
      upvotes: 35,
      status: "UNDER_REVIEW",
      feedback: "Currently under evaluation with department heads.",
      points: 0
    },
    {
      id: "sug-3",
      title: "Automate Expense Receipt Scanning with OCR on Mobile ESS",
      author: "Tanmay Deshmukh",
      category: "TECH_INNOVATION",
      upvotes: 62,
      status: "IMPLEMENTED",
      feedback: "Implemented in Task 23 Finance & Travel platform release!",
      points: 500
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">💡 Employee Suggestion Box & Ideas</h1>
          <p className="text-sm text-slate-600">
            Submit ideas for workplace, safety, sustainability, and process enhancements. Earn points when your idea is accepted!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Submit New Idea</Button>
        </div>
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-4">
        {suggestions.map((s) => (
          <Panel key={s.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{s.category}</Badge>
                  <Badge
                    tone={
                      s.status === "IMPLEMENTED" || s.status === "ACCEPTED"
                        ? "success"
                        : "warning"
                    }
                  >
                    {s.status}
                  </Badge>
                  {s.points > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      +{s.points} Pts Awarded
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
                <span className="text-xs text-slate-500">Proposed by: {s.author}</span>
              </div>

              <button className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50 hover:border-primary hover:text-primary transition">
                <span className="text-base">▲</span>
                <span className="text-xs font-bold font-mono">{s.upvotes}</span>
              </button>
            </div>

            {s.feedback && (
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="font-bold text-slate-900">Leadership Update: </span>
                {s.feedback}
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
