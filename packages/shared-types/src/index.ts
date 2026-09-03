export type TenantStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type TenantPlan = "TRIAL" | "STANDARD" | "PRO" | "ENTERPRISE";
export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "REMOVED";
export type MembershipStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "REMOVED";
export type EmploymentStatus = "DRAFT" | "INVITED" | "ACTIVE" | "PROBATION" | "ON_LEAVE" | "NOTICE_PERIOD" | "INACTIVE" | "ARCHIVED";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY";
export type SalaryType = "MONTHLY" | "DAILY" | "HOURLY";
export type EmployeeDocumentType =
  | "IDENTITY_PROOF"
  | "ADDRESS_PROOF"
  | "OFFER_LETTER"
  | "EMPLOYMENT_AGREEMENT"
  | "BANK_DOCUMENT"
  | "TAX_DOCUMENT"
  | "CUSTOM";
export type EmployeeDocumentStatus = "DRAFT" | "ACTIVE" | "REPLACED" | "REJECTED" | "ARCHIVED";

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
  | "HOLIDAY"
  | "WEEK_OFF"
  | "WORK_FROM_HOME"
  | "ON_LEAVE"
  | "PENDING_REVIEW";

export type AttendanceEventType =
  | "CHECK_IN"
  | "CHECK_OUT"
  | "MANUAL_ADJUSTMENT"
  | "STATUS_CHANGE"
  | "CORRECTION_REQUEST"
  | "CORRECTION_APPROVAL"
  | "CORRECTION_REJECTION";

export type CorrectionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type LocationType =
  | "FACTORY"
  | "OFFICE"
  | "WAREHOUSE"
  | "RETAIL_OUTLET"
  | "DISTRIBUTION_CENTER"
  | "CUSTOM";

export type LocationVerificationStatus =
  | "VERIFIED"
  | "OUTSIDE_RADIUS"
  | "ACCURACY_TOO_LOW"
  | "NO_ASSIGNED_LOCATION"
  | "LOCATION_DISABLED"
  | "ASSIGNMENT_EXPIRED"
  | "MANUAL_OVERRIDE"
  | "BYPASS_ALLOWED";

export type FaceProfileStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "ARCHIVED";

export type FaceEnrollmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUPERSEDED";

export type FaceVerificationStatus =
  | "MATCHED"
  | "MISMATCH"
  | "LOW_CONFIDENCE"
  | "NO_ACTIVE_PROFILE"
  | "SPOOF_DETECTED"
  | "QUALITY_FAILED"
  | "BYPASSED";

export type LivenessVerificationStatus =
  | "PASSED"
  | "FAILED"
  | "SUSPICIOUS"
  | "RETAKE_REQUIRED"
  | "CAMERA_ERROR"
  | "TIMEOUT";

export type LeaveCategory =
  | "CASUAL"
  | "SICK"
  | "EARNED"
  | "COMPENSATORY_OFF"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID"
  | "CUSTOM";

export type LeaveRequestStatus =
  | "PENDING_MANAGER"
  | "PENDING_HR"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveAccrualFrequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "MANUAL";

export type LeaveTransactionType =
  | "ALLOCATION"
  | "MONTHLY_ACCRUAL"
  | "QUARTERLY_ACCRUAL"
  | "YEARLY_ACCRUAL"
  | "USAGE"
  | "CARRY_FORWARD"
  | "EXPIRY"
  | "MANUAL_ADJUSTMENT"
  | "CANCELLATION_REFUND";

export type SandwichPolicyType =
  | "NONE"
  | "WEEKENDS_ONLY"
  | "HOLIDAYS_ONLY"
  | "WEEKENDS_AND_HOLIDAYS";

export type PlatformRole = "PLATFORM_SUPER_ADMIN" | "PLATFORM_SUPPORT" | "PLATFORM_READONLY";

export type TenantRoleCode =
  | "TENANT_OWNER"
  | "TENANT_ADMIN"
  | "HR_ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export type PermissionCode =
  | "tenant.dashboard.read"
  | "tenant.settings.read"
  | "tenant.settings.update"
  | "tenant.branding.read"
  | "tenant.branding.update"
  | "tenant.features.read"
  | "tenant.features.update"
  | "tenant.domains.read"
  | "tenant.domains.update"
  | "roles.read"
  | "roles.create"
  | "roles.update"
  | "permissions.read"
  | "users.read"
  | "users.invite"
  | "users.update"
  | "users.deactivate"
  | "users.reset_access"
  | "employees.read"
  | "employees.create"
  | "employees.update"
  | "employees.archive"
  | "employees.status.update"
  | "employees.import"
  | "employees.export"
  | "employees.bulk.update"
  | "departments.read"
  | "departments.create"
  | "departments.update"
  | "designations.read"
  | "designations.create"
  | "designations.update"
  | "documents.read"
  | "documents.metadata.create"
  | "documents.metadata.update"
  | "documents.archive"
  | "attendance.view"
  | "attendance.create"
  | "attendance.update"
  | "attendance.correct"
  | "attendance.approve"
  | "attendance.export"
  | "location.view"
  | "location.create"
  | "location.update"
  | "location.assign"
  | "location.override"
  | "location.audit"
  | "face.view"
  | "face.enroll"
  | "face.verify"
  | "face.manage"
  | "face.audit"
  | "leave.view"
  | "leave.create"
  | "leave.approve"
  | "leave.cancel"
  | "leave.manage"
  | "leave.audit"
  | "compensation.view"
  | "compensation.manage"
  | "compensation.audit"
  | "payroll.view"
  | "payroll.read"
  | "payroll.manage"
  | "payroll.process"
  | "payroll.generate"
  | "payroll.approve"
  | "payroll.lock"
  | "payroll.audit"
  | "payroll.tax"
  | "payroll.compliance"
  | "payroll.compensation"
  | "payroll.analytics"
  | "payslip.view"
  | "payslip.generate"
  | "payslip.distribute"
  | "payslip.audit"
  | "compliance.view"
  | "compliance.manage"
  | "compliance.report"
  | "compliance.audit"
  | "analytics.view"
  | "analytics.manage"
  | "reports.view"
  | "reports.create"
  | "reports.export"
  | "reports.schedule"
  | "reports.audit"
  | "report.view"
  | "report.create"
  | "report.export"
  | "report.schedule"
  | "dashboard.view"
  | "dashboard.manage"
  | "notifications.view"
  | "notifications.send"
  | "notifications.manage"
  | "workflows.view"
  | "workflows.create"
  | "workflows.action"
  | "workflows.manage"
  | "workflows.audit"
  | "approvals.view"
  | "approvals.create"
  | "approvals.action"
  | "approvals.manage"
  | "organization.view"
  | "organization.manage"
  | "security.view"
  | "security.manage"
  | "profile.view"
  | "profile.update"
  | "documents.view"
  | "documents.upload"
  | "documents.verify"
  | "requests.view"
  | "requests.create"
  | "requests.manage"
  | "announcements.view"
  | "announcements.manage"
  | "announcements.acknowledge"
  | "directory.view"
  | "idcard.view"
  | "ai.chat"
  | "ai.knowledge.read"
  | "ai.knowledge.manage"
  | "ai.prediction.read"
  | "ai.insights.read"
  | "ai.documents.extract"
  | "ai.reports.generate"
  | "ai.settings.manage"
  | "recruitment.read"
  | "recruitment.manage"
  | "candidates.read"
  | "candidates.create"
  | "candidates.manage"
  | "applications.read"
  | "applications.manage"
  | "interviews.read"
  | "interviews.schedule"
  | "interviews.feedback"
  | "offers.read"
  | "offers.create"
  | "offers.manage"
  | "preboarding.read"
  | "preboarding.manage"
  | "careers.manage"
  | "performance.view"
  | "performance.manage"
  | "performance.review"
  | "performance.calibration"
  | "performance.analytics"
  | "performance.succession"
  | "assets.view"
  | "assets.manage"
  | "inventory.view"
  | "inventory.manage"
  | "helpdesk.view"
  | "helpdesk.manage"
  | "facilities.view"
  | "facilities.manage"
  | "visitor.view"
  | "visitor.manage"
  | "gatepass.manage"
  | "clearance.manage"
  | "finance.view"
  | "finance.manage"
  | "finance.approve"
  | "finance.pay"
  | "finance.audit"
  | "finance.accounts.view"
  | "finance.accounts.manage"
  | "finance.gl.view"
  | "finance.gl.post"
  | "finance.journal.view"
  | "finance.journal.manage"
  | "finance.journal.approve"
  | "finance.bank.view"
  | "finance.bank.manage"
  | "finance.vendor.view"
  | "finance.vendor.manage"
  | "finance.payable.view"
  | "finance.payable.manage"
  | "finance.receivable.view"
  | "finance.receivable.manage"
  | "finance.tax.view"
  | "finance.tax.manage"
  | "finance.erp.view"
  | "finance.erp.manage"
  | "finance.report.view"
  | "finance.report.export"
  | "integrations.view"
  | "integrations.manage"
  | "integrations.api.view"
  | "integrations.api.manage"
  | "integrations.webhooks.view"
  | "integrations.webhooks.manage"
  | "integrations.connectors.view"
  | "integrations.connectors.manage"
  | "integrations.sso.view"
  | "integrations.sso.manage"
  | "automation.view"
  | "automation.manage"
  | "automation.run"
  | "knowledge.view"
  | "knowledge.manage"
  | "marketplace.view"
  | "marketplace.manage"
  | "ai.assistant.view"
  | "expenses.view"
  | "expenses.create"
  | "expenses.submit"
  | "expenses.approve"
  | "expenses.pay"
  | "expenses.manage"
  | "travel.view"
  | "travel.create"
  | "travel.approve"
  | "travel.manage"
  | "budgets.view"
  | "budgets.manage"
  | "reimbursements.view"
  | "reimbursements.manage"
  | "analytics.operations"
  | "audit.read"
  | "platform.tenants.read"
  | "platform.tenants.create"
  | "platform.tenants.update"
  | "platform.tenants.status"
  | "platform.audit.read"
  | "lms.view"
  | "lms.manage"
  | "lms.enroll"
  | "lms.assess"
  | "lms.certifications"
  | "lms.skills"
  | "lms.instructors"
  | "lms.analytics"
  | "lms.compliance"
  | "workforce.view"
  | "workforce.manage"
  | "workforce.positions.manage"
  | "workforce.headcount.plan"
  | "workforce.cost.forecast"
  | "workforce.orgdesign.manage"
  | "workforce.succession.manage"
  | "workforce.attrition.predict"
  | "workforce.skills.forecast"
  | "workforce.analytics.view"
  | "workforce.operations.view"
  | "workforce.operations.manage"
  | "attendance.shifts.manage"
  | "attendance.biometric.sync"
  | "attendance.devices.manage"
  | "attendance.geofence.manage"
  | "attendance.overtime.manage"
  | "attendance.anomalies.manage"
  | "attendance.contractors.manage"
  | "attendance.scheduling.manage"
  | "engagement.read"
  | "engagement.manage"
  | "engagement.survey"
  | "engagement.recognition"
  | "engagement.rewards"
  | "engagement.analytics"
  | "engagement.ai"
  | "ess.read"
  | "ess.manage"
  | "mss.read"
  | "mss.manage"
  | "letters.generate"
  | "communications.manage"
  | "servicedelivery.analytics"
  | "vendors.manage"
  | "contractors.manage"
  | "assets.manage"
  | "visitors.manage"
  | "facilities.manage"
  | "search.global"
  | "notifications.manage"
  | "executive.intelligence"
  | "system.health";

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  userId: string;
  membershipId: string;
  roles: TenantRoleCode[];
  permissions: PermissionCode[];
  plan: TenantPlan;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId: string;
    tenantId?: string;
    details?: Record<string, unknown>;
  };
}

