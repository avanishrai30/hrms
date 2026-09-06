"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  PlusCircle,
  ShieldCheck,
  XCircle
} from "lucide-react";
import {
  useAllLeaveRequests,
  useApproveLeaveRequest,
  useCancelLeaveRequest,
  useHolidays,
  useLeaveBalances,
  useLeaveCalendar,
  useLeaveRequests,
  useLeaveTypes,
  useRejectLeaveRequest,
  useSubmitLeaveRequest,
  type LeaveRequestData
} from "../../../lib/queries/use-ess-queries";
import { useManagerApprovals } from "../../../lib/queries/use-people-queries";
import { useHasPermission, usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";

type LeaveTab = "overview" | "requests" | "holidays" | "policy" | "approvals";
type ReviewAction = "APPROVE" | "REJECT";

const readableStatus: Record<string, string> = {
  PENDING_MANAGER: "Pending Manager",
  PENDING_HR: "Pending HR",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled"
};

function statusVariant(status: string): "success" | "warning" | "destructive" | "secondary" | "outline" {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "destructive";
  if (status === "CANCELLED") return "secondary";
  if (status.startsWith("PENDING")) return "warning";
  return "outline";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function daysLabel(value?: number | null) {
  if (typeof value !== "number") return "-";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}d`;
}

function getRequestDays(request: LeaveRequestData) {
  return request.deductedDays ?? request.daysCount ?? request.totalDays ?? 0;
}

function isCancellable(request: LeaveRequestData) {
  return request.status === "PENDING_MANAGER" || request.status === "PENDING_HR" || request.status === "APPROVED";
}

function calendarPreview(startDate: string, endDate: string, isHalfDay: boolean) {
  if (!startDate || !endDate || startDate > endDate) return null;
  if (isHalfDay) return "0.5 day preview. Server applies tenant calendar rules.";
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  return `${days} calendar ${days === 1 ? "day" : "days"} selected. Server returns the final deducted days.`;
}

export default function EmployeeLeavePage() {
  const gate = usePermissionGate(["leave.view", "ess.read"]);
  const canCreate = useHasPermission("leave.create");
  const canCancel = useHasPermission("leave.cancel");
  const canApprove = useHasPermission("leave.approve");
  const canManageLeave = useHasPermission("leave.manage");

  const [activeTab, setActiveTab] = useState<LeaveTab>("overview");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestData | null>(null);
  const [cancelRequest, setCancelRequest] = useState<LeaveRequestData | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewRequest, setReviewRequest] = useState<LeaveRequestData | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>("APPROVE");
  const [reviewNote, setReviewNote] = useState("");

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<"FIRST_HALF" | "SECOND_HALF">("FIRST_HALF");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const balancesQuery = useLeaveBalances(gate.isAuthorized);
  const requestsQuery = useLeaveRequests(gate.isAuthorized);
  const holidaysQuery = useHolidays(undefined, gate.isAuthorized);
  const leaveTypesQuery = useLeaveTypes(gate.isAuthorized);
  const calendarQuery = useLeaveCalendar(undefined, undefined, gate.isAuthorized && canManageLeave && activeTab === "holidays");
  const approvalQuery = useAllLeaveRequests(gate.isAuthorized && canApprove && canManageLeave && activeTab === "approvals");
  const managerApprovalQuery = useManagerApprovals(gate.isAuthorized && canApprove && !canManageLeave && activeTab === "approvals");

  const submitMutation = useSubmitLeaveRequest();
  const cancelMutation = useCancelLeaveRequest();
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const balances = balancesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const holidays = holidaysQuery.data ?? [];
  const leaveTypes = leaveTypesQuery.data ?? [];
  const approvalSource = canManageLeave ? (approvalQuery.data ?? []) : ((managerApprovalQuery.data?.leaves ?? []) as LeaveRequestData[]);
  const approvalRequests = approvalSource.filter((request) => request.status === "PENDING_MANAGER" || request.status === "PENDING_HR");

  const selectedType = leaveTypes.find((type) => type.id === leaveTypeId);
  const selectedPolicy = selectedType?.policies?.[0];
  const selectedBalance = balances.find((balance) => balance.leaveType?.id === leaveTypeId);
  const durationPreview = calendarPreview(startDate, endDate, isHalfDay);

  const upcomingHoliday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return holidays.find((holiday) => holiday.date.slice(0, 10) >= today);
  }, [holidays]);

  const totals = useMemo(() => {
    return balances.reduce(
      (acc, balance) => ({
        available: acc.available + Number(balance.availableDays ?? 0),
        pending: acc.pending + Number(balance.pendingDays ?? 0),
        used: acc.used + Number(balance.usedDays ?? balance.consumedDays ?? 0)
      }),
      { available: 0, pending: 0, used: 0 }
    );
  }, [balances]);

  const openApply = () => {
    setActionError(null);
    setApplyError(null);
    setLeaveTypeId((current) => current || leaveTypes[0]?.id || "");
    setIsApplyOpen(true);
  };

  const handleApplySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!leaveTypeId) {
      setApplyError("No leave type selected.");
      return;
    }
    if (startDate > endDate) {
      setApplyError("Start date cannot be after end date.");
      return;
    }
    if (reason.trim().length < 4) {
      setApplyError("Reason must be at least 4 characters.");
      return;
    }

    try {
      setApplyError(null);
      await submitMutation.mutateAsync({
        endDate,
        halfDaySession: isHalfDay ? halfDaySession : undefined,
        isHalfDay,
        leaveTypeId,
        reason: reason.trim(),
        startDate
      });
      setIsApplyOpen(false);
      setReason("");
    } catch (error) {
      setApplyError(error instanceof Error ? error.message : "Unable to submit leave request.");
    }
  };

  const handleCancelSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cancelRequest || cancelReason.trim().length < 4) return;
    try {
      setActionError(null);
      await cancelMutation.mutateAsync({ id: cancelRequest.id, reason: cancelReason.trim() });
      setCancelRequest(null);
      setCancelReason("");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "This request can no longer be cancelled.");
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewRequest) return;
    try {
      setActionError(null);
      if (reviewAction === "APPROVE") {
        const comments = reviewNote.trim();
        await approveMutation.mutateAsync(comments ? { id: reviewRequest.id, comments } : { id: reviewRequest.id });
      } else {
        if (reviewNote.trim().length < 4) {
          setActionError("A rejection note is required.");
          return;
        }
        await rejectMutation.mutateAsync({ id: reviewRequest.id, reason: reviewNote.trim() });
      }
      setReviewRequest(null);
      setReviewNote("");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to review this leave request.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && balancesQuery.isLoading)) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-5 p-4 md:p-6 lg:p-8">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <SkeletonLoader key={item} className="h-24 rounded-xl" />
          ))}
        </div>
        <SkeletonLoader className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="mx-auto flex max-w-lg items-center justify-center p-8">
        <Card className="w-full border-border text-center shadow-xs">
          <CardHeader className="items-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Leave Workspace Restricted</CardTitle>
            <p className="text-xs text-muted-foreground">You do not have permission to view leave balances or requests.</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">Leave & Time Off</h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground md:text-sm">
            Review balances, apply leave, track decisions, and inspect the tenant holiday calendar.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeaveTab)}>
            <TabsList className="w-full overflow-x-auto sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requests">My Requests</TabsTrigger>
              <TabsTrigger value="holidays">Holidays</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
              {canApprove && <TabsTrigger value="approvals">Approvals</TabsTrigger>}
            </TabsList>
          </Tabs>
          <Button onClick={openApply} disabled={!canCreate || leaveTypesQuery.isLoading || leaveTypes.length === 0} className="shrink-0">
            <PlusCircle className="size-4" />
            Apply Leave
          </Button>
        </div>
      </header>

      {(actionError || balancesQuery.isError || requestsQuery.isError || holidaysQuery.isError) && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-2 py-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {actionError ||
                (balancesQuery.error instanceof Error && balancesQuery.error.message) ||
                (requestsQuery.error instanceof Error && requestsQuery.error.message) ||
                (holidaysQuery.error instanceof Error && holidaysQuery.error.message) ||
                "Unable to load leave workspace data."}
            </span>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CalendarDays} label="Available Leave" value={daysLabel(totals.available)} note={`${balances.length} active balance ${balances.length === 1 ? "type" : "types"}`} />
        <MetricCard icon={CheckCircle2} label="Used / Taken" value={daysLabel(totals.used)} note="Approved deductions from balances" />
        <MetricCard icon={Clock} label="Pending Requests" value={daysLabel(totals.pending)} note={`${requests.filter((r) => r.status.startsWith("PENDING")).length} request(s) awaiting decision`} />
        <MetricCard icon={Calendar} label="Next Holiday" value={upcomingHoliday ? formatDate(upcomingHoliday.date) : "-"} note={upcomingHoliday?.name ?? "No upcoming holidays configured"} />
      </section>

      {activeTab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm">Leave Balances</CardTitle>
              <p className="text-xs text-muted-foreground">Authoritative balance records returned by the tenant Leave API.</p>
            </CardHeader>
            <CardContent className="p-0">
              {balances.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No leave balance available" description="Your tenant has not initialized leave balances for your employee profile." />
              ) : (
                <div className="divide-y divide-border">
                  {balances.map((balance) => (
                    <div key={balance.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_repeat(4,100px)] md:items-center">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: balance.leaveType?.color ?? "hsl(var(--primary))" }} />
                          <p className="truncate text-sm font-semibold text-foreground">{balance.leaveType?.name ?? "Leave"}</p>
                          <Badge variant="outline" className="font-mono text-[10px]">{balance.leaveType?.code ?? "LV"}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Allocated, used, pending, and adjusted values are server supplied.</p>
                      </div>
                      <BalanceCell label="Allocated" value={balance.allocatedDays ?? null} />
                      <BalanceCell label="Used" value={balance.usedDays ?? balance.consumedDays ?? null} />
                      <BalanceCell label="Pending" value={balance.pendingDays ?? null} />
                      <BalanceCell label="Available" value={balance.availableDays} strong />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {requests.slice(0, 5).length === 0 ? (
                <EmptyState icon={FileText} title="No leave requests found" description="Submitted leave requests will appear here." />
              ) : (
                <div className="divide-y divide-border">
                  {requests.slice(0, 5).map((request) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="w-full p-4 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{request.leaveType?.name ?? "Leave"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
                        </div>
                        <Badge variant={statusVariant(request.status)}>{readableStatus[request.status] ?? request.status}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "requests" && (
        <RequestTable
          canCancel={canCancel}
          isLoading={requestsQuery.isLoading}
          requests={requests}
          onCancel={(request) => {
            setCancelRequest(request);
            setCancelReason("");
          }}
          onOpen={setSelectedRequest}
        />
      )}

      {activeTab === "holidays" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm">Holiday Calendar</CardTitle>
              <p className="text-xs text-muted-foreground">Tenant holidays returned by the Leave API.</p>
            </CardHeader>
            <CardContent className="p-0">
              {holidays.length === 0 ? (
                <EmptyState icon={Calendar} title="No upcoming holidays" description="Holiday records will appear after HR configures the tenant calendar." />
              ) : (
                <div className="divide-y divide-border">
                  {holidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{holiday.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(holiday.date)} · {new Date(holiday.date).toLocaleDateString(undefined, { weekday: "long" })}</p>
                      </div>
                      <Badge variant={holiday.isOptional ? "secondary" : "warning"}>{holiday.isOptional ? "Optional" : "Public"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm">Approved Leave Calendar</CardTitle>
              <p className="text-xs text-muted-foreground">Approved leave appears only when your permission scope allows it.</p>
            </CardHeader>
            <CardContent className="p-0">
              {(calendarQuery.data ?? []).length === 0 ? (
                <EmptyState icon={Clock} title="No calendar events" description="No approved leave or holidays were returned for this period." />
              ) : (
                <div className="divide-y divide-border">
                  {(calendarQuery.data ?? []).slice(0, 10).map((event) => (
                    <div key={event.id} className="p-4">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                        {event.endDate ? ` - ${formatDate(event.endDate)}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "policy" && (
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm">Policy / Entitlements</CardTitle>
            <p className="text-xs text-muted-foreground">Only active tenant leave types and policy fields returned by the API are shown.</p>
          </CardHeader>
          <CardContent className="p-0">
            {leaveTypes.length === 0 ? (
              <EmptyState icon={Info} title="No leave types configured" description="HR must configure leave types before employees can apply." />
            ) : (
              <div className="divide-y divide-border">
                {leaveTypes.map((type) => {
                  const policy = type.policies?.[0];
                  return (
                    <div key={type.id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_repeat(4,120px)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: type.color ?? "hsl(var(--primary))" }} />
                          <p className="text-sm font-semibold text-foreground">{type.name}</p>
                          <Badge variant="outline">{type.code}</Badge>
                          {type.isPaid === false && <Badge variant="secondary">Unpaid</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{type.description || type.category || "Tenant configured leave type"}</p>
                      </div>
                      <PolicyCell label="Allocation" value={policy?.annualAllocationDays !== undefined ? daysLabel(policy.annualAllocationDays) : "-"} />
                      <PolicyCell label="Accrual" value={policy?.accrualFrequency ?? "-"} />
                      <PolicyCell label="Approvals" value={policy ? [policy.requiresManagerApproval && "Manager", policy.requiresHrApproval && "HR"].filter(Boolean).join(" + ") || "Auto" : "-"} />
                      <PolicyCell label="Docs" value={policy?.requiresAttachment ? "Required" : policy?.attachmentMandatoryAboveDays !== undefined ? `>${policy.attachmentMandatoryAboveDays}d` : "-"} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "approvals" && canApprove && (
        <RequestTable
          isLoading={canManageLeave ? approvalQuery.isLoading : managerApprovalQuery.isLoading}
          managerMode
          requests={approvalRequests}
          onOpen={setSelectedRequest}
          onReview={(request, action) => {
            setReviewRequest(request);
            setReviewAction(action);
            setReviewNote("");
          }}
        />
      )}

      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply Leave</DialogTitle>
            <DialogDescription>Submit dates and reason. The server validates balance, policy, holidays, overlaps, and duration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplySubmit} className="space-y-4">
            {applyError && <InlineError>{applyError}</InlineError>}
            {leaveTypes.length === 0 && <InlineError>No leave types configured.</InlineError>}
            <div className="space-y-1.5">
              <Label htmlFor="leaveType">Leave Type</Label>
              <select
                id="leaveType"
                value={leaveTypeId}
                onChange={(event) => setLeaveTypeId(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name} ({type.code})</option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                {selectedBalance ? `Available: ${daysLabel(selectedBalance.availableDays)}` : "Balance will be checked by the server."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
              <input type="checkbox" checked={isHalfDay} onChange={(event) => setIsHalfDay(event.target.checked)} className="size-4 rounded border-border text-primary focus:ring-primary" />
              Half day
            </label>
            {isHalfDay && (
              <div className="grid gap-2 sm:grid-cols-2">
                {(["FIRST_HALF", "SECOND_HALF"] as const).map((session) => (
                  <label key={session} className="flex items-center gap-2 rounded-md border border-border p-2 text-xs">
                    <input type="radio" name="halfDaySession" value={session} checked={halfDaySession === session} onChange={() => setHalfDaySession(session)} />
                    {session === "FIRST_HALF" ? "First half" : "Second half"}
                  </label>
                ))}
              </div>
            )}
            {durationPreview && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                {durationPreview}
              </div>
            )}
            {selectedPolicy?.requiresAttachment && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                Supporting document is required by policy. Upload support is not exposed for leave requests yet.
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason</Label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>Close</Button>
              <Button type="submit" disabled={submitMutation.isPending || leaveTypes.length === 0}>
                {submitMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <RequestDetailDialog request={selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)} />

      <Dialog open={Boolean(cancelRequest)} onOpenChange={(open) => !open && setCancelRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Leave Request</DialogTitle>
            <DialogDescription>The server will decide whether this request can still be cancelled.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCancelSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cancelReason">Cancellation Reason</Label>
              <textarea
                id="cancelReason"
                rows={3}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setCancelRequest(null)}>Close</Button>
              <Button type="submit" variant="destructive" disabled={cancelMutation.isPending || cancelReason.trim().length < 4}>
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reviewRequest)} onOpenChange={(open) => !open && setReviewRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{reviewAction === "APPROVE" ? "Approve Leave" : "Reject Leave"}</DialogTitle>
            <DialogDescription>Review note is stored in the approval history.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reviewNote">Review Note</Label>
              <textarea
                id="reviewNote"
                rows={3}
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={reviewAction === "APPROVE" ? "Optional approval note" : "Reason for rejection"}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setReviewRequest(null)}>Close</Button>
              <Button type="submit" variant={reviewAction === "REJECT" ? "destructive" : "default"} disabled={approveMutation.isPending || rejectMutation.isPending}>
                {reviewAction === "APPROVE" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ icon: Icon, label, note, value }: { icon: React.ElementType; label: string; note: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-1">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{note}</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceCell({ label, strong, value }: { label: string; strong?: boolean; value?: number | null }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground md:hidden">{label}</p>
      <p className={`font-mono text-sm tabular-nums ${strong ? "font-semibold text-primary" : "text-foreground"}`}>{daysLabel(value)}</p>
      <p className="hidden text-[10px] text-muted-foreground md:block">{label}</p>
    </div>
  );
}

function PolicyCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyState({ description, icon: Icon, title }: { description: string; icon: React.ElementType; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function InlineError({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
      <AlertCircle className="size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function RequestTable({
  canCancel,
  isLoading,
  managerMode = false,
  onCancel,
  onOpen,
  onReview,
  requests
}: {
  canCancel?: boolean;
  isLoading?: boolean;
  managerMode?: boolean;
  onCancel?: (request: LeaveRequestData) => void;
  onOpen: (request: LeaveRequestData) => void;
  onReview?: (request: LeaveRequestData, action: ReviewAction) => void;
  requests: LeaveRequestData[];
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-sm">{managerMode ? "Pending Team Requests" : "My Requests"}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {managerMode ? "Direct-report leave requests scoped by the manager hierarchy." : "Your submitted leave requests and decision history."}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={managerMode ? "No pending leave approvals" : "No leave requests found"}
            description={managerMode ? "Your team queue has no pending leave requests." : "Apply leave to start your request history."}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    {managerMode && <th className="px-4 py-3 font-medium">Employee</th>}
                    <th className="px-4 py-3 font-medium">Leave Type</th>
                    <th className="px-4 py-3 font-medium">Dates</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((request) => (
                    <tr key={request.id} className="transition hover:bg-muted/30">
                      {managerMode && (
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{request.employee?.fullName ?? "-"}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{request.employee?.employeeCode ?? "-"}</p>
                        </td>
                      )}
                      <td className="px-4 py-3 font-medium text-foreground">{request.leaveType?.name ?? "Leave"}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{formatDate(request.startDate)} - {formatDate(request.endDate)}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{daysLabel(getRequestDays(request))}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(request.status)}>{readableStatus[request.status] ?? request.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(request.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button type="button" variant="ghost" size="sm" onClick={() => onOpen(request)}>Details</Button>
                          {!managerMode && canCancel && isCancellable(request) && onCancel && (
                            <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onCancel(request)}>Cancel</Button>
                          )}
                          {managerMode && onReview && (
                            <>
                              <Button type="button" variant="outline" size="sm" onClick={() => onReview(request, "APPROVE")}>
                                <CheckCircle2 className="size-3" />
                                Approve
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onReview(request, "REJECT")}>
                                <XCircle className="size-3" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border md:hidden">
              {requests.map((request) => (
                <div key={request.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{managerMode ? request.employee?.fullName ?? "Employee" : request.leaveType?.name ?? "Leave"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(request.startDate)} - {formatDate(request.endDate)} · {daysLabel(getRequestDays(request))}</p>
                    </div>
                    <Badge variant={statusVariant(request.status)}>{readableStatus[request.status] ?? request.status}</Badge>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{request.reason || "No reason provided."}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpen(request)}>Details</Button>
                    {!managerMode && canCancel && isCancellable(request) && onCancel && (
                      <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onCancel(request)}>Cancel</Button>
                    )}
                    {managerMode && onReview && (
                      <>
                        <Button type="button" variant="outline" size="sm" onClick={() => onReview(request, "APPROVE")}>Approve</Button>
                        <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onReview(request, "REJECT")}>Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RequestDetailDialog({ onOpenChange, request }: { onOpenChange: (open: boolean) => void; request: LeaveRequestData | null }) {
  return (
    <Dialog open={Boolean(request)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogDescription>No raw JSON is shown. Values are from the Leave API response.</DialogDescription>
        </DialogHeader>
        {request && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{request.leaveType?.name ?? "Leave"}</p>
                <p className="text-xs text-muted-foreground">{request.leaveType?.code ?? "LV"} · {daysLabel(getRequestDays(request))}</p>
              </div>
              <Badge variant={statusVariant(request.status)}>{readableStatus[request.status] ?? request.status}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Start Date" value={formatDate(request.startDate)} />
              <DetailItem label="End Date" value={formatDate(request.endDate)} />
              <DetailItem label="Submitted" value={formatDateTime(request.createdAt)} />
              <DetailItem label="Partial Day" value={request.isHalfDay ? request.halfDaySession?.replace(/_/g, " ") ?? "Half day" : "No"} />
            </div>
            {request.employee && <DetailItem label="Employee" value={`${request.employee.fullName ?? "-"}${request.employee.employeeCode ? ` · ${request.employee.employeeCode}` : ""}`} />}
            <DetailItem label="Reason" value={request.reason || "-"} />
            {request.attachmentObjectKey && <DetailItem label="Supporting Attachment" value="Attachment stored with tenant-scoped object key" />}
            {request.rejectionReason && <DetailItem label="Rejection Note" value={request.rejectionReason} />}
            {request.cancellationReason && <DetailItem label="Cancellation Reason" value={request.cancellationReason} />}
            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-4 py-3 text-xs font-semibold text-foreground">Approval History</div>
              {request.approvals?.length ? (
                <div className="divide-y divide-border">
                  {request.approvals.map((approval, index) => (
                    <div key={approval.id ?? `${approval.action}-${index}`} className="p-4 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{approval.approverRole ?? "Approver"} · {approval.action ?? "Decision"}</span>
                        <span className="text-muted-foreground">{formatDateTime(approval.decidedAt)}</span>
                      </div>
                      {approval.note && <p className="mt-1 text-muted-foreground">{approval.note}</p>}
                      {approval.approverUser?.email && <p className="mt-1 font-mono text-[11px] text-muted-foreground">{approval.approverUser.email}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs text-muted-foreground">No approval decisions recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
