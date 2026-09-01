"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceFnfPage() {
  const [settlements] = useState([
    {
      id: "fnf-1",
      employeeName: "Vikram Mehta",
      department: "Logistics & Fleet",
      resignationDate: "Jul 15, 2026",
      lastWorkingDate: "Aug 15, 2026",
      earnedSalary: "₹45,000",
      leaveEncashment: "₹24,500",
      gratuity: "₹1,85,000",
      recoveries: "-₹10,000",
      netPayable: "₹2,44,500",
      status: "FINANCE_APPROVED"
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🚪 Full & Final (FnF) Settlement Processing</h1>
          <p className="text-sm text-slate-600">
            Process employee separation ledgers: earned wages, paid leave encashment, statutory gratuity, notice adjustments, and clearance recoveries.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Calculate New FnF</Button>
        </div>
      </div>

      {/* Settlements Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Separation Settlements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Separated Employee</th>
                <th className="py-3 px-4">Last Working Date</th>
                <th className="py-3 px-4">Earned Wages</th>
                <th className="py-3 px-4">Leave Encashment</th>
                <th className="py-3 px-4">Gratuity</th>
                <th className="py-3 px-4">Recoveries</th>
                <th className="py-3 px-4">Net Settlement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-slate-900">{s.employeeName}</div>
                    <div className="text-xs font-mono text-slate-500">{s.department}</div>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-600">{s.lastWorkingDate}</td>
                  <td className="py-3.5 px-4 text-slate-700">{s.earnedSalary}</td>
                  <td className="py-3.5 px-4 text-slate-700">{s.leaveEncashment}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.gratuity}</td>
                  <td className="py-3.5 px-4 text-rose-600">{s.recoveries}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{s.netPayable}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{s.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View Statement</Button>
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
