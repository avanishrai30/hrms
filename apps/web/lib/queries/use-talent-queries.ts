"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type {
  ApplicationStage,
  CandidateStatus,
  HiringRequestStatus,
  InterviewStatus,
  JobRequisitionStatus,
  OfferApproverRole,
  OfferStatus,
  PreboardingTaskStatus
} from "@vc-wms/shared-types";

export type TalentStatus =
  | HiringRequestStatus
  | JobRequisitionStatus
  | CandidateStatus
  | ApplicationStage
  | InterviewStatus
  | OfferStatus
  | PreboardingTaskStatus
  | string;

export interface TalentDepartmentRef {
  id?: string;
  name?: string;
  code?: string;
}

export interface TalentDesignationRef {
  id?: string;
  name?: string;
  code?: string;
}

export interface TalentEmployeeRef {
  id?: string;
  fullName?: string;
  employeeCode?: string;
}

export interface HiringRequestRecord {
  id: string;
  tenantId: string;
  requestCode: string;
  department?: TalentDepartmentRef | null;
  designation?: TalentDesignationRef | null;
  hiringManager?: TalentEmployeeRef | null;
  employmentType?: string;
  vacancies?: number;
  budgetedCtc?: number | string | null;
  priority?: string;
  status: HiringRequestStatus;
  currentApprovalStage?: string | null;
  requiredByDate?: string;
  createdAt?: string;
}

export interface JobRequisitionRecord {
  id: string;
  tenantId: string;
  requisitionCode: string;
  jobTitle: string;
  department?: TalentDepartmentRef | null;
  designation?: TalentDesignationRef | null;
  location?: string | null;
  employmentType?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  skillsRequired?: string[];
  openings?: number;
  status: JobRequisitionStatus;
  postings?: Array<{ slug: string; status: string; channel: string }>;
  _count?: { applications?: number; offers?: number };
  createdAt?: string;
}

export interface CandidateRecord {
  id: string;
  tenantId: string;
  candidateCode: string;
  fullName: string;
  email?: string;
  mobile?: string;
  currentLocation?: string | null;
  experienceYears?: number;
  currentCtc?: number | string | null;
  expectedCtc?: number | string | null;
  noticePeriodDays?: number;
  skills?: string[];
  status: CandidateStatus;
  source?: string;
  hiredEmployeeId?: string | null;
  applications?: ApplicationRecord[];
  activities?: CandidateActivityRecord[];
  preboardingTasks?: PreboardingTaskRecord[];
  offers?: OfferRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationRecord {
  id: string;
  tenantId: string;
  applicationCode: string;
  requisitionId: string;
  candidateId: string;
  candidate?: CandidateRecord | null;
  requisition?: JobRequisitionRecord | null;
  stage: ApplicationStage;
  source?: string;
  aiMatchScore?: number | null;
  aiSkillsMatch?: number | null;
  aiExpMatch?: number | null;
  stageHistoryJson?: Array<{ stage: string; timestamp: string; note?: string }> | null;
  appliedAt?: string;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  interviews?: InterviewRecord[];
  offers?: OfferRecord[];
  createdAt?: string;
}

export interface InterviewRecord {
  id: string;
  tenantId: string;
  applicationId: string;
  application?: ApplicationRecord | null;
  roundName: string;
  roundNumber?: number;
  interviewType?: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  meetingLink?: string | null;
  locationDetails?: string | null;
  status: InterviewStatus;
  interviewerNotes?: string | null;
  panels?: Array<{ employee?: TalentEmployeeRef | null; role?: string }>;
  feedbacks?: Array<{
    id: string;
    interviewer?: { fullName?: string } | null;
    overallScore?: number;
    recommendation?: string;
    notes?: string | null;
    createdAt?: string;
  }>;
  completedAt?: string | null;
  createdAt?: string;
}

export interface OfferRecord {
  id: string;
  tenantId: string;
  offerCode: string;
  applicationId: string;
  candidateId: string;
  candidate?: CandidateRecord | null;
  requisition?: JobRequisitionRecord | null;
  baseSalary?: number | string;
  joiningBonus?: number | string;
  variablePay?: number | string;
  totalCtc?: number | string;
  joiningDate?: string;
  expiryDate?: string;
  status: OfferStatus;
  currentApprovalStage?: string | null;
  letterObjectKey?: string | null;
  releasedAt?: string | null;
  respondedAt?: string | null;
  responseComments?: string | null;
  approvals?: Array<{
    approverRole?: OfferApproverRole;
    role?: OfferApproverRole;
    approverUser?: { fullName?: string } | null;
    status?: string;
    comments?: string | null;
    approvedAt?: string | null;
  }>;
  createdAt?: string;
}

export interface PreboardingTaskRecord {
  id: string;
  tenantId: string;
  candidateId: string;
  candidate?: CandidateRecord | null;
  offer?: OfferRecord | null;
  taskTitle: string;
  taskType: string;
  description?: string | null;
  status: PreboardingTaskStatus;
  payloadJson?: Record<string, unknown> | null;
  verifiedBy?: { fullName?: string } | null;
  verifiedAt?: string | null;
  createdAt?: string;
}

export interface CandidateActivityRecord {
  id: string;
  tenantId: string;
  candidateId: string;
  actorName?: string;
  activityType?: string;
  title: string;
  description?: string | null;
  createdAt?: string;
}

export interface RecruitmentAnalyticsRecord {
  kpis?: {
    openPositions?: number;
    totalApplicants?: number;
    offersReleased?: number;
    offerAcceptanceRate?: number;
    averageTimeToHireDays?: number;
    averageTimeToFillDays?: number;
    costPerHire?: number;
  };
  pipelineFunnel?: Array<{ stage: string; count: number; conversionRate?: number }>;
  sourcePerformance?: Array<{ source: string; candidates: number; hires: number; cost: number }>;
  recruiterProductivity?: Array<{ recruiterName: string; openReqs: number; interviewsConducted: number; hires: number }>;
}

export interface PublicJobRecord {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  tenantSlug?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experienceRange?: string;
  skills?: string[];
  jobDescription?: string;
  publishedAt?: string;
}

export interface PublicApplicationStatusRecord {
  applicationCode: string;
  candidateName: string;
  email?: string;
  jobTitle: string;
  department?: string;
  stage: ApplicationStage;
  appliedAt: string;
  interviews: Array<{ roundName: string; scheduledStartTime: string; meetingLink?: string | null; status: string }>;
  offer: { offerCode: string; totalCtc: number; joiningDate: string; status: OfferStatus } | null;
  preboardingTasks: Array<{ id: string; title: string; type: string; status: PreboardingTaskStatus }>;
}

export interface TalentListFilters {
  status?: string;
  query?: string;
  requisitionId?: string;
  applicationId?: string;
  candidateId?: string;
  stage?: string;
  limit?: number;
  offset?: number;
}

export const APPLICATION_STAGES: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "TECHNICAL_ROUND",
  "MANAGER_ROUND",
  "HR_ROUND",
  "OFFER",
  "JOINED",
  "REJECTED"
];

