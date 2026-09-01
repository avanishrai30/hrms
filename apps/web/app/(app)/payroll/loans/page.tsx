"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeLoansPage() {
  const [loans] = useState([
    {
      id: "ln-1",
      type: "SALARY_ADVANCE",
      principal: "₹50,000",
      monthlyEmi: "₹10,000",
      totalTenure: "5 Months",
      remainingTenure: "2 Months",
      balance: "₹20,000",
      status: "ACTIVE"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">💳 Salary Advances & Company Loans</h1>
          <p className="text-sm text-slate-600">
            Request emergency salary advances, view active loan repayment schedules, and check monthly EMI payroll deductions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Request Salary Advance</Button>
        </div>
      </div>

      {/* Active Loans */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Active Loan Repayment Ledgers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Loan Type</th>
                <th className="py-3 px-4">Disbursed Principal</th>
                <th className="py-3 px-4">Monthly EMI</th>
                <th className="py-3 px-4">Tenure (Total / Left)</th>
                <th className="py-3 px-4">Outstanding Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{l.type.replace("_", " ")}</td>
                  <td className="py-3.5 px-4 text-slate-700">{l.principal}</td>
                  <td className="py-3.5 px-4 text-rose-600 font-bold">{l.monthlyEmi}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-600">{l.totalTenure} ({l.remainingTenure} left)</td>
                  <td className="py-3.5 px-4 font-bold text-primary">{l.balance}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{l.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View Schedule</Button>
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
