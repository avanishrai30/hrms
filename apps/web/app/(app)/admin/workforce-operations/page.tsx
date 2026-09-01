"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function WorkforceOperationsAdminPage() {
  const [contractors] = useState([
    {
      vendor: "Apex Security & Facility Services",
      contractor: "Sunil Shinde",
      code: "CONT-088",
      site: "Main Plant Gate 1",
      checkIn: "06:00 AM",
      checkOut: "02:30 PM",
      hours: 8.5,
      rate: "₹120/hr",
      cost: "₹1,020",
      status: "PRESENT"
    },
    {
      vendor: "Express Cold-Chain Logistics",
      contractor: "Anil Jadhav",
      code: "CONT-114",
      site: "Cold Storage Dock 3",
      checkIn: "08:00 AM",
      checkOut: "04:30 PM",
      hours: 8.5,
      rate: "₹150/hr",
      cost: "₹1,275",
      status: "PRESENT"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/attendance/command-center" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Attendance Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⚙️ Contractor & Workforce Operations Hub</h1>
          <p className="text-sm text-slate-600">
            Contract workforce gate attendance, vendor billing calculations, shift coverage rules, and plant operations dispatch.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Log Contractor Punch</Button>
        </div>
      </div>

      {/* Contractor Attendances */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Contractor Muster Roll & Hourly Wage Cost ({contractors.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Contractor & Code</th>
                <th className="py-3 px-4">Staffing Agency / Vendor</th>
                <th className="py-3 px-4">Site Location</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Hours & Rate</th>
                <th className="py-3 px-4">Daily Wage Bill</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contractors.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{c.contractor}</div>
                    <div className="font-mono text-xs text-slate-500">{c.code}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{c.vendor}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{c.site}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-900">
                    {c.checkIn} - {c.checkOut}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <span className="font-bold text-slate-900">{c.hours} hrs</span> · <span className="text-primary font-bold">{c.rate}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{c.cost}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
