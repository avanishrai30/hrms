"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Input, Panel } from "../../components/ui";

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");

  const [articles] = useState([
    {
      id: "art-1",
      title: "Employee Leave & Encashment Policy 2026",
      category: "HR Policies",
      summary: "Annual guidelines on earned leaves, casual leaves, maternity benefit, and year-end encashment caps.",
      version: 3,
      status: "PUBLISHED",
      updatedAt: "Aug 20, 2026",
      author: "Priya Sundaram (HR Director)"
    },
    {
      id: "art-2",
      title: "Corporate Travel & Hotel Per-Diem Entitlements",
      category: "Finance & Travel",
      summary: "Tier-1 and Tier-2 city daily allowances, booking class matrix, and expense settlement deadlines.",
      version: 2,
      status: "PUBLISHED",
      updatedAt: "Aug 15, 2026",
      author: "Vikram Malhotra (Finance VP)"
    },
    {
      id: "art-3",
      title: "IT Hardware Allocation, Repair & Security SOP",
      category: "IT & Security",
      summary: "Standard operating procedures for laptop issuance, biometrics onboarding, and asset recovery upon exit.",
      version: 4,
      status: "PUBLISHED",
      updatedAt: "Aug 10, 2026",
      author: "IT Infrastructure Team"
    },
    {
      id: "art-4",
      title: "EPF, ESI & Statutory Tax Deduction Manual",
      category: "Compliance",
      summary: "State-wise professional tax slabs, form 16 generation timelines, and TDS computation methodology.",
      version: 1,
      status: "PUBLISHED",
      updatedAt: "Jul 28, 2026",
      author: "Compliance & Payroll Cell"
    }
  ]);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase());
    if (selectedCat === "ALL") return matchSearch;
    return matchSearch && a.category === selectedCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📚 Enterprise Knowledge Base & SOPs</h1>
          <p className="text-sm text-slate-600">
            Centralized hub for HR policies, standard operating procedures, compliance manuals, and version-controlled documentation.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/knowledge/categories" as Route}>
            <Button variant="secondary">📁 Manage Categories</Button>
          </Link>
          <Link href={"/knowledge/new" as Route}>
            <Button variant="primary">+ Write Article</Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["ALL", "HR Policies", "Finance & Travel", "IT & Security", "Compliance"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                selectedCat === c ? "bg-primary text-white" : "bg-surface text-slate-700 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <Input
          placeholder="Search policies, SOPs, articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((art) => (
          <Panel key={art.id} className="flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
            <div>
              <div className="flex items-start justify-between">
                <Badge tone="neutral">{art.category}</Badge>
                <span className="text-xs font-mono text-slate-500">v{art.version}.0</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{art.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{art.summary}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Updated: {art.updatedAt} · {art.author}</span>
              <Link href={`/knowledge/${art.id}` as Route}>
                <Button variant="secondary">Read Article →</Button>
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
