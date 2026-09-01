"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function FacilityBookingsPage() {
  const [selectedDate, setSelectedDate] = useState("2026-09-01");

  const [bookings] = useState([
    {
      id: "b-1",
      room: "Aryabhata Conference Hall",
      title: "Q3 Sprint Planning & Architecture Review",
      organizer: "Aarav Sharma (Engineering)",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      attendees: 16,
      status: "BOOKED"
    },
    {
      id: "b-2",
      room: "Chanakya Executive Boardroom",
      title: "Investor Update & Monthly Financials",
      organizer: "Priya Menon (Finance)",
      startTime: "02:00 PM",
      endTime: "03:30 PM",
      attendees: 8,
      status: "BOOKED"
    },
    {
      id: "b-3",
      room: "Aryabhata Conference Hall",
      title: "All-Hands Product Showcase",
      organizer: "Meera Nair (Design)",
      startTime: "04:00 PM",
      endTime: "05:00 PM",
      attendees: 22,
      status: "BOOKED"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📅 Meeting Room Reservations & Schedule</h1>
          <p className="text-sm text-slate-600">
            Real-time calendar view, room availability, and conflict-free booking scheduler.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/facilities" as Route}>
            <Button variant="secondary">🏢 Facilities</Button>
          </Link>
          <Button variant="primary">+ Book a Meeting Room</Button>
        </div>
      </div>

      {/* Date Picker Bar */}
      <Panel className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900">Selected Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
          <div className="text-xs text-slate-500">Showing 3 confirmed reservations</div>
        </div>
      </Panel>

      {/* Bookings List */}
      <div className="space-y-3">
        {bookings.map((b) => (
          <Panel key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {b.startTime} - {b.endTime}
                </span>
                <span className="text-xs font-semibold text-slate-600">• {b.room}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
              <p className="text-xs text-slate-500">
                Organized by <span className="font-medium text-slate-700">{b.organizer}</span> • {b.attendees} Attendees
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="success">{b.status}</Badge>
              <Button variant="secondary">Cancel</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
