"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";

export default function FinancePayrollRunsPage() {
  const [runs] = useState([
    {
      id: "run-1",
      month: "August",
      year: 2026,
      headcount: 110,
      totalGross: "₹81,50,000",
      totalDeductions: "₹12,22,500",
      totalNet: "₹69,27,500",
      status: "APPROVED"
    },
    {
      id: "run-2",
      month: "July",
      year: 2026,
      headcount: 108,
      totalGross: "₹79,80,000",
      totalDeductions: "₹11,97,000",
      totalNet: "₹67,83,000",
      status: "LOCKED"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⚙️ Payroll Run Execution & Processing</h1>
          <p className="text-sm text-slate-600">
            Generate monthly payroll calculations, calculate attendance proration, add bonus & arrears adjustments, and lock pay runs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Initiate New Payroll Run</Button>
        </div>
      </div>

      {/* Filter / Search */}
      <Panel className="p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <Field label="Year">
            <Input defaultValue="2026" />
          </Field>
          <Field label="Status">
            <Input defaultValue="ALL" />
          </Field>
        </div>
        <Button variant="secondary">Filter Runs</Button>
      </Panel>

      {/* Runs Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Historical & Active Payroll Batches</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Employees</th>
                <th className="py-3 px-4">Total Gross</th>
                <th className="py-3 px-4">Total Deductions</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Batch Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{r.month} {r.year}</td>
                  <td className="py-3.5 px-4 text-slate-700">{r.headcount}</td>
                  <td className="py-3.5 px-4 text-slate-800">{r.totalGross}</td>
                  <td className="py-3.5 px-4 text-rose-600">-{r.totalDeductions}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{r.totalNet}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={r.status === "LOCKED" ? "neutral" : "success"}>{r.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Manage Batch</Button>
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
