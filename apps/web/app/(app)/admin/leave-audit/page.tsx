"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";
import type { HolidayView, LeaveRequestView } from "@vc-wms/shared-types";

export default function AdminLeaveAuditPage() {
  const [activeTab, setActiveTab] = useState<"approvals" | "history" | "holidays">("approvals");
  const [requests, setRequests] = useState<LeaveRequestView[]>([]);
  const [holidays, setHolidays] = useState<HolidayView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // New Holiday form state
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayOptional, setHolidayOptional] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [reqData, holData] = await Promise.all([
        apiRequest<{ requests: LeaveRequestView[] }>("/leaves/requests?limit=100"),
        apiRequest<HolidayView[]>("/leaves/holidays")
      ]);
      setRequests(reqData.requests ?? []);
      setHolidays(holData ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leave records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      setIsProcessing(requestId);
      setError(null);
      setSuccessMsg(null);

      await apiRequest(`/leaves/requests/${requestId}/approve`, {
        method: "POST",
        body: JSON.stringify({ action: "APPROVED" })
      });

      setSuccessMsg("Leave request approved successfully. Attendance has been updated.");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve leave request.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const note = prompt("Please enter the reason for rejecting this leave request:");
    if (!note) return;

    try {
      setIsProcessing(requestId);
      setError(null);
      setSuccessMsg(null);

      await apiRequest(`/leaves/requests/${requestId}/reject`, {
        method: "POST",
        body: JSON.stringify({ action: "REJECTED", note })
      });

      setSuccessMsg("Leave request rejected.");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reject leave request.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) return;

    try {
      setError(null);
      await apiRequest("/leaves/holidays", {
        method: "POST",
        body: JSON.stringify({
          name: holidayName,
          date: holidayDate,
          isOptional: holidayOptional
        })
      });

      setHolidayName("");
      setHolidayDate("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create holiday.");
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await apiRequest(`/leaves/holidays/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete holiday.");
    }
  };

  const pendingRequests = requests.filter(
    (r) => r.status === "PENDING_MANAGER" || r.status === "PENDING_HR"
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Leave Approvals & Audit Center
          </h1>
          <p className="text-sm text-slate-500">
            Review pending leave requests, inspect audit history, and manage public holidays.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={"/admin/leave-policies" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Policy Settings
          </Link>
          <Link
            href={"/leave/calendar" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Calendar
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "approvals"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Pending Approvals</span>
          {pendingRequests.length > 0 && (
            <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition border-b-2 ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          All Requests & Audit Trail
        </button>

        <button
          onClick={() => setActiveTab("holidays")}
          className={`pb-3 transition border-b-2 ${
            activeTab === "holidays"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Holiday Calendar ({holidays.length})
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading approvals queue...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
              ✨ No pending leave requests to review.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-base">
                        {r.employee?.fullName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {r.employee?.employeeCode} • {r.employee?.department?.name ?? "—"}
                      </div>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Leave Type:</span>
                      <span className="font-semibold text-slate-800">
                        {r.leaveType?.name} ({r.leaveType?.code})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(r.startDate).toLocaleDateString()} —{" "}
                        {new Date(r.endDate).toLocaleDateString()} ({r.deductedDays}d)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reason:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[200px]">
                        {r.reason}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={isProcessing === r.id}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={isProcessing === r.id}
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                    >
                      {isProcessing === r.id ? "Processing..." : "Approve Leave"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Full History */}
      {activeTab === "history" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">All Leave Requests & Audit Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Days</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{r.employee?.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {r.employee?.employeeCode}
                      </div>
                    </td>
                    <td className="px-6 py-4">{r.leaveType?.name}</td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(r.startDate).toLocaleDateString()} —{" "}
                      {new Date(r.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold">{r.deductedDays}d</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {r.approvals && r.approvals.length > 0 ? (
                        r.approvals.map((a) => (
                          <div key={a.id}>
                            {a.approverRole}: {a.action}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Holidays */}
      {activeTab === "holidays" && (
        <div className="space-y-6">
          {/* Add Holiday Form */}
          <form
            onSubmit={handleCreateHoliday}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-end gap-3"
          >
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Name</label>
              <input
                type="text"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="e.g. Diwali"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="flex items-center pb-2.5">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={holidayOptional}
                  onChange={(e) => setHolidayOptional(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Optional</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition"
            >
              Add Holiday
            </button>
          </form>

          {/* Holidays Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Holiday Name</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Day</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{h.name}</td>
                    <td className="px-6 py-4">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(h.date).toLocaleDateString(undefined, { weekday: "long" })}
                    </td>
                    <td className="px-6 py-4">
                      {h.isOptional ? (
                        <Badge tone="neutral">Optional</Badge>
                      ) : (
                        <Badge tone="warning">Public Holiday</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteHoliday(h.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
