"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CameraCapture } from "../../../../components/camera-capture";
import { Button, Field, Input, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface EnrollResponse {
  id: string;
  version: number;
  status: string;
  qualityScore: number;
  livenessScore: number;
}

export default function FaceEnrollPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("Initial face biometric enrollment");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const enrollMutation = useMutation({
    mutationFn: () => {
      if (!capturedBase64) {
        throw new Error("Please capture your face before submitting enrollment.");
      }
      return apiRequest<EnrollResponse>("/face/enroll", {
        method: "POST",
        body: JSON.stringify({
          imageBase64: capturedBase64,
          reason
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["face-profile-me"] });
      router.push("/face" as Route);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message);
    }
  });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Enroll Face Profile</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Capture a clear, well-lit photo to register or update your attendance biometric profile.
          </p>
        </div>
        <Link href={"/face" as Route}>
          <Button variant="secondary">Cancel</Button>
        </Link>
      </header>

      <Panel className="p-6">
        <div className="flex flex-col items-center">
          <CameraCapture
            onCapture={(img) => {
              setCapturedBase64(img);
              setErrorMsg(null);
            }}
            disabled={enrollMutation.isPending}
            aspectRatio="square"
          />

          <div className="mt-6 w-full space-y-4 border-t border-border pt-4">
            <Field label="Enrollment Reason / Notes">
              <Input
                placeholder="e.g. Initial onboarding or regular profile update"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>

            {errorMsg && (
              <div className="rounded-control border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <p className="font-semibold">Enrollment Failed</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Link href={"/face" as Route}>
                <Button variant="secondary" disabled={enrollMutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button
                disabled={!capturedBase64 || enrollMutation.isPending}
                onClick={() => enrollMutation.mutate()}
              >
                {enrollMutation.isPending ? "Validating & Enrolling..." : "Submit Enrollment"}
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
