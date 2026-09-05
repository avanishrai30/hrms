"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { dashboardKeys } from "./use-dashboard-queries";

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

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fileBase64: string; mimeType: string }) =>
      apiRequest<{ avatarUrl: string; profilePhoto: string }>("/profile/avatar", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    }
  });
}

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<{ success: boolean }>("/profile/avatar", {
        method: "DELETE"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    }
  });
}

// ----------------- Attendance Types & Hooks -----------------

export interface AttendanceRecordItem {
  id: string;
  employee?: {
    id?: string;
    fullName?: string;
    employeeCode?: string;
    department?: { name?: string } | null;
    designation?: { name?: string } | null;
  } | null;
  shift?: {
    id?: string;
    name?: string;
    startsAtMinute?: number;
    endsAtMinute?: number;
    timezone?: string;
  } | null;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedMinutes?: number;
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
  overtimeMinutes?: number;
  notes?: string | null;
  date?: string;
  accuracyMeters?: number | null;
  locationVerificationStatus?: string | null;
}

export interface TodayAttendanceData {
  date: string;
  state?: "NOT_STARTED" | "CLOCKED_IN" | "COMPLETED";
  record: AttendanceRecordItem | null;
  shift?: {
    id?: string;
    name?: string;
    startTime?: string;
    endTime?: string;
    startsAtMinute?: number;
    endsAtMinute?: number;
    timezone?: string;
    workHours?: number | null;
  } | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  requiresLocation?: boolean;
  rules?: {
    allowSelfCheckIn?: boolean;
    requireGeofence?: boolean;
    requireFaceVerification?: boolean;
    allowMultipleSessionsPerDay?: boolean;
    gracePeriodMinutes?: number;
  };
}

export const attendanceKeys = {
  all: ["ess-attendance"] as const,
  today: () => [...attendanceKeys.all, "today"] as const,
  history: (startDate?: string, endDate?: string) =>
    [...attendanceKeys.all, "history", { startDate, endDate }] as const,
  team: (params?: Record<string, string | undefined>) => [...attendanceKeys.all, "team", params] as const
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
        `/attendance/me/history${queryString}`
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });
}

// ----------------- Attendance Corrections -----------------

export interface AttendanceCorrectionItem {
  id: string;
  attendanceId?: string | null;
  date: string;
  requestedCheckIn?: string | null;
  requestedCheckOut?: string | null;
  reason: string;
  requestedChange?: {
    date?: string;
    checkInAt?: string;
    checkOutAt?: string;
    status?: string;
    notes?: string;
  };
  employee?: { id?: string; fullName?: string; employeeCode?: string } | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNote?: string | null;
  createdAt: string;
}

export function useAttendanceCorrections(enabled: boolean = true) {
  return useQuery({
    queryKey: ["ess-attendance", "corrections"] as const,
    queryFn: async () => {
      const res = await apiRequest<AttendanceCorrectionItem[] | { corrections: AttendanceCorrectionItem[] }>("/attendance/corrections");
      const rows = Array.isArray(res) ? res : res && "corrections" in res && Array.isArray(res.corrections) ? res.corrections : [];
      return rows.map((row) => ({
        ...row,
        date: row.requestedChange?.date ?? row.date ?? row.createdAt,
        requestedCheckIn: row.requestedChange?.checkInAt ?? row.requestedCheckIn ?? null,
        requestedCheckOut: row.requestedChange?.checkOutAt ?? row.requestedCheckOut ?? null
      }));
    },
    enabled,
    staleTime: 30000
  });
}

export function useTeamAttendance(params: Record<string, string | undefined>, enabled: boolean = true) {
  return useQuery({
    queryKey: attendanceKeys.team(params),
    queryFn: async () => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) qs.set(key, value);
      });
      const queryString = qs.toString() ? `?${qs.toString()}` : "";
      const res = await apiRequest<AttendanceRecordItem[] | { records: AttendanceRecordItem[] }>(`/attendance${queryString}`);
      if (Array.isArray(res)) return res;
      if (res && "records" in res && Array.isArray(res.records)) return res.records;
      return [];
    },
    enabled,
    staleTime: 30000
  });
}

export function useSubmitAttendanceCorrection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; requestedCheckIn?: string; requestedCheckOut?: string; reason: string; attendanceId?: string }) => {
      return apiRequest("/attendance/corrections", {
        method: "POST",
        body: JSON.stringify({
          attendanceId: data.attendanceId,
          reason: data.reason,
          requestedChange: {
            date: data.date,
            checkInAt: data.requestedCheckIn,
            checkOutAt: data.requestedCheckOut,
            notes: data.reason
          }
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-attendance", "corrections"] });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    }
  });
}

export function useReviewAttendanceCorrection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reviewNote }: { id: string; status: "APPROVED" | "REJECTED"; reviewNote: string }) => {
      return apiRequest(`/attendance/corrections/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, reviewNote })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-attendance", "corrections"] });
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
  daysCount?: number;
  reason?: string;
  employee?: {
    id?: string;
    fullName?: string;
    employeeCode?: string;
  } | null;
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

export function useLeaveCalendar(startDate?: string, endDate?: string, enabled: boolean = true) {
  const qs = new URLSearchParams();
  if (startDate) qs.set("startDate", startDate);
  if (endDate) qs.set("endDate", endDate);
  const qStr = qs.toString();
  return useQuery({
    queryKey: ["ess-leaves", "calendar", { startDate, endDate }] as const,
    queryFn: async () => {
      const res = await apiRequest<Array<{ id: string; employeeId: string; employeeName?: string; startDate: string; endDate: string; status: string; leaveType?: { name: string } }>>(`/leaves/calendar${qStr ? `?${qStr}` : ""}`);
      return Array.isArray(res) ? res : [];
    },
    enabled,
    staleTime: 60000
  });
}

export function useAllLeaveRequests(enabled: boolean = true) {
  return useQuery({
    queryKey: ["ess-leaves", "all-requests"] as const,
    queryFn: async () => {
      const res = await apiRequest<LeaveRequestData[] | { requests: LeaveRequestData[] }>("/leaves/requests");
      if (Array.isArray(res)) return res;
      if (res && "requests" in res && Array.isArray(res.requests)) return res.requests;
      return [];
    },
    enabled,
    staleTime: 30000
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      apiRequest(`/leaves/requests/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ comments })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({ queryKey: ["ess-leaves", "all-requests"] });
    }
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest(`/leaves/requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({ queryKey: ["ess-leaves", "all-requests"] });
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
  payrollRun?: {
    id: string;
    month: number;
    year: number;
    status: string;
    currency: string;
  };
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
