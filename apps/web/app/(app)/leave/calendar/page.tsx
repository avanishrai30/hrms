"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useHolidays, useLeaveRequests } from "../../../../lib/queries/use-ess-queries";

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: holidays = [] } = useHolidays(year);
  const { data: leaveRequests = [] } = useLeaveRequests();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Compute calendar days for current month view
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={"/leave" as Route}
            className="w-8 h-8 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Time Off Schedule</h1>
            <p className="text-xs text-foreground-muted">Monthly calendar of organization holidays and approved leave</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-control bg-surface-raised border border-border-subtle hover:bg-surface-muted text-foreground transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-foreground font-mono min-w-[120px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-control bg-surface-raised border border-border-subtle hover:bg-surface-muted text-foreground transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card overflow-hidden">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 gap-2 pb-3 mb-3 border-b border-border-subtle text-center text-xs font-bold text-foreground-muted">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-2">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="min-h-[80px] p-2 rounded-card bg-surface-muted/20 border border-transparent" />
          ))}

          {days.map((d) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            const dayHolidays = holidays.filter((h) => h.date.startsWith(dateStr));
            const dayLeaves = leaveRequests.filter((l) => {
              if (!l.startDate || !l.endDate) return false;
              return dateStr >= l.startDate.split("T")[0]! && dateStr <= l.endDate.split("T")[0]!;
            });

            return (
              <div
                key={d}
                className={`min-h-[85px] p-2 rounded-card border transition flex flex-col justify-between ${
                  isToday
                    ? "bg-primary-soft/40 border-primary/40 shadow-sm"
                    : "bg-surface-muted/40 hover:bg-surface-muted/70 border-border-subtle"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${isToday ? "text-primary font-black" : "text-foreground"}`}>
                    {d}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-pill bg-primary" />
                  )}
                </div>

                <div className="space-y-1 mt-1">
                  {dayHolidays.map((h) => (
                    <div
                      key={h.id}
                      className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 text-[9px] font-bold truncate"
                      title={h.name}
                    >
                      {h.name}
                    </div>
                  ))}
                  {dayLeaves.map((l) => (
                    <div
                      key={l.id}
                      className="px-1.5 py-0.5 rounded bg-primary-soft text-primary text-[9px] font-bold truncate"
                      title={l.leaveType?.name || "Leave"}
                    >
                      {l.leaveType?.name || "Leave"} ({l.status})
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
