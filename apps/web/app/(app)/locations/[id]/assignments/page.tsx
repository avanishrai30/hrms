"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../../components/ui";
import { apiRequest } from "../../../../../lib/api";

interface AssignmentItem {
  id: string;
  startsOn: string;
  endsOn: string | null;
  isPriority: boolean;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  } | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface EmployeeOption {
  id: string;
  employeeCode: string;
  fullName: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

export default function LocationAssignmentsPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [assignmentType, setAssignmentType] = useState<"EMPLOYEE" | "DEPARTMENT">("EMPLOYEE");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startsOn, setStartsOn] = useState(new Date().toISOString().split("T")[0]);
  const [endsOn, setEndsOn] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const locationQuery = useQuery({
    queryKey: ["location-info", params.id],
    queryFn: () => apiRequest<{ id: string; name: string; code: string }>(`/locations/${params.id}`)
  });

  const assignmentsQuery = useQuery({
    queryKey: ["location-assignments", params.id],
    queryFn: () => apiRequest<AssignmentItem[]>(`/locations/${params.id}/assignments`)
  });

  const employeesQuery = useQuery({
    queryKey: ["employees-select"],
    queryFn: () => apiRequest<{ employees: EmployeeOption[] }>("/employees?limit=100")
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments-select"],
    queryFn: () => apiRequest<DepartmentOption[]>("/departments")
  });

  const createAssignmentMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/locations/${params.id}/assignments`, {
        method: "POST",
        body: JSON.stringify({
          locationId: params.id,
          employeeId: assignmentType === "EMPLOYEE" ? employeeId : undefined,
          departmentId: assignmentType === "DEPARTMENT" ? departmentId : undefined,
          startsOn: new Date(startsOn || new Date().toISOString()),
          endsOn: endsOn ? new Date(endsOn) : undefined,
          isPriority
        })
      }),
    onSuccess: () => {
      setEmployeeId("");
      setDepartmentId("");
      setEndsOn("");
      setIsPriority(false);
      setErrorMsg("");
      queryClient.invalidateQueries({ queryKey: ["location-assignments", params.id] });
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to create assignment.");
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      apiRequest(`/locations/${params.id}/assignments/${assignmentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-assignments", params.id] });
    }
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/locations/${params.id}` as Route} className="text-sm font-medium text-zinc-500 hover:text-zinc-950">
              ← {locationQuery.data?.name ?? "Location"}
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">Workforce Location Assignments</h1>
          <p className="text-sm text-zinc-600">Assign employees or entire departments to this workplace.</p>
        </div>
      </header>

      {errorMsg && (
        <div className="rounded-control border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Assignment Creator Form */}
      <Panel className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-950">Assign Workforce to Location</h2>

        <div className="flex gap-4 border-b border-border pb-3">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
            <input
              type="radio"
              name="assignType"
              checked={assignmentType === "EMPLOYEE"}
              onChange={() => setAssignmentType("EMPLOYEE")}
            />
            Specific Employee
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
            <input
              type="radio"
              name="assignType"
              checked={assignmentType === "DEPARTMENT"}
              onChange={() => setAssignmentType("DEPARTMENT")}
            />
            Department-Wide
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {assignmentType === "EMPLOYEE" ? (
            <Field label="Employee">
              <select
                className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employeesQuery.data?.employees?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Department">
              <select
                className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">Select Department</option>
                {departmentsQuery.data?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts On">
              <Input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
            </Field>
            <Field label="Ends On (Optional)">
              <Input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
            />
            Mark as Priority / Primary Location
          </label>

          <Button
            disabled={
              (assignmentType === "EMPLOYEE" && !employeeId) ||
              (assignmentType === "DEPARTMENT" && !departmentId) ||
              createAssignmentMutation.isPending
            }
            onClick={() => createAssignmentMutation.mutate()}
          >
            {createAssignmentMutation.isPending ? "Assigning..." : "Add Assignment"}
          </Button>
        </div>
      </Panel>

      {/* Active Assignments Table */}
      <Panel className="overflow-hidden p-0">
        <div className="border-b border-border p-4">
          <h2 className="text-base font-semibold text-zinc-950">Active Assignments</h2>
          <p className="text-xs text-zinc-500">Workforce members authorized to check-in at this location.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Assigned Target</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Effective Window</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignmentsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">Loading assignments...</td>
                </tr>
              ) : assignmentsQuery.data && assignmentsQuery.data.length > 0 ? (
                assignmentsQuery.data.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5 font-medium text-zinc-950">
                      {a.employee ? `${a.employee.fullName} (${a.employee.employeeCode})` : a.department?.name ?? "All Staff"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone="neutral">{a.employee ? "Individual" : "Department"}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600">
                      {new Date(a.startsOn).toLocaleDateString()} – {a.endsOn ? new Date(a.endsOn).toLocaleDateString() : "Permanent"}
                    </td>
                    <td className="px-4 py-3.5">
                      {a.isPriority ? <Badge tone="success">Primary</Badge> : <span className="text-xs text-zinc-400">Standard</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => deleteAssignmentMutation.mutate(a.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">No workforce assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
