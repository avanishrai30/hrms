"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  Plus,
  Network,
  Users,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  Layers
} from "lucide-react";
import {
  useDepartments,
  useDesignations,
  useBusinessUnits,
  useTeams,
  useCreateDepartmentMutation,
  useCreateDesignationMutation
} from "../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
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

export default function OrganizationManagementPage() {
  const gate = usePermissionGate(["organization.view", "departments.read"]);
  const canCreateDept = useHasPermission("departments.create");
  const canCreateDesig = useHasPermission("designations.create");

  const [activeTab, setActiveTab] = useState<"departments" | "designations">("departments");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);

  // Department Form
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptError, setDeptError] = useState<string | null>(null);

  // Designation Form
  const [desigName, setDesigName] = useState("");
  const [desigCode, setDesigCode] = useState("");
  const [desigDeptId, setDesigDeptId] = useState("");
  const [desigError, setDesigError] = useState<string | null>(null);

  const deptsQuery = useDepartments(gate.isAuthorized);
  const desigsQuery = useDesignations(gate.isAuthorized);
  const buQuery = useBusinessUnits(gate.isAuthorized);
  const teamsQuery = useTeams(gate.isAuthorized);

  const createDeptMutation = useCreateDepartmentMutation();
  const createDesigMutation = useCreateDesignationMutation();

  const departments = deptsQuery.data ?? [];
  const designations = desigsQuery.data ?? [];
  const businessUnits = buQuery.data ?? [];
  const teams = teamsQuery.data ?? [];

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      setDeptError("Please provide both name and code.");
      return;
    }
    try {
      setDeptError(null);
      await createDeptMutation.mutateAsync({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        description: deptDesc.trim() ? deptDesc.trim() : undefined
      });
      setIsDeptModalOpen(false);
      setDeptName("");
      setDeptCode("");
      setDeptDesc("");
    } catch (err: unknown) {
      setDeptError(err instanceof Error ? err.message : "Failed to create department");
    }
  };

  const handleCreateDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigName.trim() || !desigCode.trim() || !desigDeptId) {
      setDesigError("Please provide designation name, code, and department.");
      return;
    }
    try {
      setDesigError(null);
      await createDesigMutation.mutateAsync({
        name: desigName.trim(),
        code: desigCode.trim().toUpperCase(),
        departmentId: desigDeptId
      });
      setIsDesigModalOpen(false);
      setDesigName("");
      setDesigCode("");
      setDesigDeptId("");
    } catch (err: unknown) {
      setDesigError(err instanceof Error ? err.message : "Failed to create designation");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && deptsQuery.isLoading)) {
    return (
      <div className="flex flex-col gap-5 max-w-7xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
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
            <CardTitle className="text-base">Organization Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission to configure organization units.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Organization Architecture</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure departments, designations, business units, teams, and hierarchical structures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={"/org-chart" as Route}>
              <Network className="size-3.5 mr-1.5 text-primary" />
              <span>Org Chart</span>
            </Link>
          </Button>

          {activeTab === "departments" && canCreateDept && (
            <Button size="sm" onClick={() => setIsDeptModalOpen(true)}>
              <Plus className="size-3.5 mr-1" />
              <span>Add Department</span>
            </Button>
          )}

          {activeTab === "designations" && canCreateDesig && (
            <Button size="sm" onClick={() => setIsDesigModalOpen(true)}>
              <Plus className="size-3.5 mr-1" />
              <span>Add Designation</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Studio Admin Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold text-muted-foreground">Departments</CardDescription>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Building2 className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {departments.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Active functional divisions</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold text-muted-foreground">Designations</CardDescription>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Briefcase className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {designations.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Assigned job roles & grades</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold text-muted-foreground">Business Units</CardDescription>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Layers className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {businessUnits.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Operational divisions</p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold text-muted-foreground">Teams</CardDescription>
            <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Users className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {teams.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Cross-functional squads</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Section Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "departments" | "designations")} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="departments">Departments ({departments.length})</TabsTrigger>
            <TabsTrigger value="designations">Designations ({designations.length})</TabsTrigger>
          </TabsList>
        </div>

        {/* Departments Tab */}
        <TabsContent value="departments" className="mt-4">
          <Card className="border border-border bg-card shadow-xs overflow-hidden">
            <CardContent className="p-0">
              {departments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Department Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-semibold text-foreground flex items-center gap-2">
                          <Building2 className="size-3.5 text-primary" />
                          <span>{dept.name}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium text-foreground">
                          {dept.code}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {dept.description || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No departments created yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Designations Tab */}
        <TabsContent value="designations" className="mt-4">
          <Card className="border border-border bg-card shadow-xs overflow-hidden">
            <CardContent className="p-0">
              {designations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Designation Title</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designations.map((desig) => (
                      <TableRow key={desig.id}>
                        <TableCell className="font-semibold text-foreground flex items-center gap-2">
                          <Briefcase className="size-3.5 text-primary" />
                          <span>{desig.name}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium text-foreground">
                          {desig.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {desig.department?.name || "—"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No designations created yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 4. Add Department Dialog */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>Create a functional division in the organization.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDept} className="space-y-3 py-2">
            {deptError && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{deptError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Department Name *</label>
              <Input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Engineering & Platform"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Department Code *</label>
              <Input
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                placeholder="e.g. ENG"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
              <Input
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                placeholder="Core technology and product delivery"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsDeptModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createDeptMutation.isPending}>
                {createDeptMutation.isPending ? "Saving..." : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Add Designation Dialog */}
      <Dialog open={isDesigModalOpen} onOpenChange={setIsDesigModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Designation</DialogTitle>
            <DialogDescription>Create a title and role grade associated with a department.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDesig} className="space-y-3 py-2">
            {desigError && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{desigError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Designation Title *</label>
              <Input
                value={desigName}
                onChange={(e) => setDesigName(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Designation Code *</label>
              <Input
                value={desigCode}
                onChange={(e) => setDesigCode(e.target.value)}
                placeholder="e.g. SSE-01"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Department *</label>
              <select
                value={desigDeptId}
                onChange={(e) => setDesigDeptId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsDesigModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createDesigMutation.isPending}>
                {createDesigMutation.isPending ? "Saving..." : "Create Designation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
