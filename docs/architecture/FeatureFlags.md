# Feature Flags

## Purpose

Define a tenant-aware feature flag architecture for safely operating a SaaS platform across thousands of companies.

## Principles

- Feature flags are tenant-scoped by default.
- Platform-level defaults can be overridden per plan and per tenant.
- Flag evaluation must happen server-side for protected behavior.
- Client flags are only for presentation and must not grant access.
- Flag changes must be audited.

## Flag Levels

### Platform Default

Global default used when no plan or tenant override exists.

### Plan Override

Feature behavior assigned to a subscription plan.

### Tenant Override

Explicit tenant-level override used for pilots, exceptions, migrations, enterprise contracts, or incident response.

Evaluation order:

1. Tenant override.
2. Plan override.
3. Platform default.

## Flag Types

- Boolean flags.
- String variant flags.
- Numeric limit flags.
- JSON configuration flags.
- Kill switch flags.

## Core Flags

Suggested initial flags:

- `attendance.face_verification.enabled`
- `attendance.liveness.enabled`
- `attendance.geo_fence.enabled`
- `attendance.manual_entry.enabled`
- `attendance.fraud_detection.enabled`
- `payroll.enabled`
- `payroll.approval_workflow.enabled`
- `reports.pdf_export.enabled`
- `reports.excel_export.enabled`
- `branding.custom_domain.enabled`
- `branding.white_label.enabled`
- `security.vpn_detection.enabled`
- `security.device_limit.enabled`
- `api.public_access.enabled`

## Evaluation Context

Feature flag evaluation receives:

- Tenant ID.
- Plan code.
- User ID.
- Membership ID.
- Tenant roles.
- Environment.
- Request route or service module.

The evaluator must never rely on tenant ID supplied in request bodies.

## Caching

Feature flags may be cached, but cache keys must include tenant ID and plan version.

Cache key format:

```text
tenant:{tenant_id}:feature-flags:{version}
```

Flag changes must invalidate the tenant cache.

## Operational Controls

Required controls:

- Audit every flag change.
- Store change reason.
- Store actor.
- Support scheduled flag changes.
- Support immediate kill switches.
- Support read-only inspection by support roles.
- Show effective value and source level.

## Safety Rules

- Security-critical checks cannot be disabled for production tenants unless the flag is explicitly designed as a controlled emergency switch.
- Employee self-attendance cannot bypass both geo-fence and face verification in production.
- Plan entitlement flags must be enforced in API and worker code.
- Report export flags must be enforced before queuing jobs.

## Testing Requirements

- Tenant override beats plan override.
- Plan override beats platform default.
- Flag cache is tenant-isolated.
- Disabled feature is blocked server-side.
- Flag changes are audited.
- Kill switch takes effect without deployment.

