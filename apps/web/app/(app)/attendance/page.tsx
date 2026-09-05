"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  LocateFixed,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Square,
  Timer,
  UserRoundCheck,
  UsersRound,
  XCircle
} from "lucide-react";
import {
  type AttendanceCorrectionItem,
  type AttendanceRecordItem,
  type TodayAttendanceData,
  useAttendanceCorrections,
  useAttendanceHistory,
  useAttendanceToday,
  usePunchMutation,
  useReviewAttendanceCorrection,
  useSubmitAttendanceCorrection,
  useTeamAttendance
} from "../../../lib/queries/use-ess-queries";
import { useHasPermission, usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";
import { buildPunchPayload, formatShiftName, getGpsFailureMessageForAttendance } from "../../../lib/semantic-state";
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

type AttendanceTab = "today" | "history" | "corrections" | "team";
type HistoryRange = "7" | "30" | "custom";
type LocationStep = "idle" | "getting" | "verified" | "denied" | "unavailable" | "outside";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not started",
  CLOCKED_IN: "Clocked in",
  COMPLETED: "Completed",
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  HALF_DAY: "Half day",
  ON_LEAVE: "On leave",
  WEEK_OFF: "Week off",
  HOLIDAY: "Holiday",
  WORK_FROM_HOME: "Work from home",
  PENDING_REVIEW: "Pending review"
};

function formatTime(value?: string | null) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatMinutes(minutes?: number | null) {
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) return "Not recorded";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

function minuteLabel(minutes?: number | null) {
  if (typeof minutes !== "number") return "Not configured";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function shiftWindow(shift: TodayAttendanceData["shift"] | AttendanceRecordItem["shift"]) {
  if (typeof shift?.startsAtMinute !== "number" || typeof shift?.endsAtMinute !== "number") return "Not assigned";
  return `${minuteLabel(shift.startsAtMinute)} to ${minuteLabel(shift.endsAtMinute)}`;
}

function statusVariant(status?: string | null): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" {
  if (status === "CLOCKED_IN" || status === "PRESENT" || status === "APPROVED") return "success";
  if (status === "LATE" || status === "HALF_DAY" || status === "PENDING" || status === "PENDING_REVIEW") return "warning";
  if (status === "ABSENT" || status === "REJECTED") return "destructive";
  if (status === "NOT_STARTED") return "outline";
  return "secondary";
}

function rangeToDates(range: HistoryRange, customStart: string, customEnd: string) {
  if (range === "custom") return { startDate: customStart || undefined, endDate: customEnd || undefined };
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (Number(range) - 1));
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}

