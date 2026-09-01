"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeRecognitionPage() {
  const [recognitions] = useState([
    {
      id: "rec-1",
      sender: "Rahul Sharma",
      senderRole: "Tech Lead",
      receiver: "Avanish Rai",
      receiverRole: "Senior Engineer",
      badge: "🌟 Innovation Star",
      type: "PEER_APPRECIATION",
      message: "Phenomenal work on optimizing the payroll processing engine and statutory tax modules!",
      points: 100,
      likes: 12,
      time: "2 hours ago"
    },
    {
      id: "rec-2",
      sender: "Priya Patel",
      senderRole: "Head of HR",
      receiver: "Ananya Iyer",
      receiverRole: "Product Designer",
      badge: "🤝 Customer Delight",
      type: "MANAGER_KUDOS",
      message: "Delivered flawless UX designs for the employee self-service experience hub.",
      points: 150,
      likes: 19,
      time: "5 hours ago"
    },
    {
      id: "rec-3",
      sender: "Vikram Mehta",
      senderRole: "Operations Lead",
      receiver: "Karan Verma",
      receiverRole: "Supply Chain Analyst",
      badge: "🚀 Team Player",
      type: "VALUES_CHAMPION",
      message: "Stepped in over the weekend to resolve a critical warehouse inventory discrepancy.",
      points: 75,
      likes: 8,
      time: "1 day ago"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏆 Kudos & Peer Recognition Wall</h1>
          <p className="text-sm text-slate-600">
            Celebrate wins, express gratitude, and award peer reward points aligned with company values.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">✨ Give Kudos (+Points)</Button>
        </div>
      </div>

      {/* Recognition Feed */}
      <div className="space-y-4">
        {recognitions.map((r) => (
          <Panel key={r.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  {r.sender.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {r.sender} <span className="font-normal text-slate-500">appreciated</span> {r.receiver}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{r.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="success">+{r.points} Pts</Badge>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {r.badge}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
              &quot;{r.message}&quot;
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button className="flex items-center gap-1 font-bold text-slate-600 hover:text-primary">
                ❤️ {r.likes} Cheers
              </button>
              <button className="text-slate-500 hover:text-slate-800">
                💬 Reply & Celebrate
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
