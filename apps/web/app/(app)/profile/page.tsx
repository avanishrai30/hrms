"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  User,
  Building,
  Briefcase,
  MapPin,
  HeartHandshake,
  AlertCircle,
  QrCode,
  FileText
} from "lucide-react";
import { useProfile } from "../../../lib/queries/use-ess-queries";

export default function EmployeeProfilePage() {
  const [activeTab, setActiveTab] = useState<"work" | "personal" | "emergency">("work");
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 rounded-card bg-surface-muted/60 border border-border-subtle" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-72 rounded-card bg-surface-muted/60 border border-border-subtle" />
          <div className="md:col-span-2 h-72 rounded-card bg-surface-muted/60 border border-border-subtle" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-4">
          <div className="w-12 h-12 rounded-pill bg-danger/10 text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Profile Record Unavailable</h2>
          <p className="text-xs text-foreground-muted">
            Unable to locate an active employee profile linked to your current session.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-control bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition"
          >
            Retry Loading Profile
          </button>
        </div>
      </div>
    );
  }

  const departmentObj = profile.department;
  const departmentName = typeof departmentObj === "string" ? departmentObj : departmentObj?.name;
  const designationObj = profile.designation;
  const designationName =
    typeof designationObj === "string"
      ? designationObj
      : designationObj?.title || designationObj?.name;
  const displayName = profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const initial = (profile.firstName?.charAt(0) || profile.fullName?.charAt(0) || "U").toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner & Identity Presentation */}
      <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-[#E2E0FC] via-[#D3D0F8] to-[#C4C0F4] p-6 sm:p-8 text-zinc-900 shadow-card border border-white/60">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-pill bg-white/40 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 min-w-0">
            <div className="relative w-20 h-20 rounded-panel overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center text-primary shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName || "Profile"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center font-extrabold text-2xl text-primary">
                  {initial}
                </div>
              )}
              {profile.status && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-pill bg-success border-2 border-white" />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight leading-snug truncate">
                  {displayName || "—"}
                </h1>
                {profile.status && (
                  <span className="px-2.5 py-0.5 rounded-pill bg-success/20 text-green-900 text-[11px] font-bold">
                    {profile.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 flex-wrap">
                {designationName && <span>{designationName}</span>}
                {designationName && departmentName && <span>•</span>}
                {departmentName && <span>{departmentName}</span>}
              </div>

              <div className="text-[11px] text-zinc-600 font-mono">
                Code: <span className="font-bold text-zinc-900">{profile.employeeCode || "—"}</span>
                {profile.joiningDate && (
                  <>
                    <span className="mx-2">•</span>
                    Joined: {new Date(profile.joiningDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={"/id-card" as Route}
              className="px-3.5 py-2 rounded-control bg-white/80 hover:bg-white text-zinc-900 text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-primary" />
              <span>Digital ID</span>
            </Link>
            <Link
              href={"/documents" as Route}
              className="px-3.5 py-2 rounded-control bg-[#261A4E] text-white text-xs font-semibold hover:bg-[#1E1440] transition shadow-sm inline-flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-purple-200" />
              <span>Vault</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab("work")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "work"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Work Details
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "personal"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Personal & Address
        </button>
        <button
          onClick={() => setActiveTab("emergency")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "emergency"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Emergency Contacts
        </button>
      </div>

      {/* 3. Tab Content Surfaces */}
      {activeTab === "work" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Position & Organization
            </h3>
            <div className="divide-y divide-border-subtle text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Employee ID</span>
                <span className="font-mono font-semibold text-foreground">{profile.employeeCode || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Department</span>
                <span className="font-semibold text-foreground">{departmentName || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Designation</span>
                <span className="font-semibold text-foreground">{designationName || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Employment Type</span>
                <span className="font-semibold text-foreground">{profile.employmentType?.replace(/_/g, " ") || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Reporting Manager</span>
                <span className="font-semibold text-foreground">{profile.managerName || "—"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Workplace Context
            </h3>
            <div className="divide-y divide-border-subtle text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Work Email</span>
                <span className="font-mono font-semibold text-foreground">{profile.workEmail || profile.email || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Business Unit</span>
                <span className="font-semibold text-foreground">{profile.businessUnit || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Team</span>
                <span className="font-semibold text-foreground">{profile.team || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Region</span>
                <span className="font-semibold text-foreground">{profile.region || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Joining Date</span>
                <span className="font-semibold text-foreground">
                  {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "personal" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Contact Information
            </h3>
            <div className="divide-y divide-border-subtle text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Personal Email</span>
                <span className="font-mono font-semibold text-foreground">{profile.email || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Phone Number</span>
                <span className="font-mono font-semibold text-foreground">{profile.phone || "—"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Address Records
            </h3>
            <div className="divide-y divide-border-subtle text-xs">
              <div className="py-2.5">
                <span className="text-foreground-muted block mb-1">Current Address</span>
                <p className="font-medium text-foreground">
                  {profile.currentAddress?.street
                    ? `${profile.currentAddress.street}, ${profile.currentAddress.city || ""}, ${profile.currentAddress.state || ""} ${profile.currentAddress.postalCode || ""}`
                    : "—"}
                </p>
              </div>
              <div className="py-2.5">
                <span className="text-foreground-muted block mb-1">Permanent Address</span>
                <p className="font-medium text-foreground">
                  {profile.permanentAddress?.street
                    ? `${profile.permanentAddress.street}, ${profile.permanentAddress.city || ""}, ${profile.permanentAddress.state || ""} ${profile.permanentAddress.postalCode || ""}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "emergency" && (
        <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-primary" />
            Emergency Contact Information
          </h3>
          <div className="divide-y divide-border-subtle text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-foreground-muted">Contact Name</span>
              <span className="font-semibold text-foreground">{profile.emergencyContact?.name || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-foreground-muted">Relationship</span>
              <span className="font-semibold text-foreground">{profile.emergencyContact?.relationship || "—"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-foreground-muted">Emergency Phone</span>
              <span className="font-mono font-semibold text-foreground">{profile.emergencyContact?.phone || "—"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
