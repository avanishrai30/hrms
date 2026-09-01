# Product Requirements Document

## Product

VC Organics Workforce Management Platform, short name VC-WMS.

VC-WMS is a multi-tenant SaaS Workforce Management Platform. VC Organics is Tenant #1, not the only company the platform can support.

## Objective

Create a commercial SaaS platform for tenant-scoped employee records, secure attendance, leave, salary calculation, payroll preparation, reporting, branding, settings, and administrative governance.

The platform uses shared application infrastructure and a shared PostgreSQL database with strict `tenant_id` isolation on every tenant-owned entity.

## SaaS Tenancy Model

- Shared database, tenant-aware schema.
- Every tenant business record includes `tenant_id`.
- Tenant identity is resolved from authenticated session and request context, not from untrusted client payloads.
- Tenant data must never be visible, queryable, exportable, cacheable, or addressable across tenant boundaries.
- VC Organics is seeded as the first active tenant.
- Future tenants can be onboarded without new code deployments.

## Tenant Management

Platform-level operators can:

- Create tenants.
- Activate, suspend, and archive tenants.
- Configure tenant domains or subdomains.
- Configure tenant display name, legal name, address, timezone, locale, currency, and payroll defaults.
- Configure tenant branding including logo, color tokens, and PWA metadata.
- View tenant health, storage usage, employee count, and subscription metadata.

Tenant admins can manage only their own tenant settings where permitted.

## Users

### Platform Super Admin

SaaS operator role with access to tenant management, platform health, tenant onboarding, platform audit events, and emergency support tooling.

This role is not a tenant HR role and must not perform tenant payroll or attendance operations unless explicitly granted a support impersonation workflow with audit controls.

### Tenant Owner

Business owner role within one tenant. For VC Organics, this is the VC Organics owner account.

Permissions:

- Full tenant access.
- Tenant user management.
- Payroll management.
- Attendance management.
- Reports.
- Tenant configuration.

### HR Admin

Tenant HR role with employee management, attendance management, leave management, payroll processing, and tenant reports.

### Manager

Tenant team role with team visibility, leave approvals, attendance approvals where configured, and team reports.

### Employee

Tenant self-service role with attendance, leave requests, profile, salary view, and document access.

## Phase 1 Scope

### Tenant Foundation

- Tenant registry.
- Tenant settings.
- Tenant branding.
- Tenant-scoped RBAC.
- Tenant-aware audit logs.
- Tenant-aware storage paths.
- Tenant-aware reports and exports.
- Tenant-specific attendance, leave, and salary rules.

### Employee Management

- Employee code unique within tenant.
- Full name.
- Phone number.
- Email unique within tenant.
- Department.
- Designation.
- Joining date.
- Employment type.
- Salary type.
- Status.
- Emergency contact.
- Bank details.
- Government IDs.
- Profile photo.
- Documents.

### Attendance

- Employee login inside tenant context.
- GPS location capture.
- Tenant geo-fence verification.
- Camera capture.
- Face verification against tenant employee profile.
- Liveness verification.
- Attendance creation.
- Fraud signal logging.

### Leave Management

- Tenant-specific leave types and balances.
- Employee submission.
- Manager approval.
- HR approval.
- Approval history.

### Salary And Payroll

- Tenant-specific salary rules.
- Attendance-driven salary calculation.
- Configurable working days.
- Configurable late, half-day, leave, and absence rules.
- Monthly payroll draft generation.
- Employee salary view.

### Reports

- Attendance report.
- Employee report.
- Leave report.
- Salary report.
- Department report.
- Late arrival report.
- CSV export.
- Excel export.
- PDF export.

Every report is scoped to exactly one tenant unless produced by a Platform Super Admin using explicit platform analytics endpoints.

## User Experience Requirements

- Mobile-first PWA.
- Tenant branding on login and authenticated shell.
- Clean enterprise dashboard experience.
- Accessible controls.
- Dark mode support.
- Fast attendance flow with clear status and failure messages.
- No employee self-attendance bypass when face or location verification fails.

## Success Metrics

- New tenant can be onboarded without code changes.
- Attendance check-in or check-out completes in under 10 seconds on normal mobile networks.
- Payroll draft can be generated for one tenant and one month without manual spreadsheet calculation.
- All sensitive tenant and platform actions are represented in audit logs.
- Employees can request leave and track approval status without HR intervention.
- Admins can export tenant reports without engineering support.
- Automated tests prove cross-tenant access is rejected.

## Out Of Scope For Phase 1

- Integration with the existing VC Organics billing platform.
- Biometric hardware devices.
- Full accounting ledger.
- Advanced workforce scheduling.
- Tenant self-service billing and payment collection.
- Cross-tenant employee sharing.

