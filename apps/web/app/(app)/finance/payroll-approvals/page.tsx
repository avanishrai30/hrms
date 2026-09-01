"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinancePayrollApprovalsPage() {
  const [approvals] = useState([
    {
      id: "app-1",
      cycle: "August 2026",
      submittedBy: "Payroll Officer",
      grossTotal: "₹81,50,000",
      netDisbursement: "₹69,27,500",
      headcount: 110,
      stage: "FINANCE_DIRECTOR_REVIEW",
      status: "PENDING_APPROVAL"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">✅ Multi-Tier Payroll Approvals</h1>
          <p className="text-sm text-slate-600">
            Review payroll batch calculations, variance reports against previous cycles, and authorize final bank disbursements.
          </p>
        </div>
      </div>

      {/* Approvals Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Pending Pay Run Sign-Offs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Prepared By</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Total Gross</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Workflow Stage</th>
                <th className="py-3 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {approvals.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{a.cycle}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-700">{a.submittedBy}</td>
                  <td className="py-3.5 px-4 text-slate-700">{a.headcount}</td>
                  <td className="py-3.5 px-4 text-slate-800">{a.grossTotal}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{a.netDisbursement}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="warning">{a.stage.replace("_", " ")}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary">Reject</Button>
                      <Button variant="primary">Approve & Lock</Button>
                    </div>
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
