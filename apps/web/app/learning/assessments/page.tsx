"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function AssessmentsPage() {
  const [assessments] = useState([
    {
      id: "asm-1",
      title: "GMP Cleanroom & Hygiene Final Examination",
      course: "Good Manufacturing Practices (GMP) & Hygiene Protocols",
      type: "FINAL_EXAM",
      timeLimitMinutes: 30,
      questionsCount: 20,
      passingPercent: 80,
      attemptsRemaining: 2,
      lastScore: 85,
      status: "PASSED"
    },
    {
      id: "asm-2",
      title: "POSH Statutory Assessment 2026",
      course: "Prevention of Sexual Harassment (POSH) 2026 Refresher",
      type: "CERTIFICATION_EXAM",
      timeLimitMinutes: 20,
      questionsCount: 15,
      passingPercent: 85,
      attemptsRemaining: 3,
      lastScore: null,
      status: "PENDING"
    },
    {
      id: "asm-3",
      title: "PostgreSQL Query Optimization & Indexing Quiz",
      course: "Distributed Systems Architecture with PostgreSQL",
      type: "QUIZ",
      timeLimitMinutes: 15,
      questionsCount: 10,
      passingPercent: 70,
      attemptsRemaining: 3,
      lastScore: null,
      status: "PENDING"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📝 Examinations, Quizzes & Assessments</h1>
          <p className="text-sm text-slate-600">
            Timed evaluations, randomized question pools, automated scoring, and certificate issuance tests.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/certifications" as Route}>
            <Button variant="secondary">🏆 My Certifications</Button>
          </Link>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((asm) => (
          <Panel key={asm.id} className="flex flex-col justify-between space-y-4 p-5">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase">{asm.type.replace(/_/g, " ")}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{asm.title}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">Course: {asm.course}</p>
                </div>
                <Badge tone={asm.status === "PASSED" ? "success" : "warning"}>{asm.status}</Badge>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">⏱️ Time Limit:</span>
                  <span className="font-semibold text-slate-900">{asm.timeLimitMinutes} Mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">❓ Total Questions:</span>
                  <span className="font-semibold text-slate-900">{asm.questionsCount} MCQs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">🎯 Passing Score:</span>
                  <span className="font-semibold text-slate-900">{asm.passingPercent}%</span>
                </div>
                {asm.lastScore !== null && (
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-emerald-700">
                    <span className="font-bold">Last Score:</span>
                    <span className="font-mono font-bold">{asm.lastScore}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{asm.attemptsRemaining} Attempts Left</span>
              <Button variant="primary">
                {asm.status === "PASSED" ? "Retake Exam" : "Start Assessment →"}
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
