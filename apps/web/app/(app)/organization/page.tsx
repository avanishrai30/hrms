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
  Send
} from "lucide-react";
import {
  useDepartments,
  useDesignations,
  useBusinessUnits,
  useTeams,
  useCreateDepartmentMutation,
  useCreateDesignationMutation
} from "../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

export default function OrganizationManagementPage() {
  const gate = usePermissionGate(["organization.view", "departments.read"]);

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
      setDesigError("Please fill in name, code, and select a department.");
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
    } catch (err: unknown) {
      setDesigError(err instanceof Error ? err.message : "Failed to create designation");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && deptsQuery.isLoading)) {
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
          <h2 className="text-base font-bold text-foreground">Organization Management Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`organization.view`) to view organization structures.
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
            Configure departments, designations, business units, and reporting hierarchies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={"/org-chart" as Route}
            className="px-3.5 py-2 rounded-control bg-surface-raised border border-border-subtle hover:bg-surface-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5 shadow-sm"
          >
            <Network className="w-4 h-4 text-primary" />
            <span>Org Chart</span>
          </Link>
          <button
            onClick={() => {
              if (activeTab === "departments") setIsDeptModalOpen(true);
              else {
                setDesigDeptId(departments[0]?.id || "");
                setIsDesigModalOpen(true);
              }
            }}
            className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === "departments" ? "Add Department" : "Add Designation"}</span>
          </button>
        </div>
      </div>

      {/* 2. Real Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Departments</p>
            <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums mt-1">
              {deptsQuery.isSuccess ? departments.length : "—"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-primary-soft text-primary flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Designations</p>
            <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums mt-1">
              {desigsQuery.isSuccess ? designations.length : "—"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-primary-soft text-primary flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Business Units</p>
            <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums mt-1">
              {buQuery.isSuccess ? businessUnits.length : "—"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-primary-soft text-primary flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-card bg-surface-raised border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">Teams</p>
            <p className="text-2xl font-extrabold font-mono text-foreground tabular-nums mt-1">
              {teamsQuery.isSuccess ? teams.length : "—"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-pill bg-primary-soft text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "departments"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab("designations")}
          className={`px-4 py-2 rounded-control text-xs font-semibold transition ${
            activeTab === "designations"
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-secondary hover:bg-surface-muted"
          }`}
        >
          Designations
        </button>
      </div>

      {/* 4. Tab Tables */}
      {activeTab === "departments" && (
        <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
          {departments.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-foreground-muted bg-surface-muted/30">
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Code</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-foreground">{d.name}</td>
                    <td className="py-3 px-4 font-mono text-primary font-semibold">{d.code}</td>
                    <td className="py-3 px-4 text-foreground-secondary">{d.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-foreground-muted">
              No departments configured yet.
            </div>
          )}
        </div>
      )}

      {activeTab === "designations" && (
        <div className="rounded-card bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
          {designations.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-foreground-muted bg-surface-muted/30">
                  <th className="py-3 px-4 font-semibold">Designation Title</th>
                  <th className="py-3 px-4 font-semibold">Code</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {designations.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-foreground">{d.name}</td>
                    <td className="py-3 px-4 font-mono text-primary font-semibold">{d.code}</td>
                    <td className="py-3 px-4 text-foreground-secondary">{d.department?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-foreground-muted">
              No designations configured yet.
            </div>
          )}
        </div>
      )}

      {/* 5. Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Add Department</h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="w-7 h-7 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
              {deptError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deptError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-foreground">Department Name *</label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Department Code *</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. ENG"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Description</label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted font-semibold text-foreground-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDeptMutation.isPending}
                  className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {createDeptMutation.isPending ? "Creating..." : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save Department
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Designation Modal */}
      {isDesigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Add Designation</h3>
              <button
                onClick={() => setIsDesigModalOpen(false)}
                className="w-7 h-7 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDesig} className="space-y-4 text-xs">
              {desigError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{desigError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-foreground">Designation Title *</label>
                <input
                  type="text"
                  value={desigName}
                  onChange={(e) => setDesigName(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Code *</label>
                <input
                  type="text"
                  value={desigCode}
                  onChange={(e) => setDesigCode(e.target.value)}
                  placeholder="e.g. SSE"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Department *</label>
                <select
                  value={desigDeptId}
                  onChange={(e) => setDesigDeptId(e.target.value)}
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

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDesigModalOpen(false)}
                  className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted font-semibold text-foreground-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDesigMutation.isPending}
                  className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {createDesigMutation.isPending ? "Creating..." : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save Designation
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
