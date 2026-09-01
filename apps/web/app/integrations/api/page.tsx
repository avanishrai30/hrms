"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function ApiManagementPage() {
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [rateLimit, setRateLimit] = useState("120");

  const [apiKeys] = useState([
    {
      id: "k-1",
      name: "Tally ERP Connector Key",
      prefix: "wms_live_a9F3",
      scopes: ["payroll.read", "journal.write", "employees.read"],
      rateLimitPerMinute: 300,
      createdAt: "2026-08-15",
      lastUsedAt: "5 mins ago",
      status: "ACTIVE"
    },
    {
      id: "k-2",
      name: "Darwinbox Sync Service",
      prefix: "wms_live_7Bc2",
      scopes: ["employees.read", "attendance.write", "leave.sync"],
      rateLimitPerMinute: 120,
      createdAt: "2026-08-01",
      lastUsedAt: "1 hour ago",
      status: "ACTIVE"
    },
    {
      id: "k-3",
      name: "Custom Mobile App Gateway",
      prefix: "wms_live_44E1",
      scopes: ["ess.full", "attendance.write", "payslip.read"],
      rateLimitPerMinute: 600,
      createdAt: "2026-07-20",
      lastUsedAt: "Just now",
      status: "ACTIVE"
    }
  ]);

  const [apiScopes] = useState([
    { code: "employees.read", desc: "Read employee master, directory and organizational metadata." },
    { code: "employees.write", desc: "Create and update employee profiles and status." },
    { code: "attendance.read", desc: "Read biometric timestamps, shift logs and punch records." },
    { code: "attendance.write", desc: "Push clock-in/out records from third-party hardware." },
    { code: "payroll.read", desc: "Retrieve approved salary breakdown and payslip PDFs." },
    { code: "journal.write", desc: "Post financial journal vouchers and GL line items." },
    { code: "webhooks.manage", desc: "Register, modify and test custom webhook subscriptions." },
    { code: "automation.run", desc: "Trigger automated no-code workflows programmatically." }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🔑 API Keys, Scopes & OAuth Clients</h1>
          <p className="text-sm text-slate-600">
            Provision cryptographically secure tenant API tokens, configure granular scope permissions, and enforce rate limits.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/api-monitoring" as Route}>
            <Button variant="secondary">📈 API Usage Analytics</Button>
          </Link>
          <Button variant="primary" onClick={() => setShowNewKeyModal(true)}>
            + Generate API Key
          </Button>
        </div>
      </div>

      {/* API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Generate New API Key</h2>
              <button onClick={() => setShowNewKeyModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Key Friendly Name">
              <Input
                placeholder="e.g., Salesforce Integration Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </Field>
            <Field label="Rate Limit (Requests / Minute)">
              <Input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
              />
            </Field>
            <div>
              <label className="text-sm font-medium text-slate-800">Assign Scopes</label>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {apiScopes.map((s) => (
                  <label key={s.code} className="flex items-center gap-2 rounded border border-slate-200 p-2">
                    <input type="checkbox" defaultChecked />
                    <span className="font-mono text-slate-800">{s.code}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowNewKeyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowNewKeyModal(false)}>
                Create & Copy Secret
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Active API Keys */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Active Tenant API Keys</h2>
          <span className="text-xs text-slate-500 font-mono">Environment: PRODUCTION</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Key Prefix</th>
                <th className="py-3 px-4">Scopes</th>
                <th className="py-3 px-4">Rate Limit</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{k.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{k.prefix}••••••••</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{k.rateLimitPerMinute} req/min</td>
                  <td className="py-3 px-4 text-xs">{k.lastUsedAt}</td>
                  <td className="py-3 px-4">
                    <Badge tone="success">{k.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="danger">Revoke</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Scope Registry */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Supported API Scopes Registry</h2>
        <p className="text-sm text-slate-600">
          Enforce zero-trust least-privilege security by attaching explicit scopes to API keys and OAuth2 client applications.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {apiScopes.map((scope) => (
            <div key={scope.code} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              <div className="font-mono text-xs font-bold text-primary">{scope.code}</div>
              <p className="mt-1 text-xs text-slate-600">{scope.desc}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
