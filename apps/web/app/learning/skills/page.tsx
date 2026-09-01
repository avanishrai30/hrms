"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function EmployeeSkillsPage() {
  const [skills] = useState([
    {
      id: "sk-1",
      name: "Distributed Systems Architecture",
      code: "TECH_SYS_ARCH",
      category: "Technical",
      current: 4,
      target: 5,
      status: "DEVELOPING",
      readiness: 80,
      recommendedCourse: "Distributed Systems Architecture with PostgreSQL"
    },
    {
      id: "sk-2",
      name: "Good Manufacturing Practices (GMP) Hygiene",
      code: "FUNC_GMP_HYG",
      category: "Functional",
      current: 5,
      target: 4,
      status: "MASTERED",
      readiness: 100,
      recommendedCourse: null
    },
    {
      id: "sk-3",
      name: "Engineering Mentorship & Code Reviews",
      code: "LEAD_MENTOR",
      category: "Leadership",
      current: 4,
      target: 4,
      status: "PROFICIENT",
      readiness: 100,
      recommendedCourse: null
    },
    {
      id: "sk-4",
      name: "Cloud Security & Multi-Tenant IAM",
      code: "TECH_IAM_SEC",
      category: "Technical",
      current: 2,
      target: 4,
      status: "NEEDS_TRAINING",
      readiness: 50,
      recommendedCourse: "Security, Prompt Injection & RBAC Enforcement"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/learning" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Learning Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🧠 Enterprise Skill Matrix & Gap Analysis</h1>
          <p className="text-sm text-slate-600">
            Self-assessments, manager verifications, proficiency levels (1-5), and AI-bridged skill gap training roadmaps.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Self-Assess Skill</Button>
        </div>
      </div>

      {/* Skill Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Role Readiness</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">82.5%</div>
          <div className="mt-1 text-xs text-slate-600">Across 4 evaluated competency skills</div>
        </Panel>
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mastered & Proficient</div>
          <div className="mt-1 text-2xl font-bold text-primary">2 Skills</div>
          <div className="mt-1 text-xs text-slate-600">Meeting or exceeding designation bar</div>
        </Panel>
        <Panel className="border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Skill Gaps</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">2 Gaps Identified</div>
          <div className="mt-1 text-xs text-slate-600">Training modules assigned automatically</div>
        </Panel>
      </div>

      {/* Skills Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Assessed Competencies & Skill Proficiencies</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Skill & Category</th>
                <th className="py-3 px-4">Current Level</th>
                <th className="py-3 px-4">Target Level</th>
                <th className="py-3 px-4">Gap Status</th>
                <th className="py-3 px-4">Readiness</th>
                <th className="py-3 px-4">AI Recommended Training</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skills.map((sk) => (
                <tr key={sk.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{sk.name}</div>
                    <div className="font-mono text-xs text-slate-500">{sk.code} · {sk.category}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">L{sk.current} / 5</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">L{sk.target} / 5</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={sk.status === "MASTERED" || sk.status === "PROFICIENT" ? "success" : "warning"}>
                      {sk.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{sk.readiness}%</td>
                  <td className="py-3.5 px-4 text-xs">
                    {sk.recommendedCourse ? (
                      <Link href={"/learning/catalog" as Route} className="text-primary font-medium hover:underline">
                        🎯 {sk.recommendedCourse} →
                      </Link>
                    ) : (
                      <span className="text-slate-400">Target Level Achieved</span>
                    )}
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