export const talentKeys = {
  all: ["talent"] as const,
  hiringRequests: (filters?: TalentListFilters) => ["talent", "hiring-requests", filters] as const,
  requisitions: (filters?: TalentListFilters) => ["talent", "requisitions", filters] as const,
  candidates: (filters?: TalentListFilters) => ["talent", "candidates", filters] as const,
  candidate: (id: string) => ["talent", "candidate", id] as const,
  applications: (filters?: TalentListFilters) => ["talent", "applications", filters] as const,
  interviews: (filters?: TalentListFilters) => ["talent", "interviews", filters] as const,
  offers: (filters?: TalentListFilters) => ["talent", "offers", filters] as const,
  preboarding: (filters?: TalentListFilters) => ["talent", "preboarding", filters] as const,
  analytics: () => ["talent", "analytics"] as const,
  publicJobs: (tenantSlug?: string) => ["talent", "public-jobs", tenantSlug] as const,
  publicJob: (slug: string) => ["talent", "public-job", slug] as const,
  publicStatus: (code: string) => ["talent", "public-status", code] as const
};

export function buildTalentQueryParams(filters?: TalentListFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "ALL") params.set(key, String(value));
  });
  return params.toString();
}

function talentPath(path: string, filters?: TalentListFilters) {
  const qs = buildTalentQueryParams(filters);
  return `/recruitment/${path}${qs ? `?${qs}` : ""}`;
}

export function formatTalentLabel(value?: string | null) {
  if (!value || !value.trim()) return "-";
  return value.replace(/_/g, " ");
}

