"use client";

import React, { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  Laptop,
  PlusCircle,
  RotateCcw,
  UserCheck,
  Search,
  Filter,
  PackageCheck,
  ShieldCheck
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

interface AssetItem {
  id: string;
  assetTag: string;
  name: string;
  category?: { name: string } | string;
  serialNumber?: string;
  purchaseCost?: number;
  currency?: string;
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED" | string;
  condition?: string;
  assignedEmployeeId?: string | null;
  currentAssignee?: {
    employee?: {
      fullName?: string;
      employeeCode?: string;
    };
  } | null;
}

export default function AssetMasterPage() {
  const gate = usePermissionGate(["assets.view"]);
  const canManage = useHasPermission(["assets.manage"]);

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Asset Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newCategory, setNewCategory] = useState("LAPTOPS");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Assign Asset Dialog
  const [assignAsset, setAssignAsset] = useState<AssetItem | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Return Asset Dialog
  const [returnAsset, setReturnAsset] = useState<AssetItem | null>(null);
  const [returnCondition, setReturnCondition] = useState("GOOD");
  const [returnError, setReturnError] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest<AssetItem[] | { items: AssetItem[] }>("/assets");
      const list = Array.isArray(res) ? res : (res?.items ?? []);
      setAssets(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load asset records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gate.isAuthorized) {
      void loadAssets();
    }
  }, [gate.isAuthorized]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      setCreateError(null);
      await apiRequest("/assets", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          assetTag: newTag.trim() || undefined,
          serialNumber: newSerial.trim() || undefined,
          category: newCategory
        })
      });
      setIsCreateOpen(false);
      setNewName("");
      setNewTag("");
      setNewSerial("");
      await loadAssets();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create asset.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAssignAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAsset || !assignEmployeeId) return;
    try {
      setIsAssigning(true);
      setAssignError(null);
      await apiRequest(`/assets/${assignAsset.id}/assign`, {
        method: "POST",
        body: JSON.stringify({ employeeId: assignEmployeeId.trim() })
      });
      setAssignAsset(null);
      setAssignEmployeeId("");
      await loadAssets();
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : "Failed to assign asset.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReturnAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnAsset) return;
    try {
      setIsReturning(true);
      setReturnError(null);
      await apiRequest(`/assets/${returnAsset.id}/return`, {
        method: "POST",
        body: JSON.stringify({ condition: returnCondition })
      });
      setReturnAsset(null);
      await loadAssets();
    } catch (err: unknown) {
      setReturnError(err instanceof Error ? err.message : "Failed to return asset.");
    } finally {
      setIsReturning(false);
    }
  };

  if (gate.isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-md bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 rounded-xl bg-card border border-border" />
          <div className="h-24 rounded-xl bg-card border border-border" />
          <div className="h-24 rounded-xl bg-card border border-border" />
          <div className="h-24 rounded-xl bg-card border border-border" />
        </div>
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12">
        <Card className="p-6 border-border text-center shadow-xs">
          <CardHeader className="items-center pb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Asset Workspace Restricted</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              You do not have permission (<code className="text-[11px] font-mono">assets.view</code>) to view equipment inventory.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredAssets = assets.filter((a) => {
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const catName = typeof a.category === "string" ? a.category : (a.category?.name || "");
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assetTag && a.assetTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      catName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const assignedCount = assets.filter((a) => a.status === "ASSIGNED").length;
  const availableCount = assets.filter((a) => a.status === "AVAILABLE").length;
  const maintenanceCount = assets.filter((a) => a.status === "MAINTENANCE").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Equipment & Workplace Assets</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track hardware allocations, device lifecycle stages, and employee equipment handovers.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="size-3.5 mr-1.5" />
            <span>Add Asset</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* 2. Truthful KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Fixed Assets</span>
            <div className="text-2xl font-extrabold font-mono text-foreground">{assets.length}</div>
            <span className="text-[11px] text-muted-foreground">Tenant-scoped inventory</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned to Staff</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-600">{assignedCount}</div>
            <span className="text-[11px] text-muted-foreground">In active employee possession</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available in Vault</span>
            <div className="text-2xl font-extrabold font-mono text-primary">{availableCount}</div>
            <span className="text-[11px] text-muted-foreground">Ready for deployment</span>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Maintenance</span>
            <div className="text-2xl font-extrabold font-mono text-amber-600">{maintenanceCount}</div>
            <span className="text-[11px] text-muted-foreground">Repair / Diagnostics</span>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by asset tag, name, or serial…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="size-3.5 text-muted-foreground" />
          <select
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({assets.length})</option>
            <option value="AVAILABLE">Available ({availableCount})</option>
            <option value="ASSIGNED">Assigned ({assignedCount})</option>
            <option value="MAINTENANCE">Maintenance ({maintenanceCount})</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      {/* 4. Asset Ledger Table */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Laptop className="size-4 text-primary" />
            Asset Inventory Master
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading asset inventory…</div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <PackageCheck className="size-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground">No assets found</p>
              <p className="text-[11px] mt-0.5">Adjust your filters or add a new equipment item above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground bg-muted/20">
                    <th className="py-2.5 px-4 font-semibold">Asset Tag</th>
                    <th className="py-2.5 px-4 font-semibold">Equipment Name</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Serial Number</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Current Assignee</th>
                    {canManage && <th className="py-2.5 px-4 font-semibold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredAssets.map((a) => {
                    const catName = typeof a.category === "string" ? a.category : (a.category?.name || "—");
                    const assigneeName = a.currentAssignee?.employee?.fullName || "—";
                    return (
                      <tr key={a.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4 font-mono font-medium text-foreground">{a.assetTag || "—"}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{a.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{catName}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{a.serialNumber || "—"}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              a.status === "ASSIGNED"
                                ? "success"
                                : a.status === "AVAILABLE"
                                ? "outline"
                                : a.status === "MAINTENANCE"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {a.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">{assigneeName}</td>
                        {canManage && (
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {a.status === "AVAILABLE" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-primary"
                                  onClick={() => {
                                    setAssignAsset(a);
                                    setAssignEmployeeId("");
                                    setAssignError(null);
                                  }}
                                >
                                  <UserCheck className="size-3 mr-1" />
                                  Assign
                                </Button>
                              )}
                              {a.status === "ASSIGNED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700"
                                  onClick={() => {
                                    setReturnAsset(a);
                                    setReturnCondition("GOOD");
                                    setReturnError(null);
                                  }}
                                >
                                  <RotateCcw className="size-3 mr-1" />
                                  Return
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Asset Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Fixed Asset to Inventory</DialogTitle>
            <DialogDescription>
              Register a new hardware item or equipment in the central asset repository.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAsset} className="space-y-4 py-2 text-xs">
            {createError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                {createError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="assetName">Equipment Name</Label>
              <Input
                id="assetName"
                placeholder="e.g. MacBook Pro 14 M3"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="assetTag">Asset Tag / Barcode</Label>
                <Input
                  id="assetTag"
                  placeholder="e.g. AST-001"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  placeholder="e.g. C02G41..."
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="LAPTOPS">Laptops & Workstations</option>
                <option value="MOBILES">Mobile Devices & Tablets</option>
                <option value="PERIPHERALS">Monitors & Peripherals</option>
                <option value="MACHINERY">Industrial Machinery</option>
                <option value="FURNITURE">Office Infrastructure</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Saving…" : "Save Asset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Asset Dialog */}
      <Dialog open={Boolean(assignAsset)} onOpenChange={(open) => !open && setAssignAsset(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Asset to Employee</DialogTitle>
            <DialogDescription>
              Allocate {assignAsset?.name} ({assignAsset?.assetTag || "No Tag"}) to an employee.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignAsset} className="space-y-4 py-2 text-xs">
            {assignError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                {assignError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="employeeId">Target Employee ID or Code</Label>
              <Input
                id="employeeId"
                placeholder="Paste Employee UUID or Code"
                value={assignEmployeeId}
                onChange={(e) => setAssignEmployeeId(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignAsset(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning}>
                {isAssigning ? "Assigning…" : "Confirm Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Return Asset Dialog */}
      <Dialog open={Boolean(returnAsset)} onOpenChange={(open) => !open && setReturnAsset(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Return Asset to Vault</DialogTitle>
            <DialogDescription>
              Check-in {returnAsset?.name} ({returnAsset?.assetTag || "No Tag"}) back to inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReturnAsset} className="space-y-4 py-2 text-xs">
            {returnError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                {returnError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="condition">Returned Condition</Label>
              <select
                id="condition"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
              >
                <option value="EXCELLENT">Excellent (Like New)</option>
                <option value="GOOD">Good (Normal Wear)</option>
                <option value="DAMAGED">Damaged (Requires Repair)</option>
                <option value="DEFECTIVE">Defective</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setReturnAsset(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isReturning}>
                {isReturning ? "Processing…" : "Confirm Return"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
