"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button } from "../../../components/ui/button";
import { EmptyState, LoadingState, PermissionState } from "../../../components/page-primitives";
import { usePermissionGate } from "../../../lib/session-store";
import { TalentPageShell } from "../_components/talent-ui";

export default function AtsAnalyticsPage() {
  const gate = usePermissionGate("recruitment.read");

  if (gate.isLoading) return <LoadingState label="Loading Talent analytics" />;
  if (!gate.isAuthorized) return <PermissionState />;

  return (
    <TalentPageShell
      title="Talent Analytics"
      description="Analytics dashboards are intentionally deferred until the recruitment analytics contract is audited for historical source data."
      actions={
        <Button asChild variant="outline">
          <Link href={"/ats" as Route}>Talent overview</Link>
        </Button>
      }
    >
      <EmptyState
        title="Analytics not enabled"
        description="The current Talent sprint renders operational Jobs, Candidates, Interviews, Offers, and Hiring Onboarding only."
      />
    </TalentPageShell>
  );
}
