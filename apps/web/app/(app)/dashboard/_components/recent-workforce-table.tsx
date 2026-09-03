"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleUser
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "../../../../components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "../../../../components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "../../../../components/ui/table";
import { useDirectoryPage } from "../../../../lib/queries/use-people-queries";
import { usePermissionGate } from "../../../../lib/session-store";
import {
  buildWorkforceCurrentPageCsv,
  canRenderTenantWorkforceTable,
  resolveRegionOrBusinessUnit,
  unavailable
} from "../../../../lib/workforce-table-data";
import type { DirectoryEmployeeView } from "@vc-wms/shared-types";

export function RecentWorkforceTable() {
  const gate = usePermissionGate(["directory.view", "employees.read"]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);

  const { data: directoryData, isLoading } = useDirectoryPage({
    search: search.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: pageSize,
    offset: pageIndex * pageSize
  }, gate.isAuthorized);

  if (gate.isLoading || !canRenderTenantWorkforceTable(gate.permissions)) {
    return null;
  }

  const currentPageRows: DirectoryEmployeeView[] = directoryData?.items ?? [];
  const totalRows = directoryData?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

  const handleExport = () => {
    const csvContent = buildWorkforceCurrentPageCsv(currentPageRows);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `workforce-current-page-${pageIndex + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">
          {isLoading ? "Workforce Directory" : `${totalRows} Team Members`}
        </CardTitle>
        <CardDescription>
          Active workforce personnel, department assignments, and workplace locations.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-8 gap-1.5">
            <Download className="size-3.5" />
            <span>Export page</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-4">
        {/* Table Toolbar matching Studio Admin exact layout */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter workforce…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(0);
                }}
                className="h-8 pl-8 text-xs bg-transparent"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Filter className="size-3" />
                  <span>Status</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setPageIndex(0);
                  }}
                >
                  <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ACTIVE">Active</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ON_LEAVE">On Leave</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PROBATION">Probation</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Sorted by name from server</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="h-10 p-3 font-medium text-xs">Employee</TableHead>
                <TableHead className="h-10 p-3 font-medium text-xs">Status</TableHead>
                <TableHead className="h-10 p-3 font-medium text-xs">Department</TableHead>
                <TableHead className="h-10 p-3 font-medium text-xs">Region / Unit</TableHead>
                <TableHead className="h-10 p-3 font-medium text-xs text-right">Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    Loading workforce records…
                  </TableCell>
                </TableRow>
              ) : currentPageRows.length > 0 ? (
                currentPageRows.map((emp) => {
                  const initial = emp.fullName.trim().charAt(0).toUpperCase();
                  const isActive = (emp.status || "").toUpperCase() === "ACTIVE";

                  return (
                    <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 rounded-lg">
                            {emp.profilePhoto ? <AvatarImage src={emp.profilePhoto} alt={emp.fullName} /> : null}
                            <AvatarFallback className="rounded-lg text-[11px]">
                              {initial || <CircleUser className="size-3 text-muted-foreground" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs text-foreground leading-tight">
                              {emp.fullName}
                            </span>
                            <span className="text-[11px] text-muted-foreground leading-tight">
                              {emp.email || emp.designation || "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="text-[10px] font-normal"
                        >
                          {emp.status ? emp.status.replace(/_/g, " ") : "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-xs text-muted-foreground">
                        {unavailable(emp.department)}
                      </TableCell>
                      <TableCell className="p-3 text-xs text-muted-foreground">
                        {resolveRegionOrBusinessUnit(emp)}
                      </TableCell>
                      <TableCell className="p-3 text-xs font-mono text-right text-muted-foreground">
                        {emp.employeeCode || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    No workforce records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Pagination Footer matching Studio Admin exact layout */}
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div className="hidden sm:block">
            Showing {totalRows === 0 ? 0 : pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows} records
          </div>

          <div className="flex items-center gap-6 ml-auto sm:ml-0">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger size="sm" className="w-16 h-7 text-xs">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="font-medium text-foreground">
              Page {pageIndex + 1} of {pageCount}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1}
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
