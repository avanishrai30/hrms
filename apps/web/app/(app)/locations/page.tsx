"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useLocations, useCreateLocationMutation, type CreateLocationInput } from "../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../../components/ui/dialog";

const LOCATION_TYPES: NonNullable<CreateLocationInput["type"]>[] = [
  "OFFICE",
  "FACTORY",
  "WAREHOUSE",
  "RETAIL_OUTLET",
  "DISTRIBUTION_CENTER",
  "CUSTOM"
];

export default function WorkLocationsPage() {
  const gate = usePermissionGate(["location.view"]);
  const canCreate = useHasPermission("location.create");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<CreateLocationInput["type"]>("OFFICE");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: locations = [], isLoading, isError, refetch } = useLocations(undefined, gate.isAuthorized);
  const createMutation = useCreateLocationMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError("Please provide location name and code.");
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setFormError("Valid numeric Latitude and Longitude coordinates are required.");
      return;
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setFormError("Latitude must be between -90 and 90, and Longitude between -180 and 180.");
      return;
    }

    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        description: description.trim() ? description.trim() : undefined,
        latitude: latNum,
        longitude: lngNum,
        radiusMeters: radiusMeters.trim() ? parseInt(radiusMeters, 10) : undefined
      });

      setIsModalOpen(false);
      setName("");
      setCode("");
      setDescription("");
      setLatitude("");
      setLongitude("");
      setRadiusMeters("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create location.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="flex flex-col gap-5 max-w-6xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-96 rounded-xl border border-border bg-muted/30 animate-pulse" />
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full text-center p-6 border-border shadow-xs">
          <CardHeader className="items-center pb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Locations Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission (<code className="text-[11px] font-mono">location.view</code>) to view locations.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Work Locations & Facilities</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage geographical workplace sites, geofences, and biometric terminals.
          </p>
        </div>

        {canCreate && (
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="size-3.5 mr-1" />
            <span>Add Location</span>
          </Button>
        )}
      </div>

      {/* 2. Error Banner */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center justify-between text-xs text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4" />
              <span>Failed to load locations.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Table (Studio Admin Table Pattern) */}
      <Card className="border border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {locations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Location Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Facility Type</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Geofence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="size-3.5 text-primary" />
                      <span>{loc.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {loc.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {loc.type || "OFFICE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {typeof loc.latitude === "number" && typeof loc.longitude === "number"
                        ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {loc.radiusMeters ? `${loc.radiusMeters} m` : "Standard"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No work locations configured yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Add Location Dialog (Studio Admin Dialog Pattern) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Work Location</DialogTitle>
            <DialogDescription>Define a workplace site with precise geofenced coordinates.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2">
            {formError && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Location Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bangalore Campus"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Location Code *</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. BLR-01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Facility Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CreateLocationInput["type"])}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {LOCATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Geofence Radius (m)</label>
                <Input
                  type="number"
                  min="10"
                  max="5000"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(e.target.value)}
                  placeholder="Default (100)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Latitude *</label>
                <Input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 12.9716"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Longitude *</label>
                <Input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.5946"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="HQ corporate campus & engineering labs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Create Location"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
