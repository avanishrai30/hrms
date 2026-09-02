"use client";

import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { LoadingState, PermissionState } from "../../../components/page-primitives";
import { useDebounce } from "../../../lib/queries/use-people-queries";
import { useCandidates } from "../../../lib/queries/use-talent-queries";
import { useHasPermission, usePermissionGate } from "../../../lib/session-store";
import {
  TalentDataCard,
  TalentMobileList,
  TalentPageShell,
  TalentRecordCard,
  TalentStatusBadge,
  TalentTable,
  TalentToolbar,
  TableCell,
  TableRow
} from "../_components/talent-ui";

const PAGE_SIZE = 25;
const candidateStatuses = ["ALL", "APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "ON_HOLD"];

export default function CandidatesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const gate = usePermissionGate("candidates.read");
  const canCreate = useHasPermission("candidates.create");
  const candidates = useCandidates(
    { query: debouncedQuery, status, limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    gate.isAuthorized
  );
  const rows = candidates.data ?? [];
  const hasNext = rows.length === PAGE_SIZE;

  if (gate.isLoading) return <LoadingState label="Loading candidates" />;
  if (!gate.isAuthorized) return <PermissionState />;

  return (
    <TalentPageShell
      title="Candidates"
      description="Search tenant candidates by profile, contact, code, status, or skills using the recruitment API."
      actions={
        canCreate ? (
          <Button asChild>
            <Link href={"/ats/pipeline" as Route}>
              <Plus className="h-4 w-4" />
              Add via pipeline
            </Link>
          </Button>
        ) : null
      }
    >
      <TalentDataCard title="Candidate database" description="PII is shown only after `candidates.read` authorization succeeds.">
        <TalentToolbar search={query} onSearch={(value) => { setQuery(value); setPage(0); }} searchPlaceholder="Search candidates...">
          <div className="flex max-w-full gap-2 overflow-x-auto">
            {candidateStatuses.map((item) => (
              <Button
                key={item}
                type="button"
                variant={status === item ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatus(item);
                  setPage(0);
                }}
              >
                {item.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </TalentToolbar>

        <div className="mt-4">
          <TalentTable
            columns={["Code", "Candidate", "Location", "Experience", "Notice", "Status", "Applications", "Action"]}
            emptyTitle="No candidates match filters"
            isLoading={candidates.isLoading}
            error={candidates.error?.message}
          >
            {rows.length
              ? rows.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{candidate.candidateCode}</TableCell>
                    <TableCell>
                      <div className="font-medium">{candidate.fullName}</div>
                      <div className="text-xs text-muted-foreground">{candidate.email ?? "-"} · {candidate.mobile ?? "-"}</div>
                    </TableCell>
                    <TableCell>{candidate.currentLocation ?? "-"}</TableCell>
                    <TableCell className="tabular-nums">{candidate.experienceYears ?? "-"} yrs</TableCell>
                    <TableCell className="tabular-nums">{candidate.noticePeriodDays ?? "-"} days</TableCell>
                    <TableCell><TalentStatusBadge status={candidate.status} /></TableCell>
                    <TableCell className="tabular-nums">{candidate.applications?.length ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/ats/candidates/${candidate.id}` as Route}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TalentTable>

          <TalentMobileList emptyTitle="No candidates match filters" isLoading={candidates.isLoading} error={candidates.error?.message}>
            {rows.length
              ? rows.map((candidate) => (
                  <TalentRecordCard
                    key={candidate.id}
                    eyebrow={candidate.candidateCode}
                    title={candidate.fullName}
                    meta={`${candidate.email ?? "-"} · ${candidate.currentLocation ?? "-"}`}
                    status={candidate.status}
                    href={`/ats/candidates/${candidate.id}` as Route}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{candidate.experienceYears ?? "-"} yrs</span>
                      <span>{candidate.noticePeriodDays ?? "-"} days notice</span>
                    </div>
                  </TalentRecordCard>
                ))
              : null}
          </TalentMobileList>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>Page {page + 1}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(value - 1, 0))} disabled={page === 0 || candidates.isFetching}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={!hasNext || candidates.isFetching}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TalentDataCard>
    </TalentPageShell>
  );
}
