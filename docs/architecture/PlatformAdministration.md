# Platform Administration

## Purpose

Define Platform Super Admin capabilities and boundaries for operating VC-WMS as a SaaS product.

## Platform Super Admin Scope

Platform Super Admins manage the SaaS platform. They are separate from Tenant Admins.

Capabilities:

- Tenant creation.
- Tenant activation, suspension, archival, and deletion scheduling.
- Plan assignment.
- Usage limit overrides.
- Feature flag overrides.
- Domain verification.
- Platform user management.
- Platform audit review.
- System health inspection.
- Support workflow controls.

Platform Super Admins must not casually access tenant workforce data. Tenant data access requires a defined support or compliance workflow.

## Tenant Admin Scope

Tenant Admins manage their own tenant only.

Capabilities:

- Tenant settings where permitted.
- Tenant branding where permitted.
- Tenant users and roles.
- Employees.
- Locations.
- Attendance operations.
- Leave workflows.
- Payroll workflows.
- Tenant reports.

Tenant Admins cannot access platform tenant registry, other tenants, platform plans, platform health for other tenants, or platform audit logs.

## Support Access

Support access is optional and must be controlled.

Requirements:

- Explicit tenant.
- Explicit reason.
- Time-bounded session.
- Least privilege.
- Platform audit log.
- Tenant-visible audit log when contractually required.
- No payroll approval or manual attendance unless specifically granted.

## Platform Console Modules

Required modules:

- Tenant registry.
- Tenant detail page.
- Tenant lifecycle controls.
- Subscription and plan controls.
- Usage dashboard.
- Feature flag management.
- Domain verification.
- Platform users.
- Platform audit logs.
- Health and incident dashboard.

## Tenant Registry

Tenant list includes:

- Tenant name.
- Slug.
- Status.
- Plan.
- Primary domain.
- Employee count.
- Storage usage.
- Last activity.
- Created date.

## Administrative Audit

Audit all platform actions:

- Tenant created.
- Tenant status changed.
- Tenant plan changed.
- Tenant limits overridden.
- Tenant feature flag changed.
- Tenant domain verified or removed.
- Support session started and ended.
- Platform user created, updated, suspended, or removed.

## Safety Controls

- Require confirmation for tenant suspension, archival, and deletion scheduling.
- Require reason for lifecycle changes.
- Require stronger authentication for destructive actions.
- Never run tenant deletion without dry-run report.
- Never expose one tenant data inside another tenant admin UI.

