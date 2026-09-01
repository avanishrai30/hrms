"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../components/ui";

export default function LearningHomePage() {
  const [stats] = useState({
    enrolledCourses: 4,
    completedCourses: 9,
    activeCertifications: 3,
    learningHours: 28.5,
    mandatoryDue: 1
  });

  const [inProgress] = useState([
    {
      id: "crs-1",
      title: "Good Manufacturing Practices (GMP) & Hygiene Protocols",
      category: "Compliance & Safety",
      progress: 75,
      deliveryType: "SELF_PACED",
      dueDate: "Sep 15, 2026",
      isMandatory: true
    },
    {
      id: "crs-2",
      title: "Distributed Systems Architecture with PostgreSQL",
      category: "Engineering",
      progress: 40,
      deliveryType: "SELF_PACED",
      dueDate: "Sep 30, 2026",
      isMandatory: false
    }
  ]);

  const [aiRecommendations] = useState([
    {
      id: "rec-1",
      title: "Prevention of Sexual Harassment (POSH) 2026 Refresher",
      category: "Compliance",
      matchScore: 98,
      reason: "Mandatory annual statutory compliance training"
    },
    {
      id: "rec-2",
      title: "Advanced Warehouse Inventory Reconciliation & FIFO",
      category: "Operations",
      matchScore: 92,
      reason: "Recommended based on your target role competency benchmarks"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎓 Learning Management & Training Academy</h1>
          <p className="text-sm text-slate-600">
            Enterprise LMS, personalized skill roadmaps, compliance certifications, and interactive training modules.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/catalog" as Route}>
            <Button variant="primary">📚 Browse Course Catalog</Button>
          </Link>
          <Link href={"/learning/my-courses" as Route}>
            <Button variant="secondary">📖 My Courses</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">In-Progress Courses</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.enrolledCourses} Enrolled</div>
          <div className="mt-1 text-xs text-slate-600">1 mandatory course due soon</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Courses</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{stats.completedCourses} Completed</div>
          <div className="mt-1 text-xs text-slate-600">Across 3 learning paths</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Certifications</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{stats.activeCertifications} Certified</div>
          <div className="mt-1 text-xs text-slate-600">GMP, Fire Safety, Security</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Learning Time Logged</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{stats.learningHours} Hours</div>
          <div className="mt-1 text-xs text-slate-600">+4.5 hrs this month</div>
        </Panel>
      </div>

      {/* Active In-Progress Courses */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">⚡ Continue Learning</h2>
          <Link href={"/learning/my-courses" as Route} className="text-xs font-semibold text-primary hover:underline">
            View All ({stats.enrolledCourses}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {inProgress.map((crs) => (
            <div key={crs.id} className="rounded-xl border border-slate-200 bg-surface p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase">{crs.category}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{crs.title}</h3>
                </div>
                {crs.isMandatory && <Badge tone="danger">MANDATORY</Badge>}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Progress</span>
                  <span className="font-mono font-bold text-primary">{crs.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${crs.progress}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Due: <span className="font-semibold text-slate-700">{crs.dueDate}</span></span>
                <Link href={"/learning/my-courses" as Route}>
                  <Button variant="primary">Resume Lesson →</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* AI Learning Recommendations */}
      <Panel className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">🤖 AI Recommended For Your Career Journey</h2>
            <p className="text-xs text-slate-500">Personalized course suggestions based on role competencies, performance reviews, and compliance deadlines.</p>
          </div>
          <Badge tone="success">AI POWERED</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {aiRecommendations.map((rec) => (
            <div key={rec.id} className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase">{rec.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rec.title}</h3>
                </div>
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-800">
                  {rec.matchScore}% Match
                </span>
              </div>
              <p className="text-xs text-slate-600">{rec.reason}</p>
              <div className="pt-2 flex justify-end">
                <Link href={"/learning/catalog" as Route}>
                  <Button variant="secondary">Enroll Now</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
