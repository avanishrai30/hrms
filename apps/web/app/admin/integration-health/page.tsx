"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function IntegrationHealthPage() {
  const healthChecks = [
    { service: "Google Workspace Directory Sync", type: "IdP / SCIM", status: "HEALTHY", latency: "120ms", uptime: "100%", lastCheck: "1 min ago" },
    { service: "Microsoft 365 Exchange Calendar", type: "Productivity", status: "HEALTHY", latency: "95ms", uptime: "99.98%", lastCheck: "2 mins ago" },
    { service: "Slack Interactive Webhook Bot", type: "Communication", status: "HEALTHY", latency: "45ms", uptime: "100%", lastCheck: "Just now" },
    { service: "Tally Prime ERP Database Connector", type: "Accounting", status: "HEALTHY", latency: "210ms", uptime: "99.85%", lastCheck: "5 mins ago" },
    { service: "Azure Active Directory SAML IdP", type: "Identity SSO", status: "HEALTHY", latency: "38ms", uptime: "100%", lastCheck: "Just now" },
    { service: "AWS S3 Document Vault Backup", type: "Storage", status: "HEALTHY", latency: "52ms", uptime: "100%", lastCheck: "3 mins ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/integrations" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Integrations Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🩺 Integration Health & Ecosystem Status</h1>
          <p className="text-sm text-slate-600">
            Continuous synthetic heartbeat probing, connection pooling metrics, and upstream API availability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">🔄 Refresh Probes</Button>
        </div>
      </div>

      {/* Global Status Banner */}
      <Panel className="border-l-4 border-l-emerald-500 bg-emerald-50/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <h2 className="font-bold text-slate-900">All External Connectors & Webhook Queues Operational</h2>
              <p className="text-xs text-slate-600">6 of 6 upstream connectors healthy with 0 open circuit breakers.</p>
            </div>
          </div>
          <Badge tone="success">99.98% OVERALL UPTIME</Badge>
        </div>
      </Panel>

      {/* Health Grid */}
      <Panel className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Connector Service</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Ping Latency</th>
                <th className="py-3 px-4">30-Day Uptime</th>
                <th className="py-3 px-4">Last Probe</th>
                <th className="py-3 px-4">Health State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {healthChecks.map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{h.service}</td>
                  <td className="py-3 px-4 text-xs">{h.type}</td>
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-emerald-700">{h.latency}</td>
                  <td className="py-3 px-4 font-mono text-xs">{h.uptime}</td>
                  <td className="py-3 px-4 text-xs">{h.lastCheck}</td>
                  <td className="py-3 px-4">
                    <Badge tone="success">{h.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="secondary">Diagnose</Button>
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
