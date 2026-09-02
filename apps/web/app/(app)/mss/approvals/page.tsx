"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  FileText,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import {
  useManagerApprovals,
  useApproveLeaveMutation,
  useRejectLeaveMutation
} from "../../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../../lib/session-store";
import { SkeletonLoader } from "../../../../components/aiavro/feedback/aiavro-states";

export default function ManagerApprovalsPage() {
  const gate = usePermissionGate(["mss.read"]);

  const [activeTab, setActiveTab] = useState<"leaves" | "requests">("leaves");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: approvals, isLoading, isError, refetch } = useManagerApprovals(gate.isAuthorized);
  const approveLeave = useApproveLeaveMutation();
  const rejectLeave = useRejectLeaveMutation();

  const leaves = approvals?.leaves ?? [];
  const requests = approvals?.requests ?? [];

  const handleApproveLeave = async (id: string) => {
    try {
      setActionError(null);
      await approveLeave.mutateAsync({ id });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to approve leave");
    }
  };

  const handleRejectLeave = async (id: string) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (!reason || !reason.trim()) return;
    try {
      setActionError(null);
      await rejectLeave.mutateAsync({ id, reason: reason.trim() });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to reject leave");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="space-y-3">
          <SkeletonLoader className="h-24 rounded-card" />
          <SkeletonLoader className="h-24 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Approvals Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`mss.read`) to access manager approvals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={"/mss" as Route}
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground-muted hover:text-primary transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Manager Workspace</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pending Approvals</h1>
          <p className="text-xs text-foreground-muted">
            Review and action direct reports leave applications and workplace service requests.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab("leaves")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "leaves"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Leave Applications ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "requests"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Service Desk Requests ({requests.length})
        </button>
      </div>

      {/* 3. Approvals Queue */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Approvals queue unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : activeTab === "leaves" ? (
        leaves.length > 0 ? (
          <div className="space-y-3">
            {leaves.map((l) => (
              <div
                key={l.id}
                className="p-5 rounded-card bg-surface-raised border border-border-subtle shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {l.employee?.fullName || "Team Member"}
                    </span>
                    <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary text-[10px] font-bold">
                      {l.leaveType?.name || "Leave"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary font-mono">
                    {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
                  </p>
                  {l.reason && (
                    <p className="text-xs text-foreground-muted italic line-clamp-1">{l.reason}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleRejectLeave(l.id)}
                    disabled={rejectLeave.isPending}
                    className="px-3 py-1.5 rounded-control bg-danger/10 hover:bg-danger/20 text-danger text-xs font-semibold transition inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApproveLeave(l.id)}
                    disabled={approveLeave.isPending}
                    className="px-4 py-1.5 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
            <Calendar className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No pending leave requests</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">All team leave applications have been reviewed.</p>
          </div>
        )
      ) : requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-card bg-surface-raised border border-border-subtle shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {r.employee?.fullName || "Team Member"}
                  </span>
                  <span className="px-2 py-0.5 rounded-pill bg-warning/20 text-warning text-[10px] font-bold">
                    {r.requestType || "REQUEST"}
                  </span>
                </div>
                <p className="text-xs text-foreground-secondary line-clamp-1">{r.reason}</p>
                <p className="text-[10px] text-foreground-muted font-mono">
                  Submitted: {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <FileText className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No pending service requests</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">All team service desk requests have been resolved.</p>
        </div>
      )}
    </div>
  );
}
