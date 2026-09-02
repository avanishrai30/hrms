"use client";

import React, { useState } from "react";
import {
  Play,
  Square,
  Calendar,
  ShieldCheck
} from "lucide-react";
import {
  useAttendanceToday,
  useAttendanceHistory,
  usePunchMutation
} from "../../../lib/queries/use-ess-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";
import {
  buildPunchPayload,
  formatShiftName,
  getGpsFailureMessageForAttendance
} from "../../../lib/semantic-state";

export default function EmployeeAttendancePage() {
  const gate = usePermissionGate(["attendance.view", "ess.read"]);

  const [punchNote, setPunchNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<string | null>(null);

  const todayQuery = useAttendanceToday(gate.isAuthorized);
  const historyQuery = useAttendanceHistory(undefined, undefined, gate.isAuthorized);
  const punchMutation = usePunchMutation();

  const todayData = todayQuery.data;
  const record = todayData?.record;
  const shift = todayData?.shift;
  const canCheckIn = todayData?.canCheckIn ?? false;
  const canCheckOut = todayData?.canCheckOut ?? false;
  const isCheckedIn = Boolean(record?.checkInAt && !record?.checkOutAt);

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

  const handlePunch = async () => {
    const action = canCheckIn ? "check-in" : "check-out";
    const notes = punchNote || undefined;
    setActionError(null);

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

    setLocationState("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setLocationState(
            pos.coords.accuracy > 100
              ? `Location captured with low accuracy (${Math.round(pos.coords.accuracy)} m).`
              : "Location captured."
          );
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
        } catch (err: unknown) {
          setActionError(err instanceof Error ? err.message : "Attendance punch failed");
        }
      },
      async (err) => {
        const reason = err.code === err.PERMISSION_DENIED
          ? "denied"
          : err.code === err.TIMEOUT
          ? "timeout"
          : err.code === err.POSITION_UNAVAILABLE
          ? "unavailable"
          : "unknown";
        try {
          await submitWithoutCoordinates(reason);
        } catch (error: unknown) {
          setActionError(error instanceof Error ? error.message : "Attendance punch failed");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = duration.percentage !== null
    ? circumference - (duration.percentage / 100) * circumference
    : circumference * (isCheckedIn ? 0.35 : 1);

  const historyRecords = historyQuery.data ?? [];

  const renderPolicyRule = (value: boolean | undefined | null, trueText = "Required", falseText = "Not required") => {
    if (value === true) return trueText;
    if (value === false) return falseText;
    return "Not configured";
  };

  if (gate.isLoading || (gate.isAuthorized && todayQuery.isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 h-72 rounded-card bg-surface-muted/60" />
          <div className="h-72 rounded-card bg-surface-muted/60" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Attendance Tracking Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`attendance.view`) to access time & attendance tracking.
          </p>
        </div>
      </div>
    );
  }

  const shiftLabel = formatShiftName(shift, { isSuccess: todayQuery.isSuccess });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance & Time Tracking</h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} • Verified Time Records
        </p>
      </div>

      {/* 2. Top Grid: Hero Punch Terminal & Shift Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Terminal Dial Card */}
        <div className="md:col-span-2 rounded-card bg-surface-raised border border-border-subtle p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-foreground">Live Workstation</span>
              <p className="text-[11px] text-foreground-muted font-medium">
                {shiftLabel}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-pill text-[11px] font-bold ${
                isCheckedIn
                  ? "bg-success/20 text-success"
                  : record?.checkOutAt
                  ? "bg-primary-soft text-primary"
                  : "bg-surface-muted text-foreground-muted"
              }`}
            >
              {isCheckedIn ? "CURRENTLY WORKING" : record?.checkOutAt ? "SHIFT COMPLETED" : "NOT CLOCKED IN"}
            </span>
          </div>

          {/* Central Timer Dial */}
          <div className="flex items-center justify-center my-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="text-border-subtle"
                  strokeWidth="7"
                  stroke="currentColor"
                  fill="transparent"
                  strokeDasharray="4 4"
                />
                {record?.checkInAt && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="text-primary transition-all duration-700 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums leading-none">
                  {duration.formatted}
                </span>
                <span className="text-[10px] text-foreground-muted font-medium mt-1">
                  {isCheckedIn ? "Worked Today" : "Total Time"}
                </span>
              </div>
            </div>
          </div>

          {/* Punch Actions */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            {actionError && (
              <p className="text-xs text-danger font-medium text-center">{actionError}</p>
            )}

            {locationState && (
              <p className="text-xs text-foreground-muted font-medium text-center">{locationState}</p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-foreground-secondary space-y-0.5">
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

              <button
                onClick={handlePunch}
                disabled={punchMutation.isPending || (!canCheckIn && !canCheckOut)}
                className={`px-5 py-2.5 rounded-pill text-xs font-bold inline-flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40 shadow-sm ${
                  isCheckedIn
                    ? "bg-[#261A4E] text-white hover:bg-[#1E1440]"
                    : "bg-primary text-white hover:bg-primary-hover"
                }`}
              >
                {punchMutation.isPending ? (
                  "Recording..."
                ) : isCheckedIn ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Punch Out
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Punch In
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Shift Policy Card */}
        <div className="rounded-card bg-[#18153B] text-white p-5 shadow-panel border border-[#2B2758] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Shift Policy Rules</h3>
            </div>
            <div className="space-y-2.5 text-xs text-purple-200/80">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span>Self Check-in</span>
                <span className="font-semibold text-white">
                  {renderPolicyRule(todayData?.rules?.allowSelfCheckIn, "Enabled", "Restricted")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span>Geofencing</span>
                <span className="font-semibold text-white">
                  {renderPolicyRule(todayData?.rules?.requireGeofence, "Required", "Not required")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span>Biometric / Face</span>
                <span className="font-semibold text-white">
                  {renderPolicyRule(todayData?.rules?.requireFace, "Required", "Not required")}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-purple-300/70">
            Attendance status is recorded against assigned work schedules.
          </div>
        </div>
      </div>

      {/* 3. Historical Attendance Log Table */}
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Recent Attendance History</h3>
          </div>
        </div>

        {historyQuery.isLoading ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-10 w-full rounded-control" />
            <SkeletonLoader className="h-10 w-full rounded-control" />
            <SkeletonLoader className="h-10 w-full rounded-control" />
          </div>
        ) : historyRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-foreground-muted">
                  <th className="py-2.5 font-semibold">Date</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">In Time</th>
                  <th className="py-2.5 font-semibold">Out Time</th>
                  <th className="py-2.5 font-semibold text-right">Worked Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {historyRecords.map((item) => {
                  const hours = Math.floor((item.workedMinutes || 0) / 60);
                  const mins = (item.workedMinutes || 0) % 60;
                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/50 transition">
                      <td className="py-3 font-semibold text-foreground">
                        {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary font-bold text-[10px]">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-foreground-secondary">
                        {item.checkInAt ? new Date(item.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 font-mono text-foreground-secondary">
                        {item.checkOutAt ? new Date(item.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 font-mono font-bold text-foreground text-right">
                        {hours}h {mins}m
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-foreground-muted">
            No historical attendance logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
