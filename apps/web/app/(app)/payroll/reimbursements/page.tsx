"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeePayrollReimbursementsPage() {
  const [claims] = useState([
    {
      id: "rb-1",
      category: "Client Dinner & Travel",
      amount: "₹4,850",
      submittedDate: "Aug 15, 2026",
      approvedDate: "Aug 18, 2026",
      payrollCycle: "August 2026",
      status: "PAID_IN_PAYROLL"
    },
    {
      id: "rb-2",
      category: "Home Internet & Mobile Allowance",
      amount: "₹2,000",
      submittedDate: "Aug 20, 2026",
      approvedDate: "Aug 22, 2026",
      payrollCycle: "August 2026",
      status: "PAID_IN_PAYROLL"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🧾 Payroll Expense Reimbursements</h1>
          <p className="text-sm text-slate-600">
            Track claims approved by your manager that have been integrated into monthly payroll disbursements.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/expenses" as Route}>
            <Button variant="primary">+ Submit New Expense Claim</Button>
          </Link>
        </div>
      </div>

      {/* Reimbursements Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Approved Expense Reimbursements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4">Approved Amount</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Payroll Run Cycle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{c.category}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{c.amount}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-500">{c.submittedDate}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-700">{c.payrollCycle}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{c.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View Receipt</Button>
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
