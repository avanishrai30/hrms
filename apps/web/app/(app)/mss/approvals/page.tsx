"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Info
} from "lucide-react";
import {
  useManagerApprovals,
  useApproveLeaveMutation,
  useRejectLeaveMutation
} from "../../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
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

export default function ManagerApprovalsPage() {
  const gate = usePermissionGate(["mss.read"]);
  const canApproveLeave = useHasPermission("leave.approve");

  const [activeTab, setActiveTab] = useState<"leaves" | "requests">("leaves");
  const [actionError, setActionError] = useState<string | null>(null);

  // Rejection Dialog state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: approvals, isLoading } = useManagerApprovals(gate.isAuthorized);
  const approveLeave = useApproveLeaveMutation();
  const rejectLeave = useRejectLeaveMutation();

  const leaves = approvals?.leaves ?? [];
  const requests = approvals?.requests ?? [];

  const handleApproveLeave = async (id: string) => {
    try {
      setActionError(null);
      await approveLeave.mutateAsync({ id });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to approve leave");
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    try {
      setActionError(null);
      await rejectLeave.mutateAsync({ id: rejectId, reason: rejectReason.trim() });
      setRejectId(null);
      setRejectReason("");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to reject leave");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="flex flex-col gap-5 max-w-5xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-64 rounded-xl border border-border bg-muted/30 animate-pulse" />
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
            <CardTitle className="text-base">Approvals Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission (<code className="text-[11px] font-mono">mss.read</code>) to access manager approvals.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-0.5">
          <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-muted-foreground">
            <Link href={"/mss" as Route} className="inline-flex items-center gap-1">
              <ArrowLeft className="size-3" />
              <span>Back to Manager Workspace</span>
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Pending Approvals</h1>
          <p className="text-xs text-muted-foreground">
            Review and action direct reports leave applications; monitor workplace service requests.
          </p>
        </div>
      </div>

      {/* 2. Action Error Banner */}
      {actionError && (
        <Card className="border-destructive/30 bg-destructive/5 p-3.5">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        </Card>
      )}

      {/* 3. Approvals Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "leaves" | "requests")} className="w-full">
        <TabsList>
          <TabsTrigger value="leaves">
            Leave Requests ({leaves.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Service Requests ({requests.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Leave Requests */}
        <TabsContent value="leaves" className="mt-4">
          <Card className="border border-border bg-card shadow-xs overflow-hidden">
            <CardContent className="p-0">
              {leaves.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Employee</TableHead>
                      <TableHead>Type & Dates</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {leave.employee?.fullName || "Team Member"}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              {leave.employee?.employeeCode || "—"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="text-[10px]">
                              {leave.leaveType?.name || "Leave"}
                            </Badge>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {leave.reason || "—"}
                        </TableCell>

                        <TableCell className="text-right">
                          {canApproveLeave ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveLeave(leave.id)}
                                disabled={approveLeave.isPending}
                                className="h-7 text-[11px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <CheckCircle2 className="size-3 mr-1" />
                                <span>Approve</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectId(leave.id);
                                  setRejectReason("");
                                }}
                                disabled={rejectLeave.isPending}
                                className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                              >
                                <XCircle className="size-3 mr-1" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              View Only
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="size-8 mx-auto mb-2 opacity-40 text-emerald-600" />
                  <p className="font-semibold text-foreground">All leave applications reviewed</p>
                  <p className="text-[11px] mt-0.5">No pending leaves awaiting your review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Service Requests */}
        <TabsContent value="requests" className="mt-4">
          <Card className="border border-border bg-card shadow-xs overflow-hidden">
            <div className="p-3 bg-muted/40 border-b border-border text-xs text-muted-foreground flex items-center gap-2">
              <Info className="size-3.5 text-primary shrink-0" />
              <span>Service requests are actioned by central IT & HR Operations.</span>
            </div>

            <CardContent className="p-0">
              {requests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-semibold text-foreground">
                          {req.requestType}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {req.employee?.fullName || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {req.reason || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning" className="text-[10px]">
                            {req.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No active service requests reported by team members.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 4. Leave Rejection Dialog */}
      <Dialog open={Boolean(rejectId)} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejecting this leave application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReject} className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Critical release milestone during this period"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background p-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setRejectId(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!rejectReason.trim() || rejectLeave.isPending}
              >
                {rejectLeave.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
