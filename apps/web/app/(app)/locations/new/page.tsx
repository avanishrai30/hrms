"use client";

import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPreview } from "../../../../components/map-preview";
import { Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

export default function NewLocationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("OFFICE");
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [maxAccuracyMeters, setMaxAccuracyMeters] = useState(50);
  const [isActive, setIsActive] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGetCurrentPosition = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setMaxAccuracyMeters(Math.max(30, Math.round(pos.coords.accuracy * 1.5)));
        setDetectingGps(false);
      },
      (err) => {
        setErrorMsg(`Failed to get location: ${err.message}`);
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("/locations", {
        method: "POST",
        body: JSON.stringify({
          name,
          code,
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
      router.push("/locations" as Route);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to create location.");
    }
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/locations" as Route} className="text-sm font-medium text-zinc-500 hover:text-zinc-950">
              ← Locations
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">Add Work Location</h1>
          <p className="text-sm text-zinc-600">Register a new workplace with geodesic boundary perimeter.</p>
        </div>
      </header>

      {errorMsg && (
        <div className="rounded-control border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Location Form */}
        <Panel className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location Name">
              <Input
                placeholder="e.g. Bangalore Headquarters"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code) {
                    setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "-").toUpperCase().slice(0, 10));
                  }
                }}
              />
            </Field>
            <Field label="Location Code">
              <Input
                placeholder="e.g. BLR-HQ"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </Field>
          </div>

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

          <Field label="Description (Optional)">
            <Input
              placeholder="e.g. Corporate tower, 5th floor"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-950">GPS Coordinates</span>
              <Button
                variant="secondary"
                type="button"
                className="h-8 px-2.5 text-xs"
                disabled={detectingGps}
                onClick={handleGetCurrentPosition}
              >
                {detectingGps ? "Detecting..." : "Use Current Position"}
              </Button>
            </div>

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
            <Link href={"/locations" as Route}>
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button
              disabled={!name || !code || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Creating..." : "Save Location"}
            </Button>
          </div>
        </Panel>

        {/* Live Visual Geofence Map Preview */}
        <div className="space-y-4">
          <Panel>
            <h2 className="text-sm font-semibold text-zinc-950">Geofence Boundary Preview</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Interactive visualization of the perimeter zone within which employee check-ins will be accepted.
            </p>
            <div className="mt-4">
              <MapPreview
                locationName={name || "New Location"}
                latitude={Number(latitude)}
                longitude={Number(longitude)}
                radiusMeters={Number(radiusMeters)}
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
