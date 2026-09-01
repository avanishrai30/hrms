"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type { PayslipView } from "@vc-wms/shared-types";

export default function EmployeePayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<PayslipView[]>("/payslips/me");
      setPayslips(data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payslips.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDownload = (payslipId: string) => {
    window.open(`/api/v1/payslips/${payslipId}/download`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DOWNLOADED":
        return <Badge tone="success">Downloaded</Badge>;
      case "VIEWED":
        return <Badge tone="neutral">Viewed</Badge>;
      case "DISTRIBUTED":
        return <Badge tone="success">Sent / Ready</Badge>;
      case "GENERATED":
        return <Badge tone="warning">Generated</Badge>;
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Salary Payslips
          </h1>
          <p className="text-sm text-slate-500">
            View, inspect, and securely download your monthly digital salary slips.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/payroll" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Payroll Overview
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-sm text-slate-500">
            Loading your payslips...
          </div>
        ) : payslips.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="text-3xl">📄</div>
            <h3 className="text-base font-bold text-slate-900">No Payslips Released Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Payslips will appear here once the HR department finalizes and locks the monthly payroll cycle.
            </p>
          </div>
        ) : (
          payslips.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {monthNames[p.month - 1]} {p.year}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      v{p.version}
                    </span>
                    {getStatusBadge(p.status)}
                  </div>
                </div>

                <div className="border-t border-b border-slate-100 py-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Gross Earnings:</span>
                    <span className="font-semibold text-slate-900">
                      ₹{p.grossSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Deductions:</span>
                    <span className="font-semibold text-amber-700">
                      ₹{p.deductions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-100 font-bold">
                    <span className="text-slate-900">Net Take-Home:</span>
                    <span className="text-emerald-700 text-base">
                      ₹{p.netSalary.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/payslips/${p.id}` as Route}
                  className="flex-1 text-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDownload(p.id)}
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition"
                >
                  ⬇ Download PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
