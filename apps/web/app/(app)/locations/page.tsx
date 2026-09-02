"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Building,
  ShieldCheck,
  AlertCircle,
  X,
  Send
} from "lucide-react";
import { useLocations, useCreateLocationMutation } from "../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const LOCATION_TYPES = ["OFFICE", "FACTORY", "WAREHOUSE", "RETAIL_OUTLET", "DISTRIBUTION_CENTER", "CUSTOM"] as const;

export default function WorkplaceLocationsPage() {
  const gate = usePermissionGate(["location.view"]);
  const canCreate = useHasPermission("location.create");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"FACTORY" | "OFFICE" | "WAREHOUSE" | "RETAIL_OUTLET" | "DISTRIBUTION_CENTER" | "CUSTOM">("OFFICE");
  const [description, setDescription] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: locations = [], isLoading, isError, refetch } = useLocations(undefined, gate.isAuthorized);
  const createMutation = useCreateLocationMutation();

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
        type,
        description: description.trim() || undefined,
        radiusMeters: Number(radiusMeters) || 100,
        latitude: 12.9716,
        longitude: 77.5946,
        maxAccuracyMeters: 100,
        isActive: true
      });
      setIsModalOpen(false);
      setName("");
      setCode("");
      setDescription("");
      setRadiusMeters(100);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create location.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-control bg-surface-muted/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <h2 className="text-base font-bold text-foreground">Locations Access Restricted</h2>
          <p className="text-xs text-foreground-muted">
            You do not have permission (`location.view`) to access workplace location records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workplace Locations</h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Geofenced physical facilities, office hubs, and manufacturing sites.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-control bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        )}
      </div>

      {/* 2. Locations Grid */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Failed to load locations</p>
          <p className="text-[11px] text-foreground-muted">Unable to retrieve workplace location records.</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{loc.name}</h3>
                  <p className="text-xs font-mono font-semibold text-primary mt-0.5">{loc.code}</p>
                </div>
                <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary text-[10px] font-bold">
                  {loc.type || "OFFICE"}
                </span>
              </div>

              {loc.description && (
                <p className="text-xs text-foreground-secondary line-clamp-2">{loc.description}</p>
              )}

              <div className="pt-2 border-t border-border-subtle text-xs text-foreground-muted flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Geofence Radius:</span>
                </span>
                <span className="font-semibold text-foreground">{loc.radiusMeters || 100}m</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <Building className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No workplace locations found</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">
            {canCreate ? "Configure your company's physical office or plant locations." : "No physical facilities configured in this workspace."}
          </p>
        </div>
      )}

      {/* 3. Add Location Modal */}
      {isModalOpen && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface-raised rounded-card border border-border-subtle shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Add Workplace Location</h3>
                <p className="text-[11px] text-foreground-muted">Configure facility geofence</p>
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
                  Location Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bangalore Tech Hub"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Location Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. BLR-HQ"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                    Facility Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Geofence Radius (Meters)
                </label>
                <input
                  type="number"
                  min={20}
                  max={5000}
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-secondary mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Address or building details..."
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
                  <span>{createMutation.isPending ? "Creating..." : "Save Location"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
