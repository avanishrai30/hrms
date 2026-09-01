"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function KnowledgeArticleDetailPage() {
  const [activeTab, setActiveTab] = useState<"content" | "versions" | "attachments">("content");

  const [article] = useState({
    id: "art-1",
    title: "Employee Leave & Encashment Policy 2026",
    category: "HR Policies",
    slug: "employee-leave-policy-2026",
    status: "PUBLISHED",
    currentVersion: 3,
    updatedAt: "Aug 20, 2026",
    author: "Priya Sundaram (HR Director)",
    content: `
# 1. Purpose & Scope
This policy defines the statutory and discretionary leave entitlements for all full-time, contract, and probationary employees of VC Organics.

# 2. Leave Categories
- **Earned Leave (EL):** Accrues at the rate of 1.75 days per completed calendar month of active service (max 21 days annually).
- **Casual Leave (CL):** 12 days credited on January 1st of each calendar year.
- **Sick Leave (SL):** 10 days credited annually upon presentation of medical certificate for absences > 2 consecutive days.
- **Maternity Leave:** 26 weeks of paid leave in compliance with the Maternity Benefit (Amendment) Act.
- **Paternity Leave:** 5 working days within 3 months of childbirth.

# 3. Year-End Encashment & Carry Forward
- A maximum of 30 days of unavailed Earned Leave can be accumulated and carried forward into the subsequent fiscal year.
- Excess Earned Leave beyond 30 days shall be automatically encashed at basic salary during the March payroll cycle.
    `,
    versions: [
      { version: 3, changeNote: "Updated maternity benefit to 26 weeks and added paternity leave clause.", author: "Priya Sundaram", date: "Aug 20, 2026" },
      { version: 2, changeNote: "Revised carry forward limit from 45 to 30 days.", author: "Aarav Sharma", date: "Jan 10, 2026" },
      { version: 1, changeNote: "Initial draft release.", author: "Priya Sundaram", date: "Jul 15, 2025" }
    ],
    attachments: [
      { name: "VC_Organics_Leave_Policy_2026_Signed.pdf", size: "1.4 MB", uploadedBy: "HR Cell" },
      { name: "Leave_Application_Form_Annexure_A.docx", size: "240 KB", uploadedBy: "HR Operations" }
    ]
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/knowledge" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Knowledge Base
            </Link>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900">{article.title}</h1>
            <Badge tone="success">{article.status}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Category: <span className="font-semibold text-slate-700">{article.category}</span> · Version {article.currentVersion}.0 · Last updated on {article.updatedAt} by {article.author}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">✏️ Edit Article</Button>
          <Button variant="primary">📥 Export PDF</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
            activeTab === "content" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📄 Article Content
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
            activeTab === "versions" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ⏱️ Version History ({article.versions.length})
        </button>
        <button
          onClick={() => setActiveTab("attachments")}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
            activeTab === "attachments" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📎 Attachments ({article.attachments.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "content" && (
        <Panel className="p-6 bg-surface">
          <div className="prose max-w-none text-slate-800 whitespace-pre-line leading-relaxed text-sm">
            {article.content}
          </div>
        </Panel>
      )}

      {activeTab === "versions" && (
        <Panel className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Version History & Revisions</h2>
          <div className="divide-y divide-slate-100">
            {article.versions.map((v) => (
              <div key={v.version} className="py-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">v{v.version}.0</span>
                    <span className="text-xs text-slate-500 font-medium">{v.date} by {v.author}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{v.changeNote}</p>
                </div>
                <Button variant="secondary">View Diff</Button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {activeTab === "attachments" && (
        <Panel className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Attached Documents & SOP Files</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {article.attachments.map((att, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div>
                  <div className="font-semibold text-sm text-slate-900">{att.name}</div>
                  <span className="text-xs text-slate-500">{att.size} · Uploaded by {att.uploadedBy}</span>
                </div>
                <Button variant="secondary">Download</Button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
