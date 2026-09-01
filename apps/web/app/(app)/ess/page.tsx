"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { getOfflineData, isOnline, saveOfflineData } from "../../../lib/offline-storage";
import type { EssDashboardView } from "@vc-wms/shared-types";

export default function EssDashboardPage() {
  const [data, setData] = useState<EssDashboardView | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOnline(isOnline());
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    async function loadData() {
      try {
        setLoading(true);
        const res = await apiRequest<EssDashboardView>("/ess/dashboard");
        setData(res);
        saveOfflineData("ess_dashboard", res);
      } catch (err: unknown) {
        const cached = getOfflineData<EssDashboardView>("ess_dashboard");
        if (cached) {
          setData(cached);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="p-4 sm:p-8 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-muted animate-pulse rounded-panel" />
          <div className="h-40 bg-muted animate-pulse rounded-panel" />
          <div className="h-40 bg-muted animate-pulse rounded-panel" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-danger">Error loading employee self-service: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Offline Alert */}
      {!online && (
        <div className="rounded-control bg-amber-500/10 border border-amber-500/30 p-3 text-amber-700 text-sm flex items-center justify-between">
          <span>⚠️ You are working in Offline Mode. Cached records are displayed.</span>
          <Badge tone="warning">Offline</Badge>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {data?.employee.fullName.charAt(0) ?? "E"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-950">Welcome, {data?.employee.fullName}</h1>
            <p className="text-sm text-zinc-500">
              {data?.employee.designation} • {data?.employee.department} ({data?.employee.employeeCode})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={"/id-card" as Route}>
            <Button variant="secondary" className="flex items-center gap-2">
              <span>🪪</span> View ID Card
            </Button>
          </Link>
          <Link href={"/profile" as Route}>
            <Button variant="primary">My Profile</Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {data?.quickActions.map((action) => (
          <Link key={action.key} href={action.href as Route}>
            <div className="p-4 rounded-control border border-border bg-surface hover:border-primary/50 transition flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-sm">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-semibold text-zinc-800">{action.title}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Attendance & Shift */}
        <Panel className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Today&apos;s Attendance</h2>
            <Badge
              tone={
                data?.todayAttendance.status === "PRESENT"
                  ? "success"
                  : data?.todayAttendance.status === "ON_LEAVE"
                  ? "neutral"
                  : "warning"
              }
            >
              {data?.todayAttendance.status ?? "NOT RECORDED"}
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-zinc-500">Shift</span>
              <span className="font-medium text-zinc-900">{data?.todayAttendance.shiftName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-zinc-500">Shift Timing</span>
              <span className="font-medium text-zinc-900">
                {data?.todayAttendance.shiftStartTime} - {data?.todayAttendance.shiftEndTime}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-zinc-500">Check-In</span>
              <span className="font-medium text-zinc-900">
                {data?.todayAttendance.checkInAt ? new Date(data.todayAttendance.checkInAt).toLocaleTimeString() : "--"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Check-Out</span>
              <span className="font-medium text-zinc-900">
                {data?.todayAttendance.checkOutAt ? new Date(data.todayAttendance.checkOutAt).toLocaleTimeString() : "--"}
              </span>
            </div>
          </div>
          <Link href={"/attendance" as Route}>
            <Button variant="secondary" className="w-full mt-2">
              Punch In / Out
            </Button>
          </Link>
        </Panel>

        {/* Leave Balance Overview */}
        <Panel className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Leave Balances</h2>
            <Badge tone="neutral">{data?.leaveSummary.availableDays ?? 0} Days Avail</Badge>
          </div>
          <div className="space-y-3">
            {data?.leaveSummary.balances.map((b) => (
              <div key={b.leaveType} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{b.leaveType}</span>
                  <span>
                    {b.available} / {b.total} days
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${b.total > 0 ? (b.available / b.total) * 100 : 0}%`,
                      backgroundColor: b.color || "#1f8f5f"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link href={"/leave" as Route}>
            <Button variant="secondary" className="w-full mt-2">
              Apply For Leave
            </Button>
          </Link>
        </Panel>

        {/* Profile Completion & Document Status */}
        <Panel className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Profile Health</h2>
            <Badge tone="success">{data?.employee.profileCompletionPercentage ?? 0}% Complete</Badge>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${data?.employee.profileCompletionPercentage ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500">
              Complete emergency contacts, permanent address, and government IDs to reach 100%.
            </p>
          </div>

          {data?.expiringDocuments && data.expiringDocuments.length > 0 && (
            <div className="rounded-control bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-700 space-y-1">
              <p className="font-semibold">⚠️ Expiring Documents Alert</p>
              {data.expiringDocuments.map((doc) => (
                <p key={doc.id}>
                  • {doc.title} expires in {doc.daysUntilExpiry} days
                </p>
              ))}
            </div>
          )}

          <Link href={"/profile/edit" as Route}>
            <Button variant="secondary" className="w-full mt-2">
              Update Profile Details
            </Button>
          </Link>
        </Panel>
      </div>

      {/* Announcements & Communication Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Company Announcements</h2>
          <Link href={"/announcements" as Route} className="text-xs font-semibold text-primary hover:underline">
            View All →
          </Link>
        </div>

        {data?.activeAnnouncements && data.activeAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeAnnouncements.map((ann) => (
              <Panel key={ann.id} className="p-5 space-y-2 hover:border-primary/40 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ann.isPinned && <span className="text-amber-500 text-xs">📌 Pinned</span>}
                    <Badge tone={ann.priority === "URGENT" || ann.priority === "HIGH" ? "danger" : "neutral"}>
                      {ann.priority}
                    </Badge>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(ann.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-900 text-base">{ann.title}</h4>
                <p className="text-zinc-600 text-sm line-clamp-2">{ann.content}</p>
                <div className="pt-2 flex items-center justify-between border-t border-border/40 text-xs">
                  <span className="text-zinc-500">By {ann.authorName}</span>
                  <Link href={`/announcements/${ann.id}` as Route} className="font-medium text-primary hover:underline">
                    Read & Acknowledge →
                  </Link>
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <Panel className="p-6 text-center">
            <p className="text-sm text-zinc-500">No active company announcements at this time.</p>
          </Panel>
        )}
      </div>

      {/* Bottom Grid: Recent Payslips & Upcoming Holidays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Payslips */}
        <Panel className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Recent Payslips</h2>
            <Link href={"/payslips" as Route} className="text-xs font-semibold text-primary hover:underline">
              All Payslips →
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentPayslips && data.recentPayslips.length > 0 ? (
              data.recentPayslips.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-control border border-border bg-surface"
                >
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{p.periodLabel}</p>
                    <p className="text-xs text-zinc-500">Net Pay: ₹{p.netPay.toLocaleString("en-IN")}</p>
                  </div>
                  <Link href={`/payslips/${p.id}` as Route}>
                    <Button variant="secondary" className="text-xs">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">No published payslips found.</p>
            )}
          </div>
        </Panel>

        {/* Upcoming Holidays */}
        <Panel className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Upcoming Holidays</h2>
            <Link href={"/leave/calendar" as Route} className="text-xs font-semibold text-primary hover:underline">
              Holiday Calendar →
            </Link>
          </div>
          <div className="space-y-3">
            {data?.upcomingHolidays && data.upcomingHolidays.length > 0 ? (
              data.upcomingHolidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-control border border-border bg-surface"
                >
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{h.name}</p>
                    <p className="text-xs text-zinc-500">{h.dayOfWeek}</p>
                  </div>
                  <Badge tone="neutral">{h.date}</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">No upcoming holidays scheduled.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
