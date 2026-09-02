"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  MapPin,
  Building,
  CreditCard,
  FolderOpen
} from "lucide-react";
import { useSessionStore } from "../../../lib/session-store";
import {
  useEmployeeProfile,
  useAttendanceToday,
  useLeaveBalances,
  useEmployeeRequests,
  useAnnouncements,
  useEmployeeCount
} from "../../../lib/queries/use-dashboard-queries";
import { usePunchMutation } from "../../../lib/queries/use-ess-queries";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "../../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";

export default function AiavroDashboardPage() {
  const permissions = useSessionStore((state) => state.permissions) || [];
  const isHrOrAdmin = permissions.includes("employees.read") || permissions.includes("tenant.settings.read");

  // Real API Queries
  const profileQuery = useEmployeeProfile();
  const attendanceQuery = useAttendanceToday();
  const leaveBalancesQuery = useLeaveBalances();
  const requestsQuery = useEmployeeRequests();
  const announcementsQuery = useAnnouncements();
  const employeeCountQuery = useEmployeeCount(isHrOrAdmin);
  const punchMutation = usePunchMutation();

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const profile = profileQuery.data ?? null;
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

  const announcements = announcementsQuery.data ?? [];
  const employeeCount = employeeCountQuery.data ?? null;

  const handlePunch = async () => {
    try {
      await punchMutation.mutateAsync({
        action: canPunchOut ? "check-out" : "check-in"
      });
    } catch {}
  };

  const deptName = typeof profile?.department === "string" ? profile.department : profile?.department?.name || "—";
  const desigName = typeof profile?.designation === "string" ? profile.designation : profile?.designation?.title || profile?.designation?.name || "—";

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* 1. Metric Cards Grid (Studio Admin Metric Cards Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Active Workforce */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-muted-foreground">
                Active Workforce
              </CardDescription>
              <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {employeeCountQuery.isLoading
                  ? "—"
                  : employeeCount !== null
                  ? employeeCount.toLocaleString()
                  : "Verified"}
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground shrink-0">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                <TrendingUp className="size-3 mr-0.5" />
                Live Sync
              </Badge>
              <span>VC Organics Tenant</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Today's Attendance */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-muted-foreground">
                Today's Shift
              </CardDescription>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {attendanceQuery.isLoading
                  ? "Loading..."
                  : attendanceRecord?.checkInAt && attendanceRecord?.checkOutAt
                  ? "Shift Ended"
                  : canPunchOut
                  ? "Punched In"
                  : canPunchIn
                  ? "Ready to Start"
                  : attendanceRecord?.status
                  ? attendanceRecord.status.replace(/_/g, " ")
                  : "Active"}
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground shrink-0">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant={canPunchOut ? "success" : "secondary"} className="px-1.5 py-0 text-[10px]">
                {canPunchOut ? "On Duty" : "Shift Ready"}
              </Badge>
              <span>{attendance?.shift?.name || "Standard Office Shift"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Leave Balances */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-muted-foreground">
                Leave Balance
              </CardDescription>
              <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {leaveBalancesQuery.isLoading
                  ? "—"
                  : totalLeaveDays !== null
                  ? `${totalLeaveDays} Days`
                  : "0 Days"}
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground shrink-0">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                Accrued
              </Badge>
              <span>Annual, Casual & Sick</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Pending Requests */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-muted-foreground">
                Pending Requests
              </CardDescription>
              <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {requestsQuery.isLoading
                  ? "—"
                  : pendingRequestsCount !== null
                  ? pendingRequestsCount
                  : 0}
              </div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge
                variant={pendingRequestsCount && pendingRequestsCount > 0 ? "warning" : "secondary"}
                className="px-1.5 py-0 text-[10px]"
              >
                {pendingRequestsCount && pendingRequestsCount > 0 ? "Pending Review" : "Up to date"}
              </Badge>
              <span>Service desk & approvals</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Middle Section: Attendance Punch Card + Profile Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Cols: Attendance & Real-Time Punch */}
        <Card className="lg:col-span-2 border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Work Time & Punch Terminal
              </CardTitle>
              <CardDescription>
                Geofenced attendance logging for VC Organics Bangalore HQ
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-1 rounded-md">
                {currentTime || "00:00:00"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground font-medium">Check-In Time</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {attendanceRecord?.checkInAt
                    ? new Date(attendanceRecord.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Not clocked in"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground font-medium">Check-Out Time</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {attendanceRecord?.checkOutAt
                    ? new Date(attendanceRecord.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "In progress"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground font-medium">Shift Assignment</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {attendance?.shift?.name || "General Shift (09:00 - 18:00)"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary" />
                <span>Location: Bangalore HQ (100m Radius Verified)</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {canPunchIn ? (
                  <Button
                    onClick={handlePunch}
                    disabled={punchMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Clock className="size-3.5 mr-1.5" />
                    <span>{punchMutation.isPending ? "Recording..." : "Punch In Now"}</span>
                  </Button>
                ) : canPunchOut ? (
                  <Button
                    onClick={handlePunch}
                    disabled={punchMutation.isPending}
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    <Clock className="size-3.5 mr-1.5" />
                    <span>{punchMutation.isPending ? "Recording..." : "Punch Out"}</span>
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full sm:w-auto">
                    <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-600" />
                    <span>Attendance Logged</span>
                  </Button>
                )}

                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href={"/attendance" as Route}>
                    <span>View Attendance History</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Employee Profile & Quick Shortcuts */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Employee Profile
            </CardTitle>
            <CardDescription>Workplace assignment and quick tools</CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {profile?.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={profile.fullName || "User"} /> : null}
                <AvatarFallback>{profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{profile?.fullName || "—"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile?.email || profile?.workEmail || "—"}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Code: <span className="font-semibold text-foreground">{profile?.employeeCode || "—"}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium text-foreground">{deptName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Designation</span>
                <span className="font-medium text-foreground">{desigName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Manager</span>
                <span className="font-medium text-foreground">{profile?.managerName || "Direct Leadership"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" asChild className="text-[11px] justify-start">
                <Link href={"/leave/request" as Route}>
                  <Calendar className="size-3 mr-1.5 text-primary" />
                  <span>Apply Leave</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-[11px] justify-start">
                <Link href={"/payslips" as Route}>
                  <CreditCard className="size-3 mr-1.5 text-primary" />
                  <span>My Payslips</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-[11px] justify-start">
                <Link href={"/documents" as Route}>
                  <FolderOpen className="size-3 mr-1.5 text-primary" />
                  <span>Documents</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-[11px] justify-start">
                <Link href={"/directory" as Route}>
                  <Building className="size-3 mr-1.5 text-primary" />
                  <span>Directory</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Bottom Section: Company Announcements & Activity Table (Studio Admin Table Pattern) */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="size-4 text-primary" />
              Company Announcements & Updates
            </CardTitle>
            <CardDescription>
              Broadcast notices from VC Organics People Operations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={"/announcements" as Route}>
              <span>All Announcements</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {announcements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Subject & Content</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.slice(0, 5).map((ann) => (
                  <TableRow key={ann.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">{ann.title || "—"}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{ann.content || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {ann.priority || "NORMAL"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                        <Link href={`/announcements/${ann.id}` as Route}>
                          <span>Read</span>
                          <ArrowRight className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No active announcements published for your department.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
