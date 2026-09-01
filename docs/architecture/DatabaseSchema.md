# Database Schema

## Principles

- PostgreSQL shared database.
- Shared database plus `tenant_id` architecture.
- Prisma ORM only.
- UUID primary keys.
- Every tenant-owned entity includes `tenant_id`.
- Timestamps on all operational records.
- Soft delete where historical records must remain auditable.
- Composite uniqueness includes `tenant_id` for tenant business keys.
- Indexes on `tenant_id`, foreign keys, status fields, date filters, and report dimensions.
- Immutable audit logs.

## Tenant Isolation Rules

- Tenant-owned tables must include `tenant_id`.
- Tenant-owned queries must filter by `tenant_id`.
- Foreign keys between tenant-owned tables must never cross tenants.
- Application repositories must require tenant context.
- Platform tables without `tenant_id` are limited to tenant registry, platform users, platform sessions, and platform audit.
- User email and phone can repeat across tenants unless platform login policy later requires global uniqueness.

## Core Enums

- `TenantStatus`: `ACTIVE`, `SUSPENDED`, `ARCHIVED`
- `TenantPlan`: `TRIAL`, `STANDARD`, `PRO`, `ENTERPRISE`
- `PlatformRole`: `PLATFORM_SUPER_ADMIN`, `PLATFORM_SUPPORT`, `PLATFORM_READONLY`
- `TenantRoleCode`: `TENANT_OWNER`, `HR_ADMIN`, `MANAGER`, `EMPLOYEE`
- `MembershipStatus`: `ACTIVE`, `INVITED`, `SUSPENDED`, `REMOVED`
- `EmploymentStatus`: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `TERMINATED`
- `EmploymentType`: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `TEMPORARY`
- `SalaryType`: `MONTHLY`, `DAILY`, `HOURLY`
- `AttendanceType`: `CHECK_IN`, `CHECK_OUT`, `MANUAL_ENTRY`, `CORRECTION`
- `AttendanceStatus`: `PRESENT`, `ABSENT`, `HALF_DAY`, `LATE`, `LEAVE`, `HOLIDAY`, `WEEK_OFF`, `WORK_FROM_HOME`
- `VerificationStatus`: `PASSED`, `FAILED`, `REVIEW_REQUIRED`
- `LeaveType`: `CASUAL`, `SICK`, `EMERGENCY`
- `LeaveStatus`: `DRAFT`, `SUBMITTED`, `MANAGER_APPROVED`, `MANAGER_REJECTED`, `HR_APPROVED`, `HR_REJECTED`, `CANCELLED`
- `PayrollStatus`: `DRAFT`, `REVIEW`, `APPROVED`, `PAID`, `CANCELLED`

## Platform Tables

### tenants

- `id` UUID primary key
- `name`
- `slug` unique
- `legalName`
- `status`
- `plan`
- `primaryDomain` nullable unique
- `timezone`
- `locale`
- `currency`
- `createdAt`
- `updatedAt`
- `archivedAt` nullable

Indexes: `slug`, `status`, `plan`.

### tenant_domains

- `id` UUID primary key
- `tenantId`
- `domain` unique
- `isPrimary`
- `verifiedAt` nullable
- `createdAt`
- `updatedAt`

Indexes: `tenantId`, `domain`.

### platform_users

- `id` UUID primary key
- `email` unique
- `passwordHash`
- `role`
- `status`
- `lastLoginAt` nullable
- `createdAt`
- `updatedAt`

### platform_sessions

- `id` UUID primary key
- `platformUserId`
- `refreshTokenHash`
- `deviceFingerprint`
- `ipAddress`
- `userAgent`
- `expiresAt`
- `revokedAt` nullable
- `createdAt`

Indexes: `platformUserId`, `expiresAt`.

### platform_audit_logs

- `id` UUID primary key
- `actorPlatformUserId` nullable
- `tenantId` nullable
- `action`
- `resourceType`
- `resourceId` nullable
- `ipAddress`
- `userAgent`
- `before`
- `after`
- `metadata`
- `createdAt`

Indexes: `actorPlatformUserId`, `tenantId`, `resourceType`, `createdAt`.

## Tenant Configuration Tables

### tenant_settings

- `id` UUID primary key
- `tenantId` unique
- `timezone`
- `locale`
- `currency`
- `weekStartDay`
- `payrollCycleDay`
- `attendanceTimezone`
- `defaultWorkingDaysPerMonth`
- `metadata`
- `createdAt`
- `updatedAt`

### tenant_branding

