"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function BiometricIntegrationPage() {
  const [punches] = useState([
    {
      id: "pch-1",
      device: "eSSL SilkBio-101 (WH Gate 1)",
      empCode: "EMP-001",
      empName: "Rajesh Kumar",
      punchTime: "05:54:12 AM",
      type: "CHECK_IN",
      mode: "FINGERPRINT",
      syncStatus: "SYNCED"
    },
    {
      id: "pch-2",
      device: "ZKTeco FaceDepot-7B (HQ Turnstile)",
      empCode: "EMP-042",
      empName: "Aarav Sharma",
      punchTime: "08:58:34 AM",
      type: "CHECK_IN",
      mode: "FACE",
      syncStatus: "SYNCED"
    },
    {
      id: "pch-3",
      device: "Matrix COSEC Vega (Processing Floor)",
      empCode: "EMP-109",
      empName: "Ramesh Pawar",
      punchTime: "02:05:11 PM",
      type: "CHECK_IN",
      mode: "CARD",
      syncStatus: "SYNCED"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📟 Biometric Punch Ingestion Stream</h1>
          <p className="text-sm text-slate-600">
            Real-time multi-protocol ingestion buffer, de-duplication window filtering, and attendance ledger synchronization.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/attendance/devices" as Route}>
            <Button variant="primary">⚙️ Manage Device Fleet</Button>
          </Link>
        </div>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Punches Processed (Today)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">468 Punches</div>
          <div className="mt-1 text-xs text-slate-600">0 dropped · 100% sync integrity</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">De-duplicated Glitches</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">14 Bounces Filtered</div>
          <div className="mt-1 text-xs text-slate-600">2-minute hardware debounce threshold</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Supported Device Protocols</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">4 Protocols</div>
          <div className="mt-1 text-xs text-slate-600">eSSL ADMS, ZKTeco Standalone, Matrix, Suprema</div>
        </Panel>
      </div>

      {/* Punches Stream */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Live Ingested Punch Stream</h2>
          <Badge tone="success">REAL-TIME INGESTION</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Terminal Device</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Punch Type</th>
                <th className="py-3 px-4">Biometric Mode</th>
                <th className="py-3 px-4">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {punches.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{p.device}</td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-semibold text-slate-900">{p.empName}</div>
                    <div className="font-mono text-slate-500">{p.empCode}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.punchTime}</td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-primary">{p.type}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="neutral">{p.mode}</Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{p.syncStatus}</Badge>
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
