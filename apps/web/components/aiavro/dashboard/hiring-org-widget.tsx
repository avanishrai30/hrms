"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, BarChart2 } from "lucide-react";
import type { LeaveBalanceItem } from "../../../lib/queries/use-dashboard-queries";
import { SkeletonLoader } from "../feedback/aiavro-states";

interface HiringOrgWidgetProps {
  isHrOrAdmin: boolean;
  totalEmployees?: number | null | undefined;
  leaveBalances?: LeaveBalanceItem[] | undefined;
  isLoading?: boolean | undefined;
  isError?: boolean | undefined;
}

export function HiringOrgWidget({
  isHrOrAdmin,
  totalEmployees,
  leaveBalances = [],
  isLoading,
  isError
}: HiringOrgWidgetProps) {
  if (isLoading) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card min-h-[240px] flex flex-col justify-between animate-pulse">
        <div className="flex justify-between">
          <SkeletonLoader className="h-4 w-28" />
          <SkeletonLoader className="h-6 w-6 rounded-pill" />
        </div>
        <SkeletonLoader className="h-10 w-24 my-3" />
        <SkeletonLoader className="h-16 w-full rounded-card" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card min-h-[240px] flex flex-col items-center justify-center text-center">
        <p className="text-xs font-semibold text-foreground">Data Unavailable</p>
        <p className="text-[11px] text-foreground-muted mt-1">Unable to load summary metrics.</p>
      </div>
    );
  }

  if (isHrOrAdmin && totalEmployees !== undefined && totalEmployees !== null) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card flex flex-col justify-between min-h-[240px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Organization Headcount</h3>
            <p className="text-[11px] text-foreground-muted font-medium">Directory Master Record</p>
          </div>
          <Link
            href={"/employees" as Route}
            className="w-7 h-7 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
            title="View employee directory"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Real Headcount Stat */}
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-foreground tabular-nums tracking-tight">
              {totalEmployees}
            </span>
            <span className="text-xs text-foreground-muted font-semibold">Active Members</span>
          </div>
        </div>

        {/* Calm trend notice (No fake bar charts!) */}
        <div className="p-3 rounded-card bg-surface-muted/50 border border-border-subtle flex items-center gap-2.5 text-xs text-foreground-secondary">
          <BarChart2 className="w-4 h-4 text-primary shrink-0" />
          <span className="text-[11px]">Workforce trend historical analytics enabled in Analytics Hub.</span>
        </div>
      </div>
    );
  }

  // Employee View: Leave Balances by Type
  const totalAvailable = leaveBalances.reduce((sum, item) => sum + Number(item.availableDays ?? 0), 0);

  return (
    <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card flex flex-col justify-between min-h-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Leave Balances</h3>
          <p className="text-[11px] text-foreground-muted font-medium">Allocated Time Off</p>
        </div>
        <Link
          href={"/leave" as Route}
          className="w-7 h-7 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
          title="View leave balances"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Count */}
      <div className="my-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold font-mono text-foreground tabular-nums tracking-tight">
            {totalAvailable}
          </span>
          <span className="text-xs text-foreground-muted font-semibold">Days Available</span>
        </div>
      </div>

      {/* Real Breakdown List */}
      <div className="space-y-1.5 pt-2 border-t border-border-subtle">
        {leaveBalances.length > 0 ? (
          leaveBalances.slice(0, 2).map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs py-0.5">
              <span className="text-foreground-secondary font-medium truncate max-w-[150px]">
                {b.leaveType?.name || b.leaveType?.code || "Standard Leave"}
              </span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                {b.availableDays}d
              </span>
            </div>
          ))
        ) : (
          <p className="text-[11px] text-foreground-muted">No specific leave types configured.</p>
        )}
      </div>
    </div>
  );
}
