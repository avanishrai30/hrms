# Tenant Lifecycle

## Purpose

Define how tenants are created, activated, operated, suspended, archived, restored, and eventually deleted in the VC-WMS multi-tenant SaaS platform.

VC Organics is Tenant #1 and follows the same lifecycle rules as every future tenant.

## Lifecycle States

### Draft

Tenant record exists but is not usable by end users.

Allowed operations:

- Configure legal name, display name, slug, timezone, locale, and currency.
- Configure initial subscription plan.
- Configure tenant branding.
- Create initial Tenant Admin invitation.
- Verify subdomain or custom domain.

End-user login is not allowed.

### Provisioning

Tenant is being prepared for activation.

Provisioning creates:

- Tenant settings.
- Tenant branding defaults.
- Tenant roles.
- Tenant role permissions.
- Storage prefixes.
- Default feature flag values.
- Subscription usage counters.
- Tenant Admin invitation.

Provisioning must be idempotent by tenant ID.

### Active

Tenant is fully usable.

Allowed operations:

- User login.
- Employee, attendance, leave, payroll, reports, and admin operations.
- Plan changes.
- Branding changes.
- Domain changes.

### Suspended

Tenant access is restricted because of payment, compliance, abuse, contract, or manual platform action.

Behavior:

- Tenant users cannot log in.
- Existing sessions cannot refresh.
- Background jobs pause except compliance, backup, audit, and export retention jobs.
- Platform Super Admin can inspect metadata and audit logs.
- Tenant data remains retained.

### Archived

Tenant is no longer active but retained for historical, contractual, or compliance reasons.

Behavior:

- Tenant users cannot log in.
- Operational writes are blocked.
- Read access is Platform Super Admin only unless a tenant export workflow is approved.
- Backups and retention policies continue.

### Pending Deletion

Tenant is scheduled for deletion after retention and approval gates.

Requirements:

- Explicit Platform Super Admin approval.
- Contractual retention check.
- Legal hold check.
- Final export availability check.
- Deletion job scheduled with tenant ID.

### Deleted

Tenant business data has been removed according to deletion policy.

Deletion must be tenant-scoped and independently verified. Platform-level audit records may retain minimal metadata such as tenant ID, tenant slug, deletion actor, deletion date, and deletion reason.

## State Transitions

Allowed transitions:

- Draft to Provisioning.
- Provisioning to Active.
- Provisioning to Draft when provisioning fails before activation.
- Active to Suspended.
- Suspended to Active.
- Active to Archived.
- Suspended to Archived.
- Archived to Active only with Platform Super Admin approval.
- Archived to Pending Deletion.
- Pending Deletion to Deleted.
- Pending Deletion to Archived when deletion is cancelled before execution.

## Tenant Creation Rules

Tenant creation requires:

- Unique tenant slug.
- Legal name.
- Display name.
- Primary timezone.
- Locale.
- Currency.
- Subscription plan.
- Initial Tenant Admin email.

Optional during creation:

- Logo.
- Brand colors.
- Custom domain.
- Address and tax metadata.
- Feature flag overrides.

## Tenant Activation Checklist

- Tenant status is `ACTIVE`.
- Tenant settings exist.
- Tenant branding exists.
- Tenant roles exist.
- Tenant permissions are seeded.
- Initial Tenant Admin membership exists.
- Storage prefix is writable.
- Feature flag defaults are assigned.
- Subscription usage counters are initialized.
- Domain or subdomain resolves.
- Login smoke test passes.

## Suspension Policy

Suspension reasons:

- Payment failure.
- Contract ended.
- Abuse or fraud.
- Security incident.
- Legal request.
- Manual administrative decision.

Suspension must create:

- Platform audit log.
- Tenant audit log when visible to tenant admins.
- Notification to Tenant Admins when policy allows.
- Session revocation job.

## Data Retention

Retention is controlled by platform policy, tenant contract, and applicable law.

Default retention:

- Active tenant: retain all operational data.
- Suspended tenant: retain all operational data.
- Archived tenant: retain all operational data until deletion policy begins.
- Deleted tenant: retain only minimal platform audit metadata.

## Operational Requirements

- Lifecycle jobs must be idempotent.
- Tenant status must be checked during login, session refresh, writes, report exports, and worker execution.
- Lifecycle changes must never cross tenant boundaries.
- Deletion and restore jobs require dry-run reporting before execution.