- `id` UUID primary key
- `tenantId` unique
- `displayName`
- `logoObjectKey` nullable
- `primaryColor`
- `secondaryColor`
- `accentColor`
- `pwaName`
- `pwaShortName`
- `faviconObjectKey` nullable
- `createdAt`
- `updatedAt`

### tenant_feature_flags

- `id` UUID primary key
- `tenantId`
- `key`
- `enabled`
- `config`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `key`.

## Identity And RBAC Tables

### users

- `id` UUID primary key
- `email`
- `phone` nullable
- `passwordHash`
- `status`
- `lastLoginAt` nullable
- `createdAt`
- `updatedAt`

Indexes: `email`, `phone`.

### tenant_memberships

- `id` UUID primary key
- `tenantId`
- `userId`
- `employeeId` nullable
- `status`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `userId`.
Indexes: `tenantId`, `userId`, `employeeId`, `status`.

### tenant_roles

- `id` UUID primary key
- `tenantId`
- `code`
- `name`
- `description`
- `isSystemRole`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `code`.

### permissions

- `id` UUID primary key
- `code` unique
- `resource`
- `action`
- `description`

Permissions are platform-defined and can be assigned to tenant roles.

### tenant_membership_roles

- `id` UUID primary key
- `tenantId`
- `membershipId`
- `roleId`
- `createdAt`

Unique: `tenantId`, `membershipId`, `roleId`.
Indexes: `tenantId`, `membershipId`, `roleId`.

### tenant_role_permissions

- `id` UUID primary key
- `tenantId`
- `roleId`
- `permissionId`

Unique: `tenantId`, `roleId`, `permissionId`.

### sessions

- `id` UUID primary key
- `tenantId`
- `userId`
- `membershipId`
- `refreshTokenHash`
- `deviceFingerprint`
- `ipAddress`
- `userAgent`
- `expiresAt`
- `revokedAt` nullable
- `createdAt`

Indexes: `tenantId`, `userId`, `membershipId`, `expiresAt`, `deviceFingerprint`.

## Workforce Tables

### departments

- `id` UUID primary key
- `tenantId`
- `name`
- `code`
- `status`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `code`.
Indexes: `tenantId`, `status`.

### designations

- `id` UUID primary key
- `tenantId`
- `departmentId`
- `name`
- `code`
- `status`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `departmentId`, `code`.
Indexes: `tenantId`, `departmentId`, `status`.

### employees

- `id` UUID primary key
- `tenantId`
- `employeeCode`
- `fullName`
- `phone`
- `email`
- `departmentId`
- `designationId`
- `managerEmployeeId` nullable
- `joiningDate`
- `employmentType`
- `salaryType`
- `status`
- `profilePhotoObjectKey` nullable
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `employeeCode`.
Unique: `tenantId`, `email`.
Indexes: `tenantId`, `departmentId`, `designationId`, `managerEmployeeId`, `status`.

### employee_emergency_contacts

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `name`
- `relationship`
- `phone`
- `createdAt`
- `updatedAt`

Indexes: `tenantId`, `employeeId`.

### employee_bank_details

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `accountHolderName`
- `bankName`
- `accountNumberEncrypted`
- `ifscCode`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `employeeId`.

### employee_government_ids

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `idType`
- `idNumberEncrypted`
- `documentObjectKey` nullable
- `verifiedAt` nullable
- `createdAt`
- `updatedAt`

Indexes: `tenantId`, `employeeId`, `idType`.

### documents

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `documentType`
- `fileName`
- `mimeType`
- `sizeBytes`
- `objectKey`
- `uploadedByUserId`
- `createdAt`

Indexes: `tenantId`, `employeeId`, `documentType`.

## Attendance Tables

### locations

- `id` UUID primary key
- `tenantId`
- `name`
- `latitude`
- `longitude`
- `radiusMeters`
- `isActive`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `name`.
Indexes: `tenantId`, `isActive`.

### face_profiles

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `embeddingEncrypted`
- `modelName`
- `modelVersion`
- `enrolledPhotoObjectKey`
- `qualityScore`
- `isActive`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `employeeId`.
Indexes: `tenantId`, `isActive`.

### attendance_records

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `locationId` nullable
- `attendanceDate`
- `type`
- `status`
- `latitude`
- `longitude`
- `distanceMeters`
- `deviceFingerprint`
- `ipAddress`
- `userAgent`
- `faceScore`
- `livenessScore`
- `verificationStatus`
- `attendancePhotoObjectKey`
- `manualReason` nullable
- `manualApprovedByUserId` nullable
- `createdByUserId`
- `createdAt`
- `updatedAt`

