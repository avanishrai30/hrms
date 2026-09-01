"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function AssessmentsAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [examTitle, setExamTitle] = useState("");

  const [assessments] = useState([
    {
      id: "a-1",
      title: "GMP Cleanroom & Hygiene Final Examination",
      course: "Good Manufacturing Practices (GMP) & Hygiene Protocols",
      type: "FINAL_EXAM",
      questionsCount: 20,
      timeLimit: "30 Mins",
      passPercent: 80,
      randomize: true,
      negativeMarking: false,
      totalAttempts: 124,
      passRate: 91.2
    },
    {
      id: "a-2",
      title: "POSH Statutory Assessment 2026",
      course: "Prevention of Sexual Harassment (POSH) 2026 Refresher",
      type: "CERTIFICATION_EXAM",
      questionsCount: 15,
      timeLimit: "20 Mins",
      passPercent: 85,
      randomize: true,
      negativeMarking: false,
      totalAttempts: 210,
      passRate: 98.5
    },
    {
      id: "a-3",
      title: "PostgreSQL Query Optimization & Indexing Quiz",
      course: "Distributed Systems Architecture with PostgreSQL",
      type: "QUIZ",
      questionsCount: 10,
      timeLimit: "15 Mins",
      passPercent: 70,
      randomize: false,
      negativeMarking: true,
      totalAttempts: 45,
      passRate: 84.4
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📝 Assessment & Examination Designer</h1>
          <p className="text-sm text-slate-600">
            Create randomized question banks, configure negative marking, pass percentages, time limits, and retake caps.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Assessment
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create Assessment Exam</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <Field label="Assessment Title">
              <Input placeholder="e.g. Warehouse FIFO & Dispatch Quiz" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time Limit (Minutes)">
                <Input type="number" defaultValue="30" />
              </Field>
              <Field label="Passing Score %">
                <Input type="number" defaultValue="75" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save & Add Questions
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Assessment Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Configured Assessments ({assessments.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Title & Course</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Time & Pass %</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Pass Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{a.title}</div>
                    <div className="text-xs text-slate-500">{a.course}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">{a.type}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.questionsCount} MCQs</td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="font-medium text-slate-900">{a.timeLimit}</span> · <span className="font-bold text-emerald-700">{a.passPercent}% Pass</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.totalAttempts}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{a.passRate}%</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Manage Questions</Button>
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
