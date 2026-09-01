"use client";

import { useState } from "react";
import { Badge, Button, Panel } from "../../../components/ui";

export default function PerformanceSettingsPage() {
  const [incrementRules, setIncrementRules] = useState([
    { label: "OUTSTANDING", defaultPct: 18.0, minPct: 15.0, maxPct: 25.0, allocation: 20 },
    { label: "EXCEEDS_EXPECTATIONS", defaultPct: 12.0, minPct: 10.0, maxPct: 15.0, allocation: 30 },
    { label: "MEETS_EXPECTATIONS", defaultPct: 8.0, minPct: 6.0, maxPct: 10.0, allocation: 40 },
    { label: "NEEDS_IMPROVEMENT", defaultPct: 3.0, minPct: 0.0, maxPct: 5.0, allocation: 10 },
    { label: "UNSATISFACTORY", defaultPct: 0.0, minPct: 0.0, maxPct: 0.0, allocation: 0 }
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">⚙️ PMS & Salary Increment Settings</h1>
          <p className="text-sm text-zinc-500">Configure salary increment matrices, rating weights, and bell curve target quotas.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleSave}>Save Rule Matrix</Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          ✓ Salary increment rules and PMS configurations saved successfully!
        </div>
      )}

      {/* Increment Matrix Config */}
      <Panel className="p-6">
        <h3 className="font-semibold text-zinc-900">Performance Salary Increment Matrix</h3>
        <p className="text-xs text-zinc-500">Recommended percentage CTC bump per calibrated performance rating</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-600">
              <tr>
                <th className="p-3">Rating Label</th>
                <th className="p-3 text-center">Default Bump (%)</th>
                <th className="p-3 text-center">Min (%)</th>
                <th className="p-3 text-center">Max (%)</th>
                <th className="p-3 text-center">Budget Allocation (%)</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {incrementRules.map((rule, idx) => (
                <tr key={rule.label} className="hover:bg-zinc-50/60">
                  <td className="p-3 font-semibold text-zinc-900">
                    <Badge tone={rule.label === "OUTSTANDING" ? "success" : rule.label === "EXCEEDS_EXPECTATIONS" ? "warning" : "neutral"}>
                      {rule.label.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      className="w-20 rounded border border-zinc-200 p-1 text-center font-bold text-zinc-900"
                      value={rule.defaultPct}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setIncrementRules((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, defaultPct: val } : r))
                        );
                      }}
                    />
                  </td>
                  <td className="p-3 text-center text-zinc-500">{rule.minPct}%</td>
                  <td className="p-3 text-center text-zinc-500">{rule.maxPct}%</td>
                  <td className="p-3 text-center font-semibold text-indigo-600">{rule.allocation}%</td>
                  <td className="p-3 text-right">
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Target Bell Curve Quotas */}
      <Panel className="p-6">
        <h3 className="font-semibold text-zinc-900">Enterprise Bell Curve Distribution Targets</h3>
        <p className="text-xs text-zinc-500">Standard distribution model applied during HR calibration sessions</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Outstanding</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">5%</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Exceeds</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">15%</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Meets</span>
            <p className="text-2xl font-black text-zinc-900 mt-1">60%</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Needs Imp</span>
            <p className="text-2xl font-black text-amber-600 mt-1">15%</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Poor / Unsat</span>
            <p className="text-2xl font-black text-rose-600 mt-1">5%</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
