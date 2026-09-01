"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function SkillMatrixAdminPage() {
  const [skills] = useState([
    {
      id: "skm-1",
      code: "TECH_SYS_ARCH",
      name: "Distributed Systems Architecture",
      category: "Technical",
      assessedEmployees: 24,
      avgProficiency: 3.8,
      masteredCount: 8,
      gapCount: 6
    },
    {
      id: "skm-2",
      code: "FUNC_GMP_HYG",
      name: "Good Manufacturing Practices (GMP) Hygiene",
      category: "Functional",
      assessedEmployees: 118,
      avgProficiency: 4.6,
      masteredCount: 94,
      gapCount: 2
    },
    {
      id: "skm-3",
      code: "LEAD_MENTOR",
      name: "Engineering Mentorship & Code Reviews",
      category: "Leadership",
      assessedEmployees: 16,
      avgProficiency: 4.1,
      masteredCount: 11,
      gapCount: 3
    },
    {
      id: "skm-4",
      code: "TECH_IAM_SEC",
      name: "Cloud Security & Multi-Tenant IAM",
      category: "Technical",
      assessedEmployees: 28,
      avgProficiency: 2.9,
      masteredCount: 4,
      gapCount: 14
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🧠 Enterprise Skill Taxonomy & Workforce Heatmap</h1>
          <p className="text-sm text-slate-600">
            Define organizational skill catalogs, 5-level proficiency descriptors, and identify cross-departmental skill shortages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Define New Skill</Button>
        </div>
      </div>

      {/* Skill Matrix Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Workforce Competency Inventory ({skills.length} Assessed Skills)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4">Code & Category</th>
                <th className="py-3 px-4">Assessed Pool</th>
                <th className="py-3 px-4">Avg Proficiency</th>
                <th className="py-3 px-4">Mastered (L4-L5)</th>
                <th className="py-3 px-4">Gaps Flagged</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skills.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{s.code} · {s.category}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.assessedEmployees} People</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">L{s.avgProficiency} / 5</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{s.masteredCount} Mastered</td>
                  <td className="py-3.5 px-4">
                    {s.gapCount > 5 ? (
                      <Badge tone="danger">{s.gapCount} Gaps</Badge>
                    ) : (
                      <Badge tone="warning">{s.gapCount} Gaps</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View Gap Report</Button>
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
