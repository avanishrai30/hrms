"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Calendar,
  PlusCircle,
  Clock,
  Sun
} from "lucide-react";
import {
  useLeaveBalances,
  useLeaveRequests,
  useHolidays,
  useCancelLeaveRequest
} from "../../../lib/queries/use-ess-queries";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

export default function EmployeeLeavePage() {
  const balancesQuery = useLeaveBalances();
  const requestsQuery = useLeaveRequests();
  const holidaysQuery = useHolidays();
  const cancelMutation = useCancelLeaveRequest();

  const balances = balancesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const holidays = holidaysQuery.data ?? [];

  const totalAvailable = balancesQuery.isSuccess
    ? balances.reduce((sum, b) => sum + Number(b.availableDays ?? 0), 0)
    : null;

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelMutation.mutateAsync(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel request");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave & Time Off</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Manage your time-off balances, request leaves, and review holiday schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={"/leave/calendar" as Route}
            className="px-3.5 py-2 rounded-control bg-surface-muted hover:bg-muted text-foreground-secondary text-xs font-semibold transition inline-flex items-center gap-1.5 border border-border-subtle"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Leave Calendar</span>
          </Link>

          <Link
            href={"/leave/request" as Route}
            className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Leave</span>
          </Link>
        </div>
      </div>

      {/* 2. Balances Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Hero Card */}
        <div className="rounded-card bg-gradient-to-br from-[#E2E0FC] via-[#D3D0F8] to-[#C4C0F4] p-5 text-zinc-900 shadow-card border border-white/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Total Available</span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-zinc-950 tabular-nums">
              {typeof totalAvailable === "number" ? `${totalAvailable}d` : "—"}
            </span>
          </div>
          <span className="text-[10px] text-zinc-700 font-medium">Accumulated paid & casual balance</span>
        </div>

        {/* Dynamic Balance Types */}
        {balancesQuery.isLoading ? (
          <>
            <div className="h-28 rounded-card bg-surface-muted/60 animate-pulse border border-border-subtle" />
            <div className="h-28 rounded-card bg-surface-muted/60 animate-pulse border border-border-subtle" />
            <div className="h-28 rounded-card bg-surface-muted/60 animate-pulse border border-border-subtle" />
          </>
        ) : balances.length > 0 ? (
          balances.map((b) => (
            <div
              key={b.id}
              className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                  {b.leaveType?.name || b.leaveType?.code || "Leave"}
                </span>
                <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary font-mono text-[10px] font-bold">
                  {b.leaveType?.code || "LEAVE"}
                </span>
              </div>
              <div className="my-1.5">
                <span className="text-2xl font-extrabold font-mono text-foreground tabular-nums">
                  {b.availableDays}d
                </span>
              </div>
              <div className="text-[10px] text-foreground-muted flex justify-between">
                <span>Allocated: {b.allocatedDays ?? 0}d</span>
                <span>Used: {b.consumedDays ?? 0}d</span>
              </div>
            </div>
          ))
        ) : (
          <div className="sm:col-span-3 rounded-card bg-surface-raised border border-border-subtle p-5 text-center text-xs text-foreground-muted flex items-center justify-center">
            No specific leave types configured for your profile.
          </div>
        )}
      </div>

      {/* 3. Leave Requests & Holidays Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Cols: My Leave Requests */}
        <div className="lg:col-span-2 rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              My Leave Requests
            </h3>
          </div>

          {requestsQuery.isLoading ? (
            <div className="space-y-2">
              <SkeletonLoader className="h-12 w-full rounded-control" />
              <SkeletonLoader className="h-12 w-full rounded-control" />
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-2.5">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-card bg-surface-muted/50 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {r.leaveType?.name || "Time Off Request"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-pill text-[10px] font-bold ${
                          r.status === "APPROVED"
                            ? "bg-success/20 text-success"
                            : r.status.includes("PENDING")
                            ? "bg-warning/20 text-warning"
                            : "bg-surface-muted text-foreground-muted"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground-secondary font-mono">
                      {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                    </p>
                    {r.reason && <p className="text-[11px] text-foreground-muted italic truncate">{r.reason}</p>}
                  </div>

                  {r.status.includes("PENDING") && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      disabled={cancelMutation.isPending}
                      className="px-3 py-1 rounded-control bg-danger/10 hover:bg-danger/20 text-danger text-xs font-semibold transition shrink-0 self-start sm:self-auto"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-foreground-muted">
              No leave requests submitted yet.
            </div>
          )}
        </div>

        {/* Right Col: Upcoming Holidays */}
        <div className="rounded-card bg-[#18153B] text-white p-5 shadow-panel border border-[#2B2758] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-purple-300" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Upcoming Holidays</h3>
            </div>
          </div>

          {holidaysQuery.isLoading ? (
            <div className="space-y-2">
              <SkeletonLoader className="h-10 w-full rounded-control bg-white/10" />
              <SkeletonLoader className="h-10 w-full rounded-control bg-white/10" />
            </div>
          ) : holidays.length > 0 ? (
            <div className="space-y-2">
              {holidays.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-control bg-white/10 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{h.name}</p>
                    <p className="text-[10px] text-purple-200/70 font-mono">
                      {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-pill bg-purple-500/20 text-purple-200 text-[9px] font-bold shrink-0">
                    HOLIDAY
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-purple-200/70">
              No upcoming holidays scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
