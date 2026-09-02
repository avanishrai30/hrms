"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";

// ----------------- Profile Types & Hooks -----------------

export interface EmployeeProfileData {
  id: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  workEmail?: string;
  phone?: string;
  status?: string;
  employmentType?: string;
  joiningDate?: string;
  department?: string | { name?: string };
  designation?: string | { title?: string; name?: string };
  businessUnit?: string;
  team?: string;
  region?: string;
  managerName?: string | null;
  avatarUrl?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  } | null;
  currentAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  permanentAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
}

export const profileKeys = {
  all: ["ess-profile"] as const,
  me: () => [...profileKeys.all, "me"] as const
};

export function useProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => apiRequest<EmployeeProfileData>("/profile"),
    enabled,
    retry: 1,
    staleTime: 60000
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployeeProfileData>) =>
      apiRequest<EmployeeProfileData>("/profile", {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    }
  });
}

// ----------------- Attendance Types & Hooks -----------------

export interface AttendanceRecordItem {
  id: string;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedMinutes?: number;
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
  overtimeMinutes?: number;
  notes?: string | null;
  date?: string;
}

export interface TodayAttendanceData {
  date: string;
  record: AttendanceRecordItem | null;
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

export const attendanceKeys = {
  all: ["ess-attendance"] as const,
  today: () => [...attendanceKeys.all, "today"] as const,
  history: (startDate?: string, endDate?: string) =>
    [...attendanceKeys.all, "history", { startDate, endDate }] as const
};

export function useAttendanceToday(enabled: boolean = true) {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: () => apiRequest<TodayAttendanceData>("/attendance/me/today"),
    enabled,
    retry: 1,
    staleTime: 15000
  });
}

export function useAttendanceHistory(startDate?: string, endDate?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: attendanceKeys.history(startDate, endDate),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await apiRequest<AttendanceRecordItem[] | { records: AttendanceRecordItem[] }>(
        `/attendance/history${queryString}`
      );
      if (Array.isArray(res)) return res;
      if (res && "records" in res && Array.isArray(res.records)) return res.records;
      return [];
    },
    enabled,
    retry: 1,
    staleTime: 60000
  });
}

export function usePunchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      action,
      notes,
      latitude,
      longitude,
      accuracy
    }: {
      action: "check-in" | "check-out";
      notes?: string | undefined;
      latitude?: number | undefined;
      longitude?: number | undefined;
      accuracy?: number | undefined;
    }) => {
      return apiRequest(`/attendance/${action}`, {
        method: "POST",
        body: JSON.stringify({ source: "WEB", notes, latitude, longitude, accuracy })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    }
  });
}

// ----------------- Leave Types & Hooks -----------------

export interface LeaveBalanceData {
  id: string;
  availableDays: number;
  allocatedDays?: number | null;
  consumedDays?: number | null;
  accruedDays?: number | null;
  leaveType?: {
    id: string;
    name: string;
    code: string;
    color?: string;
  } | null;
}

export interface LeaveTypeItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
}

export interface LeaveRequestData {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  reason?: string;
  leaveType?: {
    id?: string;
    name?: string;
    code?: string;
  } | null;
  createdAt?: string;
}

export interface HolidayData {
  id: string;
  name: string;
  date: string;
  isOptional?: boolean;
  description?: string;
}

export const leaveKeys = {
  all: ["ess-leaves"] as const,
  balances: () => [...leaveKeys.all, "balances"] as const,
  types: () => [...leaveKeys.all, "types"] as const,
  requests: () => [...leaveKeys.all, "requests"] as const,
  holidays: (year?: number) => [...leaveKeys.all, "holidays", { year }] as const
};

export function useLeaveBalances(enabled: boolean = true) {
  return useQuery({
    queryKey: leaveKeys.balances(),
    queryFn: () => apiRequest<LeaveBalanceData[]>("/leaves/balances/me"),
    enabled,
    retry: 1,
    staleTime: 60000
  });
}

export function useLeaveTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: async () => {
      const res = await apiRequest<LeaveTypeItem[]>("/leaves/types");
      return Array.isArray(res) ? res : [];
    },
    enabled,
    retry: 1,
    staleTime: 300000
  });
}

export function useLeaveRequests(enabled: boolean = true) {
  return useQuery({
    queryKey: leaveKeys.requests(),
    queryFn: async () => {
      const res = await apiRequest<{ requests: LeaveRequestData[] } | LeaveRequestData[]>("/leaves/requests/me");
      if (Array.isArray(res)) return res;
      if (res && "requests" in res && Array.isArray(res.requests)) return res.requests;
      return [];
    },
    enabled,
    retry: 1,
    staleTime: 30000
  });
}

export function useHolidays(year?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: leaveKeys.holidays(year),
    queryFn: () => apiRequest<HolidayData[]>(`/leaves/holidays${year ? `?year=${year}` : ""}`),
    enabled,
    retry: 1,
    staleTime: 300000
  });
}

export function useSubmitLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason: string;
      isHalfDay?: boolean | undefined;
      halfDaySession?: "FIRST_HALF" | "SECOND_HALF" | undefined;
    }) =>
      apiRequest("/leaves/requests", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    }
  });
}

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/leaves/requests/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Cancelled by employee" })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    }
  });
}

