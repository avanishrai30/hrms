"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { PayslipDistributionView } from "@vc-wms/shared-types";

export default function AdminPayslipDistributionPage() {
  const [distributions, setDistributions] = useState<PayslipDistributionView[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      params.set("limit", "100");

      const res = await apiRequest<{ distributions: PayslipDistributionView[] }>(
        `/payslips/distributions?${params.toString()}`
      );
      setDistributions(res.distributions ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load distributions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge tone="success">Delivered</Badge>;
      case "OPENED":
        return <Badge tone="success">Opened</Badge>;
      case "SENT":
        return <Badge tone="neutral">Sent</Badge>;
      case "QUEUED":
        return <Badge tone="warning">Queued</Badge>;
      case "FAILED":
        return <Badge tone="danger">Failed</Badge>;
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
            Payslip Distribution Monitor
          </h1>
          <p className="text-sm text-slate-500">
            Track automated email notifications, delivery confirmations, and retry failed dispatches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/admin/payslips" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            &larr; Payslips Manager
          </Link>
          <Link
            href={"/admin/payslip-audit" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Audit Center
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Dispatches</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{distributions.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Email jobs dispatched</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Successfully Delivered</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {distributions.filter((d) => d.status === "DELIVERED" || d.status === "OPENED").length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Confirmed inbox arrivals</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">In Flight / Queued</span>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {distributions.filter((d) => d.status === "QUEUED" || d.status === "SENT").length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Background queue processing</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Delivery Failures</span>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {distributions.filter((d) => d.status === "FAILED").length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Bounces or delivery errors</span>
        </div>
      </div>

      {/* Distribution Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Email Delivery Activity</h2>
            <p className="text-xs text-slate-500">Real-time status of distributed payslip communications</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="SENT">Sent</option>
              <option value="QUEUED">Queued</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading delivery logs...</div>
        ) : distributions.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No email distributions recorded yet. Dispatch payslips from the Admin Payslips Manager.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Recipient Email</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distributions.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <div>{d.employee?.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">{d.employee?.employeeCode}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-mono text-xs">{d.recipientEmail}</td>
                    <td className="px-4 py-3.5 text-slate-800 text-xs font-medium">
                      {d.payslip ? `${monthNames[d.payslip.month - 1]} ${d.payslip.year}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">{d.channel}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(d.status)}</td>
                    <td className="px-4 py-3.5 text-right">
                      {d.payslip && (
                        <Link
                          href={`/payslips/${d.payslip.id}` as Route}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          View Slip &rarr;
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
