"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeChallengesPage() {
  const [challenges] = useState([
    {
      id: "chal-1",
      title: "AI Hackathon: Intelligent HR & Attendance Automation",
      theme: "Artificial Intelligence & Productivity",
      rewardPool: "25,000 Pts Pool",
      submissionsCount: 9,
      deadline: "Oct 10, 2026",
      status: "OPEN",
      desc: "Develop innovative AI agent workflows or automation bots to streamline employee lifecycle operations."
    },
    {
      id: "chal-2",
      title: "Green Campus & Sustainable Logistics Challenge",
      theme: "ESG & Carbon Reduction",
      rewardPool: "15,000 Pts Pool",
      submissionsCount: 6,
      deadline: "Oct 30, 2026",
      status: "OPEN",
      desc: "Propose actionable waste-reduction or green energy optimization programs across our facilities."
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🚀 Innovation Challenges & Hackathons</h1>
          <p className="text-sm text-slate-600">
            Collaborate in cross-functional teams, pitch transformative ideas, and win reward point pools and leadership recognition.
          </p>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {challenges.map((c) => (
          <Panel key={c.id} className="p-6 space-y-4 border-l-4 border-l-primary flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge tone="success">{c.status}</Badge>
                <span className="text-xs font-mono font-bold text-emerald-600">🏆 {c.rewardPool}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{c.title}</h2>
              <p className="text-xs font-mono text-slate-500">Theme: {c.theme}</p>
              <p className="text-xs text-slate-600">{c.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                {c.submissionsCount} Teams Pitched • Due {c.deadline}
              </span>
              <Button variant="primary">Submit Pitch 💡</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
