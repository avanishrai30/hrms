"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function WebhooksPage() {
  const [showModal, setShowModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookName, setWebhookName] = useState("");

  const [webhooks] = useState([
    {
      id: "wh-1",
      name: "Slack Incident & Attendance Dispatcher",
      url: "https://hooks.slack.com/services/T00/B00/XXXX",
      events: ["attendance.corrected", "ticket.created", "leave.approved"],
      status: "ACTIVE",
      retryCount: 3,
      successRate: "99.9%",
      lastDelivered: "2 mins ago"
    },
    {
      id: "wh-2",
      name: "ERP Payroll Ingestion Endpoint",
      url: "https://erp.vcorganics.internal/api/webhooks/payroll",
      events: ["payroll.processed", "payroll.paid", "reimbursement.paid"],
      status: "ACTIVE",
      retryCount: 5,
      successRate: "100%",
      lastDelivered: "1 day ago"
    },
    {
      id: "wh-3",
      name: "Physical Access Control System (PACS)",
      url: "https://security.factory1.internal/sync/visitor",
      events: ["visitor.checked_in", "visitor.checked_out", "employee.created"],
      status: "ACTIVE",
      retryCount: 3,
      successRate: "98.7%",
      lastDelivered: "14 mins ago"
    }
  ]);

  const [supportedEvents] = useState([
    { category: "Employee", events: ["employee.created", "employee.updated", "employee.deleted"] },
    { category: "Attendance", events: ["attendance.created", "attendance.corrected"] },
    { category: "Leave", events: ["leave.approved", "leave.rejected"] },
    { category: "Payroll", events: ["payroll.processed", "payroll.paid"] },
    { category: "Finance", events: ["expense.approved", "reimbursement.paid"] },
    { category: "Recruitment", events: ["candidate.applied", "candidate.hired"] },
    { category: "Assets & ITSM", events: ["asset.assigned", "asset.returned", "ticket.created", "ticket.closed"] },
    { category: "Visitors", events: ["visitor.checked_in", "visitor.checked_out"] }
  ]);

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⚡ Enterprise Webhook Framework</h1>
          <p className="text-sm text-slate-600">
            Real-time event subscriptions with HMAC-SHA256 signature verification, exponential retry backoff, and dead-letter replay.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/webhook-monitoring" as Route}>
            <Button variant="secondary">📊 Webhook Delivery Logs</Button>
          </Link>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Add Webhook Endpoint
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-xl space-y-4 bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Register Webhook Endpoint</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Endpoint Friendly Name">
              <Input
                placeholder="e.g. AWS Lambda Event Consumer"
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
              />
            </Field>
            <Field label="HTTPS Target URL">
              <Input
                placeholder="https://api.yourdomain.com/webhooks/hr"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </Field>
            <div>
              <label className="text-sm font-medium text-slate-800">Select Subscribed Events</label>
              <div className="mt-2 space-y-3">
                {supportedEvents.map((cat) => (
                  <div key={cat.category} className="rounded border border-slate-200 p-2.5">
                    <span className="text-xs font-bold uppercase text-slate-500">{cat.category}</span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {cat.events.map((e) => (
                        <label key={e} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <input type="checkbox" defaultChecked />
                          <span className="font-mono">{e}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Register Endpoint
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Webhooks Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Configured Endpoints</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Endpoint Name</th>
                <th className="py-3 px-4">Target URL</th>
                <th className="py-3 px-4">Subscribed Events</th>
                <th className="py-3 px-4">Reliability</th>
                <th className="py-3 px-4">Last Trigger</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {webhooks.map((wh) => (
                <tr key={wh.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{wh.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 truncate max-w-xs">{wh.url}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span key={ev} className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-700">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-emerald-600">{wh.successRate}</td>
                  <td className="py-3 px-4 text-xs">{wh.lastDelivered}</td>
                  <td className="py-3 px-4">
                    <Badge tone="success">{wh.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="secondary">Test Ping</Button>
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
