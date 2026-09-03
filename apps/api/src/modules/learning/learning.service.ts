import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import { LearningEngine } from "./learning.engine.js";
import type { PermissionCode } from "@vc-wms/shared-types";
import type { CourseDifficulty } from "@prisma/client";
import type {
  CreateTrainingCategorySchema,
  CreateTrainingCourseSchema,
  CreateCourseModuleSchema,
  CreateLessonSchema,
  EnrollCourseSchema,
  UpdateProgressSchema,
  CreateLearningPathSchema,
  CreateAssessmentSchema,
  AddAssessmentQuestionSchema,
  SubmitAssessmentAttemptSchema,
  CreateCertificationSchema,
  IssueCertificationSchema,
  CreateSkillCategorySchema,
  CreateSkillSchema,
  UpdateEmployeeSkillSchema,
  CreateInstructorSchema,
  CreateTrainingSessionSchema,
  RecordSessionAttendanceSchema
} from "./learning.schemas.js";
import { z } from "zod";

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  private canManageLearning(permissions: PermissionCode[] = []) {
    return permissions.includes("lms.manage");
  }

  private async getActorEmployeeId(tenantId: string, membershipId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { tenantId, id: membershipId, status: "ACTIVE" },
      select: { employeeId: true }
    });
    if (!membership?.employeeId) {
      throw new ForbiddenException("An active employee profile is required for this learning action.");
    }
    return membership.employeeId;
  }

  private async assertEmployeeInTenant(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId, id: employeeId, archivedAt: null },
      select: { id: true }
    });
    if (!employee) throw new NotFoundException(`Employee not found: ${employeeId}`);
  }

  private async assertCourseInTenant(tenantId: string, courseId?: string) {
    if (!courseId) return;
    const course = await this.prisma.trainingCourse.findFirst({
      where: { tenantId, id: courseId, deletedAt: null },
      select: { id: true }
    });
    if (!course) throw new NotFoundException(`Course not found: ${courseId}`);
  }

  private async assertCategoryInTenant(tenantId: string, categoryId?: string) {
    if (!categoryId) return;
    const category = await this.prisma.trainingCategory.findFirst({
      where: { tenantId, id: categoryId, deletedAt: null },
      select: { id: true }
    });
    if (!category) throw new NotFoundException(`Category not found: ${categoryId}`);
  }

  private assertSelfOrManagerScope(
    targetEmployeeId: string,
    actorEmployeeId: string,
    permissions: PermissionCode[],
    message = "You can only access your own learning records."
  ) {
    if (!this.canManageLearning(permissions) && targetEmployeeId !== actorEmployeeId) {
      throw new ForbiddenException(message);
    }
  }

  // ==========================================
  // 1. TRAINING CATEGORIES & COURSES
  // ==========================================

  async listCategories(tenantId: string) {
    return this.prisma.trainingCategory.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { courses: true } }
      }
    });
  }

  async createCategory(
    tenantId: string,
    dto: z.infer<typeof CreateTrainingCategorySchema>,
    userId: string,
    membershipId: string
  ) {
    const existing = await this.prisma.trainingCategory.findFirst({
      where: { tenantId, slug: dto.slug, deletedAt: null }
    });
    if (existing) {
      throw new BadRequestException(`Category with slug '${dto.slug}' already exists.`);
    }

    const category = await this.prisma.trainingCategory.create({
      data: {
        tenantId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_CATEGORY_CREATED",
      resourceType: "TrainingCategory",
      resourceId: category.id,
      metadata: { name: dto.name }
    });

    return category;
  }

  async listCourses(
    tenantId: string,
    filters?: {
      categoryId?: string;
      isCompliance?: boolean;
      difficulty?: string;
      search?: string;
    }
  ) {
    return this.prisma.trainingCourse.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters?.isCompliance !== undefined ? { isCompliance: filters.isCompliance } : {}),
        ...(filters?.difficulty ? { difficulty: filters.difficulty as CourseDifficulty } : {}),
        ...(filters?.search
          ? {
              OR: [
                { title: { contains: filters.search, mode: "insensitive" } },
                { code: { contains: filters.search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: {
        category: true,
        modules: {
          include: {
            lessons: true
          }
        },
        _count: { select: { enrollments: true, assessments: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getCourse(tenantId: string, id: string) {
    const course = await this.prisma.trainingCourse.findFirst({
      where: { tenantId, id, deletedAt: null },
      include: {
        category: true,
        modules: {
          orderBy: { sequenceOrder: "asc" },
          include: {
            lessons: {
              orderBy: { sequenceOrder: "asc" },
              include: { attachments: true }
            }
          }
        },
        assessments: true,
        certifications: true
      }
    });
    if (!course) {
      throw new NotFoundException(`Course not found: ${id}`);
    }
    return course;
  }

  async createCourse(
    tenantId: string,
    dto: z.infer<typeof CreateTrainingCourseSchema>,
    userId: string,
    membershipId: string
  ) {
    await this.assertCategoryInTenant(tenantId, dto.categoryId);

    const existing = await this.prisma.trainingCourse.findFirst({
      where: { tenantId, code: dto.code, deletedAt: null }
    });
    if (existing) {
      throw new BadRequestException(`Course code '${dto.code}' already exists.`);
    }

    const course = await this.prisma.trainingCourse.create({
      data: {
        tenantId,
        categoryId: dto.categoryId,
        code: dto.code,
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        deliveryType: dto.deliveryType,
        difficulty: dto.difficulty,
        estimatedDurationMinutes: dto.estimatedDurationMinutes,
        passingScorePercent: dto.passingScorePercent,
        isMandatory: dto.isMandatory,
        isCompliance: dto.isCompliance,
        validityMonths: dto.validityMonths,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        thumbnailUrl: dto.thumbnailUrl,
        publishedAt: new Date()
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_COURSE_CREATED",
      resourceType: "TrainingCourse",
      resourceId: course.id,
      metadata: { code: dto.code, title: dto.title }
    });

    return course;
  }

  async createModule(
    tenantId: string,
    dto: z.infer<typeof CreateCourseModuleSchema>,
    userId: string,
    membershipId: string
  ) {
    const course = await this.prisma.trainingCourse.findFirst({
      where: { tenantId, id: dto.courseId, deletedAt: null }
    });
    if (!course) {
      throw new NotFoundException(`Course not found: ${dto.courseId}`);
    }

    const moduleRecord = await this.prisma.courseModule.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        sequenceOrder: dto.sequenceOrder
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_MODULE_CREATED",
      resourceType: "CourseModule",
      resourceId: moduleRecord.id,
      metadata: { courseId: dto.courseId, title: dto.title }
    });

    return moduleRecord;
  }

  async createLesson(
    tenantId: string,
    dto: z.infer<typeof CreateLessonSchema>,
    userId: string,
    membershipId: string
  ) {
    const moduleRecord = await this.prisma.courseModule.findFirst({
      where: { tenantId, id: dto.moduleId }
    });
    if (!moduleRecord) {
      throw new NotFoundException(`Module not found: ${dto.moduleId}`);
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        tenantId,
        moduleId: dto.moduleId,
        title: dto.title,
        contentType: dto.contentType,
        contentUrl: dto.contentUrl,
        textContent: dto.textContent,
        durationMinutes: dto.durationMinutes,
        sequenceOrder: dto.sequenceOrder,
        isMandatory: dto.isMandatory
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_LESSON_CREATED",
      resourceType: "Lesson",
      resourceId: lesson.id,
      metadata: { moduleId: dto.moduleId, title: dto.title }
    });

    return lesson;
  }

  // ==========================================
  // 2. ENROLLMENT & LEARNING CONSUMPTION
  // ==========================================

  async enrollCourse(
    tenantId: string,
    dto: z.infer<typeof EnrollCourseSchema>,
    userId: string,
    membershipId: string,
    permissions: PermissionCode[] = []
  ) {
    await this.assertCourseInTenant(tenantId, dto.courseId);
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);
    const actorEmployeeId = await this.getActorEmployeeId(tenantId, membershipId);
    this.assertSelfOrManagerScope(dto.employeeId, actorEmployeeId, permissions, "You can only enroll yourself unless you manage learning.");

    const existing = await this.prisma.courseEnrollment.findUnique({
      where: {
        tenantId_courseId_employeeId: {
          tenantId,
          courseId: dto.courseId,
          employeeId: dto.employeeId
        }
      }
    });
    if (existing) {
      return existing;
    }

    const enrollment = await this.prisma.courseEnrollment.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        employeeId: dto.employeeId,
        status: "ENROLLED",
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assignedByUserId: userId
      },
      include: { course: true }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_COURSE_ENROLLED",
      resourceType: "CourseEnrollment",
      resourceId: enrollment.id,
      metadata: { courseId: dto.courseId, employeeId: dto.employeeId }
    });

    return enrollment;
  }

  async listEmployeeEnrollments(
    tenantId: string,
    membershipId: string,
    permissions: PermissionCode[] = [],
    employeeId?: string
  ) {
    const actorEmployeeId = await this.getActorEmployeeId(tenantId, membershipId);
    const targetEmployeeId = employeeId ?? actorEmployeeId;
    this.assertSelfOrManagerScope(targetEmployeeId, actorEmployeeId, permissions);
    await this.assertEmployeeInTenant(tenantId, targetEmployeeId);

    return this.prisma.courseEnrollment.findMany({
      where: { tenantId, employeeId: targetEmployeeId },
      include: {
        course: {
          include: { category: true, modules: { include: { lessons: true } } }
        },
        attempts: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async updateProgress(
    tenantId: string,
    enrollmentId: string,
    dto: z.infer<typeof UpdateProgressSchema>,
    _userId: string,
    membershipId: string,
    permissions: PermissionCode[] = []
  ) {
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: { tenantId, id: enrollmentId }
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment not found: ${enrollmentId}`);
    }
    const actorEmployeeId = await this.getActorEmployeeId(tenantId, membershipId);
    this.assertSelfOrManagerScope(enrollment.employeeId, actorEmployeeId, permissions, "You can only update your own learning progress.");

    const { progressPercent, isCompleted } = LearningEngine.calculateCourseProgress(
      dto.totalLessonsCount,
      dto.completedLessonsCount,
      dto.totalDurationMinutes,
      dto.watchTimeSeconds
    );

    const updated = await this.prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPercent,
        watchTimeSeconds: dto.watchTimeSeconds,
        status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
        completedAt: isCompleted ? new Date() : null,
        isPassed: isCompleted
      }
    });

    return updated;
  }

  // ==========================================
  // 3. LEARNING PATHS
  // ==========================================

  async listLearningPaths(tenantId: string) {
    return this.prisma.learningPath.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        courses: {
          orderBy: { sequenceOrder: "asc" },
          include: { course: true }
        },
        _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createLearningPath(
    tenantId: string,
    dto: z.infer<typeof CreateLearningPathSchema>,
    userId: string,
    membershipId: string
  ) {
    await Promise.all(dto.courseIds.map((courseId) => this.assertCourseInTenant(tenantId, courseId)));

    const existing = await this.prisma.learningPath.findFirst({
      where: { tenantId, slug: dto.slug, deletedAt: null }
    });
    if (existing) {
      throw new BadRequestException(`Learning path with slug '${dto.slug}' already exists.`);
    }

    const path = await this.prisma.learningPath.create({
      data: {
        tenantId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        isMandatory: dto.isMandatory,
        estimatedHours: dto.estimatedHours,
        courses: {
          create: dto.courseIds.map((courseId, idx) => ({
            tenantId,
            courseId,
            sequenceOrder: idx + 1
          }))
        }
      },
      include: { courses: { include: { course: true } } }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_LEARNING_PATH_CREATED",
      resourceType: "LearningPath",
      resourceId: path.id,
      metadata: { name: dto.name, coursesCount: dto.courseIds.length }
    });

    return path;
  }

  // ==========================================
  // 4. ASSESSMENTS & EXAMINATIONS
  // ==========================================

  async listAssessments(tenantId: string, courseId?: string) {
    return this.prisma.assessment.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(courseId ? { courseId } : {})
      },
      include: {
        course: true,
        questions: {
          orderBy: { sequenceOrder: "asc" },
          include: { options: { orderBy: { sequenceOrder: "asc" } } }
        },
        _count: { select: { attempts: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createAssessment(
    tenantId: string,
    dto: z.infer<typeof CreateAssessmentSchema>,
    userId: string,
    membershipId: string
  ) {
    await this.assertCourseInTenant(tenantId, dto.courseId);

    const assessment = await this.prisma.assessment.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        title: dto.title,
        type: dto.type,
        timeLimitMinutes: dto.timeLimitMinutes,
        passingPercent: dto.passingPercent,
        maxAttempts: dto.maxAttempts,
        randomizeQuestions: dto.randomizeQuestions,
        negativeMarking: dto.negativeMarking
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_ASSESSMENT_CREATED",
      resourceType: "Assessment",
      resourceId: assessment.id,
      metadata: { title: dto.title }
    });

    return assessment;
  }

  async addQuestion(
    tenantId: string,
    dto: z.infer<typeof AddAssessmentQuestionSchema>,
    _userId: string,
    _membershipId: string
  ) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { tenantId, id: dto.assessmentId, deletedAt: null }
    });
    if (!assessment) {
      throw new NotFoundException(`Assessment not found: ${dto.assessmentId}`);
    }

    const question = await this.prisma.assessmentQuestion.create({
      data: {
        tenantId,
        assessmentId: dto.assessmentId,
        questionText: dto.questionText,
        questionType: dto.questionType,
        points: dto.points,
        negativePoints: dto.negativePoints,
        explanation: dto.explanation,
        sequenceOrder: dto.sequenceOrder,
        options: {
          create: dto.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            sequenceOrder: opt.sequenceOrder
          }))
        }
      },
      include: { options: true }
    });

    return question;
  }

  async submitAssessment(
    tenantId: string,
    dto: z.infer<typeof SubmitAssessmentAttemptSchema>,
    userId: string,
    membershipId: string,
    permissions: PermissionCode[] = []
  ) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { tenantId, id: dto.assessmentId, deletedAt: null },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });
    if (!assessment) {
      throw new NotFoundException(`Assessment not found: ${dto.assessmentId}`);
    }
    const actorEmployeeId = await this.getActorEmployeeId(tenantId, membershipId);
    this.assertSelfOrManagerScope(dto.employeeId, actorEmployeeId, permissions, "You can only submit assessments for yourself.");
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);

    if (dto.enrollmentId) {
      const enrollment = await this.prisma.courseEnrollment.findFirst({
        where: { tenantId, id: dto.enrollmentId, employeeId: dto.employeeId }
      });
      if (!enrollment) {
        throw new NotFoundException(`Enrollment not found: ${dto.enrollmentId}`);
      }
      if (assessment.courseId && enrollment.courseId !== assessment.courseId) {
        throw new BadRequestException("Assessment enrollment must belong to the same course.");
      }
    }

    const previousAttemptsCount = await this.prisma.assessmentAttempt.count({
      where: { tenantId, assessmentId: dto.assessmentId, employeeId: dto.employeeId }
    });

    if (previousAttemptsCount >= assessment.maxAttempts) {
      throw new BadRequestException(`Maximum attempts (${assessment.maxAttempts}) reached for this assessment.`);
    }

    const gradingResult = LearningEngine.gradeAssessment({
      passingPercent: assessment.passingPercent,
      negativeMarking: assessment.negativeMarking,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        points: q.points,
        negativePoints: q.negativePoints,
        options: q.options.map((o) => ({ id: o.id, isCorrect: o.isCorrect }))
      })),
      answers: dto.answers
    });

    const attempt = await this.prisma.assessmentAttempt.create({
      data: {
        tenantId,
        assessmentId: dto.assessmentId,
        employeeId: dto.employeeId,
        enrollmentId: dto.enrollmentId,
        attemptNumber: previousAttemptsCount + 1,
        scorePercent: gradingResult.scorePercent,
        pointsEarned: gradingResult.pointsEarned,
        pointsPossible: gradingResult.pointsPossible,
        isPassed: gradingResult.isPassed,
        submittedAt: new Date()
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_ASSESSMENT_ATTEMPT_SUBMITTED",
      resourceType: "AssessmentAttempt",
      resourceId: attempt.id,
      metadata: {
        assessmentId: dto.assessmentId,
        scorePercent: gradingResult.scorePercent,
        isPassed: gradingResult.isPassed
      }
    });

    return {
      attempt,
      gradingResult
    };
  }

  // ==========================================
  // 5. CERTIFICATIONS
  // ==========================================

  async listCertifications(tenantId: string) {
    return this.prisma.lmsCertification.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        course: true,
        _count: { select: { employeeCerts: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createCertification(
    tenantId: string,
    dto: z.infer<typeof CreateCertificationSchema>,
    userId: string,
    membershipId: string
  ) {
    await this.assertCourseInTenant(tenantId, dto.courseId);

    const existing = await this.prisma.lmsCertification.findFirst({
      where: { tenantId, code: dto.code, deletedAt: null }
    });
    if (existing) {
      throw new BadRequestException(`Certification code '${dto.code}' already exists.`);
    }

    const cert = await this.prisma.lmsCertification.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        code: dto.code,
        title: dto.title,
        type: dto.type,
        validityMonths: dto.validityMonths,
        issuingAuthority: dto.issuingAuthority,
        badgeImageUrl: dto.badgeImageUrl
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_CERTIFICATION_CREATED",
      resourceType: "LmsCertification",
      resourceId: cert.id,
      metadata: { code: dto.code, title: dto.title }
    });

    return cert;
  }

  async issueCertification(
    tenantId: string,
    dto: z.infer<typeof IssueCertificationSchema>,
    userId: string,
    membershipId: string,
    permissions: PermissionCode[] = []
  ) {
    const cert = await this.prisma.lmsCertification.findFirst({
      where: { tenantId, id: dto.certificationId, deletedAt: null }
    });
    if (!cert) {
      throw new NotFoundException(`Certification not found: ${dto.certificationId}`);
    }
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);
    if (!this.canManageLearning(permissions)) {
      throw new ForbiddenException("Only learning managers can issue certifications.");
    }

    const expiryDate = dto.expiryDate
      ? new Date(dto.expiryDate)
      : new Date(Date.now() + cert.validityMonths * 30 * 24 * 60 * 60 * 1000);

    const issued = await this.prisma.employeeCertification.upsert({
      where: {
        tenantId_certificationId_employeeId: {
          tenantId,
          certificationId: dto.certificationId,
          employeeId: dto.employeeId
        }
      },
      update: {
        certificateNumber: dto.certificateNumber,
        issueDate: new Date(),
        expiryDate,
        status: "ACTIVE",
        scorePercent: dto.scorePercent
      },
      create: {
        tenantId,
        certificationId: dto.certificationId,
        employeeId: dto.employeeId,
        certificateNumber: dto.certificateNumber,
        issueDate: new Date(),
        expiryDate,
        status: "ACTIVE",
        scorePercent: dto.scorePercent
      }
    });

    await this.audit.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "LMS_CERTIFICATION_ISSUED",
      resourceType: "EmployeeCertification",
      resourceId: issued.id,
      metadata: {
        certificationId: dto.certificationId,
        employeeId: dto.employeeId,
        certificateNumber: dto.certificateNumber
      }
    });

    return issued;
  }

  async listEmployeeCertifications(
    tenantId: string,
    membershipId: string,
    permissions: PermissionCode[] = [],
    employeeId?: string
  ) {
    const actorEmployeeId = await this.getActorEmployeeId(tenantId, membershipId);
    const targetEmployeeId = employeeId ?? actorEmployeeId;
    this.assertSelfOrManagerScope(targetEmployeeId, actorEmployeeId, permissions, "You can only access your own certifications.");
    await this.assertEmployeeInTenant(tenantId, targetEmployeeId);

    return this.prisma.employeeCertification.findMany({
      where: {
        tenantId,
        employeeId: targetEmployeeId
      },
      include: {
        certification: true,
        employee: {
          select: { id: true, fullName: true, employeeCode: true, department: true }
        }
      },
      orderBy: { issueDate: "desc" }
    });
  }

  // ==========================================
  // 6. SKILL MATRIX & GAP ANALYSIS
  // ==========================================

  async listSkillCategories(tenantId: string) {
    return this.prisma.skillCategory.findMany({
      where: { tenantId },
      include: { skills: true },
      orderBy: { name: "asc" }
    });
  }

  async createSkillCategory(tenantId: string, dto: z.infer<typeof CreateSkillCategorySchema>) {
    return this.prisma.skillCategory.create({
      data: { tenantId, name: dto.name, slug: dto.slug }
    });
  }

  async listSkills(tenantId: string) {
    return this.prisma.skill.findMany({
      where: { tenantId, deletedAt: null },
      include: { category: true, _count: { select: { employeeSkills: true } } },
      orderBy: { name: "asc" }
    });
  }

  async createSkill(
    tenantId: string,
    dto: z.infer<typeof CreateSkillSchema>,
    _userId: string,
    _membershipId: string
  ) {
    const existing = await this.prisma.skill.findFirst({
      where: { tenantId, code: dto.code, deletedAt: null }
    });
    if (existing) {
      throw new BadRequestException(`Skill code '${dto.code}' already exists.`);
    }

    const skill = await this.prisma.skill.create({
      data: {
        tenantId,
        categoryId: dto.categoryId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        level1Desc: dto.level1Desc,
        level2Desc: dto.level2Desc,
        level3Desc: dto.level3Desc,
        level4Desc: dto.level4Desc,
        level5Desc: dto.level5Desc
      }
    });

    return skill;
  }

  async updateEmployeeSkill(
    tenantId: string,
    dto: z.infer<typeof UpdateEmployeeSkillSchema>,
    userId: string,
    membershipId: string,
    permissions: PermissionCode[] = []
  ) {
    const skill = await this.prisma.skill.findFirst({
      where: { tenantId, id: dto.skillId, deletedAt: null }
    });
    if (!skill) {
      throw new NotFoundException(`Skill not found: ${dto.skillId}`);
    }
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);
    const actorEmployeeId = await this.getActorEmployeeId(tenantId, membershipId);
    this.assertSelfOrManagerScope(dto.employeeId, actorEmployeeId, permissions, "You can only update your own skill profile.");

    const employeeSkill = await this.prisma.employeeSkill.upsert({
      where: {
        tenantId_employeeId_skillId: {
          tenantId,
          employeeId: dto.employeeId,
          skillId: dto.skillId
        }
      },
      update: {
        currentProficiency: dto.currentProficiency,
        targetProficiency: dto.targetProficiency,
        selfRating: dto.selfRating,
        managerRating: dto.managerRating,
        verifiedByUserId: userId,
        verifiedAt: new Date()
      },
      create: {
        tenantId,
        employeeId: dto.employeeId,
        skillId: dto.skillId,
        currentProficiency: dto.currentProficiency,
        targetProficiency: dto.targetProficiency,
        selfRating: dto.selfRating,
        managerRating: dto.managerRating,
        verifiedByUserId: userId,
        verifiedAt: new Date()
      },
      include: { skill: true }
    });

    return employeeSkill;
  }

  async getEmployeeSkillGapReport(
    tenantId: string,
    membershipId: string,
    permissions: PermissionCode[] = [],
    employeeId: string
  ) {
    const actorEmployeeId = await this.getActorEmployeeId(tenantId, membershipId);
    this.assertSelfOrManagerScope(employeeId, actorEmployeeId, permissions, "You can only access your own skill gap report.");
    await this.assertEmployeeInTenant(tenantId, employeeId);

    const employeeSkills = await this.prisma.employeeSkill.findMany({
      where: { tenantId, employeeId },
      include: { skill: { include: { category: true } } }
    });

    const gapDetails = employeeSkills.map((es) => {
      const { gap, readinessScore, status } = LearningEngine.calculateSkillGap(
        es.currentProficiency,
        es.targetProficiency
      );
      return {
        skillId: es.skillId,
        skillName: es.skill.name,
        skillCode: es.skill.code,
        category: es.skill.category?.name ?? "General",
        currentProficiency: es.currentProficiency,
        targetProficiency: es.targetProficiency,
        gap,
        readinessScore,
        status
      };
    });

    const totalReadiness =
      gapDetails.length > 0
        ? Math.round(gapDetails.reduce((sum, g) => sum + g.readinessScore, 0) / gapDetails.length)
        : 100;

    return {
      employeeId,
      totalSkillsAssessed: gapDetails.length,
      averageReadinessPercent: totalReadiness,
      gaps: gapDetails
    };
  }

  // ==========================================
  // 7. INSTRUCTORS & SESSIONS
  // ==========================================

  async listInstructors(tenantId: string) {
    return this.prisma.instructor.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        sessions: {
          include: { course: true, _count: { select: { attendances: true } } }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  async createInstructor(
    tenantId: string,
    dto: z.infer<typeof CreateInstructorSchema>,
    _userId: string,
    _membershipId: string
  ) {
    return this.prisma.instructor.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        name: dto.name,
        email: dto.email,
        bio: dto.bio,
        isExternal: dto.isExternal
      }
    });
  }

  async listSessions(tenantId: string) {
    return this.prisma.trainingSession.findMany({
      where: { tenantId },
      include: {
        course: true,
        instructor: true,
        _count: { select: { attendances: true } }
      },
      orderBy: { sessionDate: "asc" }
    });
  }

  async createSession(
    tenantId: string,
    dto: z.infer<typeof CreateTrainingSessionSchema>,
    _userId: string,
    _membershipId: string
  ) {
    const session = await this.prisma.trainingSession.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        instructorId: dto.instructorId,
        title: dto.title,
        sessionDate: new Date(dto.sessionDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        locationOrUrl: dto.locationOrUrl,
        maxAttendees: dto.maxAttendees
      },
      include: { course: true, instructor: true }
    });

    return session;
  }

  async recordAttendance(
    tenantId: string,
    dto: z.infer<typeof RecordSessionAttendanceSchema>,
    _userId: string,
    _membershipId: string
  ) {
    return this.prisma.sessionAttendance.upsert({
      where: {
        tenantId_sessionId_employeeId: {
          tenantId,
          sessionId: dto.sessionId,
          employeeId: dto.employeeId
        }
      },
      update: {
        attended: dto.attended,
        checkInTime: dto.attended ? new Date() : null,
        feedbackRating: dto.feedbackRating,
        feedbackNotes: dto.feedbackNotes
      },
      create: {
        tenantId,
        sessionId: dto.sessionId,
        employeeId: dto.employeeId,
        attended: dto.attended,
        checkInTime: dto.attended ? new Date() : null,
        feedbackRating: dto.feedbackRating,
        feedbackNotes: dto.feedbackNotes
      }
    });
  }

  // ==========================================
  // 8. LMS ANALYTICS & AI RECOMMENDATIONS
  // ==========================================

  async getLmsAnalytics(tenantId: string) {
    const [
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      activeCertifications,
      totalSkillsAssessed,
      complianceEnrollments,
      completedComplianceEnrollments,
      learningWatchTime
    ] = await Promise.all([
      this.prisma.trainingCourse.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.courseEnrollment.count({ where: { tenantId } }),
      this.prisma.courseEnrollment.count({ where: { tenantId, status: "COMPLETED" } }),
      this.prisma.employeeCertification.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.employeeSkill.count({ where: { tenantId } }),
      this.prisma.courseEnrollment.count({
        where: { tenantId, course: { isCompliance: true, deletedAt: null } }
      }),
      this.prisma.courseEnrollment.count({
        where: { tenantId, status: "COMPLETED", course: { isCompliance: true, deletedAt: null } }
      }),
      this.prisma.courseEnrollment.aggregate({
        where: { tenantId },
        _sum: { watchTimeSeconds: true }
      })
    ]);

    const completionRatePercent =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 1000) / 10 : 0;
    const complianceCoveragePercent =
      complianceEnrollments > 0 ? Math.round((completedComplianceEnrollments / complianceEnrollments) * 1000) / 10 : 0;
    const learningHoursLogged = Math.round(((learningWatchTime._sum.watchTimeSeconds ?? 0) / 3600) * 10) / 10;

    return {
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      completionRatePercent,
      activeCertifications,
      totalSkillsAssessed,
      complianceCoveragePercent,
      learningHoursLogged
    };
  }

  async getAiLearningRecommendations(tenantId: string, employeeId?: string) {
    if (!employeeId) {
      return {
        employeeId: null,
        recommendedCount: 0,
        recommendations: []
      };
    }

    const employee = await this.prisma.employee.findFirst({
      where: { tenantId, id: employeeId, archivedAt: null },
      select: { departmentId: true, designationId: true }
    });
    if (!employee) {
      throw new NotFoundException(`Employee not found: ${employeeId}`);
    }

    const employeeSkills = await this.prisma.employeeSkill.findMany({
      where: { tenantId, employeeId },
      select: { currentProficiency: true, targetProficiency: true }
    });
    const skillGapsCount = employeeSkills.filter((skill) => skill.currentProficiency < skill.targetProficiency).length;

    const courses = await this.prisma.trainingCourse.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      take: 10
    });

    const recommendations = courses.map((c) => {
      const matchScore = LearningEngine.scoreCourseForEmployee(
        {
          id: c.id,
          title: c.title,
          isCompliance: c.isCompliance,
          isMandatory: c.isMandatory,
          departmentId: c.departmentId,
          designationId: c.designationId
        },
        {
          departmentId: employee.departmentId,
          designationId: employee.designationId,
          skillGapsCount
        }
      );

      return {
        courseId: c.id,
        courseTitle: c.title,
        courseCode: c.code,
        difficulty: c.difficulty,
        isCompliance: c.isCompliance,
        estimatedDurationMinutes: c.estimatedDurationMinutes,
        matchScorePercent: matchScore,
        reason: c.isCompliance
          ? "Compliance course available for the employee."
          : "Matched from recorded department, designation, and skill gap signals."
      };
    });

    recommendations.sort((a, b) => b.matchScorePercent - a.matchScorePercent);

    return {
      employeeId,
      recommendedCount: recommendations.length,
      recommendations
    };
  }
}
