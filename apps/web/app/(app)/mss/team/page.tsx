"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  Mail,
  ArrowLeft,
  User,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useManagerTeam } from "../../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../../lib/session-store";
import { SkeletonLoader } from "../../../../components/aiavro/feedback/aiavro-states";

export default function ManagerTeamPage() {
  const gate = usePermissionGate(["mss.read"]);

  const { data: team = [], isLoading, isError, refetch } = useManagerTeam(gate.isAuthorized);

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader className="h-36 rounded-card" />
          <SkeletonLoader className="h-36 rounded-card" />
          <SkeletonLoader className="h-36 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Team Roster Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`mss.read`) to access direct reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Direct Reports</h1>
          <p className="text-xs text-foreground-muted">
            Overview of team members reporting directly to your leadership.
          </p>
        </div>
      </div>

      {/* 2. Team Cards */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Team roster unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : team.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => {
            const initial = member.fullName ? member.fullName.charAt(0).toUpperCase() : "";
            const desigName = typeof member.designation === "string" ? member.designation : member.designation?.name || "—";
            const deptName = typeof member.department === "string" ? member.department : member.department?.name || "—";

            return (
              <div
                key={member.id}
                className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card hover:border-primary/30 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-panel bg-primary-soft text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-border-subtle">
                      {member.avatarUrl || member.profilePhoto ? (
                        <img src={member.avatarUrl || member.profilePhoto || ""} alt={member.fullName || "Avatar"} className="w-full h-full object-cover rounded-panel" />
                      ) : initial ? (
                        initial
                      ) : (
                        <User className="w-5 h-5 text-foreground-muted" />
                      )}
                    </div>
                    {member.employeeCode && (
                      <span className="px-2 py-0.5 rounded-pill bg-surface-muted text-foreground-muted text-[10px] font-mono font-semibold">
                        {member.employeeCode}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">{member.fullName || "—"}</h3>
                    <p className="text-xs text-foreground-secondary font-medium mt-0.5 line-clamp-1">
                      {desigName}
                    </p>
                    <p className="text-[11px] text-foreground-muted mt-0.5">{deptName}</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-[11px] text-foreground-muted hover:text-primary transition flex items-center gap-1.5 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-foreground-muted">—</span>
                  )}

                  <Link
                    href={`/employees/${member.id}` as Route}
                    className="p-1 rounded-control text-foreground-muted hover:text-primary hover:bg-surface-muted transition"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Users className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No direct reports assigned</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">
            You do not currently have any direct reporting employees in this workspace.
          </p>
        </div>
      )}
    </div>
  );
}
