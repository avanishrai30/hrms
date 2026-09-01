"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [candidates, setCandidates] = useState([
    {
      id: "c-1",
      code: "CND-2026-0001",
      name: "Aakash Sharma",
      email: "aakash.sharma@example.com",
      mobile: "+91-9876543210",
      location: "Bengaluru",
      expYears: 4.5,
      currentCtc: 1800000,
      expectedCtc: 2400000,
      noticeDays: 30,
      skills: ["TypeScript", "NestJS", "React", "PostgreSQL", "AWS"],
      status: "INTERVIEW",
      source: "Careers Portal"
    },
    {
      id: "c-2",
      code: "CND-2026-0002",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      mobile: "+91-9812345678",
      location: "Pune",
      expYears: 5.0,
      currentCtc: 2000000,
      expectedCtc: 2600000,
      noticeDays: 15,
      skills: ["Python", "Docker", "AWS", "FastAPI", "MongoDB"],
      status: "INTERVIEW",
      source: "LinkedIn"
    },
    {
      id: "c-3",
      code: "CND-2026-0003",
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      mobile: "+91-9723456789",
      location: "Gurugram",
      expYears: 6.0,
      currentCtc: 2200000,
      expectedCtc: 2800000,
      noticeDays: 45,
      skills: ["Operations", "Process Design", "Jira", "SQL"],
      status: "SCREENING",
      source: "Employee Referral"
    },
    {
      id: "c-4",
      code: "CND-2026-0004",
      name: "Sneha Mukherjee",
      email: "sneha.m@example.com",
      mobile: "+91-9634567890",
      location: "Mumbai",
      expYears: 3.5,
      currentCtc: 1200000,
      expectedCtc: 1600000,
      noticeDays: 30,
      skills: ["Recruitment", "ATS", "Sourcing", "Tech Hiring"],
      status: "OFFER",
      source: "Careers Portal"
    },
    {
      id: "c-5",
      code: "CND-2026-0005",
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      mobile: "+91-9545678901",
      location: "Delhi NCR",
      expYears: 2.0,
      currentCtc: 800000,
      expectedCtc: 1200000,
      noticeDays: 60,
      skills: ["JavaScript", "HTML", "CSS"],
      status: "APPLIED",
      source: "Agency"
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    fullName: "",
    email: "",
    mobile: "",
    location: "",
    experienceYears: "3",
    currentCtc: "",
    expectedCtc: "",
    noticePeriodDays: "30",
    skills: "TypeScript, React, Node.js"
  });

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `c-${Date.now()}`,
      code: `CND-2026-${String(candidates.length + 1).padStart(4, "0")}`,
      name: newCandidate.fullName,
      email: newCandidate.email,
      mobile: newCandidate.mobile,
      location: newCandidate.location || "Remote",
      expYears: parseFloat(newCandidate.experienceYears) || 0,
      currentCtc: parseFloat(newCandidate.currentCtc) || 0,
      expectedCtc: parseFloat(newCandidate.expectedCtc) || 0,
      noticeDays: parseInt(newCandidate.noticePeriodDays, 10) || 30,
      skills: newCandidate.skills.split(",").map((s) => s.trim()),
      status: "APPLIED",
      source: "Direct Sourcing"
    };
    setCandidates([created, ...candidates]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Candidate Database</h1>
          <p className="text-sm text-zinc-500">Central talent pool, resume parsing records, and candidate profiles.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add Candidate
        </Button>
      </div>

      {/* Filters & Search */}
      <Panel className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name, email, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                statusFilter === st
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-zinc-600 border-border hover:bg-zinc-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </Panel>

      {/* Candidates Table */}
      <Panel className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
              <tr>
                <th className="py-2.5 px-3">Candidate Code</th>
                <th className="py-2.5 px-3">Name & Contact</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-center">Exp</th>
                <th className="py-2.5 px-3">CTC (Current / Expected)</th>
                <th className="py-2.5 px-3">Skills</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-3 font-mono text-xs text-zinc-500">{c.code}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-zinc-900">{c.name}</p>
                    <p className="text-xs text-zinc-400">{c.email} • {c.mobile}</p>
                  </td>
                  <td className="py-3 px-3">{c.location}</td>
                  <td className="py-3 px-3 text-center font-semibold">{c.expYears} yrs</td>
                  <td className="py-3 px-3 text-xs">
                    <span className="text-zinc-500">₹{(c.currentCtc / 100000).toFixed(1)}L</span> /{" "}
                    <span className="font-semibold text-zinc-900">₹{(c.expectedCtc / 100000).toFixed(1)}L</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {c.skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px]">
                          {s}
                        </span>
                      ))}
                      {c.skills.length > 3 && (
                        <span className="text-[10px] text-zinc-400">+{c.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge tone={c.status === "OFFER" || c.status === "HIRED" ? "success" : "neutral"}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link href={"/ats/pipeline" as Route}>
                      <Button variant="secondary">View ATS</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-lg p-6 bg-white space-y-4 rounded-panel shadow-2xl">
            <h2 className="text-lg font-bold text-zinc-900 border-b border-border pb-3">Add Candidate Profile</h2>
            <form onSubmit={handleAddCandidate} className="space-y-3">
              <Field label="Full Name">
                <Input
                  required
                  value={newCandidate.fullName}
                  onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email Address">
                  <Input
                    required
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  />
                </Field>
                <Field label="Mobile Number">
                  <Input
                    required
                    value={newCandidate.mobile}
                    onChange={(e) => setNewCandidate({ ...newCandidate, mobile: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Location">
                  <Input
                    value={newCandidate.location}
                    onChange={(e) => setNewCandidate({ ...newCandidate, location: e.target.value })}
                  />
                </Field>
                <Field label="Exp (Years)">
                  <Input
                    type="number"
                    value={newCandidate.experienceYears}
                    onChange={(e) => setNewCandidate({ ...newCandidate, experienceYears: e.target.value })}
                  />
                </Field>
                <Field label="Notice (Days)">
                  <Input
                    type="number"
                    value={newCandidate.noticePeriodDays}
                    onChange={(e) => setNewCandidate({ ...newCandidate, noticePeriodDays: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Skills (comma separated)">
                <Input
                  value={newCandidate.skills}
                  onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })}
                />
              </Field>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Candidate
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
