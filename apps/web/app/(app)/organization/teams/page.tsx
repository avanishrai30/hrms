"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  Plus,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  X,
  Send
} from "lucide-react";
import { useTeams, useDepartments, useCreateTeamMutation } from "../../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../../lib/session-store";
import { SkeletonLoader } from "../../../../components/aiavro/feedback/aiavro-states";

export default function TeamsManagementPage() {
  const gate = usePermissionGate(["organization.view"]);
  const canManage = useHasPermission("organization.manage");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: teams = [], isLoading, isError, refetch } = useTeams(gate.isAuthorized);
  const createMutation = useCreateTeamMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError("Please provide both team name and code.");
      return;
    }
    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        departmentId: departmentId ? departmentId : undefined,
        description: description.trim() ? description.trim() : undefined
      });
      setIsModalOpen(false);
      setName("");
      setCode("");
      setDescription("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create team.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonLoader className="h-32 rounded-card" />
          <SkeletonLoader className="h-32 rounded-card" />
          <SkeletonLoader className="h-32 rounded-card" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle shadow-card space-y-3">
          <ShieldCheck className="w-8 h-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Teams Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`organization.view`) to view team squads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Breadcrumb */}
      <div>
        <Link
          href={"/organization" as Route}
          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground-muted hover:text-primary transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organization</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Teams & Squads</h1>
            <p className="text-xs text-foreground-muted mt-0.5">
              Organize employees into cross-functional project teams and functional squads.
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Teams Grid */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Failed to load teams</p>
          <p className="text-[11px] text-foreground-muted">Unable to retrieve team records.</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const dept = departments.find((d) => d.id === team.departmentId);
            return (
              <div
                key={team.id}
                className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{team.name}</h3>
                    <p className="text-xs font-mono font-semibold text-primary mt-0.5">{team.code}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-pill bg-success-soft text-success text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>
                {dept && (
                  <p className="text-xs text-foreground-muted">
                    Department: <span className="font-semibold text-foreground">{dept.name}</span>
                  </p>
                )}
                {team.description && (
                  <p className="text-xs text-foreground-secondary line-clamp-2">{team.description}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Users className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No teams found</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">
            {canManage ? "Get started by creating your first functional team or squad." : "No teams configured in this workspace."}
          </p>
        </div>
      )}

      {/* 3. Add Team Modal */}
      {isModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface-raised rounded-card border border-border-subtle shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Add Team</h3>
                <p className="text-[11px] text-foreground-muted">Create project or functional squad</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Team Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Core Platform Squad"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Team Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. TM-CORE"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Parent Department (Optional)
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">None (Independent / Cross-functional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities and mission of this team..."
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{createMutation.isPending ? "Creating..." : "Save Team"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
