"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function CoursesAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("COMPLIANCE");

  const [courses] = useState([
    {
      id: "c-1",
      code: "COMP-101",
      title: "Good Manufacturing Practices (GMP) & Hygiene Protocols",
      category: "COMPLIANCE",
      modulesCount: 3,
      duration: "60 mins",
      enrollments: 124,
      isMandatory: true,
      status: "ACTIVE"
    },
    {
      id: "c-2",
      code: "TECH-201",
      title: "Distributed Systems Architecture with PostgreSQL",
      category: "ENGINEERING",
      modulesCount: 5,
      duration: "180 mins",
      enrollments: 68,
      isMandatory: false,
      status: "ACTIVE"
    },
    {
      id: "c-3",
      code: "OPS-102",
      title: "Warehouse Inventory Management, FIFO & Barcode Scanning",
      category: "OPERATIONS",
      modulesCount: 4,
      duration: "90 mins",
      enrollments: 95,
      isMandatory: true,
      status: "ACTIVE"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📚 Course Catalog & Module Authoring</h1>
          <p className="text-sm text-slate-600">
            Author courses, structure video/PDF modules, attach reference documents, and publish to learner catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Author New Course
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Panel className="w-full max-w-lg space-y-4 bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Author New Training Course</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Course Code">
                <Input placeholder="e.g. COMP-103" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
              </Field>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-slate-900 outline-none"
                >
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="ENGINEERING">Engineering</option>
                  <option value="OPERATIONS">Operations</option>
                  <option value="LEADERSHIP">Leadership</option>
                </select>
              </Field>
            </div>
            <Field label="Course Title">
              <Input placeholder="e.g. Information Security & Phishing Awareness" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save & Add Modules
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Courses Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Configured Training Courses ({courses.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Modules</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Active Learners</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((crs) => (
                <tr key={crs.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{crs.title}</div>
                    <div className="font-mono text-xs text-slate-500">{crs.code}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700">{crs.category}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{crs.modulesCount} Modules</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{crs.duration}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">{crs.enrollments} Enrolled</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={crs.isMandatory ? "danger" : "neutral"}>
                      {crs.isMandatory ? "MANDATORY" : "OPTIONAL"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Button variant="secondary">Edit Modules</Button>
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
