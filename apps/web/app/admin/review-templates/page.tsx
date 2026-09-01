"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function ReviewTemplatesPage() {
  const [showModal, setShowModal] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const [templates] = useState([
    {
      id: "tpl-1",
      name: "Engineering & Technical Annual Review Form",
      sections: ["OKR Key Results (40%)", "Technical Competencies (30%)", "Core Values & Leadership (20%)", "Future Goals (10%)"],
      ratingScale: "5-Point Numeric with Descriptors",
      applicableDepts: "Engineering, Product, DevOps",
      status: "ACTIVE"
    },
    {
      id: "tpl-2",
      name: "Operations & Warehouse Performance Review",
      sections: ["Shift Attendance & Safety (35%)", "Throughput & Error Rates (35%)", "Teamwork & Equipment Care (30%)"],
      ratingScale: "4-Point Behavioral Scale",
      applicableDepts: "Operations, Logistics, Security",
      status: "ACTIVE"
    },
    {
      id: "tpl-3",
      name: "Executive & People Manager 360 Form",
      sections: ["Team Growth & Retention (30%)", "Strategic Vision (30%)", "Execution Excellence (25%)", "360 Feedback (15%)"],
      ratingScale: "5-Point Executive Scale",
      applicableDepts: "All People Managers (L5+)",
      status: "ACTIVE"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/performance" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Performance Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📝 Performance Review Questionnaire Templates</h1>
          <p className="text-sm text-slate-600">
            Build custom weighted appraisal forms, define rating scale descriptors, and assign questionnaires by department or seniority band.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/admin/review-cycles" as Route}>
            <Button variant="secondary">⏳ Review Cycles</Button>
          </Link>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Template
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create Review Template</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Template Title">
              <Input
                placeholder="e.g. Sales Executive Quarterly Form"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </Field>
            <Field label="Rating Scale Matrix">
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none font-medium">
                <option>5-Point Scale (1=Poor to 5=Outstanding)</option>
                <option>4-Point Behavioral Rating Scale</option>
                <option>Percentage-Based Scoring (0-100%)</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save Template
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <Panel key={tpl.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900">{tpl.name}</h3>
                <Badge tone="success">{tpl.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500 font-medium">Target: {tpl.applicableDepts}</p>

              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Weighted Sections:</span>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {tpl.sections.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">{tpl.ratingScale}</span>
              <Button variant="secondary">Edit Form</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