export interface TenantBrandingView {
  displayName: string;
  logoObjectKey: string | null;
  faviconObjectKey: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pwaName: string;
  pwaShortName: string;
}

export interface AttendanceRecordView {
  id: string;
  tenantId: string;
  employeeId: string;
  shiftId: string | null;
  date: string;
  status: AttendanceStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedMinutes: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  overtimeMinutes: number;
  notes: string | null;
  isManual: boolean;
  locationId?: string | null;
  distanceMeters?: number | null;
  accuracyMeters?: number | null;
  locationVerificationStatus?: LocationVerificationStatus | null;
  locationVerificationReason?: string | null;
  faceVerificationId?: string | null;
  faceVerificationStatus?: FaceVerificationStatus | null;
  livenessVerificationStatus?: LivenessVerificationStatus | null;
  biometricTrustScore?: number | null;
  biometricVerificationReason?: string | null;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: { name: string };
    designation?: { name: string };
  };
  shift?: {
    id: string;
    name: string;
    code: string;
    startsAtMinute: number;
    endsAtMinute: number;
  } | null;
}

export interface AttendanceRuleConfig {
  lateThresholdMinutes: number;
  halfDayThresholdMinutes: number;
  minimumWorkDurationMinutes: number;
  maximumWorkDurationMinutes: number;
  gracePeriodMinutes: number;
  overtimeThresholdMinutes: number;
  allowSelfCheckIn: boolean;
  requireGeofence: boolean;
  requireFaceVerification: boolean;
}

export interface LocationView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  type: LocationType;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxAccuracyMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignments: number;
  };
}

export interface LocationAssignmentView {
  id: string;
  tenantId: string;
  locationId: string;
  employeeId: string | null;
  departmentId: string | null;
  startsOn: string;
  endsOn: string | null;
  isPriority: boolean;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  } | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface LocationVerificationView {
  id: string;
  tenantId: string;
  employeeId: string;
  attendanceId: string | null;
  locationId: string | null;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  distanceMeters: number | null;
  status: LocationVerificationStatus;
  reason: string;
  isManualOverride: boolean;
  overrideReason: string | null;
  createdAt: string;
  employee?: {
    fullName: string;
    employeeCode: string;
  };
  location?: {
    name: string;
    code: string;
  } | null;
}

export interface GpsVerificationResult {
  verified: boolean;
  status: LocationVerificationStatus;
  distanceMeters: number | null;
  accuracyMeters: number;
  matchedLocationId: string | null;
  matchedLocationName: string | null;
  reason: string;
}

export interface FaceProfileView {
  id: string;
  tenantId: string;
  employeeId: string;
  status: FaceProfileStatus;
  version: number;
  enrolledAt: string | null;
  lastVerifiedAt: string | null;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
}

export interface FaceEnrollmentView {
  id: string;
  tenantId: string;
  employeeId: string;
  faceProfileId: string | null;
  qualityScore: number;
  livenessScore: number;
  status: FaceEnrollmentStatus;
  version: number;
  reason: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  enrolledBy?: {
    email: string;
  };
  reviewedBy?: {
    email: string;
  } | null;
}

export interface FaceVerificationView {
  id: string;
  tenantId: string;
  employeeId: string;
  attendanceId: string | null;
  faceProfileId: string | null;
  status: FaceVerificationStatus;
  confidenceScore: number;
  thresholdUsed: number;
  reason: string;
  createdAt: string;
  employee?: {
    fullName: string;
    employeeCode: string;
  };
}

export interface LivenessResult {
  passed: boolean;
  status: LivenessVerificationStatus;
  livenessScore: number;
  reason: string;
  checksPerformed: string[];
}

export interface FaceMatchResult {
  matched: boolean;
  status: FaceVerificationStatus;
  confidenceScore: number;
  thresholdUsed: number;
  reason: string;
}

// ----------------- Leave Domain Views -----------------

export interface LeaveTypeView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  category: LeaveCategory;
  description: string | null;
  color: string;
  isPaid: boolean;
  isActive: boolean;
  createdAt: string;
  policy?: LeavePolicyView | null;
  policies?: LeavePolicyView[];
}

export interface LeavePolicyView {
  id: string;
  tenantId: string;
  leaveTypeId: string;
  annualAllocationDays: number;
  accrualFrequency: LeaveAccrualFrequency;
  accrualDaysPerPeriod: number;
  maxCarryForwardDays: number;
  carryForwardExpiryMonths: number;
  allowNegativeBalance: boolean;
  maxNegativeBalanceDays: number;
  requiresManagerApproval: boolean;
  requiresHrApproval: boolean;
  requiresAttachment: boolean;
  attachmentMandatoryAboveDays: number;
  minimumNoticeDays: number;
  maxConsecutiveDays: number;
  sandwichPolicy: SandwichPolicyType;
  isActive: boolean;
  leaveType?: LeaveTypeView;
}

export interface LeaveBalanceView {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allocatedDays: number;
  accruedDays: number;
  carriedForwardDays: number;
  usedDays: number;
  pendingDays: number;
  expiredDays: number;
  manualAdjustedDays: number;
  availableDays: number;
  leaveType?: LeaveTypeView;
}

export interface LeaveRequestView {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession: string | null;
  totalDays: number;
  deductedDays: number;
  reason: string;
  status: LeaveRequestStatus;
  attachmentObjectKey: string | null;
  rejectionReason: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: { name: string };
    designation?: { name: string };
  };
  leaveType?: LeaveTypeView;
  approvals?: Array<{
    id: string;
    approverRole: string;
    action: string;
    note: string | null;
    decidedAt: string;
    approverUser?: { email: string };
  }>;
}

export interface LeaveAccrualTransactionView {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  transactionType: LeaveTransactionType;
  days: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string | null;
  createdAt: string;
  leaveType?: LeaveTypeView;
}

export interface HolidayView {
  id: string;
  tenantId: string;
  name: string;
  date: string;
  isOptional: boolean;
  description: string | null;
}

export interface LeaveCalendarEventView {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: "LEAVE" | "HOLIDAY";
  category?: string;
  employeeName?: string;
  employeeCode?: string;
  departmentName?: string;
  status?: string;
  color: string;
}

// ----------------- TASK 11.5: COMPENSATION TYPES & VIEWS -----------------

export type SalaryComponentType =
  | "EARNING"
  | "DEDUCTION"
  | "EMPLOYER_CONTRIBUTION"
  | "INFORMATIONAL";

export type SalaryComponentCategory =
  | "BASIC"
  | "HRA"
  | "CONVEYANCE"
  | "MEDICAL"
  | "SPECIAL_ALLOWANCE"
  | "BONUS"
  | "PF"
  | "ESI"
  | "PROFESSIONAL_TAX"
  | "TDS"
  | "CUSTOM";

export type CompensationCalculationType =
  | "FLAT_AMOUNT"
  | "PERCENTAGE_OF_BASIC"
  | "PERCENTAGE_OF_GROSS"
  | "FORMULA";

