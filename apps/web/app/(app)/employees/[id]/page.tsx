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
  FileCheck
} from "lucide-react";
import {
  useEmployee,
  useEmployeeTimeline,
  useEmployeeDocuments,
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

export default function EmployeeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const gate = usePermissionGate(["employees.read"]);
  const canReadDocuments = useHasPermission(["documents.read", "documents.view"]);
  const [activeTab, setActiveTab] = useState<"overview" | "org" | "documents" | "timeline">("overview");

  const { data: employee, isLoading, isError, refetch } = useEmployee(id, gate.isAuthorized);
  const { data: timeline = [] } = useEmployeeTimeline(id, gate.isAuthorized && activeTab === "timeline");
  const { data: documents = [] } = useEmployeeDocuments(id, gate.isAuthorized && canReadDocuments && activeTab === "documents");

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
  const initial = employee.fullName ? employee.fullName.charAt(0).toUpperCase() : "U";

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
                  <AvatarImage src={employee.avatarUrl || employee.profilePhoto || ""} alt={employee.fullName} />
                ) : null}
                <AvatarFallback className="text-base">{initial}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold tracking-tight text-foreground">{employee.fullName}</h1>
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

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
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

      {/* 3. Detail Tabs (Studio Admin Tabs) */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "org" | "documents" | "timeline")} className="w-full">
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="org">Hierarchy</TabsTrigger>
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
                  <span className="text-muted-foreground">Phone (HR Contact)</span>
                  <span className="font-medium text-foreground">{employee.phone || "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground">Bangalore HQ</span>
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
                Organizational Reporting Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="p-4 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Reports To</p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {employee.managerName || "Senior Leadership"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Manager ID: {employee.managerId || "Direct Tenant Root"}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border/60">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Department & Team</p>
                <p className="text-sm font-bold text-foreground mt-1">{deptName}</p>
                <p className="text-xs text-muted-foreground">Designation: {desigName}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Documents */}
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

        {/* Tab 4: Timeline */}
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
    </div>
  );
}
