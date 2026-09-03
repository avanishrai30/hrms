import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LearningService } from "../src/modules/learning/learning.service.js";
import { PerformanceService } from "../src/modules/performance/performance.service.js";

const tenantId = "00000000-0000-0000-0000-000000000001";
const membershipId = "00000000-0000-0000-0000-000000000002";
const userId = "00000000-0000-0000-0000-000000000003";
const actorEmployeeId = "00000000-0000-0000-0000-000000000004";
const reportEmployeeId = "00000000-0000-0000-0000-000000000005";
const otherEmployeeId = "00000000-0000-0000-0000-000000000006";
const courseId = "00000000-0000-0000-0000-000000000007";
const reviewId = "00000000-0000-0000-0000-000000000008";

type MockPrisma = Record<string, Record<string, ReturnType<typeof vi.fn>>>;

function buildPerformanceService(prisma: Record<string, unknown>) {
  return new PerformanceService(
    prisma as never,
    { record: vi.fn() } as never,
    {
      calculateGoalProgress: vi.fn(() => 0),
      calculateKeyResultProgress: vi.fn(() => 0)
    } as never,
    {
      calculate360AppraisalScore: vi.fn(() => ({
        finalScore: 4,
        ratingLabel: "MEETS_EXPECTATIONS",
        scoreBreakdown: { peerScore: 0, skipLevelScore: 0, crossFunctionalScore: 0 }
      }))
    } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never
  );
}

function buildLearningService(prisma: Record<string, unknown>) {
  return new LearningService(prisma as never, { record: vi.fn() } as never);
}

