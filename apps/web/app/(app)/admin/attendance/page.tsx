"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface HrDashboardSummary {
  summary: {
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    halfDayCount: number;
    pendingCorrections: number;
  };
}

interface AttendanceRow {
  id: string;
  date: string;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedMinutes: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  overtimeMinutes: number;
  notes: string | null;
  isManual: boolean;
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: { name: string };
    designation?: { name: string };
  };
  shift?: {
    name: string;
    code: string;
  } | null;
}

interface AttendanceListResponse {
  records: AttendanceRow[];
  total: number;
  page: number;
  limit: number;
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

export default function AdminAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Manual entry form state
  const [manualEmpId, setManualEmpId] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualStatus, setManualStatus] = useState("PRESENT");
  const [manualCheckIn, setManualCheckIn] = useState("09:00");
  const [manualCheckOut, setManualCheckOut] = useState("18:00");
  const [manualReason, setManualReason] = useState("");
  const [manualNotes, setManualNotes] = useState("");

  const dashboardQuery = useQuery({
    queryKey: ["admin-attendance-hr-dashboard"],
    queryFn: () => apiRequest<HrDashboardSummary>("/attendance/dashboard/hr")
  });

  const employeesQuery = useQuery({
    queryKey: ["employees-select"],
    queryFn: () => apiRequest<{ employees: EmployeeOption[] }>("/employees?limit=100")
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments-select"],
    queryFn: () => apiRequest<DepartmentOption[]>("/departments")
  });

  const queryParams = new URLSearchParams();
  if (selectedDate) {
    queryParams.set("startDate", selectedDate);
    queryParams.set("endDate", selectedDate);
  }
  if (selectedDept) queryParams.set("departmentId", selectedDept);
  if (selectedStatus) queryParams.set("status", selectedStatus);
  queryParams.set("page", String(page));
  queryParams.set("limit", "25");

  const attendanceListQuery = useQuery({
    queryKey: ["admin-attendance-list", queryParams.toString()],
    queryFn: () => apiRequest<AttendanceListResponse>(`/attendance?${queryParams.toString()}`)
  });

  const createManualMutation = useMutation({
    mutationFn: () => {
      const checkInDateTime = manualCheckIn ? new Date(`${manualDate}T${manualCheckIn}:00.000Z`) : undefined;
      const checkOutDateTime = manualCheckOut ? new Date(`${manualDate}T${manualCheckOut}:00.000Z`) : undefined;

      return apiRequest("/attendance/manual", {
        method: "POST",
        body: JSON.stringify({
          employeeId: manualEmpId,
          date: new Date(manualDate || new Date().toISOString()),
          status: manualStatus,
          checkInAt: checkInDateTime,
          checkOutAt: checkOutDateTime,
          reason: manualReason,
          notes: manualNotes || undefined
        })
      });
    },
    onSuccess: () => {
      setManualModalOpen(false);
      setManualReason("");
      setManualNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-attendance-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-attendance-hr-dashboard"] });
    }
  });

  const getStatusTone = (s?: string): "neutral" | "success" | "warning" | "danger" => {
    if (s === "PRESENT") return "success";
    if (s === "LATE") return "warning";
    if (s === "HALF_DAY") return "warning";
    if (s === "ABSENT") return "danger";
    return "neutral";
  };

  const summary = dashboardQuery.data?.summary;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Attendance Administration</h1>
          <p className="mt-1 text-sm text-zinc-600">Company-wide workforce attendance overview, manual logs, and exceptions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={"/attendance/corrections" as Route}>
            <Button variant="secondary">
              Corrections ({summary?.pendingCorrections ?? 0})
            </Button>
          </Link>
          <Button onClick={() => setManualModalOpen(true)}>
            Record Manual Entry
          </Button>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Total Workforce</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950">{summary?.totalEmployees ?? 0}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-emerald-700">Present Today</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{summary?.presentCount ?? 0}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-red-700">Absent Today</p>
          <p className="mt-1 text-2xl font-bold text-red-800">{summary?.absentCount ?? 0}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-amber-700">Late Arrivals</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{summary?.lateCount ?? 0}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Half Day</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950">{summary?.halfDayCount ?? 0}</p>
        </Panel>
      </section>

      {/* Filters Bar */}
      <Panel className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Field label="Date">
          <Input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }} />
        </Field>
        <Field label="Department">
          <select
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {departmentsQuery.data?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ABSENT">Absent</option>
            <option value="HOLIDAY">Holiday</option>
            <option value="WEEK_OFF">Week Off</option>
            <option value="WORK_FROM_HOME">Work From Home</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </Field>
        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSelectedDate(new Date().toISOString().split("T")[0]);
              setSelectedDept("");
              setSelectedStatus("");
              setPage(1);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </Panel>

      {/* Data Table */}
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Worked Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendanceListQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">Loading attendance records...</td>
                </tr>
              ) : attendanceListQuery.data?.records && attendanceListQuery.data.records.length > 0 ? (
                attendanceListQuery.data.records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-950">{rec.employee.fullName}</p>
                      <p className="text-xs text-zinc-500">{rec.employee.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {rec.employee.department?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {rec.shift?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {rec.checkInAt ? new Date(rec.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      {rec.lateMinutes > 0 && <span className="ml-1 text-xs text-amber-600">({rec.lateMinutes}m late)</span>}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {rec.checkOutAt ? new Date(rec.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-zinc-900">
                      {(rec.workedMinutes / 60).toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={getStatusTone(rec.status)}>{rec.status}</Badge>
                        {rec.isManual && <span className="text-[10px] uppercase font-bold text-zinc-400">Manual</span>}
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-xs text-zinc-500" title={rec.notes ?? ""}>
                      {rec.notes ?? "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {attendanceListQuery.data && attendanceListQuery.data.total > 25 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-zinc-500">
            <span>
              Showing {((page - 1) * 25) + 1} – {Math.min(page * 25, attendanceListQuery.data.total)} of {attendanceListQuery.data.total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                disabled={page * 25 >= attendanceListQuery.data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {/* Record Manual Attendance Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-950">Record Manual Attendance</h2>
            <p className="text-xs text-zinc-500">Manually log or override attendance for an employee with audit justification.</p>

            <div className="mt-4 space-y-4">
              <Field label="Employee">
                <select
                  className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
                  value={manualEmpId}
                  onChange={(e) => setManualEmpId(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employeesQuery.data?.employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date">
                  <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
                </Field>
                <Field label="Status">
                  <select
                    className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value)}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="WEEK_OFF">Week Off</option>
                    <option value="WORK_FROM_HOME">Work From Home</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Check In Time">
                  <Input type="time" value={manualCheckIn} onChange={(e) => setManualCheckIn(e.target.value)} />
                </Field>
                <Field label="Check Out Time">
                  <Input type="time" value={manualCheckOut} onChange={(e) => setManualCheckOut(e.target.value)} />
                </Field>
              </div>

              <Field label="Audit Reason (Min 8 characters)">
                <Input
                  placeholder="e.g. Biometric system offline / On-site duty"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                />
              </Field>

              <Field label="Additional Notes (Optional)">
                <Input
                  placeholder="Additional context or approver reference"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                />
              </Field>

              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="secondary" onClick={() => setManualModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!manualEmpId || manualReason.length < 8 || createManualMutation.isPending}
                  onClick={() => createManualMutation.mutate()}
                >
                  {createManualMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
