"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function SsoManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [protocol, setProtocol] = useState<"SAML2" | "OIDC" | "OAUTH2">("SAML2");

  const [ssoConfigs] = useState([
    {
      id: "sso-1",
      name: "Corporate Okta IdP",
      protocol: "SAML2",
      issuer: "https://vcorganics.okta.com/app/exk98234",
      jitProvisioning: true,
      autoDeactivation: true,
      activeUsers: 842,
      status: "ACTIVE"
    },
    {
      id: "sso-2",
      name: "Microsoft Entra ID (Azure AD)",
      protocol: "OIDC",
      issuer: "https://login.microsoftonline.com/vcorganics-tenant-id/v2.0",
      jitProvisioning: true,
      autoDeactivation: false,
      activeUsers: 410,
      status: "ACTIVE"
    },
    {
      id: "sso-3",
      name: "Google Workspace SSO",
      protocol: "OAUTH2",
      issuer: "https://accounts.google.com",
      jitProvisioning: true,
      autoDeactivation: true,
      activeUsers: 156,
      status: "ACTIVE"
    }
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛡️ Enterprise Single Sign-On (SSO & IdP)</h1>
          <p className="text-sm text-slate-600">
            Enforce SAML 2.0, OpenID Connect (OIDC) and OAuth2 identity federation with Just-In-Time (JIT) provisioning and role mapping.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Configure SSO Identity Provider
          </Button>
        </div>
      </div>

      {/* New SSO Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-xl space-y-4 bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add Identity Provider (IdP)</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="IdP Display Name">
              <Input placeholder="e.g. Corporate Azure AD SAML" />
            </Field>
            <Field label="Federation Protocol">
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as "SAML2" | "OIDC" | "OAUTH2")}
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none"
              >
                <option value="SAML2">SAML 2.0</option>
                <option value="OIDC">OpenID Connect (OIDC)</option>
                <option value="OAUTH2">OAuth 2.0</option>
              </select>
            </Field>
            <Field label="Metadata URL / XML Endpoint">
              <Input placeholder="https://login.microsoftonline.com/.../federationmetadata.xml" />
            </Field>
            <Field label="Entity ID / Issuer URI">
              <Input placeholder="https://sts.windows.net/.../" />
            </Field>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" defaultChecked />
                <span>Enable Just-In-Time (JIT) User Provisioning</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" defaultChecked />
                <span>Synchronize SCIM Group to HRMS Role Mappings</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save & Verify Handshake
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* SSO Configs Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Configured Identity Providers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Provider Name</th>
                <th className="py-3 px-4">Protocol</th>
                <th className="py-3 px-4">Issuer URI</th>
                <th className="py-3 px-4">JIT Provisioning</th>
                <th className="py-3 px-4">Active Authentications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ssoConfigs.map((sso) => (
                <tr key={sso.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{sso.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-primary font-bold">{sso.protocol}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 truncate max-w-xs">{sso.issuer}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-emerald-600">
                    {sso.jitProvisioning ? "Enabled" : "Disabled"}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono">{sso.activeUsers} users</td>
                  <td className="py-3 px-4">
                    <Badge tone="success">{sso.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="secondary">Test SSO</Button>
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