// ----------------- Service Requests Types & Hooks -----------------

export interface EmployeeServiceRequest {
  id: string;
  tenantId?: string;
  employeeId?: string;
  employeeName?: string;
  employeeCode?: string;
  requestType: string;
  status: string;
  title?: string;
  reason?: string;
  comments?: string;
  submittedAt?: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export const requestKeys = {
  all: ["ess-requests"] as const,
  list: () => [...requestKeys.all, "list"] as const
};

export function useEmployeeRequests(enabled: boolean = true) {
  return useQuery({
    queryKey: requestKeys.list(),
    queryFn: async () => {
      const res = await apiRequest<EmployeeServiceRequest[] | { requests: EmployeeServiceRequest[] }>(
        "/requests?limit=50"
      );
      if (Array.isArray(res)) return res;
      if (res && "requests" in res && Array.isArray(res.requests)) return res.requests;
      return [];
    },
    enabled,
    retry: 1,
    staleTime: 30000
  });
}

export function useSubmitEmployeeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      requestType: string;
      reason: string;
      comments?: string | undefined;
      payload?: Record<string, unknown> | undefined;
    }) =>
      apiRequest("/requests", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    }
  });
}

export function useCancelEmployeeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/requests/${id}/cancel`, {
        method: "POST"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    }
  });
}

// ----------------- Payslips Types & Hooks -----------------

export interface PayslipItem {
  id: string;
  month: number;
  year: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: string;
  generatedAt: string;
  payrollRunEmployee?: {
    breakdowns?: Array<{
      id: string;
      name: string;
      type: string;
      amount: number;
    }>;
  };
}

export const payslipKeys = {
  all: ["ess-payslips"] as const,
  mine: () => [...payslipKeys.all, "mine"] as const,
  detail: (id: string) => [...payslipKeys.all, "detail", id] as const
};

export function useMyPayslips(enabled: boolean = true) {
  return useQuery({
    queryKey: payslipKeys.mine(),
    queryFn: async () => {
      const res = await apiRequest<PayslipItem[]>("/payslips/me");
      return Array.isArray(res) ? res : [];
    },
    enabled,
    retry: 1,
    staleTime: 120000
  });
}

export function usePayslipDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: payslipKeys.detail(id),
    queryFn: () => apiRequest<PayslipItem>(`/payslips/${id}`),
    enabled: Boolean(id) && enabled,
    retry: 1,
    staleTime: 120000
  });
}

// ----------------- Documents Types & Hooks -----------------

export interface EmployeeDocumentItem {
  id: string;
  documentType: string;
  title: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  downloadUrl?: string;
  isVerified?: boolean;
  uploadedAt: string;
}

export const documentKeys = {
  all: ["ess-documents"] as const,
  list: () => [...documentKeys.all, "list"] as const
};

export function useEmployeeDocuments(enabled: boolean = true) {
  return useQuery({
    queryKey: documentKeys.list(),
    queryFn: async () => {
      const res = await apiRequest<EmployeeDocumentItem[] | { documents: EmployeeDocumentItem[] }>("/documents");
      if (Array.isArray(res)) return res;
      if (res && "documents" in res && Array.isArray(res.documents)) return res.documents;
      return [];
    },
    enabled,
    retry: 1,
    staleTime: 60000
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      documentType: string;
      title: string;
      fileName: string;
      fileBase64?: string | undefined;
      mimeType?: string | undefined;
    }) =>
      apiRequest("/documents", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    }
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/documents/${id}`, {
        method: "DELETE"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    }
  });
}

// ----------------- Announcements Types & Hooks -----------------

export interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  priority?: string;
  isPinned?: boolean;
  publishedAt?: string;
  isAcknowledged?: boolean;
  author?: {
    email?: string;
  };
}

export const announcementKeys = {
  all: ["ess-announcements"] as const,
  list: () => [...announcementKeys.all, "list"] as const
};

export function useAnnouncements(enabled: boolean = true) {
  return useQuery({
    queryKey: announcementKeys.list(),
    queryFn: async () => {
      const res = await apiRequest<AnnouncementData[]>("/announcements");
      return Array.isArray(res) ? res : [];
    },
    enabled,
    retry: 1,
    staleTime: 60000
  });
}

export function useAcknowledgeAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/announcements/${id}/acknowledge`, {
        method: "POST"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    }
  });
}

// ----------------- Digital ID Card Types & Hooks -----------------

export interface IdCardData {
  employeeId: string;
  employeeCode?: string;
  fullName: string;
  preferredName?: string;
  profilePhoto?: string | null;
  designation?: string;
  department?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  joiningDate?: string;
  bloodGroup?: string;
  emergencyContactPhone?: string | null;
  qrCodePayload?: string;
  primaryColor?: string;
}

export const idCardKeys = {
  all: ["ess-id-card"] as const,
  mine: () => [...idCardKeys.all, "mine"] as const
};

export function useIdCard(enabled: boolean = true) {
  return useQuery({
    queryKey: idCardKeys.mine(),
    queryFn: () => apiRequest<IdCardData>("/id-card"),
    enabled,
    retry: 1,
    staleTime: 300000
  });
}
