"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../components/ui";

export default function TrainingAdminDashboardPage() {
  const [stats] = useState({
    activeCourses: 24,
    totalEnrollments: 342,
    completionRate: 88.4,
    complianceCoverage: 96.2,
    activeInstructors: 8,
    certificationsIssued: 184
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/admin/performance-settings" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Admin Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏛️ Enterprise LMS & Training Administration</h1>
          <p className="text-sm text-slate-600">
            Course authoring, learning paths, statutory compliance monitoring, certification management, and skill intelligence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={"/admin/courses" as Route}>
            <Button variant="primary">+ Create Course</Button>
          </Link>
          <Link href={"/admin/learning-analytics" as Route}>
            <Button variant="secondary">📈 LMS Analytics</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-primary">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Courses</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.activeCourses} Courses</div>
          <div className="mt-1 text-xs text-slate-600">Across 6 training categories</div>
        </Panel>
        <Panel className="border-l-4 border-l-emerald-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Enrollments</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{stats.totalEnrollments} Learners</div>
          <div className="mt-1 text-xs text-slate-600">{stats.completionRate}% Average Completion</div>
        </Panel>
        <Panel className="border-l-4 border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compliance Training Rate</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{stats.complianceCoverage}%</div>
          <div className="mt-1 text-xs text-slate-600">Statutory audits up to date</div>
        </Panel>
        <Panel className="border-l-4 border-l-purple-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Certificates Awarded</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{stats.certificationsIssued} Issued</div>
          <div className="mt-1 text-xs text-slate-600">GMP, Safety, Engineering</div>
        </Panel>
      </div>

      {/* Quick Navigation Hub */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href={"/admin/courses" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">📚</span>
            <h3 className="font-bold text-slate-900">Course & Module Builder</h3>
            <p className="text-xs text-slate-500">Create video lessons, PDF docs, SCORM interactive modules, and curriculum sequences.</p>
          </Panel>
        </Link>
        <Link href={"/admin/assessments" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">📝</span>
            <h3 className="font-bold text-slate-900">Assessment & Exam Designer</h3>
            <p className="text-xs text-slate-500">Configure randomized question banks, negative marking rules, timers, and pass criteria.</p>
          </Panel>
        </Link>
        <Link href={"/admin/compliance-training" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">🛡️</span>
            <h3 className="font-bold text-slate-900">Compliance & Mandatory Training</h3>
            <p className="text-xs text-slate-500">Monitor POSH, GMP, and Fire Safety due dates with automated escalation alerts.</p>
          </Panel>
        </Link>
        <Link href={"/admin/certifications" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">🏆</span>
            <h3 className="font-bold text-slate-900">Certification Master & Renewal</h3>
            <p className="text-xs text-slate-500">Manage certificate validity periods, issuing authorities, and automated renewal triggers.</p>
          </Panel>
        </Link>
        <Link href={"/admin/instructors" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">👨‍🏫</span>
            <h3 className="font-bold text-slate-900">Instructors & Workshop Calendar</h3>
            <p className="text-xs text-slate-500">Schedule virtual classrooms, classroom training rooms, and collect trainer ratings.</p>
          </Panel>
        </Link>
        <Link href={"/admin/skill-matrix" as Route}>
          <Panel className="p-5 hover:border-primary transition cursor-pointer space-y-2">
            <span className="text-2xl">🧠</span>
            <h3 className="font-bold text-slate-900">Enterprise Skill Matrix</h3>
            <p className="text-xs text-slate-500">Define skill taxonomies, 5-level proficiency descriptors, and employee benchmarking.</p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
