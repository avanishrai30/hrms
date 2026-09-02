"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../components/ui";
import { EmptyState, ErrorState, LoadingState, Metric, MetricStrip, PageHeader, Section, StatusBadge, Surface } from "../../../components/page-primitives";
import { loadDashboard, roleLabel, statusTone } from "../../../lib/dashboard-data";
import { useSessionStore } from "../../../lib/session-store";

export default function DashboardPage() {
  const permissions = useSessionStore((state) => state.permissions);
  const tenantName = useSessionStore((state) => state.tenantName);
  const dashboard = useQuery({ queryKey: ["home-dashboard"], queryFn: loadDashboard });
  const isHr = permissions.includes("employees.read");
  const totalLeaveDays = dashboard.data?.leaveBalances.reduce((sum, item) => sum + Number(item.availableDays ?? 0), 0) ?? 0;
  const latestPayslip = dashboard.data?.payslips[0];
  const attendanceStatus = dashboard.data?.attendance?.record?.status ?? "Not marked";

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      <PageHeader
        eyebrow={roleLabel(permissions)}
        title={`Good to see you in ${tenantName}`}
        description="Your AIavro home surfaces tenant-scoped work, approvals, and personal workforce tasks from live platform APIs."
        actions={
          <>
            <Link href={"/attendance" as Route}>
              <Button variant="secondary">Open attendance</Button>
            </Link>
            <Link href={"/ai" as Route}>
              <Button>Ask AIavro</Button>
            </Link>
          </>
        }
      />

      {dashboard.isLoading ? <LoadingState label="Loading your workspace" /> : null}
      {dashboard.isError ? <ErrorState message={dashboard.error.message} /> : null}
      {dashboard.data?.unavailable.length ? <ErrorState message={`Some workspace data is unavailable: ${dashboard.data.unavailable.join(", ")}.`} /> : null}

      {dashboard.data ? (
        <>
          <MetricStrip>
            <Metric
              label="Today"
              value={attendanceStatus}
              detail={dashboard.data.attendance?.record?.checkInAt ? `Checked in ${new Date(dashboard.data.attendance.record.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Ready when you are"}
            />
            <Metric label="Leave balance" value={totalLeaveDays} detail={`${dashboard.data.leaveBalances.length} leave types assigned`} />
            <Metric label="Pending requests" value={dashboard.data.leaveRequests.filter((item) => item.status.includes("PENDING")).length} detail="Personal leave/request workflow" />
            <Metric label={isHr ? "Employees visible" : "Latest payslip"} value={isHr ? dashboard.data.employeeCount ?? "Unavailable" : latestPayslip ? `${latestPayslip.month}/${latestPayslip.year}` : "Not released"} detail={isHr ? "From employee directory API" : latestPayslip?.status ?? "Payroll release pending"} />
          </MetricStrip>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
            <Surface className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">Today&apos;s workspace</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Start with the actions most likely to need attention in this tenant.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link className="rounded-panel border border-border bg-canvas p-4 transition hover:border-zinc-300" href={"/attendance" as Route}>
                    <p className="text-sm font-semibold text-zinc-950">Attendance</p>
                    <p className="mt-2 text-sm text-zinc-600">{dashboard.data.attendance?.canCheckIn ? "Check in is available." : "Review today's attendance."}</p>
                  </Link>
                  <Link className="rounded-panel border border-border bg-canvas p-4 transition hover:border-zinc-300" href={"/leave/request" as Route}>
                    <p className="text-sm font-semibold text-zinc-950">Leave</p>
                    <p className="mt-2 text-sm text-zinc-600">Request time off or review balances.</p>
                  </Link>
                  <Link className="rounded-panel border border-border bg-canvas p-4 transition hover:border-zinc-300" href={"/requests" as Route}>
                    <p className="text-sm font-semibold text-zinc-950">Requests</p>
                    <p className="mt-2 text-sm text-zinc-600">Track employee-service workflows.</p>
                  </Link>
                  <Link className="rounded-panel border border-border bg-canvas p-4 transition hover:border-zinc-300" href={"/ai" as Route}>
                    <p className="text-sm font-semibold text-zinc-950">AI Workspace</p>
                    <p className="mt-2 text-sm text-zinc-600">Ask role-aware questions using tenant-scoped context.</p>
                  </Link>
                </div>
              </div>
              <div className="rounded-panel bg-zinc-950 p-5 text-white">
                <p className="text-sm font-semibold">AIavro status</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">{dashboard.data.unavailable.length ? "Partial" : "Ready"}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">Dashboard cards only use available API data. Missing sources are shown as unavailable instead of synthetic metrics.</p>
              </div>
            </Surface>

            <Section title="Announcements" description="Tenant messages from the announcements API.">
              {dashboard.data.announcements.length ? (
                <div className="divide-y divide-border">
                  {dashboard.data.announcements.slice(0, 4).map((item) => (
                    <div className="flex items-center justify-between gap-4 py-3" key={item.id}>
                      <p className="text-sm font-medium text-zinc-800">{item.title}</p>
                      <StatusBadge tone={statusTone(item.priority)}>{item.priority ?? "Update"}</StatusBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No announcements yet" description="Tenant announcements will appear here when published." />
              )}
            </Section>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Section title="Leave requests">
              {dashboard.data.leaveRequests.length ? (
                <div className="divide-y divide-border">
                  {dashboard.data.leaveRequests.slice(0, 5).map((item) => (
                    <div className="flex items-center justify-between gap-4 py-3" key={item.id}>
                      <p className="text-sm text-zinc-700">{item.startDate ? new Date(item.startDate).toLocaleDateString() : "Request"}</p>
                      <StatusBadge tone={statusTone(item.status)}>{item.status.replace(/_/g, " ")}</StatusBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No leave requests" description="Your submitted leave requests will appear here." />
              )}
            </Section>

            <Section title={isHr ? "HR view" : "Payslips"}>
              {isHr ? (
                <div className="grid gap-3">
                  <Link className="rounded-panel border border-border bg-canvas p-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-300" href="/employees">
                    Review employee directory
                  </Link>
                  <Link className="rounded-panel border border-border bg-canvas p-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-300" href="/analytics/workforce">
                    Open workforce analytics
                  </Link>
                </div>
              ) : latestPayslip ? (
                <div className="flex items-center justify-between gap-4 rounded-panel border border-border bg-canvas p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">
                      {latestPayslip.month}/{latestPayslip.year}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">Latest released payroll artifact.</p>
                  </div>
                  <StatusBadge tone={statusTone(latestPayslip.status)}>{latestPayslip.status}</StatusBadge>
                </div>
              ) : (
                <EmptyState title="No payslips released" description="Payslips appear here after payroll is finalized." />
              )}
            </Section>
          </section>
        </>
      ) : null}
    </div>
  );
}
