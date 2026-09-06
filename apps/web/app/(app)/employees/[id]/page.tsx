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
  Loader2,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  UploadCloud,
  Users
} from "lucide-react";
import {
  formatEmploymentStatus,
  formatEmploymentType,
  useAssignEmployeeOrgMutation,
  useAssignEmployeeLocationMutation,
  useAssignEmployeeShiftMutation,
  useAssignMembershipRolesMutation,
  useBusinessUnits,
  useDepartments,
  useDesignations,
  useDeleteEmployeeDocumentMutation,
  useAssignReportingManagerMutation,
  useEmployeeFaceProfile,
  useEmployeeLetters,
  useEmployee,
  useEmployeeAssets,
  useEmployeeDocuments,
  useEmployeeLeaveBalances,
  useEmployeeTimeline,
  useEmployees,
  useInviteEmployeeAccountMutation,
  useLocations,
  useResetMembershipAccessMutation,
  useShifts,
  useTeams,
  useTenantRoles,
  useUpdateEmployeeBankDetailsMutation,
  useUpdateEmployeeProfile,
  useUpdateEmployeeStatus,
  useUpdateMembershipStatusMutation,
  useUploadEmployeeDocumentMutation,
  type BankDetailsInput
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

function currentShiftAssignment(employee: { shiftAssignments?: Array<{ startsOn?: string; endsOn?: string | null; shift?: { id?: string; name?: string; code?: string; startsAtMinute?: number; endsAtMinute?: number } | null | undefined }> | undefined }) {
  return employee.shiftAssignments?.find((assignment) => assignment.shift) ?? null;
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

function accessLevel(count: number) {
  if (count >= 3) return "Enabled";
  if (count > 0) return "Limited";
  return "No access";
}

function accountStatusLabel(status?: string | null, hasMembership?: boolean) {
  if (!hasMembership) return "No Account";
  if (status === "INVITED") return "Invited";
  if (status === "ACTIVE") return "Active";
  if (status === "SUSPENDED") return "Suspended";
  if (status === "REMOVED") return "Disabled";
  return "No Account";
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptyBankForm: BankDetailsInput = {
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifsc: "",
  branch: "",
  accountType: "SALARY"
};

const bankFields: Array<[keyof BankDetailsInput, string, string]> = [
  ["accountHolderName", "Account Holder Name", "name"],
  ["bankName", "Bank Name", "organization"],
  ["accountNumber", "Account Number", "off"],
  ["confirmAccountNumber", "Confirm Account Number", "off"],
  ["ifsc", "IFSC", "off"],
  ["branch", "Branch", "address-level2"]
];

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
  const canUploadDocuments = useHasPermission(["documents.upload", "documents.metadata.create"]);
  const canReadLeave = useHasPermission("leave.view");
  const canReadPayroll = useHasPermission(["payroll.view", "compensation.view"]);
  const canManagePayroll = useHasPermission(["payroll.manage", "compensation.manage"]);
  const canInviteUsers = useHasPermission("users.invite");
  const canUpdateUsers = useHasPermission("users.update");
  const canDeactivateUsers = useHasPermission("users.deactivate");
  const canResetAccess = useHasPermission("users.reset_access");
  const canReadRoles = useHasPermission("roles.read");
  const canManageShifts = useHasPermission("attendance.shifts.manage");
  const canReadFace = useHasPermission("face.view");
  const canGenerateLetters = useHasPermission("letters.generate");
  const canReadAssets = useHasPermission("assets.view");

  const [activeTab, setActiveTab] = useState<EmployeeTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [statusInput, setStatusInput] = useState("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [managerInput, setManagerInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");
  const [businessUnitInput, setBusinessUnitInput] = useState("");
  const [teamInput, setTeamInput] = useState("");
  const [shiftInput, setShiftInput] = useState("");
  const [shiftStartsOn, setShiftStartsOn] = useState(new Date().toISOString().slice(0, 10));
  const [shiftEndsOn, setShiftEndsOn] = useState("");
  const [roleInputs, setRoleInputs] = useState<string[]>([]);
  const [inviteRoleInputs, setInviteRoleInputs] = useState<string[]>(["EMPLOYEE"]);
  const [bankForm, setBankForm] = useState<BankDetailsInput>(emptyBankForm);
  const [documentType, setDocumentType] = useState<"PAN" | "AADHAAR" | "PASSPORT" | "DRIVING_LICENSE" | "OFFER_LETTER" | "APPOINTMENT_LETTER" | "PAYSLIP" | "TAX_DOCUMENT" | "CERTIFICATE" | "CUSTOM">("CUSTOM");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const employeeQuery = useEmployee(id, gate.isAuthorized);
  const employee = employeeQuery.data;
  const { data: employees = [] } = useEmployees({ limit: 100 }, gate.isAuthorized && canManageOrg);
  const { data: departments = [] } = useDepartments(gate.isAuthorized && canManageOrg);
  const { data: designations = [] } = useDesignations(gate.isAuthorized && canManageOrg);
  const { data: businessUnits = [] } = useBusinessUnits(gate.isAuthorized && canManageOrg);
  const { data: teams = [] } = useTeams(gate.isAuthorized && canManageOrg);
  const { data: locations = [] } = useLocations({}, gate.isAuthorized && canAssignLocation);
  const { data: shifts = [] } = useShifts(gate.isAuthorized && canManageShifts);
  const { data: tenantRoles = [] } = useTenantRoles(gate.isAuthorized && canReadRoles);
  const { data: documents = [] } = useEmployeeDocuments(id, gate.isAuthorized && canReadDocuments && activeTab === "documents");
  const { data: timeline = [] } = useEmployeeTimeline(id, gate.isAuthorized && activeTab === "activity");
  const { data: leaveBalances = [] } = useEmployeeLeaveBalances(id, gate.isAuthorized && canReadLeave && activeTab === "attendance");
  const assetsQuery = useEmployeeAssets(id, gate.isAuthorized && canReadAssets && activeTab === "documents");
  const faceProfileQuery = useEmployeeFaceProfile(id, gate.isAuthorized && canReadFace && activeTab === "documents");
  const { data: letters = [] } = useEmployeeLetters(id, gate.isAuthorized && activeTab === "documents");

  const updateProfile = useUpdateEmployeeProfile();
  const updateStatus = useUpdateEmployeeStatus();
  const assignManager = useAssignReportingManagerMutation(id);
  const assignLocation = useAssignEmployeeLocationMutation(id);
  const assignOrg = useAssignEmployeeOrgMutation(id);
  const assignShift = useAssignEmployeeShiftMutation(id);
  const inviteAccount = useInviteEmployeeAccountMutation(id);
  const assignRoles = useAssignMembershipRolesMutation(id);
  const updateMembershipStatus = useUpdateMembershipStatusMutation(id);
  const resetAccess = useResetMembershipAccessMutation(id);
  const updateBank = useUpdateEmployeeBankDetailsMutation(id);
  const uploadDocument = useUploadEmployeeDocumentMutation(id);
  const deleteDocument = useDeleteEmployeeDocumentMutation(id);

  const name = employee?.fullName || "Employee";
  const initial = name.trim().charAt(0).toUpperCase();
  const locationName = employee ? currentLocation(employee) : null;
  const shiftAssignment = employee ? currentShiftAssignment(employee) : null;
  const shift = shiftAssignment?.shift ?? null;
  const primaryMembership = employee?.memberships?.[0];
  const accountStatus = accountStatusLabel(primaryMembership?.status ?? primaryMembership?.user?.status, Boolean(primaryMembership));
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

  const openOrg = () => {
    setDepartmentInput(employee.departmentId ?? "");
    setDesignationInput(employee.designationId ?? "");
    setBusinessUnitInput(employee.businessUnit?.id ?? "");
    setTeamInput(employee.team?.id ?? "");
    setError(null);
    setOrgOpen(true);
  };

  const openShift = () => {
    setShiftInput(shift?.id ?? "");
    setShiftStartsOn(new Date().toISOString().slice(0, 10));
    setShiftEndsOn("");
    setError(null);
    setShiftOpen(true);
  };

  const openRoles = () => {
    setRoleInputs(roles.map((role) => role?.code).filter(Boolean) as string[]);
    setError(null);
    setRolesOpen(true);
  };

  const openAccount = () => {
    setInviteRoleInputs(roles.length ? (roles.map((role) => role?.code).filter(Boolean) as string[]) : ["EMPLOYEE"]);
    setError(null);
    setAccountOpen(true);
  };

  const openBank = () => {
    setBankForm({
      ...emptyBankForm,
      accountHolderName: typeof bank.accountHolderName === "string" ? bank.accountHolderName : "",
      bankName: typeof bank.bankName === "string" ? bank.bankName : "",
      branch: typeof bank.branch === "string" ? bank.branch : "",
      accountType: ["SAVINGS", "CURRENT", "SALARY"].includes(String(bank.accountType)) ? (bank.accountType as BankDetailsInput["accountType"]) : "SALARY"
    });
    setError(null);
    setBankOpen(true);
  };

  const toggleRoleInput = (code: string, target: "assign" | "invite" = "assign") => {
    const setter = target === "assign" ? setRoleInputs : setInviteRoleInputs;
    setter((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
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

  async function submitOrg() {
    try {
      if (!departmentInput || !designationInput) throw new Error("Choose a department and designation before saving.");
      await updateProfile.mutateAsync({ id, data: { departmentId: departmentInput, designationId: designationInput } });
      await assignOrg.mutateAsync({
        departmentId: departmentInput,
        businessUnitId: businessUnitInput || null,
        teamId: teamInput || null
      });
      setOrgOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Organization assignment failed.");
    }
  }

  async function submitShift() {
    try {
      if (!shiftInput) throw new Error("Choose a shift before saving.");
      await assignShift.mutateAsync({
        shiftId: shiftInput,
        startsOn: new Date(shiftStartsOn).toISOString(),
        endsOn: shiftEndsOn ? new Date(shiftEndsOn).toISOString() : null,
        reason: "Employee record shift assignment"
      });
      setShiftOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Shift assignment failed.");
    }
  }

  async function submitInviteAccount() {
    try {
      if (!employee?.email) throw new Error("Employee work email is required before inviting an account.");
      if (inviteRoleInputs.length === 0) throw new Error("Choose at least one tenant role.");
      await inviteAccount.mutateAsync({
        email: employee.email,
        roles: inviteRoleInputs,
        ...(employee.phone ? { phone: employee.phone } : {})
      });
      setAccountOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account invite failed.");
    }
  }

  async function submitRoles() {
    try {
      if (!primaryMembership?.id) throw new Error("Create an account before assigning roles.");
      if (roleInputs.length === 0) throw new Error("Choose at least one tenant role.");
      await assignRoles.mutateAsync({ membershipId: primaryMembership.id, roles: roleInputs });
      setRolesOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role assignment failed.");
    }
  }

  async function updateAccountStatus(status: "ACTIVE" | "SUSPENDED" | "REMOVED") {
    try {
      if (!primaryMembership?.id) throw new Error("No account is linked to this employee.");
      await updateMembershipStatus.mutateAsync({ membershipId: primaryMembership.id, status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account status update failed.");
    }
  }

  async function resendInvite() {
    try {
      if (primaryMembership?.id) {
        await resetAccess.mutateAsync({ membershipId: primaryMembership.id, reason: "Resend invite or activation link from employee access tab" });
      } else {
        await submitInviteAccount();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite resend failed.");
    }
  }

  async function submitBank() {
    try {
      await updateBank.mutateAsync(bankForm);
      setBankOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bank update failed.");
    }
  }

  async function submitDocument() {
    try {
      if (!documentFile) throw new Error("Choose a document file before uploading.");
      if (!documentTitle.trim()) throw new Error("Document title is required.");
      const fileBase64 = await readFileAsBase64(documentFile);
      await uploadDocument.mutateAsync({
        employeeId: id,
        documentType,
        title: documentTitle.trim(),
        fileName: documentFile.name,
        fileBase64,
        fileSize: documentFile.size,
        mimeType: documentFile.type || "application/pdf",
        metadata: { source: "employee_detail" }
      });
      setDocumentOpen(false);
      setDocumentTitle("");
      setDocumentFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document upload failed.");
    }
  }

  async function removeDocument(documentId: string) {
    try {
      await deleteDocument.mutateAsync(documentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Document delete failed.");
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
              {canManageOrg && (
                <Button variant="outline" size="sm" onClick={openOrg}>
                  <Layers className="mr-1.5 size-3.5" />
                  Org
                </Button>
              )}
              {canAssignLocation && (
                <Button variant="outline" size="sm" onClick={openLocation}>
                  <MapPin className="mr-1.5 size-3.5" />
                  Location
                </Button>
              )}
              {canManageShifts && (
                <Button variant="outline" size="sm" onClick={openShift}>
                  <CalendarClock className="mr-1.5 size-3.5" />
                  Shift
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
            <div className="mt-4 grid gap-2">
              {!primaryMembership && canInviteUsers ? (
                <Button size="sm" onClick={openAccount}>
                  <Plus className="mr-1.5 size-3.5" />
                  Create / Invite Account
                </Button>
              ) : null}
              {primaryMembership && canResetAccess ? (
                <Button variant="outline" size="sm" onClick={resendInvite} disabled={resetAccess.isPending}>
                  {resetAccess.isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Mail className="mr-1.5 size-3.5" />}
                  Resend Invite
                </Button>
              ) : null}
              {primaryMembership && canUpdateUsers && canReadRoles ? (
                <Button variant="outline" size="sm" onClick={openRoles}>
                  <ShieldCheck className="mr-1.5 size-3.5" />
                  Manage Roles
                </Button>
              ) : null}
              {primaryMembership && accountStatus === "Active" && canDeactivateUsers ? (
                <Button variant="outline" size="sm" onClick={() => updateAccountStatus("SUSPENDED")} disabled={updateMembershipStatus.isPending}>
                  Suspend Login
                </Button>
              ) : null}
              {primaryMembership && ["Suspended", "Disabled", "Invited"].includes(accountStatus) && canDeactivateUsers ? (
                <Button variant="outline" size="sm" onClick={() => updateAccountStatus("ACTIVE")} disabled={updateMembershipStatus.isPending}>
                  Reactivate Login
                </Button>
              ) : null}
              {error && activeTab === "access" ? <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p> : null}
            </div>
          </SectionCard>
          <SectionCard title="Effective Permissions" icon={ShieldCheck}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {permissionGroupSummary(permissionSummary).map((group) => (
                <div key={group.label} className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-foreground">{group.label}</p>
                  <p className="mt-1 text-[11px] font-semibold text-foreground">{accessLevel(group.count)}</p>
                  <p className="text-[11px] text-muted-foreground">{group.count ? `${group.count} permissions` : "No effective permission"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 grid gap-4 md:grid-cols-2">
          <SectionCard title="Attendance & Leave" icon={CalendarClock}>
            <InfoRow label="Current shift" value={shift ? `${shift.name} (${shift.code ?? "no code"})` : "Not configured"} />
            <InfoRow label="Shift window" value={shift ? `${minutesToTime(shift.startsAtMinute)}-${minutesToTime(shift.endsAtMinute)}` : "Not configured"} />
            <InfoRow label="Effective date" value={shiftAssignment?.startsOn ? formatDate(shiftAssignment.startsOn) : "Not configured"} />
            <InfoRow label="Location dependency" value={display(locationName)} />
            <div className="flex flex-wrap gap-2 pt-3">
              {canManageShifts ? (
                <Button variant="outline" size="sm" onClick={openShift}>
                  Assign Shift
                </Button>
              ) : null}
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
              {canManagePayroll ? (
                <Button variant="outline" size="sm" className="mt-4" onClick={openBank}>
                  Update Bank Details
                </Button>
              ) : null}
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
              <CardHeader className="flex-row items-center justify-between border-b border-border pb-3">
                <CardTitle className="text-xs font-semibold">Document Vault</CardTitle>
                {canUploadDocuments ? (
                  <Button size="sm" variant="outline" onClick={() => { setError(null); setDocumentOpen(true); }}>
                    <UploadCloud className="mr-1.5 size-3.5" />
                    Upload
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="p-0">
                {documents.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => {
                        const metadataDoc = doc as typeof doc & { status?: string; version?: number; downloadUrl?: string };
                        return (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium text-foreground">{doc.fileName || doc.title || doc.documentType}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{doc.documentType}</TableCell>
                          <TableCell><Badge variant={doc.isVerified ? "success" : "secondary"} className="text-[10px]">{doc.isVerified ? "Verified" : metadataDoc.status ?? "Pending"}</Badge></TableCell>
                          <TableCell className="font-mono text-xs">{metadataDoc.version ?? "1"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {metadataDoc.downloadUrl ? (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={metadataDoc.downloadUrl}>Download</a>
                                </Button>
                              ) : null}
                              {canUploadDocuments ? (
                                <Button variant="outline" size="sm" onClick={() => removeDocument(doc.id)} disabled={deleteDocument.isPending}>
                                  Delete
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
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
            <InfoRow label="Letters" value={letters.length ? `${letters.length} generated` : canGenerateLetters ? "Generator available" : "Restricted"} />
            <InfoRow label="Biometric" value={faceProfileQuery.isSuccess ? "Enrollment state available" : canReadFace ? "Not enrolled or unavailable" : "Restricted"} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={"/documents" as Route}>Open Documents</Link>
              </Button>
              {canGenerateLetters ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={"/ess/letters" as Route}>Open Letters</Link>
                </Button>
              ) : null}
            </div>
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

      <Dialog open={orgOpen} onOpenChange={setOrgOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Organization Assignment</DialogTitle>
            <DialogDescription>Uses existing departments, designations, business units, and teams.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {error && <p className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <select id="department" value={departmentInput} onChange={(event) => setDepartmentInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                <option value="">Choose department</option>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <select id="designation" value={designationInput} onChange={(event) => setDesignationInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                <option value="">Choose designation</option>
                {designations.map((designation) => <option key={designation.id} value={designation.id}>{designation.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business-unit">Business Unit</Label>
              <select id="business-unit" value={businessUnitInput} onChange={(event) => setBusinessUnitInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                <option value="">Not assigned</option>
                {businessUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team">Team</Label>
              <select id="team" value={teamInput} onChange={(event) => setTeamInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                <option value="">Not assigned</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrgOpen(false)}>Cancel</Button>
            <Button onClick={submitOrg} disabled={updateProfile.isPending || assignOrg.isPending}>{updateProfile.isPending || assignOrg.isPending ? "Saving..." : "Save assignment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shiftOpen} onOpenChange={setShiftOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Shift</DialogTitle>
            <DialogDescription>Creates an audited shift assignment in Attendance Operations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="shift">Shift</Label>
              <select id="shift" value={shiftInput} onChange={(event) => setShiftInput(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                <option value="">Choose shift</option>
                {shifts.map((item) => <option key={item.id} value={item.id}>{item.name} · {minutesToTime(item.startsAtMinute)}-{minutesToTime(item.endsAtMinute)}</option>)}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="shift-starts">Effective Date</Label>
                <Input id="shift-starts" type="date" value={shiftStartsOn} onChange={(event) => setShiftStartsOn(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shift-ends">End Date</Label>
                <Input id="shift-ends" type="date" value={shiftEndsOn} onChange={(event) => setShiftEndsOn(event.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShiftOpen(false)}>Cancel</Button>
              <Button onClick={submitShift} disabled={assignShift.isPending}>{assignShift.isPending ? "Assigning..." : "Assign shift"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create / Invite Account</DialogTitle>
            <DialogDescription>Links this employee to a tenant login account without exposing passwords.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <InfoRow label="Work email" value={employee.email} />
            <div className="grid gap-2">
              {tenantRoles.map((role) => (
                <label key={role.id} className="flex items-start gap-3 rounded-md border border-border p-3 text-xs">
                  <input type="checkbox" checked={inviteRoleInputs.includes(role.code)} onChange={() => toggleRoleInput(role.code, "invite")} className="mt-0.5" />
                  <span><span className="block font-semibold">{role.name}</span><span className="font-mono text-[10px] text-muted-foreground">{role.code}</span></span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAccountOpen(false)}>Cancel</Button>
              <Button onClick={submitInviteAccount} disabled={inviteAccount.isPending}>{inviteAccount.isPending ? "Inviting..." : "Send invite"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rolesOpen} onOpenChange={setRolesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Tenant Roles</DialogTitle>
            <DialogDescription>Role changes use the canonical Users & Access RBAC endpoint.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
              {tenantRoles.map((role) => (
                <label key={role.id} className="flex items-start gap-3 rounded-md border border-border p-3 text-xs">
                  <input type="checkbox" checked={roleInputs.includes(role.code)} onChange={() => toggleRoleInput(role.code)} className="mt-0.5" />
                  <span><span className="block font-semibold">{role.name}</span><span className="font-mono text-[10px] text-muted-foreground">{role.code}</span></span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRolesOpen(false)}>Cancel</Button>
              <Button onClick={submitRoles} disabled={assignRoles.isPending}>{assignRoles.isPending ? "Saving..." : "Save roles"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bankOpen} onOpenChange={setBankOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Bank Details</DialogTitle>
            <DialogDescription>Existing account numbers stay write-only; standard People responses remain masked.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {error && <p className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            {bankFields.map(([key, label, autocomplete]) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`bank-${key}`}>{label}</Label>
                <Input
                  id={`bank-${key}`}
                  type={key.includes("accountNumber") ? "password" : "text"}
                  autoComplete={autocomplete}
                  value={String(bankForm[key as keyof BankDetailsInput] ?? "")}
                  onChange={(event) => setBankForm((current) => ({ ...current, [key]: event.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label htmlFor="bank-account-type">Account Type</Label>
              <select id="bank-account-type" value={bankForm.accountType} onChange={(event) => setBankForm((current) => ({ ...current, accountType: event.target.value as BankDetailsInput["accountType"] }))} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                {["SALARY", "SAVINGS", "CURRENT"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankOpen(false)}>Cancel</Button>
            <Button onClick={submitBank} disabled={updateBank.isPending}>{updateBank.isPending ? "Saving..." : "Save bank details"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={documentOpen} onOpenChange={setDocumentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Employee Document</DialogTitle>
            <DialogDescription>Stores the file through Document Vault using a tenant and employee scoped object key.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="document-title">Title</Label>
                <Input id="document-title" value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="document-type">Type</Label>
                <select id="document-type" value={documentType} onChange={(event) => setDocumentType(event.target.value as typeof documentType)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs">
                  {["PAN", "AADHAAR", "PASSPORT", "DRIVING_LICENSE", "OFFER_LETTER", "APPOINTMENT_LETTER", "PAYSLIP", "TAX_DOCUMENT", "CERTIFICATE", "CUSTOM"].map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="document-file">File</Label>
              <Input id="document-file" type="file" accept="application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDocumentOpen(false)}>Cancel</Button>
              <Button onClick={submitDocument} disabled={uploadDocument.isPending}>{uploadDocument.isPending ? "Uploading..." : "Upload"}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
