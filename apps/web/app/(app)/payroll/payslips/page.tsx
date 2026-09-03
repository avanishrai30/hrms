"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";
import { formatMoney } from "../../../../lib/money";
import { useMyPayslips } from "../../../../lib/queries/use-ess-queries";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EmployeePayslipsPage() {
  const { data: payslips = [], isLoading } = useMyPayslips();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={"/payroll" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Payroll Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Monthly Salary Payslips</h1>
          <p className="text-sm text-slate-600">
            View and download payroll-generated salary slips, deductions, and statutory details.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/payroll/form16" as Route}>
            <Button variant="secondary">View Form 16</Button>
          </Link>
          <Link href={"/payroll/tax-declaration" as Route}>
            <Button variant="primary">IT Declaration</Button>
          </Link>
        </div>
      </div>

      <Panel className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Salary Slip History</h2>
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading payslips...</div>
        ) : payslips.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No payslips have been released for your profile yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Pay Period</th>
                  <th className="py-3 px-4">Gross Earnings</th>
                  <th className="py-3 px-4">Total Deductions</th>
                  <th className="py-3 px-4">Net Take-Home</th>
                  <th className="py-3 px-4">Generated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                      {monthNames[p.month - 1]} {p.year}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {formatMoney(p.grossSalary, p.payrollRun?.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600">
                      {formatMoney(p.deductions, p.payrollRun?.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatMoney(p.netSalary, p.payrollRun?.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs text-slate-500">
                      {new Date(p.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge tone={p.status === "REVOKED" ? "danger" : "success"}>{p.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/payslips/${p.id}` as Route}>
                        <Button variant="secondary">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
