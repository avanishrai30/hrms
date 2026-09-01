"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function InstructorsAdminPage() {
  const [instructors] = useState([
    {
      id: "inst-1",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@vcorganics.com",
      type: "INTERNAL",
      expertise: "Workplace Safety, Fire Drill, Emergency First-Aid",
      totalSessions: 18,
      rating: 4.9,
      status: "ACTIVE"
    },
    {
      id: "inst-2",
      name: "Adv. Sunita Verma",
      email: "sunita.legal@externalpartners.in",
      type: "EXTERNAL",
      expertise: "POSH Statutory Compliance & Labor Law Ethics",
      totalSessions: 12,
      rating: 4.8,
      status: "ACTIVE"
    },
    {
      id: "inst-3",
      name: "Aarav Sharma",
      email: "aarav.sharma@vcorganics.com",
      type: "INTERNAL",
      expertise: "Distributed Systems, PostgreSQL Performance Tuning",
      totalSessions: 8,
      rating: 4.95,
      status: "ACTIVE"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/training" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Training Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">👨‍🏫 Instructors, Trainers & Live Workshop Sessions</h1>
          <p className="text-sm text-slate-600">
            Manage internal and external instructors, track session feedback scores, and schedule live interactive workshops.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Add Instructor</Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((inst) => (
          <Panel key={inst.id} className="flex flex-col justify-between space-y-4 p-5">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{inst.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{inst.email}</span>
                </div>
                <Badge tone={inst.type === "INTERNAL" ? "success" : "neutral"}>{inst.type}</Badge>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                <div><span className="font-bold text-slate-900">Expertise:</span> {inst.expertise}</div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Delivered Sessions:</span>
                  <span className="font-mono font-bold text-slate-900">{inst.totalSessions} Sessions</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span className="font-bold">Average Rating:</span>
                  <span className="font-mono font-bold">★ {inst.rating} / 5.0</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary">Schedule Workshop</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
