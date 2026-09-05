"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  Download,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Users,
  Wrench
} from "lucide-react";
import {
  formatEmploymentStatus,
  formatEmploymentType,
  useDebounce,
  useDepartments,
  useDesignations,
  useEmployeesPage,
  useLocations
} from "../../../lib/queries/use-people-queries";
import { useHasPermission, usePermissionGate } from "../../../lib/session-store";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  ["ALL", "All statuses"],
  ["DRAFT", "Draft"],
  ["INVITED", "Invited"],
  ["ACTIVE", "Active"],
  ["PROBATION", "Probation"],
  ["ON_LEAVE", "On Leave"],
  ["NOTICE_PERIOD", "Notice Period"],
  ["INACTIVE", "Inactive"],
  ["ARCHIVED", "Archived"]
] as const;

const EMPLOYMENT_FILTERS = [
  ["ALL", "All types"],
  ["FULL_TIME", "Full Time"],
  ["PART_TIME", "Part Time"],
  ["CONTRACT", "Contract"],
  ["TEMPORARY", "Temporary"]
] as const;

function statusVariant(status?: string) {
  if (status === "ACTIVE") return "success";
  if (status === "PROBATION" || status === "INVITED" || status === "NOTICE_PERIOD") return "warning";
  if (status === "INACTIVE" || status === "ARCHIVED") return "secondary";
  return "outline";
}

function textOrFallback(value: string | null | undefined, fallback = "Not assigned") {
  return value && value.trim() ? value : fallback;
}

function relationName(value: unknown, fallback = "Not assigned") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "name" in value && typeof value.name === "string") return value.name;
  return fallback;
}

function currentLocation(employee: { location?: { name?: string } | null | undefined; locationAssignments?: Array<{ location?: { name?: string } | null | undefined }> | undefined }) {
  return employee.location?.name ?? employee.locationAssignments?.find((assignment) => assignment.location)?.location?.name ?? null;
}

