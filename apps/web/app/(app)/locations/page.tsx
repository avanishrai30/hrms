"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface LocationItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxAccuracyMeters: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    assignments: number;
  };
}

interface LocationListResponse {
  locations: LocationItem[];
  total: number;
  page: number;
  limit: number;
}

export default function LocationsListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (type) queryParams.set("type", type);
  if (isActive !== "") queryParams.set("isActive", isActive);
  queryParams.set("page", String(page));
  queryParams.set("limit", "20");

  const locationsQuery = useQuery({
    queryKey: ["locations-list", queryParams.toString()],
    queryFn: () => apiRequest<LocationListResponse>(`/locations?${queryParams.toString()}`)
  });

  const getTypeBadgeTone = (t: string): "neutral" | "success" | "warning" | "danger" => {
    if (t === "OFFICE") return "neutral";
    if (t === "FACTORY") return "warning";
    if (t === "WAREHOUSE") return "success";
    return "neutral";
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Work Locations</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Define workplaces, GPS geofences, and manage employee location assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={"/admin/location-audit" as Route}>
            <Button variant="secondary">Location Audit</Button>
          </Link>
          <Link href={"/locations/new" as Route}>
            <Button>Add Location</Button>
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <Panel className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Field label="Search">
          <Input
            placeholder="Search name or code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </Field>

        <Field label="Location Type">
          <select
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="OFFICE">Office</option>
            <option value="FACTORY">Factory</option>
            <option value="WAREHOUSE">Warehouse</option>
            <option value="RETAIL_OUTLET">Retail Outlet</option>
            <option value="DISTRIBUTION_CENTER">Distribution Center</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </Field>

        <Field label="Status">
          <select
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </Field>

        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSearch("");
              setType("");
              setIsActive("");
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div>
      </Panel>

      {/* Locations Table */}
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Geofence Radius</th>
                <th className="px-4 py-3">Assigned Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {locationsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">Loading locations...</td>
                </tr>
              ) : locationsQuery.data?.locations && locationsQuery.data.locations.length > 0 ? (
                locationsQuery.data.locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-950">{loc.name}</p>
                      <p className="text-xs text-zinc-500">{loc.code}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={getTypeBadgeTone(loc.type)}>{loc.type.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-600">
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">
                      <span className="font-medium text-zinc-950">{loc.radiusMeters}m</span> (Max acc: {loc.maxAccuracyMeters}m)
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {loc._count?.assignments ?? 0} assigned
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={loc.isActive ? "success" : "danger"}>
                        {loc.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/locations/${loc.id}/assignments` as Route}>
                          <Button variant="secondary" className="h-8 px-2.5 text-xs">
                            Assign
                          </Button>
                        </Link>
                        <Link href={`/locations/${loc.id}` as Route}>
                          <Button variant="secondary" className="h-8 px-2.5 text-xs">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">No locations configured yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {locationsQuery.data && locationsQuery.data.total > 20 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-zinc-500">
            <span>
              Showing {((page - 1) * 20) + 1} – {Math.min(page * 20, locationsQuery.data.total)} of {locationsQuery.data.total}
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
                disabled={page * 20 >= locationsQuery.data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
