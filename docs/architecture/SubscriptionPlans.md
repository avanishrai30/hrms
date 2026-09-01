# Subscription Plans

## Purpose

Define SaaS subscription plans, usage limits, plan enforcement, and future billing integration for VC-WMS.

## Plan Model

Plans define commercial packaging and platform limits. Feature flags define behavior availability. Usage limits define measurable consumption.

The platform must support changing plan limits without code deployment.

## Initial Plans

### Trial

For evaluation and sales demos.

Suggested limits:

- Employees: 25.
- Admin users: 2.
- Locations: 2.
- Attendance records: limited by trial duration.
- Document storage: 2 GB.
- Report exports per month: 20.
- Custom domain: disabled.
- White-label branding: basic.
- Payroll: enabled for testing.

### Standard

For small companies.

Suggested limits:

- Employees: 100.
- Admin users: 5.
- Locations: 5.
- Document storage: 25 GB.
- Report exports per month: 200.
- Custom domain: disabled or paid add-on.
- White-label branding: basic.
- Payroll: enabled.

### Pro

For growing companies with multiple sites.

Suggested limits:

- Employees: 500.
- Admin users: 25.
- Locations: 25.
- Document storage: 150 GB.
- Report exports per month: 2,000.
- Custom domain: enabled.
- White-label branding: full.
- Advanced reports: enabled.
- API access: optional add-on.

### Enterprise

For large organizations.

Suggested limits:

- Employees: custom.
- Admin users: custom.
- Locations: custom.
- Document storage: custom.
- Report exports per month: custom.
- Custom domain: enabled.
- White-label branding: full.
- Priority support: enabled.
- Dedicated deployment option: future.
- Custom contracts and retention: enabled.

## Usage Dimensions

Track usage per tenant:

- Active employees.
- Active users.
- Tenant admins.
- Locations.
- Face profiles.
- Attendance attempts.
- Attendance records.
- Payroll runs.
- Report exports.
- Document storage bytes.
- Attendance photo storage bytes.
- API requests.
- Background job volume.

## Enforcement Points

Usage limits are enforced in:

- Tenant onboarding.
- Employee creation.
- User invitation.
- Location creation.
- Face enrollment.
- File upload.
- Report export creation.
- API rate limiting.
- Payroll generation when plan gates apply.

Enforcement must be server-side. UI messaging can warn, but cannot be trusted.

## Plan Change Rules

Upgrades:

- Apply immediately unless billing integration later requires payment confirmation.
- Increase limits immediately.
- Enable newly available features through plan-linked feature flags.

Downgrades:

- Run preflight check.
- Identify limit violations.
- Do not delete tenant data automatically.
- Disable creation of additional resources over the new limits.
- Preserve existing records.

## Future Billing Integration

Billing is out of Phase 1 implementation, but the architecture must prepare for it.

Required future integration points:

- External customer ID.
- External subscription ID.
- Plan code.
- Billing status.
- Trial end date.
- Current period start and end.
- Usage metering events.
- Webhook idempotency keys.
- Payment failure state mapped to tenant suspension policy.

Billing integration must not couple VC-WMS to the existing VC Organics billing platform.

## Data Model Expectations

Required entities:

- Subscription plans.
- Tenant subscriptions.
- Plan limits.
- Usage counters.
- Usage events.
- Billing integration references.

All tenant subscription and usage entities include `tenant_id`.

## Audit Requirements

Audit:

- Plan creation.
- Plan limit changes.
- Tenant plan assignment.
- Tenant upgrade.
- Tenant downgrade.
- Limit override.
- Billing status change.
- Subscription cancellation.

