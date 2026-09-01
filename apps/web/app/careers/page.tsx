"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../components/ui";

export default function PublicCareersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  const jobs = [
    {
      id: "job-1",
      slug: "senior-full-stack-engineer-req-2026-001",
      title: "Senior Full Stack Engineer",
      company: "VC Organics",
      department: "Engineering",
      location: "Bengaluru / Hybrid",
      employmentType: "Full-Time",
      experience: "3 - 7 years",
      skills: ["TypeScript", "NestJS", "React", "PostgreSQL", "AWS"],
      summary: "Build resilient, mission-critical workforce automation, AI copilot engines, and supply chain telemetry platforms."
    },
    {
      id: "job-2",
      slug: "product-operations-lead-req-2026-002",
      title: "Product Operations Lead",
      company: "VC Organics",
      department: "Operations",
      location: "Mumbai",
      employmentType: "Full-Time",
      experience: "4 - 8 years",
      skills: ["Operations", "Process Design", "Jira", "SQL"],
      summary: "Drive cross-functional product rollout, logistics workflows, and standard operating procedure excellence."
    },
    {
      id: "job-3",
      slug: "talent-acquisition-specialist-req-2026-003",
      title: "Talent Acquisition Specialist",
      company: "VC Organics",
      department: "Human Resources",
      location: "Bengaluru",
      employmentType: "Full-Time",
      experience: "2 - 5 years",
      skills: ["Recruitment", "ATS", "Sourcing", "Tech Hiring"],
      summary: "Lead end-to-end recruitment pipelines, campus initiatives, and employer branding across India."
    }
  ];

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || j.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge tone="success">We're Hiring Across India</Badge>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight sm:text-5xl">
            Build the Future of Enterprise Workforce Tech
          </h1>
          <p className="text-base text-zinc-600 max-w-2xl mx-auto">
            Join VC Organics in creating high-impact software, intelligent automation, and sustainable operations. Explore our open positions below.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href={"/candidate-portal" as Route}>
              <Button variant="secondary">🔍 Track Existing Application</Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Panel className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white shadow-xs">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by job title, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "Engineering", "Operations", "Human Resources"].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selectedDept === dept
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-zinc-600 border-border hover:bg-zinc-50"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </Panel>

        {/* Jobs Listing */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Panel className="p-12 text-center text-zinc-500">
              No open positions match your search criteria. Check back soon!
            </Panel>
          ) : (
            filteredJobs.map((job) => (
              <Panel
                key={job.id}
                className="p-6 bg-white hover:border-primary transition duration-150 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{job.title}</h2>
                    <p className="text-sm text-zinc-500">
                      {job.company} • {job.department} • <span className="text-zinc-700 font-medium">{job.location}</span>
                    </p>
                  </div>
                  <Link href={`/careers/jobs/${job.slug}` as Route}>
                    <Button variant="primary">View & Apply →</Button>
                  </Link>
                </div>

                <p className="text-sm text-zinc-600 leading-relaxed">{job.summary}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs text-zinc-500">
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <span>Experience: <strong className="text-zinc-800">{job.experience}</strong></span>
                </div>
              </Panel>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
