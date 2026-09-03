"use client";

import React, { useState } from "react";
import {
  Calendar,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CalendarDays,
  UserCheck
} from "lucide-react";
import {
  useLeaveBalances,
  useLeaveRequests,
  useHolidays,
  useCancelLeaveRequest,
  useLeaveTypes,
  useSubmitLeaveRequest,
  useLeaveCalendar,
  useAllLeaveRequests,
  useApproveLeaveRequest,
  useRejectLeaveRequest
} from "../../../lib/queries/use-ess-queries";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function EmployeeLeavePage() {
  const gate = usePermissionGate(["leave.view", "ess.read"]);
  const canApprove = useHasPermission(["leave.approve", "mss.manage"]);

  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "approvals">("overview");

  // Apply Leave Dialog State
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<"FIRST_HALF" | "SECOND_HALF">("FIRST_HALF");
  const [applyError, setApplyError] = useState<string | null>(null);

  // Queries
  const balancesQuery = useLeaveBalances(gate.isAuthorized);
  const requestsQuery = useLeaveRequests(gate.isAuthorized);
  const holidaysQuery = useHolidays(undefined, gate.isAuthorized);
  const leaveTypesQuery = useLeaveTypes(isApplyOpen);
  const calendarQuery = useLeaveCalendar(undefined, undefined, gate.isAuthorized && activeTab === "calendar");
  const allRequestsQuery = useAllLeaveRequests(gate.isAuthorized && canApprove && activeTab === "approvals");

  // Mutations
  const cancelMutation = useCancelLeaveRequest();
  const submitMutation = useSubmitLeaveRequest();
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const balances = balancesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const holidays = holidaysQuery.data ?? [];
  const leaveTypes = leaveTypesQuery.data ?? [];
  const calendarEvents = calendarQuery.data ?? [];
  const allPendingRequests = (allRequestsQuery.data ?? []).filter((r) => r.status === "PENDING" || r.status === "SUBMITTED");

  const totalAvailable = balancesQuery.isSuccess
    ? balances.reduce((sum, b) => sum + Number(b.availableDays ?? 0), 0)
    : null;

  const handleOpenApply = () => {
    if (leaveTypes.length > 0 && !leaveTypeId) {
      setLeaveTypeId(leaveTypes[0]?.id || "");
    }
    setApplyError(null);
    setIsApplyOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId) {
      setApplyError("Please select a leave category.");
      return;
    }
    if (startDate > endDate) {
      setApplyError("Start date cannot be after end date.");
      return;
    }
    if (reason.trim().length < 4) {
      setApplyError("Please provide a reason (at least 4 characters).");
      return;
    }

    try {
      setApplyError(null);
      await submitMutation.mutateAsync({
        leaveTypeId,
        startDate,
        endDate,
        reason: reason.trim(),
        isHalfDay,
        halfDaySession: isHalfDay ? halfDaySession : undefined
      });
      setIsApplyOpen(false);
      setReason("");
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : "Failed to submit leave request.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelMutation.mutateAsync(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel request");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ id, comments: "Approved by manager" });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to approve request");
    }
  };

  const handleReject = async (id: string) => {
    const reasonText = window.prompt("Enter rejection reason:");
    if (!reasonText || reasonText.trim().length === 0) return;
    try {
      await rejectMutation.mutateAsync({ id, reason: reasonText.trim() });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reject request");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && balancesQuery.isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-md bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader className="h-28 rounded-xl" />
          <SkeletonLoader className="h-28 rounded-xl" />
          <SkeletonLoader className="h-28 rounded-xl" />
          <SkeletonLoader className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <Card className="p-6 border-border text-center shadow-xs">
          <CardHeader className="items-center pb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Leave Workspace Restricted</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              You do not have permission (<code className="text-[11px] font-mono">leave.view</code>) to access time off and balances.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const selectedBalance = balances.find((b) => b.leaveType?.id === leaveTypeId || b.id === leaveTypeId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Time Off & Leave Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage leave balances, request time off, and view company holiday schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="overview">My Leaves</TabsTrigger>
              <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
              {canApprove && (
                <TabsTrigger value="approvals">
                  Approvals {allPendingRequests.length > 0 ? `(${allPendingRequests.length})` : ""}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          <Button size="sm" onClick={handleOpenApply}>
            <PlusCircle className="size-3.5 mr-1.5" />
            <span>Apply Leave</span>
          </Button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* 2. Leave Balance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Total Available</span>
                  <CalendarDays className="size-4 text-primary" />
                </div>
                <div className="text-2xl font-extrabold font-mono text-foreground">
                  {totalAvailable !== null ? `${totalAvailable} Days` : "—"}
                </div>
                <p className="text-[11px] text-muted-foreground">Combined time-off entitlement</p>
              </CardContent>
            </Card>

            {balances.map((balance) => (
              <Card key={balance.id} className="border border-border shadow-xs">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                      {balance.leaveType?.name || "Standard"}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {balance.leaveType?.code || "LV"}
                    </Badge>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-primary">
                    {balance.availableDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>Allocated: {balance.allocatedDays ?? 0}</span>
                    <span>Used: {balance.consumedDays ?? 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 3. My Requests & Holidays Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Requests (2 cols) */}
            <Card className="lg:col-span-2 border border-border shadow-xs">
              <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  My Leave Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {requestsQuery.isLoading ? (
                  <div className="p-4 space-y-2">
                    <SkeletonLoader className="h-9 w-full" />
                    <SkeletonLoader className="h-9 w-full" />
                  </div>
                ) : requests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground bg-muted/20">
                          <th className="py-2.5 px-4 font-semibold">Type</th>
                          <th className="py-2.5 px-4 font-semibold">Duration</th>
                          <th className="py-2.5 px-4 font-semibold">Dates</th>
                          <th className="py-2.5 px-4 font-semibold">Status</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-muted/30 transition">
                            <td className="py-3 px-4 font-medium text-foreground">
                              {req.leaveType?.name || "Leave"}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-foreground">
                              {req.daysCount ?? 1}d
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-mono">
                              {req.startDate ? new Date(req.startDate).toLocaleDateString() : "—"}
                              {" → "}
                              {req.endDate ? new Date(req.endDate).toLocaleDateString() : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  req.status === "APPROVED"
                                    ? "success"
                                    : req.status === "REJECTED" || req.status === "CANCELLED"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-[10px]"
                              >
                                {req.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {(req.status === "PENDING" || req.status === "SUBMITTED") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleCancel(req.id)}
                                  disabled={cancelMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No leave requests found. Click &quot;Apply Leave&quot; above to submit one.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Holidays (1 col) */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Upcoming Holidays
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {holidaysQuery.isLoading ? (
                  <div className="p-4 space-y-2">
                    <SkeletonLoader className="h-8 w-full" />
                    <SkeletonLoader className="h-8 w-full" />
                  </div>
                ) : holidays.length > 0 ? (
                  <div className="divide-y divide-border/60">
                    {holidays.slice(0, 5).map((holiday) => (
                      <div key={holiday.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{holiday.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {holiday.date ? new Date(holiday.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {holiday.isOptional ? "OPTIONAL" : "MANDATORY"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No public holidays scheduled.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Tab 2: Team Calendar */}
      {activeTab === "calendar" && (
        <Card className="border border-border shadow-xs">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              Approved Team Leave Calendar
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scheduled time-off across team members based on verified approved requests.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {calendarQuery.isLoading ? (
              <div className="p-4 space-y-2">
                <SkeletonLoader className="h-9 w-full" />
                <SkeletonLoader className="h-9 w-full" />
              </div>
            ) : calendarEvents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground bg-muted/20">
                      <th className="py-2.5 px-4 font-semibold">Employee</th>
                      <th className="py-2.5 px-4 font-semibold">Leave Type</th>
                      <th className="py-2.5 px-4 font-semibold">Start Date</th>
                      <th className="py-2.5 px-4 font-semibold">End Date</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {calendarEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {evt.employeeName || "Team Member"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {evt.leaveType?.name || "Leave"}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {evt.startDate ? new Date(evt.startDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {evt.endDate ? new Date(evt.endDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="success" className="text-[10px]">
                            {evt.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No active approved team leaves scheduled for this period.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Approvals (Manager / HR) */}
      {activeTab === "approvals" && canApprove && (
        <Card className="border border-border shadow-xs">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="size-4 text-primary" />
              Pending Leave Approvals
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and act on direct report time-off requests.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {allRequestsQuery.isLoading ? (
              <div className="p-4 space-y-2">
                <SkeletonLoader className="h-9 w-full" />
                <SkeletonLoader className="h-9 w-full" />
              </div>
            ) : allPendingRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground bg-muted/20">
                      <th className="py-2.5 px-4 font-semibold">Employee</th>
                      <th className="py-2.5 px-4 font-semibold">Type</th>
                      <th className="py-2.5 px-4 font-semibold">Dates</th>
                      <th className="py-2.5 px-4 font-semibold">Duration</th>
                      <th className="py-2.5 px-4 font-semibold">Reason</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {allPendingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {req.employee?.fullName || "Employee"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {req.leaveType?.name || "Leave"}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {req.startDate ? new Date(req.startDate).toLocaleDateString() : "—"}
                          {" → "}
                          {req.endDate ? new Date(req.endDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {req.daysCount ?? 1}d
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                          {req.reason}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                              onClick={() => handleApprove(req.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle2 className="size-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleReject(req.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="size-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No pending leave approval requests at this time.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Apply Leave Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Time Off</DialogTitle>
            <DialogDescription>
              Submit a formal leave or vacation request for manager approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplySubmit} className="space-y-4 py-2 text-xs">
            {applyError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                {applyError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="category">Leave Category</Label>
              <select
                id="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                required
              >
                <option value="">Select category...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
              {selectedBalance && (
                <p className="text-[11px] text-muted-foreground">
                  Available Balance: <strong className="text-primary">{selectedBalance.availableDays} days</strong>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary size-3.5"
                />
                <span className="text-foreground">This is a half-day leave</span>
              </label>

              {isHalfDay && (
                <div className="pl-5 space-y-1">
                  <Label>Session</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={halfDaySession}
                    onChange={(e) => setHalfDaySession(e.target.value as any)}
                  >
                    <option value="FIRST_HALF">First Half (Morning Session)</option>
                    <option value="SECOND_HALF">Second Half (Afternoon Session)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leaveReason">Reason for Leave</Label>
              <Input
                id="leaveReason"
                placeholder="e.g. Annual personal vacation with family"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting…" : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
