"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button, Panel } from "../../../../components/ui";

export default function EmployeeLoansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={"/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Payroll Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Salary Advances & Company Loans</h1>
          <p className="text-sm text-slate-600">
            Active loan repayment schedules and payroll deduction records will appear after approved payroll loan entries are available.
          </p>
        </div>
        <Button variant="primary">Request Salary Advance</Button>
      </div>

      <Panel className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">No active loan ledger</h2>
        <p className="mt-2 text-sm text-slate-500">
          Loan balances, EMI values, and repayment schedules are hidden until they are loaded from tenant-owned payroll records.
        </p>
      </Panel>
    </div>
  );
}
