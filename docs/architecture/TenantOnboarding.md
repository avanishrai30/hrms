# Tenant Onboarding

## Purpose

Define the production onboarding process for creating and activating tenants on VC-WMS.

## Onboarding Actors

### Platform Super Admin

Creates tenants, assigns plans, verifies domains, and controls activation.

### Tenant Admin

Accepts invitation, completes company profile, configures workforce settings, and invites HR users.

## Onboarding Flow

1. Platform Super Admin creates tenant draft.
2. Platform assigns subscription plan.
3. System provisions tenant defaults.
4. Platform sends Tenant Admin invitation.
5. Tenant Admin accepts invitation.
6. Tenant Admin completes profile and settings.
7. Tenant Admin uploads branding.
8. Tenant Admin configures locations.
9. Tenant Admin imports or creates employees.
10. Tenant Admin enrolls face profiles or starts enrollment workflow.
11. Platform runs tenant readiness checks.
12. Tenant is activated.

## Required Tenant Data

- Tenant legal name.
- Tenant display name.
- Tenant slug.
- Timezone.
- Locale.
- Currency.
- Plan.
- Tenant Admin email.
- Payroll defaults.

## Provisioned Defaults

System creates:

- Tenant settings.
- Tenant branding.
- Tenant roles.
- Role permissions.
- Feature flag values.
- Usage counters.
- Storage prefixes.
- Audit log stream.
- Default leave policies.
- Default salary rule.

## VC Organics Seed

VC Organics is seeded as:

- Tenant name: VC Organics.
- Slug: `vc-organics`.
- Primary custom domain: `hr.vcorganics.com`.
- Status: `ACTIVE`.
- Initial plan: launch-selected plan.
- Tenant Owner: configured during deployment.

## Employee Import

Employee import must:

- Validate tenant scope.
- Enforce employee code uniqueness within tenant.
- Enforce email uniqueness within tenant.
- Create import audit records.
- Produce row-level error reports.
- Avoid partial silent failures.

## Domain Setup

Default:

- Tenant uses `{tenant_slug}.example.com`.

Custom domain:

- Requires plan entitlement.
- Requires DNS verification.
- Requires TLS readiness.
- Requires platform approval if policy demands.

## Readiness Checks

Before activation:

- Tenant status is provisioned.
- Tenant settings exist.
- Tenant roles and permissions exist.
- Tenant Admin account is active.
- Storage prefix is writable.
- Branding is valid.
- At least one active location exists when attendance is enabled.
- Salary rule exists when payroll is enabled.
- Feature flags are evaluated correctly.
- Login smoke test passes.
- Cross-tenant access regression tests pass in staging.

## Offboarding Handoff

Onboarding documentation must also prepare for offboarding:

- Data export process.
- Account suspension process.
- Domain removal process.
- Retention policy.
- Deletion approval policy.
