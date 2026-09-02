"use client";

import Link from "next/link";
import type { Route } from "next";
import { Search } from "lucide-react";
import { useState } from "react";
import { AiavroWordmark } from "../../components/aiavro-brand";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { EmptyState, ErrorState } from "../../components/page-primitives";
import { formatCurrency, formatDateTime, formatTalentLabel, usePublicApplicationStatus } from "../../lib/queries/use-talent-queries";
import { TalentStatusBadge } from "../ats/_components/talent-ui";

export default function CandidatePortalPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const status = usePublicApplicationStatus(submittedCode, Boolean(submittedCode));

  const handleTrack = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedCode(trackingCode.trim());
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <AiavroWordmark className="h-7 w-auto" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Candidate portal</h1>
              <p className="mt-2 text-sm text-muted-foreground">Track application status with your application code.</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={"/careers" as Route}>Open roles</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Application lookup</CardTitle>
            <CardDescription>Enter the code returned after submitting an application.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="flex flex-col gap-3 sm:flex-row">
              <label className="grid flex-1 gap-2 text-sm font-medium">
                Application code
                <Input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} />
              </label>
              <Button type="submit" className="sm:self-end" disabled={!trackingCode.trim() || status.isFetching}>
                <Search className="h-4 w-4" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {status.error ? <ErrorState message={status.error.message} /> : null}
        {status.isFetching ? <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading application status</p> : null}
        {submittedCode && !status.isFetching && !status.error && !status.data ? <EmptyState title="No application found" /> : null}

        {status.data ? (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div>
                  <CardDescription className="font-mono">{status.data.applicationCode}</CardDescription>
                  <CardTitle>{status.data.candidateName}</CardTitle>
                  <CardDescription>{status.data.jobTitle} · {status.data.department ?? "-"}</CardDescription>
                </div>
                <TalentStatusBadge status={status.data.stage} />
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Applied {formatDateTime(status.data.appliedAt)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interviews</CardTitle>
                <CardDescription>Scheduled and completed rounds shared by the hiring team.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {status.data.interviews.length === 0 ? <EmptyState title="No interviews scheduled" /> : null}
                {status.data.interviews.map((interview, index) => (
                  <div key={`${interview.roundName}-${interview.scheduledStartTime}-${index}`} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                    <div>
                      <p className="text-sm font-medium">{interview.roundName}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(interview.scheduledStartTime)}</p>
                    </div>
                    <TalentStatusBadge status={interview.status} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {status.data.offer ? (
              <Card>
                <CardHeader>
                  <div>
                    <CardDescription className="font-mono">{status.data.offer.offerCode}</CardDescription>
                    <CardTitle>Offer</CardTitle>
                    <CardDescription>Joining {formatDateTime(status.data.offer.joiningDate)}</CardDescription>
                  </div>
                  <TalentStatusBadge status={status.data.offer.status} />
                </CardHeader>
                <CardContent className="text-sm font-semibold tabular-nums">{formatCurrency(status.data.offer.totalCtc)}</CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Hiring onboarding</CardTitle>
                <CardDescription>Preboarding tasks available after offer release.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {status.data.preboardingTasks.length === 0 ? <EmptyState title="No onboarding tasks" /> : null}
                {status.data.preboardingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{formatTalentLabel(task.type)}</p>
                    </div>
                    <TalentStatusBadge status={task.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
