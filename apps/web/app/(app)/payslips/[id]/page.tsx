"use client";

import { useEffect, useState, use } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../../lib/api";
import type { PayslipView } from "@vc-wms/shared-types";

export default function PayslipDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [payslip, setPayslip] = useState<PayslipView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiRequest<PayslipView>(`/payslips/${id}`);
        setPayslip(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load payslip details.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, [id]);

  const handleDownload = () => {
    window.open(`/api/v1/payslips/${id}/download`, "_blank");
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading payslip...</div>;
  }

  if (error || !payslip) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? "Payslip not found."}
        </div>
        <Link
          href={"/payslips" as Route}
          className="text-xs font-semibold text-emerald-700 hover:underline"
        >
          &larr; Back to My Payslips
        </Link>
      </div>
    );
  }

  const earnings = payslip.payrollRunEmployee?.breakdowns?.filter((b) => b.type === "EARNING") ?? [];
  const deductions = payslip.payrollRunEmployee?.breakdowns?.filter((b) => b.type === "DEDUCTION") ?? [];
  const employerContribs =
    payslip.payrollRunEmployee?.breakdowns?.filter((b) => b.type === "EMPLOYER_CONTRIBUTION") ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={"/payslips" as Route}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white px-3 py-1.5 rounded-lg shadow-xs transition"
          >
            &larr; Back
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Payslip for {monthNames[payslip.month - 1]} {payslip.year}
            </h1>
            <span className="text-xs text-slate-400">Version {payslip.version} • Digital Release</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition flex items-center gap-2"
          >
            <span>⬇</span>
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Payslip Document Preview Canvas */}
      <div className="rounded-2xl border border-slate-300 bg-white shadow-md overflow-hidden">
        {/* Document Header */}
        <div className="bg-emerald-800 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">
              VC Organics Enterprise HRMS
            </span>
            <h2 className="text-2xl font-black mt-1">VC ORGANICS LTD</h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Official Salary Disbursement Slip • Period: {monthNames[payslip.month - 1]} {payslip.year}
            </p>
          </div>
          <div className="sm:text-right">
            <div className="text-xs text-emerald-200 font-mono">Document Version: v{payslip.version}</div>
            <div className="text-xs text-emerald-200">
              Released: {new Date(payslip.generatedAt).toLocaleDateString()}
            </div>
            <div className="mt-2 inline-block bg-emerald-950/60 border border-emerald-700 px-2.5 py-1 rounded text-xs font-semibold text-emerald-300">
              ✓ Verified & Signed
            </div>
          </div>
        </div>

        {/* Employee & Attendance Grid */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Employee Name</span>
            <div className="font-bold text-slate-900 mt-0.5">{payslip.employee?.fullName}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Employee Code</span>
            <div className="font-bold text-slate-900 mt-0.5">{payslip.employee?.employeeCode}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Department</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {payslip.employee?.department?.name ?? "General"}
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Designation</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {payslip.employee?.designation?.name ?? "Staff"}
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Payable / Working Days</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {payslip.payrollRunEmployee?.payableDays ?? 30} / {payslip.payrollRunEmployee?.workingDays ?? 30} Days
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Present / Paid Leaves</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {payslip.payrollRunEmployee?.presentDays ?? 0} Present / {payslip.payrollRunEmployee?.paidLeaveDays ?? 0} Leaves
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Holidays / Half Days</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {payslip.payrollRunEmployee?.holidayDays ?? 0} Holidays / {payslip.payrollRunEmployee?.halfDays ?? 0} Half
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Absent Days</span>
            <div className="font-bold text-red-600 mt-0.5">
              {payslip.payrollRunEmployee?.absentDays ?? 0} Days
            </div>
          </div>
        </div>

        {/* Itemized Tables (Earnings vs Deductions) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Earnings */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 pb-2">
              Earnings Breakdown
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {earnings.map((e) => (
                <div key={e.id} className="py-2 flex justify-between">
                  <span className="text-slate-700">{e.name}</span>
                  <span className="font-semibold text-slate-900">₹{e.proratedAmount.toLocaleString()}</span>
                </div>
              ))}
              {payslip.payrollRunEmployee?.adjustments
                ?.filter((a) => a.amount > 0)
                .map((a) => (
                  <div key={a.id} className="py-2 flex justify-between text-emerald-700">
                    <span>{a.title} (Bonus/Reimbursement)</span>
                    <span className="font-semibold">+₹{a.amount.toLocaleString()}</span>
                  </div>
                ))}
            </div>
            <div className="border-t-2 border-slate-200 pt-2 flex justify-between text-xs font-bold">
              <span>Total Gross Salary</span>
              <span className="text-slate-900">₹{payslip.grossSalary.toLocaleString()}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 pb-2">
              Statutory & Other Deductions
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {deductions.map((d) => (
                <div key={d.id} className="py-2 flex justify-between">
                  <span className="text-slate-700">{d.name}</span>
                  <span className="font-semibold text-amber-800">₹{d.proratedAmount.toLocaleString()}</span>
                </div>
              ))}
              {payslip.payrollRunEmployee?.adjustments
                ?.filter((a) => a.amount < 0)
                .map((a) => (
                  <div key={a.id} className="py-2 flex justify-between text-red-700">
                    <span>{a.title} (Penalty/Recovery)</span>
                    <span className="font-semibold">-₹{Math.abs(a.amount).toLocaleString()}</span>
                  </div>
                ))}
            </div>
            <div className="border-t-2 border-slate-200 pt-2 flex justify-between text-xs font-bold">
              <span>Total Deductions</span>
              <span className="text-amber-800">₹{payslip.deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Employer Contributions */}
        {employerContribs.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Employer Contributions (PF / ESI)
            </span>
            <div className="mt-2 flex flex-wrap gap-6">
              {employerContribs.map((ec) => (
                <div key={ec.id} className="flex gap-2">
                  <span className="text-slate-500">{ec.name}:</span>
                  <span className="font-semibold text-slate-900">₹{ec.proratedAmount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Net Take-Home Salary Banner */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Net Amount Disbursed
            </span>
            <div className="text-sm text-slate-300">Direct Bank Deposit</div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            ₹{payslip.netSalary.toLocaleString()}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 text-center text-[10px] text-slate-400 border-t border-slate-200">
          This payslip was generated from a locked and approved payroll run. Confidential & Private.
        </div>
      </div>
    </div>
  );
}
