"use client";

import Link from "next/link";
import type { Route } from "next";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AiavroWordmark } from "../../components/aiavro-brand";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { EmptyState, ErrorState, LoadingState } from "../../components/page-primitives";
import { formatDateTime, formatTalentLabel, usePublicJobs } from "../../lib/queries/use-talent-queries";

export default function PublicCareersPage() {
  const [query, setQuery] = useState("");
  const jobs = usePublicJobs();
  const rows = jobs.data ?? [];
  const filteredJobs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((job) =>
      [job.title, job.companyName, job.department, job.location, job.employmentType, ...(job.skills ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [query, rows]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <AiavroWordmark className="h-7 w-auto" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Open roles</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Explore active roles published by tenant hiring teams on AIavro.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={"/candidate-portal" as Route}>Track application</Link>
          </Button>
        </header>

        <Card size="sm">
          <CardContent className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-10 pl-9" placeholder="Search roles..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </CardContent>
        </Card>

        {jobs.isLoading ? <LoadingState label="Loading roles" /> : null}
        {jobs.error ? <ErrorState message={jobs.error.message} /> : null}
        {!jobs.isLoading && !jobs.error && filteredJobs.length === 0 ? <EmptyState title="No open jobs" /> : null}

        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="transition hover:border-primary/40">
              <CardHeader>
                <div className="min-w-0">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription>
                    {job.companyName} · {job.department ?? "-"} · {job.location ?? "-"}
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/careers/jobs/${job.slug}` as Route}>View role</Link>
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-1">{formatTalentLabel(job.employmentType)}</span>
                  <span className="rounded-md bg-muted px-2 py-1">{job.experienceRange ?? "-"}</span>
                  <span className="rounded-md bg-muted px-2 py-1">Published {formatDateTime(job.publishedAt)}</span>
                </div>
                {job.skills?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span key={skill} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">{skill}</span>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
