import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import type { Request } from "express";
import { LearningService } from "./learning.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
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

@Controller("api/v1/learning")
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // ==========================================
  // 1. TRAINING CATEGORIES & COURSES
  // ==========================================

  @Get("categories")
  @RequirePermissions("lms.view")
  async listCategories(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.listCategories(tenant.tenantId);
  }

  @Post("categories")
  @RequirePermissions("lms.manage")
  async createCategory(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateTrainingCategorySchema.parse(body);
    return this.learningService.createCategory(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("courses")
  @RequirePermissions("lms.view")
  async listCourses(
    @Req() req: Request,
    @Query("categoryId") categoryId?: string,
    @Query("isCompliance") isCompliance?: string,
    @Query("difficulty") difficulty?: string,
    @Query("search") search?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.learningService.listCourses(tenant.tenantId, {
      categoryId,
      isCompliance: isCompliance ? isCompliance === "true" : undefined,
      difficulty,
      search
    });
  }

  @Get("courses/:id")
  @RequirePermissions("lms.view")
  async getCourse(@Req() req: Request, @Param("id") id: string) {
    const tenant = requireTenantContext(req);
    return this.learningService.getCourse(tenant.tenantId, id);
  }

  @Post("courses")
  @RequirePermissions("lms.manage")
  async createCourse(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateTrainingCourseSchema.parse(body);
    return this.learningService.createCourse(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("modules")
  @RequirePermissions("lms.manage")
  async createModule(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateCourseModuleSchema.parse(body);
    return this.learningService.createModule(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("lessons")
  @RequirePermissions("lms.manage")
  async createLesson(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateLessonSchema.parse(body);
    return this.learningService.createLesson(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 2. ENROLLMENTS & PROGRESS
  // ==========================================

  @Post("enrollments")
  @RequirePermissions("lms.enroll")
  async enrollCourse(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = EnrollCourseSchema.parse(body);
    return this.learningService.enrollCourse(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("enrollments/my")
  @RequirePermissions("lms.view")
  async getMyEnrollments(@Req() req: Request, @Query("employeeId") employeeId?: string) {
    const tenant = requireTenantContext(req);
    const targetEmployeeId = employeeId ?? tenant.userId;
    return this.learningService.listEmployeeEnrollments(tenant.tenantId, targetEmployeeId);
  }

  @Put("enrollments/:id/progress")
  @RequirePermissions("lms.enroll")
  async updateProgress(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdateProgressSchema.parse(body);
    return this.learningService.updateProgress(tenant.tenantId, id, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 3. LEARNING PATHS
  // ==========================================

  @Get("learning-paths")
  @RequirePermissions("lms.view")
  async listLearningPaths(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.listLearningPaths(tenant.tenantId);
  }

  @Post("learning-paths")
  @RequirePermissions("lms.manage")
  async createLearningPath(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateLearningPathSchema.parse(body);
    return this.learningService.createLearningPath(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 4. ASSESSMENTS
  // ==========================================

  @Get("assessments")
  @RequirePermissions("lms.assess")
  async listAssessments(@Req() req: Request, @Query("courseId") courseId?: string) {
    const tenant = requireTenantContext(req);
    return this.learningService.listAssessments(tenant.tenantId, courseId);
  }

  @Post("assessments")
  @RequirePermissions("lms.manage")
  async createAssessment(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateAssessmentSchema.parse(body);
    return this.learningService.createAssessment(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("assessments/questions")
  @RequirePermissions("lms.manage")
  async addQuestion(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = AddAssessmentQuestionSchema.parse(body);
    return this.learningService.addQuestion(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("assessments/submit")
  @RequirePermissions("lms.assess")
  async submitAssessment(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = SubmitAssessmentAttemptSchema.parse(body);
    return this.learningService.submitAssessment(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 5. CERTIFICATIONS
  // ==========================================

  @Get("certifications")
  @RequirePermissions("lms.certifications")
  async listCertifications(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.listCertifications(tenant.tenantId);
  }

  @Post("certifications")
  @RequirePermissions("lms.manage")
  async createCertification(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateCertificationSchema.parse(body);
    return this.learningService.createCertification(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("certifications/issue")
  @RequirePermissions("lms.manage")
  async issueCertification(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = IssueCertificationSchema.parse(body);
    return this.learningService.issueCertification(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("certifications/employee")
  @RequirePermissions("lms.certifications")
  async listEmployeeCertifications(@Req() req: Request, @Query("employeeId") employeeId?: string) {
    const tenant = requireTenantContext(req);
    return this.learningService.listEmployeeCertifications(tenant.tenantId, employeeId);
  }

  // ==========================================
  // 6. SKILLS & GAP ANALYSIS
  // ==========================================

  @Get("skills/categories")
  @RequirePermissions("lms.skills")
  async listSkillCategories(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.listSkillCategories(tenant.tenantId);
  }

  @Post("skills/categories")
  @RequirePermissions("lms.manage")
  async createSkillCategory(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateSkillCategorySchema.parse(body);
    return this.learningService.createSkillCategory(tenant.tenantId, dto);
  }

  @Get("skills")
  @RequirePermissions("lms.skills")
  async listSkills(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.listSkills(tenant.tenantId);
  }

  @Post("skills")
  @RequirePermissions("lms.manage")
  async createSkill(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateSkillSchema.parse(body);
    return this.learningService.createSkill(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("skills/employee")
  @RequirePermissions("lms.skills")
  async updateEmployeeSkill(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = UpdateEmployeeSkillSchema.parse(body);
    return this.learningService.updateEmployeeSkill(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("skills/gap-report")
  @RequirePermissions("lms.skills")
  async getSkillGapReport(@Req() req: Request, @Query("employeeId") employeeId: string) {
    const tenant = requireTenantContext(req);
    return this.learningService.getEmployeeSkillGapReport(tenant.tenantId, employeeId);
  }

  // ==========================================
  // 7. INSTRUCTORS & SESSIONS
  // ==========================================

  @Get("instructors")
  @RequirePermissions("lms.instructors")
  async listInstructors(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.listInstructors(tenant.tenantId);
  }

  @Post("instructors")
  @RequirePermissions("lms.manage")
  async createInstructor(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateInstructorSchema.parse(body);
    return this.learningService.createInstructor(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Get("sessions")
  @RequirePermissions("lms.view")
  async listSessions(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.listSessions(tenant.tenantId);
  }

  @Post("sessions")
  @RequirePermissions("lms.manage")
  async createSession(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = CreateTrainingSessionSchema.parse(body);
    return this.learningService.createSession(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  @Post("sessions/attendance")
  @RequirePermissions("lms.manage")
  async recordAttendance(@Req() req: Request, @Body() body: unknown) {
    const tenant = requireTenantContext(req);
    const dto = RecordSessionAttendanceSchema.parse(body);
    return this.learningService.recordAttendance(tenant.tenantId, dto, tenant.userId, tenant.membershipId);
  }

  // ==========================================
  // 8. LMS ANALYTICS & AI RECOMMENDATIONS
  // ==========================================

  @Get("analytics")
  @RequirePermissions("lms.analytics")
  async getAnalytics(@Req() req: Request) {
    const tenant = requireTenantContext(req);
    return this.learningService.getLmsAnalytics(tenant.tenantId);
  }

  @Get("ai/recommendations")
  @RequirePermissions("lms.view")
  async getAiRecommendations(@Req() req: Request, @Query("employeeId") employeeId?: string) {
    const tenant = requireTenantContext(req);
    return this.learningService.getAiLearningRecommendations(tenant.tenantId, employeeId);
  }
}
