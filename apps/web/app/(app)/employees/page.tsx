"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CircleUser
} from "lucide-react";
import {
  useEmployees,
  useDepartments,
  useDesignations,
  useCreateEmployeeMutation,
  useDebounce,
  formatEmploymentType,
  formatEmploymentStatus
} from "../../../lib/queries/use-people-queries";
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
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../../components/ui/dialog";

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PROBATION", label: "Probation" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "NOTICE_PERIOD", label: "Notice Period" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DRAFT", label: "Draft" },
  { value: "INVITED", label: "Invited" }
];

export default function EmployeesListPage() {
  const gate = usePermissionGate(["employees.read"]);
  const canCreate = useHasPermission("employees.create");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [departmentId, setDepartmentId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Employee Form state - deliberate choices without synthetic defaults
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formDesigId, setFormDesigId] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [employmentType, setEmploymentType] = useState<"" | "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY">("");

  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: designations = [] } = useDesignations(gate.isAuthorized);
  const { data: allEmployees = [], isLoading, isError, refetch } = useEmployees(
    {
      q: debouncedSearch.trim() || undefined,
      departmentId: departmentId !== "ALL" ? departmentId : undefined,
      status: status !== "ALL" ? status : undefined
    },
    gate.isAuthorized
  );

  const createMutation = useCreateEmployeeMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDeptFilterChange = (deptId: string) => {
    setDepartmentId(deptId);
    setPage(0);
  };

  const handleStatusFilterChange = (s: string) => {
    setStatus(s);
    setPage(0);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      setFormError("Employee Code is required.");
      return;
    }
    if (!fullName.trim()) {
      setFormError("Full Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Valid Work Email is required.");
      return;
    }
    if (!formDeptId) {
      setFormError("Please select a Department.");
      return;
    }
    if (!formDesigId) {
      setFormError("Please select a Designation.");
      return;
    }
    if (!joiningDate) {
      setFormError("Joining Date is required.");
      return;
    }
    if (!employmentType) {
      setFormError("Please select a valid Employment Type.");
      return;
    }

    setFormError(null);
    try {
      await createMutation.mutateAsync({
        employeeCode: employeeCode.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        departmentId: formDeptId,
        designationId: formDesigId,
        joiningDate: new Date(joiningDate).toISOString(),
        employmentType
      });

      // Reset and close
      setEmployeeCode("");
      setFullName("");
      setEmail("");
      setPhone("");
      setFormDeptId("");
      setFormDesigId("");
      setJoiningDate("");
      setEmploymentType("");
      setIsAddOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create employee.");
    }
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading && page === 0)) {
    return (
      <div className="flex flex-col gap-5 max-w-7xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
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
            <CardTitle className="text-base">Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission (<code className="text-[11px] font-mono">employees.read</code>) to view the employee roster.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const paginatedEmployees = allEmployees.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Employee Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organization members, assignments, profiles, and employment status.
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="size-3.5 mr-1" />
            <span>Add Employee</span>
          </Button>
        )}
      </div>

      {/* 2. Search & Filters Bar */}
      <Card className="border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, code, email..."
              value={search}
              onChange={handleSearchChange}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={departmentId}
              onChange={(e) => handleDeptFilterChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <Badge variant="secondary" className="h-9 px-3 text-xs font-normal">
              {allEmployees.length} Total
            </Badge>
          </div>
        </div>
      </Card>

      {/* 3. Error Banner */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center justify-between text-xs text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4" />
              <span>Failed to load employees list.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* 4. Data Table (Studio Admin Table Pattern) */}
      <Card className="border border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {paginatedEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department & Designation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((emp) => {
                  const name = emp.fullName || "";
                  const initial = name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : null;
                  const isProbation = emp.status === "PROBATION";
                  const isActive = emp.status === "ACTIVE";
                  const deptName = typeof emp.department === "string" ? emp.department : emp.department?.name || "—";
                  const desigName = typeof emp.designation === "string" ? emp.designation : emp.designation?.name || "—";

                  return (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            {emp.avatarUrl || emp.profilePhoto ? (
                              <AvatarImage src={emp.avatarUrl || emp.profilePhoto || ""} alt={name} />
                            ) : null}
                            <AvatarFallback>
                              {initial || <CircleUser className="size-4 text-muted-foreground" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{name || "—"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{emp.email || "—"}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {emp.employeeCode}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">{desigName}</p>
                          <p className="text-[11px] text-muted-foreground">{deptName}</p>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {formatEmploymentType(emp.employmentType)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={isActive ? "success" : isProbation ? "warning" : "secondary"}
                          className="text-[10px]"
                        >
                          {formatEmploymentStatus(emp.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="h-7 px-2.5">
                          <Link href={`/employees/${emp.id}` as Route}>
                            <span>Manage</span>
                            <ArrowRight className="size-3 ml-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Users className="size-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground">No matching employees</p>
              <p className="text-[11px] mt-0.5">Try clearing filters or search queries.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Server Pagination Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{page * PAGE_SIZE + 1}</span> to{" "}
          <span className="font-medium text-foreground">{Math.min((page + 1) * PAGE_SIZE, allEmployees.length)}</span> of{" "}
          <span className="font-medium text-foreground">{allEmployees.length}</span> employees
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-8 text-xs"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * PAGE_SIZE >= allEmployees.length}
            className="h-8 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* 6. Add Employee Dialog (Studio Admin Dialog Pattern) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter workplace details to create a draft employee profile in the tenant roster.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 py-2">
            {formError && (
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Employee Code *</label>
                <Input
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="e.g. EMP-101"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Full Name *</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Work Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@vcorganics.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Department *</label>
                <select
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
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

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Designation *</label>
                <select
                  value={formDesigId}
                  onChange={(e) => setFormDesigId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Employment Type *</label>
                <select
                  value={employmentType}
                  onChange={(e) =>
                    setEmploymentType(e.target.value as "" | "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY")
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select Employment Type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Joining Date *</label>
                <Input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Save Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