export type CompensationStatus =
  | "DRAFT"
  | "ACTIVE"
  | "REVISED"
  | "TERMINATED";

export type CompensationChangeReason =
  | "JOINING_SALARY"
  | "ANNUAL_REVISION"
  | "PROMOTION_INCREASE"
  | "MANUAL_ADJUSTMENT"
  | "OTHER";

export interface SalaryComponentView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: SalaryComponentType;
  category: SalaryComponentCategory;
  isTaxable: boolean;
  isFixed: boolean;
  calculationType: CompensationCalculationType;
  calculationValue: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CompensationTemplateItemView {
  id: string;
  tenantId: string;
  templateId: string;
  componentId: string;
  calculationType: CompensationCalculationType;
  calculationValue: number;
  monthlyAmount: number;
  annualAmount: number;
  order: number;
  component?: SalaryComponentView;
}

export interface CompensationTemplateView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  jobRole: string | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  items?: CompensationTemplateItemView[];
}

export interface EmployeeCompensationItemView {
  id: string;
  tenantId: string;
  compensationId: string;
  componentId: string;
  monthlyAmount: number;
  annualAmount: number;
  component?: SalaryComponentView;
}

export interface EmployeeCompensationView {
  id: string;
  tenantId: string;
  employeeId: string;
  templateId: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  monthlyCtc: number;
  annualCtc: number;
  currency: string;
  status: CompensationStatus;
  reason: CompensationChangeReason;
  notes: string | null;
  approvedByUserId: string | null;
  approvedAt: string | null;
  createdAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: { name: string };
    designation?: { name: string };
    joiningDate?: string;
  };
  template?: CompensationTemplateView | null;
  items?: EmployeeCompensationItemView[];
}

export interface EmployeeCompensationHistoryView {
  id: string;
  tenantId: string;
  employeeId: string;
  compensationId: string | null;
  previousMonthlyCtc: number;
  previousAnnualCtc: number;
  newMonthlyCtc: number;
  newAnnualCtc: number;
  currency: string | null;
  reason: CompensationChangeReason;
  notes: string | null;
  revisionDate: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  approvedByUserId: string | null;
  breakdownSnapshot: Record<string, unknown>;
  createdAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  approvedBy?: {
    id: string;
    email: string;
  } | null;
}

export interface CompensationBreakdownResult {
  monthlyCtc: number;
  annualCtc: number;
  grossEarningsMonthly: number;
  grossEarningsAnnual: number;
  totalDeductionsMonthly: number;
  totalDeductionsAnnual: number;
  employerContributionsMonthly: number;
  employerContributionsAnnual: number;
  netTakeHomeMonthly: number;
  netTakeHomeAnnual: number;
  items: Array<{
    componentId: string;
    name: string;
    code: string;
    type: SalaryComponentType;
    category: SalaryComponentCategory;
    monthlyAmount: number;
    annualAmount: number;
    calculationType: CompensationCalculationType;
    calculationValue: number;
  }>;
}

// ----------------- Payroll Domain Types & Views -----------------

export type PayrollRunStatus =
  | "DRAFT"
  | "PROCESSING"
  | "GENERATED"
  | "APPROVED"
  | "LOCKED"
  | "CANCELLED";

export type PayrollEmployeeStatus =
  | "CALCULATED"
  | "FLAGGED"
  | "APPROVED"
  | "PAID"
  | "EXCLUDED";

export type PayrollAdjustmentType =
  | "BONUS"
  | "PENALTY"
  | "REIMBURSEMENT"
  | "ADVANCE_RECOVERY"
  | "CUSTOM";

export interface PayrollRunView {
  id: string;
  tenantId: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerContributions: number;
  currency: string;
  notes: string | null;
  createdByUserId: string;
  approvedByUserId: string | null;
  approvedAt: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    email: string;
  } | null;
  employees?: PayrollRunEmployeeView[];
  adjustments?: PayrollAdjustmentView[];
  approvals?: PayrollApprovalView[];
}

export interface PayrollRunEmployeeView {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  holidayDays: number;
  halfDays: number;
  absentDays: number;
  lateDays: number;
  earlyExitDays: number;
  payableDays: number;
  dailyRate: number;
  baseMonthlyCtc: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  employerContributions: number;
  totalAdjustments: number;
  attendanceSnapshot: Record<string, unknown>;
  leaveSnapshot: Record<string, unknown>;
  compensationSnapshot: Record<string, unknown>;
  status: PayrollEmployeeStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: { name: string };
    designation?: { name: string };
    joiningDate?: string;
  };
  breakdowns?: PayrollComponentBreakdownView[];
  adjustments?: PayrollAdjustmentView[];
}

export interface PayrollComponentBreakdownView {
  id: string;
  tenantId: string;
  payrollRunEmployeeId: string;
  componentId: string | null;
  name: string;
  code: string;
  type: SalaryComponentType;
  category: SalaryComponentCategory;
  baseAmount: number;
  proratedAmount: number;
  isTaxable: boolean;
  createdAt: string;
}

export interface PayrollAdjustmentView {
  id: string;
  tenantId: string;
  payrollRunId: string;
  payrollRunEmployeeId: string;
  type: PayrollAdjustmentType;
  title: string;
  amount: number;
  reason: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    email: string;
  };
}

export interface PayrollApprovalView {
  id: string;
  tenantId: string;
  payrollRunId: string;
  approverUserId: string;
  approverRole: string;
  action: string;
  note: string | null;
  decidedAt: string;
  approverUser?: {
    id: string;
    email: string;
  };
}

export interface PayableDaysResultView {
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  holidayDays: number;
  halfDays: number;
  absentDays: number;
  lateDays: number;
  earlyExitDays: number;
  payableDays: number;
}

// ----------------- Payslip Domain Types & Views -----------------

export type PayslipStatus =
  | "DRAFT"
  | "GENERATED"
  | "DISTRIBUTED"
  | "VIEWED"
  | "DOWNLOADED"
  | "ARCHIVED";

export type PayslipSignatureStatus =
  | "UNSIGNED"
  | "SIGNED"
  | "REVOKED";

export type PayslipDistributionStatus =
  | "PENDING"
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "FAILED";

export interface PayslipView {
  id: string;
  tenantId: string;
  employeeId: string;
  payrollRunId: string;
  payrollRunEmployeeId: string;
  month: number;
  year: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  pdfPath: string;
  version: number;
  signatureStatus: PayslipSignatureStatus;
  status: PayslipStatus;
  metadata: Record<string, unknown>;
  generatedAt: string;
  generatedByUserId: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    email?: string;
    department?: { name: string };
    designation?: { name: string };
    joiningDate?: string;
  };
  payrollRun?: {
    id: string;
    month: number;
    year: number;
    status: string;
    currency: string;
  };
  payrollRunEmployee?: PayrollRunEmployeeView;
  distributions?: PayslipDistributionView[];
}

export interface PayslipDistributionView {
  id: string;
  tenantId: string;
  payslipId: string;
  employeeId: string;
  channel: string;
  recipientEmail: string;
  status: PayslipDistributionStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  retryCount: number;
  lastAttemptAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  payslip?: {
    id: string;
    month: number;
    year: number;
    version: number;
  };
}

export interface PayslipTemplateView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  headerHtml: string | null;
  footerHtml: string | null;
  colorScheme: string;
  showLogo: boolean;
  showAttendanceSummary: boolean;
  showLeaveSummary: boolean;
  showEmployerContribution: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------- Statutory Compliance Domain Types & Views -----------------

export type ComplianceType = "PF" | "ESI" | "PT" | "TDS";
export type TaxRegime = "OLD" | "NEW";

export interface ComplianceRuleView {
  id: string;
  tenantId: string;
  type: ComplianceType;
  name: string;
  code: string;
  state: string | null;
  description: string | null;
  isActive: boolean;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  versions?: ComplianceRuleVersionView[];
}

export interface ComplianceRuleVersionView {
  id: string;
  tenantId: string;
  ruleId: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  configuration: Record<string, unknown>;
  createdById: string;
  createdAt: string;
  createdBy?: {
    id: string;
    email: string;
  };
}

export interface ComplianceSnapshotView {
  id: string;
  tenantId: string;
  payrollRunId: string;
  payrollRunEmployeeId: string;
  employeeId: string;
  month: number;
  year: number;
  pfEmployee: number;
  pfEmployer: number;
  pfWageBasis: number;
  esiEmployee: number;
  esiEmployer: number;
  esiWageBasis: number;
  ptAmount: number;
  ptState: string | null;
  tdsAmount: number;
  tdsRegime: TaxRegime;
  ruleVersions: Record<string, unknown>;
  createdAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    department?: { name: string };
    designation?: { name: string };
  };
  payrollRun?: {
    id: string;
    month: number;
    year: number;
    status: string;
  };
}

export interface ComplianceSummaryReportView {
  month: number;
  year: number;
  totalEmployees: number;
  pf: {
    totalEmployeesCovered: number;
    totalPfWageBasis: number;
    totalEmployeePf: number;
    totalEmployerPf: number;
    totalEmployerEps: number;
    totalAdminCharges: number;
    totalEdliCharges: number;
    totalPfContribution: number;
  };
  esi: {
    totalEmployeesCovered: number;
    totalEsiWageBasis: number;
    totalEmployeeEsi: number;
    totalEmployerEsi: number;
    totalEsiContribution: number;
  };
  pt: {
    totalEmployeesCovered: number;
    totalPtDeducted: number;
    stateBreakdown: Array<{ state: string; count: number; totalAmount: number }>;
  };
  tds: {
    totalEmployeesCovered: number;
    totalTdsDeducted: number;
    oldRegimeCount: number;
    newRegimeCount: number;
  };
  totalStatutoryLiability: number;
}

