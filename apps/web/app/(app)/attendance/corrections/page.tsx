"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface CorrectionItem {
  id: string;
  reason: string;
  requestedChange: {
    date?: string;
    checkInAt?: string;
    checkOutAt?: string;
    status?: string;
    notes?: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  requestedBy: {
    id: string;
    email: string;
  };
  reviewedBy?: {
    id: string;
    email: string;
  } | null;
}

export default function AttendanceCorrectionsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedCorrection, setSelectedCorrection] = useState<CorrectionItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewNote, setReviewNote] = useState("");

  const correctionsQuery = useQuery({
    queryKey: ["attendance-corrections", filterStatus],
    queryFn: () => {
      const url = filterStatus ? `/attendance/corrections?status=${filterStatus}` : "/attendance/corrections";
      return apiRequest<CorrectionItem[]>(url);
    }
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!selectedCorrection) throw new Error("No correction selected");
      return apiRequest(`/attendance/corrections/${selectedCorrection.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status: reviewDecision,
          reviewNote: reviewNote || (reviewDecision === "APPROVED" ? "Approved by HR" : "Rejected by HR")
        })
      });
    },
    onSuccess: () => {
      setSelectedCorrection(null);
      setReviewNote("");
      queryClient.invalidateQueries({ queryKey: ["attendance-corrections"] });
    }
  });

  const getStatusTone = (s: string): "neutral" | "success" | "warning" | "danger" => {
    if (s === "APPROVED") return "success";
    if (s === "PENDING") return "warning";
    if (s === "REJECTED") return "danger";
    return "neutral";
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Attendance Corrections</h1>
          <p className="mt-1 text-sm text-zinc-600">Review, approve, or reject employee correction requests.</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        {[
          { label: "All Requests", value: "" },
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECTED" }
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilterStatus(tab.value)}
            className={`rounded-control px-3 py-1.5 text-xs font-medium transition ${
              filterStatus === tab.value
                ? "bg-primary text-white"
                : "bg-surface text-zinc-600 hover:bg-muted hover:text-zinc-950 border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Target Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Requested Status</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {correctionsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">Loading correction requests...</td>
                </tr>
              ) : correctionsQuery.data && correctionsQuery.data.length > 0 ? (
                correctionsQuery.data.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-zinc-950">{item.employee.fullName}</p>
                      <p className="text-xs text-zinc-500">{item.employee.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {item.requestedChange.date ?? new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-zinc-700" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {item.requestedChange.status ?? "PRESENT"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={getStatusTone(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.status === "PENDING" ? (
                        <Button
                          variant="secondary"
                          className="h-8 px-3 text-xs"
                          onClick={() => {
                            setSelectedCorrection(item);
                            setReviewDecision("APPROVED");
                            setReviewNote("");
                          }}
                        >
                          Review
                        </Button>
                      ) : (
                        <span className="text-xs text-zinc-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">No correction requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Review Dialog */}
      {selectedCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Panel className="w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-950">Review Correction Request</h2>
            <p className="text-xs text-zinc-500">
              Submitted by {selectedCorrection.employee.fullName} ({selectedCorrection.employee.employeeCode})
            </p>

            <div className="mt-4 space-y-3 rounded-control border border-border bg-muted/30 p-3 text-xs">
              <div>
                <span className="font-medium text-zinc-700">Target Date:</span>{" "}
                <span className="text-zinc-900">{selectedCorrection.requestedChange.date ?? "Today"}</span>
              </div>
              <div>
                <span className="font-medium text-zinc-700">Reason:</span>{" "}
                <span className="text-zinc-900">{selectedCorrection.reason}</span>
              </div>
              {selectedCorrection.requestedChange.checkInAt && (
                <div>
                  <span className="font-medium text-zinc-700">Requested Check In:</span>{" "}
                  <span className="text-zinc-900">{selectedCorrection.requestedChange.checkInAt}</span>
                </div>
              )}
              {selectedCorrection.requestedChange.checkOutAt && (
                <div>
                  <span className="font-medium text-zinc-700">Requested Check Out:</span>{" "}
                  <span className="text-zinc-900">{selectedCorrection.requestedChange.checkOutAt}</span>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <Field label="Decision">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewDecision === "APPROVED"}
                      onChange={() => setReviewDecision("APPROVED")}
                    />
                    Approve
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewDecision === "REJECTED"}
                      onChange={() => setReviewDecision("REJECTED")}
                    />
                    Reject
                  </label>
                </div>
              </Field>

              <Field label="Review Note (Min 4 chars)">
                <Input
                  placeholder="Provide context for approval/rejection"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </Field>

              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="secondary" onClick={() => setSelectedCorrection(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={reviewMutation.isPending}
                  onClick={() => reviewMutation.mutate()}
                >
                  {reviewMutation.isPending ? "Saving..." : "Submit Decision"}
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
