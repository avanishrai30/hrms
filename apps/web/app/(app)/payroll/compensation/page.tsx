"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeCompensationPage() {
  const [compensation] = useState({
    annualCtc: "₹18,00,000",
    monthlyCtc: "₹1,50,000",
    fixedPercentage: "85%",
    variablePercentage: "15%",
    components: [
      { name: "Basic Salary", category: "Fixed", monthly: "₹75,000", annual: "₹9,00,000" },
      { name: "House Rent Allowance (HRA)", category: "Fixed", monthly: "₹37,500", annual: "₹4,50,000" },
      { name: "Special Allowance", category: "Fixed", monthly: "₹17,500", annual: "₹2,10,000" },
      { name: "Employer PF Contribution", category: "Statutory", monthly: "₹9,000", annual: "₹1,08,000" },
      { name: "Statutory Gratuity Provision", category: "Statutory", monthly: "₹3,606", annual: "₹43,272" },
      { name: "Performance Target Variable Pay", category: "Variable", monthly: "₹7,394", annual: "₹88,728" }
    ]
  });

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">💼 Salary Structure & Total Rewards (CTC)</h1>
          <p className="text-sm text-slate-600">
            Transparent breakdown of your total cost to company (CTC), monthly earnings components, and employer statutory benefits.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">📥 Download Annexure A</Button>
        </div>
      </div>

      {/* CTC Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono">
        <Panel className="p-4 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Annual CTC</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{compensation.annualCtc}</div>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Monthly CTC</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{compensation.monthlyCtc}</div>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Fixed Component</span>
          <div className="mt-1 text-2xl font-bold text-blue-700">{compensation.fixedPercentage}</div>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Target Variable Pay</span>
          <div className="mt-1 text-2xl font-bold text-amber-700">{compensation.variablePercentage}</div>
        </Panel>
      </div>

      {/* Component Breakdown Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">CTC Line Item Composition</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Component Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Monthly (₹)</th>
                <th className="py-3 px-4">Annual (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {compensation.components.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone={c.category === "Fixed" ? "success" : c.category === "Variable" ? "warning" : "neutral"}>
                      {c.category}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{c.monthly}</td>
                  <td className="py-3.5 px-4 font-bold text-primary">{c.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
