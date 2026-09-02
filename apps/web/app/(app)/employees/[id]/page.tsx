"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  User,
  Briefcase,
  Building,
  FileText,
  Clock,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Lock
} from "lucide-react";
import {
  useEmployee,
  useEmployeeTimeline,
  useEmployeeDocuments,
  formatEmploymentType,
  formatEmploymentStatus
} from "../../../../lib/queries/use-people-queries";

import { usePermissionGate, useHasPermission } from "../../../../lib/session-store";

export default function EmployeeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const gate = usePermissionGate(["employees.read"]);
  const canReadDocuments = useHasPermission(["documents.read", "documents.view"]);
  const [activeTab, setActiveTab] = useState<"overview" | "org" | "documents" | "timeline">("overview");

  const { data: employee, isLoading, isError, refetch } = useEmployee(id, gate.isAuthorized);
  const { data: timeline = [] } = useEmployeeTimeline(id, gate.isAuthorized && activeTab === "timeline");
  const { data: documents = [] } = useEmployeeDocuments(id, gate.isAuthorized && canReadDocuments && activeTab === "documents");

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded-control bg-surface-muted/60" />
        <div className="h-44 rounded-card bg-surface-muted/60" />
        <div className="h-64 rounded-card bg-surface-muted/60" />
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Employee Profile Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`employees.read`) to access this employee profile.
          </p>
        </div>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-foreground">Employee Record Unavailable</h2>
          <p className="text-xs text-foreground-muted">
            Unable to retrieve the requested employee record.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href={"/employees" as Route}
              className="px-3 py-1.5 rounded-control bg-surface-muted hover:bg-muted text-xs font-semibold text-foreground-secondary"
            >
              Back to List
            </Link>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 rounded-control bg-primary text-white text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const deptName = typeof employee.department === "string" ? employee.department : employee.department?.name || "—";
  const desigName = typeof employee.designation === "string" ? employee.designation : employee.designation?.name || "—";
  const initial = employee.fullName ? employee.fullName.charAt(0).toUpperCase() : "";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Back Navigation */}
      <div>
        <Link
          href={"/employees" as Route}
          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground-muted hover:text-primary transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workforce Operations</span>
        </Link>
      </div>

      {/* 2. Employee Identity Hero Card */}
      <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-[#E2E0FC] via-[#D3D0F8] to-[#C4C0F4] p-6 sm:p-8 text-zinc-900 shadow-card border border-white/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 min-w-0">
            <div className="relative w-20 h-20 rounded-panel overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center text-primary font-black text-2xl shrink-0">
              {employee.avatarUrl || employee.profilePhoto ? (
                <img src={employee.avatarUrl || employee.profilePhoto || ""} alt={employee.fullName || "Avatar"} className="w-full h-full object-cover" />
              ) : initial ? (
                initial
              ) : (
                <User className="w-8 h-8 text-foreground-muted" />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight leading-snug truncate">
                  {employee.fullName || "—"}
                </h1>
                {employee.status && (
                  <span className="px-2.5 py-0.5 rounded-pill bg-success/20 text-green-900 text-[11px] font-bold">
                    {formatEmploymentStatus(employee.status)}
                  </span>
                )}

              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 flex-wrap">
                <span>{desigName}</span>
                <span>•</span>
                <span>{deptName}</span>
              </div>

              <div className="text-[11px] text-zinc-600 font-mono">
                Code: <span className="font-bold text-zinc-900">{employee.employeeCode || "—"}</span>
                {employee.joiningDate && (
                  <>
                    <span className="mx-2">•</span>
                    Joined: {new Date(employee.joiningDate).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "overview"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("org")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "org"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Organization & Reporting
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "documents"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "timeline"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Timeline
        </button>
      </div>

      {/* 4. Tab Surfaces */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Work & Position
            </h3>
            <div className="divide-y divide-border-subtle text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Employee Code</span>
                <span className="font-mono font-semibold text-foreground">{employee.employeeCode || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Department</span>
                <span className="font-semibold text-foreground">{deptName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Designation</span>
                <span className="font-semibold text-foreground">{desigName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Employment Type</span>
                <span className="font-semibold text-foreground">
                  {formatEmploymentType(employee.employmentType)}
                </span>

              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Reporting Manager</span>
                <span className="font-semibold text-foreground">{employee.managerName || "—"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Contact & Profile
            </h3>
            <div className="divide-y divide-border-subtle text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Work Email</span>
                <span className="font-mono font-semibold text-foreground">{employee.email || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Phone Number</span>
                <span className="font-mono font-semibold text-foreground">{employee.phone || "—"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-foreground-muted">Joined Date</span>
                <span className="font-semibold text-foreground">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "org" && (
        <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Reporting Hierarchy
          </h3>
          <div className="divide-y divide-border-subtle text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-foreground-muted">Direct Manager</span>
              <span className="font-semibold text-foreground">{employee.managerName || "Not assigned"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-foreground-muted">Department</span>
              <span className="font-semibold text-foreground">{deptName}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Employee Document Records
          </h3>
          {!canReadDocuments ? (
            <div className="py-8 text-center text-xs text-foreground-muted space-y-2">
              <Lock className="w-6 h-6 text-warning mx-auto" />
              <p className="font-semibold text-foreground">Document Access Restricted</p>
              <p>You require `documents.read` permission to view confidential employee document records.</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {documents.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{doc.title || doc.fileName || "—"}</p>
                    <p className="text-[10px] text-foreground-muted font-mono">{doc.documentType || "—"}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-pill bg-surface-muted text-foreground-muted text-[10px] font-bold">
                    {doc.isVerified ? "VERIFIED" : "PENDING"}
                  </span>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-foreground-muted">
              No document records attached to this employee profile.
            </div>
          )}
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Lifecycle Events & History
          </h3>
          {timeline.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
              {timeline.map((ev) => (
                <div key={ev.id} className="relative text-xs space-y-0.5">
                  <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-pill bg-primary border-2 border-surface" />
                  <p className="font-bold text-foreground">{ev.title || "—"}</p>
                  <p className="text-foreground-secondary">{ev.description || "—"}</p>
                  <p className="text-[10px] text-foreground-muted font-mono">
                    {ev.date ? new Date(ev.date).toLocaleDateString() : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-foreground-muted">
              No lifecycle history events recorded.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
