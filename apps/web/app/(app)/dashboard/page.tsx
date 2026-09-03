"use client";

import React from "react";
import { MetricCards } from "./_components/metric-cards";
import { WorkforceActivityPanel } from "./_components/workforce-activity-panel";
import { RecentWorkforceTable } from "./_components/recent-workforce-table";

export default function AiavroDashboardPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <MetricCards />
      <WorkforceActivityPanel />
      <RecentWorkforceTable />
    </div>
  );
}
