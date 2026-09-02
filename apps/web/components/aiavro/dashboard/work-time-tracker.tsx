"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Play, Square, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { apiRequest } from "../../../lib/api";

interface WorkTimeTrackerProps {
  checkInTime?: string | null | undefined;
  checkOutTime?: string | null | undefined;
  status?: string | undefined;
  canCheckIn?: boolean | undefined;
  canCheckOut?: boolean | undefined;
  onRefresh?: (() => void) | undefined;
}

export function WorkTimeTracker({
  checkInTime,
  checkOutTime,
  status: _status = "NOT_MARKED",
  canCheckIn = true,
  canCheckOut = false,
  onRefresh
}: WorkTimeTrackerProps) {
  const [loading, setLoading] = useState(false);

  // Calculate worked duration if checked in
  const computeDuration = (): { hours: number; minutes: number; formatted: string; percentage: number } => {
    if (!checkInTime) {
      return { hours: 0, minutes: 0, formatted: "00:00", percentage: 0 };
    }
    const start = new Date(checkInTime).getTime();
    const end = checkOutTime ? new Date(checkOutTime).getTime() : Date.now();
    const diffMins = Math.max(0, Math.floor((end - start) / 60000));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const standardWorkMins = 8 * 60; // 8 hours
    const percentage = Math.min(100, Math.round((diffMins / standardWorkMins) * 100));
    return { hours, minutes, formatted, percentage };
  };

  const duration = computeDuration();
  const isCheckedIn = Boolean(checkInTime && !checkOutTime);

  const handlePunch = async () => {
    try {
      setLoading(true);
      if (canCheckIn) {
        await apiRequest("/attendance/check-in", {
          method: "POST",
          body: JSON.stringify({ type: "WEB", timestamp: new Date().toISOString() })
        });
      } else if (canCheckOut) {
        await apiRequest("/attendance/check-out", {
          method: "POST",
          body: JSON.stringify({ type: "WEB", timestamp: new Date().toISOString() })
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Attendance punch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // SVG Circular Gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (duration.percentage / 100) * circumference;

  return (
    <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card flex flex-col justify-between min-h-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Time Tracker</h3>
          <p className="text-[11px] text-foreground-muted font-medium">Standard 8h Shift</p>
        </div>
        <Link
          href={"/attendance" as Route}
          className="w-7 h-7 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
          title="Open attendance details"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Middle Gauge & Digital Clock */}
      <div className="flex items-center justify-center my-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* SVG Progress Dial */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track (dotted effect) */}
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
            {/* Active progress arc */}
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
          </svg>

          {/* Centered Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold font-mono tracking-tight text-foreground tabular-nums leading-none">
              {duration.formatted}
            </span>
            <span className="text-[10px] text-foreground-muted font-medium mt-0.5">Work Time</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls & Punch Action */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <div className="flex items-center gap-1.5 text-xs text-foreground-secondary font-medium">
          {checkInTime ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>In: {new Date(checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-foreground-muted" />
              <span>Not clocked in</span>
            </>
          )}
        </div>

        <button
          onClick={handlePunch}
          disabled={loading || (!canCheckIn && !canCheckOut)}
          className={`px-3 py-1.5 rounded-pill text-xs font-semibold inline-flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 ${
            isCheckedIn
              ? "bg-[#261A4E] text-white hover:bg-[#1E1440]"
              : "bg-primary text-white hover:bg-primary-hover shadow-sm"
          }`}
        >
          {loading ? (
            "Syncing..."
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
  );
}
