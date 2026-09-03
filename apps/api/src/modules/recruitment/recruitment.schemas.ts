import { z } from "zod";

export const CreateHiringRequestSchema = z.object({
  departmentId: z.string().uuid(),
  businessUnitId: z.string().uuid().optional().nullable(),
  designationId: z.string().uuid(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]).default("FULL_TIME"),
  vacancies: z.number().int().min(1).default(1),
  budgetedCtc: z.number().positive(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  justification: z.string().min(3),
  requiredByDate: z.string().datetime(),
  hiringManagerId: z.string().uuid()
});

export const ApproveHiringRequestSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  comments: z.string().optional()
});

export const CreateJobRequisitionSchema = z.object({
  hiringRequestId: z.string().uuid().optional().nullable(),
  jobTitle: z.string().min(2),
  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  location: z.string().min(2),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]).default("FULL_TIME"),
  experienceMin: z.number().int().min(0).default(0),
  experienceMax: z.number().int().min(0).default(10),
  salaryMin: z.number().positive().optional().nullable(),
  salaryMax: z.number().positive().optional().nullable(),
  skillsRequired: z.array(z.string()).default([]),
  jobDescription: z.string().min(10),
  openings: z.number().int().min(1).default(1)
});

export const UpdateJobRequisitionSchema = CreateJobRequisitionSchema.partial();

export const PublishRequisitionSchema = z.object({
  channel: z.enum(["INTERNAL_PORTAL", "PUBLIC_CAREERS", "LINKEDIN", "INDEED", "AGENCY", "CAMPUS"]).default("PUBLIC_CAREERS"),
  slug: z.string().min(2).optional(),
  expiresAt: z.string().datetime().optional()
});

export const CreateCandidateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(7),
  currentLocation: z.string().optional().nullable(),
  experienceYears: z.number().min(0).default(0),
  currentCtc: z.number().positive().optional().nullable(),
  expectedCtc: z.number().positive().optional().nullable(),
  noticePeriodDays: z.number().int().min(0).default(30),
  skills: z.array(z.string()).default([]),
  education: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  source: z.string().default("CAREERS_PORTAL")
});

export const UpdateCandidateSchema = CreateCandidateSchema.partial();

export const CreateJobPostingSchema = z.object({
  requisitionId: z.string().uuid(),
  title: z.string().min(2),
  channel: z.enum(["INTERNAL_PORTAL", "PUBLIC_CAREERS", "LINKEDIN", "INDEED", "AGENCY", "CAMPUS"]).default("PUBLIC_CAREERS"),
  slug: z.string().min(2).optional(),
  expiresAt: z.string().datetime().optional().nullable()
});

