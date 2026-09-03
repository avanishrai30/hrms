"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Briefcase,
  FileText,
  Clock,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Lock,
  Mail,
  Layers,
  FileCheck,
  CircleUser,
  Calendar,
  Laptop,
  Edit2,
  AlertTriangle,
  UserX
} from "lucide-react";
import {
  useEmployee,
  useEmployeeTimeline,
  useEmployeeDocuments,
  useEmployeeLeaveBalances,
  useEmployeeAssets,
  useUpdateEmployeeProfile,
  useUpdateEmployeeStatus,
  formatEmploymentType,
  formatEmploymentStatus
} from "../../../../lib/queries/use-people-queries";
import { usePermissionGate, useHasPermission } from "../../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";
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
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export default function EmployeeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const gate = usePermissionGate(["employees.read"]);
  const canReadDocuments = useHasPermission(["documents.read", "documents.view"]);
  const canReadLeave = useHasPermission(["leave.view"]);
  const canReadAssets = useHasPermission(["assets.view"]);
  const canUpdate = useHasPermission(["employees.update"]);
  const canUpdateStatus = useHasPermission(["employees.status.update"]);

  const [activeTab, setActiveTab] = useState<"overview" | "org" | "leave" | "assets" | "documents" | "timeline">("overview");

  // Edit Profile Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Status Change Dialog State
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);

  const { data: employee, isLoading, isError, refetch } = useEmployee(id, gate.isAuthorized);
  const { data: timeline = [] } = useEmployeeTimeline(id, gate.isAuthorized && activeTab === "timeline");
  const { data: documents = [] } = useEmployeeDocuments(id, gate.isAuthorized && canReadDocuments && activeTab === "documents");
  const { data: leaveBalances = [] } = useEmployeeLeaveBalances(id, gate.isAuthorized && canReadLeave && activeTab === "leave");
  const { data: assetsData } = useEmployeeAssets(id, gate.isAuthorized && canReadAssets && activeTab === "assets");

  const assets = Array.isArray(assetsData) ? assetsData : (assetsData?.items ?? []);

  const updateProfileMutation = useUpdateEmployeeProfile();
  const updateStatusMutation = useUpdateEmployeeStatus();

  if (gate.isLoading || (gate.isAuthorized && isLoading)) {
    return (
      <div className="flex flex-col gap-5 max-w-5xl mx-auto">
        <div className="h-6 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-40 rounded-xl border border-border bg-muted/40 animate-pulse" />
        <div className="h-72 rounded-xl border border-border bg-muted/30 animate-pulse" />
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
            <CardTitle className="text-base">Profile Access Restricted</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              You do not have permission (<code className="text-[11px] font-mono">employees.read</code>) to access this profile.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full text-center p-6 border-border shadow-xs">
          <CardHeader className="items-center pb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive mb-2">
              <AlertCircle className="size-5" />
            </div>
            <CardTitle className="text-base">Record Unavailable</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Unable to retrieve the requested employee record.
            </p>
          </CardHeader>
          <div className="pt-3 flex justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={"/employees" as Route}>Back to Roster</Link>
            </Button>
            <Button size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const deptName = typeof employee.department === "string" ? employee.department : employee.department?.name || "—";
  const desigName = typeof employee.designation === "string" ? employee.designation : employee.designation?.name || "—";
  const name = employee.fullName || "";
  const initial = name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : null;

  const handleOpenEdit = () => {
    setEditPhone(employee.phone || "");
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setEditError(null);
      await updateProfileMutation.mutateAsync({
        id,
        data: { phone: editPhone.trim() || undefined }
      });
      setIsEditOpen(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update profile.");
    }
  };

  const handleOpenStatus = () => {
    setNewStatus(employee.status || "ACTIVE");
    setStatusReason("");
    setStatusError(null);
    setIsStatusOpen(true);
  };

  const handleSaveStatus = async () => {
    try {
      setStatusError(null);
      await updateStatusMutation.mutateAsync({
        id,
        status: newStatus
      });
      setIsStatusOpen(false);
    } catch (err: unknown) {
      setStatusError(err instanceof Error ? err.message : "Failed to update employee status.");
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* 1. Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={"/dashboard" as Route}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={"/employees" as Route}>Employees</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{employee.employeeCode || id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Employee Profile Header Card */}
      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border border-border">
                {employee.avatarUrl || employee.profilePhoto ? (
                  <AvatarImage src={employee.avatarUrl || employee.profilePhoto || ""} alt={name} />
                ) : null}
                <AvatarFallback className="text-base">
                  {initial || <CircleUser className="size-6 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold tracking-tight text-foreground">{name || "—"}</h1>
                  <Badge variant={employee.status === "ACTIVE" ? "success" : "secondary"}>
                    {formatEmploymentStatus(employee.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="font-mono font-medium text-foreground">{employee.employeeCode || "—"}</span>
                  <span>•</span>
                  <span>{desigName}</span>
                  <span>•</span>
                  <span>{deptName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border flex-wrap">
              {canUpdate && (
                <Button variant="outline" size="sm" onClick={handleOpenEdit}>
                  <Edit2 className="size-3.5 mr-1.5" />
                  <span>Edit Profile</span>
                </Button>
              )}
              {canUpdateStatus && (
                <Button variant="outline" size="sm" onClick={handleOpenStatus} className="text-destructive hover:text-destructive">
                  <UserX className="size-3.5 mr-1.5" />
                  <span>Change Status</span>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={"/employees" as Route}>
                  <ArrowLeft className="size-3.5 mr-1.5" />
                  <span>Back to List</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Detail Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="org">Hierarchy</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Card */}
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Mail className="size-3.5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Work Email</span>
                  <span className="font-medium text-foreground">{employee.email || "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium text-foreground">{employee.phone || "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Work Location</span>
                  <span className="font-medium text-foreground">
                    {employee.location?.name || "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Employment Card */}
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Briefcase className="size-3.5 text-primary" />
                  Employment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Employment Type</span>
                  <span className="font-medium text-foreground">{formatEmploymentType(employee.employmentType)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Joining Date</span>
                  <span className="font-medium text-foreground font-mono">
                    {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-foreground">{formatEmploymentStatus(employee.status)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Org Structure */}
        <TabsContent value="org" className="mt-4 space-y-4">
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Layers className="size-3.5 text-primary" />
                Organizational Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="rounded-lg border border-border p-3.5 bg-muted/20">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Department</p>
                <p className="text-sm font-semibold text-foreground">{deptName}</p>
                <p className="text-xs text-muted-foreground">Designation: {desigName}</p>
              </div>

              <div className="rounded-lg border border-border p-3.5 bg-muted/20">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reporting Manager</p>
                <p className="text-sm font-semibold text-foreground">
                  {employee.manager?.fullName || "—"}
                </p>
                {employee.manager?.email && (
                  <p className="text-xs text-muted-foreground font-mono">{employee.manager.email}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Leave Balances */}
        <TabsContent value="leave" className="mt-4 space-y-4">
          {!canReadLeave ? (
            <Card className="border-border p-6 text-center shadow-xs">
              <Lock className="size-6 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Leave Balances Restricted</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You need <code className="font-mono text-[10px]">leave.view</code> permission to view leave entitlements.
              </p>
            </Card>
          ) : leaveBalances.length > 0 ? (
            <Card className="border border-border bg-card shadow-xs overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Used</TableHead>
                      <TableHead className="text-right font-semibold text-primary">Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveBalances.map((bal) => (
                      <TableRow key={bal.id}>
                        <TableCell className="font-medium text-foreground flex items-center gap-2">
                          <Calendar className="size-3.5 text-primary" />
                          <span>{bal.leaveType?.name || "Standard Leave"}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{bal.allocatedDays ?? 0}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{bal.usedDays ?? 0}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-primary">
                          {bal.availableDays ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border py-12 text-center text-xs text-muted-foreground">
              <Calendar className="size-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground">No leave balance records</p>
              <p className="text-[11px] mt-0.5">Leave balance allocations for this employee have not been configured.</p>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Assets */}
        <TabsContent value="assets" className="mt-4 space-y-4">
          {!canReadAssets ? (
            <Card className="border-border p-6 text-center shadow-xs">
              <Lock className="size-6 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Assets Access Restricted</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You need <code className="font-mono text-[10px]">assets.view</code> permission to view assigned equipment.
              </p>
            </Card>
          ) : assets.length > 0 ? (
            <Card className="border border-border bg-card shadow-xs overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium text-foreground flex items-center gap-2">
                          <Laptop className="size-3.5 text-primary" />
                          <span>{asset.name}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{asset.category || "—"}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{asset.serialNumber || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={asset.status === "ASSIGNED" ? "success" : "secondary"} className="text-[10px]">
                            {asset.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border py-12 text-center text-xs text-muted-foreground">
              <Laptop className="size-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground">No assigned assets</p>
              <p className="text-[11px] mt-0.5">No devices or equipment are currently assigned to this employee.</p>
            </Card>
          )}
        </TabsContent>

        {/* Tab 5: Documents */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          {!canReadDocuments ? (
            <Card className="border-border p-6 text-center shadow-xs">
              <Lock className="size-6 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Documents Restricted</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You need <code className="font-mono text-[10px]">documents.read</code> permission to view uploaded files.
              </p>
            </Card>
          ) : documents.length > 0 ? (
            <Card className="border border-border bg-card shadow-xs overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium text-foreground flex items-center gap-2">
                          <FileCheck className="size-3.5 text-primary" />
                          <span>{doc.fileName || doc.documentType}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{doc.documentType}</TableCell>
                        <TableCell>
                          <Badge variant={doc.isVerified ? "success" : "secondary"} className="text-[10px]">
                            {doc.isVerified ? "VERIFIED" : "PENDING"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border py-12 text-center text-xs text-muted-foreground">
              <FileText className="size-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground">No documents uploaded</p>
              <p className="text-[11px] mt-0.5">No employee verification documents have been attached.</p>
            </Card>
          )}
        </TabsContent>

        {/* Tab 6: Timeline */}
        <TabsContent value="timeline" className="mt-4 space-y-4">
          {timeline.length > 0 ? (
            <Card className="border border-border bg-card shadow-xs p-5">
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-2 top-1 size-3 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{event.title || event.eventType || "Event"}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {event.date ? new Date(event.date).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="border-dashed border-border py-12 text-center text-xs text-muted-foreground">
              <Clock className="size-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground">No timeline events recorded</p>
              <p className="text-[11px] mt-0.5">Career transitions and status changes will appear here.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
            <DialogDescription>
              Update direct contact details for {name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            {editError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {editError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact Phone Number</Label>
              <Input
                id="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Status Confirmation Dialog (High Risk Action) */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Change Employment Status
            </DialogTitle>
            <DialogDescription>
              Modify employment status for {name} ({employee.employeeCode || id}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            {statusError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                {statusError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Target Status</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
                <option value="SUSPENDED">SUSPENDED (Restricted)</option>
                <option value="TERMINATED">TERMINATED (Offboarded)</option>
              </select>
            </div>

            {(newStatus === "TERMINATED" || newStatus === "SUSPENDED") && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive space-y-1">
                <p className="font-semibold">Caution: Dangerous Action</p>
                <p className="text-[11px] opacity-90">
                  Setting this employee to {newStatus} will immediately revoke platform authentication access and trigger offboarding workflows.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsStatusOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={newStatus === "TERMINATED" || newStatus === "SUSPENDED" ? "destructive" : "default"}
              onClick={handleSaveStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating…" : `Confirm ${newStatus}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
