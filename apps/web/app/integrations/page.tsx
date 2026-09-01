"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "installed" | "stats">("catalog");
  const [searchQuery, setSearchQuery] = useState("");

  const connectors = [
    { id: "c-1", provider: "google_workspace", name: "Google Workspace", category: "PRODUCTIVITY", desc: "Sync users, calendars, Google Drive storage and SSO.", installed: true, status: "ACTIVE" },
    { id: "c-2", provider: "microsoft_365", name: "Microsoft 365", category: "PRODUCTIVITY", desc: "Exchange calendar sync, OneDrive document backup, Azure AD.", installed: true, status: "ACTIVE" },
    { id: "c-3", provider: "slack", name: "Slack", category: "COMMUNICATION", desc: "Interactive approval messages, leave notices, incident alerts.", installed: true, status: "ACTIVE" },
    { id: "c-4", provider: "microsoft_teams", name: "Microsoft Teams", category: "COMMUNICATION", desc: "Workflow bot notifications, HR announcements, adaptive cards.", installed: false, status: "AVAILABLE" },
    { id: "c-5", provider: "telegram", name: "Telegram", category: "COMMUNICATION", desc: "Secure automated broadcast alerts and on-call notifications.", installed: false, status: "AVAILABLE" },
    { id: "c-6", provider: "darwinbox", name: "Darwinbox", category: "HR", desc: "Bi-directional master employee record synchronization.", installed: false, status: "AVAILABLE" },
    { id: "c-7", provider: "keka", name: "Keka HR", category: "HR", desc: "Attendance logs and payroll journal entries interchange.", installed: false, status: "AVAILABLE" },
    { id: "c-8", provider: "bamboohr", name: "BambooHR", category: "HR", desc: "Global workforce onboarding and compliance profile mirroring.", installed: false, status: "AVAILABLE" },
    { id: "c-9", provider: "tally", name: "Tally Prime ERP", category: "ACCOUNTING", desc: "Payroll voucher posting and finance ledger direct sync.", installed: true, status: "ACTIVE" },
    { id: "c-10", provider: "zoho_books", name: "Zoho Books", category: "ACCOUNTING", desc: "Automated reimbursement disbursement and vendor expense entries.", installed: false, status: "AVAILABLE" },
    { id: "c-11", provider: "quickbooks", name: "QuickBooks Online", category: "ACCOUNTING", desc: "Multi-currency payroll journal posting and reconciliation.", installed: false, status: "AVAILABLE" },
    { id: "c-12", provider: "azure_ad", name: "Azure Active Directory / Entra", category: "IDENTITY", desc: "SAML 2.0 / OIDC enterprise Single Sign-On and SCIM provisioning.", installed: true, status: "ACTIVE" },
    { id: "c-13", provider: "okta", name: "Okta Identity Cloud", category: "IDENTITY", desc: "JIT user provisioning, MFA enforcement and group role mapping.", installed: false, status: "AVAILABLE" }
  ];

  const filtered = connectors.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "installed") return matchSearch && c.installed;
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔌 Integrations Hub & App Marketplace</h1>
          <p className="text-sm text-slate-600">
            Connect VC Organics HRMS with external productivity, communication, ERP, identity and cloud platforms.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={"/integrations/api" as Route}>
            <Button variant="secondary">🔑 API Keys & Scopes</Button>
          </Link>
          <Link href={"/integrations/webhooks" as Route}>
            <Button variant="secondary">⚡ Webhooks</Button>
          </Link>
          <Link href={"/integrations/sso" as Route}>
            <Button variant="secondary">🛡️ SSO & IdP</Button>
          </Link>
          <Link href={"/automation" as Route}>
            <Button variant="primary">⚙️ Workflow Automation</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Connectors</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">5 Installed</div>
          <div className="mt-1 text-xs text-slate-600">Across HR, ERP, Auth & Comms</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">API Gateway Traffic</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">2.4M Calls/mo</div>
          <div className="mt-1 text-xs text-slate-600">99.98% Success · 42ms avg</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Webhook Deliveries</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">142.8k Events</div>
          <div className="mt-1 text-xs text-slate-600">0 Dead-Letter Queue items</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Automations Executed</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">18.6k Runs</div>
          <div className="mt-1 text-xs text-slate-600">12 Active Multi-Step Workflows</div>
        </Panel>
      </div>

      {/* Controls & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "catalog" ? "bg-primary text-white" : "bg-surface text-slate-700 hover:bg-slate-100"
            }`}
          >
            📦 Marketplace Catalog ({connectors.length})
          </button>
          <button
            onClick={() => setActiveTab("installed")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "installed" ? "bg-primary text-white" : "bg-surface text-slate-700 hover:bg-slate-100"
            }`}
          >
            ✅ Installed Apps ({connectors.filter((c) => c.installed).length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Search connectors, ERPs, identity providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-surface px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 sm:w-72"
        />
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Panel key={item.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <span className="text-xs font-mono text-slate-500">{item.provider}</span>
                </div>
                <Badge tone={item.installed ? "success" : "neutral"}>
                  {item.installed ? "INSTALLED" : item.category}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.desc}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500 font-medium">{item.category}</span>
              {item.installed ? (
                <div className="flex gap-2">
                  <Link href={"/integrations/connectors" as Route}>
                    <Button variant="secondary">Configure</Button>
                  </Link>
                </div>
              ) : (
                <Link href={"/integrations/connectors" as Route}>
                  <Button variant="primary">Install App</Button>
                </Link>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
