"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface VerificationItem {
  id: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  distanceMeters: number | null;
  status: string;
  reason: string;
  isManualOverride: boolean;
  overrideReason: string | null;
  createdAt: string;
  employee?: {
    fullName: string;
    employeeCode: string;
  };
  location?: {
    name: string;
    code: string;
  } | null;
  overrideBy?: {
    email: string;
  } | null;
}

interface VerificationListResponse {
  verifications: VerificationItem[];
  total: number;
  page: number;
  limit: number;
}

interface LocationOption {
  id: string;
  name: string;
  code: string;
}

interface EmployeeOption {
  id: string;
  employeeCode: string;
  fullName: string;
}

export default function LocationAuditPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [page, setPage] = useState(1);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  // Manual Override Form State
  const [overrideEmpId, setOverrideEmpId] = useState("");
  const [overrideLocId, setOverrideLocId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const queryParams = new URLSearchParams();
  if (selectedStatus) queryParams.set("status", selectedStatus);
  if (selectedLocation) queryParams.set("locationId", selectedLocation);
  queryParams.set("page", String(page));
  queryParams.set("limit", "25");

  const verificationsQuery = useQuery({
    queryKey: ["location-verifications", queryParams.toString()],
    queryFn: () => apiRequest<VerificationListResponse>(`/locations/audit/verifications?${queryParams.toString()}`)
  });

  const locationsQuery = useQuery({
    queryKey: ["locations-select"],
    queryFn: () => apiRequest<{ locations: LocationOption[] }>("/locations?limit=100")
  });

  const employeesQuery = useQuery({
    queryKey: ["employees-select"],
    queryFn: () => apiRequest<{ employees: EmployeeOption[] }>("/employees?limit=100")
  });

  const overrideMutation = useMutation({
    mutationFn: () =>
      apiRequest("/locations/audit/override", {
        method: "POST",
        body: JSON.stringify({
          employeeId: overrideEmpId,
          locationId: overrideLocId,
          reason: overrideReason
        })
      }),
    onSuccess: () => {
      setOverrideModalOpen(false);
      setOverrideReason("");
      queryClient.invalidateQueries({ queryKey: ["location-verifications"] });
    }
  });

  const getStatusTone = (s: string): "neutral" | "success" | "warning" | "danger" => {
    if (s === "VERIFIED") return "success";
    if (s === "MANUAL_OVERRIDE") return "warning";
    if (s === "OUTSIDE_RADIUS" || s === "ACCURACY_TOO_LOW") return "danger";
    return "neutral";
  };

  const verifications = verificationsQuery.data?.verifications ?? [];
  const totalVerified = verifications.filter((v) => v.status === "VERIFIED").length;
  const totalFailed = verifications.filter((v) => v.status === "OUTSIDE_RADIUS" || v.status === "ACCURACY_TOO_LOW").length;
  const totalOverrides = verifications.filter((v) => v.status === "MANUAL_OVERRIDE").length;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/locations" as Route} className="text-sm font-medium text-zinc-500 hover:text-zinc-950">
              ← Locations
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">Location & Geofence Audit</h1>
          <p className="text-sm text-zinc-600">Audit GPS verification logs, distance anomalies, and manual overrides.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOverrideModalOpen(true)}>
            Authorize Manual Override
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Total Verification Attempts</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950">{verificationsQuery.data?.total ?? 0}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-emerald-700">Verified Inside Radius</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{totalVerified}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-rose-700">Perimeter & Accuracy Failures</p>
          <p className="mt-1 text-2xl font-bold text-rose-800">{totalFailed}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-amber-700">Authorized Overrides</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{totalOverrides}</p>
        </Panel>
      </section>

      {/* Filter Bar */}
      <Panel className="grid gap-4 sm:grid-cols-3">
        <Field label="Verification Status">
          <select
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="OUTSIDE_RADIUS">Outside Radius</option>
            <option value="ACCURACY_TOO_LOW">Accuracy Too Low</option>
            <option value="NO_ASSIGNED_LOCATION">No Assigned Location</option>
            <option value="LOCATION_DISABLED">Location Disabled</option>
            <option value="MANUAL_OVERRIDE">Manual Override</option>
          </select>
        </Field>

        <Field label="Target Workplace">
          <select
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
            value={selectedLocation}
            onChange={(e) => { setSelectedLocation(e.target.value); setPage(1); }}
          >
            <option value="">All Workplaces</option>
            {locationsQuery.data?.locations?.map((l) => (
              <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
            ))}
          </select>
        </Field>

        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSelectedStatus("");
              setSelectedLocation("");
              setPage(1);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </Panel>

      {/* Verification Logs Data Grid */}
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Workplace</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Distance & Accuracy</th>
                <th className="px-4 py-3">Verification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {verificationsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">Loading audit logs...</td>
                </tr>
              ) : verifications.length > 0 ? (
                verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5 text-xs text-zinc-500">
                      {new Date(v.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-950">{v.employee?.fullName ?? "—"}</p>
                      <p className="text-xs text-zinc-500">{v.employee?.employeeCode ?? ""}</p>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">
                      {v.location?.name ?? "Default Workspace"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={getStatusTone(v.status)}>{v.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600">
                      {v.distanceMeters !== null ? `${Math.round(v.distanceMeters)}m from center` : "N/A"} • ±{Math.round(v.accuracyMeters)}m accuracy
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-xs text-zinc-600" title={v.reason}>
                      {v.isManualOverride && v.overrideReason ? (
                        <span className="font-medium text-amber-700">Override: {v.overrideReason}</span>
                      ) : (
                        v.reason
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">No verification events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {verificationsQuery.data && verificationsQuery.data.total > 25 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-zinc-500">
            <span>
              Showing {((page - 1) * 25) + 1} – {Math.min(page * 25, verificationsQuery.data.total)} of {verificationsQuery.data.total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                disabled={page * 25 >= verificationsQuery.data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {/* Manual Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-950">Authorize Geofence Override</h2>
            <p className="text-xs text-zinc-500">
              Grant a manual location exception with audit justification for an employee.
            </p>

            <div className="mt-4 space-y-4">
              <Field label="Employee">
                <select
                  className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
                  value={overrideEmpId}
                  onChange={(e) => setOverrideEmpId(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employeesQuery.data?.employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Target Workplace">
                <select
                  className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
                  value={overrideLocId}
                  onChange={(e) => setOverrideLocId(e.target.value)}
                >
                  <option value="">Select Location</option>
                  {locationsQuery.data?.locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Audit Justification Reason (Min 8 characters)">
                <Input
                  placeholder="e.g. Field duty at client premises / GPS device malfunction"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </Field>

              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="secondary" onClick={() => setOverrideModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!overrideEmpId || !overrideLocId || overrideReason.length < 8 || overrideMutation.isPending}
                  onClick={() => overrideMutation.mutate()}
                >
                  {overrideMutation.isPending ? "Submitting..." : "Authorize Override"}
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
