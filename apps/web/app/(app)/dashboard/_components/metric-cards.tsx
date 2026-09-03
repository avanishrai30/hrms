"use client";

import * as React from "react";
import { Users, Clock, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  useAttendanceToday,
  useLeaveBalances,
  useEmployeeRequests,
  useEmployeeCount
} from "../../../../lib/queries/use-dashboard-queries";
import { useSessionStore } from "../../../../lib/session-store";
import {
  formatLeaveDaysMetric,
  formatPendingRequestsMetric,
  formatShiftName,
  getPendingRequestsBadge
} from "../../../../lib/semantic-state";

export function MetricCards() {
  const permissions = useSessionStore((state) => state.permissions) || [];
  const isHrOrAdmin = permissions.includes("employees.read") || permissions.includes("tenant.settings.read");

  const attendanceQuery = useAttendanceToday();
  const leaveBalancesQuery = useLeaveBalances();
  const requestsQuery = useEmployeeRequests();
  const employeeCountQuery = useEmployeeCount(isHrOrAdmin);

  const attendance = attendanceQuery.data;
  const attendanceRecord = attendance?.record;
  const canPunchIn = attendance?.canCheckIn ?? false;
  const canPunchOut = attendance?.canCheckOut ?? false;

  const leaveBalances = leaveBalancesQuery.data ?? [];
  const totalLeaveDays = leaveBalancesQuery.isSuccess
    ? leaveBalances.reduce((sum, item) => sum + Number(item.availableDays ?? 0), 0)
    : null;

  const requests = requestsQuery.data ?? [];
  const pendingRequestsCount = requestsQuery.isSuccess
    ? requests.filter((r) => r.status.includes("PENDING")).length
    : null;

  const employeeCount = employeeCountQuery.data ?? null;
  const shiftLabel = formatShiftName(attendance?.shift, { isSuccess: attendanceQuery.isSuccess });
  const leaveMetric = formatLeaveDaysMetric(totalLeaveDays, {
    isLoading: leaveBalancesQuery.isLoading,
    isSuccess: leaveBalancesQuery.isSuccess
  });
  const requestsMetric = formatPendingRequestsMetric(pendingRequestsCount, {
    isLoading: requestsQuery.isLoading,
    isSuccess: requestsQuery.isSuccess
  });
  const requestsBadge = getPendingRequestsBadge(pendingRequestsCount, { isSuccess: requestsQuery.isSuccess });

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
      {/* Card 1: Active Workforce */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Active Workforce</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {employeeCountQuery.isLoading
                ? "—"
                : employeeCount !== null
                ? employeeCount.toLocaleString()
                : "—"}
            </div>
            <Badge variant="secondary">
              <TrendingUp className="size-3 mr-1" />
              Active
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">VC Organics Headcount</p>
        </CardContent>
      </Card>

      {/* Card 2: Today's Attendance / Shift */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Clock className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Today's Shift</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl leading-none tracking-tight truncate">
              {attendanceQuery.isLoading
                ? "—"
                : attendanceRecord?.checkInAt && attendanceRecord?.checkOutAt
                ? "Shift Ended"
                : canPunchOut
                ? "On Duty"
                : canPunchIn
                ? "Ready"
                : attendanceRecord?.status
                ? attendanceRecord.status.replace(/_/g, " ")
                : "—"}
            </div>
            <Badge variant={canPunchOut ? "default" : "secondary"}>
              {canPunchOut ? "Active" : "Shift"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs truncate">{shiftLabel}</p>
        </CardContent>
      </Card>

      {/* Card 3: Available Leave */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Calendar className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Available Leave</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {leaveMetric}
            </div>
            <Badge variant="outline">Available</Badge>
          </div>
          <p className="text-muted-foreground text-xs">Current available balance</p>
        </CardContent>
      </Card>

      {/* Card 4: Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <CheckCircle2 className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Pending Requests</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {requestsMetric}
            </div>
            {requestsBadge ? <Badge variant="secondary">{requestsBadge}</Badge> : null}
          </div>
          <p className="text-muted-foreground text-xs">Service desk & approvals</p>
        </CardContent>
      </Card>
    </div>
  );
}
