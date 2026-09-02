"use client";

import React from "react";
import { Users, Calendar, Clock, CheckCircle2 } from "lucide-react";

interface MetricPillsStripProps {
  userName?: string | null | undefined;
  isHrOrAdmin: boolean;
  attendanceStatus?: string | null | undefined;
  leaveBalanceDays?: number | null | undefined;
  pendingRequestsCount?: number | null | undefined;
  employeeCount?: number | null | undefined;
}

export function MetricPillsStrip({
  userName,
  isHrOrAdmin,
  attendanceStatus = "Ready to Clock In",
  leaveBalanceDays,
  pendingRequestsCount,
  employeeCount
}: MetricPillsStripProps) {
  const displayName = userName || "User";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-foreground">
          Welcome back, <span className="text-primary">{displayName}</span>
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5 font-medium">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })} • AIavro Workforce OS
        </p>
      </div>

      {/* Metric Pills & Stat Capsules */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-pill bg-surface-raised border border-border-subtle shadow-card">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{attendanceStatus || "Ready"}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary-soft text-primary text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {typeof leaveBalanceDays === "number" ? `${leaveBalanceDays}d Leave` : "— Leave"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-muted text-foreground-secondary text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>
              {typeof pendingRequestsCount === "number" ? `${pendingRequestsCount} Pending` : "0 Pending"}
            </span>
          </div>
        </div>

        {/* Real Headcount Stat (Only when authorized and available) */}
        {isHrOrAdmin && typeof employeeCount === "number" && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border-subtle">
            <div className="w-8 h-8 rounded-pill bg-primary-soft flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground tabular-nums leading-none font-mono">
                {employeeCount}
              </div>
              <div className="text-[10px] text-foreground-muted font-medium">Employees</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
