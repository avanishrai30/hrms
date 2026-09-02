"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { MapPin, Building, ArrowUpRight, ShieldCheck, UserX, CircleUser } from "lucide-react";
import type { EmployeeProfileResponse } from "../../../lib/queries/use-dashboard-queries";
import { SkeletonLoader } from "../feedback/aiavro-states";

interface EmployeeProfileCardProps {
  profile?: EmployeeProfileResponse | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  salaryMonthlyInr?: number | null;
}

export function EmployeeProfileCard({
  profile,
  isLoading,
  isError,
  onRetry,
  salaryMonthlyInr = null
}: EmployeeProfileCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-card bg-surface-muted/60 p-5 min-h-[240px] flex flex-col justify-between border border-border-subtle animate-pulse">
        <div className="flex items-center gap-3">
          <SkeletonLoader className="w-14 h-14 rounded-panel" />
          <div className="space-y-2 flex-1">
            <SkeletonLoader className="h-4 w-32" />
            <SkeletonLoader className="h-3 w-24" />
          </div>
        </div>
        <div className="pt-4 border-t border-border-subtle flex justify-between">
          <SkeletonLoader className="h-3 w-20" />
          <SkeletonLoader className="h-3 w-24 rounded-pill" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card flex flex-col items-center justify-center text-center min-h-[240px]">
        <div className="w-10 h-10 rounded-pill bg-surface-muted flex items-center justify-center text-foreground-muted mb-2">
          <UserX className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-semibold text-foreground">Profile Unavailable</h4>
        <p className="text-[11px] text-foreground-muted mt-1 max-w-[200px]">
          No active employee profile linked to current session.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-3 py-1 rounded-control bg-primary-soft text-primary text-[11px] font-semibold hover:bg-primary-soft/80 transition"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const departmentObj = profile.department;
  const departmentName = typeof departmentObj === "string" ? departmentObj : departmentObj?.name;
  const designationObj = profile.designation;
  const designationName = typeof designationObj === "string" ? designationObj : designationObj?.title || designationObj?.name;
  const locationName = profile.region || profile.businessUnit;
  const initial = (profile.firstName?.charAt(0) || profile.fullName?.charAt(0) || "").toUpperCase() || null;

  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-[#E2E0FC] via-[#D3D0F8] to-[#C4C0F4] p-5 text-zinc-900 shadow-card flex flex-col justify-between min-h-[240px] border border-white/50">
      {/* Subtle decorative glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-pill bg-white/40 blur-2xl pointer-events-none" />

      {/* Top Details & Avatar */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-14 h-14 rounded-panel overflow-hidden border-2 border-white/90 shadow-md bg-white flex items-center justify-center text-primary shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center font-extrabold text-lg text-primary">
                {initial || <CircleUser className="size-5 text-primary" />}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-pill bg-success border-2 border-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-zinc-950 tracking-tight leading-snug truncate">
                {profile.fullName || `${profile.firstName} ${profile.lastName}`}
              </h2>
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            </div>
            {designationName && <p className="text-xs font-semibold text-zinc-700 truncate">{designationName}</p>}
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-600 font-medium truncate">
              {departmentName && (
                <span className="flex items-center gap-0.5 truncate">
                  <Building className="w-3 h-3 text-zinc-500 shrink-0" />
                  {departmentName}
                </span>
              )}
              {departmentName && locationName && <span>•</span>}
              {locationName && (
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                  {locationName}
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          href={"/profile" as Route}
          className="w-7 h-7 rounded-pill bg-white/70 hover:bg-white flex items-center justify-center text-zinc-800 transition shadow-sm shrink-0"
          title="View profile"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Bottom Row - ID Code & Employment Type */}
      <div className="pt-3 mt-3 border-t border-white/40 flex items-center justify-between relative z-10">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-600">Employee ID</span>
          <div className="text-xs font-mono font-bold text-zinc-900">
            {profile.employeeCode || "—"}
          </div>
        </div>

        {salaryMonthlyInr ? (
          <div className="px-3 py-1 rounded-pill bg-[#261A4E] text-white shadow-sm flex items-center gap-1.5">
            <span className="text-[10px] text-purple-200 font-medium">Monthly</span>
            <span className="text-xs font-bold font-mono text-white tabular-nums">
              ₹{salaryMonthlyInr.toLocaleString("en-IN")}
            </span>
          </div>
        ) : profile.employmentType ? (
          <div className="px-2.5 py-0.5 rounded-pill bg-white/60 text-zinc-800 text-[11px] font-semibold">
            {profile.employmentType.replace(/_/g, " ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
