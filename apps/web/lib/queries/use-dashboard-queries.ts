"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api";

export interface AttendanceToday {
  record: {
    status: string;
    checkInAt: string | null;
    checkOutAt: string | null;
  } | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

export interface LeaveBalanceItem {
  id: string;
  availableDays: number;
  leaveType?: { name: string; code: string } | null;
}

export interface LeaveRequestItem {
  id: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeMeProfile {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department?: { name: string };
  designation?: { name: string };
  location?: { name: string };
  employmentType?: string;
  avatarUrl?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  priority?: string;
  publishedAt?: string;
}

export const dashboardQueryKeys = {
  all: ["aiavro-dashboard"] as const,
  attendance: () => [...dashboardQueryKeys.all, "attendance"] as const,
  leaves: () => [...dashboardQueryKeys.all, "leaves"] as const,
  profile: () => [...dashboardQueryKeys.all, "profile"] as const,
  employees: () => [...dashboardQueryKeys.all, "employees"] as const,
  announcements: () => [...dashboardQueryKeys.all, "announcements"] as const,
  payslips: () => [...dashboardQueryKeys.all, "payslips"] as const
};

export function useAttendanceToday() {
  return useQuery({
    queryKey: dashboardQueryKeys.attendance(),
    queryFn: () => apiRequest<AttendanceToday>("/attendance/me/today"),
    retry: 1,
    staleTime: 30000
  });
}

export function useLeaveBalances() {
  return useQuery({
    queryKey: dashboardQueryKeys.leaves(),
    queryFn: () => apiRequest<LeaveBalanceItem[]>("/leaves/balances/me"),
    retry: 1,
    staleTime: 60000
  });
}

export function useEmployeeProfile() {
  return useQuery({
    queryKey: dashboardQueryKeys.profile(),
    queryFn: () => apiRequest<EmployeeMeProfile>("/employees/me"),
    retry: 1,
    staleTime: 120000
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: dashboardQueryKeys.announcements(),
    queryFn: () => apiRequest<AnnouncementItem[]>("/announcements"),
    retry: 1,
    staleTime: 60000
  });
}
