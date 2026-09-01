"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Panel } from "../../../../components/ui";

export default function EmployeeBadgesPage() {
  const [badges] = useState([
    {
      id: "b-1",
      name: "Innovation Star",
      icon: "🌟",
      category: "INNOVATOR",
      earnedAt: "Aug 15, 2026",
      reason: "Submitted an accepted process improvement idea for automated OCR expense filing.",
      pointsValue: 100,
      unlocked: true
    },
    {
      id: "b-2",
      name: "Values Champion",
      icon: "💎",
      category: "CORE_VALUES",
      earnedAt: "Jul 22, 2026",
      reason: "Demonstrated exemplary commitment to organizational transparency and integrity.",
      pointsValue: 150,
      unlocked: true
    },
    {
      id: "b-3",
      name: "Team Player Legend",
      icon: "🤝",
      category: "TEAM_PLAYER",
      earnedAt: "Jun 10, 2026",
      reason: "Received 10+ peer appreciation kudos in a single quarter.",
      pointsValue: 100,
      unlocked: true
    },
    {
      id: "b-4",
      name: "Culture Icon Pillar",
      icon: "👑",
      category: "LEADERSHIP",
      earnedAt: "In Progress (4,800 / 10,000 Pts)",
      reason: "Attain 10,000 lifetime reward points and mentor 5 new team members.",
      pointsValue: 500,
      unlocked: false
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏅 My Achievements & Badges</h1>
          <p className="text-sm text-slate-600">
            Gamified badges and milestones unlocked through peer recognitions, hackathons, and culture contributions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg font-mono">
          <span className="text-xs font-sans text-slate-600">Current Level:</span>
          <span className="text-base font-bold text-primary">Level 4: Culture Champion</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {badges.map((b) => (
          <Panel
            key={b.id}
            className={`p-5 flex items-start gap-4 border-l-4 ${
              b.unlocked ? "border-l-emerald-500" : "border-l-slate-300 opacity-75"
            }`}
          >
            <span className="text-4xl">{b.icon}</span>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">{b.name}</h2>
                <Badge tone={b.unlocked ? "success" : "neutral"}>
                  {b.unlocked ? "UNLOCKED" : "LOCKED"}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">{b.reason}</p>
              <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-500">
                <span>Value: +{b.pointsValue} Pts</span>
                <span>{b.earnedAt}</span>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
