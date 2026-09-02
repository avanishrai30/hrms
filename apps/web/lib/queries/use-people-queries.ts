"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type {
  DirectoryEmployeeView,
  BusinessUnitView,
  TeamView,
  LocationView,
  LeaveRequestView,
  EmployeeDocumentView
} from "@vc-wms/shared-types";

export interface EmployeeRecordView {
  id: string;
  tenantId?: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string | null;
  fullName: string;
  email?: string;
  phone?: string | null;
  status?: string;
  employmentType?: string;
  joiningDate?: string;
  avatarUrl?: string | null;
  profilePhoto?: string | null;
  departmentId?: string;
  department?: { id: string; name: string; code?: string } | string | null;
  designationId?: string;
  designation?: { id: string; name: string; code?: string } | string | null;
  managerId?: string | null;
  managerName?: string | null;
  profileCompletionScore?: number;
}

export interface DepartmentRecordView {
  id: string;
  tenantId?: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface DesignationRecordView {
  id: string;
  tenantId?: string;
  name: string;
  code: string;
  departmentId?: string;
  department?: { id: string; name: string } | null;
}

export interface OrgNodeView {
  id: string;
  name: string;
  title?: string;
  designation?: string;
  department?: string;
  children?: OrgNodeView[];
}

export interface EmployeeTimelineView {
  id: string;
  date?: string;
  title: string;
  description: string;
  eventType?: string;
}

export interface MssEmployeeRequestItem {
  id: string;
  employeeId: string;
  requestType: string;
  reason: string;
  status: string;
  createdAt: string;
  employee?: {
    id: string;
    fullName: string;
    department?: { name: string } | string | null;
  };
}

export const peopleKeys = {
  all: ["people"] as const,
  directory: (filters?: Record<string, unknown>) => ["people", "directory", filters] as const,
  employees: (filters?: Record<string, unknown>) => ["people", "employees", filters] as const,
  employeeDetail: (id: string) => ["people", "employee", id] as const,
  employeeDocuments: (id: string) => ["people", "employee", id, "documents"] as const,
  employeeTimeline: (id: string) => ["people", "employee", id, "timeline"] as const,
  departments: () => ["organization", "departments"] as const,
  designations: () => ["organization", "designations"] as const,
  businessUnits: () => ["organization", "business-units"] as const,
  regions: () => ["organization", "regions"] as const,
  teams: () => ["organization", "teams"] as const,
  orgTree: () => ["organization", "tree"] as const,
  orgChart: () => ["organization", "chart"] as const,
  reportingChain: (id: string) => ["organization", "reporting-chain", id] as const,
  locations: (filters?: Record<string, unknown>) => ["organization", "locations", filters] as const,
  managerDashboard: () => ["manager", "dashboard"] as const,
  managerTeam: () => ["manager", "team"] as const,
  managerApprovals: () => ["manager", "approvals"] as const
};

// ==================== DIRECTORY QUERIES ====================

export function useDirectory(
  filter?: { search?: string | undefined; departmentId?: string | undefined; locationId?: string | undefined; limit?: number | undefined; offset?: number | undefined } | undefined,
  enabled: boolean = true
) {
  const queryParams = new URLSearchParams();
  if (filter?.search) queryParams.set("search", filter.search);
  if (filter?.departmentId && filter.departmentId !== "ALL") queryParams.set("departmentId", filter.departmentId);
  if (filter?.locationId) queryParams.set("locationId", filter.locationId);
  if (filter?.limit) queryParams.set("limit", String(filter.limit));
  if (filter?.offset) queryParams.set("offset", String(filter.offset));

  const path = `/directory${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useQuery({
    queryKey: peopleKeys.directory(filter),
    queryFn: () => apiRequest<DirectoryEmployeeView[]>(path),
    enabled,
    staleTime: 60 * 1000
  });
}

// ==================== EMPLOYEES QUERIES ====================

export function useEmployees(filter?: Record<string, unknown> | undefined, enabled: boolean = true) {
  const queryParams = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "ALL") {
        queryParams.set(k, String(v));
      }
    });
  }

  const path = `/employees${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useQuery({
    queryKey: peopleKeys.employees(filter),
    queryFn: () => apiRequest<EmployeeRecordView[]>(path),
    enabled,
    staleTime: 30 * 1000
  });
}

export function useEmployee(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.employeeDetail(id),
    queryFn: () => apiRequest<EmployeeRecordView>(`/employees/${id}`),
    enabled: enabled && Boolean(id),
    staleTime: 60 * 1000
  });
}