function LiveAttendanceDuration({
  checkInAt,
  checkOutAt
}: {
  checkInAt?: string | null | undefined;
  checkOutAt?: string | null | undefined;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!checkInAt || checkOutAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [checkInAt, checkOutAt]);

  if (!checkInAt) return <span>Not started</span>;
  const start = new Date(checkInAt).getTime();
  const end = checkOutAt ? new Date(checkOutAt).getTime() : now;
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <span aria-live="polite">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Clock }) {
  return (
    <Card className="border-border shadow-xs">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployeeAttendancePage() {
  const gate = usePermissionGate(["attendance.view", "ess.read"]);
  const canApprove = useHasPermission(["attendance.approve", "mss.manage"]);
  const canRequestCorrection = useHasPermission(["attendance.correct", "attendance.create", "ess.read"]);

  const [activeTab, setActiveTab] = useState<AttendanceTab>("today");
  const [historyRange, setHistoryRange] = useState<HistoryRange>("7");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [teamDate, setTeamDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState("");
  const [punchNote, setPunchNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [locationStep, setLocationStep] = useState<LocationStep>("idle");
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [corrDate, setCorrDate] = useState(new Date().toISOString().slice(0, 10));
  const [corrCheckIn, setCorrCheckIn] = useState("09:00");
  const [corrCheckOut, setCorrCheckOut] = useState("18:00");
  const [corrReason, setCorrReason] = useState("");
  const [corrError, setCorrError] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<AttendanceCorrectionItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  const rangeDates = useMemo(() => rangeToDates(historyRange, customStart, customEnd), [historyRange, customStart, customEnd]);
  const todayQuery = useAttendanceToday(gate.isAuthorized);
  const historyQuery = useAttendanceHistory(rangeDates.startDate, rangeDates.endDate, gate.isAuthorized);
  const correctionsQuery = useAttendanceCorrections(gate.isAuthorized);
  const teamQuery = useTeamAttendance(
    { startDate: teamDate, endDate: teamDate, status: statusFilter || undefined, limit: "50" },
    gate.isAuthorized && canApprove && activeTab === "team"
  );

  const punchMutation = usePunchMutation();
  const submitCorrectionMutation = useSubmitAttendanceCorrection();
  const reviewCorrectionMutation = useReviewAttendanceCorrection();
  const todayData = todayQuery.data;
  const record = todayData?.record;
  const shift = todayData?.shift;
  const state = todayData?.state ?? "NOT_STARTED";
  const isLocationRequired = todayData?.requiresLocation === true || todayData?.rules?.requireGeofence === true;
  const canPunch = Boolean(todayData?.canCheckIn || todayData?.canCheckOut);
  const action = todayData?.canCheckOut ? "check-out" : "check-in";
  const historyRecords = historyQuery.data ?? [];
  const corrections = correctionsQuery.data ?? [];
  const teamRecords = teamQuery.data ?? [];

  const handlePunch = async () => {
    if (!canPunch) return;
    const notes = punchNote.trim() || undefined;
    setActionError(null);
    setLocationMessage(null);

    if (!isLocationRequired) {
      try {
        setLocationStep("idle");
        await punchMutation.mutateAsync(buildPunchPayload({ action, notes }));
        setPunchNote("");
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : "Attendance service temporarily unavailable.");
      }
      return;
    }

    const stopForLocation = (reason: "denied" | "unavailable" | "timeout" | "unsupported" | "unknown") => {
      const message = getGpsFailureMessageForAttendance(todayData?.rules, reason);
      setLocationStep(reason === "denied" ? "denied" : "unavailable");
      setLocationMessage(message ?? "Location unavailable. Attendance was not recorded.");
    };

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      stopForLocation("unsupported");
      return;
    }

    setLocationStep("getting");
    setLocationMessage("Getting location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setLocationStep("verified");
          setLocationMessage(`Location verified with ${Math.round(position.coords.accuracy)}m accuracy.`);
          await punchMutation.mutateAsync(
            buildPunchPayload({
              action,
              notes,
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              }
            })
          );
          setPunchNote("");
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Attendance punch failed.";
          setActionError(message);
          setLocationStep(message.toLowerCase().includes("geofence") ? "outside" : "unavailable");
          setLocationMessage(message);
        }
      },
      (error) => {
        const reason = error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable";
        stopForLocation(reason);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const openCorrection = () => {
    setCorrDate(new Date().toISOString().slice(0, 10));
    setCorrReason("");
    setCorrError(null);
    setIsCorrectionOpen(true);
  };

  const submitCorrection = async (event: React.FormEvent) => {
    event.preventDefault();
    const checkInAt = new Date(`${corrDate}T${corrCheckIn}:00`);
    const checkOutAt = new Date(`${corrDate}T${corrCheckOut}:00`);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (new Date(`${corrDate}T00:00:00`).getTime() > endOfToday.getTime()) {
      setCorrError("Future attendance cannot be regularized.");
      return;
    }
    if (checkOutAt.getTime() <= checkInAt.getTime()) {
      setCorrError("Requested check-out must be after check-in.");
      return;
    }
    if (corrReason.trim().length < 8) {
      setCorrError("Please provide a meaningful reason of at least 8 characters.");
      return;
    }
    try {
      setCorrError(null);
      await submitCorrectionMutation.mutateAsync({
        date: corrDate,
        requestedCheckIn: checkInAt.toISOString(),
        requestedCheckOut: checkOutAt.toISOString(),
        reason: corrReason.trim()
      });
      setIsCorrectionOpen(false);
    } catch (err: unknown) {
      setCorrError(err instanceof Error ? err.message : "Failed to submit correction request.");
    }
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    if (reviewNote.trim().length < 4) {
      setReviewError("Review note must be at least 4 characters.");
      return;
    }
    try {
      setReviewError(null);
      await reviewCorrectionMutation.mutateAsync({ id: reviewTarget.id, status: reviewDecision, reviewNote: reviewNote.trim() });
      setReviewTarget(null);
      setReviewNote("");
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : "Correction review failed.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && todayQuery.isLoading)) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <SkeletonLoader className="h-10 w-72" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SkeletonLoader className="h-28" />
          <SkeletonLoader className="h-28" />
          <SkeletonLoader className="h-28" />
          <SkeletonLoader className="h-28" />
        </div>
        <SkeletonLoader className="h-80" />
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="mx-auto mt-12 max-w-lg p-8 text-center">
        <Card className="border-border shadow-xs">
          <CardHeader className="items-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Attendance Workspace Restricted</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">You need attendance access to view this workspace.</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Attendance & Time Tracking</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Server-authoritative punch state, shift context, history, and regularization.</p>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{formatDate(todayData?.date)}</span>
          <span className="mx-2">/</span>
          <span>{shift?.timezone || "Tenant timezone"}</span>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Current Status" value={STATUS_LABELS[state] ?? state} detail={record?.status ? STATUS_LABELS[record.status] ?? record.status : "No punch recorded"} icon={UserRoundCheck} />
        <MetricCard label="Today's Shift" value={formatShiftName(shift, { isSuccess: todayQuery.isSuccess })} detail={shift ? shiftWindow(shift) : "No shift assigned for today"} icon={Clock} />
        <MetricCard label="Worked Today" value={state === "CLOCKED_IN" ? "Live now" : formatMinutes(record?.workedMinutes)} detail={record?.checkInAt ? `In ${formatTime(record.checkInAt)}` : "No check-in yet"} icon={Timer} />
        <MetricCard label="Policy" value={isLocationRequired ? "Geofence required" : "Location optional"} detail={todayData?.rules?.allowMultipleSessionsPerDay ? "Multiple sessions allowed" : "Single session day"} icon={LocateFixed} />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === "today" || value === "history" || value === "corrections" || value === "team") setActiveTab(value);
      }}>
        <TabsList className="flex w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="corrections">Regularization</TabsTrigger>
          {canApprove && <TabsTrigger value="team">Team</TabsTrigger>}
        </TabsList>
      </Tabs>

      {activeTab === "today" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <Card className="overflow-hidden border-border shadow-xs">
            <CardHeader className="border-b border-border">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Primary Attendance</p>
                  <CardTitle className="mt-1 text-base">Today&apos;s Punch</CardTitle>
                </div>
                <Badge variant={statusVariant(state)}>{STATUS_LABELS[state] ?? state}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="relative rounded-xl border border-border bg-muted/20 p-5">
                <div className="absolute left-5 top-5 size-2 rounded-full bg-primary">
                  {state === "CLOCKED_IN" && <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />}
                </div>
                <div className="pl-6">
                  <p className="text-xs text-muted-foreground">Session duration</p>
                  <p className="mt-2 font-mono text-4xl font-bold tracking-tight text-foreground">
                    <LiveAttendanceDuration checkInAt={record?.checkInAt} checkOutAt={record?.checkOutAt} />
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">Assigned shift</p>
                      <p className="mt-1 font-semibold text-foreground">{formatShiftName(shift, { isSuccess: todayQuery.isSuccess })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scheduled</p>
                      <p className="mt-1 font-mono font-semibold text-foreground">{shiftWindow(shift)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="mt-1 font-semibold text-foreground">{isLocationRequired ? "Required before punch" : "Not required"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Check-in</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">{formatTime(record?.checkInAt)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Check-out</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">{formatTime(record?.checkOutAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="punch-note">Punch note</Label>
                <Input id="punch-note" value={punchNote} onChange={(event) => setPunchNote(event.target.value)} disabled={punchMutation.isPending || !canPunch} placeholder="Optional context for this punch" />
              </div>

              {locationMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs" aria-live="polite">
                  {locationStep === "verified" ? <CheckCircle2 className="size-4 text-emerald-600" /> : <LocateFixed className="size-4 text-muted-foreground" />}
                  <span className={locationStep === "denied" || locationStep === "outside" ? "text-destructive" : "text-muted-foreground"}>{locationMessage}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">State is controlled by the server. Browser time is used only for the live duration display.</p>
                <Button onClick={handlePunch} disabled={punchMutation.isPending || !canPunch} variant={state === "CLOCKED_IN" ? "outline" : state === "COMPLETED" && !todayData?.canCheckIn ? "secondary" : "default"} className="w-full sm:w-auto">
                  {punchMutation.isPending ? (
                    <>
                      <RotateCcw className="size-4 animate-spin" />
                      Recording
                    </>
                  ) : state === "CLOCKED_IN" ? (
                    <>
                      <Square className="size-4 fill-current" />
                      Clock Out
                    </>
                  ) : state === "COMPLETED" && !todayData?.canCheckIn ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Attendance Completed
                    </>
                  ) : (
                    <>
                      <Clock className="size-4" />
                      Clock In
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4 text-primary" />
                Attendance Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border text-xs">
              {[
                ["Geofence", isLocationRequired ? "Required" : "Not required"],
                ["Face verification", todayData?.rules?.requireFaceVerification ? "Required" : "Not required"],
                ["Multiple sessions", todayData?.rules?.allowMultipleSessionsPerDay ? "Allowed" : "Not allowed"],
                ["Grace period", typeof todayData?.rules?.gracePeriodMinutes === "number" ? `${todayData.rules.gracePeriodMinutes} min` : "Not configured"],
                ["Shift assignment", shift ? "Assigned" : "Not assigned"]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "history" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-primary" />
                Recent Attendance History
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Server-filtered attendance records for the selected period.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={historyRange} onChange={(event) => setHistoryRange(event.target.value as HistoryRange)} className="h-8 rounded-md border border-border bg-background px-2 text-xs">
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="custom">Custom</option>
              </select>
              {historyRange === "custom" && (
                <>
                  <Input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="h-8 w-auto" />
                  <Input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="h-8 w-auto" />
                </>
              )}
              {canRequestCorrection && (
                <Button size="sm" variant="outline" onClick={openCorrection}>
                  <PlusCircle className="size-3.5" />
                  Regularize
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AttendanceTable rows={historyRecords} loading={historyQuery.isLoading} emptyText="No attendance records found for this period." />
          </CardContent>
        </Card>
      )}

      {activeTab === "corrections" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-primary" />
                Attendance Regularization
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Submitted punch adjustment requests and review outcomes.</p>
            </div>
            {canRequestCorrection && (
              <Button size="sm" onClick={openCorrection}>
                <PlusCircle className="size-3.5" />
                New Request
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {correctionsQuery.isLoading ? (
              <div className="space-y-2 p-4">
                <SkeletonLoader className="h-10 w-full" />
                <SkeletonLoader className="h-10 w-full" />
              </div>
            ) : corrections.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No regularization requests submitted.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Requested Times</th>
                      <th className="px-4 py-3 font-semibold">Reason</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Review Note</th>
                      {canApprove && <th className="px-4 py-3 text-right font-semibold">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {corrections.map((correction) => (
                      <tr key={correction.id} className="transition hover:bg-muted/25">
                        <td className="px-4 py-3 font-medium text-foreground">{formatDate(correction.date)}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{formatTime(correction.requestedCheckIn)} to {formatTime(correction.requestedCheckOut)}</td>
                        <td className="max-w-xs truncate px-4 py-3 text-foreground">{correction.reason}</td>
                        <td className="px-4 py-3"><Badge variant={statusVariant(correction.status)}>{correction.status}</Badge></td>
                        <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{correction.reviewNote || "Not reviewed"}</td>
                        {canApprove && (
                          <td className="px-4 py-3 text-right">
                            {correction.status === "PENDING" ? (
                              <Button size="sm" variant="outline" onClick={() => {
                                setReviewTarget(correction);
                                setReviewDecision("APPROVED");
                                setReviewNote("");
                                setReviewError(null);
                              }}>
                                Review
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">Closed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "team" && canApprove && (
        <Card className="border-border shadow-xs">
          <CardHeader className="gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <UsersRound className="size-4 text-primary" />
                Team Attendance
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Server-scoped list for users with attendance approval or manager access.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input type="date" value={teamDate} onChange={(event) => setTeamDate(event.target.value)} className="h-8 w-auto" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-xs">
                <option value="">All statuses</option>
                {Object.keys(STATUS_LABELS).filter((status) => !["NOT_STARTED", "CLOCKED_IN", "COMPLETED"].includes(status)).map((status) => (
                  <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AttendanceTable rows={teamRecords} loading={teamQuery.isLoading} emptyText="No team attendance records found for this filter." showEmployee />
          </CardContent>
        </Card>
      )}

      <Dialog open={isCorrectionOpen} onOpenChange={setIsCorrectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Attendance Regularization</DialogTitle>
            <DialogDescription>Submit corrected punch times for manager or HR approval.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCorrection} className="space-y-4 py-2 text-xs">
            {corrError && <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive">{corrError}</div>}
            <div className="space-y-1.5">
              <Label htmlFor="regularization-date">Date</Label>
              <Input id="regularization-date" type="date" value={corrDate} onChange={(event) => setCorrDate(event.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="regularization-in">Requested Check-in</Label>
                <Input id="regularization-in" type="time" value={corrCheckIn} onChange={(event) => setCorrCheckIn(event.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="regularization-out">Requested Check-out</Label>
                <Input id="regularization-out" type="time" value={corrCheckOut} onChange={(event) => setCorrCheckOut(event.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="regularization-reason">Reason</Label>
              <Input id="regularization-reason" value={corrReason} onChange={(event) => setCorrReason(event.target.value)} placeholder="Client visit caused missed punch" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCorrectionOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitCorrectionMutation.isPending}>{submitCorrectionMutation.isPending ? "Submitting" : "Submit Request"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reviewTarget)} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Regularization</DialogTitle>
            <DialogDescription>Compare the requested correction before approving or rejecting it.</DialogDescription>
          </DialogHeader>
          {reviewTarget && (
            <div className="space-y-4 py-2 text-xs">
              {reviewError && <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive">{reviewError}</div>}
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground">{reviewTarget.employee?.fullName || "Employee"}</p>
                <p className="mt-1 text-muted-foreground">{formatDate(reviewTarget.date)} / {formatTime(reviewTarget.requestedCheckIn)} to {formatTime(reviewTarget.requestedCheckOut)}</p>
                <p className="mt-2 text-foreground">{reviewTarget.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={reviewDecision === "APPROVED" ? "default" : "outline"} onClick={() => setReviewDecision("APPROVED")}>
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>
                <Button type="button" variant={reviewDecision === "REJECTED" ? "destructive" : "outline"} onClick={() => setReviewDecision("REJECTED")}>
                  <XCircle className="size-4" />
                  Reject
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="review-note">Review note</Label>
                <Input id="review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Reviewed against shift log" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReviewTarget(null)}>Cancel</Button>
                <Button type="button" onClick={submitReview} disabled={reviewCorrectionMutation.isPending}>{reviewCorrectionMutation.isPending ? "Saving" : "Submit Review"}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttendanceTable({ rows, loading, emptyText, showEmployee = false }: { rows: AttendanceRecordItem[]; loading: boolean; emptyText: string; showEmployee?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        <SkeletonLoader className="h-10 w-full" />
        <SkeletonLoader className="h-10 w-full" />
        <SkeletonLoader className="h-10 w-full" />
      </div>
    );
  }
  if (rows.length === 0) return <div className="p-8 text-center text-xs text-muted-foreground">{emptyText}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="border-b border-border bg-muted/30 text-muted-foreground">
          <tr>
            {showEmployee && <th className="px-4 py-3 font-semibold">Employee</th>}
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Shift</th>
            <th className="px-4 py-3 font-semibold">Check In</th>
            <th className="px-4 py-3 font-semibold">Check Out</th>
            <th className="px-4 py-3 font-semibold">Worked Hours</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Late</th>
            <th className="px-4 py-3 font-semibold">Location</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="transition hover:bg-muted/25">
              {showEmployee && (
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">{row.employee?.fullName || "Employee"}</p>
                  <p className="text-[11px] text-muted-foreground">{row.employee?.employeeCode || "No code"}</p>
                </td>
              )}
              <td className="px-4 py-3 font-medium text-foreground">{formatDate(row.date)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatShiftName(row.shift, { isSuccess: true })}</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">{formatTime(row.checkInAt)}</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">{formatTime(row.checkOutAt)}</td>
              <td className="px-4 py-3 font-mono font-semibold text-foreground">{formatMinutes(row.workedMinutes)}</td>
              <td className="px-4 py-3"><Badge variant={statusVariant(row.status)}>{STATUS_LABELS[row.status] ?? row.status}</Badge></td>
              <td className="px-4 py-3 text-muted-foreground">{row.lateMinutes ? `${row.lateMinutes}m` : "No"}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.accuracyMeters ? `${Math.round(row.accuracyMeters)}m accuracy` : row.locationVerificationStatus || "Not captured"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
