"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../components/ui";

type ApplicationStage =
  | "APPLIED"
  | "SCREENING"
  | "TECHNICAL_ROUND"
  | "MANAGER_ROUND"
  | "HR_ROUND"
  | "OFFER"
  | "JOINED"
  | "REJECTED";

interface CandidateCard {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  expYears: number;
  matchScore: number;
  noticeDays: number;
  stage: ApplicationStage;
  skills: string[];
}

const STAGES: Array<{ id: ApplicationStage; label: string; color: string }> = [
  { id: "APPLIED", label: "Applied", color: "border-sky-500 text-sky-700 bg-sky-50" },
  { id: "SCREENING", label: "Screening", color: "border-indigo-500 text-indigo-700 bg-indigo-50" },
  { id: "TECHNICAL_ROUND", label: "Technical Round", color: "border-amber-500 text-amber-700 bg-amber-50" },
  { id: "MANAGER_ROUND", label: "Manager Round", color: "border-purple-500 text-purple-700 bg-purple-50" },
  { id: "HR_ROUND", label: "HR Round", color: "border-pink-500 text-pink-700 bg-pink-50" },
  { id: "OFFER", label: "Offer Released", color: "border-emerald-500 text-emerald-700 bg-emerald-50" },
  { id: "JOINED", label: "Joined / Hired", color: "border-emerald-600 text-emerald-800 bg-emerald-100" },
  { id: "REJECTED", label: "Rejected", color: "border-rose-500 text-rose-700 bg-rose-50" }
];

export default function AtsPipelineKanbanPage() {
  const [candidates, setCandidates] = useState<CandidateCard[]>([
    {
      id: "c1",
      code: "APP-2026-0001",
      name: "Aakash Sharma",
      email: "aakash.sharma@example.com",
      phone: "+91-9876543210",
      role: "Senior Full Stack Engineer",
      expYears: 4.5,
      matchScore: 92,
      noticeDays: 30,
      stage: "TECHNICAL_ROUND",
      skills: ["TypeScript", "NestJS", "React", "PostgreSQL"]
    },
    {
      id: "c2",
      code: "APP-2026-0002",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91-9812345678",
      role: "Senior Full Stack Engineer",
      expYears: 5.0,
      matchScore: 88,
      noticeDays: 15,
      stage: "MANAGER_ROUND",
      skills: ["Python", "Docker", "AWS", "FastAPI"]
    },
    {
      id: "c3",
      code: "APP-2026-0003",
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "+91-9723456789",
      role: "Product Operations Lead",
      expYears: 6.0,
      matchScore: 85,
      noticeDays: 45,
      stage: "SCREENING",
      skills: ["Operations", "Process Design", "Jira", "SQL"]
    },
    {
      id: "c4",
      code: "APP-2026-0004",
      name: "Sneha Mukherjee",
      email: "sneha.m@example.com",
      phone: "+91-9634567890",
      role: "Talent Acquisition Specialist",
      expYears: 3.5,
      matchScore: 94,
      noticeDays: 30,
      stage: "OFFER",
      skills: ["Recruitment", "ATS", "Sourcing", "Tech Hiring"]
    },
    {
      id: "c5",
      code: "APP-2026-0005",
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      phone: "+91-9545678901",
      role: "Senior Full Stack Engineer",
      expYears: 2.0,
      matchScore: 64,
      noticeDays: 60,
      stage: "APPLIED",
      skills: ["JavaScript", "HTML", "CSS"]
    }
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateCard | null>(null);

  const moveCandidate = (id: string, newStage: ApplicationStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c))
    );
    if (selectedCandidate?.id === id) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">ATS Visual Hiring Pipeline</h1>
          <p className="text-sm text-zinc-500">Live Kanban board for tracking and advancing candidate hiring stages.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={"/ats/interviews" as Route}>
            <Button variant="secondary">🗓️ Schedule Interview</Button>
          </Link>
          <Link href={"/ats/offers" as Route}>
            <Button variant="primary">📄 Generate Offer</Button>
          </Link>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 rounded-panel border border-border bg-zinc-50/70 p-3 flex flex-col h-[700px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-400 bg-white px-2 py-0.5 rounded-full border border-border">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
                {stageCandidates.length === 0 ? (
                  <div className="h-32 grid place-items-center rounded-panel border border-dashed border-zinc-300 text-xs text-zinc-400">
                    No candidates
                  </div>
                ) : (
                  stageCandidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="cursor-pointer rounded-panel border border-border bg-white p-3 shadow-xs hover:border-primary hover:shadow-md transition duration-150 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-zinc-900 leading-tight">{c.name}</p>
                          <p className="text-xs text-zinc-500">{c.role}</p>
                        </div>
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                            c.matchScore >= 85
                              ? "bg-emerald-50 text-emerald-700"
                              : c.matchScore >= 70
                              ? "bg-amber-50 text-amber-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {c.matchScore}% Match
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((sk) => (
                          <span key={sk} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-border/50">
                        <span>{c.expYears} yrs exp</span>
                        <span>{c.noticeDays}d notice</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Detail Modal / Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-xl p-6 bg-white space-y-5 rounded-panel shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-mono text-zinc-400">{selectedCandidate.code}</span>
                <h2 className="text-xl font-bold text-zinc-900">{selectedCandidate.name}</h2>
                <p className="text-sm text-zinc-500">{selectedCandidate.role}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-zinc-400 hover:text-zinc-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-panel border border-border">
                <span className="text-zinc-400">Email</span>
                <p className="font-semibold text-zinc-900">{selectedCandidate.email}</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-panel border border-border">
                <span className="text-zinc-400">Mobile</span>
                <p className="font-semibold text-zinc-900">{selectedCandidate.phone}</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-panel border border-border">
                <span className="text-zinc-400">Experience</span>
                <p className="font-semibold text-zinc-900">{selectedCandidate.expYears} Years</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-panel border border-border">
                <span className="text-zinc-400">Notice Period</span>
                <p className="font-semibold text-zinc-900">{selectedCandidate.noticeDays} Days</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-700 mb-2">Technical Skills & Competencies</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.skills.map((s) => (
                  <span key={s} className="px-2 py-1 bg-sky-50 text-sky-700 rounded-md text-xs font-medium border border-sky-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Move Stage Selector */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-zinc-700">Advance Stage</p>
              <div className="grid grid-cols-4 gap-2">
                {STAGES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => moveCandidate(selectedCandidate.id, st.id)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium border transition ${
                      selectedCandidate.stage === st.id
                        ? "bg-primary text-white border-primary"
                        : "bg-zinc-50 text-zinc-700 border-border hover:bg-zinc-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="secondary" onClick={() => setSelectedCandidate(null)}>
                Close
              </Button>
              <Link href={`/ats/interviews` as Route}>
                <Button variant="primary">Schedule Round</Button>
              </Link>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
