"use client";

import React, { useState } from "react";
import {
  Play,
  Square,
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle
} from "lucide-react";
import {
  useAttendanceToday,
  useAttendanceHistory,
  usePunchMutation,
  useAttendanceCorrections,
  useSubmitAttendanceCorrection,
  useReviewAttendanceCorrection
} from "../../../lib/queries/use-ess-queries";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";
import {
  buildPunchPayload,
  formatShiftName,
  getGpsFailureMessageForAttendance
} from "../../../lib/semantic-state";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
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

export default function EmployeeAttendancePage() {
  const gate = usePermissionGate(["attendance.view", "ess.read"]);
  const canApprove = useHasPermission(["attendance.approve", "attendance.correct", "mss.manage"]);

  const [activeTab, setActiveTab] = useState<"daily" | "corrections">("daily");
  const [punchNote, setPunchNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<string | null>(null);

  // Correction Dialog State
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [corrDate, setCorrDate] = useState(new Date().toISOString().slice(0, 10));
  const [corrCheckIn, setCorrCheckIn] = useState("09:00");
  const [corrCheckOut, setCorrCheckOut] = useState("18:00");
  const [corrReason, setCorrReason] = useState("");
  const [corrError, setCorrError] = useState<string | null>(null);

  const todayQuery = useAttendanceToday(gate.isAuthorized);
  const historyQuery = useAttendanceHistory(undefined, undefined, gate.isAuthorized);
  const correctionsQuery = useAttendanceCorrections(gate.isAuthorized);

  const punchMutation = usePunchMutation();
  const submitCorrectionMutation = useSubmitAttendanceCorrection();
  const reviewCorrectionMutation = useReviewAttendanceCorrection();

  const todayData = todayQuery.data;
  const record = todayData?.record;
  const shift = todayData?.shift;
  const canCheckIn = todayData?.canCheckIn ?? false;
  const canCheckOut = todayData?.canCheckOut ?? false;
  const isCheckedIn = Boolean(record?.checkInAt && !record?.checkOutAt);

  const corrections = correctionsQuery.data ?? [];

  const computeDuration = (): { formatted: string; percentage: number | null } => {
    if (!record?.checkInAt) return { formatted: "00:00", percentage: 0 };
    const start = new Date(record.checkInAt).getTime();
    const end = record.checkOutAt ? new Date(record.checkOutAt).getTime() : Date.now();
    const diffMins = Math.max(0, Math.floor((end - start) / 60000));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    let percentage: number | null = null;
    if (shift?.workHours && shift.workHours > 0) {
      percentage = Math.min(100, Math.round((diffMins / (shift.workHours * 60)) * 100));
    }
    return { formatted, percentage };
  };

  const duration = computeDuration();

  const isLocationRequired = Boolean(todayData?.requiresLocation || todayData?.rules?.requireGeofence);
  const isCompleted = todayData?.state === "COMPLETED" || Boolean(record?.checkInAt && record?.checkOutAt);
  const isClockedIn = todayData?.state === "CLOCKED_IN" || isCheckedIn;

  const handlePunch = async () => {
    const action = canCheckIn ? "check-in" : "check-out";
    const notes = punchNote || undefined;
    setActionError(null);

    // If location is NOT required by tenant policy:
    // DO NOT prompt or trigger browser geolocation at all!
    if (!isLocationRequired) {
      try {
        setLocationState(null);
        await punchMutation.mutateAsync(buildPunchPayload({ action, notes }));
        setPunchNote("");
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : "Attendance punch failed");
      }
      return;
    }

    const submitWithoutCoordinates = async (reason: "denied" | "unavailable" | "timeout" | "unsupported" | "unknown") => {
      const geofenceMessage = getGpsFailureMessageForAttendance(todayData?.rules, reason);
      if (geofenceMessage) {
        setLocationState(geofenceMessage);
        return;
      }
      setLocationState("Location was unavailable. Recording without GPS because geofencing is not required.");
      await punchMutation.mutateAsync(buildPunchPayload({ action, notes }));
      setPunchNote("");
    };

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      try {
        await submitWithoutCoordinates("unsupported");
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : "Attendance punch failed");
      }
      return;
    }

    setLocationState("Getting location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setLocationState("Location verified.");
          await punchMutation.mutateAsync(
            buildPunchPayload({
              action,
              notes,
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
              }
            })
          );
          setPunchNote("");
          setTimeout(() => setLocationState(null), 3000);
        } catch (err: unknown) {
          setActionError(err instanceof Error ? err.message : "Attendance punch failed");
          setLocationState(null);
        }
      },
      async (error) => {
        const errorReasonMap: Record<number, "denied" | "unavailable" | "timeout"> = {
          1: "denied",
          2: "unavailable",
          3: "timeout"
        };
        const reason = errorReasonMap[error.code] || "unknown";
        if (reason === "denied") {
          setLocationState("Location permission denied");
        } else if (reason === "timeout") {
          setLocationState("Unable to obtain required location (timeout)");
        } else {
          setLocationState("Unable to obtain required location");
        }
        try {
          await submitWithoutCoordinates(reason);
        } catch (err: unknown) {
          setActionError(err instanceof Error ? err.message : "Attendance punch failed");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const handleOpenCorrection = () => {
    setCorrDate(new Date().toISOString().slice(0, 10));
    setCorrReason("");
    setCorrError(null);
    setIsCorrectionOpen(true);
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (corrReason.trim().length < 4) {
      setCorrError("Please provide a reason (at least 4 characters).");
      return;
    }

    try {
      setCorrError(null);
      await submitCorrectionMutation.mutateAsync({
        date: corrDate,
        requestedCheckIn: `${corrDate}T${corrCheckIn}:00Z`,
        requestedCheckOut: `${corrDate}T${corrCheckOut}:00Z`,
        reason: corrReason.trim()
      });
      setIsCorrectionOpen(false);
    } catch (err: unknown) {
      setCorrError(err instanceof Error ? err.message : "Failed to submit correction request.");
    }
  };

  const handleReviewCorrection = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewCorrectionMutation.mutateAsync({ id, status });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to review correction.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && todayQuery.isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-72 rounded-xl border border-border bg-card/60" />
          <div className="h-72 rounded-xl border border-border bg-card/40" />
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
            <CardTitle className="text-base">Attendance Workspace Restricted</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              You do not have permission (<code className="text-[11px] font-mono">attendance.view</code>) to access attendance records.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const renderPolicyRule = (enabled?: boolean, trueLabel: string = "Enabled", falseLabel: string = "Disabled") => (
    <span className={enabled ? "text-emerald-500 font-semibold" : "text-muted-foreground"}>
      {enabled ? trueLabel : falseLabel}
    </span>
  );

  const historyRecords = historyQuery.data ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Attendance & Time Tracking</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time shift tracking, punch history, and attendance regularization.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === "daily" || value === "corrections") setActiveTab(value);
          }}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
            <TabsTrigger value="corrections">Regularization ({corrections.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs">
          {actionError}
        </div>
      )}

      {activeTab === "daily" && (
        <>
          {/* 2. Today's Punch & Shift Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Punch Card */}
            <Card className="md:col-span-2 border border-border shadow-xs">
              <CardHeader className="border-b border-border pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today&apos;s Shift</span>
                    <CardTitle className="text-base font-bold text-foreground">
                      {formatShiftName(shift)}
                    </CardTitle>
                  </div>
                  <Badge variant={isClockedIn ? "success" : isCompleted ? "secondary" : "outline"}>
                    {isClockedIn ? "CLOCKED IN" : isCompleted ? "COMPLETED" : "NOT STARTED"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Session Duration</p>
                    <p className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
                      {duration.formatted}
                    </p>
                  </div>
                  {duration.percentage !== null && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Shift Target</p>
                      <p className="text-sm font-bold font-mono text-foreground">{duration.percentage}%</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Input
                    type="text"
                    value={punchNote}
                    onChange={(e) => setPunchNote(e.target.value)}
                    placeholder="Optional note for this punch..."
                    disabled={punchMutation.isPending || (!canCheckIn && !canCheckOut)}
                  />
                </div>

                {locationState && (
                  <p className="text-xs text-muted-foreground text-center">{locationState}</p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>
                      Clocked In:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {record?.checkInAt ? new Date(record.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                    <div>
                      Clocked Out:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {record?.checkOutAt ? new Date(record.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePunch}
                    disabled={punchMutation.isPending || (!canCheckIn && !canCheckOut)}
                    variant={isClockedIn ? "outline" : isCompleted && !canCheckIn ? "secondary" : "default"}
                    className="w-full sm:w-auto"
                  >
                    {punchMutation.isPending ? (
                      "Recording…"
                    ) : isClockedIn ? (
                      <>
                        <Square className="size-3.5 mr-1.5 fill-current" />
                        Clock Out
                      </>
                    ) : isCompleted && !canCheckIn ? (
                      <>
                        <CheckCircle2 className="size-3.5 mr-1.5 text-primary" />
                        Attendance Completed
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5 mr-1.5 fill-current" />
                        Clock In
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shift Rules Card */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Shift Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Self Check-in</span>
                  <span>{renderPolicyRule(todayData?.rules?.allowSelfCheckIn, "Enabled", "Restricted")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Geofencing</span>
                  <span>{renderPolicyRule(todayData?.rules?.requireGeofence, "Required", "Not required")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Biometric / Face</span>
                  <span>{renderPolicyRule(todayData?.rules?.requireFace, "Required", "Not required")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. History Section */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Recent Attendance History
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleOpenCorrection}>
                <PlusCircle className="size-3.5 mr-1.5" />
                <span>Request Regularization</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {historyQuery.isLoading ? (
                <div className="p-4 space-y-2">
                  <SkeletonLoader className="h-9 w-full" />
                  <SkeletonLoader className="h-9 w-full" />
                </div>
              ) : historyRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground bg-muted/20">
                        <th className="py-2.5 px-4 font-semibold">Date</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold">In Time</th>
                        <th className="py-2.5 px-4 font-semibold">Out Time</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {historyRecords.map((item) => {
                        const hours = Math.floor((item.workedMinutes || 0) / 60);
                        const mins = (item.workedMinutes || 0) % 60;
                        return (
                          <tr key={item.id} className="hover:bg-muted/30 transition">
                            <td className="py-3 px-4 font-medium text-foreground">
                              {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={item.status === "PRESENT" ? "success" : "secondary"} className="text-[10px]">
                                {item.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-muted-foreground">
                              {item.checkInAt ? new Date(item.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td className="py-3 px-4 font-mono text-muted-foreground">
                              {item.checkOutAt ? new Date(item.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-foreground text-right">
                              {hours}h {mins}m
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No historical attendance records available.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Tab 2: Attendance Corrections */}
      {activeTab === "corrections" && (
        <Card className="border border-border shadow-xs">
          <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Attendance Regularization Requests
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submitted punch adjustment requests and manager approval reviews.
              </p>
            </div>
            <Button size="sm" onClick={handleOpenCorrection}>
              <PlusCircle className="size-3.5 mr-1.5" />
              <span>New Request</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {correctionsQuery.isLoading ? (
              <div className="p-4 space-y-2">
                <SkeletonLoader className="h-9 w-full" />
                <SkeletonLoader className="h-9 w-full" />
              </div>
            ) : corrections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground bg-muted/20">
                      <th className="py-2.5 px-4 font-semibold">Date</th>
                      <th className="py-2.5 px-4 font-semibold">Requested Times</th>
                      <th className="py-2.5 px-4 font-semibold">Reason</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      {canApprove && <th className="py-2.5 px-4 font-semibold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {corrections.map((corr) => (
                      <tr key={corr.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4 font-medium text-foreground font-mono">
                          {corr.date ? new Date(corr.date).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {corr.requestedCheckIn ? new Date(corr.requestedCheckIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                          {" → "}
                          {corr.requestedCheckOut ? new Date(corr.requestedCheckOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td className="py-3 px-4 text-foreground max-w-xs truncate">
                          {corr.reason}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              corr.status === "APPROVED" ? "success" : corr.status === "REJECTED" ? "destructive" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {corr.status}
                          </Badge>
                        </td>
                        {canApprove && (
                          <td className="py-3 px-4 text-right">
                            {corr.status === "PENDING" && (
                              <div className="inline-flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                                  onClick={() => handleReviewCorrection(corr.id, "APPROVED")}
                                  disabled={reviewCorrectionMutation.isPending}
                                >
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleReviewCorrection(corr.id, "REJECTED")}
                                  disabled={reviewCorrectionMutation.isPending}
                                >
                                  <XCircle className="size-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No attendance regularization requests found.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Regularization Dialog */}
      <Dialog open={isCorrectionOpen} onOpenChange={setIsCorrectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Attendance Regularization</DialogTitle>
            <DialogDescription>
              Submit missing or corrected punch times for approval by your reporting manager.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCorrection} className="space-y-4 py-2 text-xs">
            {corrError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                {corrError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={corrDate}
                onChange={(e) => setCorrDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="checkIn">Actual Check In</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={corrCheckIn}
                  onChange={(e) => setCorrCheckIn(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkOut">Actual Check Out</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={corrCheckOut}
                  onChange={(e) => setCorrCheckOut(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason for Correction</Label>
              <Input
                id="reason"
                placeholder="e.g. Device biometric punch missed due to client visit"
                value={corrReason}
                onChange={(e) => setCorrReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCorrectionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitCorrectionMutation.isPending}>
                {submitCorrectionMutation.isPending ? "Submitting…" : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
