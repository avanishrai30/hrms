"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";

export default function TaxDeclarationPage() {
  const [regime, setRegime] = useState<"NEW" | "OLD">("NEW");
  const [sec80c, setSec80c] = useState("");
  const [sec80d, setSec80d] = useState("");
  const [rent, setRent] = useState("");
  const [nps, setNps] = useState("");

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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">⚖️ Income Tax Declaration (FY 2026-27)</h1>
          <p className="text-sm text-slate-600">
            Declare your tax regime choice, Chapter VI-A deductions, HRA rent receipts, and NPS contributions to optimize monthly TDS deductions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/payroll/tax-proofs" as Route}>
            <Button variant="secondary">📎 Upload Investment Proofs</Button>
          </Link>
          <Button variant="primary">💾 Save & Submit Declaration</Button>
        </div>
      </div>

      {/* Regime Toggle */}
      <Panel className="space-y-4 p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tax Regime Selection</h2>
          <Badge tone="success">CURRENT: {regime} REGIME</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            onClick={() => setRegime("NEW")}
            className={`rounded-xl border p-5 cursor-pointer transition ${
              regime === "NEW"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">New Tax Regime (Section 115BAC)</span>
              <Badge tone="success">RECOMMENDED</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Simplified lower tax slabs, ₹75,000 standard deduction, tax-free up to ₹7,00,000 via Section 87A rebate. No proof submission required.
            </p>
          </div>

          <div
            onClick={() => setRegime("OLD")}
            className={`rounded-xl border p-5 cursor-pointer transition ${
              regime === "OLD"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Old Tax Regime</span>
              <Badge tone="neutral">ITEMIZED DEDUCTIONS</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Claim 80C (₹1.5L), 80D Mediclaim (₹25k-₹50k), HRA rent exemption, Home Loan Interest (₹2L), and Section 80CCD NPS. Proofs mandatory.
            </p>
          </div>
        </div>
      </Panel>

      {/* Deduction Declarations */}
      {regime === "OLD" && (
        <Panel className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Itemized Deductions & Exemptions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Section 80C (PPF, ELSS, EPF, LIC, Tuition) - Max ₹1,50,000">
              <Input value={sec80c} onChange={(e) => setSec80c(e.target.value)} />
            </Field>
            <Field label="Section 80D (Health Insurance Premium) - Max ₹25,000 / ₹50,000">
              <Input value={sec80d} onChange={(e) => setSec80d(e.target.value)} />
            </Field>
            <Field label="Annual Rent Paid for HRA Exemption">
              <Input value={rent} onChange={(e) => setRent(e.target.value)} />
            </Field>
            <Field label="Section 80CCD(1B) Additional NPS - Max ₹50,000">
              <Input value={nps} onChange={(e) => setNps(e.target.value)} />
            </Field>
          </div>
        </Panel>
      )}
    </div>
  );
}
