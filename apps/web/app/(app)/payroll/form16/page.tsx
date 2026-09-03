"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../../components/ui";

export default function Form16Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={"/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Payroll Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Annual Form 16 Certificates</h1>
          <p className="text-sm text-slate-600">
            Annual tax certificates will appear here after the payroll tax year is finalized and released.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/payroll/tax-declaration" as Route}>
            <Button variant="primary">Tax Declaration</Button>
          </Link>
          <Link href={"/payroll/tax-proofs" as Route}>
            <Button variant="secondary">Tax Proofs</Button>
          </Link>
        </div>
      </div>

      <Panel className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">No released Form 16 certificates</h2>
        <p className="mt-2 text-sm text-slate-500">
          This page does not display estimated salary, PAN, TAN, or TDS values until the platform has generated verified certificate records.
        </p>
      </Panel>
    </div>
  );
}
