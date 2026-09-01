"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function ConnectorsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeConnector, setActiveConnector] = useState<string | null>(null);

  const connectors = [
    { provider: "google_workspace", category: "PRODUCTIVITY", name: "Google Workspace", status: "CONFIGURED", lastSync: "10 mins ago", icon: "🌐" },
    { provider: "microsoft_365", category: "PRODUCTIVITY", name: "Microsoft 365", status: "CONFIGURED", lastSync: "1 hour ago", icon: "🏢" },
    { provider: "slack", category: "COMMUNICATION", name: "Slack", status: "CONFIGURED", lastSync: "Realtime", icon: "💬" },
    { provider: "microsoft_teams", category: "COMMUNICATION", name: "Microsoft Teams", status: "AVAILABLE", lastSync: "Never", icon: "👥" },
    { provider: "telegram", category: "COMMUNICATION", name: "Telegram Bot", status: "AVAILABLE", lastSync: "Never", icon: "✈️" },
    { provider: "darwinbox", category: "HR", name: "Darwinbox", status: "AVAILABLE", lastSync: "Never", icon: "👥" },
    { provider: "keka", category: "HR", name: "Keka HR", status: "AVAILABLE", lastSync: "Never", icon: "💼" },
    { provider: "bamboohr", category: "HR", name: "BambooHR", status: "AVAILABLE", lastSync: "Never", icon: "🎋" },
    { provider: "tally", category: "ACCOUNTING", name: "Tally Prime ERP", status: "CONFIGURED", lastSync: "Yesterday", icon: "📊" },
    { provider: "zoho_books", category: "ACCOUNTING", name: "Zoho Books", status: "AVAILABLE", lastSync: "Never", icon: "📚" },
    { provider: "quickbooks", category: "ACCOUNTING", name: "QuickBooks", status: "AVAILABLE", lastSync: "Never", icon: "📈" },
    { provider: "google_drive", category: "STORAGE", name: "Google Drive", status: "CONFIGURED", lastSync: "Realtime", icon: "📁" },
    { provider: "onedrive", category: "STORAGE", name: "OneDrive", status: "AVAILABLE", lastSync: "Never", icon: "☁️" },
    { provider: "dropbox", category: "STORAGE", name: "Dropbox Business", status: "AVAILABLE", lastSync: "Never", icon: "📦" },
    { provider: "azure_ad", category: "IDENTITY", name: "Azure AD / Entra", status: "CONFIGURED", lastSync: "Realtime", icon: "🔑" },
    { provider: "okta", category: "IDENTITY", name: "Okta", status: "AVAILABLE", lastSync: "Never", icon: "🛡️" },
    { provider: "google_sso", category: "IDENTITY", name: "Google SSO", status: "CONFIGURED", lastSync: "Realtime", icon: "🔐" }
  ];

  const filtered = connectors.filter((c) => {
    if (selectedCategory === "ALL") return true;
    return c.category === selectedCategory;
  });

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🔌 Connectors Catalog & External Services</h1>
          <p className="text-sm text-slate-600">
            Native integrations with enterprise productivity, communication, ERP accounting, cloud storage and IAM directories.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/integration-health" as Route}>
            <Button variant="secondary">🩺 Connector Health</Button>
          </Link>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "PRODUCTIVITY", "COMMUNICATION", "HR", "ACCOUNTING", "STORAGE", "IDENTITY"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              selectedCategory === cat ? "bg-primary text-white" : "bg-surface text-slate-700 hover:bg-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Connectors List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Panel key={item.provider} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <span className="text-xs text-slate-500 font-medium">{item.category}</span>
                  </div>
                </div>
                <Badge tone={item.status === "CONFIGURED" ? "success" : "neutral"}>
                  {item.status}
                </Badge>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                Last Synchronized: <span className="font-semibold text-slate-700">{item.lastSync}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              {item.status === "CONFIGURED" ? (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setActiveConnector(item.name);
                      setShowConfigModal(true);
                    }}
                  >
                    Manage Settings
                  </Button>
                  <Button variant="ghost">Sync Now</Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setActiveConnector(item.name);
                    setShowConfigModal(true);
                  }}
                >
                  Configure Connector
                </Button>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-md space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Configure {activeConnector}</h2>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Client ID / API Key">
              <Input placeholder="Enter integration client ID" />
            </Field>
            <Field label="Client Secret / Token">
              <Input type="password" placeholder="••••••••••••••••" />
            </Field>
            <Field label="Sync Frequency">
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none">
                <option>Realtime (Webhooks)</option>
                <option>Hourly</option>
                <option>Daily</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowConfigModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowConfigModal(false)}>
                Save & Authenticate
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
