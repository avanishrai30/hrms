import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import { STORAGE_PROVIDER, type StorageProvider } from "../storage/storage.provider.js";
import { ResumeParserEngine } from "./engines/resume-parser.engine.js";
import { CandidateEvaluationEngine } from "./engines/evaluation.engine.js";
import { AiRecruitmentEngine } from "./engines/ai-recruitment.engine.js";
import { OnboardingIntegrationService } from "./engines/onboarding-integration.service.js";
import { RecruitmentAnalyticsService } from "./engines/recruitment-analytics.service.js";
import {
  type ApplicationStage,
  type CandidateStatus,
  type HiringPriority,
  type HiringRequestStatus,
  type InterviewRecommendation,
  type InterviewStatus,
  type InterviewType,
  type JobPostingChannel,
  type JobRequisitionStatus,
  type OfferApproverRole,
  type OfferStatus,
  type PreboardingTaskStatus,
  type PreboardingTaskType,
  Prisma
} from "@prisma/client";
import type {
  ApproveHiringRequestDto,
  ApproveOfferDto,
  CandidateOfferDecisionDto,
  CreateCandidateDto,
  CreateHiringRequestDto,
  CreateJobRequisitionDto,
  CreateOfferDto,
  PublicApplyDto,
  ScheduleInterviewDto,
  SubmitInterviewFeedbackDto,
  UpdateApplicationStageDto,
  VerifyPreboardingTaskDto
} from "./recruitment.schemas.js";

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly resumeParser: ResumeParserEngine,
    private readonly evaluationEngine: CandidateEvaluationEngine,
    private readonly aiRecruitment: AiRecruitmentEngine,
    private readonly onboardingIntegration: OnboardingIntegrationService,
    private readonly analyticsService: RecruitmentAnalyticsService
  ) {}

  // =========================================================================
  // 1. MANPOWER PLANNING & HIRING REQUESTS
  // =========================================================================

  async listHiringRequests(tenantId: string, status?: string) {
    return this.prisma.hiringRequest.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as HiringRequestStatus } : {})
      },
      include: {
        department: true,
        designation: true,
        hiringManager: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createHiringRequest(
    tenantId: string,
    dto: CreateHiringRequestDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const count = await this.prisma.hiringRequest.count({ where: { tenantId } });
    const requestCode = `HR-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const defaultChain = [
      { role: "MANAGER", status: "APPROVED", date: new Date().toISOString() },
      { role: "HR", status: "PENDING" },
      { role: "DEPT_HEAD", status: "PENDING" },
      { role: "FINANCE", status: "PENDING" }
    ];

    const request = await this.prisma.hiringRequest.create({
      data: {
        tenantId,
        requestCode,
        departmentId: dto.departmentId,
        businessUnitId: dto.businessUnitId,
        designationId: dto.designationId,
        employmentType: dto.employmentType || "FULL_TIME",
        vacancies: dto.vacancies,
        budgetedCtc: new Prisma.Decimal(dto.budgetedCtc),
        priority: (dto.priority as HiringPriority) || "MEDIUM",
        justification: dto.justification,
        requiredByDate: new Date(dto.requiredByDate),
        hiringManagerId: dto.hiringManagerId,
        status: "PENDING_APPROVAL",
        currentApprovalStage: "HR",
        approvalChainJson: defaultChain
      },
      include: { department: true, designation: true, hiringManager: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "hiring_request.created",
      resourceType: "hiring_request",
      resourceId: request.id,
      after: { requestCode: request.requestCode, status: request.status }
    });

    return request;
  }

  async approveHiringRequest(
    tenantId: string,
    requestId: string,
    dto: ApproveHiringRequestDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const req = await this.prisma.hiringRequest.findFirst({
      where: { id: requestId, tenantId }
    });
    if (!req) throw new NotFoundException("Hiring request not found.");

    let newStatus: HiringRequestStatus = req.status;
    let newStage = req.currentApprovalStage;
    const chain = (req.approvalChainJson as Array<{ role: string; status: string; comments?: string; date?: string }>) || [];

    if (dto.decision === "REJECT") {
      newStatus = "REJECTED";
      newStage = "REJECTED";
      if (chain.length > 0) {
        const curr = chain.find((c) => c.status === "PENDING");
        if (curr) {
          curr.status = "REJECTED";
          curr.comments = dto.comments;
          curr.date = new Date().toISOString();
        }
      }
    } else {
      // Advance approval stages: HR -> DEPT_HEAD -> FINANCE -> APPROVED
      if (req.currentApprovalStage === "HR") {
        newStage = "DEPT_HEAD";
        const item = chain.find((c) => c.role === "HR");
        if (item) { item.status = "APPROVED"; item.comments = dto.comments; item.date = new Date().toISOString(); }
      } else if (req.currentApprovalStage === "DEPT_HEAD") {
        newStage = "FINANCE";
        const item = chain.find((c) => c.role === "DEPT_HEAD");
        if (item) { item.status = "APPROVED"; item.comments = dto.comments; item.date = new Date().toISOString(); }
      } else if (req.currentApprovalStage === "FINANCE" || !req.currentApprovalStage) {
        newStatus = "APPROVED";
        newStage = "COMPLETED";
        const item = chain.find((c) => c.role === "FINANCE");
        if (item) { item.status = "APPROVED"; item.comments = dto.comments; item.date = new Date().toISOString(); }
      }
    }

    const updated = await this.prisma.hiringRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        currentApprovalStage: newStage,
        approvalChainJson: chain,
        approvedAt: newStatus === "APPROVED" ? new Date() : undefined
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "hiring_request.approval_action",
      resourceType: "hiring_request",
      resourceId: req.id,
      after: { decision: dto.decision, status: updated.status, currentApprovalStage: updated.currentApprovalStage }
    });

    return updated;
  }

  // =========================================================================
  // 2. JOB REQUISITIONS & PUBLIC POSTINGS
  // =========================================================================

  async listJobRequisitions(tenantId: string, status?: string) {
    return this.prisma.jobRequisition.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as JobRequisitionStatus } : {})
      },
      include: {
        department: true,
        designation: true,
        postings: true,
        _count: { select: { applications: true, offers: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createJobRequisition(
    tenantId: string,
    dto: CreateJobRequisitionDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const count = await this.prisma.jobRequisition.count({ where: { tenantId } });
    const requisitionCode = `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const requisition = await this.prisma.jobRequisition.create({
      data: {
        tenantId,
        requisitionCode,
        hiringRequestId: dto.hiringRequestId,
        jobTitle: dto.jobTitle,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        location: dto.location,
        employmentType: dto.employmentType || "FULL_TIME",
        experienceMin: dto.experienceMin ?? 0,
        experienceMax: dto.experienceMax ?? 10,
        salaryMin: dto.salaryMin ? new Prisma.Decimal(dto.salaryMin) : null,
        salaryMax: dto.salaryMax ? new Prisma.Decimal(dto.salaryMax) : null,
        skillsRequired: dto.skillsRequired || [],
        jobDescription: dto.jobDescription,
        openings: dto.openings ?? 1,
        status: "APPROVED",
        approvedAt: new Date()
      },
      include: { department: true, designation: true }
    });

    // Auto-create active public job posting
    const slug = `${requisition.jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${requisition.requisitionCode.toLowerCase()}`;
    await this.prisma.jobPosting.create({
      data: {
        tenantId,
        requisitionId: requisition.id,
        slug,
        title: requisition.jobTitle,
        channel: "PUBLIC_CAREERS",
        status: "ACTIVE"
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "job_requisition.created",
      resourceType: "job_requisition",
      resourceId: requisition.id,
      after: { requisitionCode: requisition.requisitionCode, title: requisition.jobTitle }
    });

    return requisition;
  }

  async publishJobRequisition(
    tenantId: string,
    requisitionId: string,
    channel: JobPostingChannel = "PUBLIC_CAREERS",
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const req = await this.prisma.jobRequisition.findFirst({
      where: { id: requisitionId, tenantId }
    });
    if (!req) throw new NotFoundException("Requisition not found.");

    const slug = `${req.jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${req.requisitionCode.toLowerCase()}`;

    const posting = await this.prisma.jobPosting.upsert({
      where: { tenantId_slug: { tenantId, slug } },
      create: {
        tenantId,
        requisitionId,
        slug,
        title: req.jobTitle,
        channel,
        status: "ACTIVE"
      },
      update: {
        status: "ACTIVE",
        channel,
        publishedAt: new Date()
      }
    });

    await this.prisma.jobRequisition.update({
      where: { id: requisitionId },
      data: { status: "PUBLISHED" }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "job_requisition.published",
      resourceType: "job_requisition",
      resourceId: req.id,
      after: { slug, channel }
    });

    return posting;
  }

  // =========================================================================
  // 3. CANDIDATE MANAGEMENT & RESUME PARSING
  // =========================================================================

  async listCandidates(tenantId: string, query?: string, status?: string, limit?: string, offset?: string) {
    const trimmedQuery = query?.trim();
    const take = limit ? Math.min(Math.max(Number(limit) || 25, 1), 100) : undefined;
    const skip = offset ? Math.max(Number(offset) || 0, 0) : undefined;

    return this.prisma.candidate.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as CandidateStatus } : {}),
        ...(trimmedQuery
          ? {
              OR: [
                { fullName: { contains: trimmedQuery, mode: "insensitive" } },
                { email: { contains: trimmedQuery, mode: "insensitive" } },
                { mobile: { contains: trimmedQuery, mode: "insensitive" } },
                { candidateCode: { contains: trimmedQuery, mode: "insensitive" } },
                { currentLocation: { contains: trimmedQuery, mode: "insensitive" } },
                { skills: { has: trimmedQuery } }
              ]
            }
          : {})
      },
      include: {
        candidateSkills: true,
        resumes: { take: 1, orderBy: { createdAt: "desc" } },
        applications: {
          include: { requisition: true, interviews: true, offers: true }
        }
      },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
      ...(skip ? { skip } : {})
    });
  }

  async getCandidate(tenantId: string, candidateId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
      include: {
        candidateSkills: true,
        resumes: true,
        applications: {
          include: {
            requisition: { include: { department: true, designation: true } },
            interviews: { include: { feedbacks: { include: { interviewer: true } }, panels: { include: { employee: true } } } },
            offers: { include: { approvals: true } }
          }
        },
        offers: { include: { approvals: true } },
        preboardingTasks: true,
        activities: { orderBy: { createdAt: "desc" } }
      }
    });
    if (!candidate) throw new NotFoundException("Candidate not found.");
    return candidate;
  }

  async createCandidate(
    tenantId: string,
    dto: CreateCandidateDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const count = await this.prisma.candidate.count({ where: { tenantId } });
    const candidateCode = `CND-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const candidate = await this.prisma.candidate.create({
      data: {
        tenantId,
        candidateCode,
        fullName: dto.fullName,
        email: dto.email,
        mobile: dto.mobile,
        currentLocation: dto.currentLocation,
        experienceYears: dto.experienceYears ?? 0,
        currentCtc: dto.currentCtc ? new Prisma.Decimal(dto.currentCtc) : null,
        expectedCtc: dto.expectedCtc ? new Prisma.Decimal(dto.expectedCtc) : null,
        noticePeriodDays: dto.noticePeriodDays ?? 30,
        skills: dto.skills || [],
        education: dto.education,
        summary: dto.summary,
        linkedinUrl: dto.linkedinUrl,
        githubUrl: dto.githubUrl,
        portfolioUrl: dto.portfolioUrl,
        source: dto.source || "CAREERS_PORTAL",
        status: "APPLIED"
      }
    });

    if (dto.skills && dto.skills.length > 0) {
      await this.prisma.candidateSkill.createMany({
        data: dto.skills.map((s: string) => ({
          candidateId: candidate.id,
          skillName: s,
          proficiency: "INTERMEDIATE",
          years: Math.max(1, (dto.experienceYears || 2) * 0.7)
        }))
      });
    }

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: candidate.id,
        actorName: "Recruiter Admin",
        activityType: "CANDIDATE_CREATED",
        title: "Candidate Profile Registered",
        description: `Profile created from ${dto.source || "Careers Portal"}.`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "candidate.created",
      resourceType: "candidate",
      resourceId: candidate.id,
      after: { candidateCode: candidate.candidateCode, fullName: candidate.fullName, email: candidate.email }
    });

    return candidate;
  }

  // =========================================================================
  // 4. ATS APPLICATION PIPELINE & STAGES
  // =========================================================================

  async listApplications(tenantId: string, requisitionId?: string, stage?: string) {
    return this.prisma.application.findMany({
      where: {
        tenantId,
        ...(requisitionId ? { requisitionId } : {}),
        ...(stage ? { stage: stage as ApplicationStage } : {})
      },
      include: {
        candidate: { include: { candidateSkills: true, resumes: { take: 1 } } },
        requisition: { include: { department: true, designation: true } },
        interviews: { include: { feedbacks: true } },
        offers: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async updateApplicationStage(
    tenantId: string,
    applicationId: string,
    dto: UpdateApplicationStageDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, tenantId },
      include: { candidate: true, requisition: true }
    });
    if (!app) throw new NotFoundException("Application not found.");

    const history = (app.stageHistoryJson as Array<{ stage: string; timestamp: string; note?: string }>) || [];
    history.push({
      stage: dto.stage,
      timestamp: new Date().toISOString(),
      note: dto.notes
    });

    const isRejected = dto.stage === "REJECTED";

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        stage: dto.stage as ApplicationStage,
        stageHistoryJson: history,
        rejectedAt: isRejected ? new Date() : undefined,
        rejectionReason: dto.rejectionReason
      }
    });

    // Sync candidate status
    let candidateStatus: CandidateStatus = "APPLIED";
    if (dto.stage === "SCREENING") candidateStatus = "SCREENING";
    else if (dto.stage === "TECHNICAL_ROUND" || dto.stage === "MANAGER_ROUND" || dto.stage === "HR_ROUND") candidateStatus = "INTERVIEW";
    else if (dto.stage === "OFFER") candidateStatus = "OFFER";
    else if (dto.stage === "JOINED") candidateStatus = "HIRED";
    else if (dto.stage === "REJECTED") candidateStatus = "REJECTED";

    await this.prisma.candidate.update({
      where: { id: app.candidateId },
      data: { status: candidateStatus }
    });

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: app.candidateId,
        actorName: "ATS Pipeline",
        activityType: "STAGE_TRANSITION",
        title: `Advanced to ${dto.stage}`,
        description: dto.notes || `Candidate application moved to ${dto.stage} stage.`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "application.stage_updated",
      resourceType: "application",
      resourceId: app.id,
      after: { previousStage: app.stage, newStage: dto.stage }
    });

    return updated;
  }

  // =========================================================================
  // 5. INTERVIEW MANAGEMENT & EVALUATION SCORECARDS
  // =========================================================================

  async listInterviews(tenantId: string, applicationId?: string, status?: string) {
    return this.prisma.interview.findMany({
      where: {
        tenantId,
        ...(applicationId ? { applicationId } : {}),
        ...(status ? { status: status as InterviewStatus } : {})
      },
      include: {
        application: {
          include: { candidate: true, requisition: true }
        },
        panels: { include: { employee: true } },
        feedbacks: { include: { interviewer: true } }
      },
      orderBy: { scheduledStartTime: "asc" }
    });
  }

  async scheduleInterview(
    tenantId: string,
    dto: ScheduleInterviewDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const app = await this.prisma.application.findFirst({
      where: { id: dto.applicationId, tenantId },
      include: { candidate: true }
    });
    if (!app) throw new NotFoundException("Application not found.");

    const interview = await this.prisma.interview.create({
      data: {
        tenantId,
        applicationId: dto.applicationId,
        roundName: dto.roundName,
        roundNumber: dto.roundNumber ?? 1,
        interviewType: (dto.interviewType as InterviewType) || "VIDEO",
        scheduledStartTime: new Date(dto.scheduledStartTime),
        scheduledEndTime: new Date(dto.scheduledEndTime),
        meetingLink: dto.meetingLink,
        locationDetails: dto.locationDetails,
        status: "SCHEDULED"
      }
    });

    if (dto.panelEmployeeIds && dto.panelEmployeeIds.length > 0) {
      await this.prisma.interviewPanel.createMany({
        data: dto.panelEmployeeIds.map((empId: string) => ({
          interviewId: interview.id,
          employeeId: empId,
          role: "PANEL_MEMBER"
        }))
      });
    }

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: app.candidateId,
        actorName: "Interview Coordinator",
        activityType: "INTERVIEW_SCHEDULED",
        title: `Interview Scheduled: ${dto.roundName}`,
        description: `Scheduled for ${new Date(dto.scheduledStartTime).toLocaleString()} (${dto.interviewType || "VIDEO"}).`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "interview.scheduled",
      resourceType: "interview",
      resourceId: interview.id,
      after: { roundName: interview.roundName, startTime: interview.scheduledStartTime }
    });

    return interview;
  }

  async submitInterviewFeedback(
    tenantId: string,
    dto: SubmitInterviewFeedbackDto,
    interviewerUserId: string,
    actorMembershipId?: string
  ) {
    const interview = await this.prisma.interview.findFirst({
      where: { id: dto.interviewId, tenantId },
      include: { application: true }
    });
    if (!interview) throw new NotFoundException("Interview not found.");

    const evalResult = this.evaluationEngine.calculateScore({
      technicalScore: dto.technicalScore,
      communication: dto.communication,
      problemSolving: dto.problemSolving,
      cultureFit: dto.cultureFit,
      leadership: dto.leadership,
      experienceScore: dto.experienceScore
    });

    const feedback = await this.prisma.interviewFeedback.upsert({
      where: {
        interviewId_interviewerId: {
          interviewId: dto.interviewId,
          interviewerId: interviewerUserId
        }
      },
      create: {
        interviewId: dto.interviewId,
        interviewerId: interviewerUserId,
        technicalScore: dto.technicalScore,
        communication: dto.communication,
        problemSolving: dto.problemSolving,
        cultureFit: dto.cultureFit,
        leadership: dto.leadership,
        experienceScore: dto.experienceScore,
        overallScore: evalResult.overallScore,
        recommendation: (dto.recommendation as InterviewRecommendation) || evalResult.recommendation,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        notes: dto.notes
      },
      update: {
        technicalScore: dto.technicalScore,
        communication: dto.communication,
        problemSolving: dto.problemSolving,
        cultureFit: dto.cultureFit,
        leadership: dto.leadership,
        experienceScore: dto.experienceScore,
        overallScore: evalResult.overallScore,
        recommendation: (dto.recommendation as InterviewRecommendation) || evalResult.recommendation,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        notes: dto.notes
      }
    });

    // Mark interview completed
    await this.prisma.interview.update({
      where: { id: dto.interviewId },
      data: { status: "COMPLETED", completedAt: new Date() }
    });

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: interview.application.candidateId,
        actorName: "Interviewer",
        activityType: "INTERVIEW_FEEDBACK",
        title: `Scorecard Submitted: ${evalResult.overallScore}/5.0`,
        description: `Recommendation: ${dto.recommendation}. Overall score: ${evalResult.overallScore}/5.0`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: interviewerUserId,
      actorMembershipId,
      action: "interview.feedback_submitted",
      resourceType: "interview_feedback",
      resourceId: feedback.id,
      after: { overallScore: evalResult.overallScore, recommendation: dto.recommendation }
    });

    return feedback;
  }

  // =========================================================================
  // 6. OFFER MANAGEMENT & MULTI-STAGE APPROVAL
  // =========================================================================

  async listOffers(tenantId: string, status?: string) {
    return this.prisma.offer.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as OfferStatus } : {})
      },
      include: {
        candidate: true,
        requisition: true,
        approvals: { include: { approverUser: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createOffer(
    tenantId: string,
    dto: CreateOfferDto,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const app = await this.prisma.application.findFirst({
      where: { id: dto.applicationId, tenantId },
      include: { candidate: true, requisition: true }
    });
    if (!app) throw new NotFoundException("Application not found.");

    const count = await this.prisma.offer.count({ where: { tenantId } });
    const offerCode = `OFF-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const offer = await this.prisma.offer.create({
      data: {
        tenantId,
        offerCode,
        applicationId: dto.applicationId,
        candidateId: app.candidateId,
        requisitionId: app.requisitionId,
        baseSalary: new Prisma.Decimal(dto.baseSalary),
        joiningBonus: new Prisma.Decimal(dto.joiningBonus ?? 0),
        variablePay: new Prisma.Decimal(dto.variablePay ?? 0),
        totalCtc: new Prisma.Decimal(dto.totalCtc),
        benefitsSummary: dto.benefitsSummary || "Health insurance, EPF, statutory bonus, paid annual leave.",
        joiningDate: new Date(dto.joiningDate),
        expiryDate: new Date(dto.expiryDate),
        status: "PENDING_APPROVAL",
        currentApprovalStage: "HR"
      }
    });

    // Seed 4-step approval chain: HR -> DEPT_HEAD -> FINANCE -> CEO
    const roles: OfferApproverRole[] = ["HR", "DEPT_HEAD", "FINANCE", "CEO"];
    await this.prisma.offerApproval.createMany({
      data: roles.map((role) => ({
        offerId: offer.id,
        approverRole: role,
        status: "PENDING"
      }))
    });

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: app.candidateId,
        actorName: "Compensation Team",
        activityType: "OFFER_GENERATED",
        title: `Offer Created: ₹${Number(dto.totalCtc).toLocaleString("en-IN")}`,
        description: `Offer letter ${offerCode} prepared, submitted for multi-tier approval.`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "offer.created",
      resourceType: "offer",
      resourceId: offer.id,
      after: { offerCode: offer.offerCode, totalCtc: dto.totalCtc }
    });

    return offer;
  }

  async approveOffer(
    tenantId: string,
    offerId: string,
    dto: ApproveOfferDto,
    approverRole: OfferApproverRole = "HR",
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, tenantId },
      include: { approvals: true, candidate: true }
    });
    if (!offer) throw new NotFoundException("Offer not found.");

    if (dto.decision === "REJECT") {
      await this.prisma.offerApproval.updateMany({
        where: { offerId, approverRole },
        data: { status: "REJECTED", comments: dto.comments, approvedAt: new Date(), approverUserId: actorUserId }
      });
      return await this.prisma.offer.update({
        where: { id: offerId },
        data: { status: "REJECTED", currentApprovalStage: "REJECTED" }
      });
    }

    // Mark current role approved
    await this.prisma.offerApproval.updateMany({
      where: { offerId, approverRole },
      data: { status: "APPROVED", comments: dto.comments, approvedAt: new Date(), approverUserId: actorUserId }
    });

    // Advance approval stage: HR -> DEPT_HEAD -> FINANCE -> CEO -> APPROVED
    let nextStage: string = "DEPT_HEAD";
    let newStatus: OfferStatus = "PENDING_APPROVAL";

    if (approverRole === "HR") nextStage = "DEPT_HEAD";
    else if (approverRole === "DEPT_HEAD") nextStage = "FINANCE";
    else if (approverRole === "FINANCE") nextStage = "CEO";
    else if (approverRole === "CEO") {
      nextStage = "COMPLETED";
      newStatus = "APPROVED";
    }

    const updated = await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        status: newStatus,
        currentApprovalStage: nextStage
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "offer.approved_stage",
      resourceType: "offer",
      resourceId: offer.id,
      after: { approverRole, nextStage, status: updated.status }
    });

    return updated;
  }

  async releaseOffer(
    tenantId: string,
    offerId: string,
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, tenantId },
      include: { candidate: true }
    });
    if (!offer) throw new NotFoundException("Offer not found.");

    const updated = await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        status: "RELEASED",
        releasedAt: new Date()
      }
    });

    // Seed preboarding tasks
    const tasks = [
      { title: "Upload PAN & Aadhaar Identity Proofs", type: "IDENTITY_VERIFICATION" as PreboardingTaskType },
      { title: "Provide Bank Account Details for Salary Disbursal", type: "BANK_DETAILS" as PreboardingTaskType },
      { title: "Sign Company Code of Conduct & NDA", type: "POLICY_SIGN" as PreboardingTaskType },
      { title: "Select Work Equipment & Laptop Preferences", type: "EQUIPMENT_PREFERENCE" as PreboardingTaskType }
    ];

    for (const t of tasks) {
      await this.prisma.preboardingTask.create({
        data: {
          tenantId,
          candidateId: offer.candidateId,
          offerId: offer.id,
          taskTitle: t.title,
          taskType: t.type,
          status: "PENDING"
        }
      });
    }

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: offer.candidateId,
        actorName: "HR Operations",
        activityType: "OFFER_RELEASED",
        title: "Offer Letter Dispatched to Candidate",
        description: `Official offer released with joining date of ${new Date(offer.joiningDate).toLocaleDateString()}.`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "offer.released",
      resourceType: "offer",
      resourceId: offer.id,
      after: { status: "RELEASED", releasedAt: updated.releasedAt }
    });

    return updated;
  }

  // =========================================================================
  // 7. PREBOARDING MANAGEMENT
  // =========================================================================

  async listPreboardingTasks(tenantId: string, candidateId?: string) {
    return this.prisma.preboardingTask.findMany({
      where: {
        tenantId,
        ...(candidateId ? { candidateId } : {})
      },
      include: {
        candidate: true,
        offer: true,
        verifiedBy: true
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async verifyPreboardingTask(
    tenantId: string,
    taskId: string,
    dto: VerifyPreboardingTaskDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const task = await this.prisma.preboardingTask.findFirst({
      where: { id: taskId, tenantId },
      include: { candidate: true }
    });
    if (!task) throw new NotFoundException("Preboarding task not found.");

    const updated = await this.prisma.preboardingTask.update({
      where: { id: taskId },
      data: {
        status: dto.status as PreboardingTaskStatus,
        verifiedById: actorUserId,
        verifiedAt: new Date()
      }
    });

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: task.candidateId,
        actorName: "HR Compliance",
        activityType: "PREBOARDING_VERIFIED",
        title: `Task Verified: ${task.taskTitle}`,
        description: `Status marked as ${dto.status}.`
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "preboarding.verified",
      resourceType: "preboarding_task",
      resourceId: task.id,
      after: { status: updated.status }
    });

    return updated;
  }

  // =========================================================================
  // 8. AUTONOMOUS ONBOARDING TO EMPLOYEE (TASK 18 & PAYROLL INTEGRATION)
  // =========================================================================

  async onboardHiredCandidate(
    tenantId: string,
    candidateId: string,
    options: { employeeCode?: string; joiningDate?: string; salaryTemplateId?: string },
    actorUserId?: string,
    actorMembershipId?: string
  ) {
    return this.onboardingIntegration.onboardHiredCandidate(
      tenantId,
      candidateId,
      options,
      actorUserId,
      actorMembershipId
    );
  }

  // =========================================================================
  // 9. ANALYTICS & AI RECRUITMENT INTELLIGENCE
  // =========================================================================

  async getRecruitmentAnalytics(tenantId: string) {
    return this.analyticsService.getRecruitmentAnalytics(tenantId);
  }

  async getAiRecruitmentIntelligence(tenantId: string) {
    return this.analyticsService.getAiRecruitmentIntelligence(tenantId);
  }

  // =========================================================================
  // 10. PUBLIC CAREERS PORTAL & CANDIDATE SELF-SERVICE
  // =========================================================================

  async getPublicJobs(tenantSlug?: string) {
    let tenantId: string | undefined;
    if (tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
      if (tenant) tenantId = tenant.id;
    }

    const postings = await this.prisma.jobPosting.findMany({
      where: {
        status: "ACTIVE",
        ...(tenantId ? { tenantId } : {})
      },
      include: {
        tenant: { select: { name: true, slug: true } },
        requisition: {
          include: { department: true, designation: true }
        }
      },
      orderBy: { publishedAt: "desc" }
    });

    return postings.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      companyName: p.tenant.name,
      tenantSlug: p.tenant.slug,
      department: p.requisition.department.name,
      location: p.requisition.location,
      employmentType: p.requisition.employmentType,
      experienceRange: `${p.requisition.experienceMin} - ${p.requisition.experienceMax} years`,
      skills: p.requisition.skillsRequired,
      jobDescription: p.requisition.jobDescription,
      publishedAt: p.publishedAt.toISOString()
    }));
  }

  async getPublicJobBySlug(slug: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { slug, status: "ACTIVE" },
      include: {
        tenant: { select: { id: true, name: true, slug: true } },
        requisition: {
          include: { department: true, designation: true }
        }
      }
    });

    if (!posting) throw new NotFoundException("Job posting not found.");

    // Increment views count
    await this.prisma.jobPosting.update({
      where: { id: posting.id },
      data: { viewsCount: { increment: 1 } }
    });

    return {
      id: posting.id,
      slug: posting.slug,
      title: posting.title,
      tenantId: posting.tenant.id,
      companyName: posting.tenant.name,
      tenantSlug: posting.tenant.slug,
      department: posting.requisition.department.name,
      location: posting.requisition.location,
      employmentType: posting.requisition.employmentType,
      experienceRange: `${posting.requisition.experienceMin} - ${posting.requisition.experienceMax} years`,
      skills: posting.requisition.skillsRequired,
      jobDescription: posting.requisition.jobDescription,
      publishedAt: posting.publishedAt.toISOString()
    };
  }

  async publicApply(dto: PublicApplyDto) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { slug: dto.jobSlug, status: "ACTIVE" },
      include: { requisition: true, tenant: true }
    });
    if (!posting) throw new NotFoundException("Job posting not found.");

    const tenantId = posting.tenantId;

    // 1. Create or Find Candidate
    let candidate = await this.prisma.candidate.findFirst({
      where: { tenantId, email: dto.email }
    });

    if (!candidate) {
      const count = await this.prisma.candidate.count({ where: { tenantId } });
      const candidateCode = `CND-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      candidate = await this.prisma.candidate.create({
        data: {
          tenantId,
          candidateCode,
          fullName: dto.fullName,
          email: dto.email,
          mobile: dto.mobile,
          currentLocation: dto.currentLocation,
          experienceYears: dto.experienceYears ?? 0,
          currentCtc: dto.currentCtc ? new Prisma.Decimal(dto.currentCtc) : null,
          expectedCtc: dto.expectedCtc ? new Prisma.Decimal(dto.expectedCtc) : null,
          noticePeriodDays: dto.noticePeriodDays ?? 30,
          skills: dto.skills || [],
          education: dto.education,
          summary: dto.summary,
          linkedinUrl: dto.linkedinUrl,
          githubUrl: dto.githubUrl,
          portfolioUrl: dto.portfolioUrl,
          status: "APPLIED",
          source: "CAREERS_PORTAL"
        }
      });
    }

    // 2. Parse & Store Resume if provided
    const resumeText = `${dto.fullName} ${dto.skills?.join(" ")} ${dto.summary || ""}`;
    if (dto.resumeFileBase64) {
      const objectKey = `tenants/${tenantId}/resumes/${candidate.id}/${Date.now()}-${dto.resumeFileName || "resume.pdf"}`;
      const buffer = Buffer.from(dto.resumeFileBase64, "base64");
      await this.storage.upload(objectKey, buffer, "application/pdf");

      const parsed = await this.resumeParser.parseResume(tenantId, resumeText, dto.resumeFileName || "resume.pdf");

      await this.prisma.resume.create({
        data: {
          candidateId: candidate.id,
          fileName: dto.resumeFileName || "resume.pdf",
          objectKey,
          mimeType: "application/pdf",
          sizeBytes: buffer.length,
          parsedData: parsed as unknown as Prisma.InputJsonValue,
          extractedText: resumeText
        }
      });
    }

    // 3. Compute AI Match Score
    const matchResult = this.aiRecruitment.calculateMatchScore({
      candidateSkills: dto.skills || candidate.skills || [],
      requiredSkills: posting.requisition.skillsRequired || [],
      candidateExperience: dto.experienceYears ?? candidate.experienceYears ?? 0,
      minExperience: posting.requisition.experienceMin,
      maxExperience: posting.requisition.experienceMax,
      candidateEducation: dto.education || candidate.education,
      jobDescription: posting.requisition.jobDescription
    });

    // 4. Create Application record
    const appCount = await this.prisma.application.count({ where: { tenantId } });
    const applicationCode = `APP-${new Date().getFullYear()}-${String(appCount + 1).padStart(4, "0")}`;

    await this.prisma.application.create({
      data: {
        tenantId,
        applicationCode,
        requisitionId: posting.requisitionId,
        candidateId: candidate.id,
        stage: "APPLIED",
        source: "CAREERS_PORTAL",
        aiMatchScore: matchResult.overallMatchScore,
        aiSkillsMatch: matchResult.skillsMatchScore,
        aiExpMatch: matchResult.experienceMatchScore,
        aiSummary: matchResult.summary,
        aiInterviewQs: matchResult.interviewQuestions,
        stageHistoryJson: [{ stage: "APPLIED", timestamp: new Date().toISOString() }]
      }
    });

    await this.prisma.candidateActivity.create({
      data: {
        tenantId,
        candidateId: candidate.id,
        actorName: "Candidate",
        activityType: "PUBLIC_APPLICATION",
        title: `Applied for ${posting.title}`,
        description: `Application code ${applicationCode}. AI Match score: ${matchResult.overallMatchScore}%`
      }
    });

    return {
      success: true,
      applicationCode,
      candidateCode: candidate.candidateCode,
      matchScore: matchResult.overallMatchScore,
      message: "Application submitted successfully! You can track your status using your Application Code."
    };
  }

  async getApplicationStatusByCode(code: string) {
    const app = await this.prisma.application.findFirst({
      where: { applicationCode: code },
      include: {
        candidate: {
          include: {
            preboardingTasks: true,
            offers: {
              where: { status: { in: ["RELEASED", "ACCEPTED", "REJECTED"] } },
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        },
        requisition: { include: { department: true } },
        interviews: {
          where: { status: { in: ["SCHEDULED", "COMPLETED"] } },
          orderBy: { scheduledStartTime: "asc" }
        }
      }
    });

    if (!app) throw new NotFoundException("Application not found.");

    return {
      applicationCode: app.applicationCode,
      candidateName: app.candidate.fullName,
      email: app.candidate.email,
      jobTitle: app.requisition.jobTitle,
      department: app.requisition.department.name,
      stage: app.stage,
      appliedAt: app.appliedAt.toISOString(),
      interviews: app.interviews.map((i) => ({
        roundName: i.roundName,
        scheduledStartTime: i.scheduledStartTime.toISOString(),
        meetingLink: i.meetingLink,
        status: i.status
      })),
      offer: app.candidate.offers[0]
        ? {
            offerCode: app.candidate.offers[0].offerCode,
            totalCtc: Number(app.candidate.offers[0].totalCtc),
            joiningDate: app.candidate.offers[0].joiningDate.toISOString(),
            status: app.candidate.offers[0].status
          }
        : null,
      preboardingTasks: app.candidate.preboardingTasks.map((t) => ({
        id: t.id,
        title: t.taskTitle,
        type: t.taskType,
        status: t.status
      }))
    };
  }

  async candidateOfferDecision(offerCode: string, dto: CandidateOfferDecisionDto) {
    const offer = await this.prisma.offer.findFirst({
      where: { offerCode },
      include: { candidate: true }
    });
    if (!offer) throw new NotFoundException("Offer not found.");

    const newStatus: OfferStatus = dto.decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const updated = await this.prisma.offer.update({
      where: { id: offer.id },
      data: {
        status: newStatus,
        respondedAt: new Date(),
        responseComments: dto.comments
      }
    });

    await this.prisma.candidateActivity.create({
      data: {
        tenantId: offer.tenantId,
        candidateId: offer.candidateId,
        actorName: "Candidate",
        activityType: "OFFER_DECISION",
        title: `Offer ${dto.decision === "ACCEPT" ? "Accepted 🎉" : "Declined"}`,
        description: dto.comments || `Candidate submitted decision: ${dto.decision}`
      }
    });

    return {
      success: true,
      offerCode: offer.offerCode,
      status: updated.status,
      message: dto.decision === "ACCEPT"
        ? "Congratulations! You have accepted the offer. Please proceed to complete your preboarding verification."
        : "Thank you for letting us know your decision."
    };
  }

  async candidateSubmitPreboardingTask(taskId: string, payload: Record<string, unknown>) {
    const task = await this.prisma.preboardingTask.findUnique({
      where: { id: taskId },
      include: { candidate: true }
    });
    if (!task) throw new NotFoundException("Preboarding task not found.");

    const updated = await this.prisma.preboardingTask.update({
      where: { id: taskId },
      data: {
        status: "SUBMITTED",
        payloadJson: payload as unknown as Prisma.InputJsonValue
      }
    });

    await this.prisma.candidateActivity.create({
      data: {
        tenantId: task.tenantId,
        candidateId: task.candidateId,
        actorName: "Candidate",
        activityType: "PREBOARDING_SUBMITTED",
        title: `Submitted: ${task.taskTitle}`,
        description: "Candidate submitted verification documents."
      }
    });

    return updated;
  }
}
