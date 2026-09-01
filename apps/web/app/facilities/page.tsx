"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function FacilitiesOverviewPage() {
  const [facilities] = useState([
    {
      id: "fac-1",
      name: "Aryabhata Conference Hall",
      type: "CONFERENCE_HALL",
      building: "Block A - Innovation Tower",
      floor: "4th Floor",
      capacity: 24,
      amenities: ["4K Dual Displays", "Polycom VC", "Whiteboard", "Wireless Mic"],
      status: "OCCUPIED",
      currentBooking: "Q3 Sprint Planning (10:00 - 12:00)"
    },
    {
      id: "fac-2",
      name: "Chanakya Executive Boardroom",
      type: "MEETING_ROOM",
      building: "Block A - Innovation Tower",
      floor: "5th Floor",
      capacity: 12,
      amenities: ["Cisco Webex Kit", "Glass Board", "Coffee Machine"],
      status: "AVAILABLE",
      currentBooking: null
    },
    {
      id: "fac-3",
      name: "Kalam Training Arena",
      type: "TRAINING_ROOM",
      building: "Block B - Operations Hub",
      floor: "2nd Floor",
      capacity: 40,
      amenities: ["Dual Projectors", "Surround Sound", "Trainer Podium"],
      status: "AVAILABLE",
      currentBooking: null
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏢 Facilities & Physical Workspaces</h1>
          <p className="text-sm text-slate-600">
            Meeting rooms, conference halls, hot desks, zones, and building infrastructure.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/facilities/desks" as Route}>
            <Button variant="secondary">🪑 Desk Allocations</Button>
          </Link>
          <Link href={"/facilities/bookings" as Route}>
            <Button variant="secondary">📅 Bookings Calendar</Button>
          </Link>
          <Button variant="primary">+ Add Facility Resource</Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rooms & Halls</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{facilities.length} Spaces</p>
          <p className="mt-1 text-xs text-slate-500">76 Total Seating Capacity</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Room Utilization</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">68.4%</p>
          <p className="mt-1 text-xs text-emerald-600">Peak hours: 10:00 AM - 04:00 PM</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Available Right Now</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">2 Rooms</p>
          <p className="mt-1 text-xs text-blue-600">Instant walk-in available</p>
        </Panel>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {facilities.map((fac) => (
          <Panel key={fac.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{fac.name}</h3>
                <p className="text-xs text-slate-500">{fac.building} • {fac.floor}</p>
              </div>
              <Badge tone={fac.status === "AVAILABLE" ? "success" : "warning"}>
                {fac.status}
              </Badge>
            </div>

            <div className="text-xs text-slate-700">
              <span className="font-semibold">Capacity:</span> {fac.capacity} People
            </div>

            {/* Amenities Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {fac.amenities.map((a) => (
                <span key={a} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {a}
                </span>
              ))}
            </div>

            {fac.currentBooking && (
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-900 font-medium">
                ⏳ {fac.currentBooking}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Link href={"/facilities/bookings" as Route}>
                <Button variant={fac.status === "AVAILABLE" ? "primary" : "secondary"}>
                  {fac.status === "AVAILABLE" ? "Book Room" : "View Schedule"}
                </Button>
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
