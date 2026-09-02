"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useManagerTeam, formatEmploymentStatus } from "../../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";

export default function ManagerTeamPage() {
  const gate = usePermissionGate(["mss.read"]);

  const { data: team = [], isLoading, isError, refetch } = useManagerTeam(gate.isAuthorized);

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="flex flex-col gap-5 max-w-6xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-border bg-muted/40 animate-pulse" />
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
            <CardTitle className="text-base">Team Roster Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission (<code className="text-[11px] font-mono">mss.read</code>) to access direct reports.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-0.5">
          <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-muted-foreground">
            <Link href={"/mss" as Route} className="inline-flex items-center gap-1">
              <ArrowLeft className="size-3" />
              <span>Back to Manager Workspace</span>
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">My Direct Reports</h1>
          <p className="text-xs text-muted-foreground">
            Overview of team members reporting directly to your leadership.
          </p>
        </div>

        <Badge variant="secondary" className="h-8 px-3 text-xs">
          {team.length} {team.length === 1 ? "Team Member" : "Team Members"}
        </Badge>
      </div>

      {/* 2. Team Cards Grid */}
      {isError ? (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="size-6 text-destructive mx-auto mb-2" />
          <p className="text-xs font-semibold text-foreground">Team roster unavailable</p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : team.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => {
            const initial = member.fullName ? member.fullName.charAt(0).toUpperCase() : "U";
            const desigName = typeof member.designation === "string" ? member.designation : member.designation?.name || "Team Member";
            const deptName = typeof member.department === "string" ? member.department : member.department?.name || "General";

            return (
              <Card
                key={member.id}
                className="border border-border bg-card shadow-xs transition hover:shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.fullName} /> : null}
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-foreground truncate">{member.fullName}</h3>
                      <p className="text-[11px] text-muted-foreground truncate">{desigName}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                        {deptName}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 border-t border-border/60 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    <Mail className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate text-[11px]">{member.email || "—"}</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <Badge variant={member.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                      {formatEmploymentStatus(member.status)}
                    </Badge>

                    <Button variant="ghost" size="sm" asChild className="h-7 text-[11px] px-2">
                      <Link href={`/employees/${member.id}` as Route}>
                        <span>View Profile</span>
                        <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-border py-12 text-center text-xs text-muted-foreground">
          <Users className="size-8 mx-auto mb-2 opacity-40" />
          <p className="font-semibold text-foreground">No direct reports assigned</p>
          <p className="text-[11px] mt-0.5">Employees assigned to you will appear here.</p>
        </Card>
      )}
    </div>
  );
}
