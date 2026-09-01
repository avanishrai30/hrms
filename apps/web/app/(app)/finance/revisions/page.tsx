"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceRevisionsPage() {
  const [revisions] = useState([
    {
      id: "rev-1",
      employeeName: "Avanish Rai",
      currentCtc: "₹18,00,000",
      proposedCtc: "₹21,00,000",
      hike: "+16.7%",
      type: "ANNUAL_APPRAISAL",
      effectiveDate: "Oct 01, 2026",
      status: "CEO_APPROVED"
    },
    {
      id: "rev-2",
      employeeName: "Rohan Gupta",
      currentCtc: "₹12,00,000",
      proposedCtc: "₹14,50,000",
      hike: "+20.8%",
      type: "PROMOTION",
      effectiveDate: "Oct 01, 2026",
      status: "HR_APPROVED"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📈 Compensation Revisions & Merit Matrix Simulator</h1>
          <p className="text-sm text-slate-600">
            Plan appraisal increment cycles, simulate merit matrix hikes based on compa-ratios, and compute retroactive salary arrears.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Initiate Revision Cycle</Button>
        </div>
      </div>

      {/* Revisions Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Active Salary Increment Proposals</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Revision Reason</th>
                <th className="py-3 px-4">Current Annual CTC</th>
                <th className="py-3 px-4">Proposed Annual CTC</th>
                <th className="py-3 px-4">Hike %</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Approval State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {revisions.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{r.employeeName}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-700">{r.type.replace("_", " ")}</td>
                  <td className="py-3.5 px-4 text-slate-700">{r.currentCtc}</td>
                  <td className="py-3.5 px-4 font-bold text-primary">{r.proposedCtc}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{r.hike}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-500">{r.effectiveDate}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{r.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Review Hike</Button>
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
