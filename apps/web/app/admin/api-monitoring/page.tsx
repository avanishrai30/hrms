"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function ApiMonitoringPage() {
  const recentLogs = [
    { method: "GET", path: "/api/v1/employees", status: 200, latency: "38ms", apiKey: "wms_live_a9F3 (Tally)", ip: "192.168.1.45", time: "Just now" },
    { method: "POST", path: "/api/v1/integrations/automation/run", status: 200, latency: "145ms", apiKey: "wms_live_44E1 (Mobile)", ip: "10.0.4.12", time: "1 min ago" },
    { method: "GET", path: "/api/v1/attendance", status: 200, latency: "42ms", apiKey: "wms_live_7Bc2 (Darwinbox)", ip: "172.16.0.8", time: "3 mins ago" },
    { method: "POST", path: "/api/v1/payroll/runs", status: 403, latency: "12ms", apiKey: "wms_live_7Bc2 (Darwinbox)", ip: "172.16.0.8", time: "12 mins ago" },
    { method: "GET", path: "/api/v1/compliance/reports", status: 200, latency: "88ms", apiKey: "wms_live_a9F3 (Tally)", ip: "192.168.1.45", time: "25 mins ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/integrations/api" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← API Management
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📈 API Gateway Usage & Rate Limiting Monitor</h1>
          <p className="text-sm text-slate-600">
            Real-time telemetry, p95/p99 latency percentiles, error rates, and per-token quota consumption.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">📥 Export Metrics</Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">24h Requests</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">84,920</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">↑ +14.2% vs yesterday</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Latency (p50)</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">42 ms</div>
          <div className="mt-1 text-xs text-slate-600">p95: 112ms · p99: 240ms</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Success Rate</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">99.98%</div>
          <div className="mt-1 text-xs text-slate-600">12 Client 4xx Errors · 0 5xx</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rate Limit Throttles</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">0 Throttles</div>
          <div className="mt-1 text-xs text-slate-600">Max client at 48% quota</div>
        </Panel>
      </div>

      {/* Live Request Stream */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Live Ingestion Access Log</h2>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Live Stream Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">API Token Source</th>
                <th className="py-3 px-4">Origin IP</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        log.method === "GET"
                          ? "bg-blue-50 text-blue-700"
                          : log.method === "POST"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-900">{log.path}</td>
                  <td className="py-3 px-4 font-mono text-xs">
                    <Badge tone={log.status === 200 ? "success" : "danger"}>{log.status}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-700">{log.latency}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">{log.apiKey}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">{log.ip}</td>
                  <td className="py-3 px-4 text-right text-xs text-slate-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
