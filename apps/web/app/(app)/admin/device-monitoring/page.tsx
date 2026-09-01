"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function DeviceMonitoringAdminPage() {
  const [deviceStats] = useState({
    totalTerminals: 12,
    onlineTerminals: 11,
    offlineTerminals: 1,
    totalPunchesToday: 468,
    failedPunches: 2,
    syncEngineStatus: "OPTIMAL"
  });

  const [fleet] = useState([
    { name: "Warehouse Gate 1", vendor: "ESSL", ip: "192.168.10.45", ping: "14ms", status: "ONLINE" },
    { name: "Warehouse Gate 2", vendor: "ESSL", ip: "192.168.10.46", ping: "18ms", status: "ONLINE" },
    { name: "HQ Reception Kiosk", vendor: "ZKTECO", ip: "192.168.1.120", ping: "8ms", status: "ONLINE" },
    { name: "Packaging Floor Terminal", vendor: "SUPREMA", ip: "192.168.30.88", ping: "TIMEOUT", status: "OFFLINE" }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📟 Biometric Terminal Fleet & Sync Monitor</h1>
          <p className="text-sm text-slate-600">
            Real-time ping telemetry, offline terminal failover alerts, sync latency, and firmware health across hardware devices.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">🔄 Ping All Devices</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fleet Online Status</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{deviceStats.onlineTerminals} / {deviceStats.totalTerminals} Terminals</div>
          <div className="mt-1 text-xs text-slate-600">91.6% Fleet Availability</div>
        </Panel>
        <Panel className="border-l-4 border-l-rose-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Offline Device Alerts</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">{deviceStats.offlineTerminals} Terminal Offline</div>
          <div className="mt-1 text-xs text-slate-600">Packaging Floor Terminal (Suprema)</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sync Engine Health</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{deviceStats.syncEngineStatus}</div>
          <div className="mt-1 text-xs text-slate-600">Average punch sync latency: 120ms</div>
        </Panel>
      </div>

      {/* Fleet Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Hardware Fleet Live Status ({fleet.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Terminal Name</th>
                <th className="py-3 px-4">Protocol Vendor</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Ping Latency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fleet.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{f.name}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-700">{f.vendor}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{f.ip}</td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-primary">{f.ping}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={f.status === "ONLINE" ? "success" : "danger"}>{f.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Diagnostics</Button>
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
