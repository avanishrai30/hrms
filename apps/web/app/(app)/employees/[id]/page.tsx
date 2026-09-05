"use client";

import React, { useMemo, useState, use } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  CalendarClock,
  CircleUser,
  FileCheck,
  Fingerprint,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  Users
} from "lucide-react";
import {
  formatEmploymentStatus,
  formatEmploymentType,
  useAssignEmployeeLocationMutation,
  useAssignReportingManagerMutation,
  useEmployee,
  useEmployeeAssets,
  useEmployeeDocuments,
  useEmployeeLeaveBalances,
  useEmployeeTimeline,
  useEmployees,
  useLocations,
  useUpdateEmployeeProfile,
  useUpdateEmployeeStatus
} from "../../../../lib/queries/use-people-queries";
import { useHasPermission, usePermissionGate } from "../../../../lib/session-store";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

type EmployeeTab = "overview" | "employment" | "organization" | "access" | "attendance" | "payroll" | "documents" | "activity";

function relationName(value: unknown, fallback = "Not assigned") {
  if (!value) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "object" && "name" in value && typeof value.name === "string") return value.name || fallback;
  return fallback;
}

function display(value: string | number | null | undefined, fallback = "Not assigned") {
  if (typeof value === "number") return String(value);
  return value && value.trim() ? value : fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "Unavailable";
  return new Date(value).toLocaleDateString();
}

function statusVariant(status?: string) {
  if (status === "ACTIVE") return "success";
  if (status === "PROBATION" || status === "INVITED" || status === "NOTICE_PERIOD") return "warning";
  if (status === "ARCHIVED" || status === "INACTIVE") return "secondary";
  return "outline";
}

function currentLocation(employee: { location?: { name?: string } | null | undefined; locationAssignments?: Array<{ location?: { name?: string; code?: string } | null | undefined }> | undefined }) {
  return employee.location?.name ?? employee.locationAssignments?.find((assignment) => assignment.location)?.location?.name ?? null;
}

function currentShift(employee: { shiftAssignments?: Array<{ shift?: { name?: string; code?: string; startsAtMinute?: number; endsAtMinute?: number } | null | undefined }> | undefined }) {
  return employee.shiftAssignments?.find((assignment) => assignment.shift)?.shift ?? null;
}

