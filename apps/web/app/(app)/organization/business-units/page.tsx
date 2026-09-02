"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Network,
  Plus,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  X,
  Send
} from "lucide-react";
import { useBusinessUnits, useCreateBusinessUnitMutation } from "../../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../../lib/session-store";
import { SkeletonLoader } from "../../../../components/aiavro/feedback/aiavro-states";

export default function BusinessUnitsPage() {
  const gate = usePermissionGate(["organization.view"]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: units = [], isLoading, isError, refetch } = useBusinessUnits(gate.isAuthorized);
  const createMutation = useCreateBusinessUnitMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError("Please provide both name and code.");
      return;
    }
    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() ? description.trim() : undefined
      });
      setIsModalOpen(false);
      setName("");
      setCode("");
      setDescription("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create business unit.");
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
          <h2 className="text-base font-bold text-foreground">Business Units Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`organization.view`) to access business units.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={"/organization" as Route}
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground-muted hover:text-primary transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Organization</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Units</h1>
          <p className="text-xs text-foreground-muted">
            Strategic operational divisions and corporate business units.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Business Unit</span>
        </button>
      </div>

      {/* 2. Units Grid */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Business units unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : units.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card hover:border-primary/30 transition space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground">{unit.name}</h3>
                  <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary text-[10px] font-mono font-bold">
                    {unit.code}
                  </span>
                </div>
                <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">
                  {unit.description || "No description provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Network className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No business units found</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Add business units to group departments and regions.</p>
        </div>
      )}

      {/* 3. Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Add Business Unit</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-pill hover:bg-surface-muted flex items-center justify-center text-foreground-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-foreground">Unit Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Products & Technology"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. PROD-TECH"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details..."
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-control bg-surface-muted hover:bg-muted font-semibold text-foreground-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white font-bold transition shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Saving..." : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save Unit
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
