"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function Form16Page() {
  const [form16s] = useState([
    {
      financialYear: "FY 2025-26",
      assessmentYear: "AY 2026-27",
      grossSalary: "₹15,00,000",
      totalTdsDeducted: "₹1,42,500",
      tanNumber: "MUMB12345E",
      panNumber: "ABCDE1234F",
      partAStatus: "GENERATED",
      partBStatus: "GENERATED"
    },
    {
      financialYear: "FY 2024-25",
      assessmentYear: "AY 2025-26",
      grossSalary: "₹13,50,000",
      totalTdsDeducted: "₹1,18,000",
      tanNumber: "MUMB12345E",
      panNumber: "ABCDE1234F",
      partAStatus: "GENERATED",
      partBStatus: "GENERATED"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Payroll Home
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📑 Annual Form 16 Certificates (TDS u/s 192)</h1>
          <p className="text-sm text-slate-600">
            Download TRACES-verified Part A (Quarterly TDS deposit details) and Part B (Salary breakdown & Chapter VI-A deductions).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">📥 Download Latest Form 16</Button>
        </div>
      </div>

      {/* Form 16 List */}
      <div className="space-y-4">
        {form16s.map((f, idx) => (
          <Panel key={idx} className="p-6 space-y-4 border-l-4 border-l-primary">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{f.financialYear} ({f.assessmentYear})</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Annual TDS Certificate (Form 16)</h3>
              </div>
              <div className="flex gap-2">
                <Badge tone="success">TRACES VERIFIED</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs pt-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500 font-sans uppercase">Total Gross Salary</span>
                <div className="text-base font-bold text-slate-900">{f.grossSalary}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500 font-sans uppercase">Total TDS Deposited</span>
                <div className="text-base font-bold text-emerald-700">{f.totalTdsDeducted}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500 font-sans uppercase">Employer TAN</span>
                <div className="text-base font-bold text-slate-700">{f.tanNumber}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500 font-sans uppercase">Employee PAN</span>
                <div className="text-base font-bold text-slate-700">{f.panNumber}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary">📥 Download Part A</Button>
              <Button variant="primary">📥 Download Part B</Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
