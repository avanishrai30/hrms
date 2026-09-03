"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { normalizeDirectoryPageResponse, type DirectoryPageResponse } from "../workforce-table-data";
import type {
  DirectoryEmployeeView,
  BusinessUnitView,
  TeamView,
  LocationView,
  LeaveRequestView,
  EmployeeDocumentView
} from "@vc-wms/shared-types";

// ==================== DEBOUNCE HOOK ====================

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ==================== QUERY PARAMETER & FORMATTING HELPERS ====================

export interface DirectoryFilterParams {
  search?: string | undefined;
  departmentId?: string | undefined;
  designationId?: string | undefined;
  businessUnitId?: string | undefined;
  teamId?: string | undefined;
  status?: string | undefined;
  locationId?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export function buildDirectoryQueryParams(filter?: DirectoryFilterParams | undefined): string {
  const queryParams = new URLSearchParams();
  if (filter?.search) queryParams.set("search", filter.search);
  if (filter?.departmentId && filter.departmentId !== "ALL") queryParams.set("departmentId", filter.departmentId);
  if (filter?.designationId && filter.designationId !== "ALL") queryParams.set("designationId", filter.designationId);
  if (filter?.businessUnitId && filter.businessUnitId !== "ALL") queryParams.set("businessUnitId", filter.businessUnitId);
  if (filter?.teamId && filter.teamId !== "ALL") queryParams.set("teamId", filter.teamId);
  if (filter?.status && filter.status !== "all" && filter.status !== "ALL") queryParams.set("status", filter.status);
  if (filter?.locationId) queryParams.set("locationId", filter.locationId);
  if (filter?.limit !== undefined && filter?.limit !== null) queryParams.set("limit", String(filter.limit));
  if (filter?.offset !== undefined && filter?.offset !== null) queryParams.set("offset", String(filter.offset));
  return queryParams.toString();
}

export function buildEmployeesQueryParams(filter?: Record<string, unknown> | undefined): string {
  const queryParams = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "ALL") {
        queryParams.set(k, String(v));
      }
    });
  }
  return queryParams.toString();
}

export function formatEmploymentStatus(status?: string | null | undefined): string {
  if (!status || !status.trim()) return "—";
  return status.replace(/_/g, " ");
}

export function formatEmploymentType(type?: string | null | undefined): string {
  if (!type || !type.trim()) return "—";
  return type.replace(/_/g, " ");
}

// ==================== DOMAIN INTERFACES ====================

export interface EmployeeRecordView {
  id: string;
  tenantId?: string | undefined;
  employeeCode?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | null | undefined;
  fullName: string;
  email?: string | undefined;
  phone?: string | null | undefined;
  status?: string | undefined;
  employmentType?: string | undefined;
  joiningDate?: string | undefined;
  avatarUrl?: string | null | undefined;
  profilePhoto?: string | null | undefined;
  departmentId?: string | undefined;
  department?: { id: string; name: string; code?: string | undefined } | string | null | undefined;
  designationId?: string | undefined;
  designation?: { id: string; name: string; code?: string | undefined } | string | null | undefined;
  managerId?: string | null | undefined;
  managerName?: string | null | undefined;
  profileCompletionScore?: number | undefined;
}

export interface DepartmentRecordView {
  id: string;
  tenantId?: string | undefined;
  name: string;
  code: string;
  description?: string | null | undefined;
}

export interface DesignationRecordView {
  id: string;
  tenantId?: string | undefined;
  name: string;
  code: string;
  departmentId?: string | undefined;
  department?: { id: string; name: string } | null | undefined;
}

export interface OrgNodeView {
  id: string;
  name: string;
  title?: string | undefined;
  designation?: string | undefined;
  department?: string | undefined;
  children?: OrgNodeView[] | undefined;
}

export interface EmployeeTimelineView {
  id: string;
  date?: string | undefined;
  title: string;
  description: string;
  eventType?: string | undefined;
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
    department?: { name: string } | string | null | undefined;
  } | undefined;
}

// ==================== TYPED CREATION PAYLOADS ====================

export interface CreateEmployeeInput {
  employeeCode: string;
  fullName: string;
  email: string;
  departmentId: string;
  designationId: string;
  joiningDate: string; // ISO date string required by backend
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY";
  phone?: string | undefined;
  preferredName?: string | undefined;
  managerEmployeeId?: string | undefined;
  salaryType?: ("MONTHLY" | "DAILY" | "HOURLY") | undefined;
  status?: ("DRAFT" | "INVITED" | "ACTIVE" | "PROBATION") | undefined;
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string | undefined;
  status?: string | undefined;
}

export interface CreateDesignationInput {
  departmentId: string;
  name: string;
  code: string;
  description?: string | undefined;
  status?: string | undefined;
}

export interface CreateBusinessUnitInput {
  name: string;
  code: string;
  description?: string | undefined;
}

