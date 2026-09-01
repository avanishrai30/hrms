/**
 * TASK 27 — LMS ENGINES
 * High-performance pure calculation engines for Course Progress, Assessment Scoring,
 * Skill Gap Analysis, Certification Expiry, and AI Learning Recommendations.
 */

export interface AssessmentGradingInput {
  passingPercent: number;
  negativeMarking: boolean;
  questions: Array<{
    id: string;
    points: number;
    negativePoints: number;
    options: Array<{
      id: string;
      isCorrect: boolean;
    }>;
  }>;
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
  }>;
}

export interface AssessmentGradingResult {
  scorePercent: number;
  pointsEarned: number;
  pointsPossible: number;
  isPassed: boolean;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
}

export class LearningEngine {
  /**
   * Calculate course progress percentage based on completed lessons and watch time.
   */
  static calculateCourseProgress(
    totalLessons: number,
    completedLessons: number,
    totalDurationMinutes: number,
    watchTimeSeconds: number
  ): { progressPercent: number; isCompleted: boolean } {
    if (totalLessons === 0) {
      return { progressPercent: 100, isCompleted: true };
    }

    const lessonRatio = Math.min(1, completedLessons / totalLessons);
    const durationSeconds = totalDurationMinutes * 60;
    const timeRatio = durationSeconds > 0 ? Math.min(1, watchTimeSeconds / durationSeconds) : lessonRatio;

    // Weighted 70% lesson count, 30% watch time
    const rawProgress = (lessonRatio * 0.7 + timeRatio * 0.3) * 100;
    const progressPercent = Math.min(100, Math.round(rawProgress * 10) / 10);
    const isCompleted = completedLessons >= totalLessons && progressPercent >= 90;

    return { progressPercent, isCompleted };
  }

  /**
   * Grade an assessment attempt against question answers and points schema.
   */
  static gradeAssessment(input: AssessmentGradingInput): AssessmentGradingResult {
    let pointsPossible = 0;
    let pointsEarned = 0;
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;

    const answerMap = new Map(input.answers.map((a) => [a.questionId, new Set(a.selectedOptionIds)]));

    for (const q of input.questions) {
      pointsPossible += q.points;
      const userSelected = answerMap.get(q.id) ?? new Set<string>();

      const correctOptionIds = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));

      const isExactMatch =
        correctOptionIds.size === userSelected.size &&
        Array.from(correctOptionIds).every((id) => userSelected.has(id));

      if (isExactMatch && correctOptionIds.size > 0) {
        pointsEarned += q.points;
        correctAnswersCount += 1;
      } else if (userSelected.size > 0) {
        incorrectAnswersCount += 1;
        if (input.negativeMarking && q.negativePoints > 0) {
          pointsEarned = Math.max(0, pointsEarned - q.negativePoints);
        }
      }
    }

    const scorePercent =
      pointsPossible > 0 ? Math.min(100, Math.round((pointsEarned / pointsPossible) * 1000) / 10) : 0;
    const isPassed = scorePercent >= input.passingPercent;

    return {
      scorePercent,
      pointsEarned: Math.round(pointsEarned * 10) / 10,
      pointsPossible: Math.round(pointsPossible * 10) / 10,
      isPassed,
      correctAnswersCount,
      incorrectAnswersCount
    };
  }

  /**
   * Calculate Skill Gap between employee current proficiency and target expectations.
   */
  static calculateSkillGap(
    currentProficiency: number,
    targetProficiency: number
  ): { gap: number; readinessScore: number; status: "MASTERED" | "PROFICIENT" | "DEVELOPING" | "NEEDS_TRAINING" } {
    const gap = Math.max(0, targetProficiency - currentProficiency);
    const ratio = targetProficiency > 0 ? Math.min(1, currentProficiency / targetProficiency) : 1;
    const readinessScore = Math.round(ratio * 100);

    let status: "MASTERED" | "PROFICIENT" | "DEVELOPING" | "NEEDS_TRAINING";
    if (currentProficiency >= targetProficiency) {
      status = currentProficiency > targetProficiency ? "MASTERED" : "PROFICIENT";
    } else if (gap === 1) {
      status = "DEVELOPING";
    } else {
      status = "NEEDS_TRAINING";
    }

    return { gap, readinessScore, status };
  }

  /**
   * Determine certification expiry status and renewal urgency.
   */
  static evaluateCertificationStatus(
    expiryDate: Date | null,
    now: Date = new Date()
  ): { status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED"; daysRemaining: number } {
    if (!expiryDate) {
      return { status: "ACTIVE", daysRemaining: 9999 };
    }

    const diffMs = expiryDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return { status: "EXPIRED", daysRemaining };
    } else if (daysRemaining <= 30) {
      return { status: "EXPIRING_SOON", daysRemaining };
    }
    return { status: "ACTIVE", daysRemaining };
  }

  /**
   * AI Course Recommendation Engine
   * Scores courses based on skill gaps, department alignment, and compliance needs.
   */
  static scoreCourseForEmployee(
    course: {
      id: string;
      title: string;
      isCompliance: boolean;
      isMandatory: boolean;
      departmentId: string | null;
      designationId: string | null;
    },
    employee: {
      departmentId: string | null;
      designationId: string | null;
      skillGapsCount: number;
    }
  ): number {
    let score = 50; // Base relevance

    if (course.isCompliance || course.isMandatory) {
      score += 40;
    }
    if (course.departmentId && course.departmentId === employee.departmentId) {
      score += 25;
    }
    if (course.designationId && course.designationId === employee.designationId) {
      score += 20;
    }
    if (employee.skillGapsCount > 0) {
      score += Math.min(15, employee.skillGapsCount * 5);
    }

    return Math.min(100, score);
  }
}
