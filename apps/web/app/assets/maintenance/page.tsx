"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function MaintenancePage() {
  const [expiryAlerts] = useState([
    {
      id: "exp-1",
      assetCode: "AST-2026-004",
      name: "ZKTeco Face & Palm Scanner",
      type: "AMC EXPOSURE",
      provider: "Matrix Biometrics Care",
      expiryDate: "2026-09-07",
      bucket: "7_DAYS",
      cost: "₹18,500/yr"
    },
    {
      id: "exp-2",
      assetCode: "AST-2025-088",
      name: "Fortinet FortiGate 100F Firewall",
      type: "OEM WARRANTY",
      provider: "Fortinet Networks India",
      expiryDate: "2026-09-28",
      bucket: "30_DAYS",
      cost: "Included"
    },
    {
      id: "exp-3",
      assetCode: "AST-2024-012",
      name: "Carrier 15 Ton Central VRF AC Unit",
      type: "AMC CONTRACT",
      provider: "Voltas Air Conditioning Ltd",
      expiryDate: "2026-10-25",
      bucket: "60_DAYS",
      cost: "₹65,000/yr"
    }
  ]);

  const [serviceLogs] = useState([
    {
      id: "m-1",
      assetCode: "AST-2026-001",
      name: 'MacBook Pro 16" M3 Max',
      serviceType: "PREVENTIVE",
      scheduledDate: "2026-08-20",
      status: "COMPLETED",
      cost: "₹0 (Warranty)",
      provider: "Apple Authorized Service Centre",
      notes: "Keyboard replacement & thermal re-pasting."
    },
    {
      id: "m-2",
      assetCode: "AST-2026-004",
      name: "ZKTeco Biometric Terminal",
      serviceType: "CORRECTIVE",
      scheduledDate: "2026-08-30",
      status: "IN_PROGRESS",
      cost: "₹4,200",
      provider: "Matrix Care",
      notes: "Optical sensor calibration error."
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🛠️ Asset Maintenance, AMC & Warranties</h1>
          <p className="text-sm text-slate-600">
            Proactive 90/60/30/7-day contract expiry alerts, repair history, and scheduled servicing.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">💻 Asset Register</Button>
          </Link>
          <Button variant="primary">+ Schedule Maintenance</Button>
        </div>
      </div>

      {/* Expiry Alerts Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>🔔 Upcoming AMC & Warranty Expiry Watchlist</span>
          <Badge tone="warning">3 Action Required</Badge>
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {expiryAlerts.map((alert) => (
            <Panel key={alert.id} className="p-4 border-l-4 border-l-amber-500 space-y-2">
              <div className="flex items-center justify-between">
                <Badge tone={alert.bucket === "7_DAYS" ? "danger" : "warning"}>
                  {alert.bucket === "7_DAYS" ? "Expires in 7 Days" : alert.bucket}
                </Badge>
                <span className="text-xs font-mono font-medium text-slate-500">{alert.assetCode}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{alert.name}</h3>
              <p className="text-xs text-slate-600">
                {alert.type} • {alert.provider}
              </p>
              <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-100">
                <span className="text-slate-500">Expiry: {alert.expiryDate}</span>
                <Button variant="secondary">Renew Contract</Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      {/* Service History Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">📋 Maintenance & Service Activity Log</h2>
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="p-4">Asset Code</th>
                  <th className="p-4">Equipment</th>
                  <th className="p-4">Maintenance Type</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Service Provider</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {serviceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-medium text-slate-900">{log.assetCode}</td>
                    <td className="p-4 font-semibold text-slate-900">{log.name}</td>
                    <td className="p-4">
                      <Badge tone="neutral">{log.serviceType}</Badge>
                    </td>
                    <td className="p-4 text-slate-700">{log.scheduledDate}</td>
                    <td className="p-4 text-slate-700">{log.provider}</td>
                    <td className="p-4 font-medium text-slate-900">{log.cost}</td>
                    <td className="p-4">
                      <Badge tone={log.status === "COMPLETED" ? "success" : "warning"}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-600 max-w-xs truncate">{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
