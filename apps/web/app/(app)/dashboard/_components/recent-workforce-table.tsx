"use client";

import * as React from "react";
import {
  Search,
  ArrowUpDown,
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
import { useDirectory } from "../../../../lib/queries/use-people-queries";
import type { DirectoryEmployeeView } from "@vc-wms/shared-types";

export function RecentWorkforceTable() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortOption, setSortOption] = React.useState<"name-asc" | "name-desc" | "code">("name-asc");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);

  const { data: directoryData, isLoading } = useDirectory({
    search: search.trim() || undefined,
    limit: 50
  });

  const rawEmployees: DirectoryEmployeeView[] = Array.isArray(directoryData) ? directoryData : [];

  // Filter & sort
  const filteredEmployees = React.useMemo(() => {
    return rawEmployees
      .filter((emp) => {
        if (statusFilter === "all") return true;
        return (emp.status || "").toLowerCase().includes(statusFilter.toLowerCase());
      })
      .sort((a, b) => {
        if (sortOption === "name-asc") return a.fullName.localeCompare(b.fullName);
        if (sortOption === "name-desc") return b.fullName.localeCompare(a.fullName);
        if (sortOption === "code") return (a.employeeCode || "").localeCompare(b.employeeCode || "");
        return 0;
      });
  }, [rawEmployees, statusFilter, sortOption]);

  const totalRows = filteredEmployees.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPageRows = filteredEmployees.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const handleExport = () => {
    const csvContent = [
      ["Employee Code", "Name", "Email", "Department", "Region", "Status"].join(","),
      ...filteredEmployees.map((e) =>
        [
          e.employeeCode || "",
          `"${e.fullName}"`,
          e.email || "",
          `"${e.department || ""}"`,
          `"${e.region || e.businessUnit || "HQ"}"`,
          e.status || ""
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vc-organics-workforce-report.csv");
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
            <span>Export</span>
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
                  <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="leave">On Leave</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="probation">Probation</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <ArrowUpDown className="size-3" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuRadioGroup
                  value={sortOption}
                  onValueChange={(val) => setSortOption(val as typeof sortOption)}
                >
                  <DropdownMenuRadioItem value="name-asc">Name (A–Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc">Name (Z–A)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="code">Employee Code</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
                          {emp.status ? emp.status.replace(/_/g, " ") : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-xs text-muted-foreground">
                        {emp.department || "General"}
                      </TableCell>
                      <TableCell className="p-3 text-xs text-muted-foreground">
                        {emp.region || emp.businessUnit || "HQ"}
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
            Showing {filteredEmployees.length === 0 ? 0 : pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, filteredEmployees.length)} of {filteredEmployees.length} records
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
