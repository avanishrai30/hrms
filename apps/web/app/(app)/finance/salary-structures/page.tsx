"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function FinanceSalaryStructuresPage() {
  const [bands] = useState([
    {
      code: "L1",
      name: "Entry Level Operations / Trainee",
      level: "Executive 1",
      minCtc: "₹3,50,000",
      midCtc: "₹5,00,000",
      maxCtc: "₹6,50,000",
      count: 32
    },
    {
      code: "L2",
      name: "Senior Associate / Engineer",
      level: "Executive 2",
      minCtc: "₹7,00,000",
      midCtc: "₹9,50,000",
      maxCtc: "₹12,00,000",
      count: 45
    },
    {
      code: "L3",
      name: "Lead / Assistant Manager",
      level: "Management 1",
      minCtc: "₹13,00,000",
      midCtc: "₹16,50,000",
      maxCtc: "₹20,00,000",
      count: 22
    },
    {
      code: "L4",
      name: "Principal / Senior Manager",
      level: "Management 2",
      minCtc: "₹22,00,000",
      midCtc: "₹28,00,000",
      maxCtc: "₹35,00,000",
      count: 11
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">📊 Salary Bands & Compensation Structures</h1>
          <p className="text-sm text-slate-600">
            Define corporate job levels, minimum/midpoint/maximum CTC boundaries, and market compensation benchmarks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">+ Create New Salary Band</Button>
        </div>
      </div>

      {/* Salary Bands Table */}
      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Standard Organizational Pay Ranges</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Band Code</th>
                <th className="py-3 px-4">Band Title</th>
                <th className="py-3 px-4">Job Level</th>
                <th className="py-3 px-4">Min CTC</th>
                <th className="py-3 px-4">Midpoint CTC</th>
                <th className="py-3 px-4">Max CTC</th>
                <th className="py-3 px-4">Employees</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {bands.map((b) => (
                <tr key={b.code} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-bold text-primary">{b.code}</td>
                  <td className="py-3.5 px-4 font-sans font-medium text-slate-900">{b.name}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-600">{b.level}</td>
                  <td className="py-3.5 px-4 text-slate-700">{b.minCtc}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.midCtc}</td>
                  <td className="py-3.5 px-4 text-slate-700">{b.maxCtc}</td>
                  <td className="py-3.5 px-4">
                    <Badge tone="neutral">{b.count} Enrolled</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="secondary">Edit Band</Button>
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
