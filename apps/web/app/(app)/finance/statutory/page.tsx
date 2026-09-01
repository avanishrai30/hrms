"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceStatutoryCompliancePage() {
  const [statutoryReports] = useState([
    {
      body: "EPFO (Provident Fund)",
      period: "August 2026",
      employeeShare: "₹4,85,000",
      employerShare: "₹4,85,000",
      adminEdliCharges: "₹40,416",
      totalChallan: "₹10,10,416",
      dueDate: "Sep 15, 2026",
      status: "READY_FOR_FILING"
    },
    {
      body: "ESIC (State Insurance)",
      period: "August 2026",
      employeeShare: "₹24,500",
      employerShare: "₹1,06,166",
      adminEdliCharges: "₹0",
      totalChallan: "₹1,30,666",
      dueDate: "Sep 15, 2026",
      status: "READY_FOR_FILING"
    },
    {
      body: "Professional Tax (PT)",
      period: "August 2026",
      employeeShare: "₹22,000",
      employerShare: "₹0",
      adminEdliCharges: "₹0",
      totalChallan: "₹22,000",
      dueDate: "Sep 20, 2026",
      status: "READY_FOR_FILING"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🏛️ Statutory Compliance & Government Filings</h1>
          <p className="text-sm text-slate-600">
            Generate Electronic Challan cum Return (ECR) for EPFO, ESIC monthly return data, PT challans, and Labour Welfare Fund (LWF) statements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">📥 Download EPFO ECR Text File</Button>
        </div>
      </div>

      {/* Statutory Reports Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Monthly Statutory Dues Summary (August 2026)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Statutory Authority</th>
                <th className="py-3 px-4">Employee Share</th>
                <th className="py-3 px-4">Employer Share</th>
                <th className="py-3 px-4">Admin/EDLI Charges</th>
                <th className="py-3 px-4">Total Challan Amount</th>
                <th className="py-3 px-4">Statutory Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {statutoryReports.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{s.body}</td>
                  <td className="py-3.5 px-4 text-slate-700">{s.employeeShare}</td>
                  <td className="py-3.5 px-4 text-slate-700">{s.employerShare}</td>
                  <td className="py-3.5 px-4 text-slate-500">{s.adminEdliCharges}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{s.totalChallan}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-rose-600 font-medium">{s.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{s.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Generate Challan</Button>
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