export function formatNullableNumber(value?: number | null, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${value}${suffix}`;
}

/**
 * Format currency with explicit currency code support (defaults to INR based on tenant settings).
 * Talent offer currency is currently backend-fixed to INR for this tenant.
 */
export function formatCurrency(value?: number | string | null, currencyCode = "INR") {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  const locale = currencyCode === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(numeric);
}

export function formatDateTime(value?: string | null, timeZone?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone
  }).format(date);
}

export function statusTone(status?: TalentStatus): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "outline";
  if (["APPROVED", "ACTIVE", "ACCEPTED", "HIRED", "JOINED", "VERIFIED", "COMPLETED"].includes(status)) return "default";
  if (["REJECTED", "CANCELLED", "EXPIRED", "NO_SHOW"].includes(status)) return "destructive";
  if (["PENDING_APPROVAL", "PENDING", "SUBMITTED", "SCHEDULED", "ON_HOLD"].includes(status)) return "secondary";
  return "outline";
}

/**
 * Check if the user has permission to view candidate personal PII (email, mobile, address, salary expectation).
 * In backend, candidates.read grants read access to candidate records.
 */
export function canAccessCandidatePii(permissions: string[]): boolean {
  return permissions.includes("candidates.read");
}

/**
 * Check if the user has permission to view offer compensation details (base salary, bonus, variable pay, total CTC).
 * In backend, offers.read grants read access to compensation-sensitive offer records.
 */
export function canAccessCompensation(permissions: string[]): boolean {
  return permissions.includes("offers.read");
}

/**
 * Check if the user has permission to view interview feedback and evaluation scorecards.
 * In backend, interviews.feedback grants access to detailed candidate feedback scores.
 */
export function canAccessInterviewFeedback(permissions: string[]): boolean {
  return permissions.includes("interviews.feedback");
}

/**
 * Check if the user has permission to manage recruitment operations (approve requisitions, onboard candidates).
 */
export function canManageRecruitment(permissions: string[]): boolean {
  return permissions.includes("recruitment.manage");
}

/**
 * Check if the user has permission to manage application stage movements.
 */
export function canManageApplications(permissions: string[]): boolean {
  return permissions.includes("applications.manage");
}

/**
 * Check if the user has permission to approve or release offers.
 */
export function canManageOffers(permissions: string[]): boolean {
  return permissions.includes("offers.manage");
}

/**
 * Check if the user has permission to verify or reject preboarding tasks.
 */
export function canManagePreboarding(permissions: string[]): boolean {
  return permissions.includes("preboarding.manage");
}

/**
 * Computes the sequential next stage in the standard 8-stage ATS workflow.
 * Note: JOINED and REJECTED are terminal stages and return null.
 * Backend also allows direct stage transitions, overrides, and rejection from any stage.
 */
export function getNextApplicationStage(currentStage: ApplicationStage): ApplicationStage | null {
  if (currentStage === "JOINED" || currentStage === "REJECTED") {
    return null;
  }
  const index = APPLICATION_STAGES.indexOf(currentStage);
  if (index === -1) return null;
  if (currentStage === "OFFER") return "JOINED";
  if (index >= APPLICATION_STAGES.indexOf("OFFER")) return null;
  return APPLICATION_STAGES[index + 1] ?? null;
}

export function visibleMetric(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-IN").format(value);
}

export function hasSyntheticTalentDefault(source: string) {
  const syntheticPatterns = [
    /Aakash Sharma|Priya Patel|Sneha Mukherjee|Rohan Verma|Vikram Malhotra/,
    /Bengaluru \/ Hybrid|Delhi NCR|Mumbai|Pune|Gurugram/,
    /Industry leading|High Potential|Top Candidate|Active Candidate/,
    /APP-2026-0001|REQ-2026-001|OFF-2026-001/,
    /Math\.random\(\)/
  ];
  return syntheticPatterns.some((pattern) => pattern.test(source));
}

export function useHiringRequests(filters?: TalentListFilters, enabled = true) {
  return useQuery({
    queryKey: talentKeys.hiringRequests(filters),
    queryFn: () => apiRequest<HiringRequestRecord[]>(talentPath("hiring-requests", filters)),
    enabled,
    staleTime: 30_000
  });
}

export function useJobRequisitions(filters?: TalentListFilters, enabled = true) {
  return useQuery({
    queryKey: talentKeys.requisitions(filters),
    queryFn: () => apiRequest<JobRequisitionRecord[]>(talentPath("requisitions", filters)),
    enabled,
    staleTime: 30_000
  });
}

export function useCandidates(filters?: TalentListFilters, enabled = true) {
  return useQuery({
    queryKey: talentKeys.candidates(filters),
    queryFn: () => apiRequest<CandidateRecord[]>(talentPath("candidates", filters)),
    enabled,
    staleTime: 20_000
  });
}

export function useCandidate(id: string, enabled = true) {
  return useQuery({
    queryKey: talentKeys.candidate(id),
    queryFn: () => apiRequest<CandidateRecord>(`/recruitment/candidates/${id}`),
    enabled: enabled && Boolean(id),
    staleTime: 20_000
  });
}

export function useApplications(filters?: TalentListFilters, enabled = true) {
  return useQuery({
    queryKey: talentKeys.applications(filters),
    queryFn: () => apiRequest<ApplicationRecord[]>(talentPath("applications", filters)),
    enabled,
    staleTime: 20_000
  });
}

export function useInterviews(filters?: TalentListFilters, enabled = true) {
  return useQuery({
    queryKey: talentKeys.interviews(filters),
    queryFn: () => apiRequest<InterviewRecord[]>(talentPath("interviews", filters)),
    enabled,
    staleTime: 20_000
  });
}

export function useOffers(filters?: TalentListFilters, enabled = true) {
  return useQuery({
    queryKey: talentKeys.offers(filters),
    queryFn: () => apiRequest<OfferRecord[]>(talentPath("offers", filters)),
    enabled,
    staleTime: 20_000
  });
}

export function usePreboardingTasks(filters?: TalentListFilters, enabled = true) {
  return useQuery({
    queryKey: talentKeys.preboarding(filters),
    queryFn: () => apiRequest<PreboardingTaskRecord[]>(talentPath("preboarding", filters)),
    enabled,
    staleTime: 20_000
  });
}

export function useRecruitmentAnalytics(enabled = true) {
  return useQuery({
    queryKey: talentKeys.analytics(),
    queryFn: () => apiRequest<RecruitmentAnalyticsRecord>("/recruitment/analytics"),
    enabled,
    staleTime: 60_000
  });
}

export function useUpdateApplicationStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage, notes }: { id: string; stage: ApplicationStage; notes?: string }) =>
      apiRequest<ApplicationRecord>(`/recruitment/applications/${id}/stage`, {
        method: "PUT",
        body: JSON.stringify({ stage, notes })
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: talentKeys.all });
    }
  });
}

export function useApproveHiringRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<HiringRequestRecord>(`/recruitment/hiring-requests/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ decision: "APPROVE" })
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: talentKeys.hiringRequests() });
    }
  });
}

