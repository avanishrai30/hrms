import { z } from "zod";

export const CreateTrainingCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional(),
  icon: z.string().optional()
});

export const CreateTrainingCourseSchema = z.object({
  categoryId: z.string().uuid().optional(),
  code: z.string().min(2).max(50),
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  description: z.string().optional(),
  deliveryType: z.enum(["SELF_PACED", "INSTRUCTOR_LED", "CLASSROOM", "VIRTUAL_CLASSROOM", "HYBRID"]).default("SELF_PACED"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("BEGINNER"),
  estimatedDurationMinutes: z.number().int().min(5).default(60),
  passingScorePercent: z.number().min(0).max(100).default(70),
  isMandatory: z.boolean().default(false),
  isCompliance: z.boolean().default(false),
  validityMonths: z.number().int().min(1).optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  thumbnailUrl: z.string().url().optional()
});

export const UpdateTrainingCourseSchema = CreateTrainingCourseSchema.partial().extend({
  isActive: z.boolean().optional()
});

export const CreateCourseModuleSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  sequenceOrder: z.number().int().default(1)
});

export const CreateLessonSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(2).max(200),
  contentType: z.enum(["VIDEO", "DOCUMENT", "INTERACTIVE", "SCORM"]).default("VIDEO"),
  contentUrl: z.string().optional(),
  textContent: z.string().optional(),
  durationMinutes: z.number().int().min(1).default(10),
  sequenceOrder: z.number().int().default(1),
  isMandatory: z.boolean().default(true)
});

export const EnrollCourseSchema = z.object({
  courseId: z.string().uuid(),
  employeeId: z.string().uuid(),
  dueDate: z.string().datetime().optional()
});

export const BulkEnrollCourseSchema = z.object({
  courseId: z.string().uuid(),
  employeeIds: z.array(z.string().uuid()).min(1),
  dueDate: z.string().datetime().optional()
});

export const UpdateProgressSchema = z.object({
  completedLessonsCount: z.number().int().min(0),
  totalLessonsCount: z.number().int().min(1),
  totalDurationMinutes: z.number().int().min(1),
  watchTimeSeconds: z.number().int().min(0)
});

export const CreateLearningPathSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  isMandatory: z.boolean().default(false),
  estimatedHours: z.number().min(0.5).default(10.0),
  courseIds: z.array(z.string().uuid()).default([])
});

export const CreateAssessmentSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  type: z.enum(["PRE_ASSESSMENT", "POST_ASSESSMENT", "QUIZ", "FINAL_EXAM", "CERTIFICATION_EXAM"]).default("QUIZ"),
  timeLimitMinutes: z.number().int().min(5).default(30),
  passingPercent: z.number().min(0).max(100).default(70),
  maxAttempts: z.number().int().min(1).default(3),
  randomizeQuestions: z.boolean().default(true),
  negativeMarking: z.boolean().default(false)
});

export const AddAssessmentQuestionSchema = z.object({
  assessmentId: z.string().uuid(),
  questionText: z.string().min(3),
  questionType: z.enum(["SINGLE_CHOICE_MCQ", "MULTIPLE_CHOICE_MCQ", "TRUE_FALSE", "DESCRIPTIVE"]).default("SINGLE_CHOICE_MCQ"),
  points: z.number().min(0.5).default(1.0),
  negativePoints: z.number().min(0).default(0.0),
  explanation: z.string().optional(),
  sequenceOrder: z.number().int().default(1),
  options: z.array(
    z.object({
      optionText: z.string().min(1),
      isCorrect: z.boolean().default(false),
      sequenceOrder: z.number().int().default(1)
    })
  ).min(2)
});

export const SubmitAssessmentAttemptSchema = z.object({
  assessmentId: z.string().uuid(),
  employeeId: z.string().uuid(),
  enrollmentId: z.string().uuid().optional(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedOptionIds: z.array(z.string().uuid())
    })
  )
});

export const CreateCertificationSchema = z.object({
  courseId: z.string().uuid().optional(),
  code: z.string().min(2).max(50),
  title: z.string().min(3).max(200),
  type: z.enum(["INTERNAL", "EXTERNAL", "COMPLIANCE", "PROFESSIONAL"]).default("INTERNAL"),
  validityMonths: z.number().int().min(1).default(12),
  issuingAuthority: z.string().default("VC Organics Academy"),
  badgeImageUrl: z.string().url().optional()
});

export const IssueCertificationSchema = z.object({
  certificationId: z.string().uuid(),
  employeeId: z.string().uuid(),
  certificateNumber: z.string().min(3),
  scorePercent: z.number().min(0).max(100).optional(),
  expiryDate: z.string().datetime().optional()
});

export const CreateSkillCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100)
});

export const CreateSkillSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(50),
  description: z.string().optional(),
  level1Desc: z.string().optional(),
  level2Desc: z.string().optional(),
  level3Desc: z.string().optional(),
  level4Desc: z.string().optional(),
  level5Desc: z.string().optional()
});

export const UpdateEmployeeSkillSchema = z.object({
  employeeId: z.string().uuid(),
  skillId: z.string().uuid(),
  currentProficiency: z.number().int().min(1).max(5),
  targetProficiency: z.number().int().min(1).max(5).default(3),
  selfRating: z.number().int().min(1).max(5).optional(),
  managerRating: z.number().int().min(1).max(5).optional()
});

export const CreateInstructorSchema = z.object({
  employeeId: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  bio: z.string().optional(),
  isExternal: z.boolean().default(false)
});

export const CreateTrainingSessionSchema = z.object({
  courseId: z.string().uuid(),
  instructorId: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  sessionDate: z.string().datetime(),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  locationOrUrl: z.string().optional(),
  maxAttendees: z.number().int().min(1).default(30)
});

export const RecordSessionAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  employeeId: z.string().uuid(),
  attended: z.boolean().default(true),
  feedbackRating: z.number().min(1).max(5).optional(),
  feedbackNotes: z.string().optional()
});
