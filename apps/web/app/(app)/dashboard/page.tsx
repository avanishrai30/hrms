"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "../../../lib/session-store";
import { loadDashboard } from "../../../lib/dashboard-data";
import { MetricPillsStrip } from "../../../components/aiavro/dashboard/metric-pills-strip";
import { EmployeeProfileCard } from "../../../components/aiavro/dashboard/employee-profile-card";
import { WorkTimeTracker } from "../../../components/aiavro/dashboard/work-time-tracker";
import { HiringOrgWidget } from "../../../components/aiavro/dashboard/hiring-org-widget";
import { ScheduleCalendar } from "../../../components/aiavro/dashboard/schedule-calendar";
import { OnboardingTaskRail } from "../../../components/aiavro/dashboard/onboarding-task-rail";
import { DeviceBenefitsAccordion } from "../../../components/aiavro/dashboard/device-benefits-accordion";
import { AiavroCopilotCard } from "../../../components/aiavro/dashboard/aiavro-copilot-card";
import { SkeletonLoader, InlineUnavailableState } from "../../../components/aiavro/feedback/aiavro-states";

export default function AiavroEmployeeDashboard() {
  const permissions = useSessionStore((state) => state.permissions);
  const userName = "Avanish";

  const { data: dashboard, isLoading, isError, refetch } = useQuery({
    queryKey: ["aiavro-home-dashboard"],
    queryFn: loadDashboard,
    staleTime: 30000
  });

  const isHrOrAdmin = permissions.includes("employees.read") || permissions.includes("tenant.settings.read");
  const leaveBalanceTotal = dashboard?.leaveBalances.reduce((sum, item) => sum + Number(item.availableDays ?? 0), 0) ?? 18;
  const pendingRequestsTotal = dashboard?.leaveRequests.filter((item) => item.status.includes("PENDING")).length ?? 0;
  const attendanceRecord = dashboard?.attendance?.record;
  const attendanceStatus = attendanceRecord?.status ?? "Ready to Clock In";

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonLoader className="h-8 w-64" />
          <SkeletonLoader className="h-8 w-80 rounded-pill" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader className="h-64 rounded-card" />
          <SkeletonLoader className="h-64 rounded-card" />
          <SkeletonLoader className="h-64 rounded-card" />
          <SkeletonLoader className="h-64 rounded-card" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <InlineUnavailableState
          title="Unable to load AIavro Dashboard"
          description="Could not connect to workspace services. Please verify session and network connectivity."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Metric Strip & Welcome */}
      <MetricPillsStrip
        userName={userName}
        isHrOrAdmin={isHrOrAdmin}
        attendanceStatus={attendanceStatus}
        leaveBalanceDays={leaveBalanceTotal}
        pendingRequestsCount={pendingRequestsTotal}
        employeeCount={dashboard?.employeeCount ?? null}
        departmentsCount={6}
        openingsCount={4}
      />

      {/* 2. Main High-Density Asymmetric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {/* Col 1: Employee Profile Card */}
        <EmployeeProfileCard
          fullName="Avanish Rai"
          designation="Principal Software Architect"
          department="Engineering"
          location="Bangalore HQ"
          employeeCode="VC-0001"
          salaryMonthlyInr={isHrOrAdmin ? 285000 : null}
        />

        {/* Col 2: Hiring / Workforce Velocity */}
        <HiringOrgWidget
          isHrOrAdmin={isHrOrAdmin}
          totalEmployees={dashboard?.employeeCount ?? 128}
          leaveBalanceDays={leaveBalanceTotal}
        />

        {/* Col 3: Work Time / Attendance Circular Tracker */}
        <WorkTimeTracker
          checkInTime={attendanceRecord?.checkInAt}
          checkOutTime={attendanceRecord?.checkOutAt}
          status={attendanceStatus}
          canCheckIn={dashboard?.attendance?.canCheckIn ?? true}
          canCheckOut={dashboard?.attendance?.canCheckOut ?? false}
          onRefresh={() => refetch()}
        />

        {/* Col 4: Onboarding / Action Rail */}
        <div className="lg:row-span-2">
          <OnboardingTaskRail />
        </div>

        {/* Col 1 (Row 2): Device & Benefits Accordion */}
        <DeviceBenefitsAccordion
          deviceTag="AST-LAP-001"
          deviceName='MacBook Pro 16" M3 Max'
        />

        {/* Col 2 & 3 (Row 2): Integrated Schedule & Calendar */}
        <div className="md:col-span-2">
          <ScheduleCalendar />
        </div>
      </div>

      {/* 3. Bottom Intelligent Copilot Action Card */}
      <AiavroCopilotCard />
    </div>
  );
}
