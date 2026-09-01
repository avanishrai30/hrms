"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function KnowledgeCategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [categories] = useState([
    { id: "cat-1", name: "HR Policies & Employee Handbook", slug: "hr-policies", articlesCount: 14, desc: "Leaves, attendance, code of conduct, performance appraisals." },
    { id: "cat-2", name: "Finance, Expense & Corporate Travel", slug: "finance-travel", articlesCount: 8, desc: "Per-diem rates, reimbursement workflows, expense policy." },
    { id: "cat-3", name: "IT Infrastructure, Security & Devices", slug: "it-security", articlesCount: 12, desc: "Asset issuance, software licenses, password hygiene SOPs." },
    { id: "cat-4", name: "Statutory Compliance & Labor Laws", slug: "statutory-compliance", articlesCount: 6, desc: "PF, ESI, Gratuity, Bonus, Minimum wages, Factory compliance." },
    { id: "cat-5", name: "Health, Safety & Environment (HSE)", slug: "hse-safety", articlesCount: 5, desc: "Factory fire safety drills, PPE protocols, hazardous materials SOPs." }
  ]);

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📁 Knowledge Base Categories & Collections</h1>
          <p className="text-sm text-slate-600">
            Structure SOPs and policies into hierarchical categories for employee search and AI tool retrieval.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create New Category
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-md space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create Knowledge Category</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Category Name">
              <Input
                placeholder="e.g. Legal & Contracts"
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
              />
            </Field>
            <Field label="URL Slug">
              <Input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
            </Field>
            <Field label="Description">
              <Input placeholder="Short summary of topics covered..." />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save Category
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Panel key={cat.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900">{cat.name}</h3>
                <Badge tone="neutral">{cat.articlesCount} Articles</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{cat.desc}</p>
              <div className="mt-3 font-mono text-[11px] text-slate-400">/{cat.slug}</div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <Link href={"/knowledge" as Route}>
                <Button variant="secondary">View Articles</Button>
              </Link>
              <Button variant="ghost">Edit</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
