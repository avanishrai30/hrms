"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { CameraCapture } from "../../../components/camera-capture";
import { Badge, Button, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";

interface FaceProfileResponse {
  id: string;
  status: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED" | "ARCHIVED";
  version: number;
  enrolledAt: string | null;
  lastVerifiedAt: string | null;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  embeddings?: Array<{
    id: string;
    modelVersion: string;
    dimensions: number;
    confidenceThreshold: number;
    createdAt: string;
  }>;
}

interface VerifyDiagnosticResponse {
  matched: boolean;
  status: string;
  confidenceScore: number;
  livenessScore: number;
  reason: string;
}

export default function FaceProfilePage() {
  const queryClient = useQueryClient();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<VerifyDiagnosticResponse | null>(null);

  const profileQuery = useQuery({
    queryKey: ["face-profile-me"],
    queryFn: () => apiRequest<FaceProfileResponse | null>("/face/profile/me")
  });

  const testFaceMutation = useMutation({
    mutationFn: (imageBase64: string) =>
      apiRequest<VerifyDiagnosticResponse>("/face/verify", {
        method: "POST",
        body: JSON.stringify({ imageBase64 })
      }),
    onSuccess: (data) => {
      setDiagnosticResult(data);
      queryClient.invalidateQueries({ queryKey: ["face-profile-me"] });
    },
    onError: (err: Error) => {
      setDiagnosticResult({
        matched: false,
        status: "ERROR",
        confidenceScore: 0,
        livenessScore: 0,
        reason: err.message
      });
    }
  });

  const profile = profileQuery.data;

  const getStatusTone = (status?: string): "success" | "warning" | "danger" | "neutral" => {
    if (status === "ACTIVE") return "success";
    if (status === "PENDING_APPROVAL") return "warning";
    if (status === "SUSPENDED") return "danger";
    return "neutral";
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Biometric Profile</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage your facial biometric profile used for secure, spoof-resistant attendance verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={"/face/history" as Route}>
            <Button variant="secondary">Verification History</Button>
          </Link>
          <Link href={"/face/enroll" as Route}>
            <Button>{profile ? "Re-Enroll Face" : "Enroll Face Profile"}</Button>
          </Link>
        </div>
      </header>

      {/* Main Profile Status Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Panel className="p-6 md:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-base font-bold text-primary">
                👤
              </span>
              <div>
                <h2 className="text-base font-semibold text-zinc-950">Facial Recognition Status</h2>
                <p className="text-xs text-zinc-500">AES-256 encrypted 128-d vector encoding</p>
              </div>
            </div>
            <Badge tone={getStatusTone(profile?.status)}>
              {profile?.status ? profile.status.replace(/_/g, " ") : "NOT ENROLLED"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-control border border-border bg-muted/30 p-3">
              <span className="text-xs text-zinc-500">Profile Version</span>
              <p className="mt-1 font-semibold text-zinc-900">
                {profile ? `v${profile.version}` : "—"}
              </p>
            </div>

            <div className="rounded-control border border-border bg-muted/30 p-3">
              <span className="text-xs text-zinc-500">Enrolled Date</span>
              <p className="mt-1 font-semibold text-zinc-900">
                {profile?.enrolledAt ? new Date(profile.enrolledAt).toLocaleDateString() : "—"}
              </p>
            </div>

            <div className="rounded-control border border-border bg-muted/30 p-3">
              <span className="text-xs text-zinc-500">Last Verified At</span>
              <p className="mt-1 font-semibold text-zinc-900">
                {profile?.lastVerifiedAt ? new Date(profile.lastVerifiedAt).toLocaleString() : "Never"}
              </p>
            </div>

            <div className="rounded-control border border-border bg-muted/30 p-3">
              <span className="text-xs text-zinc-500">Active Embedding</span>
              <p className="mt-1 font-semibold text-zinc-900">
                {profile?.embeddings && profile.embeddings.length > 0
                  ? `${profile.embeddings[0]?.modelVersion} (${profile.embeddings[0]?.dimensions}-d)`
                  : "None"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-zinc-500">
              Run a camera diagnostic to test live anti-spoof liveness & facial match.
            </p>
            <Button
              variant="secondary"
              disabled={!profile}
              onClick={() => {
                setDiagnosticResult(null);
                setDiagnosticOpen(true);
              }}
            >
              Test Diagnostics
            </Button>
          </div>
        </Panel>

        {/* Security & Trust Guarantee */}
        <Panel className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">Security & Privacy</h3>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Zero raw face image storage. Only encrypted biometric vectors are retained.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Liveness detection prevents digital screen and photograph spoofing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>All verification calculations occur strictly server-side.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Strict tenant isolation prevents cross-organization exposure.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 rounded-control border border-border bg-muted/40 p-3 text-xs text-zinc-600">
            <p className="font-semibold text-zinc-900">Attendance Verification</p>
            <p className="mt-1">
              When checking in, attendance requires Location + Liveness + Face Match confirmation.
            </p>
          </div>
        </Panel>
      </div>

      {/* Diagnostic Modal */}
      {diagnosticOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Panel className="w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-zinc-950">Camera & Biometric Diagnostic</h3>
              <Button
                variant="secondary"
                className="h-7 px-2 text-xs"
                onClick={() => setDiagnosticOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <CameraCapture
                onCapture={(img) => testFaceMutation.mutate(img)}
                disabled={testFaceMutation.isPending}
                aspectRatio="square"
              />

              {testFaceMutation.isPending && (
                <p className="mt-4 text-xs font-semibold text-primary">
                  Running server-side liveness analysis & cosine similarity comparison...
                </p>
              )}

              {diagnosticResult && (
                <div
                  className={`mt-4 w-full rounded-control border p-4 text-xs ${
                    diagnosticResult.matched
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-red-200 bg-red-50 text-red-900"
                  }`}
                >
                  <p className="font-bold text-sm">
                    {diagnosticResult.matched ? "✓ Verification Passed" : "✗ Verification Failed"}
                  </p>
                  <p className="mt-1">{diagnosticResult.reason}</p>
                  <div className="mt-2 flex gap-4 border-t border-black/10 pt-2 font-mono">
                    <span>Match: {Math.round(diagnosticResult.confidenceScore * 100)}%</span>
                    <span>Liveness: {Math.round(diagnosticResult.livenessScore * 100)}%</span>
                    <span>Status: {diagnosticResult.status}</span>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
