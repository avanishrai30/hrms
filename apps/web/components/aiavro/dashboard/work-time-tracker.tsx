"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Square, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "../../../lib/api";
import { dashboardKeys } from "../../../lib/queries/use-dashboard-queries";
import { SkeletonLoader } from "../feedback/aiavro-states";

interface WorkTimeTrackerProps {
  checkInTime?: string | null | undefined;
  checkOutTime?: string | null | undefined;
  status?: string | null | undefined;
  shiftName?: string | null | undefined;
  shiftHours?: number | null | undefined;
  canCheckIn?: boolean | undefined;
  canCheckOut?: boolean | undefined;
  isLoading?: boolean | undefined;
  isError?: boolean | undefined;
  onRefresh?: (() => void) | undefined;
}

export function WorkTimeTracker({
  checkInTime,
  checkOutTime,
  status,
  shiftName,
  shiftHours,
  canCheckIn = false,
  canCheckOut = false,
  isLoading,
  isError,
  onRefresh
}: WorkTimeTrackerProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const computeDuration = (): { formatted: string; percentage: number | null } => {
    if (!checkInTime) {
      return { formatted: "00:00", percentage: 0 };
    }
    const start = new Date(checkInTime).getTime();
    const end = checkOutTime ? new Date(checkOutTime).getTime() : Date.now();
    const diffMins = Math.max(0, Math.floor((end - start) / 60000));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    let percentage: number | null = null;
    if (shiftHours && shiftHours > 0) {
      const shiftMins = shiftHours * 60;
      percentage = Math.min(100, Math.round((diffMins / shiftMins) * 100));
    }
    return { formatted, percentage };
  };

  const duration = computeDuration();
  const isCheckedIn = Boolean(checkInTime && !checkOutTime);

  const handlePunch = async () => {
    try {
      setSubmitting(true);
      setActionError(null);
      if (canCheckIn) {
        await apiRequest("/attendance/check-in", {
          method: "POST",
          body: JSON.stringify({ source: "WEB" })
        });
      } else if (canCheckOut) {
        await apiRequest("/attendance/check-out", {
          method: "POST",
          body: JSON.stringify({ source: "WEB" })
        });
      }
      // Instant cache invalidation
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.attendance() });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Attendance update failed";
      setActionError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card min-h-[240px] flex flex-col justify-between animate-pulse">
        <div className="flex justify-between">
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-6 w-6 rounded-pill" />
        </div>
        <div className="flex justify-center my-4">
          <SkeletonLoader className="w-24 h-24 rounded-pill" />
        </div>
        <SkeletonLoader className="h-8 w-full rounded-pill" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card min-h-[240px] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-6 h-6 text-danger mb-2" />
        <h4 className="text-xs font-semibold text-foreground">Attendance Unavailable</h4>
        <p className="text-[11px] text-foreground-muted mt-1">Unable to load today&apos;s record.</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-3 px-3 py-1 rounded-control bg-primary-soft text-primary text-[11px] font-semibold hover:bg-primary-soft/80 transition"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = duration.percentage !== null
    ? circumference - (duration.percentage / 100) * circumference
    : circumference * (isCheckedIn ? 0.35 : 1);

  // Precise semantic state label
  const stateLabel = isCheckedIn
    ? "Elapsed"
    : checkInTime && checkOutTime
    ? "Completed"
    : canCheckIn
    ? "Ready to clock in"
    : status
    ? status.replace(/_/g, " ")
    : "No action available";

  return (
    <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card flex flex-col justify-between min-h-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Time Tracker</h3>
          <p className="text-[11px] text-foreground-muted font-medium">
            {shiftName || (shiftHours ? `${shiftHours}h Shift` : "Standard Shift")}
          </p>
        </div>
        <Link
          href={"/attendance" as Route}
          className="w-7 h-7 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
          title="Open attendance details"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Circular Dial & Digital Timer */}
      <div className="flex items-center justify-center my-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-border-subtle"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              strokeDasharray="3 3"
            />
            {checkInTime && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-primary transition-all duration-700 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold font-mono tracking-tight text-foreground tabular-nums leading-none">
              {duration.formatted}
            </span>
            <span className="text-[10px] text-foreground-muted font-medium mt-0.5 capitalize">
              {stateLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls & Error Alert */}
      <div>
        {actionError && (
          <p className="text-[10px] text-danger font-medium mb-1.5 text-center">{actionError}</p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 text-xs text-foreground-secondary font-medium truncate">
            {checkInTime ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span className="truncate">
                  In: {new Date(checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                <span className="truncate">
                  {canCheckIn ? "Ready to clock in" : "Not clocked in"}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handlePunch}
            disabled={submitting || (!canCheckIn && !canCheckOut)}
            className={`px-3 py-1.5 rounded-pill text-xs font-semibold inline-flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40 shrink-0 ${
              isCheckedIn
                ? "bg-[#261A4E] text-white hover:bg-[#1E1440]"
                : "bg-primary text-white hover:bg-primary-hover shadow-sm"
            }`}
          >
            {submitting ? (
              "Updating..."
            ) : isCheckedIn ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                Clock In
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
