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
  ArrowRight,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  useEmployees,
  useDepartments,
  useDesignations,
  useCreateEmployeeMutation,
  useDebounce,
  formatEmploymentType,
  formatEmploymentStatus
} from "../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PROBATION", label: "Probation" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "NOTICE_PERIOD", label: "Notice Period" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DRAFT", label: "Draft" },
  { value: "INVITED", label: "Invited" }
];

export default function EmployeesListPage() {
  const gate = usePermissionGate(["employees.read"]);
  const canCreate = useHasPermission("employees.create");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [departmentId, setDepartmentId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Employee Form state - explicit choices without synthetic defaults
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formDesigId, setFormDesigId] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [employmentType, setEmploymentType] = useState<"" | "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY">("");

  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: designations = [] } = useDesignations(gate.isAuthorized);
  const { data: allEmployees = [], isLoading, isError, refetch } = useEmployees(
    {
      q: debouncedSearch.trim() || undefined,
      departmentId: departmentId !== "ALL" ? departmentId : undefined,
      status: status !== "ALL" ? status : undefined
    },
    gate.isAuthorized
  );

  const createMutation = useCreateEmployeeMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDeptFilterChange = (deptId: string) => {
    setDepartmentId(deptId);
    setPage(0);
  };

  const handleStatusFilterChange = (s: string) => {
    setStatus(s);
    setPage(0);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      setFormError("Employee Code is required.");
      return;
    }
    if (!fullName.trim()) {
      setFormError("Full Name is required.");
      return;
    }
    if (!email.trim()) {
      setFormError("Work Email is required.");
      return;
    }
    if (!formDeptId) {
      setFormError("Department selection is required.");
      return;
    }
    if (!formDesigId) {
      setFormError("Designation selection is required.");
      return;
    }
    if (!employmentType) {
      setFormError("Employment Type selection is required.");
      return;
    }
    if (!joiningDate) {
      setFormError("Joining Date is required. Please pick a valid date.");
      return;
    }

    try {
      setFormError(null);
      await createMutation.mutateAsync({
        employeeCode: employeeCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        departmentId: formDeptId,
        designationId: formDesigId,
        joiningDate: new Date(joiningDate).toISOString(),
        employmentType: employmentType as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY"
        // Note: salaryType and status are omitted so backend applies its own default policy
      });
      setIsAddOpen(false);
      setEmployeeCode("");
      setFullName("");
      setEmail("");
      setPhone("");
      setFormDeptId("");
      setFormDesigId("");
      setJoiningDate("");
      setEmploymentType("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create employee.");
    }
  };

  // Server-assisted pagination slice
  const totalEmployees = allEmployees.length;
  const paginatedEmployees = allEmployees.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (gate.isLoading || (gate.isAuthorized && isLoading && page === 0)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="h-14 w-full rounded-control bg-surface-muted/60" />
        <div className="space-y-3">
          <SkeletonLoader className="h-16 rounded-card" />
          <SkeletonLoader className="h-16 rounded-card" />
          <SkeletonLoader className="h-16 rounded-card" />
          <SkeletonLoader className="h-16 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Employee Management Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`employees.read`) to access the workforce employee records.
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees & Workforce</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Manage your workforce directory, profile lifecycle, and organizational assignments.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* 2. Search and Multi-Filters */}
      <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, code, email..."
            className="w-full pl-10 pr-4 py-2 rounded-control bg-surface border border-border text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
            <span className="text-[11px] font-semibold text-foreground-secondary">Dept:</span>
            <select
              value={departmentId}
              onChange={(e) => handleDeptFilterChange(e.target.value)}
              className="py-1.5 px-2.5 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-foreground-secondary">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="py-1.5 px-2.5 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Employees Table View */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Failed to load workforce records</p>
          <p className="text-[11px] text-foreground-muted">There was a problem querying employee profiles.</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : paginatedEmployees.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-muted/50 text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4">Employment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {paginatedEmployees.map((emp) => {
                    const deptName = typeof emp.department === "object" && emp.department ? emp.department.name : emp.department || "—";
                    const desigName = typeof emp.designation === "object" && emp.designation ? emp.designation.name : emp.designation || "—";
                    const initial = emp.fullName ? emp.fullName.charAt(0).toUpperCase() : "";

                    return (
                      <tr key={emp.id} className="hover:bg-surface-muted/30 transition group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-panel overflow-hidden bg-primary-soft text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-border-subtle">
                              {emp.profilePhoto || emp.avatarUrl ? (
                                <img src={emp.profilePhoto || emp.avatarUrl || ""} alt={emp.fullName || "Avatar"} className="w-full h-full object-cover" />
                              ) : initial ? (
                                initial
                              ) : (
                                <User className="w-4 h-4 text-foreground-muted" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition">{emp.fullName || "—"}</p>
                              <p className="text-[11px] text-foreground-muted">{emp.email || "—"}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-foreground-secondary">
                          {emp.employeeCode || "—"}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{desigName}</p>
                          <p className="text-[11px] text-foreground-muted">{deptName}</p>
                        </td>

                        <td className="py-3 px-4 text-foreground-secondary">
                          {formatEmploymentType(emp.employmentType)}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-semibold tracking-wide ${
                              emp.status === "ACTIVE"
                                ? "bg-success-soft text-success"
                                : emp.status === "PROBATION"
                                ? "bg-warning-soft text-warning"
                                : emp.status === "NOTICE_PERIOD"
                                ? "bg-danger-soft text-danger"
                                : "bg-surface-muted text-foreground-muted"
                            }`}
                          >
                            {formatEmploymentStatus(emp.status)}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/employees/${emp.id}` as Route}
                            className="px-2.5 py-1 rounded-control bg-surface-muted hover:bg-primary-soft hover:text-primary text-[11px] font-semibold text-foreground-secondary transition inline-flex items-center gap-1"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-foreground-muted">
              Showing <span className="font-semibold text-foreground">{page * PAGE_SIZE + 1}</span> to{" "}
              <span className="font-semibold text-foreground">
                {Math.min((page + 1) * PAGE_SIZE, totalEmployees)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{totalEmployees}</span> employees
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
                disabled={(page + 1) * PAGE_SIZE >= totalEmployees}
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
            {canCreate ? "Get started by adding your first employee to the workspace." : "No records match the active filter criteria."}
          </p>
        </div>
      )}

      {/* 4. Add Employee Modal */}
      {isAddOpen && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface-raised rounded-card border border-border-subtle shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Add New Employee</h3>
                <p className="text-[11px] text-foreground-muted">Create workforce profile record</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-control text-foreground-muted hover:text-foreground hover:bg-surface-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-control bg-danger-soft border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Employee Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="e.g. EMP-010"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Employment Type <span className="text-danger">*</span>
                  </label>
                  <select
                    required
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)}
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Work Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@vcorganics.com"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    required
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Designation <span className="text-danger">*</span>
                  </label>
                  <select
                    required
                    value={formDesigId}
                    onChange={(e) => setFormDesigId(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Designation</option>
                    {designations
                      .filter((d) => !formDeptId || !d.departmentId || d.departmentId === formDeptId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Joining Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-2 rounded-control border border-border-subtle bg-surface text-xs font-semibold text-foreground-secondary hover:bg-surface-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{createMutation.isPending ? "Creating..." : "Save Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
