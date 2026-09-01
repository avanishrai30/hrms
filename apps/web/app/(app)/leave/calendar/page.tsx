"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { apiRequest } from "../../../../lib/api";
import type { LeaveCalendarEventView } from "@vc-wms/shared-types";

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<LeaveCalendarEventView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

  const startDateStr = firstDayOfMonth.toISOString().split("T")[0] ?? "";
  const endDateStr = lastDayOfMonth.toISOString().split("T")[0] ?? "";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiRequest<LeaveCalendarEventView[]>(
          `/leaves/calendar?startDate=${startDateStr}&endDate=${endDateStr}`
        );
        setEvents(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load leave calendar.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [startDateStr, endDateStr]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build grid of days
  const startingDayOfWeek = firstDayOfMonth.getUTCDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getUTCDate();

  const calendarDays: Array<{ dayNumber: number | null; dateStr: string | null }> = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ dayNumber: null, dateStr: null });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(Date.UTC(year, month, d));
    calendarDays.push({ dayNumber: d, dateStr: dayDate.toISOString().split("T")[0] ?? "" });
  }

  const holidays = events.filter((e) => e.type === "HOLIDAY");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team & Holiday Calendar
          </h1>
          <p className="text-sm text-slate-500">
            Track public holidays, team leaves, and workforce availability across the organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
            <button
              onClick={prevMonth}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
            >
              &larr;
            </button>
            <span className="px-4 py-1.5 text-xs font-semibold text-slate-900 border-x border-slate-200">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
            >
              &rarr;
            </button>
          </div>
          <Link
            href={"/leave" as Route}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            My Leaves
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Calendar Grid */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-semibold text-slate-500 py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-sm text-slate-500">Loading calendar events...</div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[520px]">
            {calendarDays.map((cell, idx) => {
              if (!cell.dayNumber || !cell.dateStr) {
                return <div key={`empty-${idx}`} className="bg-slate-50/40 p-2 min-h-[90px]" />;
              }

              const dayEvents = events.filter((e) => {
                if (e.endDate) {
                  return cell.dateStr! >= e.date && cell.dateStr! <= e.endDate;
                }
                return e.date === cell.dateStr;
              });

              const isToday =
                new Date().toISOString().split("T")[0] === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  className={`p-2 min-h-[90px] flex flex-col justify-between transition ${
                    isToday ? "bg-emerald-50/30" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${
                        isToday
                          ? "bg-emerald-600 text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                  </div>

                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id + cell.dateStr}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate"
                        style={{
                          backgroundColor: `${evt.color}20`,
                          color: evt.color,
                          borderLeft: `2px solid ${evt.color}`
                        }}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Holidays List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Public Holidays in {monthNames[month]} {year}
        </h2>
        {holidays.length === 0 ? (
          <p className="text-xs text-slate-500">No declared holidays for this month.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-amber-900">{h.title}</div>
                  <div className="text-amber-700 mt-0.5">
                    {new Date(h.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric"
                    })}
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-amber-200/80 text-amber-800 px-1.5 py-0.5 rounded">
                  Holiday
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
