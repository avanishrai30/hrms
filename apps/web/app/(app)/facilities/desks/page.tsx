"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function DeskAllocationPage() {
  const [selectedFloor, setSelectedFloor] = useState("Floor 4");

  const [desks] = useState([
    { id: "d-1", number: "F4-Z1-01", floor: "Floor 4", zone: "Zone A (Engineering)", type: "DEDICATED", occupant: "Aarav Sharma", isOccupied: true },
    { id: "d-2", number: "F4-Z1-02", floor: "Floor 4", zone: "Zone A (Engineering)", type: "DEDICATED", occupant: "Karan Patel", isOccupied: true },
    { id: "d-3", number: "F4-Z1-03", floor: "Floor 4", zone: "Zone A (Engineering)", type: "HOT_DESK", occupant: null, isOccupied: false },
    { id: "d-4", number: "F4-Z1-04", floor: "Floor 4", zone: "Zone A (Engineering)", type: "HOT_DESK", occupant: null, isOccupied: false },
    { id: "d-5", number: "F4-Z2-01", floor: "Floor 4", zone: "Zone B (Product & Design)", type: "DEDICATED", occupant: "Meera Nair", isOccupied: true },
    { id: "d-6", number: "F4-Z2-02", floor: "Floor 4", zone: "Zone B (Product & Design)", type: "HOT_DESK", occupant: null, isOccupied: false }
  ]);

  const occupiedCount = desks.filter((d) => d.isOccupied).length;
  const occupancyRate = Math.round((occupiedCount / desks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🪑 Workspace & Desk Management</h1>
          <p className="text-sm text-slate-600">
            Interactive floor mapping, hot-desking, dedicated seating allocations, and real-time occupancy.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/facilities" as Route}>
            <Button variant="secondary">🏢 Facilities</Button>
          </Link>
          <Button variant="primary">+ Allocate Desk</Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Workstations</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{desks.length} Desks</p>
          <p className="mt-1 text-xs text-slate-500">Floor 4 Tech Wing</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Floor Occupancy Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{occupancyRate}%</p>
          <p className="mt-1 text-xs text-emerald-600">{occupiedCount} Occupied / {desks.length - occupiedCount} Free</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Available Hot Desks</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{desks.filter((d) => d.type === "HOT_DESK" && !d.isOccupied).length} Desks</p>
          <p className="mt-1 text-xs text-blue-600">Open for daily check-in</p>
        </Panel>
      </div>

      {/* Floor Filter */}
      <Panel className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Select Floor:</span>
          {["Floor 3 (Operations)", "Floor 4", "Floor 5 (Executive)"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFloor(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedFloor === f
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Panel>

      {/* Visual Desk Grid Map */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">🗺️ Floor 4 Interactive Seat Grid</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {desks.map((desk) => (
            <Panel
              key={desk.id}
              className={`p-4 border-2 transition-all ${
                desk.isOccupied
                  ? "border-slate-200 bg-slate-50/70"
                  : "border-dashed border-emerald-300 bg-emerald-50/40 hover:border-emerald-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-slate-900">{desk.number}</span>
                <Badge tone={desk.isOccupied ? "neutral" : "success"}>
                  {desk.isOccupied ? "OCCUPIED" : "AVAILABLE"}
                </Badge>
              </div>

              <div className="mt-2 text-xs text-slate-500">{desk.zone}</div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Occupant</span>
                  <span className="text-xs font-bold text-slate-900">
                    {desk.occupant || "— (Hot Desk)"}
                  </span>
                </div>
                {!desk.isOccupied ? (
                  <Button variant="primary">Book Seat</Button>
                ) : (
                  <Button variant="secondary">View</Button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
