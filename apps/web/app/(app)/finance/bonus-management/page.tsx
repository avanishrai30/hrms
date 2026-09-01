"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceBonusManagementPage() {
  const [bonuses] = useState([
    {
      id: "b-1",
      employeeName: "Avanish Rai",
      type: "ANNUAL_PERFORMANCE",
      year: "FY 2025-26",
      amount: "₹1,50,000",
      payoutDate: "Sep 30, 2026",
      status: "APPROVED"
    },
    {
      id: "b-2",
      employeeName: "Deepak Verma",
      type: "FESTIVE_DIWALI",
      year: "FY 2026-27",
      amount: "₹25,000",
      payoutDate: "Oct 25, 2026",
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🎁 Bonus & Variable Pay Administration</h1>
          <p className="text-sm text-slate-600">
            Manage statutory minimum (8.33%) & maximum (20%) bonus under Payment of Bonus Act (1965), festive payouts, and performance awards.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Allocate New Bonus</Button>
        </div>
      </div>

      {/* Bonus Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Approved Bonus Payouts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Bonus Category</th>
                <th className="py-3 px-4">Financial Year</th>
                <th className="py-3 px-4">Bonus Amount</th>
                <th className="py-3 px-4">Disbursement Target</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {bonuses.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{b.employeeName}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-700">{b.type.replace("_", " ")}</td>
                  <td className="py-3.5 px-4 text-slate-600">{b.year}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{b.amount}</td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-500">{b.payoutDate}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="success">{b.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">View Details</Button>
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
