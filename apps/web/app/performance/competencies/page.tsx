"use client";

import { useState } from "react";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function CompetenciesMatrixPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [competencies] = useState([
    { id: "comp-1", name: "System Architecture & Scalability", code: "TECH-ARCH", category: "TECHNICAL", description: "Design resilient, distributed microservices capable of high-throughput workloads.", mappedRolesCount: 6 },
    { id: "comp-2", name: "Data Integrity & Cloud Security", code: "TECH-SEC", category: "TECHNICAL", description: "Enforce multi-tenant isolation, data encryption at rest, and audit trail compliance.", mappedRolesCount: 8 },
    { id: "comp-3", name: "Radical Candor & Feedback", code: "BEH-FEED", category: "BEHAVIORAL", description: "Delivers direct, constructive feedback with high empathy and clarity.", mappedRolesCount: 14 },
    { id: "comp-4", name: "Cross-Functional Collaboration", code: "BEH-COLLAB", category: "BEHAVIORAL", description: "Builds high-trust bridges across engineering, product operations, and warehouse logistics.", mappedRolesCount: 18 },
    { id: "comp-5", name: "Strategic Vision & Team Leadership", code: "LEAD-STRAT", category: "LEADERSHIP", description: "Sets ambitious OKRs, mentors emerging talent, and drives business outcomes.", mappedRolesCount: 5 }
  ]);

  const filteredCompetencies = competencies.filter(
    (c) => selectedCategory === "ALL" || c.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">🧭 Competency Framework & Matrix</h1>
          <p className="text-sm text-zinc-500">Define organizational competencies and map expected proficiency levels per designation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Define Competency</Button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        {["ALL", "TECHNICAL", "BEHAVIORAL", "FUNCTIONAL", "LEADERSHIP"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              selectedCategory === cat ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Competencies Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompetencies.map((comp) => (
          <Panel key={comp.id} className="p-5 flex flex-col justify-between hover:border-indigo-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <Badge tone={comp.category === "TECHNICAL" ? "warning" : comp.category === "LEADERSHIP" ? "warning" : "neutral"}>
                  {comp.category}
                </Badge>
                <span className="text-[11px] font-mono text-zinc-400 font-semibold">{comp.code}</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mt-2">{comp.name}</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-3">{comp.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
              <span>Mapped to {comp.mappedRolesCount} Roles</span>
              <Button variant="secondary">Edit Mapping →</Button>
            </div>
          </Panel>
        ))}
      </div>

      {/* Add Competency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">Define New Competency</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Competency Name</label>
                <Input placeholder="e.g. Distributed Database Management" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Code</label>
                  <Input placeholder="e.g. TECH-DB" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Category</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>TECHNICAL</option>
                    <option>BEHAVIORAL</option>
                    <option>FUNCTIONAL</option>
                    <option>LEADERSHIP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700">Description</label>
                <textarea className="w-full rounded-lg border border-zinc-200 p-2 text-xs" rows={3} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowAddModal(false)}>Save Competency</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
