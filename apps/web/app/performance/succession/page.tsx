"use client";

import { useState } from "react";
import { Badge, Button, Panel } from "../../../components/ui";

export default function SuccessionPlanningPage() {
  const [activeView, setActiveView] = useState<"NINE_BOX" | "POSITIONS">("NINE_BOX");

  const [nineBoxData] = useState<Record<string, Array<{ id: string; name: string; role: string }>>>({
    STAR_HIGH_POTENTIAL: [
      { id: "e1", name: "Aarav Sharma", role: "Senior Backend Engineer" },
      { id: "e2", name: "Meera Nair", role: "Product Designer" }
    ],
    HIGH_PERFORMER_GROWTH: [
      { id: "e3", name: "Pooja Hegde", role: "Frontend Architect" }
    ],
    SOLID_PERFORMER_KEY: [
      { id: "e4", name: "Vikram Malhotra", role: "DevOps Engineer" }
    ],
    HIGH_POTENTIAL_DEVELOP: [
      { id: "e5", name: "Ananya Iyer", role: "Data Analyst" }
    ],
    CORE_CONTRIBUTOR: [
      { id: "e6", name: "Karan Patel", role: "Operations Specialist" },
      { id: "e7", name: "Deepak S", role: "Warehouse Associate" }
    ],
    EFFECTIVE_PERFORMER: [
      { id: "e8", name: "Sunil Kumar", role: "Field QA" }
    ],
    DILEMMA_QUESTION_MARK: [
      { id: "e9", name: "Rajat Verma", role: "Junior SRE" }
    ],
    UNDERPERFORMER_COACH: [],
    RISK_LOW_PERFORMER: []
  });

  const [positions] = useState([
    {
      id: "pos-1",
      title: "VP of Engineering",
      designation: "VP Engineering",
      criticality: "CRITICAL",
      riskOfLoss: "MEDIUM",
      impactOfLoss: "VERY HIGH",
      successors: [
        { name: "Aarav Sharma", readiness: "READY_NOW", flightRisk: "LOW" },
        { name: "Pooja Hegde", readiness: "READY_IN_1_YEAR", flightRisk: "MEDIUM" }
      ]
    },
    {
      id: "pos-2",
      title: "Head of Product & Design",
      designation: "Head of Product",
      criticality: "CRITICAL",
      riskOfLoss: "LOW",
      impactOfLoss: "HIGH",
      successors: [
        { name: "Meera Nair", readiness: "READY_IN_6_MONTHS", flightRisk: "LOW" }
      ]
    }
  ]);

  const gridCells = [
    { key: "HIGH_POTENTIAL_DEVELOP", label: "High Potential", category: "TOP TALENT", perf: "Med Perf", pot: "High Pot", color: "bg-sky-50/70 border-sky-200" },
    { key: "HIGH_PERFORMER_GROWTH", label: "High Performer", category: "TOP TALENT", perf: "High Perf", pot: "Med Pot", color: "bg-indigo-50/70 border-indigo-200" },
    { key: "STAR_HIGH_POTENTIAL", label: "Star (Top Talent)", category: "TOP TALENT", perf: "High Perf", pot: "High Pot", color: "bg-emerald-50/80 border-emerald-300" },

    { key: "DILEMMA_QUESTION_MARK", label: "Enigma / Dilemma", category: "ACTION NEEDED", perf: "Low Perf", pot: "High Pot", color: "bg-amber-50/50 border-amber-200" },
    { key: "CORE_CONTRIBUTOR", label: "Core Player", category: "CORE TALENT", perf: "Med Perf", pot: "Med Pot", color: "bg-zinc-50 border-zinc-200" },
    { key: "SOLID_PERFORMER_KEY", label: "Solid Professional", category: "CORE TALENT", perf: "High Perf", pot: "Low Pot", color: "bg-blue-50/50 border-blue-200" },

    { key: "RISK_LOW_PERFORMER", label: "Talent Risk", category: "ACTION NEEDED", perf: "Low Perf", pot: "Low Pot", color: "bg-rose-50/60 border-rose-200" },
    { key: "UNDERPERFORMER_COACH", label: "Inconsistent Player", category: "ACTION NEEDED", perf: "Low Perf", pot: "Med Pot", color: "bg-orange-50/50 border-orange-200" },
    { key: "EFFECTIVE_PERFORMER", label: "Effective Contributor", category: "CORE TALENT", perf: "Med Perf", pot: "Low Pot", color: "bg-zinc-50 border-zinc-200" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">🗺️ Succession Planning & 9-Box Grid</h1>
          <p className="text-sm text-zinc-500">
            Map workforce Performance vs. Potential, identify high-potential leaders, and secure succession benches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-200 bg-white p-1">
            <button
              onClick={() => setActiveView("NINE_BOX")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeView === "NINE_BOX" ? "bg-indigo-600 text-white" : "text-zinc-600"
              }`}
            >
              9-Box Grid
            </button>
            <button
              onClick={() => setActiveView("POSITIONS")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeView === "POSITIONS" ? "bg-indigo-600 text-white" : "text-zinc-600"
              }`}
            >
              Critical Positions
            </button>
          </div>
          <Button variant="primary">+ Add Position</Button>
        </div>
      </div>

      {activeView === "NINE_BOX" ? (
        /* 9-Box Grid Visual Matrix */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {gridCells.map((cell) => {
              const members = nineBoxData[cell.key] || [];
              return (
                <Panel key={cell.key} className={`p-4 border min-h-[160px] flex flex-col justify-between ${cell.color}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">{cell.label}</h3>
                      <span className="text-[10px] font-bold text-zinc-500">{members.length}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{cell.perf} • {cell.pot}</p>

                    {/* Member Avatars */}
                    <div className="mt-3 space-y-1.5">
                      {members.map((m) => (
                        <div key={m.id} className="rounded-lg bg-white/90 p-2 border border-black/5 shadow-xs text-xs">
                          <p className="font-semibold text-zinc-900">{m.name}</p>
                          <p className="text-[10px] text-zinc-500">{m.role}</p>
                        </div>
                      ))}
                      {members.length === 0 && (
                        <p className="text-[11px] text-zinc-400 italic">No employees in quadrant</p>
                      )}
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      ) : (
        /* Critical Succession Positions */
        <div className="grid gap-4 md:grid-cols-2">
          {positions.map((pos) => (
            <Panel key={pos.id} className="p-5">
              <div className="flex items-center justify-between">
                <Badge tone="danger">{pos.criticality} ROLE</Badge>
                <span className="text-xs font-semibold text-zinc-400">Risk of Loss: {pos.riskOfLoss}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mt-2">{pos.title}</h3>
              <p className="text-xs text-zinc-500">Designation: {pos.designation}</p>

              <div className="mt-4 border-t border-zinc-100 pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Successor Bench ({pos.successors.length})</h4>
                <div className="mt-2 space-y-2">
                  {pos.successors.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-xs border border-zinc-100">
                      <div>
                        <p className="font-semibold text-zinc-900">{s.name}</p>
                        <p className="text-[10px] text-zinc-500">Flight Risk: {s.flightRisk}</p>
                      </div>
                      <Badge tone={s.readiness === "READY_NOW" ? "success" : "warning"}>
                        {s.readiness.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