function currentRole(employee: { designation?: unknown; memberships?: Array<{ roles?: Array<{ role?: { name?: string; code?: string } | undefined }> | undefined }> | undefined }) {
  const designation = relationName(employee.designation, "");
  const role = employee.memberships?.flatMap((membership) => membership.roles ?? []).find((assignment) => assignment.role)?.role;
  return designation || role?.name || role?.code || null;
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border shadow-xs">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployeesListPage() {
  const gate = usePermissionGate(["employees.read"]);
  const canCreate = useHasPermission("employees.create");
  const canExport = useHasPermission("employees.export");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [departmentId, setDepartmentId] = useState("ALL");
  const [designationId, setDesignationId] = useState("ALL");
  const [locationId, setLocationId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [employmentType, setEmploymentType] = useState("ALL");
  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      departmentId,
      designationId,
      locationId,
      status,
      employmentType,
      page,
      limit: PAGE_SIZE,
      archived: status === "ARCHIVED"
    }),
    [debouncedSearch, departmentId, designationId, employmentType, locationId, page, status]
  );

  const { data, isLoading, isError, refetch } = useEmployeesPage(filters, gate.isAuthorized);
  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: designations = [] } = useDesignations(gate.isAuthorized);
  const { data: locations = [] } = useLocations({}, gate.isAuthorized);

  const employees = data?.employees ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  const resetToFirst = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading && !data)) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg border border-border bg-muted/30" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg border border-border bg-muted/30" />
      </div>
    );
  }

  if (!gate.isAuthorized) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="w-full max-w-md border-border p-6 text-center shadow-xs">
          <CardHeader className="items-center pb-2">
            <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-amber-500/15 text-amber-600">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-base">Access Restricted</CardTitle>
            <p className="text-xs text-muted-foreground">You need employee read permission to view this workspace.</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Employees</h1>
          <p className="mt-1 text-xs text-muted-foreground">Tenant-scoped people records, org assignments, access, and employee readiness.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <Button variant="outline" size="sm" asChild>
              <Link href={"/documents" as Route}>
                <Download className="mr-1.5 size-3.5" />
                Export
              </Link>
            </Button>
          )}
          {canCreate && (
            <Button size="sm" asChild>
              <Link href={"/employees/new" as Route}>
                <Plus className="mr-1.5 size-3.5" />
                Add Employee
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Employees" value={data?.summary.total ?? total} detail="Current filtered tenant roster" icon={Users} />
        <MetricCard label="Active" value={data?.summary.active ?? 0} detail="Ready for workforce workflows" icon={UserRoundCheck} />
        <MetricCard label="On Leave Today" value={data?.summary.onLeave ?? 0} detail="Status-based until leave calendar is queried" icon={BriefcaseBusiness} />
        <MetricCard label="Needs Setup" value={data?.summary.needsSetup ?? 0} detail="Missing manager, access, location, or shift" icon={Wrench} />
      </div>

      <Card className="border-border shadow-xs">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-9 pl-8 text-xs"
                placeholder="Search name, email, phone, employee ID"
                aria-label="Search employees"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
              <FilterSelect label="Department" value={departmentId} onChange={resetToFirst(setDepartmentId)} options={[["ALL", "All departments"], ...departments.map((item) => [item.id, item.name] as const)]} />
              <FilterSelect label="Designation" value={designationId} onChange={resetToFirst(setDesignationId)} options={[["ALL", "All designations"], ...designations.map((item) => [item.id, item.name] as const)]} />
              <FilterSelect label="Location" value={locationId} onChange={resetToFirst(setLocationId)} options={[["ALL", "All locations"], ...locations.map((item) => [item.id, item.name] as const)]} />
              <FilterSelect label="Status" value={status} onChange={resetToFirst(setStatus)} options={STATUS_FILTERS} />
              <FilterSelect label="Employment type" value={employmentType} onChange={resetToFirst(setEmploymentType)} options={EMPLOYMENT_FILTERS} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="flex flex-col gap-2 p-3 text-xs text-destructive sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="size-4" />
              Employee data could not be loaded.
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-border shadow-xs">
        <CardContent className="p-0">
          {employees.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[240px]">Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role / Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Store / Location</TableHead>
                    <TableHead>Reporting Manager</TableHead>
                    <TableHead>Employment Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const name = employee.fullName || "Unnamed employee";
                    const initial = name.trim().charAt(0).toUpperCase();
                    const locationName = currentLocation(employee);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-8 border border-border">
                              {employee.avatarUrl || employee.profilePhoto ? <AvatarImage src={employee.avatarUrl || employee.profilePhoto || ""} alt={name} /> : null}
                              <AvatarFallback>{initial || <CircleUser className="size-4 text-muted-foreground" />}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{name}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{textOrFallback(employee.email, "No work email")}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{employee.employeeCode || "Not set"}</TableCell>
                        <TableCell className="text-xs">{textOrFallback(currentRole(employee))}</TableCell>
                        <TableCell className="text-xs">{relationName(employee.department)}</TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3 text-muted-foreground" />
                            {textOrFallback(locationName)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{textOrFallback(employee.manager?.fullName ?? employee.managerName)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatEmploymentType(employee.employmentType)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(employee.status)} className="text-[10px]">
                            {formatEmploymentStatus(employee.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5">
                            <Link href={`/employees/${employee.id}` as Route}>
                              Manage
                              <ArrowRight className="ml-1 size-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
                <Building2 className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">No employees found</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">Adjust filters or add the first tenant-scoped employee record.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 border-t border-border pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing <span className="font-medium text-foreground">{start}</span> to <span className="font-medium text-foreground">{end}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> employees
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="h-8">
            <ChevronLeft className="mr-1 size-3.5" />
            Previous
          </Button>
          <Badge variant="secondary" className="h-8 px-3 font-normal">
            Page {page} of {totalPages}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="h-8">
            Next
            <ChevronRight className="ml-1 size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: ReadonlyArray<readonly [string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <Filter className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-7 text-xs shadow-xs outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring lg:w-[150px]"
        aria-label={label}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
