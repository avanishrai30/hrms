"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type { LeaveBalanceView, LeaveRequestView } from "@vc-wms/shared-types";

export default function LeaveDashboardPage() {
  const [balances, setBalances] = useState<LeaveBalanceView[]>([]);
  const [requests, setRequests] = useState<LeaveRequestView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [balData, reqData] = await Promise.all([
        apiRequest<LeaveBalanceView[]>("/leaves/balances/me"),
        apiRequest<{ requests: LeaveRequestView[] }>("/leaves/requests/me")
      ]);
      setBalances(balData);
      setRequests(reqData.requests ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leave data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCancel = async (requestId: string) => {
    const reason = prompt("Please enter the reason for cancelling this leave request:");
    if (!reason) return;

    try {
      setIsCancelling(requestId);
      await apiRequest(`/leaves/requests/${requestId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason })
      });
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel leave request.");
    } finally {
      setIsCancelling(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge tone="success">Approved</Badge>;
      case "PENDING_MANAGER":
        return <Badge tone="warning">Pending Manager</Badge>;
      case "PENDING_HR":
        return <Badge tone="warning">Pending HR</Badge>;
      case "REJECTED":
        return <Badge tone="danger">Rejected</Badge>;
      case "CANCELLED":
        return <Badge tone="neutral">Cancelled</Badge>;
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h1>
          <p className="text-sm text-slate-500">
            View available leave balances, submit requests, and track approval status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/leave/calendar" as Route}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Team Calendar
          </Link>
          <Link
            href={"/leave/balance" as Route}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Balance Ledger
          </Link>
          <Link
            href={"/leave/request" as Route}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
          >
            Apply for Leave
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Balance Summary Cards */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Available Balances</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white p-4 animate-pulse" />
            ))}
          </div>
        ) : balances.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No active leave policies or balances assigned for this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {balances.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold uppercase px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${b.leaveType?.color ?? "#3B82F6"}15`,
                      color: b.leaveType?.color ?? "#3B82F6"
                    }}
                  >
                    {b.leaveType?.code ?? "LEAVE"}
                  </span>
                  <span className="text-xs text-slate-400">Year {b.year}</span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-slate-900">
                    {b.availableDays}{" "}
                    <span className="text-xs font-normal text-slate-500">days left</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {b.leaveType?.name ?? "Leave"}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Used: {b.usedDays}d</span>
                  <span>Pending: {b.pendingDays}d</span>
                  <span>Allocated: {b.allocatedDays}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">My Leave History</h2>
          <span className="text-xs text-slate-500">{requests.length} requests</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading leave requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No leave requests submitted yet. Click &quot;Apply for Leave&quot; above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Leave Type</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Days</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: r.leaveType?.color ?? "#3B82F6" }}
                        />
                        <span>{r.leaveType?.name ?? "Leave"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(r.startDate).toLocaleDateString()}
                      {r.startDate !== r.endDate && (
                        <span> — {new Date(r.endDate).toLocaleDateString()}</span>
                      )}
                      {r.isHalfDay && (
                        <span className="ml-2 text-xs text-amber-600 font-medium">(Half Day)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {r.deductedDays} {r.deductedDays === 1 ? "day" : "days"}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {(r.status === "PENDING_MANAGER" ||
                        r.status === "PENDING_HR" ||
                        r.status === "APPROVED") && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={isCancelling === r.id}
                          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {isCancelling === r.id ? "Cancelling..." : "Cancel"}
                        </button>
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
