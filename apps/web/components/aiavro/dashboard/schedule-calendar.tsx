"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  dayIndex: number; // 0 to 5
  color: "purple" | "amber" | "indigo";
  attendeesCount?: number;
}

export function ScheduleCalendar() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Wednesday active

  const days = [
    { label: "Mon", date: "22" },
    { label: "Tue", date: "23" },
    { label: "Wed", date: "24" },
    { label: "Thu", date: "25" },
    { label: "Fri", date: "26" },
    { label: "Sat", date: "27" }
  ];

  const timeSlots = ["09:00 am", "10:00 am", "11:00 am", "12:00 pm", "01:00 pm"];

  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Weekly Engineering Sync",
      subtitle: "Sprint review & architecture updates",
      time: "09:30 am",
      dayIndex: 2,
      color: "purple",
      attendeesCount: 5
    },
    {
      id: "2",
      title: "HR Policy & Leave Briefing",
      subtitle: "Introduction to Q4 wellness guidelines",
      time: "11:30 am",
      dayIndex: 2,
      color: "amber",
      attendeesCount: 4
    }
  ];

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

        <div className="flex items-center gap-3">
          <button className="p-1 rounded-control hover:bg-surface-muted text-foreground-muted hover:text-foreground transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-foreground">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button className="p-1 rounded-control hover:bg-surface-muted text-foreground-muted hover:text-foreground transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Selector Strip */}
      <div className="grid grid-cols-6 gap-2">
        {days.map((d, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={d.label}
              onClick={() => setSelectedDayIndex(idx)}
              className={`py-2 px-1 rounded-card text-center transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? "bg-primary text-white shadow-md scale-105"
                  : "bg-surface-muted/60 hover:bg-surface-muted text-foreground-secondary"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isSelected ? "text-purple-200" : "text-foreground-muted"}`}>
                {d.label}
              </span>
              <span className="text-sm font-extrabold tabular-nums leading-tight">{d.date}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule Timeline Grid */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        {timeSlots.map((time) => {
          const slotEvents = events.filter((e) => e.time.startsWith(time.split(":")[0] || ""));
          return (
            <div key={time} className="flex items-start gap-3 py-1">
              <span className="text-[10px] font-semibold text-foreground-muted w-14 shrink-0 font-mono mt-1">
                {time}
              </span>

              <div className="flex-1 space-y-2">
                {slotEvents.length > 0 ? (
                  slotEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`p-3 rounded-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
                        evt.color === "purple"
                          ? "bg-[#EEEDFC] border-[#DCDAF8] text-zinc-900"
                          : "bg-[#FEF7EC] border-[#FCE8CC] text-zinc-900"
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-zinc-950">{evt.title}</h4>
                        <p className="text-[11px] text-zinc-600 font-medium">{evt.subtitle}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          <div className="w-5 h-5 rounded-pill bg-primary text-white text-[9px] font-bold flex items-center justify-center border border-white">
                            AR
                          </div>
                          <div className="w-5 h-5 rounded-pill bg-accent-purple text-white text-[9px] font-bold flex items-center justify-center border border-white">
                            PS
                          </div>
                          <div className="w-5 h-5 rounded-pill bg-zinc-800 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                            RV
                          </div>
                        </div>
                        {evt.attendeesCount && (
                          <span className="px-1.5 py-0.5 rounded-pill bg-white text-[10px] font-bold text-zinc-700 shadow-sm border border-zinc-200">
                            +{evt.attendeesCount - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-6 border-b border-dashed border-border-subtle/70" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
