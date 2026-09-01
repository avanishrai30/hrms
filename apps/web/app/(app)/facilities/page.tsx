"use client";

import type { Route } from "next";
import Link from "next/link";
import { Button, Panel } from "../../../components/ui";

export default function FacilitiesManagementHubPage() {
  const facilityModules = [
    { title: "Meeting Rooms & Conference Bays", desc: "Real-time room occupancy, calendar bookings, AV equipment, and video conferencing.", href: "/meeting-rooms", icon: "🏢" },
    { title: "Parking Slot Allocations", desc: "Two-wheeler, four-wheeler, and EV charging slot reservations and vehicle passes.", href: "/parking", icon: "🚗" },
    { title: "Desks & Seating Layouts", desc: "Hot-desking allocations, departmental zones, and hybrid workspace seat bookings.", href: "/facilities/desks", icon: "💺" },
    { title: "Visitor Security Passes", desc: "Reception check-ins, guest badges, host notifications, and digital logs.", href: "/visitors", icon: "🎫" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facility & Workplace Services Cockpit</h1>
          <p className="text-sm text-muted-foreground">
            Manage physical office infrastructure, conference rooms, vehicle parking, seating layouts, and visitor check-ins.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/meeting-rooms" as Route}>
            <Button variant="secondary">Meeting Rooms</Button>
          </Link>
          <Link href={"/parking" as Route}>
            <Button variant="secondary">Parking</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilityModules.map((m) => (
          <Panel key={m.title} className="p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-3xl">{m.icon}</div>
              <h3 className="text-lg font-bold text-foreground">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
            <div className="pt-3">
              <Link href={m.href as Route}>
                <Button>Open Module</Button>
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