// ----------------- TASK 15: Analytics & Reporting Domain Types & Views -----------------

export type ReportCategory =
  | "EXECUTIVE"
  | "ATTENDANCE"
  | "LEAVE"
  | "PAYROLL"
  | "COMPLIANCE"
  | "EMPLOYEE";

export type ReportFormat = "CSV" | "EXCEL" | "JSON" | "PDF";
export type ReportExecutionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type ScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";

export interface ExecutiveDashboardView {
  headcount: {
    total: number;
    active: number;
    probation: number;
    notice: number;
  };
  attendanceToday: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    onLeave: number;
    attendanceRate: number;
  };
  payrollLiability: {
    latestMonth: number;
    latestYear: number;
    totalGross: number;
    totalNet: number;
    totalEmployerContributions: number;
  };
  statutoryLiability: {
    totalPf: number;
    totalEsi: number;
    totalPt: number;
    totalTds: number;
    totalLiability: number;
  };
  departmentDistribution: Array<{
    departmentName: string;
    employeeCount: number;
    monthlyPayrollCost: number;
  }>;
}

export interface AttendanceAnalyticsView {
  totalRecords: number;
  overallPunctualityRate: number;
  lateArrivalCount: number;
  earlyCheckoutCount: number;
  missingCheckoutCount: number;
  geofenceComplianceRate: number;
  faceVerificationSuccessRate: number;
  dailyTrends: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
}

export interface LeaveAnalyticsView {
  totalLeaveDaysTaken: number;
  sandwichLeaveDays: number;
  leaveTypeBreakdown: Array<{
    typeCode: string;
    typeName: string;
    daysTaken: number;
  }>;
  departmentLeaveRates: Array<{
    departmentName: string;
    totalDays: number;
  }>;
}

export interface PayrollAnalyticsView {
  totalPayrollExpenditure: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  averageNetSalary: number;
  salaryBuckets: Array<{
    range: string;
    count: number;
  }>;
  departmentCosts: Array<{
    departmentName: string;
    grossCost: number;
    netCost: number;
  }>;
}

export interface ReportDefinitionView {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  category: ReportCategory;
  sourceModule?: string;
  config: Record<string, unknown>;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedReportView {
  id: string;
  tenantId: string;
  reportDefinitionId: string;
  name: string;
  description: string | null;
  filters: Record<string, unknown>;
  columns: string[];
  createdById: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    email: string;
  };
  reportDefinition?: ReportDefinitionView;
}

export interface ReportExecutionView {
  id: string;
  tenantId: string;
  reportDefinitionId: string;
  savedReportId: string | null;
  triggeredById: string;
  status: ReportExecutionStatus;
  format: ReportFormat;
  fileUrl: string | null;
  parameters: Record<string, unknown>;
  rowCount: number;
  executionTimeMs: number;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  triggeredBy?: {
    id: string;
    email: string;
  };
}

export interface ReportScheduleView {
  id: string;
  tenantId: string;
  savedReportId: string;
  name: string;
  frequency: ScheduleFrequency;
  recipients: string[];
  format: ReportFormat;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  savedReport?: SavedReportView;
}

