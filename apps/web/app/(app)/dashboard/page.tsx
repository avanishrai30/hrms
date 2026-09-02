"use client";

import React from "react";
import { useSessionStore } from "../../../lib/session-store";
import {
  useEmployeeProfile,
  useAttendanceToday,
  useLeaveBalances,
  useLeaveRequests,
  useHolidays,
  useEmployeeRequests,
  useAnnouncements,
  useEmployeeCount
} from "../../../lib/queries/use-dashboard-queries";
import { MetricPillsStrip } from "../../../components/aiavro/dashboard/metric-pills-strip";
import { EmployeeProfileCard } from "../../../components/aiavro/dashboard/employee-profile-card";
import { WorkTimeTracker } from "../../../components/aiavro/dashboard/work-time-tracker";
import { HiringOrgWidget } from "../../../components/aiavro/dashboard/hiring-org-widget";
import { ScheduleCalendar } from "../../../components/aiavro/dashboard/schedule-calendar";
import { OnboardingTaskRail } from "../../../components/aiavro/dashboard/onboarding-task-rail";
import { DeviceBenefitsAccordion } from "../../../components/aiavro/dashboard/device-benefits-accordion";
import { AiavroCopilotCard } from "../../../components/aiavro/dashboard/aiavro-copilot-card";

export default function AiavroEmployeeDashboard() {
  const permissions = useSessionStore((state) => state.permissions) || [];
  const isHrOrAdmin = permissions.includes("employees.read") || permissions.includes("tenant.settings.read");

  // Domain Queries with localized cache and error boundaries
  const profileQuery = useEmployeeProfile();
  const attendanceQuery = useAttendanceToday();
  const leaveBalancesQuery = useLeaveBalances();
  const leaveRequestsQuery = useLeaveRequests();
  const holidaysQuery = useHolidays();
  const requestsQuery = useEmployeeRequests();
  const announcementsQuery = useAnnouncements();
  const employeeCountQuery = useEmployeeCount(isHrOrAdmin);

  // Derived real values with ZERO synthetic fallbacks
  const profileData = profileQuery.data ?? null;
  const userName = profileData?.firstName || profileData?.fullName;

  const attendanceRecord = attendanceQuery.data?.record;
  const attendanceStatus = attendanceRecord?.status || (attendanceQuery.isError ? "Unavailable" : "Ready to Clock In");
  const shiftData = attendanceQuery.data?.shift;

  const leaveBalances = leaveBalancesQuery.data ?? [];
  const totalLeaveDays = leaveBalancesQuery.isSuccess
    ? leaveBalances.reduce((sum, item) => sum + Number(item.availableDays ?? 0), 0)
    : null;

  const pendingRequests = requestsQuery.data?.requests ?? [];
  const pendingRequestsCount = requestsQuery.isSuccess
    ? pendingRequests.filter((r) => r.status.includes("PENDING")).length
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1680px] mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Metric Strip & Welcome */}
      <MetricPillsStrip
        userName={userName}
        isHrOrAdmin={isHrOrAdmin}
        attendanceStatus={attendanceStatus}
        leaveBalanceDays={totalLeaveDays}
        pendingRequestsCount={pendingRequestsCount}
        employeeCount={employeeCountQuery.data ?? null}
      />

      {/* 2. Main High-Density Asymmetric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {/* Col 1: Employee Profile Card */}
        <EmployeeProfileCard
          profile={profileData}
          isLoading={profileQuery.isLoading}
          isError={profileQuery.isError}
          onRetry={() => profileQuery.refetch()}
        />

        {/* Col 2: Workforce Headcount or Leave Balances */}
        <HiringOrgWidget
          isHrOrAdmin={isHrOrAdmin}
          totalEmployees={employeeCountQuery.data}
          leaveBalances={leaveBalances}
          isLoading={isHrOrAdmin ? employeeCountQuery.isLoading : leaveBalancesQuery.isLoading}
          isError={isHrOrAdmin ? employeeCountQuery.isError : leaveBalancesQuery.isError}
        />

        {/* Col 3: Work Time / Attendance Circular Tracker */}
        <WorkTimeTracker
          checkInTime={attendanceRecord?.checkInAt}
          checkOutTime={attendanceRecord?.checkOutAt}
          status={attendanceRecord?.status}
          shiftName={shiftData?.name}
          shiftHours={shiftData?.workHours}
          canCheckIn={attendanceQuery.data?.canCheckIn ?? true}
          canCheckOut={attendanceQuery.data?.canCheckOut ?? false}
          isLoading={attendanceQuery.isLoading}
          isError={attendanceQuery.isError}
          onRefresh={() => attendanceQuery.refetch()}
        />

        {/* Col 4: Action Rail / Service Requests */}
        <div className="lg:row-span-2">
          <OnboardingTaskRail
            requests={pendingRequests}
            isLoading={requestsQuery.isLoading}
            isError={requestsQuery.isError}
          />
        </div>

        {/* Col 1 (Row 2): Announcements & Workplace Services */}
        <DeviceBenefitsAccordion
          announcements={announcementsQuery.data ?? []}
          isLoading={announcementsQuery.isLoading}
          isError={announcementsQuery.isError}
        />

        {/* Col 2 & 3 (Row 2): Integrated Schedule & Calendar */}
        <div className="md:col-span-2">
          <ScheduleCalendar
            holidays={holidaysQuery.data ?? []}
            leaveRequests={leaveRequestsQuery.data?.requests ?? []}
            isLoading={holidaysQuery.isLoading || leaveRequestsQuery.isLoading}
            isError={holidaysQuery.isError && leaveRequestsQuery.isError}
          />
        </div>
      </div>

      {/* 3. Bottom Intelligent Copilot Action Card */}
      <AiavroCopilotCard />
    </div>
  );
}
