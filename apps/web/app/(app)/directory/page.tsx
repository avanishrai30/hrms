"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Search,
  Mail,
  MapPin,
  Building2,
  Users,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useDirectory, useDepartments, useDebounce } from "../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../lib/session-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";

const PAGE_SIZE = 24;

export default function OrganizationDirectoryPage() {
  const gate = usePermissionGate(["directory.view", "employees.read"]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  const { data: departments = [] } = useDepartments(gate.isAuthorized);
  const { data: employees = [], isLoading, isError, refetch } = useDirectory(
    {
      search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      departmentId: selectedDeptId !== "ALL" ? selectedDeptId : undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE
    },
    gate.isAuthorized
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setPage(0);
  };

  if (gate.isLoading || (gate.isAuthorized && isLoading && page === 0)) {
    return (
      <div className="flex flex-col gap-5 max-w-7xl mx-auto">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
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
            <CardTitle className="text-base">Directory Access Restricted</CardTitle>
            <CardDescription className="text-xs">
              You do not have permission (<code className="text-[11px] font-mono">directory.view</code>) to access the employee directory.
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Workforce Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover colleagues, explore departments, and look up workplace contacts.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={"/org-chart" as Route}>
            <Building2 className="size-3.5 mr-1.5 text-primary" />
            <span>View Org Chart</span>
          </Link>
        </Button>
      </div>

      {/* 2. Search & Department Filters Toolbar */}
      <Card className="border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={handleSearchChange}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDeptId}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <Badge variant="secondary" className="h-9 px-3 text-xs font-normal">
              {employees.length} {employees.length === 1 ? "Colleague" : "Colleagues"}
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
              <span>Failed to load directory. Please verify your connection or tenant session.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* 4. Directory Grid */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => {
            const initial = emp.fullName ? emp.fullName.charAt(0).toUpperCase() : "U";

            return (
              <Card
                key={emp.id}
                className="border border-border bg-card shadow-xs transition hover:shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      {emp.profilePhoto ? <AvatarImage src={emp.profilePhoto} alt={emp.fullName} /> : null}
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-foreground truncate">{emp.fullName}</h3>
                      <p className="text-[11px] text-muted-foreground truncate font-medium">
                        {emp.designation || "Team Member"}
                      </p>
                      <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                        {emp.department || "General"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 border-t border-border/60 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    <Mail className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate text-[11px]">{emp.email || "—"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    <MapPin className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate text-[11px]">{emp.region || "Bangalore HQ"}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-border py-12 text-center text-xs text-muted-foreground">
          <Users className="size-8 mx-auto mb-2 opacity-40" />
          <p className="font-semibold text-foreground">No employees found</p>
          <p className="text-[11px] mt-0.5">Try searching with a different keyword or selecting another department.</p>
        </Card>
      )}

      {/* 5. Server Pagination Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{page * PAGE_SIZE + 1}</span> to{" "}
          <span className="font-medium text-foreground">{page * PAGE_SIZE + employees.length}</span> results
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="h-8 text-xs"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={employees.length < PAGE_SIZE || isLoading}
            className="h-8 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
