"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api";

export interface AttendanceTodayResponse {
  date: string;
  record: {
    id?: string;
    status: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    totalMinutes?: number | null;
  } | null;
  shift?: {
    id?: string;
    name?: string;
    startTime?: string;
    endTime?: string;
    workHours?: number | null;
  } | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  rules?: {
    allowSelfCheckIn?: boolean;
    requireGeofence?: boolean;
    requireFace?: boolean;
  };
}

export interface LeaveBalanceItem {
  id: string;
  availableDays: number;
  consumedDays?: number;
  accruedDays?: number;
  leaveType?: {
    id: string;
    name: string;
    code: string;
    color?: string;
  } | null;
}

export interface LeaveRequestItem {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  reason?: string;
  leaveType?: {
    name: string;
    code: string;
  };
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  isOptional?: boolean;
  description?: string;
}

export interface EmployeeProfileResponse {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  workEmail?: string;
  status?: string;
  employmentType?: string;
  department?: string | { name: string };
  designation?: string | { title?: string; name?: string };
  businessUnit?: string;
  team?: string;
  region?: string;
  joiningDate?: string;
  managerName?: string | null;
  avatarUrl?: string;
}

export interface EmployeeRequestItem {
  id: string;
  requestType: string;
  status: string;
  title?: string;
  reason?: string;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  priority?: string;
  content?: string;
  publishedAt?: string;
}

export interface EmployeeListResponse {
  employees?: unknown[];
  total?: number;
}

export const dashboardKeys = {
  all: ["aiavro-dashboard"] as const,
  profile: () => [...dashboardKeys.all, "profile"] as const,
  attendance: () => [...dashboardKeys.all, "attendance"] as const,
  leaves: () => [...dashboardKeys.all, "leaves"] as const,
  leaveRequests: () => [...dashboardKeys.all, "leave-requests"] as const,
  holidays: () => [...dashboardKeys.all, "holidays"] as const,
  requests: () => [...dashboardKeys.all, "requests"] as const,
  announcements: () => [...dashboardKeys.all, "announcements"] as const,
  employeeCount: () => [...dashboardKeys.all, "employee-count"] as const
};

export function useEmployeeProfile() {
  return useQuery({
    queryKey: dashboardKeys.profile(),
    queryFn: () => apiRequest<EmployeeProfileResponse>("/profile"),
    retry: 1,
    staleTime: 60000
  });
}

export function useAttendanceToday() {
  return useQuery({
    queryKey: dashboardKeys.attendance(),
    queryFn: () => apiRequest<AttendanceTodayResponse>("/attendance/me/today"),
    retry: 1,
    staleTime: 15000
  });
}

export function useLeaveBalances() {
  return useQuery({
    queryKey: dashboardKeys.leaves(),
    queryFn: () => apiRequest<LeaveBalanceItem[]>("/leaves/balances/me"),
    retry: 1,
    staleTime: 60000
  });
}

export function useLeaveRequests() {
  return useQuery({
    queryKey: dashboardKeys.leaveRequests(),
    queryFn: () => apiRequest<{ requests: LeaveRequestItem[] }>("/leaves/requests/me"),
    retry: 1,
    staleTime: 30000
  });
}

export function useHolidays() {
  return useQuery({
    queryKey: dashboardKeys.holidays(),
    queryFn: () => apiRequest<HolidayItem[]>("/leaves/holidays"),
    retry: 1,
    staleTime: 300000
  });
}

export function useEmployeeRequests() {
  return useQuery({
    queryKey: dashboardKeys.requests(),
    queryFn: () => apiRequest<{ requests: EmployeeRequestItem[] }>("/requests?limit=10"),
    retry: 1,
    staleTime: 30000
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: dashboardKeys.announcements(),
    queryFn: () => apiRequest<AnnouncementItem[]>("/announcements"),
    retry: 1,
    staleTime: 60000
  });
}

export function useEmployeeCount(enabled: boolean) {
  return useQuery({
    queryKey: dashboardKeys.employeeCount(),
    queryFn: async () => {
      const res = await apiRequest<EmployeeListResponse | unknown[]>("/employees?limit=1");
      if (Array.isArray(res)) return res.length;
      if (typeof res === "object" && res !== null) {
        if ("total" in res && typeof res.total === "number") return res.total;
        if ("employees" in res && Array.isArray(res.employees)) return res.employees.length;
      }
      return null;
    },
    enabled,
    retry: 1,
    staleTime: 120000
  });
}