function minutesToTime(minutes?: number) {
  if (typeof minutes !== "number") return "Not configured";
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function maskValue(value: unknown) {
  return typeof value === "string" && value ? value : "Not configured";
}

function permissionGroupSummary(permissions: string[] | undefined) {
  const groups: Array<[string, string[]]> = [
    ["People", ["employees.", "departments.", "designations.", "organization."]],
    ["Attendance", ["attendance.", "location."]],
    ["Leave", ["leave."]],
    ["Payroll", ["payroll.", "compensation."]],
    ["Documents", ["documents."]],
    ["AI", ["ai.", "knowledge."]],
    ["Assets", ["assets."]],
    ["Performance", ["performance.", "goals."]],
    ["Learning", ["learning."]],
    ["Analytics", ["analytics.", "reports."]],
    ["Admin", ["tenant.", "users.", "roles."]]
  ];
  return groups.map(([label, prefixes]) => ({
    label,
    count: (permissions ?? []).filter((permission) => prefixes.some((prefix) => permission.startsWith(prefix))).length
  }));
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-2 last:border-b-0">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
          <Icon className="size-3.5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function RestrictedCard({ title, permission }: { title: string; permission: string }) {
  return (
    <Card className="border-border p-6 text-center shadow-xs">
      <Lock className="mx-auto mb-2 size-6 text-amber-500" />
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">Requires {permission} permission.</p>
    </Card>
  );
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const gate = usePermissionGate(["employees.read"]);
  const canUpdate = useHasPermission("employees.update");
  const canUpdateStatus = useHasPermission("employees.status.update");
  const canManageOrg = useHasPermission("organization.manage");
  const canAssignLocation = useHasPermission("location.assign");
  const canReadDocuments = useHasPermission(["documents.read", "documents.view"]);
  const canReadLeave = useHasPermission("leave.view");
  const canReadPayroll = useHasPermission(["payroll.view", "compensation.view"]);
  const canReadAssets = useHasPermission("assets.view");

  const [activeTab, setActiveTab] = useState<EmployeeTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [statusInput, setStatusInput] = useState("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [managerInput, setManagerInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const employeeQuery = useEmployee(id, gate.isAuthorized);
  const employee = employeeQuery.data;
  const { data: employees = [] } = useEmployees({ limit: 100 }, gate.isAuthorized && canManageOrg);
  const { data: locations = [] } = useLocations({}, gate.isAuthorized && canAssignLocation);
  const { data: documents = [] } = useEmployeeDocuments(id, gate.isAuthorized && canReadDocuments && activeTab === "documents");
  const { data: timeline = [] } = useEmployeeTimeline(id, gate.isAuthorized && activeTab === "activity");
  const { data: leaveBalances = [] } = useEmployeeLeaveBalances(id, gate.isAuthorized && canReadLeave && activeTab === "attendance");
  const assetsQuery = useEmployeeAssets(id, gate.isAuthorized && canReadAssets && activeTab === "documents");

  const updateProfile = useUpdateEmployeeProfile();
  const updateStatus = useUpdateEmployeeStatus();
  const assignManager = useAssignReportingManagerMutation(id);
  const assignLocation = useAssignEmployeeLocationMutation(id);

  const name = employee?.fullName || "Employee";
  const initial = name.trim().charAt(0).toUpperCase();
  const locationName = employee ? currentLocation(employee) : null;
  const shift = employee ? currentShift(employee) : null;
  const primaryMembership = employee?.memberships?.[0];
  const accountStatus = primaryMembership?.user?.status ?? primaryMembership?.status ?? (primaryMembership ? "Linked" : "Not invited");
  const permissionSummary = employee?.permissionsSummary?.permissions ?? [];
  const roles = employee?.permissionsSummary?.roles ?? primaryMembership?.roles?.map((assignment) => assignment.role).filter(Boolean) ?? [];
  const bank = employee?.bankDetails ?? {};
  const assets = Array.isArray(assetsQuery.data) ? assetsQuery.data : assetsQuery.data?.items ?? [];
  const directReports = useMemo(() => employees.filter((item) => item.managerEmployeeId === id), [employees, id]);

  if (gate.isLoading || (gate.isAuthorized && employeeQuery.isLoading)) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/40" />
        <div className="h-80 animate-pulse rounded-lg border border-border bg-muted/30" />
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="w-full max-w-md border-border p-6 text-center shadow-xs">
          <ShieldCheck className="mx-auto mb-2 size-8 text-amber-500" />
          <p className="text-sm font-semibold text-foreground">Profile Access Restricted</p>
          <p className="mt-1 text-xs text-muted-foreground">You need employee read permission to access this profile.</p>
        </Card>
      </div>
    );
  }

  if (employeeQuery.isError || !employee) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="w-full max-w-md border-border p-6 text-center shadow-xs">
          <AlertCircle className="mx-auto mb-2 size-8 text-destructive" />
          <p className="text-sm font-semibold text-foreground">Record Unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">Unable to retrieve this employee record.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={"/employees" as Route}>Back</Link>
            </Button>
            <Button size="sm" onClick={() => employeeQuery.refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const openEdit = () => {
    setPhoneInput(employee.phone ?? "");
    setError(null);
    setEditOpen(true);
  };

  const openStatus = () => {
    setStatusInput(employee.status ?? "ACTIVE");
    setStatusReason("");
    setError(null);
    setStatusOpen(true);
  };

  const openManager = () => {
    setManagerInput(employee.managerEmployeeId ?? "");
    setError(null);
    setManagerOpen(true);
  };

  const openLocation = () => {
    setLocationInput(employee.locationAssignments?.[0]?.location?.id ?? "");
    setError(null);
    setLocationOpen(true);
  };

  async function submitProfile(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync({ id, data: { phone: phoneInput.trim() || undefined } });
      setEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile update failed.");
    }
  }

  async function submitStatus() {
    try {
      await updateStatus.mutateAsync({ id, status: statusInput, reason: statusReason });
      setStatusOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    }
  }

  async function submitManager() {
    try {
      await assignManager.mutateAsync(managerInput || null);
      setManagerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manager assignment failed.");
    }
  }

  async function submitLocation() {
    try {
      if (!locationInput) throw new Error("Choose a location before saving.");
      await assignLocation.mutateAsync(locationInput);
      setLocationOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Location assignment failed.");
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
          <Link href={"/employees" as Route}>
            <ArrowLeft className="mr-1.5 size-3.5" />
            Employees
          </Link>
        </Button>
        <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
          Tenant isolated profile
        </Badge>
      </div>

      <Card className="overflow-hidden border-border shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 border border-border">
                {employee.avatarUrl || employee.profilePhoto ? <AvatarImage src={employee.avatarUrl || employee.profilePhoto || ""} alt={name} /> : null}
                <AvatarFallback className="text-lg">{initial || <CircleUser className="size-7 text-muted-foreground" />}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{name}</h1>
                  <Badge variant={statusVariant(employee.status)}>{formatEmploymentStatus(employee.status)}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono text-foreground">{employee.employeeCode}</span>
                  <span>{relationName(employee.designation)}</span>
                  <span>{relationName(employee.department)}</span>
                  <span>{display(locationName)}</span>
                  <span>Manager: {display(employee.manager?.fullName ?? employee.managerName)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {canUpdate && (
                <Button variant="outline" size="sm" onClick={openEdit}>
                  <Pencil className="mr-1.5 size-3.5" />
                  Edit
                </Button>
              )}
              {canManageOrg && (
                <Button variant="outline" size="sm" onClick={openManager}>
                  <Users className="mr-1.5 size-3.5" />
                  Manager
                </Button>
              )}
              {canAssignLocation && (
                <Button variant="outline" size="sm" onClick={openLocation}>
                  <MapPin className="mr-1.5 size-3.5" />
                  Location
                </Button>
              )}
              {canUpdateStatus && (
                <Button variant="outline" size="sm" onClick={openStatus}>
                  <AlertTriangle className="mr-1.5 size-3.5" />
                  Status
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EmployeeTab)}>
        <TabsList className="grid h-auto grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="organization">Org</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="attendance">Time</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
          <TabsTrigger value="activity">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard title="Personal Information" icon={Mail}>
              <InfoRow label="Work email" value={display(employee.email, "No work email")} />
              <InfoRow label="Phone" value={display(employee.phone, "No phone")} />
              <InfoRow label="Preferred name" value={display(employee.preferredName, "Not provided")} />
              <InfoRow label="Personal email" value={display(employee.personalEmail, "Not provided")} />
            </SectionCard>
            <SectionCard title="Work Snapshot" icon={BriefcaseBusiness}>
              <InfoRow label="Department" value={relationName(employee.department)} />
              <InfoRow label="Designation" value={relationName(employee.designation)} />
              <InfoRow label="Location" value={display(locationName)} />
              <InfoRow label="Shift" value={shift ? `${shift.name} (${minutesToTime(shift.startsAtMinute)}-${minutesToTime(shift.endsAtMinute)})` : "Not configured"} />
            </SectionCard>
            <SectionCard title="Readiness" icon={BadgeCheck}>
              <InfoRow label="Profile completion" value={`${employee.profileCompletionScore ?? 0}%`} />
              <InfoRow label="Account" value={accountStatus} />
              <InfoRow label="Direct reports" value={employee.directReportsCount ?? directReports.length} />
              <InfoRow label="Documents" value={`${employee.documents?.length ?? documents.length} metadata records`} />
            </SectionCard>
            <SectionCard title="Operations Context" icon={Fingerprint}>
              <InfoRow label="Attendance today" value="Open Attendance tab" />
              <InfoRow label="Leave balance" value={canReadLeave ? `${leaveBalances.length} balance records` : "Restricted"} />
              <InfoRow label="Latest payslip" value={canReadPayroll ? "Open Payroll tab" : "Restricted"} />
              <InfoRow label="Face readiness" value={employee.faceProfile ? "Profile available" : "Not configured"} />
            </SectionCard>
          </div>
          <Card className="border-border shadow-xs">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-xs font-semibold">Setup Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {[
                ["Manager", Boolean(employee.managerEmployeeId)],
                ["Location", Boolean(locationName)],
                ["Shift", Boolean(shift)],
                ["Account roles", roles.length > 0],
                ["Bank details", Boolean(bank.maskedAccountNumber || bank.hasAccountNumber)]
              ].map(([label, complete]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs">
                  <span>{label}</span>
                  <Badge variant={complete ? "success" : "secondary"} className="text-[10px]">
                    {complete ? "Ready" : "Needs setup"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="mt-4 grid gap-4 md:grid-cols-2">
          <SectionCard title="Employment Information" icon={BriefcaseBusiness}>
            <InfoRow label="Employee ID" value={employee.employeeCode} />
            <InfoRow label="Joining date" value={formatDate(employee.joiningDate)} />
            <InfoRow label="Employment type" value={formatEmploymentType(employee.employmentType)} />
            <InfoRow label="Salary type" value={display(employee.salaryType, "Unavailable")} />
            <InfoRow label="Status" value={formatEmploymentStatus(employee.status)} />
          </SectionCard>
          <SectionCard title="Status History" icon={CalendarClock}>
            {employee.statusHistory?.length ? (
              <div className="space-y-3">
                {employee.statusHistory.slice(0, 6).map((event) => (
                  <div key={event.id} className="rounded-md border border-border p-3 text-xs">
                    <p className="font-medium text-foreground">{formatEmploymentStatus(event.previousStatus)} to {formatEmploymentStatus(event.newStatus)}</p>
                    <p className="mt-1 text-muted-foreground">{event.reason || "No reason recorded"}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{formatDate(event.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No status transitions recorded yet.</p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="organization" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Reporting & Organization" icon={Layers}>
            <InfoRow label="Business unit" value={relationName(employee.businessUnit)} />
            <InfoRow label="Team" value={relationName(employee.team)} />
            <InfoRow label="Department" value={relationName(employee.department)} />
            <InfoRow label="Designation" value={relationName(employee.designation)} />
            <InfoRow label="Reporting manager" value={display(employee.manager?.fullName ?? employee.managerName)} />
            <InfoRow label="Store / Location" value={display(locationName)} />
          </SectionCard>
          <SectionCard title="Direct Reports" icon={Users}>
            {directReports.length ? (
              <div className="space-y-2">
                {directReports.map((report) => (
                  <Link key={report.id} href={`/employees/${report.id}` as Route} className="flex items-center justify-between rounded-md border border-border p-3 text-xs hover:bg-muted/40">
                    <span>
                      <span className="block font-medium text-foreground">{report.fullName}</span>
                      <span className="text-muted-foreground">{report.employeeCode} · {relationName(report.designation)}</span>
                    </span>
                    <Badge variant={statusVariant(report.status)} className="text-[10px]">{formatEmploymentStatus(report.status)}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No direct reports are assigned to this employee.</p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="access" className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
          <SectionCard title="Account Provisioning" icon={KeyRound}>
            <InfoRow label="Account status" value={accountStatus} />
            <InfoRow label="Login email" value={display(primaryMembership?.user?.email ?? employee.email)} />
            <InfoRow label="Tenant roles" value={roles.length ? roles.map((role) => role?.name ?? role?.code).join(", ") : "No tenant roles"} />
          </SectionCard>
          <SectionCard title="Effective Permissions" icon={ShieldCheck}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {permissionGroupSummary(permissionSummary).map((group) => (
                <div key={group.label} className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-foreground">{group.label}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{group.count ? `${group.count} permissions` : "No access"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 grid gap-4 md:grid-cols-2">
          <SectionCard title="Attendance & Leave" icon={CalendarClock}>
            <InfoRow label="Current shift" value={shift ? `${shift.name} (${shift.code ?? "no code"})` : "Not configured"} />
            <InfoRow label="Shift window" value={shift ? `${minutesToTime(shift.startsAtMinute)}-${minutesToTime(shift.endsAtMinute)}` : "Not configured"} />
            <InfoRow label="Location dependency" value={display(locationName)} />
            <div className="pt-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/attendance?employeeId=${employee.id}` as Route}>Open Attendance</Link>
              </Button>
            </div>
          </SectionCard>
          {canReadLeave ? (
            <SectionCard title="Leave Balance" icon={BadgeCheck}>
              {leaveBalances.length ? (
                <div className="space-y-2">
                  {leaveBalances.map((balance) => (
                    <InfoRow key={balance.id} label={balance.leaveType?.name ?? "Leave"} value={`${balance.availableDays ?? 0} available`} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Leave balances are not configured for this employee.</p>
              )}
            </SectionCard>
          ) : (
            <RestrictedCard title="Leave data restricted" permission="leave.view" />
          )}
        </TabsContent>

        <TabsContent value="payroll" className="mt-4 grid gap-4 md:grid-cols-2">
          {canReadPayroll ? (
            <SectionCard title="Payroll & Bank" icon={Banknote}>
              <InfoRow label="Account holder" value={maskValue(bank.accountHolderName)} />
              <InfoRow label="Bank name" value={maskValue(bank.bankName)} />
              <InfoRow label="Account number" value={maskValue(bank.maskedAccountNumber)} />
              <InfoRow label="IFSC" value={maskValue(bank.ifsc)} />
              <InfoRow label="Branch" value={maskValue(bank.branch)} />
              <InfoRow label="Account type" value={maskValue(bank.accountType)} />
            </SectionCard>
          ) : (
            <RestrictedCard title="Payroll and bank data restricted" permission="payroll.view" />
          )}
          <SectionCard title="Payroll Links" icon={BriefcaseBusiness}>
            <p className="text-xs text-muted-foreground">Compensation, payslips, and statutory data remain in the payroll domain.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/payroll/employees/${employee.id}` as Route}>Compensation</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={"/payslips" as Route}>Payslips</Link>
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
          {canReadDocuments ? (
            <Card className="overflow-hidden border-border shadow-xs">
              <CardContent className="p-0">
                {documents.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Version</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => {
                        const metadataDoc = doc as typeof doc & { status?: string; version?: number };
                        return (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium text-foreground">{doc.fileName || doc.title || doc.documentType}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{doc.documentType}</TableCell>
                          <TableCell><Badge variant={doc.isVerified ? "success" : "secondary"} className="text-[10px]">{doc.isVerified ? "Verified" : metadataDoc.status ?? "Pending"}</Badge></TableCell>
                          <TableCell className="font-mono text-xs">{metadataDoc.version ?? "1"}</TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    <FileCheck className="mx-auto mb-2 size-8 opacity-40" />
                    <p className="font-semibold text-foreground">No document metadata</p>
                    <p className="mt-1">Uploads and letters appear here when stored through Document Vault.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <RestrictedCard title="Documents restricted" permission="documents.read" />
          )}
          <SectionCard title="Assets & Letters" icon={FileCheck}>
            <InfoRow label="Assigned assets" value={canReadAssets ? assets.length : "Restricted"} />
            <InfoRow label="Letters" value="Use Document Vault" />
            <Button variant="outline" size="sm" asChild className="mt-3">
              <Link href={"/documents" as Route}>Open Documents</Link>
            </Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="border-border p-5 shadow-xs">
            {timeline.length ? (
              <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-border">
                {timeline.map((event) => (
                  <div key={event.id} className="relative flex gap-4 pl-8">
                    <span className="absolute left-[7px] top-1.5 size-3 rounded-full border-2 border-background bg-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{event.title || event.eventType}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <CalendarClock className="mx-auto mb-2 size-8 opacity-40" />
                <p className="font-semibold text-foreground">No activity yet</p>
                <p className="mt-1">Audited employee events will appear in this timeline.</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update allowed employee contact fields only.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProfile} className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateProfile.isPending}>{updateProfile.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>Status changes are audit logged with reason and actor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={statusInput} onChange={(event) => setStatusInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                {["DRAFT", "INVITED", "ACTIVE", "PROBATION", "ON_LEAVE", "NOTICE_PERIOD", "INACTIVE", "ARCHIVED"].map((value) => <option key={value} value={value}>{formatEmploymentStatus(value)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status-reason">Reason</Label>
              <Input id="status-reason" value={statusReason} onChange={(event) => setStatusReason(event.target.value)} placeholder="Required audit reason" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
              <Button onClick={submitStatus} disabled={updateStatus.isPending}>{updateStatus.isPending ? "Updating..." : "Confirm"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={managerOpen} onOpenChange={setManagerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Reporting Manager</DialogTitle>
            <DialogDescription>Self-manager, circular, and cross-tenant assignments are rejected server-side.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <select value={managerInput} onChange={(event) => setManagerInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
              <option value="">No manager</option>
              {employees.filter((item) => item.id !== id).map((item) => <option key={item.id} value={item.id}>{item.fullName} · {item.employeeCode}</option>)}
            </select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setManagerOpen(false)}>Cancel</Button>
              <Button onClick={submitManager} disabled={assignManager.isPending}>{assignManager.isPending ? "Saving..." : "Save manager"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={locationOpen} onOpenChange={setLocationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Store / Location</DialogTitle>
            <DialogDescription>Uses Location assignment records; it does not overwrite department, role, or shift.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <select value={locationInput} onChange={(event) => setLocationInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
              <option value="">Choose location</option>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLocationOpen(false)}>Cancel</Button>
              <Button onClick={submitLocation} disabled={assignLocation.isPending}>{assignLocation.isPending ? "Assigning..." : "Assign"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
