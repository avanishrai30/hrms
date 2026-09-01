"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPreview } from "../../../../components/map-preview";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface LocationDetail {
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
  assignments: Array<{
    id: string;
    employee?: { id: string; fullName: string; employeeCode: string } | null;
    department?: { id: string; name: string } | null;
  }>;
  _count?: {
    verifications: number;
    attendances: number;
  };
}

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("OFFICE");
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [maxAccuracyMeters, setMaxAccuracyMeters] = useState(50);
  const [isActive, setIsActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const locationQuery = useQuery({
    queryKey: ["location-detail", params.id],
    queryFn: () => apiRequest<LocationDetail>(`/locations/${params.id}`),
    enabled: Boolean(params.id)
  });

  useEffect(() => {
    if (locationQuery.data) {
      const d = locationQuery.data;
      setName(d.name);
      setDescription(d.description ?? "");
      setType(d.type);
      setLatitude(d.latitude);
      setLongitude(d.longitude);
      setRadiusMeters(d.radiusMeters);
      setMaxAccuracyMeters(d.maxAccuracyMeters);
      setIsActive(d.isActive);
    }
  }, [locationQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/locations/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          description: description || undefined,
          type,
          latitude: Number(latitude),
          longitude: Number(longitude),
          radiusMeters: Number(radiusMeters),
          maxAccuracyMeters: Number(maxAccuracyMeters),
          isActive
        })
      }),
    onSuccess: () => {
      setSuccessMsg("Location updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["location-detail", params.id] });
      queryClient.invalidateQueries({ queryKey: ["locations-list"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/locations/${params.id}`, { method: "DELETE" }),
    onSuccess: () => {
      router.push("/locations" as Route);
    }
  });

  if (locationQuery.isLoading) {
    return <div className="p-8 text-center text-zinc-500">Loading location details...</div>;
  }

  const location = locationQuery.data;
  if (!location) {
    return <div className="p-8 text-center text-zinc-500">Location not found.</div>;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/locations" as Route} className="text-sm font-medium text-zinc-500 hover:text-zinc-950">
              ← Locations
            </Link>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{location.name}</h1>
            <Badge tone={location.isActive ? "success" : "danger"}>
              {location.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500">Code: {location.code} • Created: {new Date(location.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/locations/${params.id}/assignments` as Route}>
            <Button variant="secondary">
              Manage Assignments ({location.assignments?.length ?? 0})
            </Button>
          </Link>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (confirm("Deactivate this location?")) {
                deleteMutation.mutate();
              }
            }}
          >
            Deactivate
          </Button>
        </div>
      </header>

      {successMsg && (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* Grid: Edit form & Map preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="space-y-4">
          <h2 className="text-base font-semibold text-zinc-950">Location Settings</h2>

          <Field label="Location Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Facility Type">
              <select
                className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
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
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          <div className="border-t border-border pt-4">
            <span className="text-sm font-semibold text-zinc-950">Coordinates</span>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <Input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Geofence Radius (meters)">
              <Input
                type="number"
                min="10"
                max="5000"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
              />
            </Field>
            <Field label="Max GPS Accuracy (meters)">
              <Input
                type="number"
                min="10"
                max="500"
                value={maxAccuracyMeters}
                onChange={(e) => setMaxAccuracyMeters(Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <Button
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Panel>

        {/* Map Preview & Stats */}
        <div className="space-y-6">
          <Panel>
            <h2 className="text-sm font-semibold text-zinc-950">Geofence Perimeter Preview</h2>
            <div className="mt-3">
              <MapPreview
                locationName={name || location.name}
                latitude={Number(latitude)}
                longitude={Number(longitude)}
                radiusMeters={Number(radiusMeters)}
              />
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-4">
            <Panel className="p-4">
              <p className="text-xs text-zinc-500">Assigned Employees</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950">{location.assignments?.length ?? 0}</p>
            </Panel>
            <Panel className="p-4">
              <p className="text-xs text-zinc-500">Attendances Logged</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{location._count?.attendances ?? 0}</p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
