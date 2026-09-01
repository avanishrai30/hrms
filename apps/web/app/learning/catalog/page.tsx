"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function CourseCatalogPage() {
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [search, setSearch] = useState("");

  const courses = [
    {
      id: "crs-1",
      code: "COMP-101",
      title: "Good Manufacturing Practices (GMP) & Hygiene Protocols",
      category: "COMPLIANCE",
      delivery: "SELF_PACED",
      difficulty: "BEGINNER",
      duration: "60 mins",
      isMandatory: true,
      desc: "Comprehensive standards on cleanroom maintenance, personal hygiene, and contamination prevention in organic processing facilities."
    },
    {
      id: "crs-2",
      code: "TECH-201",
      title: "Distributed Systems Architecture with PostgreSQL & NestJS",
      category: "ENGINEERING",
      delivery: "SELF_PACED",
      difficulty: "ADVANCED",
      duration: "180 mins",
      isMandatory: false,
      desc: "Deep dive into multi-tenant database isolation, write-ahead logging, indexing performance, and event queues."
    },
    {
      id: "crs-3",
      code: "OPS-102",
      title: "Warehouse Inventory Management, FIFO & Barcode Scanning",
      category: "OPERATIONS",
      delivery: "HYBRID",
      difficulty: "INTERMEDIATE",
      duration: "90 mins",
      isMandatory: true,
      desc: "Standard Operating Procedures for batch tracking, inward inspection, FIFO rotation, and dispatch reconciliations."
    },
    {
      id: "crs-4",
      code: "COMP-102",
      title: "Prevention of Sexual Harassment (POSH) 2026 Refresher",
      category: "COMPLIANCE",
      delivery: "SELF_PACED",
      difficulty: "BEGINNER",
      duration: "45 mins",
      isMandatory: true,
      desc: "Statutory mandatory training covering workplace ethics, ICC filing mechanisms, and supportive workplace culture."
    },
    {
      id: "crs-5",
      code: "LEAD-301",
      title: "First-Time Engineering & Operations People Manager Track",
      category: "LEADERSHIP",
      delivery: "INSTRUCTOR_LED",
      difficulty: "INTERMEDIATE",
      duration: "240 mins",
      isMandatory: false,
      desc: "1:1 coaching frameworks, performance appraisal calibration, constructive feedback delivery, and burnout prevention."
    }
  ];

  const filtered = courses.filter((c) => {
    if (selectedCat !== "ALL" && c.category !== selectedCat) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📚 Training & Course Catalog</h1>
          <p className="text-sm text-slate-600">
            Browse self-paced modules, virtual workshops, and statutory compliance certifications.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/learning/my-courses" as Route}>
            <Button variant="secondary">My Enrollments</Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["ALL", "COMPLIANCE", "ENGINEERING", "OPERATIONS", "LEADERSHIP"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                selectedCat === cat ? "bg-primary text-white" : "bg-surface text-slate-700 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search courses by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((crs) => (
          <Panel key={crs.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">{crs.code}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{crs.title}</h3>
                </div>
                {crs.isMandatory && <Badge tone="danger">MANDATORY</Badge>}
              </div>
              <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">{crs.desc}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>⏱️ {crs.duration}</span>
                <span>🎯 {crs.difficulty}</span>
                <span>📡 {crs.delivery}</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="primary">Enroll Course →</Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
