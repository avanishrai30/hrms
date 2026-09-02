"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Search,
  Mail,
  MapPin,
  Building,
  User,
  Users,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useDirectory, useDepartments, useDebounce } from "../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const PAGE_SIZE = 24;

export default function OrganizationDirectoryPage() {
  const gate = usePermissionGate(["directory.view", "employees.read"]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: employees = [], isLoading, isError, refetch } = useDirectory(
    {
      search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      departmentId: selectedDeptId !== "ALL" ? selectedDeptId : undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE
    },
    gate.isAuthorized
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setPage(0);
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading && page === 0)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="h-12 w-full rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <SkeletonLoader className="h-44 rounded-card" />
          <SkeletonLoader className="h-44 rounded-card" />
          <SkeletonLoader className="h-44 rounded-card" />
          <SkeletonLoader className="h-44 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Directory Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`directory.view`) to access the employee directory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization Directory</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Discover colleagues, explore departments, and look up workplace contacts.
          </p>
        </div>

        <Link
          href={"/org-chart" as Route}
          className="px-3.5 py-2 rounded-control bg-surface-raised border border-border-subtle hover:bg-surface-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Building className="w-4 h-4 text-primary" />
          <span>View Org Chart</span>
        </Link>
      </div>

      {/* 2. Search & Department Filters */}
      <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, employee code, role, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-control bg-surface border border-border text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        {departments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <button
              type="button"
              onClick={() => handleDeptChange("ALL")}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition ${
                selectedDeptId === "ALL"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface border border-border-subtle text-foreground-secondary hover:bg-surface-muted"
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleDeptChange(d.id)}
                className={`px-3 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition ${
                  selectedDeptId === d.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface border border-border-subtle text-foreground-secondary hover:bg-surface-muted"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Employee Cards Grid */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Directory unavailable</p>
          <p className="text-[11px] text-foreground-muted">Unable to retrieve employee directory records.</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : employees.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((emp) => {
              const initial = emp.fullName ? emp.fullName.charAt(0).toUpperCase() : "";
              return (
                <div
                  key={emp.id}
                  className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card hover:border-primary/40 transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-panel overflow-hidden bg-primary-soft text-primary font-bold flex items-center justify-center text-base shrink-0 border border-border-subtle">
                        {emp.profilePhoto ? (
                          <img src={emp.profilePhoto} alt={emp.fullName || "Avatar"} className="w-full h-full object-cover" />
                        ) : initial ? (
                          initial
                        ) : (
                          <User className="w-5 h-5 text-foreground-muted" />
                        )}
                      </div>
                      {emp.employeeCode && (
                        <span className="px-2 py-0.5 rounded-pill bg-surface-muted text-foreground-muted text-[10px] font-mono font-semibold">
                          {emp.employeeCode}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition line-clamp-1">
                        {emp.fullName || "—"}
                      </h3>
                      <p className="text-xs text-foreground-secondary font-medium mt-0.5 line-clamp-1">
                        {emp.designation || "—"}
                      </p>
                      <p className="text-[11px] text-foreground-muted font-medium mt-0.5">
                        {emp.department || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border-subtle space-y-1.5 text-xs">
                    {emp.email && (
                      <a
                        href={`mailto:${emp.email}`}
                        className="flex items-center gap-1.5 text-[11px] text-foreground-muted hover:text-primary transition truncate"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </a>
                    )}
                    {emp.region && (
                      <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{emp.region}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link
                        href={`/employees/${emp.id}` as Route}
                        className="w-full py-1.5 rounded-control bg-surface-muted hover:bg-primary-soft hover:text-primary text-[11px] font-semibold text-foreground-secondary transition flex items-center justify-center gap-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <p className="text-xs text-foreground-muted">
              Showing page <span className="font-semibold text-foreground">{page + 1}</span> (up to {PAGE_SIZE} per page)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-control border border-border-subtle bg-surface text-xs font-semibold text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                disabled={employees.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-control border border-border-subtle bg-surface text-xs font-semibold text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Users className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No employees found</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">
            Try adjusting your search query or department filter.
          </p>
        </div>
      )}
    </div>
  );
}
