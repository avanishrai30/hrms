"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { formatLocationRadius, formatLocationType } from "../../../lib/semantic-state";

const LOCATION_TYPES: NonNullable<CreateLocationInput["type"]>[] = [
  "OFFICE",
  "FACTORY",
  "WAREHOUSE",
  "RETAIL_OUTLET",
  "DISTRIBUTION_CENTER",
  "CUSTOM"
];

const createLocationFormSchema = z.object({
  name: z.string().min(2, "Location name is required."),
  code: z.string().min(2, "Location code is required.").regex(/^[A-Z0-9_-]+$/i, "Use letters, numbers, dashes, or underscores."),
  type: z.enum(["OFFICE", "FACTORY", "WAREHOUSE", "RETAIL_OUTLET", "DISTRIBUTION_CENTER", "CUSTOM"], {
    required_error: "Facility type is required."
  }),
  description: z.string().optional(),
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90."),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180."),
  radiusMeters: z.coerce.number().int().min(10, "Radius must be at least 10 meters.").max(5000, "Radius cannot exceed 5000 meters."),
  maxAccuracyMeters: z.coerce.number().int().min(1, "Accuracy must be at least 1 meter.").max(500, "Accuracy cannot exceed 500 meters.")
});

type CreateLocationForm = z.infer<typeof createLocationFormSchema>;

export default function WorkLocationsPage() {
  const gate = usePermissionGate(["location.view"]);
  const canCreate = useHasPermission("location.create");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CreateLocationForm>({
    resolver: zodResolver(createLocationFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      type: "" as CreateLocationForm["type"]
    }
  });

  const { data: locations = [], isLoading, isError, refetch } = useLocations(undefined, gate.isAuthorized);
  const createMutation = useCreateLocationMutation();

  const handleCreate = async (values: CreateLocationForm) => {
    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.type,
        description: values.description?.trim() ? values.description.trim() : undefined,
        latitude: values.latitude,
        longitude: values.longitude,
        radiusMeters: values.radiusMeters,
        maxAccuracyMeters: values.maxAccuracyMeters
      });

      setIsModalOpen(false);
      form.reset({
        name: "",
        code: "",
        description: "",
        type: "" as CreateLocationForm["type"]
      });
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
                        {formatLocationType(loc.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {typeof loc.latitude === "number" && typeof loc.longitude === "number"
                        ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatLocationRadius(loc.radiusMeters)}
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

          <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-3 py-2">
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
                  {...form.register("name")}
                  placeholder="Workplace name"
                  required
                />
                {form.formState.errors.name ? <p className="text-[11px] text-destructive">{form.formState.errors.name.message}</p> : null}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Location Code *</label>
                <Input
                  {...form.register("code", {
                    onChange: (event) => {
                      event.target.value = event.target.value.toUpperCase();
                    }
                  })}
                  placeholder="LOCATION-01"
                  required
                />
                {form.formState.errors.code ? <p className="text-[11px] text-destructive">{form.formState.errors.code.message}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Facility Type</label>
                <select
                  {...form.register("type")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select facility type</option>
                  {LOCATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                {form.formState.errors.type ? <p className="text-[11px] text-destructive">{form.formState.errors.type.message}</p> : null}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Geofence Radius (m)</label>
                <Input
                  type="number"
                  min="10"
                  max="5000"
                  {...form.register("radiusMeters")}
                  placeholder="Enter radius"
                />
                {form.formState.errors.radiusMeters ? <p className="text-[11px] text-destructive">{form.formState.errors.radiusMeters.message}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Latitude *</label>
                <Input
                  type="number"
                  step="any"
                  {...form.register("latitude")}
                  placeholder="Enter latitude"
                  required
                />
                {form.formState.errors.latitude ? <p className="text-[11px] text-destructive">{form.formState.errors.latitude.message}</p> : null}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Longitude *</label>
                <Input
                  type="number"
                  step="any"
                  {...form.register("longitude")}
                  placeholder="Enter longitude"
                  required
                />
                {form.formState.errors.longitude ? <p className="text-[11px] text-destructive">{form.formState.errors.longitude.message}</p> : null}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Max GPS Accuracy (m) *</label>
              <Input
                type="number"
                min="1"
                max="500"
                {...form.register("maxAccuracyMeters")}
                placeholder="Enter accepted device accuracy"
                required
              />
              {form.formState.errors.maxAccuracyMeters ? <p className="text-[11px] text-destructive">{form.formState.errors.maxAccuracyMeters.message}</p> : null}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
              <Input
                {...form.register("description")}
                placeholder="Operational notes for this workplace"
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
