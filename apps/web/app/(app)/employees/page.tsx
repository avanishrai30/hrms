"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Panel, Badge } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import { cn } from "@vc-wms/ui";
import { ImportDialog } from "../../../components/import-dialog";
import { ExportDialog } from "../../../components/export-dialog";
import { BulkDialog } from "../../../components/bulk-dialog";

interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  employmentType: string;
  joiningDate: string;
  department?: { name: string };
  designation?: { name: string };
  memberships?: Array<{ roles: Array<{ role: { code: string; name: string } }> }>;
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [archived, setArchived] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [joinFrom, setJoinFrom] = useState("");
  const [joinTo, setJoinTo] = useState("");
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkOp, setBulkOp] = useState<'department' | 'designation' | 'status' | 'archive' | null>(null);

  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    if (archived) search.set("archived", "true");
    if (departmentId) search.set("departmentId", departmentId);
    if (designationId) search.set("designationId", designationId);
    if (employmentType) search.set("employmentType", employmentType);
    if (joinFrom) search.set("joinFrom", joinFrom);
    if (joinTo) search.set("joinTo", joinTo);
    const value = search.toString();
    return value ? `?${value}` : "";
  }, [archived, query, status, departmentId, designationId, employmentType, joinFrom, joinTo]);

  const employees = useQuery({
    queryKey: ["employees", params],
    queryFn: () => apiRequest<Employee[]>(`/employees${params}`)
  });

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiRequest<Array<{ id: string; name: string }>>("/departments")
  });

  const designations = useQuery({
    queryKey: ["designations"],
    queryFn: () => apiRequest<Array<{ id: string; name: string }>>("/designations")
  });

  const handleComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    setSelectedIds([]);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked && employees.data) {
      setSelectedIds(employees.data.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Employees</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage tenant employees, departments, and designation assignments.</p>
        </div>
        <Link href="/employees/new">
          <Button>Add employee</Button>
        </Link>
      </header>
      <Panel>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border pb-5">
          <div className="flex flex-wrap items-end gap-3 flex-1">
            <label className="grid gap-2 text-sm min-w-[200px] flex-1 lg:flex-none">
              <span className="font-medium text-zinc-800">Search</span>
              <input
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary text-zinc-950"
                placeholder="Name, email, phone, code"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm min-w-[140px] flex-1 lg:flex-none">
              <span className="font-medium text-zinc-800">Status</span>
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">All active</option>
                <option value="DRAFT">Draft</option>
                <option value="INVITED">Invited</option>
                <option value="ACTIVE">Active</option>
                <option value="PROBATION">Probation</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="NOTICE_PERIOD">Notice period</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm min-w-[140px] flex-1 lg:flex-none">
              <span className="font-medium text-zinc-800">Department</span>
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                <option value="">All departments</option>
                {departments.data?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm min-w-[140px] flex-1 lg:flex-none">
              <span className="font-medium text-zinc-800">Designation</span>
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary" value={designationId} onChange={(event) => setDesignationId(event.target.value)}>
                <option value="">All designations</option>
                {designations.data?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm min-w-[140px] flex-1 lg:flex-none">
              <span className="font-medium text-zinc-800">Emp. Type</span>
              <select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-zinc-950 outline-none focus:border-primary" value={employmentType} onChange={(event) => setEmploymentType(event.target.value)}>
                <option value="">All types</option>
                <option value="FULL_TIME">Full time</option>
                <option value="PART_TIME">Part time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm min-w-[130px] flex-1 lg:flex-none">
              <span className="font-medium text-zinc-800">Join From</span>
              <input
                type="date"
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary text-zinc-950"
                value={joinFrom}
                onChange={(event) => setJoinFrom(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm min-w-[130px] flex-1 lg:flex-none">
              <span className="font-medium text-zinc-800">Join To</span>
              <input
                type="date"
                className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary text-zinc-950"
                value={joinTo}
                onChange={(event) => setJoinTo(event.target.value)}
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-control border border-border px-3 text-sm cursor-pointer text-zinc-950">
              <input checked={archived} type="checkbox" className="w-4 h-4 rounded-sm border-border text-primary focus:ring-primary" onChange={(event) => setArchived(event.target.checked)} />
              Archived
            </label>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" type="button" onClick={() => setImportOpen(true)}>
              Import CSV
            </Button>
            <Button variant="secondary" type="button" onClick={() => setExportOpen(true)}>
              Export
            </Button>
          </div>
        </div>
        
        {employees.isLoading ? <p className="mt-5 text-sm text-zinc-600">Loading employees...</p> : null}
        {employees.isError ? <p className="mt-5 text-sm text-danger">Employees could not be loaded.</p> : null}
        {employees.data?.length === 0 ? <p className="mt-5 text-sm text-zinc-600">No employees yet. Add the first employee to start setup.</p> : null}
        {employees.data && employees.data.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500 bg-muted/50">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded-sm border-border text-primary focus:ring-primary cursor-pointer"
                      checked={employees.data.length > 0 && selectedIds.length === employees.data.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Designation</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.data.map((employee) => (
                  <tr key={employee.id} className={cn("transition-colors hover:bg-muted/50", selectedIds.includes(employee.id) && "bg-muted/50")}>
                    <td className="px-3 py-3">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded-sm border-border text-primary focus:ring-primary cursor-pointer"
                        checked={selectedIds.includes(employee.id)}
                        onChange={(e) => toggleSelect(employee.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link className="font-medium text-zinc-950 hover:text-primary" href={`/employees/${employee.id}` as Route}>
                        {employee.fullName}
                      </Link>
                      <p className="text-xs text-zinc-500">{employee.email}{employee.phone ? ` - ${employee.phone}` : ""}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{employee.employeeCode}</td>
                    <td className="px-3 py-3 text-zinc-700">{employee.department?.name ?? "Unassigned"}</td>
                    <td className="px-3 py-3 text-zinc-700">{employee.designation?.name ?? "Unassigned"}</td>
                    <td className="px-3 py-3 text-zinc-700">{employee.memberships?.[0]?.roles?.[0]?.role.name ?? "No access"}</td>
                    <td className="px-3 py-3 text-zinc-700">{new Date(employee.joiningDate).toLocaleDateString()}</td>
                    <td className="px-3 py-3">
                      <Badge tone={employee.status === "ACTIVE" ? "success" : employee.status === "ARCHIVED" ? "danger" : "neutral"}>{employee.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <span className="text-sm font-medium text-zinc-500 mr-2">{selectedIds.length} selected</span>
          <Button variant="secondary" type="button" disabled={selectedIds.length === 0} onClick={() => setBulkOp('department')}>Bulk department</Button>
          <Button variant="secondary" type="button" disabled={selectedIds.length === 0} onClick={() => setBulkOp('designation')}>Bulk designation</Button>
          <Button variant="secondary" type="button" disabled={selectedIds.length === 0} onClick={() => setBulkOp('status')}>Bulk status</Button>
          <Button variant="danger" type="button" disabled={selectedIds.length === 0} onClick={() => setBulkOp('archive')}>Bulk archive</Button>
        </div>
      </Panel>

      <ImportDialog 
        open={importOpen} 
        onClose={() => setImportOpen(false)} 
        onComplete={handleComplete} 
      />
      <ExportDialog 
        open={exportOpen} 
        onClose={() => setExportOpen(false)} 
      />
      <BulkDialog 
        open={bulkOp !== null} 
        onClose={() => setBulkOp(null)} 
        onComplete={handleComplete} 
        selectedIds={selectedIds} 
        operation={bulkOp} 
      />
    </div>
  );
}
