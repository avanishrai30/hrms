"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  Plus,
  Network,
  Users,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  X,
  Send,
  Building
} from "lucide-react";
import {
  useDepartments,
  useDesignations,
  useBusinessUnits,
  useTeams,
  useCreateDepartmentMutation,
  useCreateDesignationMutation
} from "../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

export default function OrganizationManagementPage() {
  const gate = usePermissionGate(["organization.view", "departments.read"]);
  const canCreateDept = useHasPermission("departments.create");
  const canCreateDesig = useHasPermission("designations.create");

  const [activeTab, setActiveTab] = useState<"departments" | "designations">("departments");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);

  // Department Form
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptError, setDeptError] = useState<string | null>(null);

  // Designation Form
  const [desigName, setDesigName] = useState("");
  const [desigCode, setDesigCode] = useState("");
  const [desigDeptId, setDesigDeptId] = useState("");
  const [desigError, setDesigError] = useState<string | null>(null);

  const deptsQuery = useDepartments(gate.isAuthorized);
  const desigsQuery = useDesignations(gate.isAuthorized);
  const buQuery = useBusinessUnits(gate.isAuthorized);
  const teamsQuery = useTeams(gate.isAuthorized);

  const createDeptMutation = useCreateDepartmentMutation();
  const createDesigMutation = useCreateDesignationMutation();

  const departments = deptsQuery.data ?? [];
  const designations = desigsQuery.data ?? [];
  const businessUnits = buQuery.data ?? [];
  const teams = teamsQuery.data ?? [];

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      setDeptError("Please provide both name and code.");
      return;
    }
    try {
      setDeptError(null);
      await createDeptMutation.mutateAsync({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        description: deptDesc.trim() ? deptDesc.trim() : undefined
      });
      setIsDeptModalOpen(false);
      setDeptName("");
      setDeptCode("");
      setDeptDesc("");
    } catch (err: unknown) {
      setDeptError(err instanceof Error ? err.message : "Failed to create department");
    }
  };

  const handleCreateDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigName.trim() || !desigCode.trim() || !desigDeptId) {
      setDesigError("Please provide designation name, code, and department.");
      return;
    }
    try {
      setDesigError(null);
      await createDesigMutation.mutateAsync({
        name: desigName.trim(),
        code: desigCode.trim().toUpperCase(),
        departmentId: desigDeptId
      });
      setIsDesigModalOpen(false);
      setDesigName("");
      setDesigCode("");
      setDesigDeptId("");
    } catch (err: unknown) {
      setDesigError(err instanceof Error ? err.message : "Failed to create designation");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && (deptsQuery.isLoading || desigsQuery.isLoading))) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader className="h-24 rounded-card" />
          <SkeletonLoader className="h-24 rounded-card" />
          <SkeletonLoader className="h-24 rounded-card" />
          <SkeletonLoader className="h-24 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Organization Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`organization.view` or `departments.read`) to view organizational structures.
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization Architecture</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Structure your departments, designations, business units, and team divisions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={"/org-chart" as Route}
            className="px-3.5 py-2 rounded-control bg-surface-raised border border-border-subtle hover:bg-surface-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5 shadow-sm"
          >
            <Network className="w-4 h-4 text-primary" />
            <span>Org Chart</span>
          </Link>

          {activeTab === "departments" && canCreateDept && (
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="px-3.5 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}

          {activeTab === "designations" && canCreateDesig && (
            <button
              onClick={() => setIsDesigModalOpen(true)}
              className="px-3.5 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Designation</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Departments</span>
            <div className="p-2 rounded-control bg-primary-soft text-primary">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">{departments.length}</p>
        </div>

        <div className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Designations</span>
            <div className="p-2 rounded-control bg-primary-soft text-primary">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">{designations.length}</p>
        </div>

        <Link
          href={"/organization/business-units" as Route}
          className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-2 hover:border-primary/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted group-hover:text-primary transition">Business Units</span>
            <div className="p-2 rounded-control bg-primary-soft text-primary">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">{businessUnits.length}</p>
        </Link>

        <Link
          href={"/organization/teams" as Route}
          className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-2 hover:border-primary/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted group-hover:text-primary transition">Teams & Squads</span>
            <div className="p-2 rounded-control bg-primary-soft text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">{teams.length}</p>
        </Link>
      </div>

      {/* 3. Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "departments"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab("designations")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "designations"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Designations ({designations.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === "departments" ? (
        departments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{dept.name}</h3>
                    <p className="text-xs font-mono font-semibold text-primary mt-0.5">{dept.code}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-pill bg-success-soft text-success text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>
                {dept.description && (
                  <p className="text-xs text-foreground-secondary line-clamp-2">{dept.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
            <Building2 className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No departments configured</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              {canCreateDept ? "Create your organization's first department." : "No departments currently exist in this tenant."}
            </p>
          </div>
        )
      ) : (
        designations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {designations.map((desig) => {
              const deptObj = departments.find((d) => d.id === desig.departmentId);
              return (
                <div
                  key={desig.id}
                  className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{desig.name}</h3>
                      <p className="text-xs font-mono font-semibold text-primary mt-0.5">{desig.code}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-pill bg-success-soft text-success text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border-subtle text-xs text-foreground-muted">
                    Department: <span className="font-semibold text-foreground">{deptObj?.name || desig.department?.name || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
            <Briefcase className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No designations configured</p>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              {canCreateDesig ? "Create designations linked to your departments." : "No designations currently exist in this tenant."}
            </p>
          </div>
        )
      )}

      {/* 5. Add Department Modal */}
      {isDeptModalOpen && canCreateDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface-raised rounded-card border border-border-subtle shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Add Department</h3>
                <p className="text-[11px] text-foreground-muted">Create a business functional unit</p>
              </div>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1 rounded-control text-foreground-muted hover:text-foreground hover:bg-surface-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="p-5 space-y-4">
              {deptError && (
                <div className="p-3 rounded-control bg-danger-soft border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deptError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Department Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Department Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. ENG"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Brief description of department scope..."
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3.5 py-2 rounded-control border border-border-subtle bg-surface text-xs font-semibold text-foreground-secondary hover:bg-surface-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDeptMutation.isPending}
                  className="px-4 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{createDeptMutation.isPending ? "Creating..." : "Save Department"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Designation Modal */}
      {isDesigModalOpen && canCreateDesig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface-raised rounded-card border border-border-subtle shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Add Designation</h3>
                <p className="text-[11px] text-foreground-muted">Create a job title role definition</p>
              </div>
              <button
                onClick={() => setIsDesigModalOpen(false)}
                className="p-1 rounded-control text-foreground-muted hover:text-foreground hover:bg-surface-muted transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDesig} className="p-5 space-y-4">
              {desigError && (
                <div className="p-3 rounded-control bg-danger-soft border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{desigError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={desigDeptId}
                  onChange={(e) => setDesigDeptId(e.target.value)}
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
                  Designation Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={desigName}
                  onChange={(e) => setDesigName(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Designation Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={desigCode}
                  onChange={(e) => setDesigCode(e.target.value)}
                  placeholder="e.g. SSE"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDesigModalOpen(false)}
                  className="px-3.5 py-2 rounded-control border border-border-subtle bg-surface text-xs font-semibold text-foreground-secondary hover:bg-surface-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDesigMutation.isPending}
                  className="px-4 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{createDesigMutation.isPending ? "Creating..." : "Save Designation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
