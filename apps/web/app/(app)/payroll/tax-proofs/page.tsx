"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../../components/ui";

export default function TaxProofsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={"/payroll/tax-declaration" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Tax Declaration
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Tax Investment Proof Submissions</h1>
          <p className="text-sm text-slate-600">
            Upload documentary evidence for declared tax deductions when the payroll proof window is open.
          </p>
        </div>
        <Button variant="primary">Upload New Proof</Button>
      </div>

      <Panel className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">No submitted proof records available</h2>
        <p className="mt-2 text-sm text-slate-500">
          Verified claim amounts will appear only after tenant-owned payroll proof records are available from the payroll API.
        </p>
      </Panel>
    </div>
  );
}
