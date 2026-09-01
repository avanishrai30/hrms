"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceGratuityPage() {
  const [records] = useState([
    {
      id: "gr-1",
      employeeName: "Vikram Mehta",
      tenure: "5.8 Years (6 Yrs)",
      basicWage: "₹42,000",
      formula: "(15 × ₹42,000 × 6) ÷ 26",
      grossAmount: "₹1,45,385",
      taxExempt: "₹1,45,385 (Max ₹20L)",
      status: "APPROVED"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📜 Payment of Gratuity Act (1972) Engine</h1>
          <p className="text-sm text-slate-600">
            Statutory gratuity valuations using the official (15 * Basic * Years) / 26 formula, 5-year eligibility enforcement, and ₹20 Lakh tax exemption caps.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Calculate Gratuity</Button>
        </div>
      </div>

      {/* Gratuity Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Computed Gratuity Liabilities</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Continuous Service</th>
                <th className="py-3 px-4">Last Drawn Basic+DA</th>
                <th className="py-3 px-4">Statutory Formula</th>
                <th className="py-3 px-4">Calculated Gratuity</th>
                <th className="py-3 px-4">Tax Exemption</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{r.employeeName}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-700">{r.tenure}</td>
                  <td className="py-3.5 px-4 text-slate-700">{r.basicWage}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-500">{r.formula}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{r.grossAmount}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-600">{r.taxExempt}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{r.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Download Certificate</Button>
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
