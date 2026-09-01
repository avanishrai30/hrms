"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceTaxCenterPage() {
  const [declarations] = useState([
    {
      empName: "Avanish Rai",
      empCode: "EMP-001",
      regime: "NEW",
      sec80c: "₹1,50,000",
      sec80d: "₹25,000",
      hraRent: "₹1,80,000",
      proofStatus: "VERIFIED",
      status: "VERIFIED"
    },
    {
      empName: "Priya Sharma",
      empCode: "EMP-042",
      regime: "OLD",
      sec80c: "₹1,50,000",
      sec80d: "₹35,000",
      hraRent: "₹2,40,000",
      proofStatus: "PENDING_AUDIT",
      status: "SUBMITTED"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/finance/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Payroll Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⚖️ Corporate Tax & TDS Management Hub</h1>
          <p className="text-sm text-slate-600">
            Verify employee IT declarations, audit investment proofs, generate quarterly 24Q TDS filing reports, and release Form 16s.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">📥 Export Form 24Q Annexure</Button>
          <Button variant="primary">⚙️ Recalculate Monthly TDS</Button>
        </div>
      </div>

      {/* Tax Declarations Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Employee Income Tax Declarations (FY 2026-27)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Regime</th>
                <th className="py-3 px-4">Section 80C</th>
                <th className="py-3 px-4">Section 80D</th>
                <th className="py-3 px-4">HRA Rent</th>
                <th className="py-3 px-4">Proof Audit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {declarations.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-slate-900">{d.empName}</div>
                    <div className="text-xs font-mono text-slate-500">{d.empCode}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge tone={d.regime === "NEW" ? "success" : "neutral"}>{d.regime} REGIME</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{d.sec80c}</td>
                  <td className="py-3.5 px-4 text-slate-700">{d.sec80d}</td>
                  <td className="py-3.5 px-4 text-slate-700">{d.hraRent}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={d.proofStatus === "VERIFIED" ? "success" : "warning"}>{d.proofStatus}</Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge tone={d.status === "VERIFIED" ? "success" : "neutral"}>{d.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Audit Proofs</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
