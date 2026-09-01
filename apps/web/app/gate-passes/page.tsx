"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function GatePassesPage() {
  const [gatePasses] = useState([
    {
      id: "gp-1",
      passNumber: "GP-2026-00124",
      type: "MATERIAL_OUTWARD",
      item: "4x Server Blade Chassis for Datacenter Migration",
      quantity: 4,
      destination: "CtrlS Datacenter, Bangalore",
      requester: "Suresh DevOps",
      vehicle: "KA 01 EF 9012 (Bolero)",
      status: "APPROVED",
      managerApproved: true,
      securityCleared: false,
      returnExpected: false
    },
    {
      id: "gp-2",
      passNumber: "GP-2026-00125",
      type: "MATERIAL_OUTWARD",
      item: "Dell 32 Monitor for Warranty Service",
      quantity: 1,
      destination: "Dell Authorized Service Center",
      requester: "Rajesh IT",
      vehicle: "Courier Dispatch",
      status: "PENDING_APPROVAL",
      managerApproved: false,
      securityCleared: false,
      returnExpected: true
    },
    {
      id: "gp-3",
      passNumber: "GP-2026-00126",
      type: "CONTRACTOR_EXIT",
      item: "AC Technician Equipment & Gas Cylinders",
      quantity: 6,
      destination: "Voltas Service Depot",
      requester: "Ramesh Admin",
      vehicle: "KA 03 AA 1122",
      status: "COMPLETED",
      managerApproved: true,
      securityCleared: true,
      returnExpected: false
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🚪 Security Gate Pass System</h1>
          <p className="text-sm text-slate-600">
            Material Inward/Outward, contractor clearance, vehicle exit logging, and security sign-offs.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/visitors" as Route}>
            <Button variant="secondary">🛂 Visitors</Button>
          </Link>
          <Button variant="primary">+ Create Gate Pass</Button>
        </div>
      </div>

      {/* Gate Pass Workflow Overview */}
      <Panel className="p-4 bg-emerald-50/50 border border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-700 text-white rounded-lg text-lg">🛡️</div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">3-Step Security Sign-Off Protocol</h3>
            <p className="text-xs text-slate-600">
              1. Requester creates pass → 2. Reporting Manager verifies items → 3. Gate Security confirms vehicle and dispatches.
            </p>
          </div>
        </div>
      </Panel>

      {/* Passes Table */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Pass Number</th>
                <th className="p-4">Category Type</th>
                <th className="p-4">Item & Quantity</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Vehicle / Carrier</th>
                <th className="p-4">Manager Signoff</th>
                <th className="p-4">Security Signoff</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gatePasses.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900">{p.passNumber}</td>
                  <td className="p-4">
                    <Badge tone="neutral">{p.type}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{p.item}</div>
                    <div className="text-xs text-slate-500">{p.quantity} Unit(s) • {p.returnExpected ? "Returnable" : "Non-Returnable"}</div>
                  </td>
                  <td className="p-4 text-slate-700">{p.destination}</td>
                  <td className="p-4 text-slate-700 font-medium">{p.requester}</td>
                  <td className="p-4 font-mono text-xs text-slate-600">{p.vehicle}</td>
                  <td className="p-4">
                    <Badge tone={p.managerApproved ? "success" : "warning"}>
                      {p.managerApproved ? "APPROVED" : "PENDING"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge tone={p.securityCleared ? "success" : "neutral"}>
                      {p.securityCleared ? "CLEARED" : "WAITING"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge tone={p.status === "COMPLETED" ? "success" : p.status === "APPROVED" ? "neutral" : "warning"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="secondary">Signoff</Button>
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
