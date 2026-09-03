"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../../components/ui";

export default function EmployeePayrollReimbursementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={"/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Payroll Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Payroll Expense Reimbursements</h1>
          <p className="text-sm text-slate-600">
            Approved expenses included in payroll disbursement cycles will appear here after finance release.
          </p>
        </div>
        <Link href={"/expenses" as Route}>
          <Button variant="primary">Submit Expense Claim</Button>
        </Link>
      </div>

      <Panel className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">No payroll reimbursements released</h2>
        <p className="mt-2 text-sm text-slate-500">
          Reimbursement amounts and payroll cycle links will appear only after approved tenant-owned expense records are attached to payroll.
        </p>
      </Panel>
    </div>
  );
}
