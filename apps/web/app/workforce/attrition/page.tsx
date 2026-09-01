"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function AttritionRiskPage() {
  const [employeesRisk] = useState([
    {
      id: "emp-1",
      name: "Aarav Sharma",
      code: "EMP-042",
      role: "Staff Backend Engineer",
      department: "Software Engineering",
      riskScore: 78,
      riskTier: "CRITICAL",
      drivers: [
        "High performer without promotion for over 28 months",
        "Compensation is below 85% of market benchmark"
      ],
      mitigating: [
        "Active learner with 3 LMS certifications completed this quarter"
      ],
      actions: [
        "Evaluate for immediate promotion or leadership pathway in upcoming cycle",
        "Conduct off-cycle market equity compensation correction"
      ]
    },
    {
      id: "emp-2",
      name: "Ramesh Pawar",
      code: "EMP-109",
      role: "Warehouse Shift Supervisor",
      department: "Warehouse & Logistics",
      riskScore: 58,
      riskTier: "HIGH",
      drivers: [
        "Sudden spike in single-day leave requests in last 90 days",
        "Frequent manager turnover (2 managers in 12 months)"
      ],
      mitigating: [
        "Strong tenure (>4 years with VC Organics)"
      ],
      actions: [
        "Manager 1:1 check-in to assess work-life balance and operational fatigue"
      ]
    },
    {
      id: "emp-3",
      name: "Kavita Rao",
      code: "EMP-077",
      role: "Frontend Engineer",
      department: "Software Engineering",
      riskScore: 22,
      riskTier: "LOW",
      drivers: [],
      mitigating: [
        "Competitive salary above market median",
        "Regular 1:1 check-ins and high engagement"
      ],
      actions: [
        "Maintain standard quarterly coaching cadence"
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/workforce" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Workforce Hub
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🔮 Explainable AI Flight Risk & Attrition Predictor</h1>
          <p className="text-sm text-slate-600">
            Transparent retention intelligence synthesizing tenure, compensation equity, leave spikes, and promotion velocity without black-box scoring.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">⚡ Run Retention Scan</Button>
        </div>
      </div>

      {/* Attrition Risk Cards */}
      <div className="space-y-4">
        {employeesRisk.map((emp) => (
          <Panel key={emp.id} className="p-5 space-y-4 border-l-4 border-l-primary">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{emp.code} · {emp.department}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{emp.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-semibold">Flight Risk Score</div>
                  <div className="font-mono text-2xl font-black text-slate-900">{emp.riskScore} / 100</div>
                </div>
                <Badge tone={emp.riskTier === "CRITICAL" || emp.riskTier === "HIGH" ? "danger" : "success"}>
                  {emp.riskTier} RISK
                </Badge>
              </div>
            </div>

            {/* Explainability Breakdown */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100 text-xs">
              <div className="rounded-lg bg-rose-50/50 p-3 border border-rose-100 space-y-1.5">
                <span className="font-bold text-rose-800 uppercase tracking-wider text-[11px]">Primary Risk Drivers:</span>
                {emp.drivers.length > 0 ? (
                  <ul className="list-disc list-inside text-rose-900 space-y-1">
                    {emp.drivers.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500 italic">No adverse risk drivers detected.</div>
                )}
              </div>

              <div className="rounded-lg bg-emerald-50/50 p-3 border border-emerald-100 space-y-1.5">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">Mitigating Factors:</span>
                <ul className="list-disc list-inside text-emerald-900 space-y-1">
                  {emp.mitigating.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Retention Interventions */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 border border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Recommended HR & Manager Interventions:</span>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 font-medium">
                {emp.actions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary">View Talent Profile</Button>
              <Button variant="primary">Schedule Retention Check-in</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
