"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface MssDashboardData {
  managerId: string;
  teamSize: number;
  pendingApprovalsCount: number;
  teamMembers: Array<{
    id: string;
    fullName: string;
    employeeCode: string;
    designation: string;
    department: string;
  }>;
  teamHealth: {
    averageAttendancePercent: number;
    teamHappinessScore: number;
    goalsCompletionRate: number;
  };
}

export default function MssDashboardPage() {
  const [data, setData] = useState<MssDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMss() {
      try {
        setLoading(true);
        const res = await apiRequest<MssDashboardData>("/mss/dashboard");
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMss();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-muted-foreground">Loading Manager Self Service Cockpit...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Self-Service (MSS)</h1>
          <p className="text-sm text-muted-foreground">
            Direct reports oversight, team attendance, pending approvals, and team sentiment intelligence.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/mss/team" as Route}>
            <Button variant="secondary">Team Roster</Button>
          </Link>
          <Link href={"/mss/approvals" as Route}>
            <Button>Pending Approvals ({data.pendingApprovalsCount})</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Direct Reports</span>
          <div className="text-3xl font-extrabold text-foreground">{data.teamSize}</div>
          <p className="text-xs text-muted-foreground">Active team members</p>
        </Panel>

        <Panel className="space-y-2 bg-primary/5 border-primary/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Actions</span>
          <div className="text-3xl font-extrabold text-primary">{data.pendingApprovalsCount}</div>
          <p className="text-xs text-muted-foreground">Requires your approval</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Team Attendance</span>
          <div className="text-3xl font-extrabold text-success">
            {data.teamHealth.averageAttendancePercent}%
          </div>
          <p className="text-xs text-muted-foreground">Average monthly rate</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Team Morale & Goals</span>
          <div className="text-3xl font-extrabold text-foreground">
            {data.teamHealth.goalsCompletionRate}%
          </div>
          <p className="text-xs text-muted-foreground">Goal completion rate</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold">Team Members</h3>
            <Link href={"/mss/team" as Route} className="text-xs text-primary font-medium hover:underline">
              View All Details →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.teamMembers.map((m) => (
              <div key={m.id} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{m.fullName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {m.designation} • {m.employeeCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge tone="success">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h3 className="text-base font-bold">Manager Quick Actions</h3>
          <div className="space-y-2">
            {[
              { title: "Review Pending Leaves", route: "/mss/approvals", icon: "🏖️" },
              { title: "Evaluate Team Goals", route: "/performance/goals", icon: "🎯" },
              { title: "Schedule 1-on-1 Sync", route: "/performance/1on1", icon: "💬" },
              { title: "Send Team Recognition", route: "/engagement/recognition", icon: "🌟" },
              { title: "Manage Shift Roster", route: "/attendance/shifts", icon: "📅" }
            ].map((action) => (
              <Link key={action.title} href={action.route as Route} className="block">
                <div className="p-3 border border-border rounded flex items-center justify-between hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span>{action.icon}</span>
                    <span className="text-sm font-medium">{action.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
