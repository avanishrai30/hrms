"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface EnrollmentItem {
  id: string;
  version: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  qualityScore: number;
  livenessScore: number;
  reason: string | null;
  createdAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  enrolledBy?: {
    email: string;
  };
}

interface VerificationItem {
  id: string;
  status: string;
  confidenceScore: number;
  thresholdUsed: number;
  reason: string;
  createdAt: string;
  employee?: {
    fullName: string;
    employeeCode: string;
  };
  livenessVerifications?: Array<{
    status: string;
    livenessScore: number;
  }>;
}

interface EnrollmentsResponse {
  enrollments: EnrollmentItem[];
  total: number;
}

interface VerificationsResponse {
  verifications: VerificationItem[];
  total: number;
}

export default function BiometricAuditAdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"verifications" | "enrollments">("verifications");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewNote, setReviewNote] = useState("");

  const verificationsQuery = useQuery({
    queryKey: ["admin-biometric-verifications"],
    queryFn: () => apiRequest<VerificationsResponse>("/face/audit/verifications?limit=100")
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["admin-face-enrollments"],
    queryFn: () => apiRequest<EnrollmentsResponse>("/face/enrollments?limit=100")
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!selectedEnrollment) throw new Error("No enrollment selected");
      return apiRequest(`/face/enrollments/${selectedEnrollment.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status: reviewDecision,
          reviewNote
        })
      });
    },
    onSuccess: () => {
      setReviewModalOpen(false);
      setSelectedEnrollment(null);
      setReviewNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-face-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-biometric-verifications"] });
    }
  });

  const verifications = verificationsQuery.data?.verifications ?? [];
  const enrollments = enrollmentsQuery.data?.enrollments ?? [];

  const totalVerifications = verifications.length;
  const matchedCount = verifications.filter((v) => v.status === "MATCHED").length;
  const matchRate = totalVerifications > 0 ? Math.round((matchedCount / totalVerifications) * 100) : 100;
  const spoofAlerts = verifications.filter((v) => v.status === "SPOOF_DETECTED").length;
  const pendingEnrollments = enrollments.filter((e) => e.status === "PENDING").length;

  const getStatusTone = (status: string): "success" | "warning" | "danger" | "neutral" => {
    if (status === "MATCHED" || status === "APPROVED") return "success";
    if (status === "LOW_CONFIDENCE" || status === "PENDING") return "warning";
    if (status === "MISMATCH" || status === "SPOOF_DETECTED" || status === "REJECTED") return "danger";
    return "neutral";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Biometric & Face Audit Hub</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Monitor biometric verification health, review pending face enrollments, and audit spoof attempts.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Total Face Verifications</p>
          <p className="mt-1 text-2xl font-bold text-zinc-950">{totalVerifications}</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Biometric Match Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{matchRate}%</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Spoof / Liveness Flags</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{spoofAlerts}</p>
        </Panel>

        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Pending Enrollment Reviews</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pendingEnrollments}</p>
        </Panel>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === "verifications" ? "primary" : "secondary"}
          onClick={() => setActiveTab("verifications")}
        >
          Verification Audit Log ({totalVerifications})
        </Button>
        <Button
          variant={activeTab === "enrollments" ? "primary" : "secondary"}
          onClick={() => setActiveTab("enrollments")}
        >
          Enrollment Queue ({enrollments.length})
        </Button>
      </div>

      {/* Tab 1: Verifications Table */}
      {activeTab === "verifications" && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Liveness</th>
                  <th className="py-3 px-4">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {verifications.length > 0 ? (
                  verifications.map((item) => {
                    const liveness = item.livenessVerifications?.[0];
                    return (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="py-3 px-4 text-xs font-mono text-zinc-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900">
                          {item.employee?.fullName ?? "—"}
                          <span className="ml-1 text-xs text-zinc-400 font-mono">({item.employee?.employeeCode})</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge tone={getStatusTone(item.status)}>{item.status.replace(/_/g, " ")}</Badge>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                          {Math.round(item.confidenceScore * 100)}%
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-600">
                          {liveness ? `${Math.round(liveness.livenessScore * 100)}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-600 max-w-xs truncate" title={item.reason}>
                          {item.reason}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                      No biometric verifications recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Tab 2: Enrollments Table */}
      {activeTab === "enrollments" && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Quality Score</th>
                  <th className="py-3 px-4">Liveness</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.length > 0 ? (
                  enrollments.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 text-xs font-mono text-zinc-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-900">
                        {item.employee?.fullName ?? "—"}
                        <span className="ml-1 text-xs text-zinc-400 font-mono">({item.employee?.employeeCode})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-600">v{item.version}</td>
                      <td className="py-3 px-4 font-mono text-zinc-900">{Math.round(item.qualityScore * 100)}%</td>
                      <td className="py-3 px-4 font-mono text-zinc-900">{Math.round(item.livenessScore * 100)}%</td>
                      <td className="py-3 px-4">
                        <Badge tone={getStatusTone(item.status)}>{item.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === "PENDING" && (
                          <Button
                            variant="secondary"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setSelectedEnrollment(item);
                              setReviewDecision("APPROVED");
                              setReviewNote("Face profile verified and approved");
                              setReviewModalOpen(true);
                            }}
                          >
                            Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-zinc-500">
                      No face enrollment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Panel className="w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Review Face Enrollment</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Employee: {selectedEnrollment.employee?.fullName} ({selectedEnrollment.employee?.employeeCode})
            </p>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-control border border-border p-2">
                  <span className="text-zinc-500">Quality Score</span>
                  <p className="font-bold text-zinc-900">{Math.round(selectedEnrollment.qualityScore * 100)}%</p>
                </div>
                <div className="rounded-control border border-border p-2">
                  <span className="text-zinc-500">Liveness Score</span>
                  <p className="font-bold text-zinc-900">{Math.round(selectedEnrollment.livenessScore * 100)}%</p>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={reviewDecision === "APPROVED"}
                    onChange={() => setReviewDecision("APPROVED")}
                  />
                  Approve & Activate
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-red-600">
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={reviewDecision === "REJECTED"}
                    onChange={() => setReviewDecision("REJECTED")}
                  />
                  Reject
                </label>
              </div>

              <Field label="Review Note (Min 4 chars)">
                <Input
                  placeholder="e.g. Verified with identity document"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </Field>

              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={reviewNote.length < 4 || reviewMutation.isPending}
                  onClick={() => reviewMutation.mutate()}
                >
                  {reviewMutation.isPending ? "Submitting..." : "Confirm Decision"}
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
