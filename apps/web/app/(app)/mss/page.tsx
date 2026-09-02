"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useManagerDashboard } from "../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

export default function ManagerWorkspaceOverviewPage() {
  const gate = usePermissionGate(["mss.read"]);

  const { data: dashboard, isLoading, isError, refetch } = useManagerDashboard(gate.isAuthorized);

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonLoader className="h-28 rounded-card" />
          <SkeletonLoader className="h-28 rounded-card" />
          <SkeletonLoader className="h-28 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Manager Workspace Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`mss.read`) to access manager operations.
          </p>
        </div>
      </div>
    );
  }

  const teamSize = dashboard?.teamSize ?? dashboard?.directReportsCount ?? null;
  const onLeave = dashboard?.onLeaveTodayCount ?? null;
  const pendingApprovals = dashboard?.pendingApprovalsCount ?? null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Manager Workspace</h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Overview of direct report availability, team operations, and pending approvals.
        </p>
      </div>

      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Manager workspace unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* 2. Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Direct Reports */}
            <div className="p-5 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Direct Reports</p>
                <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums mt-1">
                  {typeof teamSize === "number" ? teamSize : "—"}
                </p>
                <Link
                  href={"/mss/team" as Route}
                  className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-2"
                >
                  <span>View Team Roster</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="w-12 h-12 rounded-panel bg-primary-soft text-primary flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* On Leave Today */}
            <div className="p-5 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">On Leave Today</p>
                <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums mt-1">
                  {typeof onLeave === "number" ? onLeave : "—"}
                </p>
                <p className="text-[11px] text-foreground-muted mt-2">Team availability</p>
              </div>
              <div className="w-12 h-12 rounded-panel bg-purple-100 text-purple-700 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="p-5 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Pending Approvals</p>
                <p className="text-2xl font-extrabold font-mono text-warning tabular-nums mt-1">
                  {typeof pendingApprovals === "number" ? pendingApprovals : "—"}
                </p>
                <Link
                  href={"/mss/approvals" as Route}
                  className="text-[11px] font-semibold text-warning hover:underline inline-flex items-center gap-1 mt-2"
                >
                  <span>Review Approvals</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="w-12 h-12 rounded-panel bg-warning/10 text-warning flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 3. Quick Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link
              href={"/mss/team" as Route}
              className="p-6 rounded-card bg-surface-raised border border-border-subtle shadow-card hover:border-primary/40 transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition">
                  My Team Roster
                </h3>
                <p className="text-xs text-foreground-muted">
                  View direct reports, roles, departments, and communication links.
                </p>
              </div>
              <div className="w-10 h-10 rounded-pill bg-surface-muted group-hover:bg-primary-soft group-hover:text-primary transition flex items-center justify-center text-foreground-muted">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href={"/mss/approvals" as Route}
              className="p-6 rounded-card bg-surface-raised border border-border-subtle shadow-card hover:border-primary/40 transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition">
                  Manager Approvals
                </h3>
                <p className="text-xs text-foreground-muted">
                  Approve or reject leave applications and service desk requests.
                </p>
              </div>
              <div className="w-10 h-10 rounded-pill bg-surface-muted group-hover:bg-primary-soft group-hover:text-primary transition flex items-center justify-center text-foreground-muted">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
