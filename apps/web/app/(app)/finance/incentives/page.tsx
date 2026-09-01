"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceIncentivesPage() {
  const [incentives] = useState([
    {
      id: "inc-1",
      employeeName: "Rajesh Kumar",
      type: "SALES_COMMISSION",
      period: "08/2026",
      target: "₹50,00,000 Sales",
      achieved: "₹58,50,000 (117%)",
      amount: "₹85,000",
      status: "APPROVED"
    },
    {
      id: "inc-2",
      employeeName: "Sneha Patel",
      type: "KPI_DISPATCH_SPEED",
      period: "08/2026",
      target: "95% SLA",
      achieved: "98.5% SLA",
      amount: "₹25,000",
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🎯 Sales Commission & KPI Incentive Management</h1>
          <p className="text-sm text-slate-600">
            Automated performance incentive calculations, achievement tier multipliers, and payroll disbursement integrations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Calculate Monthly Incentives</Button>
        </div>
      </div>

      {/* Incentives Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Approved Incentive Payouts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Incentive Category</th>
                <th className="py-3 px-4">Month/Year</th>
                <th className="py-3 px-4">Target Metric</th>
                <th className="py-3 px-4">Achieved Metric</th>
                <th className="py-3 px-4">Incentive Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {incentives.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{i.employeeName}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-700">{i.type.replace("_", " ")}</td>
                  <td className="py-3.5 px-4 text-slate-600">{i.period}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-600">{i.target}</td>
                  <td className="py-3.5 px-4 font-sans text-xs font-bold text-emerald-600">{i.achieved}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{i.amount}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{i.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Audit Metric</Button>
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