export interface CreateTeamInput {
  name: string;
  code: string;
  departmentId?: string | undefined;
  description?: string | undefined;
}

export interface CreateLocationInput {
  name: string;
  code: string;
  type: "FACTORY" | "OFFICE" | "WAREHOUSE" | "RETAIL_OUTLET" | "DISTRIBUTION_CENTER" | "CUSTOM";
  description?: string | undefined;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxAccuracyMeters: number;
  isActive?: boolean | undefined;
}

interface LocationListResponse {
  locations: LocationView[];
  total: number;
  page: number;
  limit: number;
}

// ==================== QUERY KEYS ====================

export const peopleKeys = {
  all: ["people"] as const,
  directory: (filters?: DirectoryFilterParams | Record<string, unknown> | undefined) => ["people", "directory", filters] as const,
  employees: (filters?: Record<string, unknown> | undefined) => ["people", "employees", filters] as const,

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
  locations: (filters?: Record<string, unknown> | undefined) => ["organization", "locations", filters] as const,
  managerDashboard: () => ["manager", "dashboard"] as const,
  managerTeam: () => ["manager", "team"] as const,
  managerApprovals: () => ["manager", "approvals"] as const
};

// ==================== DIRECTORY QUERIES ====================

export function useDirectory(
  filter?: DirectoryFilterParams | undefined,
  enabled: boolean = true
) {
  const qs = buildDirectoryQueryParams(filter);
  const path = `/directory${qs ? `?${qs}` : ""}`;
  return useQuery({
    queryKey: peopleKeys.directory(filter),
    queryFn: async () => normalizeDirectoryPageResponse(await apiRequest<DirectoryEmployeeView[] | DirectoryPageResponse>(path)).items,
    enabled,
    staleTime: 60 * 1000
  });
}

export function useDirectoryPage(
  filter?: DirectoryFilterParams | undefined,
  enabled: boolean = true
) {
  const qs = buildDirectoryQueryParams(filter);
  const path = `/directory${qs ? `?${qs}` : ""}`;
  return useQuery({
    queryKey: [...peopleKeys.directory(filter), "page"] as const,
    queryFn: async () => normalizeDirectoryPageResponse(await apiRequest<DirectoryEmployeeView[] | DirectoryPageResponse>(path)),
    enabled,
    staleTime: 60 * 1000
  });
}

// ==================== EMPLOYEES QUERIES ====================

export function useEmployees(filter?: Record<string, unknown> | undefined, enabled: boolean = true) {
  const qs = buildEmployeesQueryParams(filter);
  const path = `/employees${qs ? `?${qs}` : ""}`;
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
    queryFn: async () => {
      const response = await apiRequest<LocationListResponse>(path);
      return response.locations;
    },
    enabled,
    staleTime: 5 * 60 * 1000
  });
}

// ==================== MANAGER (MSS) QUERIES ====================

export interface MssDashboardData {
  teamSize?: number | undefined;
  directReportsCount?: number | undefined;
  onLeaveTodayCount?: number | undefined;
  pendingApprovalsCount?: number | undefined;
  teamMembers?: Array<{
    id: string;
    fullName: string;
    employeeCode: string;
    designation?: { name: string } | undefined;
    department?: { name: string } | undefined;
  }> | undefined;
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

// ==================== MUTATIONS WITH PRECISE INVALIDATION ====================

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) =>
      apiRequest<EmployeeRecordView>("/employees", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people", "employees"] });
      queryClient.invalidateQueries({ queryKey: ["people", "directory"] });
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    }
  });
}

export function useUpdateEmployeeMutation(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateEmployeeInput>) =>
      apiRequest<EmployeeRecordView>(`/employees/${employeeId}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.employeeDetail(employeeId) });
      queryClient.invalidateQueries({ queryKey: ["people", "employees"] });
      queryClient.invalidateQueries({ queryKey: ["people", "directory"] });
    }
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentInput) =>
      apiRequest<DepartmentRecordView>("/departments", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "departments"] });
      queryClient.invalidateQueries({ queryKey: ["organization", "tree"] });
      queryClient.invalidateQueries({ queryKey: ["organization", "chart"] });
    }
  });
}

export function useCreateDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDesignationInput) =>
      apiRequest<DesignationRecordView>("/designations", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "designations"] });
    }
  });
}

export function useCreateBusinessUnitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBusinessUnitInput) =>
      apiRequest<BusinessUnitView>("/organization/business-units", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "business-units"] });
    }
  });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamInput) =>
      apiRequest<TeamView>("/organization/teams", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "teams"] });
    }
  });
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocationInput) =>
      apiRequest<LocationView>("/locations", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "locations"] });
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
      queryClient.invalidateQueries({ queryKey: ["manager", "approvals"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "dashboard"] });
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
      queryClient.invalidateQueries({ queryKey: ["manager", "approvals"] });
      queryClient.invalidateQueries({ queryKey: ["manager", "dashboard"] });
    }
  });
}
