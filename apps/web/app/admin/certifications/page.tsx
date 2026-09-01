"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button, Field, Input, Panel } from "../../../components/ui";

export default function CertificationsAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certCode, setCertCode] = useState("");

  const [certifications] = useState([
    {
      id: "crt-1",
      code: "CERT-GMP-2026",
      title: "GMP Certified Food Safety & Quality Specialist",
      type: "COMPLIANCE",
      validity: "12 Months",
      issuedCount: 124,
      activeCount: 118,
      expiredCount: 6,
      authority: "VC Organics Academy & Quality Council"
    },
    {
      id: "crt-2",
      code: "CERT-SAFE-2026",
      title: "Workplace Safety & Emergency First-Aid Responder",
      type: "INTERNAL",
      validity: "12 Months",
      issuedCount: 62,
      activeCount: 58,
      expiredCount: 4,
      authority: "National Safety Council Partner"
    },
    {
      id: "crt-3",
      code: "CERT-DB-2026",
      title: "PostgreSQL Advanced Distributed Data Engineering",
      type: "PROFESSIONAL",
      validity: "24 Months",
      issuedCount: 28,
      activeCount: 28,
      expiredCount: 0,
      authority: "VC Tech Academy"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/training" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Training Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏆 Certification Registry & Credential Master</h1>
          <p className="text-sm text-slate-600">
            Define accreditation credentials, set validity periods, design badge tokens, and manage automated renewal reminders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Certification
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create Certification Credential</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code">
                <Input placeholder="e.g. CERT-HACCP-2026" value={certCode} onChange={(e) => setCertCode(e.target.value)} />
              </Field>
              <Field label="Validity (Months)">
                <Input type="number" defaultValue="12" />
              </Field>
            </div>
            <Field label="Certification Title">
              <Input placeholder="e.g. HACCP Critical Control Point Auditor" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save Credential
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Certifications Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Active Certifications ({certifications.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Title & Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Total Issued</th>
                <th className="py-3 px-4">Active / Expired</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certifications.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{c.title}</div>
                    <div className="font-mono text-xs text-slate-500">{c.code} · {c.authority}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">{c.type}</td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-900">{c.validity}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{c.issuedCount} Certified</td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="font-bold text-emerald-700">{c.activeCount} Active</span> · <span className="font-bold text-rose-600">{c.expiredCount} Expired</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View Holders</Button>
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
