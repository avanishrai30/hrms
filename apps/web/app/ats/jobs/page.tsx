"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function JobRequisitionsPage() {
  const [activeTab, setActiveTab] = useState<"REQUISITIONS" | "HIRING_REQUESTS">("REQUISITIONS");

  const [requisitions, setRequisitions] = useState([
    {
      id: "req-1",
      code: "REQ-2026-001",
      jobTitle: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Bengaluru / Hybrid",
      openings: 3,
      salaryRange: "₹20L - ₹28L",
      status: "PUBLISHED",
      applicants: 18,
      slug: "senior-full-stack-engineer-req-2026-001"
    },
    {
      id: "req-2",
      code: "REQ-2026-002",
      jobTitle: "Product Operations Lead",
      department: "Operations",
      location: "Mumbai",
      openings: 1,
      salaryRange: "₹18L - ₹24L",
      status: "PUBLISHED",
      applicants: 9,
      slug: "product-operations-lead-req-2026-002"
    },
    {
      id: "req-3",
      code: "REQ-2026-003",
      jobTitle: "Talent Acquisition Specialist",
      department: "Human Resources",
      location: "Bengaluru",
      openings: 2,
      salaryRange: "₹12L - ₹16L",
      status: "APPROVED",
      applicants: 15,
      slug: "talent-acquisition-specialist-req-2026-003"
    }
  ]);

  const [hiringRequests, setHiringRequests] = useState([
    {
      id: "hr-1",
      code: "HR-2026-001",
      department: "Engineering",
      designation: "Staff Backend Engineer",
      vacancies: 2,
      budgetedCtc: 3600000,
      priority: "HIGH",
      hiringManager: "Rahul Verma",
      stage: "FINANCE",
      status: "PENDING_APPROVAL"
    },
    {
      id: "hr-2",
      code: "HR-2026-002",
      department: "Sales & Marketing",
      designation: "Enterprise Account Executive",
      vacancies: 3,
      budgetedCtc: 2400000,
      priority: "MEDIUM",
      hiringManager: "Ananya Roy",
      stage: "APPROVED",
      status: "APPROVED"
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    jobTitle: "",
    department: "Engineering",
    location: "Bengaluru",
    openings: "1",
    salaryMin: "1800000",
    salaryMax: "2400000",
    skills: "TypeScript, React, Node.js",
    jobDescription: "We are looking for an experienced engineer to lead full-stack modules..."
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `req-${Date.now()}`,
      code: `REQ-2026-${String(requisitions.length + 1).padStart(3, "0")}`,
      jobTitle: newJob.jobTitle,
      department: newJob.department,
      location: newJob.location,
      openings: parseInt(newJob.openings, 10) || 1,
      salaryRange: `₹${(parseFloat(newJob.salaryMin) / 100000).toFixed(0)}L - ₹${(parseFloat(newJob.salaryMax) / 100000).toFixed(0)}L`,
      status: "PUBLISHED",
      applicants: 0,
      slug: `${newJob.jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-req-2026-00${requisitions.length + 1}`
    };
    setRequisitions([created, ...requisitions]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Job Requisitions & Manpower Planning</h1>
          <p className="text-sm text-zinc-500">Track approved vacancies, manage requisition approvals, and publish to career portal.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/careers" as Route} target="_blank">
            <Button variant="secondary">🌐 View Public Careers</Button>
          </Link>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Create Job Requisition
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("REQUISITIONS")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === "REQUISITIONS"
              ? "border-primary text-primary"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Active Requisitions ({requisitions.length})
        </button>
        <button
          onClick={() => setActiveTab("HIRING_REQUESTS")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === "HIRING_REQUESTS"
              ? "border-primary text-primary"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Manpower Hiring Requests ({hiringRequests.length})
        </button>
      </div>

      {/* Requisitions View */}
      {activeTab === "REQUISITIONS" && (
        <Panel className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
                <tr>
                  <th className="py-2.5 px-3">Requisition Code</th>
                  <th className="py-2.5 px-3">Position Title</th>
                  <th className="py-2.5 px-3">Department & Location</th>
                  <th className="py-2.5 px-3 text-center">Openings</th>
                  <th className="py-2.5 px-3">Salary Budget</th>
                  <th className="py-2.5 px-3 text-center">Applicants</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-50/60 transition">
                    <td className="py-3 px-3 font-mono text-xs text-zinc-500">{req.code}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-zinc-900">{req.jobTitle}</p>
                      <Link href={`/careers/jobs/${req.slug}` as Route} target="_blank" className="text-xs text-primary hover:underline">
                        /careers/jobs/{req.slug} ↗
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <p className="font-medium text-zinc-800">{req.department}</p>
                      <p className="text-zinc-400">{req.location}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-zinc-900">{req.openings}</td>
                    <td className="py-3 px-3 text-xs font-medium text-zinc-700">{req.salaryRange}</td>
                    <td className="py-3 px-3 text-center font-bold text-sky-700">{req.applicants}</td>
                    <td className="py-3 px-3">
                      <Badge tone={req.status === "PUBLISHED" ? "success" : "neutral"}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link href={`/ats/pipeline?req=${req.code}` as Route}>
                        <Button variant="secondary">Pipeline</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Hiring Requests View */}
      {activeTab === "HIRING_REQUESTS" && (
        <Panel className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
                <tr>
                  <th className="py-2.5 px-3">Request Code</th>
                  <th className="py-2.5 px-3">Requested Designation</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Vacancies</th>
                  <th className="py-2.5 px-3">Budgeted CTC</th>
                  <th className="py-2.5 px-3">Hiring Manager</th>
                  <th className="py-2.5 px-3">Approval Stage</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hiringRequests.map((hr) => (
                  <tr key={hr.id} className="hover:bg-zinc-50/60 transition">
                    <td className="py-3 px-3 font-mono text-xs text-zinc-500">{hr.code}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-900">{hr.designation}</td>
                    <td className="py-3 px-3">{hr.department}</td>
                    <td className="py-3 px-3 text-center font-bold">{hr.vacancies}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-900">₹{(hr.budgetedCtc / 100000).toFixed(1)}L</td>
                    <td className="py-3 px-3 text-xs text-zinc-600">{hr.hiringManager}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {hr.stage}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {hr.status === "PENDING_APPROVAL" ? (
                        <Button
                          variant="primary"
                          onClick={() => {
                            setHiringRequests((prev) =>
                              prev.map((item) =>
                                item.id === hr.id ? { ...item, stage: "APPROVED", status: "APPROVED" } : item
                              )
                            );
                          }}
                        >
                          Approve Stage
                        </Button>
                      ) : (
                        <Badge tone="success">Approved</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Create Requisition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-xl p-6 bg-white space-y-4 rounded-panel shadow-2xl">
            <h2 className="text-lg font-bold text-zinc-900 border-b border-border pb-3">Create Job Requisition</h2>
            <form onSubmit={handleCreateJob} className="space-y-3">
              <Field label="Job Title">
                <Input
                  required
                  value={newJob.jobTitle}
                  onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department">
                  <Input
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Openings">
                  <Input
                    type="number"
                    value={newJob.openings}
                    onChange={(e) => setNewJob({ ...newJob, openings: e.target.value })}
                  />
                </Field>
                <Field label="Min CTC (₹)">
                  <Input
                    value={newJob.salaryMin}
                    onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                  />
                </Field>
                <Field label="Max CTC (₹)">
                  <Input
                    value={newJob.salaryMax}
                    onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Skills Required (comma separated)">
                <Input
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                />
              </Field>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Publish to Careers
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
