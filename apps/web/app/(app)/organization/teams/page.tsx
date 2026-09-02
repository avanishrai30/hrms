"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Users,
  Plus,
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useTeams, useDepartments, useCreateTeamMutation } from "../../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "../../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../../../components/ui/dialog";

export default function TeamsManagementPage() {
  const gate = usePermissionGate(["organization.view"]);
  const canManage = useHasPermission("organization.manage");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: teams = [], isLoading, isError, refetch } = useTeams(gate.isAuthorized);
  const createMutation = useCreateTeamMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError("Please provide both team name and code.");
      return;
    }
    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        departmentId: departmentId ? departmentId : undefined,
        description: description.trim() ? description.trim() : undefined
      });
      setIsModalOpen(false);
      setName("");
      setCode("");
      setDescription("");
      setDepartmentId("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create team.");
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
            <CardTitle className="text-base">Teams Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission (<code className="text-[11px] font-mono">organization.view</code>) to view teams.
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
        <div className="space-y-0.5">
          <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-muted-foreground">
            <Link href={"/organization" as Route} className="inline-flex items-center gap-1">
              <ArrowLeft className="size-3" />
              <span>Back to Organization</span>
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Teams & Squads</h1>
          <p className="text-xs text-muted-foreground">
            Organize employees into functional squads and project working groups.
          </p>
        </div>

        {canManage && (
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="size-3.5 mr-1" />
            <span>Add Team</span>
          </Button>
        )}
      </div>

      {/* 2. Error Banner */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center justify-between text-xs text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4" />
              <span>Failed to load teams.</span>
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
          {teams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Team Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-semibold text-foreground flex items-center gap-2">
                      <Users className="size-3.5 text-primary" />
                      <span>{team.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {team.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {team.department?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {team.description || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No teams created yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Add Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>Define a cross-functional team or working squad.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2">
            {formError && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Team Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Core Platform Squad"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Team Code *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. TEAM-PLAT"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Infrastructure and API services"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
