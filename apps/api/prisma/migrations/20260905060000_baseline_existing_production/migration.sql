-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('TRIAL', 'STANDARD', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_READONLY');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('DRAFT', 'INVITED', 'ACTIVE', 'PROBATION', 'ON_LEAVE', 'NOTICE_PERIOD', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('MONTHLY', 'DAILY', 'HOURLY');

-- CreateEnum
CREATE TYPE "EmployeeDocumentType" AS ENUM ('IDENTITY_PROOF', 'ADDRESS_PROOF', 'OFFER_LETTER', 'EMPLOYMENT_AGREEMENT', 'BANK_DOCUMENT', 'TAX_DOCUMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EmployeeDocumentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'REPLACED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "TenantSubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UsageMetricPeriod" AS ENUM ('DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'HOLIDAY', 'WEEK_OFF', 'WORK_FROM_HOME', 'ON_LEAVE', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "AttendanceEventType" AS ENUM ('CHECK_IN', 'CHECK_OUT', 'MANUAL_ADJUSTMENT', 'STATUS_CHANGE', 'CORRECTION_REQUEST', 'CORRECTION_APPROVAL', 'CORRECTION_REJECTION');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('FACTORY', 'OFFICE', 'WAREHOUSE', 'RETAIL_OUTLET', 'DISTRIBUTION_CENTER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LocationVerificationStatus" AS ENUM ('VERIFIED', 'OUTSIDE_RADIUS', 'ACCURACY_TOO_LOW', 'NO_ASSIGNED_LOCATION', 'LOCATION_DISABLED', 'ASSIGNMENT_EXPIRED', 'MANUAL_OVERRIDE', 'BYPASS_ALLOWED');

-- CreateEnum
CREATE TYPE "FaceProfileStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FaceEnrollmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "FaceVerificationStatus" AS ENUM ('MATCHED', 'MISMATCH', 'LOW_CONFIDENCE', 'NO_ACTIVE_PROFILE', 'SPOOF_DETECTED', 'QUALITY_FAILED', 'BYPASSED');

-- CreateEnum
CREATE TYPE "LivenessVerificationStatus" AS ENUM ('PASSED', 'FAILED', 'SUSPICIOUS', 'RETAKE_REQUIRED', 'CAMERA_ERROR', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "LeaveCategory" AS ENUM ('CASUAL', 'SICK', 'EARNED', 'COMPENSATORY_OFF', 'MATERNITY', 'PATERNITY', 'UNPAID', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LeaveRequestStatus" AS ENUM ('PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveAccrualFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'MANUAL');

-- CreateEnum
CREATE TYPE "LeaveTransactionType" AS ENUM ('ALLOCATION', 'MONTHLY_ACCRUAL', 'QUARTERLY_ACCRUAL', 'YEARLY_ACCRUAL', 'USAGE', 'CARRY_FORWARD', 'EXPIRY', 'MANUAL_ADJUSTMENT', 'CANCELLATION_REFUND');

-- CreateEnum
CREATE TYPE "SandwichPolicyType" AS ENUM ('NONE', 'WEEKENDS_ONLY', 'HOLIDAYS_ONLY', 'WEEKENDS_AND_HOLIDAYS');

-- CreateEnum
CREATE TYPE "SalaryComponentType" AS ENUM ('EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "SalaryComponentCategory" AS ENUM ('BASIC', 'HRA', 'CONVEYANCE', 'MEDICAL', 'SPECIAL_ALLOWANCE', 'BONUS', 'PF', 'ESI', 'PROFESSIONAL_TAX', 'TDS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CompensationCalculationType" AS ENUM ('FLAT_AMOUNT', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'FORMULA');

-- CreateEnum
CREATE TYPE "CompensationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'REVISED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "CompensationChangeReason" AS ENUM ('JOINING_SALARY', 'ANNUAL_REVISION', 'PROMOTION_INCREASE', 'MANUAL_ADJUSTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'PROCESSING', 'GENERATED', 'APPROVED', 'LOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollEmployeeStatus" AS ENUM ('CALCULATED', 'FLAGGED', 'APPROVED', 'PAID', 'EXCLUDED');

-- CreateEnum
CREATE TYPE "PayrollAdjustmentType" AS ENUM ('BONUS', 'PENALTY', 'REIMBURSEMENT', 'ADVANCE_RECOVERY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('DRAFT', 'GENERATED', 'DISTRIBUTED', 'VIEWED', 'DOWNLOADED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PayslipSignatureStatus" AS ENUM ('UNSIGNED', 'SIGNED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PayslipDistributionStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'FAILED');

-- CreateEnum
CREATE TYPE "ComplianceType" AS ENUM ('PF', 'ESI', 'PT', 'TDS');

-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('OLD', 'NEW');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('EXECUTIVE', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'COMPLIANCE', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('CSV', 'EXCEL', 'JSON', 'PDF');

-- CreateEnum
CREATE TYPE "ReportExecutionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'ESCALATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkflowStepAction" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELEGATED', 'ESCALATED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ApprovalStrategy" AS ENUM ('SEQUENTIAL', 'PARALLEL', 'HIERARCHICAL');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalActionType" AS ENUM ('APPROVED', 'REJECTED', 'DELEGATED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "SuspiciousActivityType" AS ENUM ('RAPID_TRAVEL', 'MULTI_DEVICE', 'BRUTE_FORCE', 'LOCATION_SPOOF', 'UNUSUAL_HOURS', 'FAILED_BIOMETRIC');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EssDocumentType" AS ENUM ('PAN', 'AADHAAR', 'PASSPORT', 'DRIVING_LICENSE', 'OFFER_LETTER', 'APPOINTMENT_LETTER', 'PAYSLIP', 'TAX_DOCUMENT', 'CERTIFICATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EmployeeRequestType" AS ENUM ('ADDRESS_CHANGE', 'BANK_CHANGE', 'PERSONAL_INFO_CORRECTION', 'DOCUMENT_UPDATE', 'MANAGER_CHANGE', 'SHIFT_CHANGE', 'ATTENDANCE_CORRECTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EmployeeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AiProviderType" AS ENUM ('GEMINI', 'OPENAI', 'LOCAL_MOCK');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AiPredictionType" AS ENUM ('ATTRITION_RISK', 'BURNOUT_RISK', 'HEADCOUNT_FORECAST', 'OVERTIME_SPIKE');

-- CreateEnum
CREATE TYPE "AiInsightCategory" AS ENUM ('ATTENDANCE', 'LEAVE', 'PAYROLL', 'ATTRITION', 'COMPLIANCE', 'PRODUCTIVITY');

-- CreateEnum
CREATE TYPE "AiInsightSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AiDocumentType" AS ENUM ('RESUME', 'OFFER_LETTER', 'POLICY_PDF', 'GOVERNMENT_ID', 'INVOICE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "HiringRequestStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HiringPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "JobRequisitionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobPostingChannel" AS ENUM ('INTERNAL_PORTAL', 'PUBLIC_CAREERS', 'LINKEDIN', 'INDEED', 'AGENCY', 'CAMPUS');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('APPLIED', 'SCREENING', 'TECHNICAL_ROUND', 'MANAGER_ROUND', 'HR_ROUND', 'OFFER', 'JOINED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('ONLINE', 'OFFLINE', 'TELEPHONIC', 'VIDEO', 'PANEL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'RELEASED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferApproverRole" AS ENUM ('HR', 'DEPT_HEAD', 'FINANCE', 'CEO');

-- CreateEnum
CREATE TYPE "PreboardingTaskType" AS ENUM ('DOCUMENT_UPLOAD', 'BANK_DETAILS', 'IDENTITY_VERIFICATION', 'POLICY_SIGN', 'BACKGROUND_CHECK', 'EQUIPMENT_PREFERENCE');

-- CreateEnum
CREATE TYPE "PreboardingTaskStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GoalCycleType" AS ENUM ('QUARTERLY', 'HALF_YEARLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "GoalCycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('OKR', 'KRA', 'DEVELOPMENT');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('PERCENTAGE', 'NUMERIC', 'CURRENCY', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('PEER_FEEDBACK', 'MANAGER_COACHING', 'SPOT_AWARD', 'BADGE_RECOGNITION', 'GENERAL');

-- CreateEnum
CREATE TYPE "FeedbackVisibility" AS ENUM ('PRIVATE', 'MANAGER_ONLY', 'EMPLOYEE_VISIBLE', 'HR_VISIBLE');

-- CreateEnum
CREATE TYPE "OneOnOneStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "ReviewCycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SELF_REVIEW', 'MANAGER_REVIEW', 'CALIBRATION', 'FINALIZED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReviewRatingLabel" AS ENUM ('OUTSTANDING', 'EXCEEDS_EXPECTATIONS', 'MEETS_EXPECTATIONS', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY');

-- CreateEnum
CREATE TYPE "CompetencyCategory" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'FUNCTIONAL', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "SuccessionCriticality" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM');

-- CreateEnum
CREATE TYPE "SuccessorReadiness" AS ENUM ('READY_NOW', 'READY_IN_6_MONTHS', 'READY_IN_1_YEAR', 'READY_IN_2_YEARS', 'EMERGENCY_BACKUP');

-- CreateEnum
CREATE TYPE "NineBoxGridPosition" AS ENUM ('STAR_HIGH_POTENTIAL', 'HIGH_PERFORMER_GROWTH', 'SOLID_PERFORMER_KEY', 'HIGH_POTENTIAL_DEVELOP', 'CORE_CONTRIBUTOR', 'EFFECTIVE_PERFORMER', 'DILEMMA_QUESTION_MARK', 'UNDERPERFORMER_COACH', 'RISK_LOW_PERFORMER');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('LAPTOP', 'DESKTOP', 'MOBILE_PHONE', 'TABLET', 'PRINTER', 'BIOMETRIC_DEVICE', 'ACCESS_CARD', 'SIM_CARD', 'VEHICLE', 'FURNITURE', 'MONITOR', 'SOFTWARE_LICENSE', 'NETWORK_DEVICE', 'SERVER', 'CUSTOM_ASSET');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'IN_MAINTENANCE', 'LOST', 'SCRAPPED', 'RETURNED');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('BRAND_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED', 'SCRAP');

-- CreateEnum
CREATE TYPE "AssetTransactionType" AS ENUM ('PURCHASE', 'ASSIGNMENT', 'TRANSFER', 'RETURN', 'MAINTENANCE_SEND', 'MAINTENANCE_RECEIVE', 'DISPOSAL', 'SCRAP');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'WARRANTY_REPAIR', 'AMC_SERVICE', 'UPGRADE');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('PERPETUAL', 'SUBSCRIPTION', 'SEAT_BASED', 'USER_BASED', 'DEVICE_BASED', 'ENTERPRISE_TIER');

-- CreateEnum
CREATE TYPE "DepreciationMethod" AS ENUM ('STRAIGHT_LINE', 'WRITTEN_DOWN_VALUE');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('HARDWARE', 'SOFTWARE', 'ACCESS', 'NETWORK', 'SECURITY', 'FACILITIES', 'PAYROLL', 'HR', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('PORTAL', 'EMAIL', 'SLACK', 'PHONE', 'SYSTEM_GENERATED');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('MEETING_ROOM', 'CONFERENCE_HALL', 'TRAINING_ROOM', 'EXECUTIVE_CABIN', 'WORKSTATION', 'CAFETERIA', 'AUDITORIUM');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'BOOKED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DeskType" AS ENUM ('HOT_DESK', 'DEDICATED', 'EXECUTIVE', 'VISITOR');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'IN_TRANSIT', 'IN_MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('PRE_REGISTERED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "GatePassStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GatePassType" AS ENUM ('MATERIAL_OUTWARD', 'MATERIAL_INWARD', 'EMPLOYEE_EXIT', 'CONTRACTOR_EXIT');

-- CreateEnum
CREATE TYPE "ContractorStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "ClearanceStatus" AS ENUM ('INITIATED', 'IN_PROGRESS', 'CLEARANCE_COMPLETED', 'BLOCKED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClearanceDepartment" AS ENUM ('HR', 'IT', 'ADMIN', 'FINANCE', 'REPORTING_MANAGER');

-- CreateEnum
CREATE TYPE "ExpenseClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseCategoryType" AS ENUM ('TRAVEL', 'HOTEL', 'MEALS', 'FUEL', 'INTERNET', 'MOBILE', 'TRAINING', 'OFFICE_SUPPLIES', 'CLIENT_ENTERTAINMENT', 'MEDICAL', 'MILEAGE', 'MISCELLANEOUS');

-- CreateEnum
CREATE TYPE "TravelRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TravelClass" AS ENUM ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST_CLASS', 'TRAIN_AC1', 'TRAIN_AC2', 'TRAIN_AC3', 'TRAIN_SLEEPER', 'BUS_AC', 'BUS_NON_AC', 'CAB', 'SELF_DRIVE');

-- CreateEnum
CREATE TYPE "AdvanceStatus" AS ENUM ('REQUESTED', 'APPROVED', 'DISBURSED', 'SETTLED', 'REFUND_PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT', 'APPROVED', 'POSTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "AccountingPeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'PARTIALLY_PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "BankTransactionType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('UNMATCHED', 'PARTIAL', 'MATCHED');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('CGST', 'SGST', 'IGST', 'TDS');

-- CreateEnum
CREATE TYPE "ERPProvider" AS ENUM ('TALLY', 'ZOHO_BOOKS', 'QUICKBOOKS', 'SAP');

-- CreateEnum
CREATE TYPE "ERPJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ApiCredentialStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'DEAD_LETTER');

-- CreateEnum
CREATE TYPE "AutomationRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IntegrationProviderCategory" AS ENUM ('PRODUCTIVITY', 'COMMUNICATION', 'HR', 'ACCOUNTING', 'STORAGE', 'IDENTITY');

-- CreateEnum
CREATE TYPE "SSOProtocol" AS ENUM ('OAUTH2', 'OIDC', 'SAML2');

-- CreateEnum
CREATE TYPE "KnowledgeArticleStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CourseDeliveryType" AS ENUM ('SELF_PACED', 'INSTRUCTOR_LED', 'CLASSROOM', 'VIRTUAL_CLASSROOM', 'HYBRID');

-- CreateEnum
CREATE TYPE "CourseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED', 'DROPPED');

-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('VIDEO', 'DOCUMENT', 'INTERACTIVE', 'SCORM');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('PRE_ASSESSMENT', 'POST_ASSESSMENT', 'QUIZ', 'FINAL_EXAM', 'CERTIFICATION_EXAM');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE_MCQ', 'MULTIPLE_CHOICE_MCQ', 'TRUE_FALSE', 'DESCRIPTIVE');

-- CreateEnum
CREATE TYPE "LmsCertificationType" AS ENUM ('INTERNAL', 'EXTERNAL', 'COMPLIANCE', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "TrainingSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PositionLifecycleStatus" AS ENUM ('DRAFT', 'APPROVED', 'ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "HeadcountPeriodType" AS ENUM ('ANNUAL', 'QUARTERLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "HeadcountPlanStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GrowthScenarioCase" AS ENUM ('BEST_CASE', 'EXPECTED_CASE', 'WORST_CASE');

-- CreateEnum
CREATE TYPE "OrgVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AttritionRiskTier" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BiometricDeviceVendor" AS ENUM ('ESSL', 'ZKTECO', 'MATRIX', 'SUPREMA', 'GENERIC_REST');

-- CreateEnum
CREATE TYPE "BiometricDeviceSyncMode" AS ENUM ('PUSH', 'PULL', 'REALTIME');

-- CreateEnum
CREATE TYPE "BiometricDeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ShiftSwapStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('PENDING', 'MANAGER_APPROVED', 'HR_APPROVED', 'REJECTED', 'PROCESSED_IN_PAYROLL');

-- CreateEnum
CREATE TYPE "OvertimeType" AS ENUM ('DAILY_OT', 'WEEKLY_OFF_OT', 'HOLIDAY_OT', 'NIGHT_SHIFT_OT');

-- CreateEnum
CREATE TYPE "AnomalySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AnomalyType" AS ENUM ('MISSING_PUNCH', 'DOUBLE_PUNCH', 'EXCESSIVE_LATE', 'EARLY_EXIT', 'GEOFENCE_BREACH', 'SPOOF_ATTEMPT', 'UNUSUAL_HOURS');

-- CreateEnum
CREATE TYPE "PayrollFrequency" AS ENUM ('MONTHLY', 'BIWEEKLY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "TaxDeclarationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaxProofStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'HR_APPROVED', 'FINANCE_APPROVED', 'DISBURSED');

-- CreateEnum
CREATE TYPE "GratuityStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "BonusType" AS ENUM ('ANNUAL', 'FESTIVE', 'PERFORMANCE', 'SIGN_ON', 'RETENTION');

-- CreateEnum
CREATE TYPE "IncentiveType" AS ENUM ('SALES_COMMISSION', 'KPI_REWARD', 'PROJECT_MILESTONE');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('SALARY_ADVANCE', 'EMERGENCY_LOAN', 'EDUCATION_LOAN');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "RevisionType" AS ENUM ('ANNUAL_APPRAISAL', 'PROMOTION', 'MARKET_CORRECTION');

-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('PROPOSED', 'MANAGER_APPROVED', 'HR_APPROVED', 'CEO_APPROVED', 'APPLIED');

-- CreateEnum
CREATE TYPE "EngagementSurveyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SurveyQuestionType" AS ENUM ('RATING_1_5', 'RATING_1_10', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "PulseFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ENPSCategory" AS ENUM ('PROMOTER', 'PASSIVE', 'DETRACTOR');

-- CreateEnum
CREATE TYPE "RecognitionType" AS ENUM ('PEER_APPRECIATION', 'MANAGER_KUDOS', 'COMPANY_AWARD', 'VALUES_CHAMPION', 'MILESTONE_ANNIVERSARY', 'INNOVATION_STAR');

-- CreateEnum
CREATE TYPE "RewardLedgerType" AS ENUM ('POINTS_EARNED', 'POINTS_REDEEMED', 'POINTS_EXPIRED', 'POINTS_ADJUSTED');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommunityType" AS ENUM ('DEPARTMENT', 'INTEREST_GROUP', 'CULTURE_CLUB', 'SPORTS_WELLNESS', 'INNOVATION');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('GENERAL', 'APPRECIATION', 'ANNOUNCEMENT', 'EVENT', 'POLL');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'IMPLEMENTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('OPEN', 'EVALUATION', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'SHORTLISTED', 'WINNER', 'DECLINED');

-- CreateEnum
CREATE TYPE "SentimentMood" AS ENUM ('VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'UNHAPPY', 'STRESSED', 'BURNOUT_RISK');

-- CreateEnum
CREATE TYPE "BurnoutRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LetterType" AS ENUM ('EMPLOYMENT_CONFIRMATION', 'EXPERIENCE_LETTER', 'PROMOTION_LETTER', 'SALARY_CERTIFICATE', 'ADDRESS_PROOF', 'INTERNSHIP_LETTER', 'RELIEVING_LETTER');

-- CreateEnum
CREATE TYPE "LetterStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED', 'REJECTED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "TenantPlan" NOT NULL DEFAULT 'STANDARD',
    "primary_domain" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "timezone" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "week_start_day" INTEGER NOT NULL DEFAULT 1,
    "payroll_cycle_day" INTEGER NOT NULL DEFAULT 1,
    "attendance_timezone" TEXT NOT NULL,
    "default_working_days_per_month" INTEGER NOT NULL DEFAULT 26,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_branding" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "logo_object_key" TEXT,
    "favicon_object_key" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#1f8f5f',
    "secondary_color" TEXT NOT NULL DEFAULT '#335c67',
    "accent_color" TEXT NOT NULL DEFAULT '#f2b84b',
    "pwa_name" TEXT NOT NULL,
    "pwa_short_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_domains" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_feature_flags" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'INVITED',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "PlatformRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_memberships" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employee_id" UUID,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_membership_roles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_membership_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_role_permissions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "tenant_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "device_fingerprint" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_challenges" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "designation_id" UUID NOT NULL,
    "business_unit_id" UUID,
    "region_id" UUID,
    "team_id" UUID,
    "manager_employee_id" UUID,
    "joining_date" TIMESTAMP(3) NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "salary_type" "SalaryType" NOT NULL,
    "status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "profile_photo_object_key" TEXT,
    "preferred_name" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "personal_email" TEXT,
    "current_address" JSONB,
    "permanent_address" JSONB,
    "emergency_contact" JSONB,
    "bank_details" JSONB,
    "government_ids" JSONB,
    "probation_ends_at" TIMESTAMP(3),
    "notice_period_ends_at" TIMESTAMP(3),
    "invited_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_metadata" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "document_type" "EmployeeDocumentType" NOT NULL,
    "custom_type_label" TEXT,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "object_key" TEXT NOT NULL,
    "uploaded_by_user_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "EmployeeDocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_status_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "previous_status" "EmploymentStatus" NOT NULL,
    "new_status" "EmploymentStatus" NOT NULL,
    "changed_by_user_id" UUID NOT NULL,
    "changed_by_membership_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_timeline_events" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_membership_id" UUID,
    "event_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "starts_at_minute" INTEGER NOT NULL,
    "ends_at_minute" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "starts_on" TIMESTAMP(3) NOT NULL,
    "ends_on" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_calendars" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "working_days" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_calendars" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "holidays" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interval" "SubscriptionInterval" NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "limits" JSONB NOT NULL DEFAULT '{}',
    "features" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "TenantSubscriptionStatus" NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "external_customer_id" TEXT,
    "external_subscription_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "period" "UsageMetricPeriod" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_membership_id" UUID,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "shift_id" UUID,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "check_in_at" TIMESTAMP(3),
    "check_out_at" TIMESTAMP(3),
    "worked_minutes" INTEGER NOT NULL DEFAULT 0,
    "late_minutes" INTEGER NOT NULL DEFAULT 0,
    "early_departure_minutes" INTEGER NOT NULL DEFAULT 0,
    "overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "location_id" UUID,
    "distance_meters" DOUBLE PRECISION,
    "accuracy_meters" DOUBLE PRECISION,
    "location_verification_status" "LocationVerificationStatus",
    "location_verification_reason" TEXT,
    "face_verification_id" UUID,
    "face_verification_status" "FaceVerificationStatus",
    "liveness_verification_status" "LivenessVerificationStatus",
    "biometric_trust_score" DOUBLE PRECISION,
    "biometric_verification_reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_events" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "attendance_id" UUID,
    "employee_id" UUID NOT NULL,
    "event_type" "AttendanceEventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_user_id" UUID,
    "actor_membership_id" UUID,
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_corrections" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "attendance_id" UUID,
    "employee_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "requested_change" JSONB NOT NULL,
    "attachments_metadata" JSONB NOT NULL DEFAULT '[]',
    "status" "CorrectionStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by_user_id" UUID NOT NULL,
    "reviewed_by_user_id" UUID,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "late_threshold_minutes" INTEGER NOT NULL DEFAULT 15,
    "half_day_threshold_minutes" INTEGER NOT NULL DEFAULT 240,
    "minimum_work_duration_minutes" INTEGER NOT NULL DEFAULT 480,
    "maximum_work_duration_minutes" INTEGER NOT NULL DEFAULT 720,
    "grace_period_minutes" INTEGER NOT NULL DEFAULT 10,
    "overtime_threshold_minutes" INTEGER NOT NULL DEFAULT 480,
    "allow_self_check_in" BOOLEAN NOT NULL DEFAULT true,
    "require_geofence" BOOLEAN NOT NULL DEFAULT false,
    "require_face_verification" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_exceptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID,
    "attendance_id" UUID,
    "date" TIMESTAMP(3) NOT NULL,
    "exception_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "details" JSONB NOT NULL DEFAULT '{}',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by_user_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_summaries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "month" TEXT NOT NULL,
    "total_days" INTEGER NOT NULL DEFAULT 0,
    "present_days" INTEGER NOT NULL DEFAULT 0,
    "absent_days" INTEGER NOT NULL DEFAULT 0,
    "half_days" INTEGER NOT NULL DEFAULT 0,
    "late_days" INTEGER NOT NULL DEFAULT 0,
    "leave_days" INTEGER NOT NULL DEFAULT 0,
    "holiday_days" INTEGER NOT NULL DEFAULT 0,
    "week_off_days" INTEGER NOT NULL DEFAULT 0,
    "total_worked_minutes" INTEGER NOT NULL DEFAULT 0,
    "total_overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "total_late_minutes" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "LocationType" NOT NULL DEFAULT 'OFFICE',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius_meters" INTEGER NOT NULL DEFAULT 100,
    "max_accuracy_meters" INTEGER NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "employee_id" UUID,
    "department_id" UUID,
    "starts_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_on" TIMESTAMP(3),
    "is_priority" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_verifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "attendance_id" UUID,
    "location_id" UUID,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy_meters" DOUBLE PRECISION NOT NULL,
    "distance_meters" DOUBLE PRECISION,
    "status" "LocationVerificationStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "is_manual_override" BOOLEAN NOT NULL DEFAULT false,
    "override_reason" TEXT,
    "override_by_user_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "FaceProfileStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "enrolled_at" TIMESTAMP(3),
    "last_verified_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "face_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_embeddings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "face_profile_id" UUID NOT NULL,
    "model_version" TEXT NOT NULL DEFAULT 'resnet-face-v1',
    "dimensions" INTEGER NOT NULL DEFAULT 128,
    "encrypted_embedding" TEXT NOT NULL,
    "confidence_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.80,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "face_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_enrollments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "face_profile_id" UUID,
    "image_object_key" TEXT,
    "quality_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "liveness_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "FaceEnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT,
    "enrolled_by_user_id" UUID NOT NULL,
    "reviewed_by_user_id" UUID,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "face_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_verifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "attendance_id" UUID,
    "face_profile_id" UUID,
    "status" "FaceVerificationStatus" NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "threshold_used" DOUBLE PRECISION NOT NULL DEFAULT 0.80,
    "reason" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "face_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liveness_verifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "face_verification_id" UUID,
    "status" "LivenessVerificationStatus" NOT NULL,
    "liveness_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "checks_performed" JSONB NOT NULL DEFAULT '[]',
    "reason" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liveness_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" "LeaveCategory" NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "is_paid" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_policies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "annual_allocation_days" DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    "accrual_frequency" "LeaveAccrualFrequency" NOT NULL DEFAULT 'MONTHLY',
    "accrual_days_per_period" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "max_carry_forward_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "carry_forward_expiry_months" INTEGER NOT NULL DEFAULT 12,
    "allow_negative_balance" BOOLEAN NOT NULL DEFAULT false,
    "max_negative_balance_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "requires_manager_approval" BOOLEAN NOT NULL DEFAULT true,
    "requires_hr_approval" BOOLEAN NOT NULL DEFAULT false,
    "requires_attachment" BOOLEAN NOT NULL DEFAULT false,
    "attachment_mandatory_above_days" INTEGER NOT NULL DEFAULT 2,
    "minimum_notice_days" INTEGER NOT NULL DEFAULT 0,
    "max_consecutive_days" INTEGER NOT NULL DEFAULT 15,
    "sandwich_policy" "SandwichPolicyType" NOT NULL DEFAULT 'NONE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "allocated_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "accrued_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "carried_forward_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "used_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pending_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "expired_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "manual_adjusted_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_accrual_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "policy_id" UUID NOT NULL,
    "frequency" "LeaveAccrualFrequency" NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "day_of_month" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_accrual_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_accrual_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "policy_id" UUID,
    "transaction_type" "LeaveTransactionType" NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "balance_before" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "actor_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_accrual_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_half_day" BOOLEAN NOT NULL DEFAULT false,
    "half_day_session" TEXT,
    "total_days" DOUBLE PRECISION NOT NULL,
    "deducted_days" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING_MANAGER',
    "attachment_object_key" TEXT,
    "rejection_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_approvals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "leave_request_id" UUID NOT NULL,
    "approver_role" TEXT NOT NULL,
    "approver_user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_attachments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "leave_request_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "object_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_components" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "SalaryComponentType" NOT NULL,
    "category" "SalaryComponentCategory" NOT NULL,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "is_fixed" BOOLEAN NOT NULL DEFAULT true,
    "calculation_type" "CompensationCalculationType" NOT NULL DEFAULT 'FLAT_AMOUNT',
    "calculation_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compensation_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "job_role" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compensation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compensation_template_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "component_id" UUID NOT NULL,
    "calculation_type" "CompensationCalculationType" NOT NULL DEFAULT 'FLAT_AMOUNT',
    "calculation_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthly_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "annual_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compensation_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_compensations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "template_id" UUID,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "monthly_ctc" DOUBLE PRECISION NOT NULL,
    "annual_ctc" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "CompensationStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" "CompensationChangeReason" NOT NULL DEFAULT 'JOINING_SALARY',
    "notes" TEXT,
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_compensations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_compensation_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "compensation_id" UUID NOT NULL,
    "component_id" UUID NOT NULL,
    "monthly_amount" DOUBLE PRECISION NOT NULL,
    "annual_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_compensation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_compensation_histories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "compensation_id" UUID,
    "previous_monthly_ctc" DOUBLE PRECISION NOT NULL,
    "previous_annual_ctc" DOUBLE PRECISION NOT NULL,
    "new_monthly_ctc" DOUBLE PRECISION NOT NULL,
    "new_annual_ctc" DOUBLE PRECISION NOT NULL,
    "reason" "CompensationChangeReason" NOT NULL,
    "notes" TEXT,
    "revision_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "approved_by_user_id" UUID,
    "breakdown_snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_compensation_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
    "total_employees" INTEGER NOT NULL DEFAULT 0,
    "total_gross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_net" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_employer_contributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "notes" TEXT,
    "created_by_user_id" UUID NOT NULL,
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_run_employees" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "working_days" DOUBLE PRECISION NOT NULL,
    "present_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_leave_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unpaid_leave_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "holiday_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "half_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "absent_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "late_days" INTEGER NOT NULL DEFAULT 0,
    "early_exit_days" INTEGER NOT NULL DEFAULT 0,
    "payable_days" DOUBLE PRECISION NOT NULL,
    "daily_rate" DOUBLE PRECISION NOT NULL,
    "base_monthly_ctc" DOUBLE PRECISION NOT NULL,
    "gross_salary" DOUBLE PRECISION NOT NULL,
    "total_deductions" DOUBLE PRECISION NOT NULL,
    "net_salary" DOUBLE PRECISION NOT NULL,
    "employer_contributions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_adjustments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attendance_snapshot" JSONB NOT NULL,
    "leave_snapshot" JSONB NOT NULL,
    "compensation_snapshot" JSONB NOT NULL,
    "status" "PayrollEmployeeStatus" NOT NULL DEFAULT 'CALCULATED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_run_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_component_breakdowns" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_run_employee_id" UUID NOT NULL,
    "component_id" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "SalaryComponentType" NOT NULL,
    "category" "SalaryComponentCategory" NOT NULL,
    "base_amount" DOUBLE PRECISION NOT NULL,
    "prorated_amount" DOUBLE PRECISION NOT NULL,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_component_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_adjustments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "payroll_run_employee_id" UUID NOT NULL,
    "type" "PayrollAdjustmentType" NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_approvals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "approver_user_id" UUID NOT NULL,
    "approver_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "payroll_run_employee_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "gross_salary" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL,
    "net_salary" DOUBLE PRECISION NOT NULL,
    "pdf_path" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "signature_status" "PayslipSignatureStatus" NOT NULL DEFAULT 'UNSIGNED',
    "status" "PayslipStatus" NOT NULL DEFAULT 'GENERATED',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generated_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_distributions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payslip_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "recipient_email" TEXT NOT NULL,
    "status" "PayslipDistributionStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslip_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "header_html" TEXT,
    "footer_html" TEXT,
    "color_scheme" TEXT NOT NULL DEFAULT '#059669',
    "show_logo" BOOLEAN NOT NULL DEFAULT true,
    "show_attendance_summary" BOOLEAN NOT NULL DEFAULT true,
    "show_leave_summary" BOOLEAN NOT NULL DEFAULT true,
    "show_employer_contribution" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslip_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "ComplianceType" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "state" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_rule_versions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rule_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_rule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_snapshots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "payroll_run_employee_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "pf_employee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pf_employer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pf_wage_basis" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esi_employee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esi_employer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esi_wage_basis" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pt_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pt_state" TEXT,
    "tds_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tds_regime" "TaxRegime" NOT NULL DEFAULT 'NEW',
    "rule_versions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_definitions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ReportCategory" NOT NULL,
    "source_module" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "config" JSONB NOT NULL DEFAULT '{}',
    "configuration_json" JSONB NOT NULL DEFAULT '{}',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_reports" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "report_definition_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "filters_json" JSONB NOT NULL DEFAULT '{}',
    "columns" JSONB NOT NULL DEFAULT '[]',
    "columns_json" JSONB NOT NULL DEFAULT '[]',
    "sort_json" JSONB NOT NULL DEFAULT '[]',
    "grouping_json" JSONB NOT NULL DEFAULT '[]',
    "created_by_id" UUID NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_executions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "report_definition_id" UUID NOT NULL,
    "saved_report_id" UUID,
    "scheduled_report_id" UUID,
    "triggered_by_id" UUID NOT NULL,
    "status" "ReportExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "format" "ReportFormat" NOT NULL DEFAULT 'CSV',
    "file_url" TEXT,
    "file_path" TEXT,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "execution_time_ms" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "saved_report_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "ScheduleFrequency" NOT NULL DEFAULT 'MONTHLY',
    "recipients" JSONB NOT NULL DEFAULT '[]',
    "recipients_json" JSONB NOT NULL DEFAULT '[]',
    "format" "ReportFormat" NOT NULL DEFAULT 'CSV',
    "export_format" "ReportFormat" NOT NULL DEFAULT 'CSV',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "dashboard_id" UUID,
    "widget_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position_x" INTEGER NOT NULL DEFAULT 0,
    "position_y" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 6,
    "height" INTEGER NOT NULL DEFAULT 4,
    "grid_position" JSONB NOT NULL DEFAULT '{"x":0,"y":0,"w":6,"h":4}',
    "config" JSONB NOT NULL DEFAULT '{}',
    "configuration_json" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL DEFAULT 'DAILY',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "body_template" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "recipient_employee_id" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "template_code" TEXT,
    "template_id" UUID,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entity_type" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "transitions" JSONB NOT NULL DEFAULT '[]',
    "escalation_rules" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "workflow_definition_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "current_step" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'PENDING',
    "initiated_by_id" UUID NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "sla_deadline" TIMESTAMP(3),
    "escalated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_executions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "workflow_instance_id" UUID NOT NULL,
    "step_code" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "assignee_user_id" UUID,
    "assignee_role" TEXT,
    "action" "WorkflowStepAction" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "actioned_at" TIMESTAMP(3),
    "actioned_by_id" UUID,
    "sla_deadline" TIMESTAMP(3),
    "is_escalated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_step_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_audits" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "workflow_instance_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actor_user_id" UUID,
    "from_step" TEXT,
    "to_step" TEXT,
    "comment" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "levels" JSONB NOT NULL DEFAULT '[]',
    "approver_strategy" "ApprovalStrategy" NOT NULL DEFAULT 'SEQUENTIAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "approval_template_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "requester_id" UUID NOT NULL,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "total_levels" INTEGER NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_actions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "approval_request_id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "approver_user_id" UUID NOT NULL,
    "action" "ApprovalActionType" NOT NULL,
    "comment" TEXT,
    "delegated_to_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_units" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "head_user_id" UUID,
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "business_unit_id" UUID,
    "head_user_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "department_id" UUID,
    "lead_user_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suspicious_activities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "activity_type" "SuspiciousActivityType" NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "severity" "SeverityLevel" NOT NULL DEFAULT 'LOW',
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suspicious_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "bio" TEXT,
    "profile_photo" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "marital_status" TEXT,
    "blood_group" TEXT,
    "emergency_contact_json" JSONB,
    "address_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "document_type" "EssDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "request_type" "EmployeeRequestType" NOT NULL,
    "status" "EmployeeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "payload_json" JSONB NOT NULL,
    "reason" TEXT,
    "comments" TEXT,
    "workflow_instance_id" UUID,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'MEDIUM',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "attachments" JSONB DEFAULT '[]',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acknowledgements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "announcement_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acknowledgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Conversation',
    "context_type" TEXT NOT NULL DEFAULT 'GENERAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" "AiMessageRole" NOT NULL DEFAULT 'USER',
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "data_payload" JSONB,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "model_used" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_knowledge_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'POLICY',
    "content" TEXT NOT NULL,
    "file_path" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_knowledge_chunks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "embedding_vector" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workforce_predictions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID,
    "prediction_type" "AiPredictionType" NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "signals" JSONB NOT NULL DEFAULT '{}',
    "forecast_horizon_days" INTEGER,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_workforce_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_smart_insights" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category" "AiInsightCategory" NOT NULL DEFAULT 'ATTENDANCE',
    "title" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "severity" "AiInsightSeverity" NOT NULL DEFAULT 'INFO',
    "metric_change_percent" DOUBLE PRECISION,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_smart_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_document_extractions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_type" "AiDocumentType" NOT NULL DEFAULT 'RESUME',
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "extracted_data" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_document_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_settings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "active_provider" "AiProviderType" NOT NULL DEFAULT 'GEMINI',
    "gemini_api_key" TEXT,
    "openai_api_key" TEXT,
    "model_name" TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "max_tokens" INTEGER NOT NULL DEFAULT 2048,
    "enable_pii_masking" BOOLEAN NOT NULL DEFAULT true,
    "enable_prompt_shield" BOOLEAN NOT NULL DEFAULT true,
    "enable_auto_insights" BOOLEAN NOT NULL DEFAULT true,
    "enable_workforce_predictions" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "request_code" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "business_unit_id" UUID,
    "designation_id" UUID NOT NULL,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "budgeted_ctc" DECIMAL(12,2) NOT NULL,
    "priority" "HiringPriority" NOT NULL DEFAULT 'MEDIUM',
    "justification" TEXT NOT NULL,
    "required_by_date" TIMESTAMP(3) NOT NULL,
    "hiring_manager_id" UUID NOT NULL,
    "status" "HiringRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_stage" TEXT,
    "approval_chain_json" JSONB,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hiring_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requisitions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "requisition_code" TEXT NOT NULL,
    "hiring_request_id" UUID,
    "job_title" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "designation_id" UUID NOT NULL,
    "location" TEXT NOT NULL,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "experience_min" INTEGER NOT NULL DEFAULT 0,
    "experience_max" INTEGER NOT NULL DEFAULT 10,
    "salary_min" DECIMAL(12,2),
    "salary_max" DECIMAL(12,2),
    "skills_required" TEXT[],
    "job_description" TEXT NOT NULL,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "status" "JobRequisitionStatus" NOT NULL DEFAULT 'DRAFT',
    "approved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "requisition_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel" "JobPostingChannel" NOT NULL DEFAULT 'PUBLIC_CAREERS',
    "status" "JobPostingStatus" NOT NULL DEFAULT 'ACTIVE',
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "candidate_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "current_location" TEXT,
    "experience_years" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_ctc" DECIMAL(12,2),
    "expected_ctc" DECIMAL(12,2),
    "notice_period_days" INTEGER NOT NULL DEFAULT 30,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "education" TEXT,
    "summary" TEXT,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "portfolio_url" TEXT,
    "status" "CandidateStatus" NOT NULL DEFAULT 'APPLIED',
    "source" TEXT NOT NULL DEFAULT 'CAREERS_PORTAL',
    "hired_employee_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "skill_name" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "years" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "parsed_data" JSONB,
    "extracted_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "application_code" TEXT NOT NULL,
    "requisition_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'APPLIED',
    "source" TEXT NOT NULL DEFAULT 'CAREERS_PORTAL',
    "ai_match_score" DOUBLE PRECISION,
    "ai_skills_match" DOUBLE PRECISION,
    "ai_exp_match" DOUBLE PRECISION,
    "ai_summary" TEXT,
    "ai_interview_qs" JSONB,
    "stage_history_json" JSONB,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "round_name" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL DEFAULT 1,
    "interview_type" "InterviewType" NOT NULL DEFAULT 'VIDEO',
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "meeting_link" TEXT,
    "location_details" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "interviewer_notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_panels" (
    "id" UUID NOT NULL,
    "interview_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INTERVIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_feedbacks" (
    "id" UUID NOT NULL,
    "interview_id" UUID NOT NULL,
    "interviewer_id" UUID NOT NULL,
    "technical_score" INTEGER NOT NULL DEFAULT 3,
    "communication" INTEGER NOT NULL DEFAULT 3,
    "problem_solving" INTEGER NOT NULL DEFAULT 3,
    "culture_fit" INTEGER NOT NULL DEFAULT 3,
    "leadership" INTEGER NOT NULL DEFAULT 3,
    "experience_score" INTEGER NOT NULL DEFAULT 3,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "recommendation" "InterviewRecommendation" NOT NULL DEFAULT 'HIRE',
    "strengths" TEXT,
    "weaknesses" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "offer_code" TEXT NOT NULL,
    "application_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "requisition_id" UUID NOT NULL,
    "base_salary" DECIMAL(12,2) NOT NULL,
    "joining_bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "variable_pay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_ctc" DECIMAL(12,2) NOT NULL,
    "benefits_summary" TEXT,
    "joining_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "current_approval_stage" TEXT,
    "letter_object_key" TEXT,
    "released_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "response_comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_approvals" (
    "id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "approver_role" "OfferApproverRole" NOT NULL,
    "approver_user_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_tasks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "offer_id" UUID,
    "task_title" TEXT NOT NULL,
    "task_type" "PreboardingTaskType" NOT NULL,
    "description" TEXT,
    "status" "PreboardingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "payload_json" JSONB,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preboarding_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_sources" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "source_name" TEXT NOT NULL,
    "channel_type" TEXT NOT NULL DEFAULT 'DIRECT',
    "candidates_count" INTEGER NOT NULL DEFAULT 0,
    "hires_count" INTEGER NOT NULL DEFAULT 0,
    "cost_incurred" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_activities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "actor_name" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_cycles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "type" "GoalCycleType" NOT NULL DEFAULT 'QUARTERLY',
    "status" "GoalCycleStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL DEFAULT 'OKR',
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "target_value" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "achieved_value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "GoalStatus" NOT NULL DEFAULT 'DRAFT',
    "metric_unit" TEXT,
    "due_date" TIMESTAMP(3),
    "evidence_text" TEXT,
    "evidence_url" TEXT,
    "manager_comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_results" (
    "id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "metric_type" "MetricType" NOT NULL DEFAULT 'PERCENTAGE',
    "start_value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_value" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "from_employee_id" UUID NOT NULL,
    "to_employee_id" UUID NOT NULL,
    "category" "FeedbackCategory" NOT NULL DEFAULT 'PEER_FEEDBACK',
    "rating" DOUBLE PRECISION,
    "strengths" TEXT,
    "improvements" TEXT,
    "badge_name" TEXT,
    "visibility" "FeedbackVisibility" NOT NULL DEFAULT 'EMPLOYEE_VISIBLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_on_ones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "meeting_duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "meeting_url" TEXT,
    "agenda" TEXT,
    "notes" TEXT,
    "action_items_json" JSONB DEFAULT '[]',
    "status" "OneOnOneStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_on_ones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_cycles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "ReviewCycleStatus" NOT NULL DEFAULT 'DRAFT',
    "settings_json" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "self_score" DOUBLE PRECISION,
    "manager_score" DOUBLE PRECISION,
    "peer_score" DOUBLE PRECISION,
    "skip_level_score" DOUBLE PRECISION,
    "cross_functional_score" DOUBLE PRECISION,
    "final_score" DOUBLE PRECISION,
    "calibrated_score" DOUBLE PRECISION,
    "rating_label" "ReviewRatingLabel",
    "status" TEXT NOT NULL DEFAULT 'SELF_ASSESSMENT',
    "self_comments" TEXT,
    "manager_comments" TEXT,
    "skip_level_comments" TEXT,
    "strengths" TEXT,
    "areas_of_growth" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3),
    "finalized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_review_scores" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "rater_type" TEXT NOT NULL,
    "rater_id" UUID,
    "score" DOUBLE PRECISION NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "comments" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_review_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competencies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "category" "CompetencyCategory" NOT NULL DEFAULT 'BEHAVIORAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designation_competencies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "designation_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,
    "expected_level" INTEGER NOT NULL DEFAULT 3,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "designation_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_competency_ratings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,
    "self_rating" DOUBLE PRECISION,
    "manager_rating" DOUBLE PRECISION,
    "evaluated_level" DOUBLE PRECISION,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_competency_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibration_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "department_id" UUID,
    "session_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "calibrated_by_user_id" UUID,
    "target_distribution_json" JSONB DEFAULT '{"OUTSTANDING":5,"EXCEEDS":15,"MEETS":60,"NEEDS_IMPROVEMENT":15,"POOR":5}',
    "actual_distribution_json" JSONB DEFAULT '{}',
    "notes" TEXT,
    "finalized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calibration_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibration_reviews" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "original_score" DOUBLE PRECISION NOT NULL,
    "calibrated_score" DOUBLE PRECISION NOT NULL,
    "original_label" "ReviewRatingLabel" NOT NULL,
    "calibrated_label" "ReviewRatingLabel" NOT NULL,
    "justification" TEXT,
    "reviewed_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calibration_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_increment_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rating_label" "ReviewRatingLabel" NOT NULL,
    "default_increment_pct" DOUBLE PRECISION NOT NULL,
    "min_increment_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "max_increment_pct" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "budget_allocation_pct" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_increment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_recommendations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "current_designation_id" UUID NOT NULL,
    "target_designation_id" UUID NOT NULL,
    "performance_score" DOUBLE PRECISION NOT NULL,
    "competency_score" DOUBLE PRECISION NOT NULL,
    "tenure_months" INTEGER NOT NULL,
    "potential_score" DOUBLE PRECISION NOT NULL,
    "readiness_score" DOUBLE PRECISION NOT NULL,
    "readiness_rating" "SuccessorReadiness" NOT NULL DEFAULT 'READY_IN_6_MONTHS',
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "proposed_salary_bump_pct" DOUBLE PRECISION,
    "justification" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "succession_positions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "designation_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "criticality" "SuccessionCriticality" NOT NULL DEFAULT 'HIGH',
    "risk_of_loss" TEXT NOT NULL DEFAULT 'MEDIUM',
    "impact_of_loss" TEXT NOT NULL DEFAULT 'HIGH',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "succession_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "successor_pools" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "readiness" "SuccessorReadiness" NOT NULL DEFAULT 'READY_IN_1_YEAR',
    "flight_risk" TEXT NOT NULL DEFAULT 'LOW',
    "nine_box_position" "NineBoxGridPosition" NOT NULL DEFAULT 'HIGH_PERFORMER_GROWTH',
    "development_plan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "successor_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_category_masters" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "useful_life_years" INTEGER NOT NULL DEFAULT 3,
    "salvage_value_percent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "depreciation_method" "DepreciationMethod" NOT NULL DEFAULT 'STRAIGHT_LINE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_category_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_vendors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "contact_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "tax_id" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 5.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID,
    "vendor_id" UUID,
    "category" "AssetCategory" NOT NULL DEFAULT 'LAPTOP',
    "asset_code" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "brand" TEXT,
    "specifications_json" JSONB NOT NULL DEFAULT '{}',
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "purchase_cost" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "location" TEXT,
    "condition" "AssetCondition" NOT NULL DEFAULT 'BRAND_NEW',
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "current_holder_id" UUID,
    "depreciation_method" "DepreciationMethod" NOT NULL DEFAULT 'STRAIGHT_LINE',
    "useful_life_years" INTEGER NOT NULL DEFAULT 3,
    "salvage_value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_scrapped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "issued_by_id" UUID,
    "assigned_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_date" TIMESTAMP(3),
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "return_condition" "AssetCondition",
    "agreement_url" TEXT,
    "notes" TEXT,
    "is_returned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "type" "AssetTransactionType" NOT NULL,
    "from_employee_id" UUID,
    "to_employee_id" UUID,
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "details_json" JSONB NOT NULL DEFAULT '{}',
    "action_by_user_id" UUID,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_maintenances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "type" "MaintenanceType" NOT NULL DEFAULT 'CORRECTIVE',
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "service_provider" TEXT,
    "invoice_number" TEXT,
    "is_under_warranty" BOOLEAN NOT NULL DEFAULT false,
    "is_under_amc" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_warranties" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "vendor_id" UUID,
    "warranty_code" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "coverage_terms" TEXT,
    "document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_amcs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "vendor_id" UUID,
    "contract_number" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "service_frequency" TEXT NOT NULL DEFAULT 'QUARTERLY',
    "document_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_amcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "software_licenses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "type" "LicenseType" NOT NULL DEFAULT 'SEAT_BASED',
    "license_key" TEXT,
    "total_seats" INTEGER NOT NULL DEFAULT 1,
    "cost_per_seat" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "vendor_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "software_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "license_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "assigned_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "license_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'CONSUMABLE',
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 10,
    "unit_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "supplier" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IN',
    "quantity" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "action_by_user" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'HARDWARE',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "source" "TicketSource" NOT NULL DEFAULT 'PORTAL',
    "created_by_id" UUID NOT NULL,
    "assignee_id" UUID,
    "asset_id" UUID,
    "response_due_at" TIMESTAMP(3),
    "resolution_due_at" TIMESTAMP(3),
    "first_responded_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "is_sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "reopen_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolution_notes" TEXT,
    "satisfaction_score" INTEGER,
    "feedback_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_slas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "response_target_minutes" INTEGER NOT NULL,
    "resolve_target_minutes" INTEGER NOT NULL,
    "escalation_level_1_hours" INTEGER NOT NULL DEFAULT 4,
    "escalation_level_2_hours" INTEGER NOT NULL DEFAULT 12,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_slas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_escalations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "escalated_to" TEXT,
    "action_taken" TEXT,
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FacilityType" NOT NULL DEFAULT 'MEETING_ROOM',
    "building" TEXT,
    "floor" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 6,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_bookings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "attendees" INTEGER NOT NULL DEFAULT 1,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "purpose" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "desk_number" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "type" "DeskType" NOT NULL DEFAULT 'HOT_DESK',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "desks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desk_allocations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "desk_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_permanent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "desk_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "registration_number" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SEDAN',
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "insurance_expiry" TIMESTAMP(3),
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "current_odometer" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_bookings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "passengers" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "logType" TEXT NOT NULL DEFAULT 'TRIP',
    "odometer_reading" DOUBLE PRECISION NOT NULL,
    "fuel_liters" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION DEFAULT 0.0,
    "remarks" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT,
    "id_proof_type" TEXT,
    "id_proof_num" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_visits" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "visitor_id" UUID NOT NULL,
    "host_id" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "status" "VisitorStatus" NOT NULL DEFAULT 'PRE_REGISTERED',
    "pass_code" TEXT NOT NULL,
    "qr_code_url" TEXT,
    "badge_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_passes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "visitor_id" UUID NOT NULL,
    "pass_number" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_passes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pass_number" TEXT NOT NULL,
    "type" "GatePassType" NOT NULL DEFAULT 'MATERIAL_OUTWARD',
    "requester_id" UUID NOT NULL,
    "item_description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "serial_numbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "destination" TEXT NOT NULL,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "status" "GatePassStatus" NOT NULL DEFAULT 'DRAFT',
    "manager_approved" BOOLEAN NOT NULL DEFAULT false,
    "security_cleared" BOOLEAN NOT NULL DEFAULT false,
    "exit_time" TIMESTAMP(3),
    "return_expected" BOOLEAN NOT NULL DEFAULT false,
    "expected_return" TIMESTAMP(3),
    "actual_return" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "contract_code" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_workers" INTEGER NOT NULL DEFAULT 1,
    "safety_doc_url" TEXT,
    "status" "ContractorStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_accesses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "worker_name" TEXT NOT NULL,
    "badge_number" TEXT NOT NULL,
    "allowed_zones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exit_clearances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "resignation_date" TIMESTAMP(3) NOT NULL,
    "last_working_day" TIMESTAMP(3) NOT NULL,
    "status" "ClearanceStatus" NOT NULL DEFAULT 'INITIATED',
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exit_clearances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clearance_tasks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "clearance_id" UUID NOT NULL,
    "department" "ClearanceDepartment" NOT NULL,
    "task_name" TEXT NOT NULL,
    "description" TEXT,
    "assignee_id" UUID,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "remarks" TEXT,
    "assets_recovered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dues_amount" DOUBLE PRECISION DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clearance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_category_masters" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ExpenseCategoryType" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_amount" DOUBLE PRECISION,
    "requires_receipt" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_category_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_policies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExpenseCategoryType" NOT NULL,
    "max_amount_per_item" DOUBLE PRECISION,
    "max_amount_per_day" DOUBLE PRECISION,
    "max_amount_per_month" DOUBLE PRECISION,
    "mileage_rate_per_km" DOUBLE PRECISION,
    "per_diem_rate" DOUBLE PRECISION,
    "allowed_travel_class" "TravelClass"[] DEFAULT ARRAY[]::"TravelClass"[],
    "hard_limit" BOOLEAN NOT NULL DEFAULT false,
    "auto_reject" BOOLEAN NOT NULL DEFAULT false,
    "warning_threshold" DOUBLE PRECISION,
    "requires_pre_approval" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_claims" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "claim_number" TEXT NOT NULL,
    "employee_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ExpenseClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approved_amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "cost_center_id" UUID,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "policy_violations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "claim_id" UUID NOT NULL,
    "category_id" UUID,
    "category" "ExpenseCategoryType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst_number" TEXT,
    "gst_amount" DOUBLE PRECISION DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "expense_date" TIMESTAMP(3) NOT NULL,
    "merchant_name" TEXT,
    "invoice_number" TEXT,
    "mileage_km" DOUBLE PRECISION,
    "mileage_rate" DOUBLE PRECISION,
    "approved_amount" DOUBLE PRECISION,
    "is_violation" BOOLEAN NOT NULL DEFAULT false,
    "violation_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_receipts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER,
    "ocr_merchant" TEXT,
    "ocr_invoice_number" TEXT,
    "ocr_date" TIMESTAMP(3),
    "ocr_amount" DOUBLE PRECISION,
    "ocr_gst_number" TEXT,
    "ocr_tax_amount" DOUBLE PRECISION,
    "ocr_raw_json" JSONB,
    "content_hash" TEXT,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_approvals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "claim_id" UUID NOT NULL,
    "approver_id" UUID NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "approved_amount" DOUBLE PRECISION,
    "action_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_audits" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "claim_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" UUID NOT NULL,
    "previous_status" TEXT,
    "new_status" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "request_number" TEXT NOT NULL,
    "employee_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "travel_type" TEXT NOT NULL DEFAULT 'DOMESTIC',
    "status" "TravelRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "estimated_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actual_spend" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "cost_center_id" UUID,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by" UUID,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_segments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "segment_order" INTEGER NOT NULL DEFAULT 1,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "travel_mode" TEXT NOT NULL,
    "travel_class" "TravelClass" NOT NULL DEFAULT 'ECONOMY',
    "estimated_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actual_cost" DOUBLE PRECISION,
    "booking_ref" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_advances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "AdvanceStatus" NOT NULL DEFAULT 'REQUESTED',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "disbursed_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_advances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_settlements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "total_advance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_actual_spend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance_due" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refund_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "settled_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "manager_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_budgets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cost_center_id" UUID NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "total_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "allocated_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consumed_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "warning_threshold" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_allocations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "budget_id" UUID NOT NULL,
    "cost_center_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference_type" TEXT,
    "reference_id" UUID,
    "allocated_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_groups" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "group_id" UUID,
    "parent_id" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "opening_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_periods" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "month" INTEGER,
    "quarter" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "AccountingPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "locked_at" TIMESTAMP(3),
    "locked_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "period_id" UUID,
    "entry_number" TEXT NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "source_type" TEXT,
    "source_id" UUID,
    "narration" TEXT NOT NULL,
    "status" "JournalStatus" NOT NULL DEFAULT 'DRAFT',
    "total_debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMP(3),
    "posted_at" TIMESTAMP(3),
    "reversed_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entry_lines" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "journal_entry_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "description" TEXT,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_ledger_entries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "journal_entry_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "period_id" UUID,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source_type" TEXT,
    "source_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "pan" TEXT,
    "address_json" JSONB,
    "risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_bank_accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ifsc" TEXT,
    "branch" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "document_type" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "pan" TEXT,
    "address_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "taxable_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_invoice_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "gst_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxable_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_payments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "invoice_id" UUID,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "mode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "taxable_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tds_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_invoice_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "gst_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxable_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_payments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "invoice_id" UUID,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "mode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "account_name" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ifsc" TEXT,
    "branch" TEXT,
    "opening_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "statement_number" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "file_object_key" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "statement_id" UUID,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "type" "BankTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "narration" TEXT,
    "reconciliation_status" "ReconciliationStatus" NOT NULL DEFAULT 'UNMATCHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_reconciliations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "bank_transaction_id" UUID NOT NULL,
    "matched_reference_type" TEXT,
    "matched_reference_id" UUID,
    "match_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'UNMATCHED',
    "notes" TEXT,
    "reconciled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_ledgers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tax_type" "TaxType" NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" UUID,
    "taxable_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_input_tax" BOOLEAN NOT NULL DEFAULT false,
    "period" TEXT NOT NULL,
    "remitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gst_returns" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "return_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "input_tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "output_tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_liability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "filed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gst_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gst_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "gst_return_id" UUID,
    "taxType" "TaxType" NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" UUID,
    "gstin" TEXT,
    "taxable_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gst_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_integrations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" "ERPProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "erp_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_connections" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "integration_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "credentials_ref" TEXT,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "erp_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_jobs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "integration_id" UUID NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" "ERPJobStatus" NOT NULL DEFAULT 'QUEUED',
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "erp_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_job_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "erp_job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_statement_snapshots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "statement_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_statement_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_scopes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApiCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "rate_limit_per_minute" INTEGER NOT NULL DEFAULT 60,
    "expires_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_clients" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret_hash" TEXT NOT NULL,
    "redirect_uris" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApiCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_tokens" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_id_ref" UUID NOT NULL,
    "access_token_hash" TEXT NOT NULL,
    "refresh_token_hash" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApiCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "api_key_id" UUID,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "latency_ms" INTEGER NOT NULL DEFAULT 0,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_webhooks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secret_hash" TEXT NOT NULL,
    "status" "ApiCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "retry_count" INTEGER NOT NULL DEFAULT 3,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "webhook_id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "delivery_status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMP(3),
    "last_error" TEXT,
    "last_delivered_at" TIMESTAMP(3),
    "payload" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_runs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rule_id" UUID NOT NULL,
    "status" "AutomationRunStatus" NOT NULL DEFAULT 'QUEUED',
    "trigger_payload" JSONB NOT NULL,
    "action_results" JSONB NOT NULL DEFAULT '[]',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_integrations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "category" "IntegrationProviderCategory" NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "ApiCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "encrypted_config" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_sync_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sso_configurations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "protocol" "SSOProtocol" NOT NULL,
    "issuer" TEXT,
    "client_id" TEXT,
    "encrypted_secret" TEXT,
    "metadata_url" TEXT,
    "role_mapping" JSONB NOT NULL DEFAULT '{}',
    "group_mapping" JSONB NOT NULL DEFAULT '{}',
    "jit_provisioning" BOOLEAN NOT NULL DEFAULT true,
    "auto_deactivation" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sso_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "status" "KnowledgeArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_versions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "change_note" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "knowledge_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_attachments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "content_type" TEXT,
    "file_size_bytes" INTEGER,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "knowledge_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_apps" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "category" "IntegrationProviderCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "required_scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "billing_ready" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_installs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "app_id" UUID NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApiCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "installed_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_installs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_courses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "delivery_type" "CourseDeliveryType" NOT NULL DEFAULT 'SELF_PACED',
    "difficulty" "CourseDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimated_duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "passing_score_percent" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "is_compliance" BOOLEAN NOT NULL DEFAULT false,
    "validity_months" INTEGER,
    "department_id" UUID,
    "designation_id" UUID,
    "thumbnail_url" TEXT,
    "published_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content_type" "LessonContentType" NOT NULL DEFAULT 'VIDEO',
    "content_url" TEXT,
    "text_content" TEXT,
    "duration_minutes" INTEGER NOT NULL DEFAULT 10,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_attachments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER,
    "file_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "watch_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "is_passed" BOOLEAN NOT NULL DEFAULT false,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "assigned_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "department_id" UUID,
    "designation_id" UUID,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "estimated_hours" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_courses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "learning_path_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_path_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_enrollments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "learning_path_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_path_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID,
    "title" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL DEFAULT 'QUIZ',
    "time_limit_minutes" INTEGER NOT NULL DEFAULT 30,
    "passing_percent" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT true,
    "negative_marking" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_questions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE_MCQ',
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "negative_points" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "explanation" TEXT,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_options" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "option_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "assessment_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_attempts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "enrollment_id" UUID,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "score_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "points_earned" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "points_possible" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_passed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_certifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LmsCertificationType" NOT NULL DEFAULT 'INTERNAL',
    "validity_months" INTEGER NOT NULL DEFAULT 12,
    "issuing_authority" TEXT NOT NULL DEFAULT 'VC Organics Academy',
    "badge_image_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_certifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "certificate_url" TEXT,
    "score_percent" DOUBLE PRECISION,
    "renewal_reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "level_1_desc" TEXT,
    "level_2_desc" TEXT,
    "level_3_desc" TEXT,
    "level_4_desc" TEXT,
    "level_5_desc" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_skills" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "current_proficiency" INTEGER NOT NULL DEFAULT 1,
    "target_proficiency" INTEGER NOT NULL DEFAULT 3,
    "self_rating" INTEGER,
    "manager_rating" INTEGER,
    "verified_by_user_id" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "is_external" BOOLEAN NOT NULL DEFAULT false,
    "rating_average" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "instructor_id" UUID,
    "title" TEXT NOT NULL,
    "status" "TrainingSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "session_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "location_or_url" TEXT,
    "max_attendees" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_attendances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "check_in_time" TIMESTAMP(3),
    "feedback_rating" DOUBLE PRECISION,
    "feedback_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "position_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department_id" UUID,
    "business_unit_id" UUID,
    "grade" TEXT,
    "level" TEXT,
    "reports_to_position_id" UUID,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "is_critical_role" BOOLEAN NOT NULL DEFAULT false,
    "approved_headcount" INTEGER NOT NULL DEFAULT 1,
    "filled_headcount" INTEGER NOT NULL DEFAULT 0,
    "open_headcount" INTEGER NOT NULL DEFAULT 1,
    "budgeted_annual_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PositionLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "frozen_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "position_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "headcount_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "period_type" "HeadcountPeriodType" NOT NULL DEFAULT 'ANNUAL',
    "department_id" UUID,
    "business_unit_id" UUID,
    "location_id" UUID,
    "current_headcount" INTEGER NOT NULL DEFAULT 0,
    "approved_headcount" INTEGER NOT NULL DEFAULT 0,
    "forecast_headcount" INTEGER NOT NULL DEFAULT 0,
    "budget_headcount" INTEGER NOT NULL DEFAULT 0,
    "vacancy_headcount" INTEGER NOT NULL DEFAULT 0,
    "status" "HeadcountPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "headcount_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "headcount_scenarios" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "growth_case" "GrowthScenarioCase" NOT NULL DEFAULT 'EXPECTED_CASE',
    "headcount_delta" INTEGER NOT NULL DEFAULT 0,
    "budget_delta" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "scenario_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "impact_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "headcount_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workforce_cost_forecasts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID,
    "department_id" UUID,
    "period_label" TEXT NOT NULL,
    "salary_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "benefits_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "contributions_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "recruitment_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "training_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "asset_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_workforce_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workforce_cost_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_structure_versions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "version_name" TEXT NOT NULL,
    "status" "OrgVersionStatus" NOT NULL DEFAULT 'ACTIVE',
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_nodes" INTEGER NOT NULL DEFAULT 0,
    "max_layers" INTEGER NOT NULL DEFAULT 1,
    "avg_span_of_control" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "complexity_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "snapshot_data" JSONB NOT NULL DEFAULT '{}',
    "created_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_structure_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attrition_risk_assessments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "risk_category" "AttritionRiskTier" NOT NULL DEFAULT 'LOW',
    "primary_drivers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mitigating_factors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommended_actions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assessment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attrition_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_supply_demand_forecasts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "skill_id" UUID,
    "skill_name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Technical',
    "current_supply_count" INTEGER NOT NULL DEFAULT 0,
    "future_demand_count" INTEGER NOT NULL DEFAULT 0,
    "gap_count" INTEGER NOT NULL DEFAULT 0,
    "deficit_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_horizon_months" INTEGER NOT NULL DEFAULT 12,
    "recommended_training_track" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_supply_demand_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_devices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "device_name" TEXT NOT NULL,
    "device_type" TEXT NOT NULL DEFAULT 'BIOMETRIC_TERMINAL',
    "vendor" "BiometricDeviceVendor" NOT NULL DEFAULT 'ESSL',
    "serial_number" TEXT NOT NULL,
    "site_location_id" UUID,
    "ip_address" TEXT,
    "port" INTEGER,
    "sync_mode" "BiometricDeviceSyncMode" NOT NULL DEFAULT 'PUSH',
    "status" "BiometricDeviceStatus" NOT NULL DEFAULT 'ONLINE',
    "last_heartbeat_at" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "total_punches_recorded" INTEGER NOT NULL DEFAULT 0,
    "failed_punches_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_punches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "employee_id" UUID,
    "biometric_user_id" TEXT NOT NULL,
    "punch_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "punch_type" TEXT NOT NULL DEFAULT 'CHECK_IN',
    "verification_mode" TEXT NOT NULL DEFAULT 'FINGERPRINT',
    "raw_payload" JSONB NOT NULL DEFAULT '{}',
    "is_synced_to_attendance" BOOLEAN NOT NULL DEFAULT false,
    "attendance_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biometric_punches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_sync_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "sync_start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "records_inserted" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_swap_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "requester_employee_id" UUID NOT NULL,
    "target_employee_id" UUID NOT NULL,
    "source_shift_id" UUID NOT NULL,
    "target_shift_id" UUID NOT NULL,
    "swap_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ShiftSwapStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_swap_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "attendance_id" UUID,
    "overtime_date" TIMESTAMP(3) NOT NULL,
    "overtime_type" "OvertimeType" NOT NULL DEFAULT 'DAILY_OT',
    "requested_minutes" INTEGER NOT NULL DEFAULT 60,
    "approved_minutes" INTEGER NOT NULL DEFAULT 0,
    "hourly_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "estimated_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reason" TEXT NOT NULL,
    "status" "OvertimeStatus" NOT NULL DEFAULT 'PENDING',
    "manager_approved_by_user_id" UUID,
    "manager_approved_at" TIMESTAMP(3),
    "hr_approved_by_user_id" UUID,
    "hr_approved_at" TIMESTAMP(3),
    "payroll_cycle_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_anomalies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "attendance_id" UUID,
    "anomaly_date" TIMESTAMP(3) NOT NULL,
    "anomaly_type" "AnomalyType" NOT NULL,
    "severity" "AnomalySeverity" NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT NOT NULL,
    "recommended_action" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by_user_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_attendances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "contractor_name" TEXT NOT NULL,
    "contractor_code" TEXT NOT NULL,
    "site_location_id" UUID,
    "gate_pass_id" UUID,
    "check_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out_time" TIMESTAMP(3),
    "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hourly_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workforce_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "schedule_name" TEXT NOT NULL,
    "department_id" UUID,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "target_headcount" INTEGER NOT NULL DEFAULT 0,
    "scheduled_headcount" INTEGER NOT NULL DEFAULT 0,
    "coverage_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "understaffed_hours_count" INTEGER NOT NULL DEFAULT 0,
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "schedule_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workforce_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_cycles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "PayrollFrequency" NOT NULL DEFAULT 'MONTHLY',
    "start_day" INTEGER NOT NULL DEFAULT 1,
    "end_day" INTEGER NOT NULL DEFAULT 30,
    "payout_day" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_tax_declarations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "financial_year" TEXT NOT NULL,
    "tax_regime" "TaxRegime" NOT NULL DEFAULT 'NEW',
    "section_80c" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "section_80d" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "section_24_home_loan_interest" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "section_80ccd_nps" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hra_exemption_rent_paid_annual" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_metro_city" BOOLEAN NOT NULL DEFAULT false,
    "other_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "TaxDeclarationStatus" NOT NULL DEFAULT 'DRAFT',
    "verified_by_user_id" UUID,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_tax_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_tax_proofs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "declaration_id" UUID NOT NULL,
    "section" TEXT NOT NULL,
    "claimed_amount" DOUBLE PRECISION NOT NULL,
    "verified_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "document_url" TEXT NOT NULL,
    "status" "TaxProofStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_tax_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_tax_computations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "financial_year" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "tax_regime" "TaxRegime" NOT NULL,
    "gross_taxable_annual" DOUBLE PRECISION NOT NULL,
    "standard_deduction" DOUBLE PRECISION NOT NULL DEFAULT 75000.0,
    "total_exemptions" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_deductions_80c_to_80u" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_taxable_income" DOUBLE PRECISION NOT NULL,
    "calculated_tax" DOUBLE PRECISION NOT NULL,
    "rebate_87a" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "surcharge" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "health_and_education_cess" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_tax_payable_annual" DOUBLE PRECISION NOT NULL,
    "tds_deducted_so_far" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "monthly_tds_deduction" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_tax_computations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_settlements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "resignation_date" TIMESTAMP(3) NOT NULL,
    "last_working_date" TIMESTAMP(3) NOT NULL,
    "settlement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notice_period_days" INTEGER NOT NULL DEFAULT 30,
    "notice_shortfall_days" INTEGER NOT NULL DEFAULT 0,
    "notice_recovery_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "leave_encashment_days" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "leave_encashment_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "gratuity_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "variable_pay_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "bonus_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "other_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "other_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "gross_settlement_amount" DOUBLE PRECISION NOT NULL,
    "total_deductions" DOUBLE PRECISION NOT NULL,
    "net_settlement_payable" DOUBLE PRECISION NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "settlement_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_gratuities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "date_of_joining" TIMESTAMP(3) NOT NULL,
    "date_of_leaving" TIMESTAMP(3) NOT NULL,
    "total_service_years" DOUBLE PRECISION NOT NULL,
    "is_eligible" BOOLEAN NOT NULL DEFAULT true,
    "last_drawn_basic_salary" DOUBLE PRECISION NOT NULL,
    "last_drawn_da" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "gratuity_calculated_amount" DOUBLE PRECISION NOT NULL,
    "gratuity_tax_exempt_amount" DOUBLE PRECISION NOT NULL,
    "gratuity_taxable_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "GratuityStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_gratuities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_bonuses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "bonus_type" "BonusType" NOT NULL DEFAULT 'PERFORMANCE',
    "financial_year" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "bonus_amount" DOUBLE PRECISION NOT NULL,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "payout_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_incentives" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "incentive_type" "IncentiveType" NOT NULL DEFAULT 'KPI_REWARD',
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "target_metric" TEXT NOT NULL,
    "achieved_metric" TEXT NOT NULL,
    "incentive_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_incentives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_arrears" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "effective_from_month" INTEGER NOT NULL,
    "effective_from_year" INTEGER NOT NULL,
    "effective_to_month" INTEGER NOT NULL,
    "effective_to_year" INTEGER NOT NULL,
    "total_arrear_amount" DOUBLE PRECISION NOT NULL,
    "payout_month" INTEGER NOT NULL,
    "payout_year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_arrears_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_loans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "loan_type" "LoanType" NOT NULL DEFAULT 'SALARY_ADVANCE',
    "principal_amount" DOUBLE PRECISION NOT NULL,
    "annual_interest_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_installments" INTEGER NOT NULL DEFAULT 1,
    "remaining_installments" INTEGER NOT NULL DEFAULT 1,
    "monthly_emi_amount" DOUBLE PRECISION NOT NULL,
    "disbursed_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_loan_installments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "principal_component" DOUBLE PRECISION NOT NULL,
    "interest_component" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_loan_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compensation_revisions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "current_ctc" DOUBLE PRECISION NOT NULL,
    "proposed_ctc" DOUBLE PRECISION NOT NULL,
    "percentage_hike" DOUBLE PRECISION NOT NULL,
    "revision_type" "RevisionType" NOT NULL DEFAULT 'ANNUAL_APPRAISAL',
    "effective_date" TIMESTAMP(3) NOT NULL,
    "status" "RevisionStatus" NOT NULL DEFAULT 'PROPOSED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compensation_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_bands" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "band_code" TEXT NOT NULL,
    "band_name" TEXT NOT NULL,
    "job_level" TEXT NOT NULL,
    "min_ctc" DOUBLE PRECISION NOT NULL,
    "mid_ctc" DOUBLE PRECISION NOT NULL,
    "max_ctc" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_benchmarks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "job_title" TEXT NOT NULL,
    "industry_sector" TEXT NOT NULL DEFAULT 'Manufacturing & Agritech',
    "experience_level" TEXT NOT NULL,
    "p25_ctc" DOUBLE PRECISION NOT NULL,
    "p50_ctc" DOUBLE PRECISION NOT NULL,
    "p75_ctc" DOUBLE PRECISION NOT NULL,
    "p90_ctc" DOUBLE PRECISION NOT NULL,
    "survey_source" TEXT NOT NULL DEFAULT 'Aon Hewitt & Radford',
    "survey_year" INTEGER NOT NULL DEFAULT 2026,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_surveys" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "survey_type" TEXT NOT NULL DEFAULT 'ANNUAL_ENGAGEMENT',
    "status" "EngagementSurveyStatus" NOT NULL DEFAULT 'DRAFT',
    "is_anonymous" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "target_department_id" UUID,
    "target_location_id" UUID,
    "total_invited" INTEGER NOT NULL DEFAULT 0,
    "total_responded" INTEGER NOT NULL DEFAULT 0,
    "average_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_questions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "survey_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "SurveyQuestionType" NOT NULL DEFAULT 'RATING_1_5',
    "order" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL DEFAULT 'CULTURE',
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "survey_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "employee_id" UUID,
    "rating_value" DOUBLE PRECISION,
    "text_value" TEXT,
    "selected_options" JSONB,
    "sentiment_score" DOUBLE PRECISION,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_surveys" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "frequency" "PulseFrequency" NOT NULL DEFAULT 'WEEKLY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL DEFAULT 'HAPPINESS',
    "total_responses" INTEGER NOT NULL DEFAULT 0,
    "average_happiness_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pulse_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_responses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pulse_survey_id" UUID NOT NULL,
    "employee_id" UUID,
    "happiness_rating" INTEGER NOT NULL DEFAULT 3,
    "stress_rating" INTEGER NOT NULL DEFAULT 2,
    "energy_rating" INTEGER NOT NULL DEFAULT 3,
    "note" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pulse_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enps_campaigns" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "EngagementSurveyStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_responses" INTEGER NOT NULL DEFAULT 0,
    "promoters_count" INTEGER NOT NULL DEFAULT 0,
    "passives_count" INTEGER NOT NULL DEFAULT 0,
    "detractors_count" INTEGER NOT NULL DEFAULT 0,
    "enps_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enps_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enps_responses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "employee_id" UUID,
    "score" INTEGER NOT NULL,
    "category" "ENPSCategory" NOT NULL DEFAULT 'PASSIVE',
    "feedback_text" TEXT,
    "sentiment" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enps_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognition_badges" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "badge_name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🌟',
    "category" TEXT NOT NULL DEFAULT 'CORE_VALUES',
    "description" TEXT NOT NULL,
    "points_value" INTEGER NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recognition_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognitions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sender_employee_id" UUID NOT NULL,
    "receiver_employee_id" UUID NOT NULL,
    "badge_id" UUID,
    "recognition_type" "RecognitionType" NOT NULL DEFAULT 'PEER_APPRECIATION',
    "message" TEXT NOT NULL,
    "points_awarded" INTEGER NOT NULL DEFAULT 50,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "is_milestone" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_badges" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_point_ledgers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "transaction_type" "RewardLedgerType" NOT NULL,
    "points" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reference_type" TEXT NOT NULL DEFAULT 'RECOGNITION',
    "reference_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_point_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_catalogs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GIFT_CARD',
    "points_cost" INTEGER NOT NULL,
    "cash_value_equivalent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "stock_quantity" INTEGER NOT NULL DEFAULT 100,
    "image_url" TEXT,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "catalog_item_id" UUID NOT NULL,
    "points_redeemed" INTEGER NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillment_details" JSONB NOT NULL DEFAULT '{}',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_communities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "community_type" "CommunityType" NOT NULL DEFAULT 'INTEREST_GROUP',
    "icon" TEXT NOT NULL DEFAULT '💬',
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "member_count" INTEGER NOT NULL DEFAULT 1,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_members" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "community_id" UUID,
    "author_employee_id" UUID NOT NULL,
    "post_type" "PostType" NOT NULL DEFAULT 'GENERAL',
    "content" TEXT NOT NULL,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "author_employee_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_reactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "post_id" UUID,
    "comment_id" UUID,
    "employee_id" UUID NOT NULL,
    "reaction_type" TEXT NOT NULL DEFAULT 'LIKE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PROCESS_IMPROVEMENT',
    "upvotes_count" INTEGER NOT NULL DEFAULT 0,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "admin_feedback" TEXT,
    "reward_points_granted" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_votes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "suggestion_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "is_upvote" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestion_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innovation_challenges" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reward_points_pool" INTEGER NOT NULL DEFAULT 10000,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'OPEN',
    "submissions_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innovation_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innovation_submissions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "team_members" JSONB NOT NULL DEFAULT '[]',
    "proposal_title" TEXT NOT NULL,
    "executive_summary" TEXT NOT NULL,
    "detailed_pitch" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" DOUBLE PRECISION,
    "rank" INTEGER,
    "reward_points_won" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innovation_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "culture_metrics" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "metric_date" TIMESTAMP(3) NOT NULL,
    "overall_engagement_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "overall_happiness_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "current_enps" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "recognition_activity_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reward_redemption_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "manager_effectiveness_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "culture_health_index" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "dimension_scores" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "culture_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_sentiments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "recorded_date" TIMESTAMP(3) NOT NULL,
    "mood" "SentimentMood" NOT NULL DEFAULT 'HAPPY',
    "happiness_score" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "burnout_risk_score" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "burnout_risk_level" "BurnoutRiskLevel" NOT NULL DEFAULT 'LOW',
    "work_life_balance_score" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "manager_relationship_score" DOUBLE PRECISION NOT NULL DEFAULT 8.5,
    "ai_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_sentiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_score_snapshots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID,
    "period" TEXT NOT NULL,
    "engagement_index" DOUBLE PRECISION NOT NULL,
    "morale_index" DOUBLE PRECISION NOT NULL,
    "burnout_index" DOUBLE PRECISION NOT NULL,
    "retention_risk_percent" DOUBLE PRECISION NOT NULL,
    "key_drivers" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_letters" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "letter_type" "LetterType" NOT NULL DEFAULT 'EMPLOYMENT_CONFIRMATION',
    "title" TEXT NOT NULL,
    "template_body" TEXT NOT NULL,
    "rendered_content" TEXT NOT NULL,
    "status" "LetterStatus" NOT NULL DEFAULT 'DRAFT',
    "issued_at" TIMESTAMP(3),
    "issued_by" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_articles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PAYROLL',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'HR_GENERAL',
    "description" TEXT NOT NULL,
    "document_url" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effective_date" TIMESTAMP(3) NOT NULL,
    "acknowledgement_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_contracts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "contract_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "value_in_inr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "terms_and_notes" TEXT,
    "sla_rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_compliances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "compliance_type" TEXT NOT NULL,
    "document_number" TEXT,
    "valid_until" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPLIANT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_compliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_rooms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "floor" TEXT,
    "building" TEXT,
    "amenities" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_slots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "slot_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL DEFAULT 'FOUR_WHEELER',
    "is_assigned" BOOLEAN NOT NULL DEFAULT false,
    "assigned_to_name" TEXT,
    "assigned_vehicle_no" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_index_entries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "search_vector" TEXT NOT NULL,
    "metadata" JSONB,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_index_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_primary_domain_key" ON "tenants"("primary_domain");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenant_id_key" ON "tenant_settings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_branding_tenant_id_key" ON "tenant_branding"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_domains_domain_key" ON "tenant_domains"("domain");

-- CreateIndex
CREATE INDEX "tenant_domains_tenant_id_idx" ON "tenant_domains"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_feature_flags_tenant_id_idx" ON "tenant_feature_flags"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_feature_flags_tenant_id_key_key" ON "tenant_feature_flags"("tenant_id", "key");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "platform_users_email_key" ON "platform_users"("email");

-- CreateIndex
CREATE INDEX "tenant_memberships_tenant_id_status_idx" ON "tenant_memberships"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "tenant_memberships_tenant_id_employee_id_idx" ON "tenant_memberships"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_memberships_tenant_id_user_id_key" ON "tenant_memberships"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "roles_tenant_id_idx" ON "roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_code_key" ON "roles"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "tenant_membership_roles_tenant_id_membership_id_idx" ON "tenant_membership_roles"("tenant_id", "membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_membership_roles_tenant_id_membership_id_role_id_key" ON "tenant_membership_roles"("tenant_id", "membership_id", "role_id");

-- CreateIndex
CREATE INDEX "tenant_role_permissions_tenant_id_role_id_idx" ON "tenant_role_permissions"("tenant_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_role_permissions_tenant_id_role_id_permission_id_key" ON "tenant_role_permissions"("tenant_id", "role_id", "permission_id");

-- CreateIndex
CREATE INDEX "sessions_tenant_id_user_id_idx" ON "sessions"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "sessions_tenant_id_membership_id_idx" ON "sessions"("tenant_id", "membership_id");

-- CreateIndex
CREATE INDEX "sessions_tenant_id_expires_at_idx" ON "sessions"("tenant_id", "expires_at");

-- CreateIndex
CREATE INDEX "otp_challenges_tenant_id_identifier_idx" ON "otp_challenges"("tenant_id", "identifier");

-- CreateIndex
CREATE INDEX "otp_challenges_expires_at_idx" ON "otp_challenges"("expires_at");

-- CreateIndex
CREATE INDEX "departments_tenant_id_status_idx" ON "departments"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenant_id_code_key" ON "departments"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "designations_tenant_id_department_id_idx" ON "designations"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "designations_tenant_id_department_id_code_key" ON "designations"("tenant_id", "department_id", "code");

-- CreateIndex
CREATE INDEX "employees_tenant_id_full_name_idx" ON "employees"("tenant_id", "full_name");

-- CreateIndex
CREATE INDEX "employees_tenant_id_phone_idx" ON "employees"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "employees_tenant_id_department_id_idx" ON "employees"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "employees_tenant_id_designation_id_idx" ON "employees"("tenant_id", "designation_id");

-- CreateIndex
CREATE INDEX "employees_tenant_id_manager_employee_id_idx" ON "employees"("tenant_id", "manager_employee_id");

-- CreateIndex
CREATE INDEX "employees_tenant_id_employment_type_idx" ON "employees"("tenant_id", "employment_type");

-- CreateIndex
CREATE INDEX "employees_tenant_id_joining_date_idx" ON "employees"("tenant_id", "joining_date");

-- CreateIndex
CREATE INDEX "employees_tenant_id_status_idx" ON "employees"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_employee_code_key" ON "employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_email_key" ON "employees"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "document_metadata_tenant_id_employee_id_idx" ON "document_metadata"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "document_metadata_tenant_id_document_type_idx" ON "document_metadata"("tenant_id", "document_type");

-- CreateIndex
CREATE INDEX "document_metadata_tenant_id_status_idx" ON "document_metadata"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "employee_status_history_tenant_id_employee_id_created_at_idx" ON "employee_status_history"("tenant_id", "employee_id", "created_at");

-- CreateIndex
CREATE INDEX "employee_status_history_tenant_id_new_status_idx" ON "employee_status_history"("tenant_id", "new_status");

-- CreateIndex
CREATE INDEX "employee_timeline_events_tenant_id_employee_id_created_at_idx" ON "employee_timeline_events"("tenant_id", "employee_id", "created_at");

-- CreateIndex
CREATE INDEX "employee_timeline_events_tenant_id_event_type_idx" ON "employee_timeline_events"("tenant_id", "event_type");

-- CreateIndex
CREATE INDEX "shifts_tenant_id_idx" ON "shifts"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_tenant_id_code_key" ON "shifts"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "shift_assignments_tenant_id_employee_id_idx" ON "shift_assignments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "shift_assignments_tenant_id_shift_id_idx" ON "shift_assignments"("tenant_id", "shift_id");

-- CreateIndex
CREATE INDEX "work_calendars_tenant_id_idx" ON "work_calendars"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_calendars_tenant_id_code_key" ON "work_calendars"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "holiday_calendars_tenant_id_idx" ON "holiday_calendars"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_calendars_tenant_id_code_key" ON "holiday_calendars"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "subscription_plans_is_active_idx" ON "subscription_plans"("is_active");

-- CreateIndex
CREATE INDEX "tenant_subscriptions_tenant_id_status_idx" ON "tenant_subscriptions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "tenant_subscriptions_plan_id_idx" ON "tenant_subscriptions"("plan_id");

-- CreateIndex
CREATE INDEX "usage_metrics_tenant_id_key_idx" ON "usage_metrics"("tenant_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "usage_metrics_tenant_id_key_period_period_start_key" ON "usage_metrics"("tenant_id", "key", "period", "period_start");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_actor_user_id_idx" ON "audit_logs"("tenant_id", "actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_resource_type_resource_id_idx" ON "audit_logs"("tenant_id", "resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "attendances_tenant_id_date_idx" ON "attendances"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "attendances_tenant_id_employee_id_idx" ON "attendances"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "attendances_tenant_id_status_idx" ON "attendances"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_tenant_id_employee_id_date_key" ON "attendances"("tenant_id", "employee_id", "date");

-- CreateIndex
CREATE INDEX "attendance_events_tenant_id_employee_id_timestamp_idx" ON "attendance_events"("tenant_id", "employee_id", "timestamp");

-- CreateIndex
CREATE INDEX "attendance_events_tenant_id_event_type_idx" ON "attendance_events"("tenant_id", "event_type");

-- CreateIndex
CREATE INDEX "attendance_events_tenant_id_attendance_id_idx" ON "attendance_events"("tenant_id", "attendance_id");

-- CreateIndex
CREATE INDEX "attendance_corrections_tenant_id_employee_id_idx" ON "attendance_corrections"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "attendance_corrections_tenant_id_status_idx" ON "attendance_corrections"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_rules_tenant_id_key" ON "attendance_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "attendance_exceptions_tenant_id_date_idx" ON "attendance_exceptions"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "attendance_exceptions_tenant_id_resolved_idx" ON "attendance_exceptions"("tenant_id", "resolved");

-- CreateIndex
CREATE INDEX "attendance_summaries_tenant_id_month_idx" ON "attendance_summaries"("tenant_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_summaries_tenant_id_employee_id_month_key" ON "attendance_summaries"("tenant_id", "employee_id", "month");

-- CreateIndex
CREATE INDEX "locations_tenant_id_is_active_idx" ON "locations"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "locations_tenant_id_type_idx" ON "locations"("tenant_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "locations_tenant_id_code_key" ON "locations"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "location_assignments_tenant_id_employee_id_idx" ON "location_assignments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "location_assignments_tenant_id_department_id_idx" ON "location_assignments"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "location_assignments_tenant_id_location_id_idx" ON "location_assignments"("tenant_id", "location_id");

-- CreateIndex
CREATE INDEX "location_verifications_tenant_id_employee_id_created_at_idx" ON "location_verifications"("tenant_id", "employee_id", "created_at");

-- CreateIndex
CREATE INDEX "location_verifications_tenant_id_status_idx" ON "location_verifications"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "location_verifications_tenant_id_location_id_idx" ON "location_verifications"("tenant_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "face_profiles_employee_id_key" ON "face_profiles"("employee_id");

-- CreateIndex
CREATE INDEX "face_profiles_tenant_id_status_idx" ON "face_profiles"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "face_profiles_tenant_id_employee_id_key" ON "face_profiles"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "face_embeddings_tenant_id_face_profile_id_idx" ON "face_embeddings"("tenant_id", "face_profile_id");

-- CreateIndex
CREATE INDEX "face_embeddings_tenant_id_is_active_idx" ON "face_embeddings"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "face_enrollments_tenant_id_employee_id_idx" ON "face_enrollments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "face_enrollments_tenant_id_status_idx" ON "face_enrollments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "face_verifications_tenant_id_employee_id_created_at_idx" ON "face_verifications"("tenant_id", "employee_id", "created_at");

-- CreateIndex
CREATE INDEX "face_verifications_tenant_id_status_idx" ON "face_verifications"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "liveness_verifications_tenant_id_employee_id_created_at_idx" ON "liveness_verifications"("tenant_id", "employee_id", "created_at");

-- CreateIndex
CREATE INDEX "liveness_verifications_tenant_id_status_idx" ON "liveness_verifications"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "leave_types_tenant_id_category_idx" ON "leave_types"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_tenant_id_code_key" ON "leave_types"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "leave_policies_tenant_id_leave_type_id_idx" ON "leave_policies"("tenant_id", "leave_type_id");

-- CreateIndex
CREATE INDEX "leave_balances_tenant_id_employee_id_idx" ON "leave_balances"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_tenant_id_employee_id_leave_type_id_year_key" ON "leave_balances"("tenant_id", "employee_id", "leave_type_id", "year");

-- CreateIndex
CREATE INDEX "leave_accrual_rules_tenant_id_policy_id_idx" ON "leave_accrual_rules"("tenant_id", "policy_id");

-- CreateIndex
CREATE INDEX "leave_accrual_transactions_tenant_id_employee_id_created_at_idx" ON "leave_accrual_transactions"("tenant_id", "employee_id", "created_at");

-- CreateIndex
CREATE INDEX "leave_requests_tenant_id_employee_id_status_idx" ON "leave_requests"("tenant_id", "employee_id", "status");

-- CreateIndex
CREATE INDEX "leave_requests_tenant_id_start_date_end_date_idx" ON "leave_requests"("tenant_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "leave_approvals_tenant_id_leave_request_id_idx" ON "leave_approvals"("tenant_id", "leave_request_id");

-- CreateIndex
CREATE INDEX "leave_attachments_tenant_id_leave_request_id_idx" ON "leave_attachments"("tenant_id", "leave_request_id");

-- CreateIndex
CREATE INDEX "holidays_tenant_id_date_idx" ON "holidays"("tenant_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_tenant_id_date_key" ON "holidays"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "salary_components_tenant_id_type_idx" ON "salary_components"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "salary_components_tenant_id_category_idx" ON "salary_components"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "salary_components_tenant_id_code_key" ON "salary_components"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "compensation_templates_tenant_id_is_active_idx" ON "compensation_templates"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "compensation_templates_tenant_id_code_key" ON "compensation_templates"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "compensation_template_items_tenant_id_template_id_idx" ON "compensation_template_items"("tenant_id", "template_id");

-- CreateIndex
CREATE INDEX "employee_compensations_tenant_id_employee_id_status_idx" ON "employee_compensations"("tenant_id", "employee_id", "status");

-- CreateIndex
CREATE INDEX "employee_compensations_tenant_id_effective_from_idx" ON "employee_compensations"("tenant_id", "effective_from");

-- CreateIndex
CREATE INDEX "employee_compensation_items_tenant_id_compensation_id_idx" ON "employee_compensation_items"("tenant_id", "compensation_id");

-- CreateIndex
CREATE INDEX "employee_compensation_histories_tenant_id_employee_id_revis_idx" ON "employee_compensation_histories"("tenant_id", "employee_id", "revision_date");

-- CreateIndex
CREATE INDEX "payroll_runs_tenant_id_status_idx" ON "payroll_runs"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payroll_runs_tenant_id_year_month_idx" ON "payroll_runs"("tenant_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_tenant_id_month_year_key" ON "payroll_runs"("tenant_id", "month", "year");

-- CreateIndex
CREATE INDEX "payroll_run_employees_tenant_id_payroll_run_id_idx" ON "payroll_run_employees"("tenant_id", "payroll_run_id");

-- CreateIndex
CREATE INDEX "payroll_run_employees_tenant_id_employee_id_idx" ON "payroll_run_employees"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_employees_payroll_run_id_employee_id_key" ON "payroll_run_employees"("payroll_run_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_component_breakdowns_tenant_id_payroll_run_employee_idx" ON "payroll_component_breakdowns"("tenant_id", "payroll_run_employee_id");

-- CreateIndex
CREATE INDEX "payroll_adjustments_tenant_id_payroll_run_id_idx" ON "payroll_adjustments"("tenant_id", "payroll_run_id");

-- CreateIndex
CREATE INDEX "payroll_adjustments_tenant_id_payroll_run_employee_id_idx" ON "payroll_adjustments"("tenant_id", "payroll_run_employee_id");

-- CreateIndex
CREATE INDEX "payroll_approvals_tenant_id_payroll_run_id_idx" ON "payroll_approvals"("tenant_id", "payroll_run_id");

-- CreateIndex
CREATE INDEX "payslips_tenant_id_employee_id_year_month_idx" ON "payslips"("tenant_id", "employee_id", "year", "month");

-- CreateIndex
CREATE INDEX "payslips_tenant_id_payroll_run_id_idx" ON "payslips"("tenant_id", "payroll_run_id");

-- CreateIndex
CREATE INDEX "payslips_tenant_id_status_idx" ON "payslips"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_payroll_run_employee_id_version_key" ON "payslips"("payroll_run_employee_id", "version");

-- CreateIndex
CREATE INDEX "payslip_distributions_tenant_id_payslip_id_idx" ON "payslip_distributions"("tenant_id", "payslip_id");

-- CreateIndex
CREATE INDEX "payslip_distributions_tenant_id_employee_id_idx" ON "payslip_distributions"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payslip_distributions_tenant_id_status_idx" ON "payslip_distributions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payslip_templates_tenant_id_is_default_idx" ON "payslip_templates"("tenant_id", "is_default");

-- CreateIndex
CREATE UNIQUE INDEX "payslip_templates_tenant_id_code_key" ON "payslip_templates"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "compliance_rules_tenant_id_type_idx" ON "compliance_rules"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "compliance_rules_tenant_id_state_idx" ON "compliance_rules"("tenant_id", "state");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_rules_tenant_id_code_key" ON "compliance_rules"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "compliance_rule_versions_tenant_id_rule_id_idx" ON "compliance_rule_versions"("tenant_id", "rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_rule_versions_rule_id_version_key" ON "compliance_rule_versions"("rule_id", "version");

-- CreateIndex
CREATE INDEX "compliance_snapshots_tenant_id_payroll_run_id_idx" ON "compliance_snapshots"("tenant_id", "payroll_run_id");

-- CreateIndex
CREATE INDEX "compliance_snapshots_tenant_id_employee_id_idx" ON "compliance_snapshots"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "compliance_snapshots_tenant_id_year_month_idx" ON "compliance_snapshots"("tenant_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_snapshots_payroll_run_employee_id_key" ON "compliance_snapshots"("payroll_run_employee_id");

-- CreateIndex
CREATE INDEX "dashboards_tenant_id_is_default_idx" ON "dashboards"("tenant_id", "is_default");

-- CreateIndex
CREATE INDEX "dashboards_tenant_id_created_by_id_idx" ON "dashboards"("tenant_id", "created_by_id");

-- CreateIndex
CREATE INDEX "report_definitions_tenant_id_category_idx" ON "report_definitions"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "report_definitions_tenant_id_code_key" ON "report_definitions"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "saved_reports_tenant_id_report_definition_id_idx" ON "saved_reports"("tenant_id", "report_definition_id");

-- CreateIndex
CREATE INDEX "saved_reports_tenant_id_created_by_id_idx" ON "saved_reports"("tenant_id", "created_by_id");

-- CreateIndex
CREATE INDEX "report_executions_tenant_id_status_idx" ON "report_executions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "report_executions_tenant_id_report_definition_id_idx" ON "report_executions"("tenant_id", "report_definition_id");

-- CreateIndex
CREATE INDEX "report_executions_tenant_id_created_at_idx" ON "report_executions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "report_schedules_tenant_id_is_active_idx" ON "report_schedules"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "report_schedules_tenant_id_next_run_at_idx" ON "report_schedules"("tenant_id", "next_run_at");

-- CreateIndex
CREATE INDEX "dashboard_widgets_tenant_id_user_id_idx" ON "dashboard_widgets"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "dashboard_widgets_tenant_id_dashboard_id_idx" ON "dashboard_widgets"("tenant_id", "dashboard_id");

-- CreateIndex
CREATE INDEX "analytics_snapshots_tenant_id_period_type_idx" ON "analytics_snapshots"("tenant_id", "period_type");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_tenant_id_snapshot_date_period_type_key" ON "analytics_snapshots"("tenant_id", "snapshot_date", "period_type");

-- CreateIndex
CREATE INDEX "notification_templates_tenant_id_channel_idx" ON "notification_templates"("tenant_id", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_tenant_id_code_channel_key" ON "notification_templates"("tenant_id", "code", "channel");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_recipient_user_id_status_idx" ON "notifications"("tenant_id", "recipient_user_id", "status");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_channel_status_idx" ON "notifications"("tenant_id", "channel", "status");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_status_next_retry_at_idx" ON "notifications"("tenant_id", "status", "next_retry_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_tenant_id_user_id_channel_key" ON "notification_preferences"("tenant_id", "user_id", "channel");

-- CreateIndex
CREATE INDEX "workflow_definitions_tenant_id_entity_type_idx" ON "workflow_definitions"("tenant_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_tenant_id_code_version_key" ON "workflow_definitions"("tenant_id", "code", "version");

-- CreateIndex
CREATE INDEX "workflow_instances_tenant_id_entity_type_entity_id_idx" ON "workflow_instances"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "workflow_instances_tenant_id_status_idx" ON "workflow_instances"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "workflow_step_executions_tenant_id_assignee_user_id_action_idx" ON "workflow_step_executions"("tenant_id", "assignee_user_id", "action");

-- CreateIndex
CREATE INDEX "workflow_audits_tenant_id_workflow_instance_id_idx" ON "workflow_audits"("tenant_id", "workflow_instance_id");

-- CreateIndex
CREATE INDEX "approval_templates_tenant_id_entity_type_idx" ON "approval_templates"("tenant_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "approval_templates_tenant_id_code_key" ON "approval_templates"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "approval_requests_tenant_id_status_idx" ON "approval_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "approval_requests_tenant_id_entity_type_entity_id_idx" ON "approval_requests"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "approval_actions_tenant_id_approver_user_id_idx" ON "approval_actions"("tenant_id", "approver_user_id");

-- CreateIndex
CREATE INDEX "business_units_tenant_id_parent_id_idx" ON "business_units"("tenant_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_units_tenant_id_code_key" ON "business_units"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "regions_tenant_id_business_unit_id_idx" ON "regions"("tenant_id", "business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "regions_tenant_id_code_key" ON "regions"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "teams_tenant_id_department_id_idx" ON "teams"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_tenant_id_code_key" ON "teams"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "suspicious_activities_tenant_id_severity_is_resolved_idx" ON "suspicious_activities"("tenant_id", "severity", "is_resolved");

-- CreateIndex
CREATE INDEX "suspicious_activities_tenant_id_user_id_idx" ON "suspicious_activities"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_employee_id_key" ON "employee_profiles"("employee_id");

-- CreateIndex
CREATE INDEX "employee_profiles_tenant_id_employee_id_idx" ON "employee_profiles"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "employee_documents_tenant_id_employee_id_idx" ON "employee_documents"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "employee_documents_tenant_id_document_type_idx" ON "employee_documents"("tenant_id", "document_type");

-- CreateIndex
CREATE INDEX "employee_documents_tenant_id_is_verified_idx" ON "employee_documents"("tenant_id", "is_verified");

-- CreateIndex
CREATE INDEX "employee_requests_tenant_id_employee_id_idx" ON "employee_requests"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "employee_requests_tenant_id_status_idx" ON "employee_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "employee_requests_tenant_id_request_type_idx" ON "employee_requests"("tenant_id", "request_type");

-- CreateIndex
CREATE INDEX "announcements_tenant_id_is_pinned_published_at_idx" ON "announcements"("tenant_id", "is_pinned", "published_at");

-- CreateIndex
CREATE INDEX "announcements_tenant_id_priority_idx" ON "announcements"("tenant_id", "priority");

-- CreateIndex
CREATE INDEX "acknowledgements_tenant_id_employee_id_idx" ON "acknowledgements"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "acknowledgements_tenant_id_announcement_id_employee_id_key" ON "acknowledgements"("tenant_id", "announcement_id", "employee_id");

-- CreateIndex
CREATE INDEX "ai_conversations_tenant_id_user_id_created_at_idx" ON "ai_conversations"("tenant_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_messages_tenant_id_conversation_id_created_at_idx" ON "ai_messages"("tenant_id", "conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_knowledge_documents_tenant_id_category_is_active_idx" ON "ai_knowledge_documents"("tenant_id", "category", "is_active");

-- CreateIndex
CREATE INDEX "ai_knowledge_documents_tenant_id_title_idx" ON "ai_knowledge_documents"("tenant_id", "title");

-- CreateIndex
CREATE INDEX "ai_knowledge_chunks_tenant_id_document_id_chunk_index_idx" ON "ai_knowledge_chunks"("tenant_id", "document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "ai_workforce_predictions_tenant_id_prediction_type_risk_sco_idx" ON "ai_workforce_predictions"("tenant_id", "prediction_type", "risk_score");

-- CreateIndex
CREATE INDEX "ai_workforce_predictions_tenant_id_employee_id_idx" ON "ai_workforce_predictions"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "ai_smart_insights_tenant_id_category_is_dismissed_idx" ON "ai_smart_insights"("tenant_id", "category", "is_dismissed");

-- CreateIndex
CREATE INDEX "ai_smart_insights_tenant_id_severity_generated_at_idx" ON "ai_smart_insights"("tenant_id", "severity", "generated_at");

-- CreateIndex
CREATE INDEX "ai_document_extractions_tenant_id_document_type_idx" ON "ai_document_extractions"("tenant_id", "document_type");

-- CreateIndex
CREATE UNIQUE INDEX "ai_settings_tenant_id_key" ON "ai_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "hiring_requests_tenant_id_status_idx" ON "hiring_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "hiring_requests_tenant_id_department_id_idx" ON "hiring_requests"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "hiring_requests_tenant_id_hiring_manager_id_idx" ON "hiring_requests"("tenant_id", "hiring_manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "hiring_requests_tenant_id_request_code_key" ON "hiring_requests"("tenant_id", "request_code");

-- CreateIndex
CREATE INDEX "job_requisitions_tenant_id_status_idx" ON "job_requisitions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "job_requisitions_tenant_id_department_id_idx" ON "job_requisitions"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_requisitions_tenant_id_requisition_code_key" ON "job_requisitions"("tenant_id", "requisition_code");

-- CreateIndex
CREATE INDEX "job_postings_tenant_id_status_idx" ON "job_postings"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "job_postings_tenant_id_slug_key" ON "job_postings"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "candidates_tenant_id_status_idx" ON "candidates"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "candidates_tenant_id_full_name_idx" ON "candidates"("tenant_id", "full_name");

-- CreateIndex
CREATE INDEX "candidates_tenant_id_mobile_idx" ON "candidates"("tenant_id", "mobile");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_tenant_id_candidate_code_key" ON "candidates"("tenant_id", "candidate_code");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_tenant_id_email_key" ON "candidates"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "candidate_skills_candidate_id_skill_name_idx" ON "candidate_skills"("candidate_id", "skill_name");

-- CreateIndex
CREATE INDEX "resumes_candidate_id_idx" ON "resumes"("candidate_id");

-- CreateIndex
CREATE INDEX "applications_tenant_id_stage_idx" ON "applications"("tenant_id", "stage");

-- CreateIndex
CREATE INDEX "applications_tenant_id_requisition_id_idx" ON "applications"("tenant_id", "requisition_id");

-- CreateIndex
CREATE INDEX "applications_tenant_id_candidate_id_idx" ON "applications"("tenant_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_tenant_id_application_code_key" ON "applications"("tenant_id", "application_code");

-- CreateIndex
CREATE UNIQUE INDEX "applications_requisition_id_candidate_id_key" ON "applications"("requisition_id", "candidate_id");

-- CreateIndex
CREATE INDEX "interviews_tenant_id_application_id_idx" ON "interviews"("tenant_id", "application_id");

-- CreateIndex
CREATE INDEX "interviews_tenant_id_status_idx" ON "interviews"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "interviews_tenant_id_scheduled_start_time_idx" ON "interviews"("tenant_id", "scheduled_start_time");

-- CreateIndex
CREATE UNIQUE INDEX "interview_panels_interview_id_employee_id_key" ON "interview_panels"("interview_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_feedbacks_interview_id_interviewer_id_key" ON "interview_feedbacks"("interview_id", "interviewer_id");

-- CreateIndex
CREATE INDEX "offers_tenant_id_application_id_idx" ON "offers"("tenant_id", "application_id");

-- CreateIndex
CREATE INDEX "offers_tenant_id_candidate_id_idx" ON "offers"("tenant_id", "candidate_id");

-- CreateIndex
CREATE INDEX "offers_tenant_id_status_idx" ON "offers"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "offers_tenant_id_offer_code_key" ON "offers"("tenant_id", "offer_code");

-- CreateIndex
CREATE UNIQUE INDEX "offer_approvals_offer_id_approver_role_key" ON "offer_approvals"("offer_id", "approver_role");

-- CreateIndex
CREATE INDEX "preboarding_tasks_tenant_id_candidate_id_idx" ON "preboarding_tasks"("tenant_id", "candidate_id");

-- CreateIndex
CREATE INDEX "preboarding_tasks_tenant_id_status_idx" ON "preboarding_tasks"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_sources_tenant_id_source_name_key" ON "recruitment_sources"("tenant_id", "source_name");

-- CreateIndex
CREATE INDEX "candidate_activities_tenant_id_candidate_id_idx" ON "candidate_activities"("tenant_id", "candidate_id");

-- CreateIndex
CREATE INDEX "candidate_activities_tenant_id_created_at_idx" ON "candidate_activities"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "goal_cycles_tenant_id_status_idx" ON "goal_cycles"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "goal_cycles_tenant_id_name_key" ON "goal_cycles"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "goals_tenant_id_cycle_id_idx" ON "goals"("tenant_id", "cycle_id");

-- CreateIndex
CREATE INDEX "goals_tenant_id_employee_id_idx" ON "goals"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "goals_tenant_id_status_idx" ON "goals"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "key_results_goal_id_idx" ON "key_results"("goal_id");

-- CreateIndex
CREATE INDEX "feedbacks_tenant_id_to_employee_id_idx" ON "feedbacks"("tenant_id", "to_employee_id");

-- CreateIndex
CREATE INDEX "feedbacks_tenant_id_from_employee_id_idx" ON "feedbacks"("tenant_id", "from_employee_id");

-- CreateIndex
CREATE INDEX "feedbacks_tenant_id_category_idx" ON "feedbacks"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "one_on_ones_tenant_id_manager_id_idx" ON "one_on_ones"("tenant_id", "manager_id");

-- CreateIndex
CREATE INDEX "one_on_ones_tenant_id_employee_id_idx" ON "one_on_ones"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "one_on_ones_tenant_id_scheduled_at_idx" ON "one_on_ones"("tenant_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "review_cycles_tenant_id_status_idx" ON "review_cycles"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "review_cycles_tenant_id_name_key" ON "review_cycles"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "performance_reviews_tenant_id_employee_id_idx" ON "performance_reviews"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "performance_reviews_tenant_id_cycle_id_idx" ON "performance_reviews"("tenant_id", "cycle_id");

-- CreateIndex
CREATE INDEX "performance_reviews_tenant_id_status_idx" ON "performance_reviews"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "performance_reviews_cycle_id_employee_id_key" ON "performance_reviews"("cycle_id", "employee_id");

-- CreateIndex
CREATE INDEX "performance_review_scores_tenant_id_review_id_idx" ON "performance_review_scores"("tenant_id", "review_id");

-- CreateIndex
CREATE INDEX "performance_review_scores_tenant_id_rater_id_idx" ON "performance_review_scores"("tenant_id", "rater_id");

-- CreateIndex
CREATE INDEX "competencies_tenant_id_category_idx" ON "competencies"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "competencies_tenant_id_code_key" ON "competencies"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "designation_competencies_tenant_id_designation_id_idx" ON "designation_competencies"("tenant_id", "designation_id");

-- CreateIndex
CREATE UNIQUE INDEX "designation_competencies_designation_id_competency_id_key" ON "designation_competencies"("designation_id", "competency_id");

-- CreateIndex
CREATE INDEX "employee_competency_ratings_tenant_id_review_id_idx" ON "employee_competency_ratings"("tenant_id", "review_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_competency_ratings_review_id_competency_id_key" ON "employee_competency_ratings"("review_id", "competency_id");

-- CreateIndex
CREATE INDEX "calibration_sessions_tenant_id_cycle_id_idx" ON "calibration_sessions"("tenant_id", "cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "calibration_reviews_review_id_key" ON "calibration_reviews"("review_id");

-- CreateIndex
CREATE INDEX "calibration_reviews_session_id_idx" ON "calibration_reviews"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "salary_increment_rules_tenant_id_rating_label_key" ON "salary_increment_rules"("tenant_id", "rating_label");

-- CreateIndex
CREATE INDEX "promotion_recommendations_tenant_id_employee_id_idx" ON "promotion_recommendations"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "promotion_recommendations_tenant_id_status_idx" ON "promotion_recommendations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "succession_positions_tenant_id_designation_id_idx" ON "succession_positions"("tenant_id", "designation_id");

-- CreateIndex
CREATE INDEX "successor_pools_tenant_id_employee_id_idx" ON "successor_pools"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "successor_pools_position_id_employee_id_key" ON "successor_pools"("position_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_category_masters_category_key" ON "asset_category_masters"("category");

-- CreateIndex
CREATE INDEX "asset_category_masters_tenant_id_category_idx" ON "asset_category_masters"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "asset_vendors_tenant_id_name_idx" ON "asset_vendors"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "assets_tenant_id_category_idx" ON "assets"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "assets_tenant_id_status_idx" ON "assets"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "assets_tenant_id_current_holder_id_idx" ON "assets"("tenant_id", "current_holder_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_tenant_id_asset_code_key" ON "assets"("tenant_id", "asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "assets_tenant_id_serial_number_key" ON "assets"("tenant_id", "serial_number");

-- CreateIndex
CREATE INDEX "asset_assignments_tenant_id_asset_id_idx" ON "asset_assignments"("tenant_id", "asset_id");

-- CreateIndex
CREATE INDEX "asset_assignments_tenant_id_employee_id_idx" ON "asset_assignments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "asset_transactions_tenant_id_asset_id_idx" ON "asset_transactions"("tenant_id", "asset_id");

-- CreateIndex
CREATE INDEX "asset_transactions_tenant_id_type_idx" ON "asset_transactions"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "asset_maintenances_tenant_id_asset_id_idx" ON "asset_maintenances"("tenant_id", "asset_id");

-- CreateIndex
CREATE INDEX "asset_maintenances_tenant_id_status_idx" ON "asset_maintenances"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "asset_warranties_tenant_id_asset_id_idx" ON "asset_warranties"("tenant_id", "asset_id");

-- CreateIndex
CREATE INDEX "asset_warranties_tenant_id_end_date_idx" ON "asset_warranties"("tenant_id", "end_date");

-- CreateIndex
CREATE INDEX "asset_amcs_tenant_id_asset_id_idx" ON "asset_amcs"("tenant_id", "asset_id");

-- CreateIndex
CREATE INDEX "asset_amcs_tenant_id_end_date_idx" ON "asset_amcs"("tenant_id", "end_date");

-- CreateIndex
CREATE INDEX "software_licenses_tenant_id_name_idx" ON "software_licenses"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "software_licenses_tenant_id_expiry_date_idx" ON "software_licenses"("tenant_id", "expiry_date");

-- CreateIndex
CREATE INDEX "license_assignments_tenant_id_employee_id_idx" ON "license_assignments"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "license_assignments_license_id_employee_id_key" ON "license_assignments"("license_id", "employee_id");

-- CreateIndex
CREATE INDEX "inventory_items_tenant_id_name_idx" ON "inventory_items"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_tenant_id_sku_key" ON "inventory_items"("tenant_id", "sku");

-- CreateIndex
CREATE INDEX "inventory_movements_tenant_id_item_id_idx" ON "inventory_movements"("tenant_id", "item_id");

-- CreateIndex
CREATE INDEX "tickets_tenant_id_status_idx" ON "tickets"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "tickets_tenant_id_priority_idx" ON "tickets"("tenant_id", "priority");

-- CreateIndex
CREATE INDEX "tickets_tenant_id_category_idx" ON "tickets"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "tickets_tenant_id_created_by_id_idx" ON "tickets"("tenant_id", "created_by_id");

-- CreateIndex
CREATE INDEX "tickets_tenant_id_assignee_id_idx" ON "tickets"("tenant_id", "assignee_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_tenant_id_ticket_number_key" ON "tickets"("tenant_id", "ticket_number");

-- CreateIndex
CREATE INDEX "ticket_comments_tenant_id_ticket_id_idx" ON "ticket_comments"("tenant_id", "ticket_id");

-- CreateIndex
CREATE INDEX "ticket_attachments_tenant_id_ticket_id_idx" ON "ticket_attachments"("tenant_id", "ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_slas_priority_key" ON "ticket_slas"("priority");

-- CreateIndex
CREATE INDEX "ticket_escalations_tenant_id_ticket_id_idx" ON "ticket_escalations"("tenant_id", "ticket_id");

-- CreateIndex
CREATE INDEX "facilities_tenant_id_type_idx" ON "facilities"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "facility_bookings_tenant_id_facility_id_idx" ON "facility_bookings"("tenant_id", "facility_id");

-- CreateIndex
CREATE INDEX "facility_bookings_tenant_id_start_time_end_time_idx" ON "facility_bookings"("tenant_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "desks_tenant_id_floor_zone_idx" ON "desks"("tenant_id", "floor", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "desks_tenant_id_desk_number_key" ON "desks"("tenant_id", "desk_number");

-- CreateIndex
CREATE INDEX "desk_allocations_tenant_id_desk_id_idx" ON "desk_allocations"("tenant_id", "desk_id");

-- CreateIndex
CREATE INDEX "desk_allocations_tenant_id_employee_id_idx" ON "desk_allocations"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "vehicles_tenant_id_status_idx" ON "vehicles"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_tenant_id_registration_number_key" ON "vehicles"("tenant_id", "registration_number");

-- CreateIndex
CREATE INDEX "vehicle_bookings_tenant_id_vehicle_id_idx" ON "vehicle_bookings"("tenant_id", "vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_bookings_tenant_id_employee_id_idx" ON "vehicle_bookings"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "vehicle_logs_tenant_id_vehicle_id_idx" ON "vehicle_logs"("tenant_id", "vehicle_id");

-- CreateIndex
CREATE INDEX "visitors_tenant_id_name_idx" ON "visitors"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_tenant_id_phone_key" ON "visitors"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "visitor_visits_tenant_id_visitor_id_idx" ON "visitor_visits"("tenant_id", "visitor_id");

-- CreateIndex
CREATE INDEX "visitor_visits_tenant_id_host_id_idx" ON "visitor_visits"("tenant_id", "host_id");

-- CreateIndex
CREATE INDEX "visitor_visits_tenant_id_status_idx" ON "visitor_visits"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "visitor_passes_tenant_id_visitor_id_idx" ON "visitor_passes"("tenant_id", "visitor_id");

-- CreateIndex
CREATE INDEX "gate_passes_tenant_id_status_idx" ON "gate_passes"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "gate_passes_tenant_id_type_idx" ON "gate_passes"("tenant_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "gate_passes_tenant_id_pass_number_key" ON "gate_passes"("tenant_id", "pass_number");

-- CreateIndex
CREATE INDEX "contractors_tenant_id_status_idx" ON "contractors"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_tenant_id_contract_code_key" ON "contractors"("tenant_id", "contract_code");

-- CreateIndex
CREATE INDEX "contractor_accesses_tenant_id_contractor_id_idx" ON "contractor_accesses"("tenant_id", "contractor_id");

-- CreateIndex
CREATE INDEX "exit_clearances_tenant_id_status_idx" ON "exit_clearances"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "exit_clearances_tenant_id_employee_id_key" ON "exit_clearances"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "clearance_tasks_tenant_id_clearance_id_idx" ON "clearance_tasks"("tenant_id", "clearance_id");

-- CreateIndex
CREATE INDEX "clearance_tasks_tenant_id_department_idx" ON "clearance_tasks"("tenant_id", "department");

-- CreateIndex
CREATE INDEX "expense_category_masters_tenant_id_is_active_idx" ON "expense_category_masters"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "expense_category_masters_tenant_id_code_key" ON "expense_category_masters"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "expense_policies_tenant_id_category_idx" ON "expense_policies"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "expense_policies_tenant_id_is_active_idx" ON "expense_policies"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "expense_claims_tenant_id_employee_id_idx" ON "expense_claims"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "expense_claims_tenant_id_status_idx" ON "expense_claims"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "expense_claims_tenant_id_cost_center_id_idx" ON "expense_claims"("tenant_id", "cost_center_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_claims_tenant_id_claim_number_key" ON "expense_claims"("tenant_id", "claim_number");

-- CreateIndex
CREATE INDEX "expense_items_tenant_id_claim_id_idx" ON "expense_items"("tenant_id", "claim_id");

-- CreateIndex
CREATE INDEX "expense_items_tenant_id_category_idx" ON "expense_items"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "expense_receipts_tenant_id_content_hash_idx" ON "expense_receipts"("tenant_id", "content_hash");

-- CreateIndex
CREATE INDEX "expense_receipts_tenant_id_item_id_idx" ON "expense_receipts"("tenant_id", "item_id");

-- CreateIndex
CREATE INDEX "expense_approvals_tenant_id_claim_id_idx" ON "expense_approvals"("tenant_id", "claim_id");

-- CreateIndex
CREATE INDEX "expense_approvals_tenant_id_approver_id_idx" ON "expense_approvals"("tenant_id", "approver_id");

-- CreateIndex
CREATE INDEX "expense_audits_tenant_id_claim_id_idx" ON "expense_audits"("tenant_id", "claim_id");

-- CreateIndex
CREATE INDEX "expense_audits_tenant_id_performed_by_idx" ON "expense_audits"("tenant_id", "performed_by");

-- CreateIndex
CREATE INDEX "travel_requests_tenant_id_employee_id_idx" ON "travel_requests"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "travel_requests_tenant_id_status_idx" ON "travel_requests"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "travel_requests_tenant_id_request_number_key" ON "travel_requests"("tenant_id", "request_number");

-- CreateIndex
CREATE INDEX "travel_segments_tenant_id_request_id_idx" ON "travel_segments"("tenant_id", "request_id");

-- CreateIndex
CREATE INDEX "travel_advances_tenant_id_request_id_idx" ON "travel_advances"("tenant_id", "request_id");

-- CreateIndex
CREATE INDEX "travel_advances_tenant_id_employee_id_idx" ON "travel_advances"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "travel_settlements_tenant_id_request_id_idx" ON "travel_settlements"("tenant_id", "request_id");

-- CreateIndex
CREATE INDEX "travel_settlements_tenant_id_employee_id_idx" ON "travel_settlements"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "cost_centers_tenant_id_is_active_idx" ON "cost_centers"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "cost_centers_tenant_id_parent_id_idx" ON "cost_centers"("tenant_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_tenant_id_code_key" ON "cost_centers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "department_budgets_tenant_id_fiscal_year_idx" ON "department_budgets"("tenant_id", "fiscal_year");

-- CreateIndex
CREATE UNIQUE INDEX "department_budgets_tenant_id_cost_center_id_fiscal_year_qua_key" ON "department_budgets"("tenant_id", "cost_center_id", "fiscal_year", "quarter");

-- CreateIndex
CREATE INDEX "budget_allocations_tenant_id_budget_id_idx" ON "budget_allocations"("tenant_id", "budget_id");

-- CreateIndex
CREATE INDEX "budget_allocations_tenant_id_cost_center_id_idx" ON "budget_allocations"("tenant_id", "cost_center_id");

-- CreateIndex
CREATE INDEX "account_groups_tenant_id_type_idx" ON "account_groups"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "account_groups_tenant_id_parent_id_idx" ON "account_groups"("tenant_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_groups_tenant_id_code_key" ON "account_groups"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenant_id_type_idx" ON "chart_of_accounts"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenant_id_parent_id_idx" ON "chart_of_accounts"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenant_id_is_active_idx" ON "chart_of_accounts"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_tenant_id_code_key" ON "chart_of_accounts"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "accounting_periods_tenant_id_status_idx" ON "accounting_periods"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_tenant_id_fiscal_year_month_quarter_key" ON "accounting_periods"("tenant_id", "fiscal_year", "month", "quarter");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_status_idx" ON "journal_entries"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_entry_date_idx" ON "journal_entries"("tenant_id", "entry_date");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_source_type_source_id_idx" ON "journal_entries"("tenant_id", "source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_tenant_id_entry_number_key" ON "journal_entries"("tenant_id", "entry_number");

-- CreateIndex
CREATE INDEX "journal_entry_lines_tenant_id_journal_entry_id_idx" ON "journal_entry_lines"("tenant_id", "journal_entry_id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_tenant_id_account_id_idx" ON "journal_entry_lines"("tenant_id", "account_id");

-- CreateIndex
CREATE INDEX "general_ledger_entries_tenant_id_account_id_idx" ON "general_ledger_entries"("tenant_id", "account_id");

-- CreateIndex
CREATE INDEX "general_ledger_entries_tenant_id_entry_date_idx" ON "general_ledger_entries"("tenant_id", "entry_date");

-- CreateIndex
CREATE INDEX "general_ledger_entries_tenant_id_source_type_source_id_idx" ON "general_ledger_entries"("tenant_id", "source_type", "source_id");

-- CreateIndex
CREATE INDEX "vendors_tenant_id_is_active_idx" ON "vendors"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "vendors_tenant_id_gstin_idx" ON "vendors"("tenant_id", "gstin");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tenant_id_code_key" ON "vendors"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "vendor_bank_accounts_tenant_id_vendor_id_idx" ON "vendor_bank_accounts"("tenant_id", "vendor_id");

-- CreateIndex
CREATE INDEX "vendor_documents_tenant_id_vendor_id_idx" ON "vendor_documents"("tenant_id", "vendor_id");

-- CreateIndex
CREATE INDEX "customers_tenant_id_is_active_idx" ON "customers"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_code_key" ON "customers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "customer_invoices_tenant_id_customer_id_idx" ON "customer_invoices"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "customer_invoices_tenant_id_status_idx" ON "customer_invoices"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "customer_invoices_tenant_id_invoice_number_key" ON "customer_invoices"("tenant_id", "invoice_number");

-- CreateIndex
CREATE INDEX "customer_invoice_items_tenant_id_invoice_id_idx" ON "customer_invoice_items"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "customer_payments_tenant_id_customer_id_idx" ON "customer_payments"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "customer_payments_tenant_id_invoice_id_idx" ON "customer_payments"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "vendor_invoices_tenant_id_vendor_id_idx" ON "vendor_invoices"("tenant_id", "vendor_id");

-- CreateIndex
CREATE INDEX "vendor_invoices_tenant_id_status_idx" ON "vendor_invoices"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_invoices_tenant_id_vendor_id_invoice_number_key" ON "vendor_invoices"("tenant_id", "vendor_id", "invoice_number");

-- CreateIndex
CREATE INDEX "vendor_invoice_items_tenant_id_invoice_id_idx" ON "vendor_invoice_items"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "vendor_payments_tenant_id_vendor_id_idx" ON "vendor_payments"("tenant_id", "vendor_id");

-- CreateIndex
CREATE INDEX "vendor_payments_tenant_id_invoice_id_idx" ON "vendor_payments"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "bank_accounts_tenant_id_is_active_idx" ON "bank_accounts"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_tenant_id_account_number_key" ON "bank_accounts"("tenant_id", "account_number");

-- CreateIndex
CREATE INDEX "bank_statements_tenant_id_bank_account_id_idx" ON "bank_statements"("tenant_id", "bank_account_id");

-- CreateIndex
CREATE INDEX "bank_transactions_tenant_id_bank_account_id_idx" ON "bank_transactions"("tenant_id", "bank_account_id");

-- CreateIndex
CREATE INDEX "bank_transactions_tenant_id_transaction_date_idx" ON "bank_transactions"("tenant_id", "transaction_date");

-- CreateIndex
CREATE INDEX "bank_transactions_tenant_id_reconciliation_status_idx" ON "bank_transactions"("tenant_id", "reconciliation_status");

-- CreateIndex
CREATE INDEX "bank_reconciliations_tenant_id_bank_account_id_idx" ON "bank_reconciliations"("tenant_id", "bank_account_id");

-- CreateIndex
CREATE INDEX "bank_reconciliations_tenant_id_status_idx" ON "bank_reconciliations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "tax_ledgers_tenant_id_tax_type_idx" ON "tax_ledgers"("tenant_id", "tax_type");

-- CreateIndex
CREATE INDEX "tax_ledgers_tenant_id_period_idx" ON "tax_ledgers"("tenant_id", "period");

-- CreateIndex
CREATE INDEX "gst_returns_tenant_id_status_idx" ON "gst_returns"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gst_returns_tenant_id_return_type_period_key" ON "gst_returns"("tenant_id", "return_type", "period");

-- CreateIndex
CREATE INDEX "gst_transactions_tenant_id_taxType_idx" ON "gst_transactions"("tenant_id", "taxType");

-- CreateIndex
CREATE INDEX "gst_transactions_tenant_id_transaction_date_idx" ON "gst_transactions"("tenant_id", "transaction_date");

-- CreateIndex
CREATE INDEX "erp_integrations_tenant_id_is_active_idx" ON "erp_integrations"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "erp_integrations_tenant_id_provider_name_key" ON "erp_integrations"("tenant_id", "provider", "name");

-- CreateIndex
CREATE INDEX "erp_connections_tenant_id_integration_id_idx" ON "erp_connections"("tenant_id", "integration_id");

-- CreateIndex
CREATE INDEX "erp_jobs_tenant_id_status_idx" ON "erp_jobs"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "erp_jobs_tenant_id_integration_id_idx" ON "erp_jobs"("tenant_id", "integration_id");

-- CreateIndex
CREATE INDEX "erp_job_logs_tenant_id_job_id_idx" ON "erp_job_logs"("tenant_id", "job_id");

-- CreateIndex
CREATE INDEX "financial_statement_snapshots_tenant_id_period_idx" ON "financial_statement_snapshots"("tenant_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "financial_statement_snapshots_tenant_id_statement_type_peri_key" ON "financial_statement_snapshots"("tenant_id", "statement_type", "period");

-- CreateIndex
CREATE INDEX "api_scopes_tenant_id_is_active_idx" ON "api_scopes"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "api_scopes_tenant_id_code_key" ON "api_scopes"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "api_keys_tenant_id_status_idx" ON "api_keys"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "api_keys_tenant_id_prefix_idx" ON "api_keys"("tenant_id", "prefix");

-- CreateIndex
CREATE INDEX "api_clients_tenant_id_status_idx" ON "api_clients"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "api_clients_tenant_id_client_id_key" ON "api_clients"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "api_tokens_tenant_id_status_idx" ON "api_tokens"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "api_tokens_tenant_id_client_id_ref_idx" ON "api_tokens"("tenant_id", "client_id_ref");

-- CreateIndex
CREATE INDEX "api_usage_logs_tenant_id_created_at_idx" ON "api_usage_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "api_usage_logs_tenant_id_api_key_id_idx" ON "api_usage_logs"("tenant_id", "api_key_id");

-- CreateIndex
CREATE INDEX "api_webhooks_tenant_id_status_idx" ON "api_webhooks"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "api_subscriptions_tenant_id_webhook_id_idx" ON "api_subscriptions"("tenant_id", "webhook_id");

-- CreateIndex
CREATE INDEX "api_subscriptions_tenant_id_event_idx" ON "api_subscriptions"("tenant_id", "event");

-- CreateIndex
CREATE INDEX "api_subscriptions_tenant_id_delivery_status_idx" ON "api_subscriptions"("tenant_id", "delivery_status");

-- CreateIndex
CREATE INDEX "automation_rules_tenant_id_trigger_type_idx" ON "automation_rules"("tenant_id", "trigger_type");

-- CreateIndex
CREATE INDEX "automation_rules_tenant_id_is_active_idx" ON "automation_rules"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "automation_runs_tenant_id_rule_id_idx" ON "automation_runs"("tenant_id", "rule_id");

-- CreateIndex
CREATE INDEX "automation_runs_tenant_id_status_idx" ON "automation_runs"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "external_integrations_tenant_id_category_idx" ON "external_integrations"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "external_integrations_tenant_id_status_idx" ON "external_integrations"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "external_integrations_tenant_id_provider_key" ON "external_integrations"("tenant_id", "provider");

-- CreateIndex
CREATE INDEX "sso_configurations_tenant_id_protocol_idx" ON "sso_configurations"("tenant_id", "protocol");

-- CreateIndex
CREATE INDEX "sso_configurations_tenant_id_is_active_idx" ON "sso_configurations"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "knowledge_categories_tenant_id_idx" ON "knowledge_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_categories_tenant_id_slug_key" ON "knowledge_categories"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "knowledge_articles_tenant_id_status_idx" ON "knowledge_articles"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "knowledge_articles_tenant_id_category_id_idx" ON "knowledge_articles"("tenant_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_articles_tenant_id_slug_key" ON "knowledge_articles"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "knowledge_versions_tenant_id_article_id_idx" ON "knowledge_versions"("tenant_id", "article_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_versions_tenant_id_article_id_version_key" ON "knowledge_versions"("tenant_id", "article_id", "version");

-- CreateIndex
CREATE INDEX "knowledge_attachments_tenant_id_article_id_idx" ON "knowledge_attachments"("tenant_id", "article_id");

-- CreateIndex
CREATE INDEX "marketplace_apps_tenant_id_category_idx" ON "marketplace_apps"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_apps_tenant_id_provider_key" ON "marketplace_apps"("tenant_id", "provider");

-- CreateIndex
CREATE INDEX "marketplace_installs_tenant_id_status_idx" ON "marketplace_installs"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_installs_tenant_id_app_id_key" ON "marketplace_installs"("tenant_id", "app_id");

-- CreateIndex
CREATE INDEX "training_categories_tenant_id_is_active_idx" ON "training_categories"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "training_categories_tenant_id_slug_key" ON "training_categories"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "training_courses_tenant_id_category_id_idx" ON "training_courses"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "training_courses_tenant_id_is_compliance_idx" ON "training_courses"("tenant_id", "is_compliance");

-- CreateIndex
CREATE INDEX "training_courses_tenant_id_is_active_idx" ON "training_courses"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "training_courses_tenant_id_code_key" ON "training_courses"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "training_courses_tenant_id_slug_key" ON "training_courses"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "course_modules_tenant_id_course_id_idx" ON "course_modules"("tenant_id", "course_id");

-- CreateIndex
CREATE INDEX "lessons_tenant_id_module_id_idx" ON "lessons"("tenant_id", "module_id");

-- CreateIndex
CREATE INDEX "lesson_attachments_tenant_id_lesson_id_idx" ON "lesson_attachments"("tenant_id", "lesson_id");

-- CreateIndex
CREATE INDEX "course_enrollments_tenant_id_employee_id_idx" ON "course_enrollments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "course_enrollments_tenant_id_status_idx" ON "course_enrollments"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_tenant_id_course_id_employee_id_key" ON "course_enrollments"("tenant_id", "course_id", "employee_id");

-- CreateIndex
CREATE INDEX "learning_paths_tenant_id_is_active_idx" ON "learning_paths"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "learning_paths_tenant_id_slug_key" ON "learning_paths"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "learning_path_courses_tenant_id_learning_path_id_idx" ON "learning_path_courses"("tenant_id", "learning_path_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_courses_learning_path_id_course_id_key" ON "learning_path_courses"("learning_path_id", "course_id");

-- CreateIndex
CREATE INDEX "learning_path_enrollments_tenant_id_employee_id_idx" ON "learning_path_enrollments"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_enrollments_tenant_id_learning_path_id_employ_key" ON "learning_path_enrollments"("tenant_id", "learning_path_id", "employee_id");

-- CreateIndex
CREATE INDEX "assessments_tenant_id_course_id_idx" ON "assessments"("tenant_id", "course_id");

-- CreateIndex
CREATE INDEX "assessment_questions_tenant_id_assessment_id_idx" ON "assessment_questions"("tenant_id", "assessment_id");

-- CreateIndex
CREATE INDEX "assessment_options_question_id_idx" ON "assessment_options"("question_id");

-- CreateIndex
CREATE INDEX "assessment_attempts_tenant_id_assessment_id_idx" ON "assessment_attempts"("tenant_id", "assessment_id");

-- CreateIndex
CREATE INDEX "assessment_attempts_tenant_id_employee_id_idx" ON "assessment_attempts"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "lms_certifications_tenant_id_type_idx" ON "lms_certifications"("tenant_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "lms_certifications_tenant_id_code_key" ON "lms_certifications"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "employee_certifications_tenant_id_employee_id_idx" ON "employee_certifications"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "employee_certifications_tenant_id_status_idx" ON "employee_certifications"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "employee_certifications_tenant_id_expiry_date_idx" ON "employee_certifications"("tenant_id", "expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "employee_certifications_tenant_id_certification_id_employee_key" ON "employee_certifications"("tenant_id", "certification_id", "employee_id");

-- CreateIndex
CREATE INDEX "skill_categories_tenant_id_idx" ON "skill_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_tenant_id_slug_key" ON "skill_categories"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "skills_tenant_id_category_id_idx" ON "skills"("tenant_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_tenant_id_code_key" ON "skills"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "employee_skills_tenant_id_employee_id_idx" ON "employee_skills"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_skills_tenant_id_employee_id_skill_id_key" ON "employee_skills"("tenant_id", "employee_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "instructors_employee_id_key" ON "instructors"("employee_id");

-- CreateIndex
CREATE INDEX "instructors_tenant_id_is_external_idx" ON "instructors"("tenant_id", "is_external");

-- CreateIndex
CREATE INDEX "training_sessions_tenant_id_course_id_idx" ON "training_sessions"("tenant_id", "course_id");

-- CreateIndex
CREATE INDEX "training_sessions_tenant_id_session_date_idx" ON "training_sessions"("tenant_id", "session_date");

-- CreateIndex
CREATE INDEX "session_attendances_tenant_id_employee_id_idx" ON "session_attendances"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_attendances_tenant_id_session_id_employee_id_key" ON "session_attendances"("tenant_id", "session_id", "employee_id");

-- CreateIndex
CREATE INDEX "positions_tenant_id_department_id_idx" ON "positions"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "positions_tenant_id_status_idx" ON "positions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "positions_tenant_id_is_critical_role_idx" ON "positions"("tenant_id", "is_critical_role");

-- CreateIndex
CREATE UNIQUE INDEX "positions_tenant_id_position_code_key" ON "positions"("tenant_id", "position_code");

-- CreateIndex
CREATE INDEX "position_assignments_tenant_id_position_id_idx" ON "position_assignments"("tenant_id", "position_id");

-- CreateIndex
CREATE INDEX "position_assignments_tenant_id_employee_id_idx" ON "position_assignments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "headcount_plans_tenant_id_fiscal_year_idx" ON "headcount_plans"("tenant_id", "fiscal_year");

-- CreateIndex
CREATE INDEX "headcount_plans_tenant_id_department_id_idx" ON "headcount_plans"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "headcount_scenarios_tenant_id_plan_id_idx" ON "headcount_scenarios"("tenant_id", "plan_id");

-- CreateIndex
CREATE INDEX "workforce_cost_forecasts_tenant_id_period_label_idx" ON "workforce_cost_forecasts"("tenant_id", "period_label");

-- CreateIndex
CREATE INDEX "org_structure_versions_tenant_id_status_idx" ON "org_structure_versions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "attrition_risk_assessments_tenant_id_employee_id_idx" ON "attrition_risk_assessments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "attrition_risk_assessments_tenant_id_risk_category_idx" ON "attrition_risk_assessments"("tenant_id", "risk_category");

-- CreateIndex
CREATE INDEX "skill_supply_demand_forecasts_tenant_id_category_idx" ON "skill_supply_demand_forecasts"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "biometric_devices_tenant_id_status_idx" ON "biometric_devices"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "biometric_devices_tenant_id_serial_number_key" ON "biometric_devices"("tenant_id", "serial_number");

-- CreateIndex
CREATE INDEX "biometric_punches_tenant_id_device_id_idx" ON "biometric_punches"("tenant_id", "device_id");

-- CreateIndex
CREATE INDEX "biometric_punches_tenant_id_employee_id_idx" ON "biometric_punches"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "biometric_punches_tenant_id_punch_time_idx" ON "biometric_punches"("tenant_id", "punch_time");

-- CreateIndex
CREATE INDEX "device_sync_logs_tenant_id_device_id_idx" ON "device_sync_logs"("tenant_id", "device_id");

-- CreateIndex
CREATE INDEX "shift_swap_requests_tenant_id_requester_employee_id_idx" ON "shift_swap_requests"("tenant_id", "requester_employee_id");

-- CreateIndex
CREATE INDEX "shift_swap_requests_tenant_id_target_employee_id_idx" ON "shift_swap_requests"("tenant_id", "target_employee_id");

-- CreateIndex
CREATE INDEX "shift_swap_requests_tenant_id_status_idx" ON "shift_swap_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "overtime_requests_tenant_id_employee_id_idx" ON "overtime_requests"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "overtime_requests_tenant_id_status_idx" ON "overtime_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "attendance_anomalies_tenant_id_employee_id_idx" ON "attendance_anomalies"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "attendance_anomalies_tenant_id_is_resolved_idx" ON "attendance_anomalies"("tenant_id", "is_resolved");

-- CreateIndex
CREATE INDEX "attendance_anomalies_tenant_id_severity_idx" ON "attendance_anomalies"("tenant_id", "severity");

-- CreateIndex
CREATE INDEX "contractor_attendances_tenant_id_vendor_name_idx" ON "contractor_attendances"("tenant_id", "vendor_name");

-- CreateIndex
CREATE INDEX "contractor_attendances_tenant_id_check_in_time_idx" ON "contractor_attendances"("tenant_id", "check_in_time");

-- CreateIndex
CREATE INDEX "workforce_schedules_tenant_id_start_date_end_date_idx" ON "workforce_schedules"("tenant_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "payroll_cycles_tenant_id_is_active_idx" ON "payroll_cycles"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "payroll_tax_declarations_tenant_id_financial_year_idx" ON "payroll_tax_declarations"("tenant_id", "financial_year");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_tax_declarations_tenant_id_employee_id_financial_ye_key" ON "payroll_tax_declarations"("tenant_id", "employee_id", "financial_year");

-- CreateIndex
CREATE INDEX "payroll_tax_proofs_tenant_id_declaration_id_idx" ON "payroll_tax_proofs"("tenant_id", "declaration_id");

-- CreateIndex
CREATE INDEX "payroll_tax_computations_tenant_id_financial_year_idx" ON "payroll_tax_computations"("tenant_id", "financial_year");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_tax_computations_tenant_id_employee_id_financial_ye_key" ON "payroll_tax_computations"("tenant_id", "employee_id", "financial_year", "month");

-- CreateIndex
CREATE INDEX "payroll_settlements_tenant_id_employee_id_idx" ON "payroll_settlements"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_settlements_tenant_id_status_idx" ON "payroll_settlements"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payroll_gratuities_tenant_id_employee_id_idx" ON "payroll_gratuities"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_bonuses_tenant_id_financial_year_idx" ON "payroll_bonuses"("tenant_id", "financial_year");

-- CreateIndex
CREATE INDEX "payroll_bonuses_tenant_id_employee_id_idx" ON "payroll_bonuses"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_incentives_tenant_id_year_month_idx" ON "payroll_incentives"("tenant_id", "year", "month");

-- CreateIndex
CREATE INDEX "payroll_incentives_tenant_id_employee_id_idx" ON "payroll_incentives"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_arrears_tenant_id_employee_id_idx" ON "payroll_arrears"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_loans_tenant_id_employee_id_idx" ON "payroll_loans"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_loans_tenant_id_status_idx" ON "payroll_loans"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payroll_loan_installments_tenant_id_loan_id_idx" ON "payroll_loan_installments"("tenant_id", "loan_id");

-- CreateIndex
CREATE INDEX "compensation_revisions_tenant_id_employee_id_idx" ON "compensation_revisions"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "compensation_revisions_tenant_id_status_idx" ON "compensation_revisions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "salary_bands_tenant_id_is_active_idx" ON "salary_bands"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "salary_bands_tenant_id_band_code_key" ON "salary_bands"("tenant_id", "band_code");

-- CreateIndex
CREATE INDEX "salary_benchmarks_tenant_id_job_title_idx" ON "salary_benchmarks"("tenant_id", "job_title");

-- CreateIndex
CREATE INDEX "engagement_surveys_tenant_id_status_idx" ON "engagement_surveys"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "engagement_surveys_tenant_id_start_date_end_date_idx" ON "engagement_surveys"("tenant_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "survey_questions_tenant_id_survey_id_idx" ON "survey_questions"("tenant_id", "survey_id");

-- CreateIndex
CREATE INDEX "survey_responses_tenant_id_survey_id_idx" ON "survey_responses"("tenant_id", "survey_id");

-- CreateIndex
CREATE INDEX "survey_responses_tenant_id_question_id_idx" ON "survey_responses"("tenant_id", "question_id");

-- CreateIndex
CREATE INDEX "pulse_surveys_tenant_id_is_active_idx" ON "pulse_surveys"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "pulse_responses_tenant_id_pulse_survey_id_idx" ON "pulse_responses"("tenant_id", "pulse_survey_id");

-- CreateIndex
CREATE INDEX "pulse_responses_tenant_id_submitted_at_idx" ON "pulse_responses"("tenant_id", "submitted_at");

-- CreateIndex
CREATE INDEX "enps_campaigns_tenant_id_year_quarter_idx" ON "enps_campaigns"("tenant_id", "year", "quarter");

-- CreateIndex
CREATE INDEX "enps_responses_tenant_id_campaign_id_idx" ON "enps_responses"("tenant_id", "campaign_id");

-- CreateIndex
CREATE INDEX "recognition_badges_tenant_id_is_active_idx" ON "recognition_badges"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "recognitions_tenant_id_receiver_employee_id_idx" ON "recognitions"("tenant_id", "receiver_employee_id");

-- CreateIndex
CREATE INDEX "recognitions_tenant_id_created_at_idx" ON "recognitions"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "employee_badges_tenant_id_employee_id_idx" ON "employee_badges"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "reward_point_ledgers_tenant_id_employee_id_idx" ON "reward_point_ledgers"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "reward_point_ledgers_tenant_id_created_at_idx" ON "reward_point_ledgers"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "reward_catalogs_tenant_id_is_active_idx" ON "reward_catalogs"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "reward_redemptions_tenant_id_employee_id_idx" ON "reward_redemptions"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "reward_redemptions_tenant_id_status_idx" ON "reward_redemptions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "employee_communities_tenant_id_community_type_idx" ON "employee_communities"("tenant_id", "community_type");

-- CreateIndex
CREATE INDEX "community_members_tenant_id_employee_id_idx" ON "community_members"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_community_id_employee_id_key" ON "community_members"("community_id", "employee_id");

-- CreateIndex
CREATE INDEX "community_posts_tenant_id_community_id_idx" ON "community_posts"("tenant_id", "community_id");

-- CreateIndex
CREATE INDEX "community_posts_tenant_id_created_at_idx" ON "community_posts"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "community_comments_tenant_id_post_id_idx" ON "community_comments"("tenant_id", "post_id");

-- CreateIndex
CREATE INDEX "community_reactions_tenant_id_post_id_idx" ON "community_reactions"("tenant_id", "post_id");

-- CreateIndex
CREATE INDEX "community_reactions_tenant_id_employee_id_idx" ON "community_reactions"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "suggestions_tenant_id_status_idx" ON "suggestions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "suggestion_votes_tenant_id_suggestion_id_idx" ON "suggestion_votes"("tenant_id", "suggestion_id");

-- CreateIndex
CREATE UNIQUE INDEX "suggestion_votes_suggestion_id_employee_id_key" ON "suggestion_votes"("suggestion_id", "employee_id");

-- CreateIndex
CREATE INDEX "innovation_challenges_tenant_id_status_idx" ON "innovation_challenges"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "innovation_submissions_tenant_id_challenge_id_idx" ON "innovation_submissions"("tenant_id", "challenge_id");

-- CreateIndex
CREATE INDEX "innovation_submissions_tenant_id_employee_id_idx" ON "innovation_submissions"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "culture_metrics_tenant_id_metric_date_idx" ON "culture_metrics"("tenant_id", "metric_date");

-- CreateIndex
CREATE INDEX "employee_sentiments_tenant_id_employee_id_idx" ON "employee_sentiments"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "employee_sentiments_tenant_id_recorded_date_idx" ON "employee_sentiments"("tenant_id", "recorded_date");

-- CreateIndex
CREATE INDEX "engagement_score_snapshots_tenant_id_period_idx" ON "engagement_score_snapshots"("tenant_id", "period");

-- CreateIndex
CREATE INDEX "employee_letters_tenant_id_employee_id_idx" ON "employee_letters"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "employee_letters_tenant_id_letter_type_idx" ON "employee_letters"("tenant_id", "letter_type");

-- CreateIndex
CREATE INDEX "employee_letters_tenant_id_status_idx" ON "employee_letters"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "faq_articles_tenant_id_category_idx" ON "faq_articles"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "faq_articles_tenant_id_is_published_idx" ON "faq_articles"("tenant_id", "is_published");

-- CreateIndex
CREATE INDEX "company_policies_tenant_id_category_idx" ON "company_policies"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "company_policies_tenant_id_code_key" ON "company_policies"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "vendor_contracts_tenant_id_vendor_id_idx" ON "vendor_contracts"("tenant_id", "vendor_id");

-- CreateIndex
CREATE INDEX "vendor_contracts_tenant_id_status_idx" ON "vendor_contracts"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_contracts_tenant_id_contract_number_key" ON "vendor_contracts"("tenant_id", "contract_number");

-- CreateIndex
CREATE INDEX "vendor_compliances_tenant_id_vendor_id_idx" ON "vendor_compliances"("tenant_id", "vendor_id");

-- CreateIndex
CREATE INDEX "vendor_compliances_tenant_id_status_idx" ON "vendor_compliances"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "meeting_rooms_tenant_id_is_active_idx" ON "meeting_rooms"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_rooms_tenant_id_name_key" ON "meeting_rooms"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "parking_slots_tenant_id_is_assigned_idx" ON "parking_slots"("tenant_id", "is_assigned");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slots_tenant_id_slot_number_key" ON "parking_slots"("tenant_id", "slot_number");

-- CreateIndex
CREATE INDEX "search_index_entries_tenant_id_entity_type_idx" ON "search_index_entries"("tenant_id", "entity_type");

-- CreateIndex
CREATE INDEX "search_index_entries_tenant_id_search_vector_idx" ON "search_index_entries"("tenant_id", "search_vector");

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_branding" ADD CONSTRAINT "tenant_branding_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_domains" ADD CONSTRAINT "tenant_domains_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_flags" ADD CONSTRAINT "tenant_feature_flags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_membership_roles" ADD CONSTRAINT "tenant_membership_roles_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "tenant_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_membership_roles" ADD CONSTRAINT "tenant_membership_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_role_permissions" ADD CONSTRAINT "tenant_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_role_permissions" ADD CONSTRAINT "tenant_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "tenant_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_metadata" ADD CONSTRAINT "document_metadata_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_metadata" ADD CONSTRAINT "document_metadata_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_status_history" ADD CONSTRAINT "employee_status_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_status_history" ADD CONSTRAINT "employee_status_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_status_history" ADD CONSTRAINT "employee_status_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_timeline_events" ADD CONSTRAINT "employee_timeline_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_timeline_events" ADD CONSTRAINT "employee_timeline_events_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_timeline_events" ADD CONSTRAINT "employee_timeline_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_calendars" ADD CONSTRAINT "work_calendars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_calendars" ADD CONSTRAINT "holiday_calendars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_metrics" ADD CONSTRAINT "usage_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_face_verification_id_fkey" FOREIGN KEY ("face_verification_id") REFERENCES "face_verifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_rules" ADD CONSTRAINT "attendance_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_exceptions" ADD CONSTRAINT "attendance_exceptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_exceptions" ADD CONSTRAINT "attendance_exceptions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_exceptions" ADD CONSTRAINT "attendance_exceptions_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_exceptions" ADD CONSTRAINT "attendance_exceptions_resolved_by_user_id_fkey" FOREIGN KEY ("resolved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summaries" ADD CONSTRAINT "attendance_summaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summaries" ADD CONSTRAINT "attendance_summaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_assignments" ADD CONSTRAINT "location_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_assignments" ADD CONSTRAINT "location_assignments_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_assignments" ADD CONSTRAINT "location_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_assignments" ADD CONSTRAINT "location_assignments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_verifications" ADD CONSTRAINT "location_verifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_verifications" ADD CONSTRAINT "location_verifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_verifications" ADD CONSTRAINT "location_verifications_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_verifications" ADD CONSTRAINT "location_verifications_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_verifications" ADD CONSTRAINT "location_verifications_override_by_user_id_fkey" FOREIGN KEY ("override_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_profiles" ADD CONSTRAINT "face_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_profiles" ADD CONSTRAINT "face_profiles_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_embeddings" ADD CONSTRAINT "face_embeddings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_embeddings" ADD CONSTRAINT "face_embeddings_face_profile_id_fkey" FOREIGN KEY ("face_profile_id") REFERENCES "face_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_enrollments" ADD CONSTRAINT "face_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_enrollments" ADD CONSTRAINT "face_enrollments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_enrollments" ADD CONSTRAINT "face_enrollments_face_profile_id_fkey" FOREIGN KEY ("face_profile_id") REFERENCES "face_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_enrollments" ADD CONSTRAINT "face_enrollments_enrolled_by_user_id_fkey" FOREIGN KEY ("enrolled_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_enrollments" ADD CONSTRAINT "face_enrollments_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_verifications" ADD CONSTRAINT "face_verifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_verifications" ADD CONSTRAINT "face_verifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_verifications" ADD CONSTRAINT "face_verifications_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_verifications" ADD CONSTRAINT "face_verifications_face_profile_id_fkey" FOREIGN KEY ("face_profile_id") REFERENCES "face_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liveness_verifications" ADD CONSTRAINT "liveness_verifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liveness_verifications" ADD CONSTRAINT "liveness_verifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liveness_verifications" ADD CONSTRAINT "liveness_verifications_face_verification_id_fkey" FOREIGN KEY ("face_verification_id") REFERENCES "face_verifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_accrual_rules" ADD CONSTRAINT "leave_accrual_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_accrual_rules" ADD CONSTRAINT "leave_accrual_rules_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_accrual_transactions" ADD CONSTRAINT "leave_accrual_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_accrual_transactions" ADD CONSTRAINT "leave_accrual_transactions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_accrual_transactions" ADD CONSTRAINT "leave_accrual_transactions_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_approvals" ADD CONSTRAINT "leave_approvals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_approvals" ADD CONSTRAINT "leave_approvals_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_approvals" ADD CONSTRAINT "leave_approvals_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_attachments" ADD CONSTRAINT "leave_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_attachments" ADD CONSTRAINT "leave_attachments_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_components" ADD CONSTRAINT "salary_components_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_templates" ADD CONSTRAINT "compensation_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_template_items" ADD CONSTRAINT "compensation_template_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "compensation_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_template_items" ADD CONSTRAINT "compensation_template_items_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "salary_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensations" ADD CONSTRAINT "employee_compensations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensations" ADD CONSTRAINT "employee_compensations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensations" ADD CONSTRAINT "employee_compensations_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "compensation_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensations" ADD CONSTRAINT "employee_compensations_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation_items" ADD CONSTRAINT "employee_compensation_items_compensation_id_fkey" FOREIGN KEY ("compensation_id") REFERENCES "employee_compensations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation_items" ADD CONSTRAINT "employee_compensation_items_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "salary_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation_histories" ADD CONSTRAINT "employee_compensation_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation_histories" ADD CONSTRAINT "employee_compensation_histories_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation_histories" ADD CONSTRAINT "employee_compensation_histories_compensation_id_fkey" FOREIGN KEY ("compensation_id") REFERENCES "employee_compensations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_compensation_histories" ADD CONSTRAINT "employee_compensation_histories_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run_employees" ADD CONSTRAINT "payroll_run_employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run_employees" ADD CONSTRAINT "payroll_run_employees_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run_employees" ADD CONSTRAINT "payroll_run_employees_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_component_breakdowns" ADD CONSTRAINT "payroll_component_breakdowns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_component_breakdowns" ADD CONSTRAINT "payroll_component_breakdowns_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_adjustments" ADD CONSTRAINT "payroll_adjustments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_approvals" ADD CONSTRAINT "payroll_approvals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_approvals" ADD CONSTRAINT "payroll_approvals_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_approvals" ADD CONSTRAINT "payroll_approvals_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_generated_by_user_id_fkey" FOREIGN KEY ("generated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_distributions" ADD CONSTRAINT "payslip_distributions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_distributions" ADD CONSTRAINT "payslip_distributions_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_distributions" ADD CONSTRAINT "payslip_distributions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_templates" ADD CONSTRAINT "payslip_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_rules" ADD CONSTRAINT "compliance_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_rule_versions" ADD CONSTRAINT "compliance_rule_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_rule_versions" ADD CONSTRAINT "compliance_rule_versions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "compliance_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_rule_versions" ADD CONSTRAINT "compliance_rule_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_snapshots" ADD CONSTRAINT "compliance_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_snapshots" ADD CONSTRAINT "compliance_snapshots_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_snapshots" ADD CONSTRAINT "compliance_snapshots_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_snapshots" ADD CONSTRAINT "compliance_snapshots_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_definitions" ADD CONSTRAINT "report_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_definitions" ADD CONSTRAINT "report_definitions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_report_definition_id_fkey" FOREIGN KEY ("report_definition_id") REFERENCES "report_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_report_definition_id_fkey" FOREIGN KEY ("report_definition_id") REFERENCES "report_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_saved_report_id_fkey" FOREIGN KEY ("saved_report_id") REFERENCES "saved_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_scheduled_report_id_fkey" FOREIGN KEY ("scheduled_report_id") REFERENCES "report_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_triggered_by_id_fkey" FOREIGN KEY ("triggered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_saved_report_id_fkey" FOREIGN KEY ("saved_report_id") REFERENCES "saved_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_initiated_by_id_fkey" FOREIGN KEY ("initiated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_executions" ADD CONSTRAINT "workflow_step_executions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_executions" ADD CONSTRAINT "workflow_step_executions_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_audits" ADD CONSTRAINT "workflow_audits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_audits" ADD CONSTRAINT "workflow_audits_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_templates" ADD CONSTRAINT "approval_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_approval_template_id_fkey" FOREIGN KEY ("approval_template_id") REFERENCES "approval_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_actions" ADD CONSTRAINT "approval_actions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_actions" ADD CONSTRAINT "approval_actions_approval_request_id_fkey" FOREIGN KEY ("approval_request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suspicious_activities" ADD CONSTRAINT "suspicious_activities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suspicious_activities" ADD CONSTRAINT "suspicious_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_knowledge_documents" ADD CONSTRAINT "ai_knowledge_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_knowledge_chunks" ADD CONSTRAINT "ai_knowledge_chunks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_knowledge_chunks" ADD CONSTRAINT "ai_knowledge_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "ai_knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workforce_predictions" ADD CONSTRAINT "ai_workforce_predictions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workforce_predictions" ADD CONSTRAINT "ai_workforce_predictions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_smart_insights" ADD CONSTRAINT "ai_smart_insights_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_document_extractions" ADD CONSTRAINT "ai_document_extractions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_requests" ADD CONSTRAINT "hiring_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_requests" ADD CONSTRAINT "hiring_requests_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_requests" ADD CONSTRAINT "hiring_requests_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_requests" ADD CONSTRAINT "hiring_requests_hiring_manager_id_fkey" FOREIGN KEY ("hiring_manager_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_hiring_request_id_fkey" FOREIGN KEY ("hiring_request_id") REFERENCES "hiring_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "job_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "job_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_panels" ADD CONSTRAINT "interview_panels_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_panels" ADD CONSTRAINT "interview_panels_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedbacks" ADD CONSTRAINT "interview_feedbacks_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedbacks" ADD CONSTRAINT "interview_feedbacks_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "job_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_approvals" ADD CONSTRAINT "offer_approvals_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_approvals" ADD CONSTRAINT "offer_approvals_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_tasks" ADD CONSTRAINT "preboarding_tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_tasks" ADD CONSTRAINT "preboarding_tasks_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_tasks" ADD CONSTRAINT "preboarding_tasks_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_tasks" ADD CONSTRAINT "preboarding_tasks_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_sources" ADD CONSTRAINT "recruitment_sources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_activities" ADD CONSTRAINT "candidate_activities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_activities" ADD CONSTRAINT "candidate_activities_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_cycles" ADD CONSTRAINT "goal_cycles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "goal_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_results" ADD CONSTRAINT "key_results_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_from_employee_id_fkey" FOREIGN KEY ("from_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_to_employee_id_fkey" FOREIGN KEY ("to_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_on_ones" ADD CONSTRAINT "one_on_ones_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_on_ones" ADD CONSTRAINT "one_on_ones_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_on_ones" ADD CONSTRAINT "one_on_ones_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_cycles" ADD CONSTRAINT "review_cycles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "review_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_scores" ADD CONSTRAINT "performance_review_scores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_scores" ADD CONSTRAINT "performance_review_scores_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "performance_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_scores" ADD CONSTRAINT "performance_review_scores_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencies" ADD CONSTRAINT "competencies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designation_competencies" ADD CONSTRAINT "designation_competencies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designation_competencies" ADD CONSTRAINT "designation_competencies_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designation_competencies" ADD CONSTRAINT "designation_competencies_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_competency_ratings" ADD CONSTRAINT "employee_competency_ratings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_competency_ratings" ADD CONSTRAINT "employee_competency_ratings_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "performance_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_competency_ratings" ADD CONSTRAINT "employee_competency_ratings_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_sessions" ADD CONSTRAINT "calibration_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_sessions" ADD CONSTRAINT "calibration_sessions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "review_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_sessions" ADD CONSTRAINT "calibration_sessions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_sessions" ADD CONSTRAINT "calibration_sessions_calibrated_by_user_id_fkey" FOREIGN KEY ("calibrated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_reviews" ADD CONSTRAINT "calibration_reviews_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "calibration_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_reviews" ADD CONSTRAINT "calibration_reviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "performance_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_reviews" ADD CONSTRAINT "calibration_reviews_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_increment_rules" ADD CONSTRAINT "salary_increment_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_recommendations" ADD CONSTRAINT "promotion_recommendations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_recommendations" ADD CONSTRAINT "promotion_recommendations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_recommendations" ADD CONSTRAINT "promotion_recommendations_target_designation_id_fkey" FOREIGN KEY ("target_designation_id") REFERENCES "designations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "succession_positions" ADD CONSTRAINT "succession_positions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "succession_positions" ADD CONSTRAINT "succession_positions_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "successor_pools" ADD CONSTRAINT "successor_pools_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "successor_pools" ADD CONSTRAINT "successor_pools_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "succession_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "successor_pools" ADD CONSTRAINT "successor_pools_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_category_masters" ADD CONSTRAINT "asset_category_masters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_vendors" ADD CONSTRAINT "asset_vendors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_category_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "asset_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transactions" ADD CONSTRAINT "asset_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transactions" ADD CONSTRAINT "asset_transactions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_warranties" ADD CONSTRAINT "asset_warranties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_warranties" ADD CONSTRAINT "asset_warranties_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_warranties" ADD CONSTRAINT "asset_warranties_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "asset_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_amcs" ADD CONSTRAINT "asset_amcs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_amcs" ADD CONSTRAINT "asset_amcs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_amcs" ADD CONSTRAINT "asset_amcs_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "asset_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_licenses" ADD CONSTRAINT "software_licenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_assignments" ADD CONSTRAINT "license_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_assignments" ADD CONSTRAINT "license_assignments_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "software_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_assignments" ADD CONSTRAINT "license_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_slas" ADD CONSTRAINT "ticket_slas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_escalations" ADD CONSTRAINT "ticket_escalations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_escalations" ADD CONSTRAINT "ticket_escalations_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_bookings" ADD CONSTRAINT "facility_bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_bookings" ADD CONSTRAINT "facility_bookings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_bookings" ADD CONSTRAINT "facility_bookings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desks" ADD CONSTRAINT "desks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desk_allocations" ADD CONSTRAINT "desk_allocations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desk_allocations" ADD CONSTRAINT "desk_allocations_desk_id_fkey" FOREIGN KEY ("desk_id") REFERENCES "desks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desk_allocations" ADD CONSTRAINT "desk_allocations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_logs" ADD CONSTRAINT "vehicle_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_logs" ADD CONSTRAINT "vehicle_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_visits" ADD CONSTRAINT "visitor_visits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_visits" ADD CONSTRAINT "visitor_visits_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_visits" ADD CONSTRAINT "visitor_visits_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_passes" ADD CONSTRAINT "visitor_passes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_passes" ADD CONSTRAINT "visitor_passes_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_passes" ADD CONSTRAINT "gate_passes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_passes" ADD CONSTRAINT "gate_passes_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_accesses" ADD CONSTRAINT "contractor_accesses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_accesses" ADD CONSTRAINT "contractor_accesses_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_clearances" ADD CONSTRAINT "exit_clearances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_clearances" ADD CONSTRAINT "exit_clearances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clearance_tasks" ADD CONSTRAINT "clearance_tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clearance_tasks" ADD CONSTRAINT "clearance_tasks_clearance_id_fkey" FOREIGN KEY ("clearance_id") REFERENCES "exit_clearances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clearance_tasks" ADD CONSTRAINT "clearance_tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_category_masters" ADD CONSTRAINT "expense_category_masters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_policies" ADD CONSTRAINT "expense_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_claims" ADD CONSTRAINT "expense_claims_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_claims" ADD CONSTRAINT "expense_claims_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_claims" ADD CONSTRAINT "expense_claims_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "expense_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_category_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_receipts" ADD CONSTRAINT "expense_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_receipts" ADD CONSTRAINT "expense_receipts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "expense_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "expense_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_audits" ADD CONSTRAINT "expense_audits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_audits" ADD CONSTRAINT "expense_audits_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "expense_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_requests" ADD CONSTRAINT "travel_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_requests" ADD CONSTRAINT "travel_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_requests" ADD CONSTRAINT "travel_requests_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_segments" ADD CONSTRAINT "travel_segments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_segments" ADD CONSTRAINT "travel_segments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "travel_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_advances" ADD CONSTRAINT "travel_advances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_advances" ADD CONSTRAINT "travel_advances_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "travel_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_advances" ADD CONSTRAINT "travel_advances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_settlements" ADD CONSTRAINT "travel_settlements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_settlements" ADD CONSTRAINT "travel_settlements_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "travel_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_settlements" ADD CONSTRAINT "travel_settlements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_budgets" ADD CONSTRAINT "department_budgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_budgets" ADD CONSTRAINT "department_budgets_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "department_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_groups" ADD CONSTRAINT "account_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_groups" ADD CONSTRAINT "account_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "account_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "account_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "accounting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_ledger_entries" ADD CONSTRAINT "general_ledger_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_ledger_entries" ADD CONSTRAINT "general_ledger_entries_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_ledger_entries" ADD CONSTRAINT "general_ledger_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_ledger_entries" ADD CONSTRAINT "general_ledger_entries_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "accounting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bank_accounts" ADD CONSTRAINT "vendor_bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bank_accounts" ADD CONSTRAINT "vendor_bank_accounts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_invoices" ADD CONSTRAINT "customer_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_invoices" ADD CONSTRAINT "customer_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_invoice_items" ADD CONSTRAINT "customer_invoice_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_invoice_items" ADD CONSTRAINT "customer_invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "customer_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "customer_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoices" ADD CONSTRAINT "vendor_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoices" ADD CONSTRAINT "vendor_invoices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoice_items" ADD CONSTRAINT "vendor_invoice_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoice_items" ADD CONSTRAINT "vendor_invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "vendor_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "vendor_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_statements" ADD CONSTRAINT "bank_statements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_statements" ADD CONSTRAINT "bank_statements_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "bank_statements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "bank_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_ledgers" ADD CONSTRAINT "tax_ledgers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gst_returns" ADD CONSTRAINT "gst_returns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gst_transactions" ADD CONSTRAINT "gst_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gst_transactions" ADD CONSTRAINT "gst_transactions_gst_return_id_fkey" FOREIGN KEY ("gst_return_id") REFERENCES "gst_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_integrations" ADD CONSTRAINT "erp_integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_connections" ADD CONSTRAINT "erp_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_connections" ADD CONSTRAINT "erp_connections_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "erp_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_jobs" ADD CONSTRAINT "erp_jobs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_jobs" ADD CONSTRAINT "erp_jobs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "erp_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_job_logs" ADD CONSTRAINT "erp_job_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_job_logs" ADD CONSTRAINT "erp_job_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "erp_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_statement_snapshots" ADD CONSTRAINT "financial_statement_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_scopes" ADD CONSTRAINT "api_scopes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_clients" ADD CONSTRAINT "api_clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_client_id_ref_fkey" FOREIGN KEY ("client_id_ref") REFERENCES "api_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_webhooks" ADD CONSTRAINT "api_webhooks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_subscriptions" ADD CONSTRAINT "api_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_subscriptions" ADD CONSTRAINT "api_subscriptions_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "api_webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_integrations" ADD CONSTRAINT "external_integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sso_configurations" ADD CONSTRAINT "sso_configurations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_categories" ADD CONSTRAINT "knowledge_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "knowledge_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_attachments" ADD CONSTRAINT "knowledge_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_attachments" ADD CONSTRAINT "knowledge_attachments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_apps" ADD CONSTRAINT "marketplace_apps_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_installs" ADD CONSTRAINT "marketplace_installs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_installs" ADD CONSTRAINT "marketplace_installs_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "marketplace_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_categories" ADD CONSTRAINT "training_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "training_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_courses" ADD CONSTRAINT "learning_path_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_enrollments" ADD CONSTRAINT "learning_path_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_enrollments" ADD CONSTRAINT "learning_path_enrollments_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_enrollments" ADD CONSTRAINT "learning_path_enrollments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_options" ADD CONSTRAINT "assessment_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "assessment_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "course_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_certifications" ADD CONSTRAINT "lms_certifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_certifications" ADD CONSTRAINT "lms_certifications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_certifications" ADD CONSTRAINT "employee_certifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_certifications" ADD CONSTRAINT "employee_certifications_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "lms_certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_certifications" ADD CONSTRAINT "employee_certifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "skill_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendances" ADD CONSTRAINT "session_attendances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendances" ADD CONSTRAINT "session_attendances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendances" ADD CONSTRAINT "session_attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_reports_to_position_id_fkey" FOREIGN KEY ("reports_to_position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_assignments" ADD CONSTRAINT "position_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_assignments" ADD CONSTRAINT "position_assignments_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_assignments" ADD CONSTRAINT "position_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headcount_plans" ADD CONSTRAINT "headcount_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headcount_plans" ADD CONSTRAINT "headcount_plans_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headcount_plans" ADD CONSTRAINT "headcount_plans_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headcount_plans" ADD CONSTRAINT "headcount_plans_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headcount_scenarios" ADD CONSTRAINT "headcount_scenarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headcount_scenarios" ADD CONSTRAINT "headcount_scenarios_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "headcount_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_cost_forecasts" ADD CONSTRAINT "workforce_cost_forecasts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_cost_forecasts" ADD CONSTRAINT "workforce_cost_forecasts_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "headcount_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_cost_forecasts" ADD CONSTRAINT "workforce_cost_forecasts_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_structure_versions" ADD CONSTRAINT "org_structure_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attrition_risk_assessments" ADD CONSTRAINT "attrition_risk_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attrition_risk_assessments" ADD CONSTRAINT "attrition_risk_assessments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_supply_demand_forecasts" ADD CONSTRAINT "skill_supply_demand_forecasts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_devices" ADD CONSTRAINT "biometric_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_punches" ADD CONSTRAINT "biometric_punches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_punches" ADD CONSTRAINT "biometric_punches_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "biometric_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_punches" ADD CONSTRAINT "biometric_punches_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_sync_logs" ADD CONSTRAINT "device_sync_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_sync_logs" ADD CONSTRAINT "device_sync_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "biometric_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_requester_employee_id_fkey" FOREIGN KEY ("requester_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_target_employee_id_fkey" FOREIGN KEY ("target_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_source_shift_id_fkey" FOREIGN KEY ("source_shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_target_shift_id_fkey" FOREIGN KEY ("target_shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_anomalies" ADD CONSTRAINT "attendance_anomalies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_anomalies" ADD CONSTRAINT "attendance_anomalies_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_attendances" ADD CONSTRAINT "contractor_attendances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_schedules" ADD CONSTRAINT "workforce_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_cycles" ADD CONSTRAINT "payroll_cycles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_tax_declarations" ADD CONSTRAINT "payroll_tax_declarations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_tax_declarations" ADD CONSTRAINT "payroll_tax_declarations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_tax_proofs" ADD CONSTRAINT "payroll_tax_proofs_declaration_id_fkey" FOREIGN KEY ("declaration_id") REFERENCES "payroll_tax_declarations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_tax_computations" ADD CONSTRAINT "payroll_tax_computations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_tax_computations" ADD CONSTRAINT "payroll_tax_computations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_settlements" ADD CONSTRAINT "payroll_settlements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_settlements" ADD CONSTRAINT "payroll_settlements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_gratuities" ADD CONSTRAINT "payroll_gratuities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_gratuities" ADD CONSTRAINT "payroll_gratuities_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_bonuses" ADD CONSTRAINT "payroll_bonuses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_bonuses" ADD CONSTRAINT "payroll_bonuses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_incentives" ADD CONSTRAINT "payroll_incentives_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_incentives" ADD CONSTRAINT "payroll_incentives_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_arrears" ADD CONSTRAINT "payroll_arrears_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_arrears" ADD CONSTRAINT "payroll_arrears_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_loans" ADD CONSTRAINT "payroll_loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_loans" ADD CONSTRAINT "payroll_loans_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_loan_installments" ADD CONSTRAINT "payroll_loan_installments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "payroll_loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_revisions" ADD CONSTRAINT "compensation_revisions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_revisions" ADD CONSTRAINT "compensation_revisions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_bands" ADD CONSTRAINT "salary_bands_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_benchmarks" ADD CONSTRAINT "salary_benchmarks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_surveys" ADD CONSTRAINT "engagement_surveys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "engagement_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "engagement_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_surveys" ADD CONSTRAINT "pulse_surveys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_responses" ADD CONSTRAINT "pulse_responses_pulse_survey_id_fkey" FOREIGN KEY ("pulse_survey_id") REFERENCES "pulse_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_responses" ADD CONSTRAINT "pulse_responses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enps_campaigns" ADD CONSTRAINT "enps_campaigns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enps_responses" ADD CONSTRAINT "enps_responses_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "enps_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enps_responses" ADD CONSTRAINT "enps_responses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognition_badges" ADD CONSTRAINT "recognition_badges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_sender_employee_id_fkey" FOREIGN KEY ("sender_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_receiver_employee_id_fkey" FOREIGN KEY ("receiver_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "recognition_badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "recognition_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_point_ledgers" ADD CONSTRAINT "reward_point_ledgers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_point_ledgers" ADD CONSTRAINT "reward_point_ledgers_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_catalogs" ADD CONSTRAINT "reward_catalogs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "reward_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_communities" ADD CONSTRAINT "employee_communities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "employee_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "employee_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_employee_id_fkey" FOREIGN KEY ("author_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_author_employee_id_fkey" FOREIGN KEY ("author_employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "community_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reactions" ADD CONSTRAINT "community_reactions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion_votes" ADD CONSTRAINT "suggestion_votes_suggestion_id_fkey" FOREIGN KEY ("suggestion_id") REFERENCES "suggestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion_votes" ADD CONSTRAINT "suggestion_votes_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_challenges" ADD CONSTRAINT "innovation_challenges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_submissions" ADD CONSTRAINT "innovation_submissions_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "innovation_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_submissions" ADD CONSTRAINT "innovation_submissions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "culture_metrics" ADD CONSTRAINT "culture_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_sentiments" ADD CONSTRAINT "employee_sentiments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_sentiments" ADD CONSTRAINT "employee_sentiments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_score_snapshots" ADD CONSTRAINT "engagement_score_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_letters" ADD CONSTRAINT "employee_letters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_letters" ADD CONSTRAINT "employee_letters_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_articles" ADD CONSTRAINT "faq_articles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policies" ADD CONSTRAINT "company_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_contracts" ADD CONSTRAINT "vendor_contracts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_contracts" ADD CONSTRAINT "vendor_contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_compliances" ADD CONSTRAINT "vendor_compliances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_compliances" ADD CONSTRAINT "vendor_compliances_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_rooms" ADD CONSTRAINT "meeting_rooms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_index_entries" ADD CONSTRAINT "search_index_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