describe("Task 06 performance security boundaries", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = {
      tenantMembership: {
        findFirst: vi.fn().mockResolvedValue({ employeeId: actorEmployeeId })
      },
      employee: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.id === reportEmployeeId) return Promise.resolve({ id: reportEmployeeId, managerEmployeeId: actorEmployeeId });
          if (where.id === actorEmployeeId) return Promise.resolve({ id: actorEmployeeId, managerEmployeeId: null });
          if (where.id === otherEmployeeId) return Promise.resolve({ id: otherEmployeeId, managerEmployeeId: null });
          return Promise.resolve(null);
        })
      },
      goalCycle: {
        findFirst: vi.fn().mockResolvedValue({ id: "cycle-id" })
      },
      goal: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "goal-id", ...data }))
      },
      feedback: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "feedback-id", ...data }))
      },
      performanceReview: {
        findFirst: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: reviewId })
      },
      performanceReviewScore: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({ id: "score-id" }),
        findMany: vi.fn().mockResolvedValue([])
      },
      employeeCompetencyRating: {
        upsert: vi.fn()
      }
    };
  });

  it("creates self goals with the employee linked to the active membership, not the membership id", async () => {
    const service = buildPerformanceService(prisma);

    await service.createGoal(
      tenantId,
      {
        cycleId: "cycle-id",
        title: "Improve onboarding quality",
        category: "OKR",
        weightage: 20,
        targetValue: 100,
        achievedValue: 0
      },
      userId,
      membershipId,
      ["performance.review"]
    );

    expect(prisma.goal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ employeeId: actorEmployeeId })
      })
    );
  });

  it("blocks non-manager users from creating goals for another employee", async () => {
    const service = buildPerformanceService(prisma);

    await expect(
      service.createGoal(
        tenantId,
        {
          cycleId: "cycle-id",
          employeeId: otherEmployeeId,
          title: "Unauthorized goal",
          category: "OKR",
          weightage: 20,
          targetValue: 100,
          achievedValue: 0
        },
        userId,
        membershipId,
        ["performance.review"]
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects manager reviews submitted by someone outside the reporting relationship", async () => {
    prisma.performanceReview.findFirst.mockResolvedValue({
      id: reviewId,
      tenantId,
      employeeId: otherEmployeeId,
      isLocked: false,
      employee: { id: otherEmployeeId, managerEmployeeId: reportEmployeeId },
      raterScores: []
    });
    const service = buildPerformanceService(prisma);

    await expect(
      service.submitManagerReview(
        tenantId,
        reviewId,
        { managerScore: 4, managerComments: "Strong delivery" },
        userId,
        membershipId,
        ["performance.review"]
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("records the actual manager employee as rater when the direct manager submits a review", async () => {
    prisma.performanceReview.findFirst.mockResolvedValue({
      id: reviewId,
      tenantId,
      employeeId: reportEmployeeId,
      isLocked: false,
      employee: { id: reportEmployeeId, managerEmployeeId: actorEmployeeId },
      raterScores: []
    });
    const service = buildPerformanceService(prisma);

    await service.submitManagerReview(
      tenantId,
      reviewId,
      { managerScore: 4, managerComments: "Strong delivery" },
      userId,
      membershipId,
      ["performance.review"]
    );

    expect(prisma.performanceReviewScore.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ raterId: actorEmployeeId, raterType: "MANAGER" })
      })
    );
  });

  it("rejects feedback addressed to an employee outside the tenant", async () => {
    prisma.employee.findFirst.mockResolvedValueOnce(null);
    const service = buildPerformanceService(prisma);

    await expect(
      service.createFeedback(
        tenantId,
        {
          toEmployeeId: otherEmployeeId,
          category: "PEER_FEEDBACK",
          visibility: "EMPLOYEE_VISIBLE"
        },
        userId,
        membershipId
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe("Task 06 learning security boundaries", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = {
      tenantMembership: {
        findFirst: vi.fn().mockResolvedValue({ employeeId: actorEmployeeId })
      },
      employee: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.id === actorEmployeeId || where.id === otherEmployeeId) return Promise.resolve({ id: where.id });
          return Promise.resolve(null);
        })
      },
      trainingCourse: {
        findFirst: vi.fn().mockResolvedValue({ id: courseId })
      },
      courseEnrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "enrollment-id", ...data })),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn()
      },
      assessment: {
        findFirst: vi.fn()
      },
      assessmentAttempt: {
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn()
      }
    };
  });

  it("blocks employee self-service enrollment for another employee", async () => {
    const service = buildLearningService(prisma);

    await expect(
      service.enrollCourse(
        tenantId,
        { courseId, employeeId: otherEmployeeId },
        userId,
        membershipId,
        ["lms.enroll"]
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("defaults my enrollments to the actor employee from membership", async () => {
    const service = buildLearningService(prisma);

    await service.listEmployeeEnrollments(tenantId, membershipId, ["lms.view"]);

    expect(prisma.courseEnrollment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId, employeeId: actorEmployeeId }
      })
    );
  });

  it("blocks progress updates for enrollments owned by another employee", async () => {
    prisma.courseEnrollment.findFirst.mockResolvedValue({ id: "enrollment-id", tenantId, employeeId: otherEmployeeId });
    const service = buildLearningService(prisma);

    await expect(
      service.updateProgress(
        tenantId,
        "enrollment-id",
        { completedLessonsCount: 1, totalLessonsCount: 2, totalDurationMinutes: 20, watchTimeSeconds: 600 },
        userId,
        membershipId,
        ["lms.enroll"]
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects assessment submissions when the enrollment belongs to a different course", async () => {
    prisma.assessment.findFirst.mockResolvedValue({
      id: "assessment-id",
      tenantId,
      courseId,
      maxAttempts: 3,
      passingPercent: 70,
      negativeMarking: false,
      questions: []
    });
    prisma.courseEnrollment.findFirst.mockResolvedValue({
      id: "enrollment-id",
      tenantId,
      employeeId: actorEmployeeId,
      courseId: "00000000-0000-0000-0000-000000000099"
    });
    const service = buildLearningService(prisma);

    await expect(
      service.submitAssessment(
        tenantId,
        {
          assessmentId: "assessment-id",
          employeeId: actorEmployeeId,
          enrollmentId: "enrollment-id",
          answers: []
        },
        userId,
        membershipId,
        ["lms.assess"]
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
