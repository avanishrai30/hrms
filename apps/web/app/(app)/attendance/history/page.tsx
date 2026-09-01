"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface AttendanceRecord {
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
  shift?: {
    name: string;
    code: string;
  } | null;
}

interface HistoryResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
}

export default function AttendanceHistoryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  if (status) queryParams.set("status", status);
  queryParams.set("page", String(page));
  queryParams.set("limit", "20");

  const historyQuery = useQuery({
    queryKey: ["attendance-history", queryParams.toString()],
    queryFn: () => apiRequest<HistoryResponse>(`/attendance/me/history?${queryParams.toString()}`)
  });

  const getStatusTone = (s?: string): "neutral" | "success" | "warning" | "danger" => {
    if (s === "PRESENT") return "success";
    if (s === "LATE") return "warning";
    if (s === "HALF_DAY") return "warning";
    if (s === "ABSENT") return "danger";
    return "neutral";
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/attendance" as Route} className="text-sm font-medium text-zinc-500 hover:text-zinc-950">
              ← Attendance
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">Attendance History</h1>
          <p className="text-sm text-zinc-600">Review your past attendance records, daily worked hours, and punch times.</p>
        </div>
        <Link href={"/attendance" as Route}>
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </header>

      {/* Filters Bar */}
      <Panel className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Field label="From Date">
          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
        </Field>
        <Field label="To Date">
          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
        </Field>
        <Field label="Status">
          <select
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm text-zinc-950"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
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
              setStartDate("");
              setEndDate("");
              setStatus("");
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Panel>

      {/* Data Table */}
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Worked Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historyQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">Loading attendance history...</td>
                </tr>
              ) : historyQuery.data?.records && historyQuery.data.records.length > 0 ? (
                historyQuery.data.records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5 font-medium text-zinc-950">
                      {new Date(rec.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">{rec.shift?.name ?? "General Shift"}</td>
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
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => setSelectedRecord(rec)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">No attendance records found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {historyQuery.data && historyQuery.data.total > 20 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-zinc-500">
            <span>
              Showing {((page - 1) * 20) + 1} – {Math.min(page * 20, historyQuery.data.total)} of {historyQuery.data.total}
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
                disabled={page * 20 >= historyQuery.data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-950">Attendance Details</h2>
            <p className="text-xs text-zinc-500">
              {new Date(selectedRecord.date).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>

            <div className="mt-4 space-y-3 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <Badge tone={getStatusTone(selectedRecord.status)}>{selectedRecord.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Check In</span>
                <span className="font-medium text-zinc-900">{selectedRecord.checkInAt ? new Date(selectedRecord.checkInAt).toLocaleTimeString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Check Out</span>
                <span className="font-medium text-zinc-900">{selectedRecord.checkOutAt ? new Date(selectedRecord.checkOutAt).toLocaleTimeString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Worked</span>
                <span className="font-medium text-zinc-900">{(selectedRecord.workedMinutes / 60).toFixed(1)} hours ({selectedRecord.workedMinutes} mins)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Late Arrival</span>
                <span className="text-zinc-900">{selectedRecord.lateMinutes} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Early Departure</span>
                <span className="text-zinc-900">{selectedRecord.earlyDepartureMinutes} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Overtime</span>
                <span className="text-zinc-900">{selectedRecord.overtimeMinutes} mins</span>
              </div>
              {selectedRecord.notes && (
                <div className="border-t border-border pt-2">
                  <span className="text-xs text-zinc-500">Notes:</span>
                  <p className="mt-0.5 text-xs text-zinc-800">{selectedRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="secondary" onClick={() => setSelectedRecord(null)}>Close</Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