export const PublicApplySchema = z.object({
  jobSlug: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(7),
  currentLocation: z.string().optional(),
  experienceYears: z.number().min(0).default(0),
  currentCtc: z.number().positive().optional(),
  expectedCtc: z.number().positive().optional(),
  noticePeriodDays: z.number().int().min(0).default(30),
  skills: z.array(z.string()).default([]),
  education: z.string().optional(),
  summary: z.string().optional(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  resumeFileName: z.string().optional(),
  resumeFileBase64: z.string().optional()
});

export const UpdateApplicationStageSchema = z.object({
  stage: z.enum([
    "APPLIED",
    "SCREENING",
    "TECHNICAL_ROUND",
    "MANAGER_ROUND",
    "HR_ROUND",
    "OFFER",
    "JOINED",
    "REJECTED"
  ]),
  notes: z.string().optional(),
  rejectionReason: z.string().optional()
});

export const ScheduleInterviewSchema = z.object({
  applicationId: z.string().uuid(),
  roundName: z.string().min(2),
  roundNumber: z.number().int().min(1).default(1),
  interviewType: z.enum(["ONLINE", "OFFLINE", "TELEPHONIC", "VIDEO", "PANEL"]).default("VIDEO"),
  scheduledStartTime: z.string().datetime(),
  scheduledEndTime: z.string().datetime(),
  meetingLink: z.string().url().optional().nullable(),
  locationDetails: z.string().optional().nullable(),
  interviewerNotes: z.string().optional().nullable(),
  panelEmployeeIds: z.array(z.string().uuid()).default([])
});

export const SubmitInterviewFeedbackSchema = z.object({
  interviewId: z.string().uuid(),
  technicalScore: z.number().int().min(1).max(5).default(3),
  communication: z.number().int().min(1).max(5).default(3),
  problemSolving: z.number().int().min(1).max(5).default(3),
  cultureFit: z.number().int().min(1).max(5).default(3),
  leadership: z.number().int().min(1).max(5).default(3),
  experienceScore: z.number().int().min(1).max(5).default(3),
  recommendation: z.enum(["STRONG_HIRE", "HIRE", "NO_HIRE", "STRONG_NO_HIRE"]).default("HIRE"),
  strengths: z.string().optional().nullable(),
  weaknesses: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const CreateOfferSchema = z.object({
  applicationId: z.string().uuid(),
  baseSalary: z.number().positive(),
  joiningBonus: z.number().min(0).default(0),
  variablePay: z.number().min(0).default(0),
  totalCtc: z.number().positive(),
  benefitsSummary: z.string().optional().nullable(),
  joiningDate: z.string().datetime(),
  expiryDate: z.string().datetime()
});

export const ApproveOfferSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  comments: z.string().optional()
});

export const CandidateOfferDecisionSchema = z.object({
  decision: z.enum(["ACCEPT", "REJECT"]),
  comments: z.string().optional()
});

export const CreatePreboardingTaskSchema = z.object({
  candidateId: z.string().uuid(),
  offerId: z.string().uuid().optional().nullable(),
  taskTitle: z.string().min(2),
  taskType: z.enum([
    "DOCUMENT_UPLOAD",
    "BANK_DETAILS",
    "IDENTITY_VERIFICATION",
    "POLICY_SIGN",
    "BACKGROUND_CHECK",
    "EQUIPMENT_PREFERENCE"
  ]),
  description: z.string().optional().nullable()
});

export const SubmitPreboardingTaskSchema = z.object({
  payloadJson: z.record(z.unknown())
});

export const VerifyPreboardingTaskSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  comments: z.string().optional()
});

export const OnboardCandidateSchema = z.object({
  employeeCode: z.string().trim().min(2),
  joiningDate: z.string().datetime().optional(),
  salaryType: z.enum(["MONTHLY", "DAILY", "HOURLY"]),
  salaryTemplateId: z.string().uuid().optional()
});

// Infer TypeScript types
export type CreateHiringRequestDto = z.infer<typeof CreateHiringRequestSchema>;
export type ApproveHiringRequestDto = z.infer<typeof ApproveHiringRequestSchema>;
export type CreateJobRequisitionDto = z.infer<typeof CreateJobRequisitionSchema>;
export type UpdateJobRequisitionDto = z.infer<typeof UpdateJobRequisitionSchema>;
export type PublishRequisitionDto = z.infer<typeof PublishRequisitionSchema>;
export type CreateCandidateDto = z.infer<typeof CreateCandidateSchema>;
export type UpdateCandidateDto = z.infer<typeof UpdateCandidateSchema>;
export type CreateJobPostingDto = z.infer<typeof CreateJobPostingSchema>;
export type PublicApplyDto = z.infer<typeof PublicApplySchema>;
export type UpdateApplicationStageDto = z.infer<typeof UpdateApplicationStageSchema>;
export type ScheduleInterviewDto = z.infer<typeof ScheduleInterviewSchema>;
export type SubmitInterviewFeedbackDto = z.infer<typeof SubmitInterviewFeedbackSchema>;
export type CreateOfferDto = z.infer<typeof CreateOfferSchema>;
export type ApproveOfferDto = z.infer<typeof ApproveOfferSchema>;
export type CandidateOfferDecisionDto = z.infer<typeof CandidateOfferDecisionSchema>;
export type CreatePreboardingTaskDto = z.infer<typeof CreatePreboardingTaskSchema>;
export type SubmitPreboardingTaskDto = z.infer<typeof SubmitPreboardingTaskSchema>;
export type VerifyPreboardingTaskDto = z.infer<typeof VerifyPreboardingTaskSchema>;
export type OnboardCandidateDto = z.infer<typeof OnboardCandidateSchema>;
