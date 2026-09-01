"use client";

import { Panel } from "../../../components/ui";

export default function AtsAnalyticsPage() {
  const funnel = [
    { stage: "Applications Received", count: 128, conversion: "100%" },
    { stage: "Screening Qualified", count: 74, conversion: "57.8%" },
    { stage: "Technical Evaluation", count: 42, conversion: "56.7%" },
    { stage: "Managerial Round", count: 21, conversion: "50.0%" },
    { stage: "HR Alignment", count: 14, conversion: "66.7%" },
    { stage: "Offers Dispatched", count: 11, conversion: "78.5%" },
    { stage: "Joined / Hired", count: 9, conversion: "81.8%" }
  ];

  const sourcingChannels = [
    { source: "Company Career Portal", applicants: 54, hires: 4, cost: "₹0", costPerHire: "₹0" },
    { source: "LinkedIn Direct & Recruiter", applicants: 42, hires: 3, cost: "₹45,000", costPerHire: "₹15,000" },
    { source: "Employee Referral Program", applicants: 20, hires: 2, cost: "₹30,000", costPerHire: "₹15,000" },
    { source: "Specialized Tech Agencies", applicants: 12, hires: 0, cost: "₹0", costPerHire: "₹0" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Talent Acquisition Analytics</h1>
        <p className="text-sm text-zinc-500">End-to-end recruitment funnel conversion, channel cost efficiency, and time-to-fill trends.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Panel className="p-4 border-l-4 border-l-primary">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Avg Time to Hire</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">22.4 Days</p>
          <span className="text-xs text-emerald-600 font-medium">↓ 14% improvement</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Offer Acceptance</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">81.8%</p>
          <span className="text-xs text-emerald-600 font-medium">9 of 11 offers accepted</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Avg Cost Per Hire</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">₹8,333</p>
          <span className="text-xs text-indigo-600 font-medium">Industry baseline ₹25k</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-zinc-500 uppercase">Funnel Efficiency</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">7.03%</p>
          <span className="text-xs text-zinc-500">Application to Hire</span>
        </Panel>
      </div>

      {/* Pipeline Funnel Visual */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-zinc-900">Recruitment Pipeline Conversion Funnel</h2>
        <div className="space-y-3">
          {funnel.map((step, idx) => {
            const widthPercent = Math.max(10, Math.round((step.count / 128) * 100));
            return (
              <div key={step.stage} className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-600">
                  <span className="font-medium text-zinc-900">{step.stage}</span>
                  <span>{step.count} candidates ({step.conversion} conversion)</span>
                </div>
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? "bg-sky-500"
                        : idx <= 3
                        ? "bg-indigo-500"
                        : idx <= 5
                        ? "bg-purple-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Sourcing Channel Performance */}
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-zinc-900">Sourcing Channel Cost & ROI Efficiency</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-border text-xs uppercase text-zinc-400 bg-zinc-50">
              <tr>
                <th className="py-2.5 px-3">Sourcing Channel</th>
                <th className="py-2.5 px-3 text-center">Applicants</th>
                <th className="py-2.5 px-3 text-center">Hires</th>
                <th className="py-2.5 px-3">Total Sourcing Cost</th>
                <th className="py-2.5 px-3">Effective Cost Per Hire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sourcingChannels.map((ch) => (
                <tr key={ch.source} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-3 font-semibold text-zinc-900">{ch.source}</td>
                  <td className="py-3 px-3 text-center">{ch.applicants}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">{ch.hires}</td>
                  <td className="py-3 px-3 font-mono">{ch.cost}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-zinc-900">{ch.costPerHire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