export interface DashboardWidgetView {
  id: string;
  tenantId: string;
  userId: string;
  widgetType: string;
  title: string;
  gridPosition: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ==================== TASK 16: NOTIFICATIONS ====================

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH" | "IN_APP";
export type NotificationStatus = "PENDING" | "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | "READ";

export interface NotificationTemplateView {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  channel: NotificationChannel;
  subject: string | null;
  bodyTemplate: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationView {
  id: string;
  tenantId: string;
  recipientUserId: string;
  recipientEmployeeId: string | null;
  channel: NotificationChannel;
  templateCode: string | null;
  templateId: string | null;
  subject: string | null;
  body: string;
  data: Record<string, unknown>;
  status: NotificationStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failureReason: string | null;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceView {
  id: string;
  tenantId: string;
  userId: string;
  channel: NotificationChannel;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== TASK 16: WORKFLOWS ====================

export type WorkflowStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "ESCALATED" | "CANCELLED";
export type WorkflowStepAction = "PENDING" | "APPROVED" | "REJECTED" | "DELEGATED" | "ESCALATED" | "SKIPPED";

export interface WorkflowDefinitionView {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  entityType: string;
  steps: Array<{
    code: string;
    name: string;
    assigneeRole?: string;
    assigneeUserId?: string;
    slaHours?: number;
    requireComment?: boolean;
  }>;
  transitions: Array<{
    fromStep: string;
    action: WorkflowStepAction;
    toStep: string;
  }>;
  escalationRules: Array<{
    stepCode: string;
    afterHours: number;
    escalateToRole?: string;
    escalateToUserId?: string;
  }>;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepExecutionView {
  id: string;
  tenantId: string;
  workflowInstanceId: string;
  stepCode: string;
  stepName: string;
  assigneeUserId: string | null;
  assigneeRole: string | null;
  action: WorkflowStepAction;
  comment: string | null;
  actionedAt: string | null;
  actionedById: string | null;
  slaDeadline: string | null;
  isEscalated: boolean;
  createdAt: string;
}

export interface WorkflowInstanceView {
  id: string;
  tenantId: string;
  workflowDefinitionId: string;
  entityType: string;
  entityId: string;
  currentStep: string | null;
  status: WorkflowStatus;
  initiatedById: string;
  data: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
  slaDeadline: string | null;
  escalatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  workflowDefinition?: WorkflowDefinitionView;
  stepExecutions?: WorkflowStepExecutionView[];
}

export interface WorkflowAuditView {
  id: string;
  tenantId: string;
  workflowInstanceId: string;
  action: string;
  actorUserId: string | null;
  fromStep: string | null;
  toStep: string | null;
  comment: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ==================== TASK 16: APPROVALS ====================

export type ApprovalStrategy = "SEQUENTIAL" | "PARALLEL" | "HIERARCHICAL";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type ApprovalActionType = "APPROVED" | "REJECTED" | "DELEGATED" | "ESCALATED";

export interface ApprovalTemplateView {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  entityType: string;
  levels: Array<{
    level: number;
    name: string;
    approverRole?: string;
    approverUserId?: string;
  }>;
  approverStrategy: ApprovalStrategy;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalActionView {
  id: string;
  tenantId: string;
  approvalRequestId: string;
  level: number;
  approverUserId: string;
  action: ApprovalActionType;
  comment: string | null;
  delegatedToUserId: string | null;
  createdAt: string;
}

export interface ApprovalRequestView {
  id: string;
  tenantId: string;
  approvalTemplateId: string;
  entityType: string;
  entityId: string;
  requesterId: string;
  currentLevel: number;
  totalLevels: number;
  status: ApprovalStatus;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  approvalTemplate?: ApprovalTemplateView;
  actions?: ApprovalActionView[];
  requester?: {
    id: string;
    email: string;
  };
}

// ==================== TASK 16: ENTERPRISE ORGANIZATION ====================

export interface BusinessUnitView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  headUserId: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: BusinessUnitView[];
}

export interface RegionView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  businessUnitId: string | null;
  headUserId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  businessUnit?: BusinessUnitView;
}

export interface TeamView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  departmentId: string | null;
  leadUserId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface OrgHierarchyNode {
  id: string;
  name: string;
  code: string;
  type: "BUSINESS_UNIT" | "REGION" | "DEPARTMENT" | "TEAM";
  head?: string | null;
  children: OrgHierarchyNode[];
}

// ==================== TASK 16: SECURITY HARDENING ====================

export type SuspiciousActivityType =
  | "RAPID_TRAVEL"
  | "MULTI_DEVICE"
  | "BRUTE_FORCE"
  | "LOCATION_SPOOF"
  | "UNUSUAL_HOURS"
  | "FAILED_BIOMETRIC";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SuspiciousActivityView {
  id: string;
  tenantId: string;
  userId: string;
  activityType: SuspiciousActivityType;
  details: Record<string, unknown>;
  severity: SeverityLevel;
  isResolved: boolean;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
  };
}

// ==================== TASK 17: ADVANCED REPORTING & ANALYTICS ====================

export interface ExecutiveAnalyticsView {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newHiresThisMonth: number;
  attritionRate: number;
  attendanceRate: number;
  leaveUtilizationRate: number;
  totalPayrollCost: number;
  overtimeCost: number;
  pfLiability: number;
  esiLiability: number;
  ptLiability: number;
  tdsLiability: number;
  averageSalary: number;
  departmentDistribution: Array<{ department: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  employmentTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
  faceVerificationSuccessRate: number;
  livenessSuccessRate: number;
}

export interface WorkforceAnalyticsView {
  headcountTrends: Array<{ month: string; total: number; active: number }>;
  hiringTrends: Array<{ month: string; hires: number }>;
  attritionTrends: Array<{ month: string; exits: number; rate: number }>;
  departmentGrowth: Array<{ department: string; current: number; previous: number; growthRate: number }>;
  managerSpanAnalysis: Array<{ managerName: string; directReportsCount: number }>;
  organizationDistribution: Array<{ unit: string; count: number }>;
  ageDistribution: Array<{ range: string; count: number; percentage: number }>;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  designationDistribution: Array<{ designation: string; count: number }>;
  employmentTypeTrends: Array<{ month: string; fullTime: number; contract: number; partTime: number }>;
}

export interface AttendanceAnalyticsView {
  dailyAttendanceTrend: Array<{ date: string; present: number; absent: number; late: number }>;
  weeklyAttendanceTrend: Array<{ week: string; averagePresentRate: number }>;
  monthlyAttendanceTrend: Array<{ month: string; averagePresentRate: number }>;
  lateArrivalTrend: Array<{ date: string; count: number }>;
  earlyExitTrend: Array<{ date: string; count: number }>;
  missingCheckInTrend: Array<{ date: string; count: number }>;
  attendanceHeatmap: Array<{ dayOfWeek: number; hour: number; checkInCount: number }>;
  geofenceViolations: Array<{ locationName: string; violationCount: number }>;
  locationDistribution: Array<{ locationName: string; presentCount: number }>;
  attendanceExceptions: Array<{ type: string; count: number }>;
  biometricMatchSuccessRate: number;
  biometricMatchFailureRate: number;
  livenessFailuresCount: number;
  attendanceFraudIndicators: Array<{ indicator: string; detectedCount: number; severity: string }>;
}

export interface LeaveAnalyticsView {
  leaveUtilizationRate: number;
  departmentLeaveTrends: Array<{ department: string; totalDays: number; utilizationRate: number }>;
  leaveBalanceForecast: Array<{ leaveType: string; totalAllocated: number; totalUsed: number; projectedBurn: number }>;
  leaveCostAnalysis: { totalLeaveCost: number; paidLeaveCost: number; unpaidLeaveCost: number };
  sandwichLeaveImpact: { totalSandwichDays: number; estimatedCost: number; affectedEmployees: number };
  approvalTimeAnalytics: { averageHoursToApprove: number; medianHoursToApprove: number };
  rejectionTrends: Array<{ leaveType: string; rejectedCount: number; rejectionRate: number }>;
  mostUsedLeaveTypes: Array<{ type: string; count: number; percentage: number }>;
  leaveSeasonalityAnalysis: Array<{ month: string; leaveDaysTaken: number }>;
}

export interface PayrollAnalyticsView {
  payrollCostTrend: Array<{ month: string; totalCost: number; netPayable: number }>;
  departmentCostTrend: Array<{ department: string; cost: number; percentage: number }>;
  salaryBandAnalysis: Array<{ band: string; employeeCount: number; totalCost: number }>;
  allowanceAnalysis: Array<{ component: string; totalAmount: number; percentage: number }>;
  deductionAnalysis: Array<{ component: string; totalAmount: number; percentage: number }>;
  overtimeCostTrend: Array<{ month: string; overtimeAmount: number }>;
  monthlyCostGrowth: number;
  yearlyCostGrowth: number;
  costCenterAnalysis: Array<{ costCenter: string; budget: number; actualCost: number; variance: number }>;
  payrollEfficiencyMetrics: { costPerEmployee: number; processingTimeMinutes: number; accuracyRate: number };
}

export interface ComplianceAnalyticsView {
  pfContributionTrends: Array<{ month: string; employeeShare: number; employerShare: number; total: number }>;
  esiContributionTrends: Array<{ month: string; employeeShare: number; employerShare: number; total: number }>;
  professionalTaxTrends: Array<{ state: string; totalCollected: number }>;
  tdsTrends: Array<{ month: string; totalDeducted: number }>;
  monthlyLiability: number;
  quarterlyLiability: number;
  complianceRiskScore: number;
  missingFilings: Array<{ type: string; dueDate: string; overdueDays: number }>;
  pendingFilings: Array<{ type: string; period: string; status: string }>;
  complianceHealthIndex: number;
}

export interface FaceAnalyticsView {
  faceMatchSuccessRate: number;
  faceMatchFailureRate: number;
  averageMatchScore: number;
  averageLivenessScore: number;
  spoofDetectionAttempts: number;
  failedVerificationsCount: number;
  verificationLatencyMs: number;
  cameraQualityMetrics: { goodLightingPercentage: number; lowResolutionCount: number };
  topFailureReasons: Array<{ reason: string; count: number }>;
  deviceAnalytics: Array<{ deviceType: string; totalScans: number; successRate: number }>;
}

export interface OrganizationAnalyticsView {
  businessUnitDistribution: Array<{ name: string; employeeCount: number; percentage: number }>;
  regionDistribution: Array<{ name: string; employeeCount: number; percentage: number }>;
  teamDistribution: Array<{ name: string; employeeCount: number }>;
  managerHierarchyAnalytics: { maxDepth: number; averageSpanOfControl: number; managersCount: number };
  orgGrowthAnalytics: Array<{ quarter: string; headcount: number; netGrowth: number }>;
  crossTeamDistribution: Array<{ crossAssignedCount: number }>;
  organizationHealthScore: number;
}

export type AnalyticsSourceModule =
  | "EMPLOYEE"
  | "ATTENDANCE"
  | "LEAVE"
  | "PAYROLL"
  | "COMPLIANCE"
  | "FACE"
  | "ORGANIZATION"
  | "AUDIT";

export type ReportFilterOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "IN"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "BETWEEN";

export interface ReportFieldDescriptor {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "enum";
  isFilterable: boolean;
  isSortable: boolean;
  isAggregatable: boolean;
}

export interface ReportFilterClause {
  field: string;
  operator: ReportFilterOperator;
  value: unknown;
}

export interface ReportSortClause {
  field: string;
  direction: "asc" | "desc";
}

export interface ReportAggregation {
  field: string;
  function: "COUNT" | "SUM" | "AVG" | "MIN" | "MAX";
  alias?: string;
}

export interface CustomReportConfig {
  sourceModule: AnalyticsSourceModule;
  columns: string[];
  filters?: ReportFilterClause[];
  sort?: ReportSortClause[];
  groupBy?: string[];
  aggregations?: ReportAggregation[];
  limit?: number;
  offset?: number;
}

export type CustomWidgetType =
  | "KPI_CARD"
  | "LINE_CHART"
  | "AREA_CHART"
  | "BAR_CHART"
  | "STACKED_BAR"
  | "PIE_CHART"
  | "DONUT_CHART"
  | "HEATMAP"
  | "TABLE"
  | "TREND_CARD"
  | "COMPARISON_CARD";

export interface DashboardWidgetConfig {
  widgetType: CustomWidgetType;
  title: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  metricKey?: string;
  sourceDomain?: string;
  chartOptions?: Record<string, unknown>;
}

export interface DashboardView {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isPublic: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  widgets?: Array<{
    id: string;
    title: string;
    widgetType: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    config: Record<string, unknown>;
  }>;
}

// ----------------- Task 18: Employee Self-Service & Digital Workplace Types -----------------

export type EssDocumentType =
  | "PAN"
  | "AADHAAR"
  | "PASSPORT"
  | "DRIVING_LICENSE"
  | "OFFER_LETTER"
  | "APPOINTMENT_LETTER"
  | "PAYSLIP"
  | "TAX_DOCUMENT"
  | "CERTIFICATE"
  | "CUSTOM";

export type EmployeeRequestType =
  | "ADDRESS_CHANGE"
  | "BANK_CHANGE"
  | "PERSONAL_INFO_CORRECTION"
  | "DOCUMENT_UPDATE"
  | "MANAGER_CHANGE"
  | "SHIFT_CHANGE"
  | "ATTENDANCE_CORRECTION"
  | "CUSTOM";

export type EmployeeRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type AnnouncementPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface EmergencyContactInfo {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
}

export interface AddressInfo {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BankDetailsInfo {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName?: string;
  accountType?: "SAVINGS" | "CURRENT" | "SALARY";
}

export interface GovernmentIdsInfo {
  pan?: string;
  aadhaar?: string;
  passport?: string;
  drivingLicense?: string;
  uan?: string;
  pfNumber?: string;
  esiNumber?: string;
}

export interface EmployeeProfileView {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  preferredName?: string | null;
  email: string;
  personalEmail?: string | null;
  phone?: string | null;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationTitle: string;
  businessUnitName?: string;
  regionName?: string;
  teamName?: string;
  managerName?: string | null;
  joiningDate: string;
  employmentType: EmploymentType;
  salaryType: SalaryType;
  status: EmploymentStatus;
  bio?: string | null;
  profilePhoto?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: EmergencyContactInfo | null;
  currentAddress?: AddressInfo | null;
  permanentAddress?: AddressInfo | null;
  bankDetails?: BankDetailsInfo | null;
  governmentIds?: GovernmentIdsInfo | null;
  profileCompletionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocumentView {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  documentType: EssDocumentType;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  downloadUrl?: string;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  expiryDate?: string | null;
  isExpiringSoon?: boolean;
  daysUntilExpiry?: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequestView {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  requestType: EmployeeRequestType;
  status: EmployeeRequestStatus;
  payload: Record<string, unknown>;
  reason?: string | null;
  comments?: string | null;
  workflowInstanceId?: string | null;
  submittedAt: string;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  resolvedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementView {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  isPinned: boolean;
  publishedAt: string;
  expiresAt?: string | null;
  attachments?: Array<{ name: string; url: string; sizeBytes?: number }>;
  createdBy: string;
  authorName?: string;
  isAcknowledged?: boolean;
  acknowledgementCount?: number;
  acknowledgedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AcknowledgementView {
  id: string;
  tenantId: string;
  announcementId: string;
  employeeId: string;
  acknowledgedAt: string;
}

export interface IdCardDataView {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  preferredName?: string | null;
  department: string;
  designation: string;
  businessUnit?: string;
  bloodGroup?: string | null;
  joiningDate: string;
  profilePhoto?: string | null;
  emergencyContactPhone?: string | null;
  qrCodePayload: string;
  companyName: string;
  companyLogoUrl?: string | null;
  primaryColor?: string;
}

export interface DirectoryEmployeeView {
  id: string;
  employeeCode: string;
  fullName: string;
  preferredName?: string | null;
  email: string;
  phone?: string | null;
  department: string;
  designation: string;
  businessUnit?: string;
  team?: string;
  region?: string;
  managerName?: string | null;
  joiningDate: string;
  profilePhoto?: string | null;
  status: string;
}

export interface EssDashboardView {
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    department: string;
    designation: string;
    profilePhoto?: string | null;
    profileCompletionPercentage: number;
  };
  todayAttendance: {
    status: "PRESENT" | "ABSENT" | "ON_LEAVE" | "NOT_RECORDED" | "HOLIDAY" | "WEEKEND";
    checkInAt?: string | null;
    checkOutAt?: string | null;
    workedMinutes?: number;
    shiftName?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
  };
  leaveSummary: {
    allocatedDays: number;
    usedDays: number;
    availableDays: number;
    balances: Array<{ leaveType: string; available: number; total: number; color?: string }>;
  };
  upcomingHolidays: Array<{
    id: string;
    name: string;
    date: string;
    dayOfWeek: string;
  }>;
  recentPayslips: Array<{
    id: string;
    periodMonth: number;
    periodYear: number;
    periodLabel: string;
    netPay: number;
    publishedAt: string;
  }>;
  activeAnnouncements: AnnouncementView[];
  pendingRequests: EmployeeRequestView[];
  expiringDocuments: EmployeeDocumentView[];
  quickActions: Array<{
    key: string;
    title: string;
    icon: string;
    href: string;
  }>;
}

// ----------------------------------------------------
// TASK 19: AI COPILOT & WORKFORCE INTELLIGENCE TYPES
// ----------------------------------------------------

export type AiProviderType = "GEMINI" | "OPENAI" | "LOCAL_MOCK";
export type AiMessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type AiPredictionType = "ATTRITION_RISK" | "BURNOUT_RISK" | "HEADCOUNT_FORECAST" | "OVERTIME_SPIKE";
export type AiInsightCategory = "ATTENDANCE" | "LEAVE" | "PAYROLL" | "ATTRITION" | "COMPLIANCE" | "PRODUCTIVITY";
export type AiInsightSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AiDocumentType = "RESUME" | "OFFER_LETTER" | "POLICY_PDF" | "GOVERNMENT_ID" | "INVOICE" | "CUSTOM";

export interface AiMessageView {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  intent?: string | null;
  dataPayload?: Record<string, unknown> | null;
  tokensUsed: number;
  modelUsed?: string | null;
  createdAt: string;
}

export interface AiConversationView {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  contextType: string;
  messages: AiMessageView[];
  createdAt: string;
  updatedAt: string;
}

export interface AiPromptRequestDto {
  conversationId?: string;
  prompt: string;
  contextType?: string;
  modelOverride?: string;
}

export interface AiPromptResponseView {
  conversationId: string;
  messageId: string;
  role: "assistant";
  content: string;
  intent: string;
  dataPayload?: Record<string, unknown> | null;
  tokensUsed: number;
  modelUsed: string;
  quickReplies?: string[];
  suggestedActions?: Array<{ label: string; action: string; payload?: Record<string, unknown> }>;
}

export interface AiKnowledgeDocumentView {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  content: string;
  filePath?: string | null;
  version: number;
  isActive: boolean;
  chunkCount?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AiKnowledgeChunkView {
  id: string;
  documentId: string;
  documentTitle?: string;
  category?: string;
  chunkIndex: number;
  content: string;
  keywords: string[];
  similarityScore?: number;
}

export interface AiPredictionSignalView {
  factor: string;
  impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  description: string;
  weight: number;
}

export interface AiPredictionView {
  id: string;
  tenantId: string;
  employeeId?: string | null;
  employeeName?: string | null;
  employeeCode?: string | null;
  department?: string | null;
  designation?: string | null;
  predictionType: AiPredictionType;
  riskScore: number;
  confidence: number;
  signals: {
    factors?: AiPredictionSignalView[];
    absenteeismRate?: number;
    salaryStagnationMonths?: number;
    overtimeHoursTotal?: number;
    leaveSpikesDetected?: boolean;
    performanceTrend?: string;
    details?: Record<string, unknown>;
  };
  forecastHorizonDays?: number | null;
  recommendations: string[];
  generatedAt: string;
}

export interface AiInsightView {
  id: string;
  tenantId: string;
  category: AiInsightCategory;
  title: string;
  narrative: string;
  severity: AiInsightSeverity;
  metricChangePercent?: number | null;
  isDismissed: boolean;
  metadata?: Record<string, unknown>;
  generatedAt: string;
}

export interface AiDocumentExtractionView {
  id: string;
  tenantId: string;
  documentType: AiDocumentType;
  fileName: string;
  filePath: string;
  extractedData: Record<string, unknown>;
  confidence: number;
  createdAt: string;
}

export interface AiSettingsView {
  id: string;
  tenantId: string;
  activeProvider: AiProviderType;
  hasGeminiKey: boolean;
  hasOpenaiKey: boolean;
  modelName: string;
  temperature: number;
  maxTokens: number;
  enablePiiMasking: boolean;
  enablePromptShield: boolean;
  enableAutoInsights: boolean;
  enableWorkforcePredictions: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiExecutiveSummaryView {
  tenantId: string;
  generatedAt: string;
  narrative: string;
  metrics: {
    headcountTrend: { current: number; previous: number; changePercent: number };
    attritionRiskSummary: { highRiskCount: number; averageScore: number; topDepartment: string };
    burnoutRiskSummary: { criticalCount: number; averageScore: number };
    attendanceHealth: { currentRate: number; trend: string };
    payrollCostSummary: { latestTotal: number; changePercent: number };
    complianceScore: number;
  };
  topInsights: AiInsightView[];
  topAttritionRisks: AiPredictionView[];
  topBurnoutRisks: AiPredictionView[];
  headcountForecasts: {
    thirtyDays: number;
    ninetyDays: number;
    oneEightyDays: number;
  };
}

export interface AiApprovalSummaryView {
  requestId: string;
  requestType: string;
  employeeName: string;
  summaryText: string;
  riskAssessment: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK";
  balanceAfterApproval?: number;
  policyViolations: string[];
  historicalContext: string;
}

// ---------------------------------------------------------
// TASK 20: RECRUITMENT, ATS & TALENT ACQUISITION TYPES
// ---------------------------------------------------------

export type HiringRequestStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED";
export type HiringPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type JobRequisitionStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "CLOSED" | "CANCELLED";
export type JobPostingStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "ARCHIVED";
export type JobPostingChannel = "INTERNAL_PORTAL" | "PUBLIC_CAREERS" | "LINKEDIN" | "INDEED" | "AGENCY" | "CAMPUS";
export type CandidateStatus = "APPLIED" | "SCREENING" | "SHORTLISTED" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED" | "ON_HOLD";
export type ApplicationStage = "APPLIED" | "SCREENING" | "TECHNICAL_ROUND" | "MANAGER_ROUND" | "HR_ROUND" | "OFFER" | "JOINED" | "REJECTED";
export type InterviewType = "ONLINE" | "OFFLINE" | "TELEPHONIC" | "VIDEO" | "PANEL";
export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED" | "NO_SHOW";
export type InterviewRecommendation = "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE";
export type OfferStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "RELEASED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";
export type OfferApproverRole = "HR" | "DEPT_HEAD" | "FINANCE" | "CEO";
export type PreboardingTaskType = "DOCUMENT_UPLOAD" | "BANK_DETAILS" | "IDENTITY_VERIFICATION" | "POLICY_SIGN" | "BACKGROUND_CHECK" | "EQUIPMENT_PREFERENCE";
export type PreboardingTaskStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";

export interface HiringRequestView {
  id: string;
  tenantId: string;
  requestCode: string;
  departmentId: string;
  departmentName?: string;
  businessUnitId?: string | null;
  designationId: string;
  designationName?: string;
  employmentType: EmploymentType;
  vacancies: number;
  budgetedCtc: number;
  priority: HiringPriority;
  justification: string;
  requiredByDate: string;
  hiringManagerId: string;
  hiringManagerName?: string;
  status: HiringRequestStatus;
  currentApprovalStage?: string | null;
  approvalChainJson?: Array<{ role: string; approverName?: string; status: string; comments?: string; date?: string }> | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHiringRequestDto {
  departmentId: string;
  businessUnitId?: string | null;
  designationId: string;
  employmentType?: EmploymentType;
  vacancies: number;
  budgetedCtc: number;
  priority?: HiringPriority;
  justification: string;
  requiredByDate: string;
  hiringManagerId: string;
}

export interface JobRequisitionView {
  id: string;
  tenantId: string;
  requisitionCode: string;
  hiringRequestId?: string | null;
  jobTitle: string;
  departmentId: string;
  departmentName?: string;
  designationId: string;
  designationName?: string;
  location: string;
  employmentType: EmploymentType;
  experienceMin: number;
  experienceMax: number;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skillsRequired: string[];
  jobDescription: string;
  openings: number;
  status: JobRequisitionStatus;
  approvedAt?: string | null;
  closedAt?: string | null;
  postingsCount?: number;
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequisitionDto {
  hiringRequestId?: string | null;
  jobTitle: string;
  departmentId: string;
  designationId: string;
  location: string;
  employmentType?: EmploymentType;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skillsRequired: string[];
  jobDescription: string;
  openings?: number;
}

export interface JobPostingView {
  id: string;
  tenantId: string;
  requisitionId: string;
  requisitionTitle?: string;
  slug: string;
  title: string;
  channel: JobPostingChannel;
  status: JobPostingStatus;
  viewsCount: number;
  publishedAt: string;
  expiresAt?: string | null;
  createdAt: string;
}

export interface PublicJobView {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  department: string;
  location: string;
  employmentType: string;
  experienceRange: string;
  skills: string[];
  jobDescription: string;
  publishedAt: string;
}

export interface PublicApplyDto {
  jobSlug: string;
  fullName: string;
  email: string;
  mobile: string;
  currentLocation?: string;
  experienceYears?: number;
  currentCtc?: number;
  expectedCtc?: number;
  noticePeriodDays?: number;
  skills?: string[];
  education?: string;
  summary?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeFileName?: string;
  resumeFileBase64?: string;
}

export interface CandidateView {
  id: string;
  tenantId: string;
  candidateCode: string;
  fullName: string;
  email: string;
  mobile: string;
  currentLocation?: string | null;
  experienceYears: number;
  currentCtc?: number | null;
  expectedCtc?: number | null;
  noticePeriodDays: number;
  skills: string[];
  education?: string | null;
  summary?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  status: CandidateStatus;
  source: string;
  hiredEmployeeId?: string | null;
  resumeUrl?: string | null;
  parsedResume?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationView {
  id: string;
  tenantId: string;
  applicationCode: string;
  requisitionId: string;
  jobTitle?: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateMobile?: string;
  stage: ApplicationStage;
  source: string;
  aiMatchScore?: number | null;
  aiSkillsMatch?: number | null;
  aiExpMatch?: number | null;
  aiSummary?: string | null;
  aiInterviewQs?: string[] | null;
  stageHistoryJson?: Array<{ stage: string; timestamp: string; note?: string }> | null;
  appliedAt: string;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  interviewsCount?: number;
  offersCount?: number;
  createdAt: string;
}

export interface InterviewView {
  id: string;
  tenantId: string;
  applicationId: string;
  candidateName?: string;
  jobTitle?: string;
  roundName: string;
  roundNumber: number;
  interviewType: InterviewType;
  scheduledStartTime: string;
  scheduledEndTime: string;
  meetingLink?: string | null;
  locationDetails?: string | null;
  status: InterviewStatus;
  interviewerNotes?: string | null;
  panelMembers?: Array<{ employeeId: string; employeeName: string; role: string }>;
  feedbacks?: InterviewFeedbackView[];
  completedAt?: string | null;
  createdAt: string;
}

export interface ScheduleInterviewDto {
  applicationId: string;
  roundName: string;
  roundNumber?: number;
  interviewType?: InterviewType;
  scheduledStartTime: string;
  scheduledEndTime: string;
  meetingLink?: string | null;
  locationDetails?: string | null;
  panelEmployeeIds?: string[];
}

export interface InterviewFeedbackView {
  id: string;
  interviewId: string;
  interviewerId: string;
  interviewerName?: string;
  technicalScore: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
  leadership: number;
  experienceScore: number;
  overallScore: number;
  recommendation: InterviewRecommendation;
  strengths?: string | null;
  weaknesses?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface SubmitInterviewFeedbackDto {
  interviewId: string;
  technicalScore: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
  leadership: number;
  experienceScore: number;
  recommendation: InterviewRecommendation;
  strengths?: string;
  weaknesses?: string;
  notes?: string;
}

export interface OfferView {
  id: string;
  tenantId: string;
  offerCode: string;
  applicationId: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  requisitionId: string;
  jobTitle?: string;
  baseSalary: number;
  joiningBonus: number;
  variablePay: number;
  totalCtc: number;
  benefitsSummary?: string | null;
  joiningDate: string;
  expiryDate: string;
  status: OfferStatus;
  currentApprovalStage?: string | null;
  approvals?: Array<{ role: OfferApproverRole; approverName?: string; status: string; comments?: string; approvedAt?: string }>;
  releasedAt?: string | null;
  respondedAt?: string | null;
  responseComments?: string | null;
  createdAt: string;
}

export interface CreateOfferDto {
  applicationId: string;
  baseSalary: number;
  joiningBonus?: number;
  variablePay?: number;
  totalCtc: number;
  benefitsSummary?: string;
  joiningDate: string;
  expiryDate: string;
}

export interface PreboardingTaskView {
  id: string;
  tenantId: string;
  candidateId: string;
  candidateName?: string;
  offerId?: string | null;
  taskTitle: string;
  taskType: PreboardingTaskType;
  description?: string | null;
  status: PreboardingTaskStatus;
  payloadJson?: Record<string, unknown> | null;
  verifiedById?: string | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface RecruitmentAnalyticsView {
  kpis: {
    openPositions: number;
    totalApplicants: number;
    offersReleased: number;
    offerAcceptanceRate: number;
    averageTimeToHireDays: number;
    averageTimeToFillDays: number;
    costPerHire: number;
  };
  pipelineFunnel: Array<{ stage: string; count: number; conversionRate: number }>;
  sourcePerformance: Array<{ source: string; candidates: number; hires: number; cost: number }>;
  recruiterProductivity: Array<{ recruiterName: string; openReqs: number; interviewsConducted: number; hires: number }>;
}

export interface AiRecruitmentIntelligenceView {
  hiringRisks: Array<{ requisitionCode: string; jobTitle: string; riskFactor: string; delayedDays: number }>;
  candidateDropOffs: Array<{ stage: string; dropOffRate: number; keyReasons: string[] }>;
  offerDeclinePredictions: Array<{ candidateName: string; offerCode: string; declineProbability: number; mitigationTip: string }>;
  joiningProbability: {
    highProbabilityCount: number;
    moderateCount: number;
    lowProbabilityCount: number;
  };
}

// ==========================================
// TASK 21: PERFORMANCE MANAGEMENT SYSTEM (PMS)
// ==========================================

export type GoalCycleType = "QUARTERLY" | "HALF_YEARLY" | "ANNUAL";
export type GoalCycleStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type GoalCategory = "OKR" | "KRA" | "DEVELOPMENT";
export type GoalStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type MetricType = "PERCENTAGE" | "NUMERIC" | "CURRENCY" | "BOOLEAN";
export type FeedbackCategory =
  | "PEER_FEEDBACK"
  | "MANAGER_COACHING"
  | "SPOT_AWARD"
  | "BADGE_RECOGNITION"
  | "GENERAL";
export type FeedbackVisibility = "PRIVATE" | "MANAGER_ONLY" | "EMPLOYEE_VISIBLE" | "HR_VISIBLE";
export type OneOnOneStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
export type ReviewCycleStatus =
  | "DRAFT"
  | "ACTIVE"
  | "SELF_REVIEW"
  | "MANAGER_REVIEW"
  | "CALIBRATION"
  | "FINALIZED"
  | "CLOSED";
export type ReviewRatingLabel =
  | "OUTSTANDING"
  | "EXCEEDS_EXPECTATIONS"
  | "MEETS_EXPECTATIONS"
  | "NEEDS_IMPROVEMENT"
  | "UNSATISFACTORY";
export type CompetencyCategory = "TECHNICAL" | "BEHAVIORAL" | "FUNCTIONAL" | "LEADERSHIP";
export type SuccessionCriticality = "CRITICAL" | "HIGH" | "MEDIUM";
export type SuccessorReadiness =
  | "READY_NOW"
  | "READY_IN_6_MONTHS"
  | "READY_IN_1_YEAR"
  | "READY_IN_2_YEARS"
  | "EMERGENCY_BACKUP";
export type NineBoxGridPosition =
  | "STAR_HIGH_POTENTIAL"
  | "HIGH_PERFORMER_GROWTH"
  | "SOLID_PERFORMER_KEY"
  | "HIGH_POTENTIAL_DEVELOP"
  | "CORE_CONTRIBUTOR"
  | "EFFECTIVE_PERFORMER"
  | "DILEMMA_QUESTION_MARK"
  | "UNDERPERFORMER_COACH"
  | "RISK_LOW_PERFORMER";

export interface GoalCycleView {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  type: GoalCycleType;
  status: GoalCycleStatus;
  goalsCount?: number;
  createdAt: string;
}

export interface KeyResultView {
  id: string;
  goalId: string;
  title: string;
  metricType: MetricType;
  startValue: number;
  targetValue: number;
  currentValue: number;
  weightage: number;
  progressPercent: number;
  confidenceScore: number;
}

export interface GoalView {
  id: string;
  tenantId: string;
  cycleId: string;
  cycleName?: string;
  employeeId: string;
  employeeName?: string;
  title: string;
  description?: string | null;
  category: GoalCategory;
  weightage: number;
  targetValue: number;
  achievedValue: number;
  progressPercent: number;
  status: GoalStatus;
  metricUnit?: string | null;
  dueDate?: string | null;
  evidenceText?: string | null;
  evidenceUrl?: string | null;
  managerComments?: string | null;
  keyResults: KeyResultView[];
  createdAt: string;
}

export interface FeedbackView {
  id: string;
  tenantId: string;
  fromEmployeeId: string;
  fromEmployeeName?: string;
  toEmployeeId: string;
  toEmployeeName?: string;
  category: FeedbackCategory;
  rating?: number | null;
  strengths?: string | null;
  improvements?: string | null;
  badgeName?: string | null;
  visibility: FeedbackVisibility;
  createdAt: string;
}

export interface OneOnOneView {
  id: string;
  tenantId: string;
  managerId: string;
  managerName?: string;
  employeeId: string;
  employeeName?: string;
  scheduledAt: string;
  meetingDurationMinutes: number;
  meetingUrl?: string | null;
  agenda?: string | null;
  notes?: string | null;
  actionItems: Array<{ id: string; text: string; done: boolean; dueDate?: string }>;
  status: OneOnOneStatus;
  completedAt?: string | null;
  createdAt: string;
}

export interface CompetencyView {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string | null;
  category: CompetencyCategory;
  createdAt: string;
}

export interface DesignationCompetencyView {
  id: string;
  designationId: string;
  designationName?: string;
  competencyId: string;
  competencyName?: string;
  category?: CompetencyCategory;
  expectedLevel: number;
  weightage: number;
}

export interface PerformanceReviewView {
  id: string;
  tenantId: string;
  cycleId: string;
  cycleName?: string;
  employeeId: string;
  employeeName?: string;
  departmentName?: string;
  designationName?: string;
  selfScore?: number | null;
  managerScore?: number | null;
  peerScore?: number | null;
  skipLevelScore?: number | null;
  crossFunctionalScore?: number | null;
  finalScore?: number | null;
  calibratedScore?: number | null;
  ratingLabel?: ReviewRatingLabel | null;
  status: string;
  selfComments?: string | null;
  managerComments?: string | null;
  skipLevelComments?: string | null;
  strengths?: string | null;
  areasOfGrowth?: string | null;
  isLocked: boolean;
  submittedAt?: string | null;
  finalizedAt?: string | null;
  raterScores?: Array<{
    id: string;
    raterType: string;
    raterId?: string | null;
    raterName?: string;
    score: number;
    weightage: number;
    comments?: string | null;
  }>;
  competencyRatings?: Array<{
    competencyId: string;
    competencyName: string;
    category: CompetencyCategory;
    selfRating?: number | null;
    managerRating?: number | null;
    evaluatedLevel?: number | null;
    comments?: string | null;
  }>;
}

export interface CalibrationSessionView {
  id: string;
  tenantId: string;
  cycleId: string;
  cycleName?: string;
  departmentId?: string | null;
  departmentName?: string | null;
  sessionName: string;
  status: string;
  calibratedByUserId?: string | null;
  targetDistribution: Record<string, number>;
  actualDistribution: Record<string, number>;
  notes?: string | null;
  reviewsCount?: number;
  createdAt: string;
}

export interface SalaryIncrementRuleView {
  id: string;
  tenantId: string;
  ratingLabel: ReviewRatingLabel;
  defaultIncrementPct: number;
  minIncrementPct: number;
  maxIncrementPct: number;
  budgetAllocationPct: number;
  isActive: boolean;
}

export interface PromotionRecommendationView {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  currentDesignationId: string;
  currentDesignationName?: string;
  targetDesignationId: string;
  targetDesignationName?: string;
  performanceScore: number;
  competencyScore: number;
  tenureMonths: number;
  potentialScore: number;
  readinessScore: number;
  readinessRating: SuccessorReadiness;
  status: string;
  proposedSalaryBumpPct?: number | null;
  justification?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

export interface SuccessionPositionView {
  id: string;
  tenantId: string;
  designationId: string;
  designationName?: string;
  title: string;
  criticality: SuccessionCriticality;
  riskOfLoss: string;
  impactOfLoss: string;
  notes?: string | null;
  successorsCount?: number;
  successors?: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    readiness: SuccessorReadiness;
    flightRisk: string;
    nineBoxPosition: NineBoxGridPosition;
    developmentPlan?: string | null;
  }>;
}

export interface PerformanceAnalyticsView {
  kpis: {
    avgGoalAchievementPercent: number;
    activeReviewsCount: number;
    highPerformersPercent: number;
    lowPerformersPercent: number;
    calibratedReviewsCount: number;
    promotionReadyCount: number;
  };
  ratingDistribution: Record<string, number>;
  departmentPerformance: Array<{ department: string; avgScore: number; completionRate: number }>;
  competencyHeatmap: Array<{ competency: string; avgScore: number; gap: number }>;
  nineBoxSummary: Array<{ position: NineBoxGridPosition; count: number; percentage: number }>;
}

// ==========================================
// TASK 22: ASSETS, ITSM, FACILITIES, VISITOR & CLEARANCE TYPES
// ==========================================

export type AssetCategoryType =
  | "LAPTOP"
  | "DESKTOP"
  | "MOBILE_PHONE"
  | "TABLET"
  | "PRINTER"
  | "BIOMETRIC_DEVICE"
  | "ACCESS_CARD"
  | "SIM_CARD"
  | "VEHICLE"
  | "FURNITURE"
  | "MONITOR"
  | "SOFTWARE_LICENSE"
  | "NETWORK_DEVICE"
  | "SERVER"
  | "CUSTOM_ASSET";

export type AssetStatusType =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_REPAIR"
  | "IN_MAINTENANCE"
  | "LOST"
  | "SCRAPPED"
  | "RETURNED";

export type AssetConditionType =
  | "BRAND_NEW"
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "DAMAGED"
  | "SCRAP";

export type TicketPriorityType = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketStatusType = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "ON_HOLD" | "RESOLVED" | "CLOSED" | "REOPENED";
export type TicketCategoryType = "HARDWARE" | "SOFTWARE" | "ACCESS" | "NETWORK" | "SECURITY" | "FACILITIES" | "PAYROLL" | "HR" | "CUSTOM";
export type FacilityTypeEnum = "MEETING_ROOM" | "CONFERENCE_HALL" | "TRAINING_ROOM" | "EXECUTIVE_CABIN" | "WORKSTATION" | "CAFETERIA" | "AUDITORIUM";
export type BookingStatusType = "REQUESTED" | "APPROVED" | "REJECTED" | "BOOKED" | "CANCELLED" | "COMPLETED";
export type DeskTypeEnum = "HOT_DESK" | "DEDICATED" | "EXECUTIVE" | "VISITOR";
export type VisitorStatusType = "PRE_REGISTERED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
export type GatePassStatusType = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
export type GatePassTypeEnum = "MATERIAL_OUTWARD" | "MATERIAL_INWARD" | "EMPLOYEE_EXIT" | "CONTRACTOR_EXIT";
export type ClearanceStatusType = "INITIATED" | "IN_PROGRESS" | "CLEARANCE_COMPLETED" | "BLOCKED" | "REJECTED";
export type ClearanceDepartmentType = "HR" | "IT" | "ADMIN" | "FINANCE" | "REPORTING_MANAGER";

export interface AssetRecordView {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategoryType;
  serialNumber: string;
  model?: string | null;
  brand?: string | null;
  purchaseDate: string;
  purchaseCost: number;
  currency: string;
  condition: AssetConditionType;
  status: AssetStatusType;
  currentHolder?: { id: string; fullName: string; employeeCode: string } | null;
  location?: string | null;
  bookValue?: number;
}

export interface DepreciationCalculationResult {
  assetId: string;
  assetCode: string;
  purchaseCost: number;
  purchaseDate: string;
  salvageValue: number;
  usefulLifeYears: number;
  method: "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE";
  accumulatedDepreciation: number;
  currentBookValue: number;
  monthlyDepreciation: number;
  schedule: Array<{
    period: string;
    beginningValue: number;
    depreciationExpense: number;
    accumulatedDepreciation: number;
    endingValue: number;
  }>;
}

export interface SLAPerformanceView {
  priority: TicketPriorityType;
  responseTargetMinutes: number;
  resolveTargetMinutes: number;
  compliancePercentage: number;
  totalTickets: number;
  breachedCount: number;
  avgResponseMinutes: number;
  avgResolutionMinutes: number;
}

export interface OperationsAnalyticsView {
  assets: {
    totalCount: number;
    assignedCount: number;
    availableCount: number;
    inMaintenanceCount: number;
    totalValuation: number;
    currentBookValue: number;
    utilizationPercent: number;
  };
  helpdesk: {
    totalTickets: number;
    openTickets: number;
    slaCompliancePercent: number;
    mttrHours: number;
  };
  facilities: {
    meetingRoomUtilizationPercent: number;
    deskOccupancyPercent: number;
    activeVehiclesCount: number;
  };
  visitors: {
    todayVisitorsCount: number;
    activePassesCount: number;
  };
  clearance: {
    activeClearancesCount: number;
    avgTurnaroundDays: number;
  };
}







