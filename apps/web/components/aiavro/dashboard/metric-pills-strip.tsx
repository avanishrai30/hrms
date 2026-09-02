"use client";

import React from "react";
import { Users, Briefcase, Building2, Calendar, Clock, CheckCircle2 } from "lucide-react";

interface MetricPillsStripProps {
  userName: string;
  isHrOrAdmin: boolean;
  attendanceStatus: string;
  leaveBalanceDays: number;
  pendingRequestsCount: number;
  employeeCount: number | null;
  departmentsCount?: number;
  openingsCount?: number;
}

export function MetricPillsStrip({
  userName,
  isHrOrAdmin,
  attendanceStatus,
  leaveBalanceDays,
  pendingRequestsCount,
  employeeCount,
  departmentsCount = 6,
  openingsCount = 4
}: MetricPillsStripProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Welcome Title */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-foreground">
          Welcome back, <span className="text-primary">{userName}</span>
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5 font-medium">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })} • AIavro Workforce OS
        </p>
      </div>

      {/* Metric Pills & Stat Capsules */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Progress / Status Capsules */}
        <div className="flex items-center gap-2 p-1.5 rounded-pill bg-surface-raised border border-border-subtle shadow-card">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{attendanceStatus}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary-soft text-primary text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{leaveBalanceDays}d Leave</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-muted text-foreground-secondary text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>{pendingRequestsCount} Pending</span>
          </div>
        </div>

        {/* Global Summary Stats (When authorized or available) */}
        {isHrOrAdmin && employeeCount !== null && (
          <div className="hidden sm:flex items-center gap-4 pl-2 border-l border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-pill bg-primary-soft flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground tabular-nums leading-none">{employeeCount}</div>
                <div className="text-[10px] text-foreground-muted font-medium">Employees</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-pill bg-accent-lilac/30 flex items-center justify-center text-accent-purple">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground tabular-nums leading-none">{openingsCount}</div>
                <div className="text-[10px] text-foreground-muted font-medium">Openings</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-pill bg-surface-muted flex items-center justify-center text-foreground-secondary">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground tabular-nums leading-none">{departmentsCount}</div>
                <div className="text-[10px] text-foreground-muted font-medium">Depts</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
