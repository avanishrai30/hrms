"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function TrainingCalendarPage() {
  const [sessions] = useState([
    {
      id: "sess-1",
      title: "Warehouse Shift Safety & Fire Drill Live Workshop",
      course: "Workplace Fire Safety & Evacuation Protocols",
      instructor: "Rajesh Kumar (Safety Lead)",
      date: "Sep 08, 2026",
      time: "10:00 AM - 11:30 AM",
      type: "CLASSROOM",
      location: "Warehouse Unit 2 Training Room",
      seatsRemaining: 6,
      isRegistered: true
    },
    {
      id: "sess-2",
      title: "Distributed Transaction Management Masterclass",
      course: "Distributed Systems Architecture with PostgreSQL",
      instructor: "Aarav Sharma (Staff Architect)",
      date: "Sep 12, 2026",
      time: "03:00 PM - 05:00 PM",
      type: "VIRTUAL_CLASSROOM",
      location: "Google Meet Link Attached",
      seatsRemaining: 18,
      isRegistered: false
    },
    {
      id: "sess-3",
      title: "POSH Interactive Q&A and Case Study Review",
      course: "Prevention of Sexual Harassment (POSH) 2026 Refresher",
      instructor: "Adv. Sunita Verma (External Legal Counsel)",
      date: "Sep 18, 2026",
      time: "02:00 PM - 03:30 PM",
      type: "VIRTUAL_CLASSROOM",
      location: "MS Teams Broadcast",
      seatsRemaining: 45,
      isRegistered: true
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/learning" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Learning Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🗓️ Live Training Calendar & Instructor Workshops</h1>
          <p className="text-sm text-slate-600">
            Join instructor-led virtual classrooms, register for physical workshops, and add sessions to your calendar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">📅 Export .ICS Calendar</Button>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-4">
        {sessions.map((s) => (
          <Panel key={s.id} className="p-5 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase">{s.type.replace(/_/g, " ")}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{s.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Instructor: {s.instructor} · Course: {s.course}</p>
              </div>
              <Badge tone={s.isRegistered ? "success" : "neutral"}>
                {s.isRegistered ? "REGISTERED" : `${s.seatsRemaining} SEATS LEFT`}
              </Badge>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-bold text-slate-900">🕒 {s.date}</span> · <span className="font-medium text-slate-600">{s.time}</span>
              </div>
              <div className="text-slate-600 font-medium">
                📍 {s.location}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Attendance automatically syncs to LMS training record.</span>
              <Button variant={s.isRegistered ? "secondary" : "primary"}>
                {s.isRegistered ? "Join Session Room ↗" : "Register Seat"}
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