export function usePublishRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ id: string; slug: string; status: string }>(`/recruitment/requisitions/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({})
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: talentKeys.requisitions() });
    }
  });
}

export function useApproveOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: OfferApproverRole }) =>
      apiRequest<OfferRecord>(`/recruitment/offers/${id}/approve?role=${role}`, {
        method: "POST",
        body: JSON.stringify({ decision: "APPROVE" })
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: talentKeys.offers() });
    }
  });
}

export function useReleaseOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<OfferRecord>(`/recruitment/offers/${id}/release`, {
        method: "POST"
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: talentKeys.offers() });
      void queryClient.invalidateQueries({ queryKey: talentKeys.preboarding() });
    }
  });
}

export function useVerifyPreboardingTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "VERIFIED" | "REJECTED" }) =>
      apiRequest<PreboardingTaskRecord>(`/recruitment/preboarding/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: talentKeys.preboarding() });
    }
  });
}

export function useOnboardCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      options
    }: {
      id: string;
      options?: { employeeCode?: string; joiningDate?: string; salaryTemplateId?: string };
    }) =>
      apiRequest<{ success: boolean; employeeId: string; employeeCode: string; message: string }>(
        `/recruitment/candidates/${id}/onboard`,
        {
          method: "POST",
          body: JSON.stringify(options || {})
        }
      ),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: talentKeys.candidate(variables.id) });
      void queryClient.invalidateQueries({ queryKey: talentKeys.candidates() });
      void queryClient.invalidateQueries({ queryKey: talentKeys.applications() });
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    }
  });
}

export function usePublicJobs(tenantSlug?: string) {
  const qs = tenantSlug ? `?tenantSlug=${encodeURIComponent(tenantSlug)}` : "";
  return useQuery({
    queryKey: talentKeys.publicJobs(tenantSlug),
    queryFn: () => apiRequest<PublicJobRecord[]>(`/public/careers/jobs${qs}`),
    staleTime: 60_000
  });
}

export function usePublicJob(slug: string) {
  return useQuery({
    queryKey: talentKeys.publicJob(slug),
    queryFn: () => apiRequest<PublicJobRecord>(`/public/careers/jobs/${slug}`),
    enabled: Boolean(slug),
    staleTime: 60_000
  });
}

export function usePublicApplicationStatus(code: string, enabled: boolean) {
  return useQuery({
    queryKey: talentKeys.publicStatus(code),
    queryFn: () => apiRequest<PublicApplicationStatusRecord>(`/public/careers/applications/${encodeURIComponent(code)}/status`),
    enabled: enabled && Boolean(code.trim()),
    retry: false,
    staleTime: 30_000
  });
}

export function usePublicApply() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiRequest<{ success: boolean; applicationCode: string; candidateCode: string; message?: string }>("/public/careers/apply", {
        method: "POST",
        body: JSON.stringify(payload)
      })
  });
}
