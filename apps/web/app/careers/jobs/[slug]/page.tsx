"use client";

import { use, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AiavroWordmark } from "../../../../components/aiavro-brand";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { EmptyState, ErrorState, LoadingState } from "../../../../components/page-primitives";
import { formatDateTime, formatTalentLabel, usePublicApply, usePublicJob } from "../../../../lib/queries/use-talent-queries";

export default function PublicJobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const job = usePublicJob(slug);
  const apply = usePublicApply();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    currentLocation: "",
    experienceYears: "",
    currentCtc: "",
    expectedCtc: "",
    noticePeriodDays: "",
    skills: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    education: "",
    summary: ""
  });

  const handleApply = (event: React.FormEvent) => {
    event.preventDefault();
    apply.mutate({
      jobSlug: slug,
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      currentLocation: form.currentLocation || undefined,
      experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
      currentCtc: form.currentCtc ? Number(form.currentCtc) : undefined,
      expectedCtc: form.expectedCtc ? Number(form.expectedCtc) : undefined,
      noticePeriodDays: form.noticePeriodDays ? Number(form.noticePeriodDays) : undefined,
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      linkedinUrl: form.linkedinUrl || undefined,
      githubUrl: form.githubUrl || undefined,
      portfolioUrl: form.portfolioUrl || undefined,
      education: form.education || undefined,
      summary: form.summary || undefined
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <AiavroWordmark className="h-7 w-auto" />
          <Button asChild variant="outline">
            <Link href={"/careers" as Route}>
              <ArrowLeft className="h-4 w-4" />
              Roles
            </Link>
          </Button>
        </header>

        {job.isLoading ? <LoadingState label="Loading role" /> : null}
        {job.error ? <ErrorState message={job.error.message} /> : null}
        {!job.isLoading && !job.error && !job.data ? <EmptyState title="No open jobs" /> : null}

        {apply.data ? (
          <Card className="mx-auto max-w-xl text-center">
            <CardContent className="grid gap-4 py-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Application received</h1>
                <p className="mt-2 text-sm text-muted-foreground">Use this application code to track your status.</p>
              </div>
              <div className="rounded-xl border border-border bg-muted p-4">
                <span className="text-xs text-muted-foreground">Application code</span>
                <p className="mt-1 font-mono text-xl font-semibold">{apply.data.applicationCode}</p>
              </div>
              <Button asChild>
                <Link href={"/candidate-portal" as Route}>Track application</Link>
              </Button>
            </CardContent>
          </Card>
        ) : job.data ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{job.data.title}</CardTitle>
                <CardDescription>{job.data.companyName} · {job.data.department ?? "-"} · {job.data.location ?? "-"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-6">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-1">{formatTalentLabel(job.data.employmentType)}</span>
                  <span className="rounded-md bg-muted px-2 py-1">{job.data.experienceRange ?? "-"}</span>
                  <span className="rounded-md bg-muted px-2 py-1">Published {formatDateTime(job.data.publishedAt)}</span>
                </div>
                {job.data.skills?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {job.data.skills.map((skill) => (
                      <span key={skill} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">{skill}</span>
                    ))}
                  </div>
                ) : null}
                <section className="whitespace-pre-wrap border-t border-border pt-5 text-muted-foreground">
                  {job.data.jobDescription ?? "-"}
                </section>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Apply</CardTitle>
                <CardDescription>Submit candidate profile details for this role.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApply} className="grid gap-3">
                  <Field label="Full name"><Input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></Field>
                  <Field label="Email"><Input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
                  <Field label="Mobile"><Input required value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></Field>
                  <Field label="Current location"><Input value={form.currentLocation} onChange={(event) => setForm({ ...form, currentLocation: event.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Experience"><Input type="number" min="0" step="0.5" value={form.experienceYears} onChange={(event) => setForm({ ...form, experienceYears: event.target.value })} /></Field>
                    <Field label="Notice days"><Input type="number" min="0" value={form.noticePeriodDays} onChange={(event) => setForm({ ...form, noticePeriodDays: event.target.value })} /></Field>
                  </div>
                  <Field label="Skills"><Input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} /></Field>
                  <Field label="LinkedIn URL"><Input value={form.linkedinUrl} onChange={(event) => setForm({ ...form, linkedinUrl: event.target.value })} /></Field>
                  <Field label="Portfolio URL"><Input value={form.portfolioUrl} onChange={(event) => setForm({ ...form, portfolioUrl: event.target.value })} /></Field>
                  <Field label="Summary"><Input value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></Field>
                  {apply.error ? <p className="text-sm text-destructive">{apply.error.message}</p> : null}
                  <Button type="submit" disabled={apply.isPending}>
                    {apply.isPending ? "Submitting" : "Submit application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label}
      {children}
    </label>
  );
}