Indexes: `tenantId`, `employeeId`, `attendanceDate`, `locationId`, `status`, `verificationStatus`.

### attendance_attempts

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `locationId` nullable
- `latitude`
- `longitude`
- `distanceMeters`
- `deviceFingerprint`
- `ipAddress`
- `userAgent`
- `faceScore`
- `livenessScore`
- `verificationStatus`
- `failureReason`
- `fraudSignals`
- `createdAt`

Indexes: `tenantId`, `employeeId`, `createdAt`, `verificationStatus`.

## Leave Tables

### leave_policies

- `id` UUID primary key
- `tenantId`
- `name`
- `leaveType`
- `annualAllowanceDays`
- `carryForwardAllowed`
- `requiresManagerApproval`
- `requiresHrApproval`
- `isActive`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `name`.

### leave_requests

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `leaveType`
- `status`
- `startDate`
- `endDate`
- `totalDays`
- `reason`
- `createdAt`
- `updatedAt`

Indexes: `tenantId`, `employeeId`, `status`, `startDate`, `endDate`.

### leave_approvals

- `id` UUID primary key
- `tenantId`
- `leaveRequestId`
- `approverUserId`
- `fromStatus`
- `toStatus`
- `comment`
- `createdAt`

Indexes: `tenantId`, `leaveRequestId`, `approverUserId`.

## Payroll Tables

### salary_rules

- `id` UUID primary key
- `tenantId`
- `name`
- `effectiveFrom`
- `effectiveTo` nullable
- `workingDaysPerMonth`
- `absentMultiplier`
- `halfDayMultiplier`
- `paidLeaveMultiplier`
- `unpaidLeaveMultiplier`
- `lateGraceMinutes`
- `latePenaltyMode`
- `latePenaltyValue`
- `isActive`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `name`, `effectiveFrom`.
Indexes: `tenantId`, `isActive`, `effectiveFrom`.

### employee_salary_profiles

- `id` UUID primary key
- `tenantId`
- `employeeId`
- `monthlySalary`
- `dailyRateOverride` nullable
- `hourlyRateOverride` nullable
- `salaryRuleId`
- `effectiveFrom`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `employeeId`.
Indexes: `tenantId`, `salaryRuleId`.

### payroll_runs

- `id` UUID primary key
- `tenantId`
- `month`
- `year`
- `status`
- `generatedByUserId`
- `approvedByUserId` nullable
- `approvedAt` nullable
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `month`, `year`.
Indexes: `tenantId`, `status`, `year`, `month`.

### payroll_items

- `id` UUID primary key
- `tenantId`
- `payrollRunId`
- `employeeId`
- `grossSalary`
- `attendancePay`
- `deductions`
- `netSalary`
- `presentDays`
- `absentDays`
- `halfDays`
- `paidLeaveDays`
- `unpaidLeaveDays`
- `lateCount`
- `calculationSnapshot`
- `createdAt`
- `updatedAt`

Unique: `tenantId`, `payrollRunId`, `employeeId`.
Indexes: `tenantId`, `employeeId`, `payrollRunId`.

## Audit, Notifications, And Reports

### audit_logs

- `id` UUID primary key
- `tenantId`
- `actorUserId` nullable
- `actorMembershipId` nullable
- `action`
- `resourceType`
- `resourceId` nullable
- `ipAddress`
- `userAgent`
- `before`
- `after`
- `metadata`
- `createdAt`

Indexes: `tenantId`, `actorUserId`, `actorMembershipId`, `resourceType`, `resourceId`, `createdAt`.

### notifications

- `id` UUID primary key
- `tenantId`
- `userId`
- `membershipId`
- `type`
- `title`
- `body`
- `readAt` nullable
- `createdAt`

Indexes: `tenantId`, `userId`, `membershipId`, `readAt`, `createdAt`.

### report_exports

- `id` UUID primary key
- `tenantId`
- `requestedByUserId`
- `reportType`
- `format`
- `filters`
- `status`
- `objectKey` nullable
- `errorMessage` nullable
- `createdAt`
- `completedAt` nullable

Indexes: `tenantId`, `requestedByUserId`, `reportType`, `status`, `createdAt`.

## Seed Data

Initial production seed:

- Tenant: VC Organics, slug `vc-organics`, status `ACTIVE`.
- Tenant settings for VC Organics timezone, locale, currency, and payroll defaults.
- Tenant branding for VC Organics.
- System permissions.
- Tenant roles for VC Organics: Tenant Owner, HR Admin, Manager, Employee.
- First Tenant Owner membership.

