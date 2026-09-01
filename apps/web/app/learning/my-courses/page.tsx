"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

interface CourseModuleItem {
  title: string;
  duration: string;
  completed: boolean;
}

interface MyCourseItem {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  watchTime: string;
  isMandatory: boolean;
  dueDate?: string;
  completedDate?: string;
  modules: CourseModuleItem[];
}

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<"ENROLLED" | "COMPLETED">("ENROLLED");
  const [selectedCourse, setSelectedCourse] = useState<MyCourseItem | null>(null);

  const myCourses: MyCourseItem[] = [
    {
      id: "enr-1",
      title: "Good Manufacturing Practices (GMP) & Hygiene Protocols",
      category: "Compliance",
      status: "IN_PROGRESS",
      progress: 75,
      watchTime: "45 / 60 mins",
      isMandatory: true,
      dueDate: "Sep 15, 2026",
      modules: [
        { title: "Module 1: Facility Sanitation Standards", duration: "20 mins", completed: true },
        { title: "Module 2: Personal Hygiene & Protective Gear", duration: "25 mins", completed: true },
        { title: "Module 3: Contamination Mitigation & Quarantine SOPs", duration: "15 mins", completed: false }
      ]
    },
    {
      id: "enr-2",
      title: "Distributed Systems Architecture with PostgreSQL",
      category: "Engineering",
      status: "IN_PROGRESS",
      progress: 40,
      watchTime: "72 / 180 mins",
      isMandatory: false,
      dueDate: "Sep 30, 2026",
      modules: [
        { title: "Module 1: Multi-Tenant Schema Partitioning", duration: "60 mins", completed: true },
        { title: "Module 2: Read Replicas & Connection Pooling", duration: "60 mins", completed: false },
        { title: "Module 3: Distributed Locks & Redis Redlock", duration: "60 mins", completed: false }
      ]
    },
    {
      id: "enr-3",
      title: "Workplace Fire Safety & Evacuation Protocols 2026",
      category: "Safety",
      status: "COMPLETED",
      progress: 100,
      watchTime: "30 / 30 mins",
      isMandatory: true,
      completedDate: "Aug 15, 2026",
      modules: [
        { title: "Module 1: Emergency Alarm Identification", duration: "15 mins", completed: true },
        { title: "Module 2: Assembly Points & Extinguisher Operation", duration: "15 mins", completed: true }
      ]
    }
  ];

  const filtered = myCourses.filter((c) => {
    if (activeTab === "ENROLLED") return c.status !== "COMPLETED";
    return c.status === "COMPLETED";
  });

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📖 My Learning Courses & Modules</h1>
          <p className="text-sm text-slate-600">
            Resume active lessons, stream training videos, download reference attachments, and complete section quizzes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/catalog" as Route}>
            <Button variant="primary">+ Browse Catalog</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ENROLLED")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
            activeTab === "ENROLLED" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ⚡ In-Progress & Upcoming ({myCourses.filter((c) => c.status !== "COMPLETED").length})
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
            activeTab === "COMPLETED" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🏆 Completed ({myCourses.filter((c) => c.status === "COMPLETED").length})
        </button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {filtered.map((crs) => (
            <div key={crs.id} onClick={() => setSelectedCourse(crs)} className="cursor-pointer">
              <Panel
                className={`p-5 transition border-2 ${
                  selectedCourse?.id === crs.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-primary uppercase">{crs.category}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{crs.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Watch Time: {crs.watchTime}</p>
                  </div>
                  {crs.isMandatory && <Badge tone="danger">MANDATORY</Badge>}
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Course Progress</span>
                    <span className="font-mono text-primary">{crs.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${crs.progress}%` }}></div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {crs.status === "COMPLETED" ? `Completed on ${crs.completedDate}` : `Due: ${crs.dueDate}`}
                  </span>
                  <Button variant="primary">
                    {crs.status === "COMPLETED" ? "Review Course" : "Continue Lesson →"}
                  </Button>
                </div>
              </Panel>
            </div>
          ))}
        </div>

        {/* Lesson Player / Outline Sidebar */}
        <div>
          <Panel className="space-y-4 p-5 sticky top-6">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              {selectedCourse ? selectedCourse.title : "Select a Course to View Modules"}
            </h3>
            {selectedCourse ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">Curriculum Outline:</span>
                {selectedCourse.modules.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${m.completed ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                      <span className="font-medium text-slate-800">{m.title}</span>
                    </div>
                    <span className="font-mono text-slate-500 text-[11px]">{m.duration}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-100">
                  <Button variant="primary" className="w-full">
                    ▶️ Launch Lesson Player
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click on any course from the list on the left to inspect modules and lesson playback state.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
