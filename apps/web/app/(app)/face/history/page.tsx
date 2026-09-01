"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

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

interface VerificationListResponse {
  verifications: VerificationItem[];
  total: number;
}

export default function FaceHistoryPage() {
  const historyQuery = useQuery({
    queryKey: ["face-history-me"],
    queryFn: () => apiRequest<VerificationListResponse>("/face/audit/verifications?limit=50")
  });

  const getStatusTone = (status: string): "success" | "warning" | "danger" | "neutral" => {
    if (status === "MATCHED") return "success";
    if (status === "LOW_CONFIDENCE") return "warning";
    if (status === "MISMATCH" || status === "SPOOF_DETECTED") return "danger";
    return "neutral";
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Biometric Verification Log</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Audit history of your facial verification attempts and anti-spoof liveness checks.
          </p>
        </div>
        <Link href={"/face" as Route}>
          <Button variant="secondary">Back to Profile</Button>
        </Link>
      </header>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Match Confidence</th>
                <th className="py-3 px-4">Liveness Score</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historyQuery.data?.verifications && historyQuery.data.verifications.length > 0 ? (
                historyQuery.data.verifications.map((item) => {
                  const liveness = item.livenessVerifications?.[0];
                  return (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 text-xs font-mono text-zinc-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={getStatusTone(item.status)}>{item.status.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                        {Math.round(item.confidenceScore * 100)}%
                        <span className="text-xs text-zinc-400 font-normal"> (min {Math.round(item.thresholdUsed * 100)}%)</span>
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
                  <td colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                    No verification records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
