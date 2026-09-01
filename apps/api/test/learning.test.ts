import { describe, expect, it } from "vitest";
import { LearningEngine } from "../src/modules/learning/learning.engine.js";
import {
  CreateTrainingCourseSchema,
  CreateAssessmentSchema,
  AddAssessmentQuestionSchema,
  UpdateProgressSchema,
  CreateCertificationSchema,
  CreateSkillSchema
} from "../src/modules/learning/learning.schemas.js";
import { collectPermissions, hasPermission } from "@vc-wms/auth";

describe("TASK 27 — LMS & Learning Management Engine Test Suite", () => {
  // ==========================================
  // 1. COURSE PROGRESS ENGINE
  // ==========================================
  describe("LearningEngine.calculateCourseProgress", () => {
    it("should calculate 0% progress when no lessons are completed", () => {
      const result = LearningEngine.calculateCourseProgress(4, 0, 60, 0);
      expect(result.progressPercent).toBe(0);
      expect(result.isCompleted).toBe(false);
    });

    it("should calculate 100% progress and mark completed when all lessons are finished", () => {
      const result = LearningEngine.calculateCourseProgress(4, 4, 60, 3600);
      expect(result.progressPercent).toBe(100);
      expect(result.isCompleted).toBe(true);
    });

    it("should compute weighted progress correctly for partial lesson completion", () => {
      const result = LearningEngine.calculateCourseProgress(4, 2, 60, 1800);
      // 50% lesson ratio * 70% + 50% time ratio * 30% = 50%
      expect(result.progressPercent).toBe(50);
      expect(result.isCompleted).toBe(false);
    });

    it("should handle courses with 0 lessons gracefully", () => {
      const result = LearningEngine.calculateCourseProgress(0, 0, 0, 0);
      expect(result.progressPercent).toBe(100);
      expect(result.isCompleted).toBe(true);
    });
  });

  // ==========================================
  // 2. ASSESSMENT GRADING ENGINE
  // ==========================================
  describe("LearningEngine.gradeAssessment", () => {
    const mockQuestions = [
      {
        id: "q1",
        points: 2,
        negativePoints: 0.5,
        options: [
          { id: "opt1", isCorrect: true },
          { id: "opt2", isCorrect: false }
        ]
      },
      {
        id: "q2",
        points: 3,
        negativePoints: 1.0,
        options: [
          { id: "opt3", isCorrect: true },
          { id: "opt4", isCorrect: true },
          { id: "opt5", isCorrect: false }
        ]
      }
    ];

    it("should score 100% when all answers are correct", () => {
      const result = LearningEngine.gradeAssessment({
        passingPercent: 70,
        negativeMarking: false,
        questions: mockQuestions,
        answers: [
          { questionId: "q1", selectedOptionIds: ["opt1"] },
          { questionId: "q2", selectedOptionIds: ["opt3", "opt4"] }
        ]
      });

      expect(result.scorePercent).toBe(100);
      expect(result.pointsEarned).toBe(5);
      expect(result.pointsPossible).toBe(5);
      expect(result.isPassed).toBe(true);
      expect(result.correctAnswersCount).toBe(2);
      expect(result.incorrectAnswersCount).toBe(0);
    });

    it("should fail when score is below passing percent", () => {
      const result = LearningEngine.gradeAssessment({
        passingPercent: 80,
        negativeMarking: false,
        questions: mockQuestions,
        answers: [
          { questionId: "q1", selectedOptionIds: ["opt1"] }, // 2 points
          { questionId: "q2", selectedOptionIds: ["opt5"] } // wrong
        ]
      });

      expect(result.scorePercent).toBe(40);
      expect(result.pointsEarned).toBe(2);
      expect(result.isPassed).toBe(false);
      expect(result.correctAnswersCount).toBe(1);
      expect(result.incorrectAnswersCount).toBe(1);
    });

    it("should apply negative marking deductions when configured", () => {
      const result = LearningEngine.gradeAssessment({
        passingPercent: 50,
        negativeMarking: true,
        questions: mockQuestions,
        answers: [
          { questionId: "q1", selectedOptionIds: ["opt1"] }, // +2
          { questionId: "q2", selectedOptionIds: ["opt5"] } // -1.0
        ]
      });

      expect(result.pointsEarned).toBe(1.0); // 2 - 1 = 1
      expect(result.scorePercent).toBe(20);
      expect(result.isPassed).toBe(false);
    });

    it("should not penalize unanswered questions with negative marking", () => {
      const result = LearningEngine.gradeAssessment({
        passingPercent: 40,
        negativeMarking: true,
        questions: mockQuestions,
        answers: [
          { questionId: "q1", selectedOptionIds: ["opt1"] } // +2, q2 skipped
        ]
      });

      expect(result.pointsEarned).toBe(2.0);
      expect(result.scorePercent).toBe(40);
      expect(result.isPassed).toBe(true);
    });
  });

  // ==========================================
  // 3. SKILL GAP ENGINE
  // ==========================================
  describe("LearningEngine.calculateSkillGap", () => {
    it("should identify MASTERED skill when current proficiency exceeds target", () => {
      const result = LearningEngine.calculateSkillGap(5, 4);
      expect(result.gap).toBe(0);
      expect(result.readinessScore).toBe(100);
      expect(result.status).toBe("MASTERED");
    });

    it("should identify PROFICIENT skill when current equals target", () => {
      const result = LearningEngine.calculateSkillGap(3, 3);
      expect(result.gap).toBe(0);
      expect(result.readinessScore).toBe(100);
      expect(result.status).toBe("PROFICIENT");
    });

    it("should identify DEVELOPING skill when gap is 1", () => {
      const result = LearningEngine.calculateSkillGap(3, 4);
      expect(result.gap).toBe(1);
      expect(result.readinessScore).toBe(75);
      expect(result.status).toBe("DEVELOPING");
    });

    it("should identify NEEDS_TRAINING skill when gap is 2 or more", () => {
      const result = LearningEngine.calculateSkillGap(2, 5);
      expect(result.gap).toBe(3);
      expect(result.readinessScore).toBe(40);
      expect(result.status).toBe("NEEDS_TRAINING");
    });
  });

  // ==========================================
  // 4. CERTIFICATION STATUS & EXPIRY ENGINE
  // ==========================================
  describe("LearningEngine.evaluateCertificationStatus", () => {
    const fixedNow = new Date("2026-09-01T00:00:00Z");

    it("should return ACTIVE for certifications with distant expiry", () => {
      const expiry = new Date("2027-09-01T00:00:00Z");
      const result = LearningEngine.evaluateCertificationStatus(expiry, fixedNow);
      expect(result.status).toBe("ACTIVE");
      expect(result.daysRemaining).toBeGreaterThan(300);
    });

    it("should return EXPIRING_SOON for certifications within 30 days of expiry", () => {
      const expiry = new Date("2026-09-20T00:00:00Z");
      const result = LearningEngine.evaluateCertificationStatus(expiry, fixedNow);
      expect(result.status).toBe("EXPIRING_SOON");
      expect(result.daysRemaining).toBeLessThanOrEqual(30);
      expect(result.daysRemaining).toBeGreaterThan(0);
    });

    it("should return EXPIRED for past expiration dates", () => {
      const expiry = new Date("2026-08-15T00:00:00Z");
      const result = LearningEngine.evaluateCertificationStatus(expiry, fixedNow);
      expect(result.status).toBe("EXPIRED");
      expect(result.daysRemaining).toBeLessThanOrEqual(0);
    });

    it("should treat null expiry as perpetual ACTIVE", () => {
      const result = LearningEngine.evaluateCertificationStatus(null, fixedNow);
      expect(result.status).toBe("ACTIVE");
    });
  });

  // ==========================================
  // 5. AI COURSE RECOMMENDATION SCORING
  // ==========================================
  describe("LearningEngine.scoreCourseForEmployee", () => {
    it("should prioritize mandatory and compliance courses highest", () => {
      const score = LearningEngine.scoreCourseForEmployee(
        {
          id: "c1",
          title: "POSH Compliance",
          isCompliance: true,
          isMandatory: true,
          departmentId: null,
          designationId: null
        },
        {
          departmentId: "dept-1",
          designationId: "desig-1",
          skillGapsCount: 0
        }
      );

      expect(score).toBeGreaterThanOrEqual(90);
    });

    it("should grant department and designation matching bonuses", () => {
      const score = LearningEngine.scoreCourseForEmployee(
        {
          id: "c2",
          title: "Advanced Warehouse Operations",
          isCompliance: false,
          isMandatory: false,
          departmentId: "dept-ops",
          designationId: "desig-sup"
        },
        {
          departmentId: "dept-ops",
          designationId: "desig-sup",
          skillGapsCount: 2
        }
      );

      // Base 50 + 25 dept + 20 desig + 10 gaps = 100 max
      expect(score).toBe(100);
    });
  });

  // ==========================================
  // 6. ZOD SCHEMA VALIDATION
  // ==========================================
  describe("LMS Zod Schemas Validation", () => {
    it("should parse valid CreateTrainingCourseSchema", () => {
      const parsed = CreateTrainingCourseSchema.parse({
        code: "COMP-101",
        title: "Good Manufacturing Practices",
        slug: "good-manufacturing-practices",
        deliveryType: "SELF_PACED",
        difficulty: "BEGINNER",
        estimatedDurationMinutes: 60,
        passingScorePercent: 80,
        isMandatory: true,
        isCompliance: true
      });

      expect(parsed.code).toBe("COMP-101");
      expect(parsed.passingScorePercent).toBe(80);
    });

    it("should parse valid CreateAssessmentSchema", () => {
      const parsed = CreateAssessmentSchema.parse({
        title: "GMP Cleanroom Assessment",
        type: "FINAL_EXAM",
        timeLimitMinutes: 30,
        passingPercent: 75,
        maxAttempts: 3
      });

      expect(parsed.passingPercent).toBe(75);
      expect(parsed.maxAttempts).toBe(3);
    });

    it("should parse valid AddAssessmentQuestionSchema with options", () => {
      const parsed = AddAssessmentQuestionSchema.parse({
        assessmentId: "a0000000-0000-0000-0000-000000000001",
        questionText: "What is the minimum handwashing duration in cleanrooms?",
        points: 2.0,
        options: [
          { optionText: "20 seconds with antibacterial soap", isCorrect: true },
          { optionText: "5 seconds with water", isCorrect: false }
        ]
      });

      expect(parsed.options).toHaveLength(2);
    });

    it("should validate UpdateProgressSchema", () => {
      const parsed = UpdateProgressSchema.parse({
        completedLessonsCount: 3,
        totalLessonsCount: 4,
        totalDurationMinutes: 60,
        watchTimeSeconds: 2700
      });

      expect(parsed.completedLessonsCount).toBe(3);
    });

    it("should validate CreateCertificationSchema", () => {
      const parsed = CreateCertificationSchema.parse({
        code: "CERT-GMP-2026",
        title: "GMP Certified Specialist",
        type: "COMPLIANCE",
        validityMonths: 12
      });

      expect(parsed.code).toBe("CERT-GMP-2026");
    });

    it("should validate CreateSkillSchema", () => {
      const parsed = CreateSkillSchema.parse({
        name: "Distributed Systems Architecture",
        code: "TECH_SYS_ARCH",
        description: "Designing fault-tolerant multi-tenant backends"
      });

      expect(parsed.code).toBe("TECH_SYS_ARCH");
    });
  });

  // ==========================================
  // 7. RBAC & TENANT PERMISSIONS
  // ==========================================
  describe("LMS RBAC Permissions Mapping", () => {
    it("should grant full LMS manage permissions to TENANT_OWNER and TENANT_ADMIN", () => {
      const ownerPerms = collectPermissions(["TENANT_OWNER"]);
      const adminPerms = collectPermissions(["TENANT_ADMIN"]);

      expect(hasPermission(ownerPerms, "lms.manage")).toBe(true);
      expect(hasPermission(ownerPerms, "lms.analytics")).toBe(true);
      expect(hasPermission(adminPerms, "lms.manage")).toBe(true);
      expect(hasPermission(adminPerms, "lms.compliance")).toBe(true);
    });

    it("should grant student learning permissions to EMPLOYEE role", () => {
      const empPerms = collectPermissions(["EMPLOYEE"]);

      expect(hasPermission(empPerms, "lms.view")).toBe(true);
      expect(hasPermission(empPerms, "lms.enroll")).toBe(true);
      expect(hasPermission(empPerms, "lms.assess")).toBe(true);
      expect(hasPermission(empPerms, "lms.certifications")).toBe(true);
      expect(hasPermission(empPerms, "lms.skills")).toBe(true);
      expect(hasPermission(empPerms, "lms.manage")).toBe(false);
    });
  });
});
