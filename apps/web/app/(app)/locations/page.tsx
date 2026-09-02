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
import { usePermissionGate } from "../../../lib/session-store";
import { SkeletonLoader } from "../../../components/aiavro/feedback/aiavro-states";

const LOCATION_TYPES = ["OFFICE", "FACTORY", "WAREHOUSE", "RETAIL_OUTLET", "DISTRIBUTION_CENTER", "CUSTOM"];

export default function WorkplaceLocationsPage() {
  const gate = usePermissionGate(["location.view"]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("OFFICE");
  const [description, setDescription] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(200);
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
        radiusMeters: Number(radiusMeters) || 200,
        latitude: 12.9716,
        longitude: 77.5946,
        maxAccuracyMeters: 50,
        isActive: true
      });
      setIsModalOpen(false);
      setName("");
      setCode("");
      setDescription("");
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

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-control bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* 2. Locations Cards */}
      {isError ? (
        <div className="p-8 rounded-card bg-surface-raised border border-border-subtle text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs font-semibold text-foreground">Locations unavailable</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 rounded-control bg-primary-soft text-primary text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="rounded-card bg-surface-raised border border-border-subtle p-5 shadow-card hover:border-primary/30 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-panel bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">{loc.name}</h3>
                      <p className="text-[10px] text-foreground-muted font-mono">{loc.code}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-pill text-[9px] font-bold ${
                      loc.isActive ? "bg-success/20 text-success" : "bg-surface-muted text-foreground-muted"
                    }`}
                  >
                    {loc.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                {loc.description && (
                  <p className="text-xs text-foreground-secondary line-clamp-2">
                    {loc.description}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-[10px] text-foreground-muted font-mono">
                <span>Radius: {loc.radiusMeters || 200}m</span>
                <span className="uppercase">{loc.type || "OFFICE"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-card bg-surface-raised border border-border-subtle flex flex-col items-center justify-center text-foreground-muted">
          <MapPin className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No workplace locations found</p>
          <p className="text-[11px] text-foreground-muted mt-0.5">Add a new physical location to configure attendance geofencing.</p>
        </div>
      )}

      {/* 3. Add Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-panel bg-surface-raised border border-border-subtle p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-foreground">Add Workplace Location</h3>
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
                <label className="font-bold text-foreground">Location Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bangalore Tech Hub"
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Location Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. BLR-HQ"
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Facility Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Geofence Radius (m)</label>
                <input
                  type="number"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  min={50}
                  max={5000}
                  className="w-full px-3 py-2 rounded-control bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      Save Location
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
