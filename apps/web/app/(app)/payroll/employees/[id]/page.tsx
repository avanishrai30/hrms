"use client";

import { useEffect, useState, use } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../../components/ui";
import { apiRequest } from "../../../../../lib/api";
import type { PayrollRunEmployeeView } from "@vc-wms/shared-types";

export default function EmployeePayrollDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [employeePayroll, setEmployeePayroll] = useState<PayrollRunEmployeeView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiRequest<PayrollRunEmployeeView>(`/payroll/employees/${id}`);
        setEmployeePayroll(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load employee paysheet.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, [id]);

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading paysheet details...</div>;
  }

  if (error || !employeePayroll) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? "Employee paysheet record not found."}
        </div>
        <Link
          href={"/payroll/run" as Route}
          className="text-xs font-semibold text-emerald-700 hover:underline"
        >
          &larr; Back to Payroll Workbench
        </Link>
      </div>
    );
  }

  const earnings = employeePayroll.breakdowns?.filter((b) => b.type === "EARNING") ?? [];
  const deductions = employeePayroll.breakdowns?.filter((b) => b.type === "DEDUCTION") ?? [];
  const employerContributions = employeePayroll.breakdowns?.filter((b) => b.type === "EMPLOYER_CONTRIBUTION") ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {employeePayroll.employee?.fullName}
            </h1>
            <Badge tone="neutral">{employeePayroll.employee?.employeeCode}</Badge>
          </div>
          <p className="text-sm text-slate-500">
            {employeePayroll.employee?.department?.name ?? "General"} •{" "}
            {employeePayroll.employee?.designation?.name ?? "Staff"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/payroll/run" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Payroll Workbench
          </Link>
        </div>
      </div>

      {/* Snapshot KPI Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Monthly Compensation Run</span>
            <div className="text-xl font-bold text-slate-900">
              {employeePayroll.payableDays} / {employeePayroll.workingDays} Payable Days
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-semibold text-slate-400">Net Take-Home Salary</span>
            <div className="text-2xl font-extrabold text-emerald-600">
              ₹{employeePayroll.netSalary.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Attendance & Leave Snapshot Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Present Days</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {employeePayroll.presentDays}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Paid Leaves</span>
            <div className="text-base font-bold text-emerald-700 mt-0.5">
              {employeePayroll.paidLeaveDays}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Public Holidays</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {employeePayroll.holidayDays}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Half Days</span>
            <div className="text-base font-bold text-amber-700 mt-0.5">
              {employeePayroll.halfDays}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Absent Days</span>
            <div className="text-base font-bold text-red-700 mt-0.5">
              {employeePayroll.absentDays}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Late / Early Exit</span>
            <div className="text-base font-bold text-slate-700 mt-0.5">
              {employeePayroll.lateDays} / {employeePayroll.earlyExitDays}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Proration Breakdown (Earnings vs Deductions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Gross Earnings</h2>
            <span className="font-bold text-slate-900">
              ₹{employeePayroll.grossSalary.toLocaleString()}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {earnings.map((e) => (
              <div key={e.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{e.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Base: ₹{e.baseAmount.toLocaleString()}
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-right">
                  ₹{e.proratedAmount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deductions & Adjustments */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Statutory Deductions</h2>
              <span className="font-bold text-amber-700">
                ₹{employeePayroll.totalDeductions.toLocaleString()}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {deductions.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{d.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{d.code}</div>
                  </div>
                  <div className="font-bold text-amber-700 text-right">
                    ₹{d.proratedAmount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adjustments */}
          {employeePayroll.adjustments && employeePayroll.adjustments.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Adjustments</h3>
                <span className="font-bold text-slate-900">
                  {employeePayroll.totalAdjustments >= 0 ? `+₹${employeePayroll.totalAdjustments.toLocaleString()}` : `-₹${Math.abs(employeePayroll.totalAdjustments).toLocaleString()}`}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {employeePayroll.adjustments.map((a) => (
                  <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{a.title}</div>
                      <div className="text-[10px] text-slate-400">{a.reason}</div>
                    </div>
                    <div
                      className={`font-bold text-right ${
                        a.amount >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {a.amount >= 0 ? `+₹${a.amount.toLocaleString()}` : `-₹${Math.abs(a.amount).toLocaleString()}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employer Contributions */}
          {employerContributions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase">
                Employer Match Contributions (PF / ESI)
              </span>
              <div className="divide-y divide-slate-200">
                {employerContributions.map((ec) => (
                  <div key={ec.id} className="py-1.5 flex justify-between">
                    <span className="text-slate-600">{ec.name}</span>
                    <span className="font-semibold text-slate-900">₹{ec.proratedAmount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
