"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function WebhookMonitoringPage() {
  const [deliveries] = useState([
    { id: "sub-901", event: "attendance.corrected", endpoint: "Slack Incident Bot", attempts: 1, status: "DELIVERED", lastError: null, time: "2 mins ago" },
    { id: "sub-902", event: "payroll.processed", endpoint: "ERP Ingestion API", attempts: 1, status: "DELIVERED", lastError: null, time: "1 hour ago" },
    { id: "sub-903", event: "visitor.checked_in", endpoint: "PACS Security Gate", attempts: 1, status: "DELIVERED", lastError: null, time: "3 hours ago" },
    { id: "sub-904", event: "leave.approved", endpoint: "Legacy Intranet Calendar", attempts: 3, status: "DEAD_LETTER", lastError: "HTTP 504 Gateway Timeout", time: "5 hours ago" }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/integrations/webhooks" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Webhooks Framework
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📊 Webhook Delivery Queue & Dead Letter Monitor</h1>
          <p className="text-sm text-slate-600">
            Real-time delivery status, exponential backoff tracking, dead-letter queue isolation, and manual event replay.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">🔄 Retry All Dead Letters</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Successful Deliveries (24h)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">1,842 Events</div>
          <div className="mt-1 text-xs text-slate-600">99.94% Delivery SLA</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Retries in Queue</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">0 In Flight</div>
          <div className="mt-1 text-xs text-slate-600">Exponential backoff up to 1 hr</div>
        </Panel>
        <Panel className="border-l-4 border-l-red-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dead-Letter Queue (DLQ)</div>
          <div className="mt-1 text-2xl font-bold text-red-600">1 Event</div>
          <div className="mt-1 text-xs text-slate-600">Requires manual payload replay</div>
        </Panel>
      </div>

      {/* Deliveries Table */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Webhook Deliveries</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Delivery ID</th>
                <th className="py-3 px-4">Subscribed Event</th>
                <th className="py-3 px-4">Endpoint Name</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Error / Response</th>
                <th className="py-3 px-4">Delivery State</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-800 font-bold">{d.id}</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-700">
                      {d.event}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{d.endpoint}</td>
                  <td className="py-3 px-4 font-mono text-xs">{d.attempts} / 3</td>
                  <td className="py-3 px-4 font-mono text-xs text-red-600">{d.lastError ?? "HTTP 200 OK"}</td>
                  <td className="py-3 px-4">
                    <Badge tone={d.status === "DELIVERED" ? "success" : "danger"}>{d.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs">{d.time}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="secondary">Replay Event</Button>
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
