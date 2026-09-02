"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Calendar as CalendarIcon, Inbox, ArrowUpRight } from "lucide-react";
import type { HolidayItem, LeaveRequestItem } from "../../../lib/queries/use-dashboard-queries";
import { SkeletonLoader } from "../feedback/aiavro-states";

interface ScheduleCalendarProps {
  holidays?: HolidayItem[];
  leaveRequests?: LeaveRequestItem[];
  isLoading?: boolean;
  isError?: boolean;
}

export function ScheduleCalendar({
  holidays = [],
  leaveRequests = [],
  isLoading,
  isError
}: ScheduleCalendarProps) {
  const [selectedOffset, setSelectedOffset] = useState(0); // 0 = today, 1 = tomorrow, etc.

  // Dynamically compute the current 6 days starting from Monday of this week
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  const weekDays = Array.from({ length: 6 }).map((_, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateNum = String(d.getDate()).padStart(2, "0");
    const fullDateStr = d.toISOString().split("T")[0]!;
    const isCurrentToday = d.toDateString() === today.toDateString();
    return { dayLabel, dateNum, fullDateStr, isCurrentToday, dateObj: d };
  });

  const selectedDay = weekDays[selectedOffset] || weekDays[0]!;

  if (isLoading) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4 animate-pulse">
        <div className="flex justify-between">
          <SkeletonLoader className="h-4 w-32" />
          <SkeletonLoader className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-14 rounded-card" />
          ))}
        </div>
        <SkeletonLoader className="h-20 w-full rounded-card" />
      </div>
    );
  }

  // Find real events matching selected date
  const dayHolidays = holidays.filter((h) => h.date.startsWith(selectedDay.fullDateStr));
  const dayLeaves = leaveRequests.filter((l) => {
    if (!l.startDate || !l.endDate) return false;
    return selectedDay.fullDateStr >= l.startDate.split("T")[0]! && selectedDay.fullDateStr <= l.endDate.split("T")[0]!;
  });

  const hasEvents = dayHolidays.length > 0 || dayLeaves.length > 0;

  return (
    <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
      {/* Calendar Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-pill bg-primary-soft flex items-center justify-center text-primary">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Schedule & Calendar</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground font-mono">
            {today.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
          <Link
            href={"/leave/calendar" as Route}
            className="w-7 h-7 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
            title="Open full leave calendar"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Dynamic Weekday Selector Strip */}
      <div className="grid grid-cols-6 gap-2">
        {weekDays.map((d, idx) => {
          const isSelected = selectedOffset === idx;
          return (
            <button
              key={d.fullDateStr}
              onClick={() => setSelectedOffset(idx)}
              className={`py-2 px-1 rounded-card text-center transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? "bg-primary text-white shadow-md scale-105"
                  : "bg-surface-muted/60 hover:bg-surface-muted text-foreground-secondary"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isSelected ? "text-purple-200" : "text-foreground-muted"}`}>
                {d.dayLabel}
              </span>
              <span className="text-sm font-extrabold tabular-nums leading-tight font-mono">{d.dateNum}</span>
            </button>
          );
        })}
      </div>

      {/* Real Schedule Events or Clean Empty State */}
      <div className="pt-2 border-t border-border-subtle min-h-[90px] flex items-center">
        {isError ? (
          <p className="text-xs text-foreground-muted text-center w-full">Schedule data unavailable.</p>
        ) : hasEvents ? (
          <div className="w-full space-y-2">
            {dayHolidays.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-card bg-[#FEF7EC] border border-[#FCE8CC] text-zinc-900 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-amber-950">{h.name}</h4>
                  <p className="text-[10px] text-amber-800 font-medium">Public Organization Holiday</p>
                </div>
                <span className="px-2 py-0.5 rounded-pill bg-amber-200/80 text-[10px] font-bold text-amber-900">
                  HOLIDAY
                </span>
              </div>
            ))}
            {dayLeaves.map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-card bg-[#EEEDFC] border border-[#DCDAF8] text-zinc-900 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-zinc-950">
                    {l.leaveType?.name || "Approved Time Off"}
                  </h4>
                  <p className="text-[10px] text-zinc-600 font-medium">Leave record active</p>
                </div>
                <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-[10px] font-bold text-primary">
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full py-4 text-center flex flex-col items-center justify-center text-foreground-muted">
            <Inbox className="w-4 h-4 mb-1 opacity-70" />
            <p className="text-xs font-semibold text-foreground">No events scheduled</p>
            <p className="text-[10px] text-foreground-muted">No public holidays or approved time off on this date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
