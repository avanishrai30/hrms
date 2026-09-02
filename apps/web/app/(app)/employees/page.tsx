"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Search,
  Plus,
  Filter,
  Users,
  ShieldCheck,
  AlertCircle,
  X,
  Send,
  ArrowRight
} from "lucide-react";
import {
  useEmployees,
  useDepartments,
  useDesignations,
  useCreateEmployeeMutation
} from "../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const STATUS_FILTERS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PROBATION", label: "Probation" },
  { value: "NOTICE_PERIOD", label: "Notice Period" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DRAFT", label: "Draft" }
];

export default function EmployeesListPage() {
  const gate = usePermissionGate(["employees.read"]);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Employee Form state
  const [employeeCode, setEmployeeCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formDesigId, setFormDesigId] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: designations = [] } = useDesignations(gate.isAuthorized);
  const { data: employees = [], isLoading, isError, refetch } = useEmployees(
    {
      search: search.trim() || undefined,
      departmentId: departmentId !== "ALL" ? departmentId : undefined,
      status: status !== "ALL" ? status : undefined
    },
    gate.isAuthorized
  );

  const createMutation = useCreateEmployeeMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !formDeptId || !formDesigId) {
      setFormError("Please fill in all required fields (First Name, Email, Department, Designation).");
      return;
    }

    try {
      setFormError(null);
      await createMutation.mutateAsync({
        employeeCode: employeeCode.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim().toLowerCase(),
        departmentId: formDeptId,
        designationId: formDesigId,
        joiningDate: joiningDate ? new Date(joiningDate).toISOString() : new Date().toISOString()
      });
      setIsAddOpen(false);
      setEmployeeCode("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setJoiningDate("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create employee.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="h-14 w-full rounded-control bg-surface-muted/60" />
        <div className="space-y-3">
          <SkeletonLoader className="h-16 w-full rounded-card" />
          <SkeletonLoader className="h-16 w-full rounded-card" />
          <SkeletonLoader className="h-16 w-full rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Employee Operations Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`employees.read`) to access the workforce operations list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workforce Operations</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Manage employee lifecycle, organizational assignments, and employment profiles.
          </p>
        </div>

        <button
          onClick={() => {
            setFormDeptId(departments[0]?.id || "");
            setFormDesigId(designations[0]?.id || "");
            setIsAddOpen(true);
          }}
          className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Employee</span>
        </button>
      </div>

      {/* 2. Search & Multi-Filter Controls */}
      <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, email..."
            className="w-full pl-10 pr-4 py-2 rounded-control bg-surface border border-border text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filters:</span>
          </div>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Employees Table (Desktop) / Cards (Mobile) */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Employees service unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : employees.length > 0 ? (
        <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-foreground-muted bg-surface-muted/30">
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Designation</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {employees.map((emp) => {
                  const initial = (emp.fullName || "U").charAt(0).toUpperCase();
                  const deptName = typeof emp.department === "string" ? emp.department : emp.department?.name || "—";
                  const desigName = typeof emp.designation === "string" ? emp.designation : emp.designation?.name || "—";

                  return (
                    <tr key={emp.id} className="hover:bg-surface-muted/40 transition group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-panel overflow-hidden bg-primary-soft text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-border-subtle">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                            ) : (
                              initial
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/employees/${emp.id}` as Route}
                              className="font-bold text-foreground hover:text-primary transition"
                            >
                              {emp.fullName}
                            </Link>
                            <p className="text-[10px] text-foreground-muted font-mono">
                              {emp.employeeCode || emp.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground-secondary">{desigName}</td>
                      <td className="py-3 px-4 font-medium text-foreground-secondary">{deptName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-pill text-[10px] font-bold ${
                            emp.status === "ACTIVE"
                              ? "bg-success/20 text-success"
                              : emp.status === "PROBATION"
                              ? "bg-primary-soft text-primary"
                              : emp.status === "NOTICE_PERIOD"
                              ? "bg-warning/20 text-warning"
                              : "bg-surface-muted text-foreground-muted"
                          }`}
                        >
                          {emp.status || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-foreground-muted">
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/employees/${emp.id}` as Route}
                          className="p-1.5 rounded-control hover:bg-surface-muted text-foreground-muted hover:text-primary transition inline-flex items-center"
                          title="View Profile"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border-subtle p-2">
            {employees.map((emp) => {
              const initial = (emp.fullName || "U").charAt(0).toUpperCase();
              const deptName = typeof emp.department === "string" ? emp.department : emp.department?.name || "—";
              const desigName = typeof emp.designation === "string" ? emp.designation : emp.designation?.name || "—";

              return (
                <div key={emp.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-panel bg-primary-soft text-primary font-bold flex items-center justify-center text-xs shrink-0">
                        {initial}
                      </div>
                      <div>
                        <Link
                          href={`/employees/${emp.id}` as Route}
                          className="font-bold text-xs text-foreground hover:text-primary"
                        >
                          {emp.fullName}
                        </Link>
                        <p className="text-[10px] text-foreground-muted">{emp.employeeCode}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-pill bg-surface-muted text-foreground-muted text-[10px] font-bold">
                      {emp.status || "—"}
                    </span>
                  </div>
                  <div className="text-[11px] text-foreground-secondary flex justify-between pt-1">
                    <span>{desigName}</span>
                    <span className="text-foreground-muted">{deptName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Users className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No employees found</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Try clearing filters or add a new employee profile.</p>
        </div>
      )}

      {/* 4. Add Employee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Create Employee Profile</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-7 h-7 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Work Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@company.com"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Employee Code</label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="e.g. VC-0102"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Department *</label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Designation *</label>
                  <select
                    value={formDesigId}
                    onChange={(e) => setFormDesigId(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted font-semibold text-foreground-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Create Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