export function useEmployeeDocuments(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.employeeDocuments(id),
    queryFn: () => apiRequest<EmployeeDocumentView[]>(`/employees/${id}/documents`),
    enabled: enabled && Boolean(id),
    staleTime: 60 * 1000
  });
}

export function useEmployeeTimeline(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.employeeTimeline(id),
    queryFn: () => apiRequest<EmployeeTimelineView[]>(`/employees/${id}/timeline`),
    enabled: enabled && Boolean(id),
    staleTime: 60 * 1000
  });
}

// ==================== ORGANIZATION QUERIES ====================

export function useDepartments(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.departments(),
    queryFn: () => apiRequest<DepartmentRecordView[]>("/departments"),
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

export function useDesignations(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.designations(),
    queryFn: () => apiRequest<DesignationRecordView[]>("/designations"),
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

export function useBusinessUnits(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.businessUnits(),
    queryFn: () => apiRequest<BusinessUnitView[]>("/organization/business-units"),
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

export function useTeams(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.teams(),
    queryFn: () => apiRequest<TeamView[]>("/organization/teams"),
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

export function useOrgChart(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.orgChart(),
    queryFn: () => apiRequest<OrgNodeView>("/directory/org-chart"),
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

export function useOrgTree(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.orgTree(),
    queryFn: () => apiRequest<OrgNodeView>("/organization/tree"),
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

export function useLocations(filter?: Record<string, unknown> | undefined, enabled: boolean = true) {
  const queryParams = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        queryParams.set(k, String(v));
      }
    });
  }
  const path = `/locations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return useQuery({
    queryKey: peopleKeys.locations(filter),
    queryFn: () => apiRequest<LocationView[]>(path),
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

// ==================== MANAGER (MSS) QUERIES ====================

export interface MssDashboardData {
  teamSize?: number;
  directReportsCount?: number;
  onLeaveTodayCount?: number;
  pendingApprovalsCount?: number;
  teamMembers?: Array<{
    id: string;
    fullName: string;
    employeeCode: string;
    designation?: { name: string };
    department?: { name: string };
  }>;
}

export function useManagerDashboard(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.managerDashboard(),
    queryFn: () => apiRequest<MssDashboardData>("/mss/dashboard"),
    enabled,
    staleTime: 30 * 1000
  });
}

export function useManagerTeam(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.managerTeam(),
    queryFn: () => apiRequest<EmployeeRecordView[]>("/mss/team"),
    enabled,
    staleTime: 30 * 1000
  });
}

export interface MssApprovalsData {
  requests: MssEmployeeRequestItem[];
  leaves: LeaveRequestView[];
}

export function useManagerApprovals(enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.managerApprovals(),
    queryFn: () => apiRequest<MssApprovalsData>("/mss/approvals"),
    enabled,
    staleTime: 15 * 1000
  });
}

// ==================== MUTATIONS ====================

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<EmployeeRecordView>("/employees", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
    }
  });
}

export function useUpdateEmployeeMutation(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<EmployeeRecordView>(`/employees/${employeeId}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.employeeDetail(employeeId) });
      queryClient.invalidateQueries({ queryKey: peopleKeys.employees() });
    }
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; description?: string | undefined }) =>
      apiRequest<DepartmentRecordView>("/departments", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.departments() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.orgTree() });
    }
  });
}

export function useCreateDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; departmentId: string; description?: string | undefined }) =>
      apiRequest<DesignationRecordView>("/designations", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.designations() });
    }
  });
}

export function useCreateBusinessUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; description?: string | undefined }) =>
      apiRequest<BusinessUnitView>("/organization/business-units", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.businessUnits() });
    }
  });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string; departmentId?: string | undefined; description?: string | undefined }) =>
      apiRequest<TeamView>("/organization/teams", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.teams() });
    }
  });
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<LocationView>("/locations", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.locations() });
    }
  });
}

export function useApproveLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string | undefined }) =>
      apiRequest<LeaveRequestView>(`/leaves/requests/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ comments })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.managerApprovals() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.managerDashboard() });
    }
  });
}

export function useRejectLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest<LeaveRequestView>(`/leaves/requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.managerApprovals() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.managerDashboard() });
    }
  });
}
