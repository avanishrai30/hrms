"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { MapPin, Building, ArrowUpRight, ShieldCheck } from "lucide-react";

interface EmployeeProfileCardProps {
  fullName: string;
  designation?: string;
  department?: string;
  location?: string;
  employeeCode?: string;
  avatarUrl?: string;
  salaryMonthlyInr?: number | null;
  employmentType?: string;
}

export function EmployeeProfileCard({
  fullName,
  designation = "Employee",
  department = "General",
  location = "Bangalore HQ",
  employeeCode,
  avatarUrl,
  salaryMonthlyInr,
  employmentType = "Full Time"
}: EmployeeProfileCardProps) {
  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-[#D9D7F8] via-[#C9C6F5] to-[#B8B4F0] p-5 text-zinc-900 shadow-card flex flex-col justify-between min-h-[240px] border border-white/40">
      {/* Decorative background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-pill bg-white/30 blur-2xl pointer-events-none" />

      {/* Top Details & Avatar */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative w-16 h-16 rounded-panel overflow-hidden border-2 border-white/80 shadow-md bg-white flex items-center justify-center text-primary">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-xl text-primary">
                {fullName.charAt(0)}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-pill bg-success border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight leading-snug">{fullName}</h2>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-zinc-700">{designation}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-600 font-medium">
              <span className="flex items-center gap-0.5">
                <Building className="w-3 h-3 text-zinc-500" />
                {department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-zinc-500" />
                {location}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={"/profile" as Route}
          className="w-8 h-8 rounded-pill bg-white/70 hover:bg-white flex items-center justify-center text-zinc-800 transition shadow-sm hover:scale-105 active:scale-95"
          title="View full profile"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Bottom Row - ID Code & Salary/Compensation Capsule */}
      <div className="pt-4 mt-4 border-t border-white/40 flex items-center justify-between relative z-10">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-600">Employee ID</span>
          <div className="text-xs font-mono font-bold text-zinc-900">{employeeCode || "VC-EMP-ACTIVE"}</div>
        </div>

        {salaryMonthlyInr ? (
          <div className="px-3 py-1.5 rounded-pill bg-[#261A4E] text-white shadow-md flex items-center gap-2">
            <span className="text-[10px] font-medium text-purple-200">Monthly CTC</span>
            <span className="text-xs font-bold font-mono tracking-tight text-white tabular-nums">
              ₹{salaryMonthlyInr.toLocaleString("en-IN")}
            </span>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-pill bg-white/60 text-zinc-800 text-[11px] font-semibold">
            {employmentType}
          </div>
        )}
      </div>
    </div>
  );
}
