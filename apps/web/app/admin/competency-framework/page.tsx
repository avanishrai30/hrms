"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function CompetencyFrameworkAdminPage() {
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [showModal, setShowModal] = useState(false);

  const [competencies] = useState([
    { code: "TECH_SYS_ARCH", name: "Distributed Systems Architecture", category: "TECHNICAL", expectedLevel: "L5 (Expert)", mappedRoles: 4, desc: "Design fault-tolerant, horizontally scalable multi-tenant services." },
    { code: "TECH_CODE_QUAL", name: "Clean Code & Automated Testing", category: "TECHNICAL", expectedLevel: "L4 (Advanced)", mappedRoles: 8, desc: "Maintain rigorous test coverage, clean architecture, and pure functions." },
    { code: "LEAD_MENTOR", name: "Engineering Mentorship & Coaching", category: "LEADERSHIP", expectedLevel: "L4 (Advanced)", mappedRoles: 6, desc: "Grow direct reports and peers through active pairing and constructive code review." },
    { code: "BEHAV_COLLAB", name: "Cross-Functional Collaboration", category: "BEHAVIORAL", expectedLevel: "L3 (Proficient)", mappedRoles: 14, desc: "Partner proactively with Product, Design, QA, and Operations to remove silos." },
    { code: "COMM_EXEC", name: "Executive Technical Communication", category: "COMMUNICATION", expectedLevel: "L5 (Expert)", mappedRoles: 5, desc: "Translate complex architectural decisions into business ROI for executives." },
    { code: "FUNC_WH_OPS", name: "Warehouse Invoicing & Dispatch SOP", category: "FUNCTIONAL", expectedLevel: "L3 (Proficient)", mappedRoles: 7, desc: "Master factory ERP scan workflows, FIFO dispatch, and compliance checks." }
  ]);

  const filtered = competencies.filter((c) => {
    if (selectedCat === "ALL") return true;
    return c.category === selectedCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/performance/competencies" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Competencies
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🧭 Competency Framework & Skill Matrix Admin</h1>
          <p className="text-sm text-slate-600">
            Define organizational competency libraries, 5-point proficiency level rubrics, and bind expectations to designations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Add Competency
          </Button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "TECHNICAL", "LEADERSHIP", "BEHAVIORAL", "COMMUNICATION", "FUNCTIONAL"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              selectedCat === cat ? "bg-primary text-white" : "bg-surface text-slate-700 hover:bg-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-md space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add Competency Definition</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Competency Name">
              <Input placeholder="e.g. Cloud Security & IAM" />
            </Field>
            <Field label="Category">
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none">
                <option value="TECHNICAL">Technical</option>
                <option value="LEADERSHIP">Leadership</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="FUNCTIONAL">Functional</option>
              </select>
            </Field>
            <Field label="Description & Proficiency Rubric">
              <Input placeholder="Define expected observable behaviors..." />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save to Library
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Panel key={c.code} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <span className="font-mono text-xs text-primary font-bold">{c.code}</span>
                </div>
                <Badge tone="neutral">{c.category}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{c.desc}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{c.mappedRoles} Designations Mapped</span>
              <Button variant="secondary">Edit Rubric</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
