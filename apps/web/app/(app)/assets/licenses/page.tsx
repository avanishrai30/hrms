"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function SoftwareLicensesPage() {
  const [licenses] = useState([
    {
      id: "lic-1",
      name: "Microsoft 365 Business Premium",
      publisher: "Microsoft",
      type: "SEAT_BASED",
      totalSeats: 100,
      usedSeats: 88,
      costPerSeat: 1850,
      totalAnnualCost: "₹22,20,000",
      renewalDate: "2026-11-15",
      daysToExpiry: 75
    },
    {
      id: "lic-2",
      name: "Google Workspace Enterprise Plus",
      publisher: "Google Cloud",
      type: "USER_BASED",
      totalSeats: 50,
      usedSeats: 48,
      costPerSeat: 2100,
      totalAnnualCost: "₹12,60,000",
      renewalDate: "2026-09-30",
      daysToExpiry: 29
    },
    {
      id: "lic-3",
      name: "Adobe Creative Cloud All Apps",
      publisher: "Adobe Systems",
      type: "SEAT_BASED",
      totalSeats: 15,
      usedSeats: 14,
      costPerSeat: 4500,
      totalAnnualCost: "₹8,10,000",
      renewalDate: "2027-02-28",
      daysToExpiry: 180
    },
    {
      id: "lic-4",
      name: "CrowdStrike Falcon Enterprise EDR",
      publisher: "CrowdStrike Inc",
      type: "DEVICE_BASED",
      totalSeats: 150,
      usedSeats: 110,
      costPerSeat: 1200,
      totalAnnualCost: "₹21,60,000",
      renewalDate: "2026-12-31",
      daysToExpiry: 121
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔑 Software License & SaaS Management</h1>
          <p className="text-sm text-slate-600">
            Monitor seat allocations, cloud subscription renewals, cost optimization, and compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">💻 Asset Register</Button>
          </Link>
          <Button variant="primary">+ Add SaaS / License</Button>
        </div>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Licenses</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{licenses.length} Suites</p>
          <p className="mt-1 text-xs text-slate-500">315 Total Seats Purchased</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Overall Seat Utilization</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">82.5%</p>
          <p className="mt-1 text-xs text-emerald-600">260 / 315 Seats Assigned</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Upcoming Renewal</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">29 Days</p>
          <p className="mt-1 text-xs text-amber-600">Google Workspace Enterprise</p>
        </Panel>
      </div>

      {/* Licenses List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {licenses.map((lic) => {
          const utilPct = Math.round((lic.usedSeats / lic.totalSeats) * 100);
          const isNearExpiry = lic.daysToExpiry <= 30;
          return (
            <Panel key={lic.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{lic.name}</h3>
                  <p className="text-xs text-slate-500">{lic.publisher} • {lic.type}</p>
                </div>
                <Badge tone={isNearExpiry ? "warning" : "success"}>
                  {isNearExpiry ? `Renews in ${lic.daysToExpiry}d` : "Active"}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>Seats: {lic.usedSeats} / {lic.totalSeats} Assigned</span>
                  <span>{utilPct}% Utilized</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      utilPct >= 95
                        ? "bg-amber-500"
                        : utilPct >= 70
                        ? "bg-emerald-600"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${utilPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500">Cost / Seat:</span>{" "}
                  <span className="font-semibold text-slate-900">₹{lic.costPerSeat}/mo</span>
                </div>
                <div>
                  <span className="text-slate-500">Annual Outlay:</span>{" "}
                  <span className="font-semibold text-slate-900">{lic.totalAnnualCost}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary">View Employees</Button>
                <Button variant="secondary">Assign Seat</Button>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
