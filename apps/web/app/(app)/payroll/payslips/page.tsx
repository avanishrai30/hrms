"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeePayslipsPage() {
  const [payslips] = useState([
    {
      id: "ps-1",
      month: "August",
      year: 2026,
      gross: "₹1,25,000",
      deductions: "₹18,500",
      net: "₹1,06,500",
      payDate: "Aug 31, 2026",
      status: "DISTRIBUTED"
    },
    {
      id: "ps-2",
      month: "July",
      year: 2026,
      gross: "₹1,25,000",
      deductions: "₹18,500",
      net: "₹1,06,500",
      payDate: "Jul 31, 2026",
      status: "DISTRIBUTED"
    },
    {
      id: "ps-3",
      month: "June",
      year: 2026,
      gross: "₹1,25,000",
      deductions: "₹18,500",
      net: "₹1,06,500",
      payDate: "Jun 30, 2026",
      status: "DISTRIBUTED"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📄 Monthly Salary Payslips</h1>
          <p className="text-sm text-slate-600">
            View, download, and verify your monthly salary slips, tax deductions, and statutory PF/ESI receipts.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/payroll/form16" as Route}>
            <Button variant="secondary">📑 View Form 16</Button>
          </Link>
          <Link href={"/payroll/tax-declaration" as Route}>
            <Button variant="primary">⚖️ IT Declaration</Button>
          </Link>
        </div>
      </div>

      {/* Payslips Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Salary Slip History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Total Deductions</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4">Disbursement Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {payslips.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">{p.month} {p.year}</td>
                  <td className="py-3.5 px-4 text-slate-700">{p.gross}</td>
                  <td className="py-3.5 px-4 text-rose-600">-{p.deductions}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{p.net}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-500">{p.payDate}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{p.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">📥 Download PDF</Button>
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
