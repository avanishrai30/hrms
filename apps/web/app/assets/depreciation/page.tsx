"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../components/ui";

export default function DepreciationPage() {
  const [method, setMethod] = useState<"STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE">("STRAIGHT_LINE");

  const [depreciationRecords] = useState([
    {
      id: "ast-1",
      assetCode: "AST-2026-001",
      name: 'MacBook Pro 16" M3 Max',
      purchaseDate: "2024-01-15",
      purchaseCost: 245000,
      salvageValue: 24500,
      usefulLifeYears: 3,
      monthlyDepreciation: 6125,
      accumulatedDepreciation: 73500,
      currentBookValue: 171500
    },
    {
      id: "ast-2",
      assetCode: "AST-2026-002",
      name: "Dell UltraSharp 32 4K Monitor",
      purchaseDate: "2024-06-10",
      purchaseCost: 65000,
      salvageValue: 5000,
      usefulLifeYears: 4,
      monthlyDepreciation: 1250,
      accumulatedDepreciation: 18750,
      currentBookValue: 46250
    },
    {
      id: "ast-3",
      assetCode: "AST-2026-003",
      name: "Lenovo ThinkPad P16 Gen 2",
      purchaseDate: "2025-01-01",
      purchaseCost: 185000,
      salvageValue: 18500,
      usefulLifeYears: 3,
      monthlyDepreciation: 4625,
      accumulatedDepreciation: 37000,
      currentBookValue: 148000
    }
  ]);

  const totalCost = depreciationRecords.reduce((sum, r) => sum + r.purchaseCost, 0);
  const totalAccDep = depreciationRecords.reduce((sum, r) => sum + r.accumulatedDepreciation, 0);
  const totalBookVal = depreciationRecords.reduce((sum, r) => sum + r.currentBookValue, 0);
  const totalMonthlyExp = depreciationRecords.reduce((sum, r) => sum + r.monthlyDepreciation, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📉 Asset Depreciation & Valuation Engine</h1>
          <p className="text-sm text-slate-600">
            Straight Line (SLM) and Written Down Value (WDV) accounting schedules and monthly asset expense.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/assets" as Route}>
            <Button variant="secondary">💻 Asset Register</Button>
          </Link>
          <Button variant="secondary">📥 Export Ledger PDF</Button>
        </div>
      </div>

      {/* Method Switcher & Valuation KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Asset Value</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">₹{totalCost.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-slate-500">Historical acquisition cost</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Accumulated Depreciation</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">₹{totalAccDep.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-rose-600">26.1% Total Depreciation</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Net Carrying Book Value</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">₹{totalBookVal.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-emerald-600">Balance sheet asset value</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Monthly Expense Run-rate</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">₹{totalMonthlyExp.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-blue-600">Recurring depreciation cost</p>
        </Panel>
      </div>

      {/* Method Toggle */}
      <Panel className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Depreciation Accounting Method</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod("STRAIGHT_LINE")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                method === "STRAIGHT_LINE"
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Straight Line Method (SLM)
            </button>
            <button
              type="button"
              onClick={() => setMethod("WRITTEN_DOWN_VALUE")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                method === "WRITTEN_DOWN_VALUE"
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Written Down Value (WDV)
            </button>
          </div>
        </div>
      </Panel>

      {/* Depreciation Table */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Asset Code</th>
                <th className="p-4">Equipment</th>
                <th className="p-4">Acquisition Date</th>
                <th className="p-4">Purchase Cost</th>
                <th className="p-4">Salvage Value</th>
                <th className="p-4">Useful Life</th>
                <th className="p-4">Monthly Dep</th>
                <th className="p-4">Accumulated Dep</th>
                <th className="p-4">Current Book Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {depreciationRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-medium text-slate-900">{rec.assetCode}</td>
                  <td className="p-4 font-semibold text-slate-900">{rec.name}</td>
                  <td className="p-4 text-slate-700">{rec.purchaseDate}</td>
                  <td className="p-4 font-medium text-slate-900">₹{rec.purchaseCost.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-slate-500">₹{rec.salvageValue.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-slate-700">{rec.usefulLifeYears} Years</td>
                  <td className="p-4 text-blue-700 font-medium">₹{rec.monthlyDepreciation.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-rose-700 font-medium">₹{rec.accumulatedDepreciation.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-emerald-800 font-bold">₹{rec.currentBookValue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
