"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useManagerDashboard } from "../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function ManagerWorkspaceOverviewPage() {
  const gate = usePermissionGate(["mss.read"]);

  const { data: dashboard, isLoading, isError, refetch } = useManagerDashboard(gate.isAuthorized);

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="flex flex-col gap-5 max-w-6xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full text-center p-6 border-border shadow-xs">
          <CardHeader className="items-center pb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Manager Workspace Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission (<code className="text-[11px] font-mono">mss.read</code>) to access manager operations.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const teamSize = dashboard?.teamSize ?? dashboard?.directReportsCount ?? null;
  const onLeave = dashboard?.onLeaveTodayCount ?? null;
  const pendingApprovals = dashboard?.pendingApprovalsCount ?? null;

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Manager Workspace</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review and action direct reports leave applications; monitor workplace service requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={"/mss/team" as Route}>
              <Users className="size-3.5 mr-1.5 text-primary" />
              <span>Team Roster</span>
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={"/mss/approvals" as Route}>
              <CheckCircle2 className="size-3.5 mr-1.5" />
              <span>Pending Approvals</span>
            </Link>
          </Button>
        </div>
      </div>

      {isError ? (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="size-6 text-destructive mx-auto mb-2" />
          <p className="text-xs font-semibold text-foreground">Manager dashboard unavailable</p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* 2. Metric KPI Cards Grid (Studio Admin Pattern) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Direct Reports */}
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-xs font-semibold text-muted-foreground">
                  Direct Reports
                </CardDescription>
                <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                  <Users className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {typeof teamSize === "number" ? teamSize : "—"}
                </div>
                <div className="pt-2">
                  <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-primary font-semibold">
                    <Link href={"/mss/team" as Route} className="inline-flex items-center gap-1">
                      <span>View Team Roster</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: On Leave Today */}
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-xs font-semibold text-muted-foreground">
                  On Leave Today
                </CardDescription>
                <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                  <Calendar className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {typeof onLeave === "number" ? onLeave : 0}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Direct team availability</p>
              </CardContent>
            </Card>

            {/* Card 3: Pending Approvals */}
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-xs font-semibold text-muted-foreground">
                  Pending Approvals
                </CardDescription>
                <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                  <CheckCircle2 className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {typeof pendingApprovals === "number" ? pendingApprovals : 0}
                </div>
                <div className="pt-2">
                  <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-primary font-semibold">
                    <Link href={"/mss/approvals" as Route} className="inline-flex items-center gap-1">
                      <span>Review Leave Queue</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Team Operations & Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Users className="size-3.5 text-primary" />
                  Team Roster & Attendance
                </CardTitle>
                <CardDescription>Monitor your direct reports' status and work allocation.</CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href={"/mss/team" as Route}>Manage Direct Reports</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  Approval Queue
                </CardTitle>
                <CardDescription>Review leave requests and monitor service requests.</CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href={"/mss/approvals" as Route}>Open Approval Queue</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
