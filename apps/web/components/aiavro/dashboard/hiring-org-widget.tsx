"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface HiringOrgWidgetProps {
  isHrOrAdmin: boolean;
  totalEmployees: number | null;
  leaveBalanceDays: number;
}

export function HiringOrgWidget({ isHrOrAdmin, totalEmployees, leaveBalanceDays }: HiringOrgWidgetProps) {
  // Weekly cadence bars
  const weekData = [
    { day: "S", height: 35 },
    { day: "M", height: 75 },
    { day: "T", height: 50 },
    { day: "W", height: 85 },
    { day: "T", height: 95, highlight: true },
    { day: "F", height: 70 },
    { day: "S", height: 20 }
  ];

  const title = isHrOrAdmin ? "Workforce Velocity" : "Leave & Time Off";
  const primaryNumber = isHrOrAdmin ? totalEmployees || 128 : leaveBalanceDays;
  const unit = isHrOrAdmin ? "Active Headcount" : "Days Available";
  const targetRoute = (isHrOrAdmin ? "/employees" : "/leave") as Route;

  return (
    <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card flex flex-col justify-between min-h-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-foreground tabular-nums">{primaryNumber}</span>
            <span className="text-[11px] text-foreground-muted font-medium">{unit}</span>
          </div>
        </div>
        <Link
          href={targetRoute}
          className="w-7 h-7 rounded-pill bg-surface-muted hover:bg-muted flex items-center justify-center text-foreground-secondary transition"
          title={`View ${title}`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Growth Pill */}
      <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>+14% vs previous quarter</span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-2 h-24 px-1">
          {weekData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full max-w-[14px] rounded-pill transition-all duration-500 ${
                  item.highlight
                    ? "bg-primary shadow-sm ring-2 ring-primary-soft"
                    : "bg-accent-lilac hover:bg-primary-soft"
                }`}
                style={{ height: `${item.height}%` }}
              />
              <span className="text-[10px] font-semibold text-foreground-muted">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
