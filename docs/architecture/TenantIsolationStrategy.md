# Tenant Isolation Strategy

## Purpose

Define how VC-WMS enforces strict tenant isolation while using shared PostgreSQL with `tenant_id`.

## Isolation Principle

Tenant isolation is enforced at every layer:

- Request routing.
- Authentication.
- Authorization.
- Service methods.
- Repositories.
- Database schema.
- Cache keys.
- Queue jobs.
- Object storage paths.
- Audit logs.
- Reports.
- Exports.
- Observability.

No layer may rely on the UI to enforce isolation.

## Tenant Context

Tenant context contains:

- Tenant ID.
- Tenant slug.
- User ID.
- Membership ID.
- Roles.
- Permissions version.
- Plan.
- Feature flag version.

Tenant context is resolved once per request and passed explicitly through services and repositories.

## Database Isolation

Rules:

- Every tenant-owned table has `tenant_id`.
- Every tenant-owned unique constraint includes `tenant_id`.
- Every tenant-owned index begins with or includes `tenant_id` where practical.
- Every tenant-owned foreign key relationship is validated inside tenant scope.
- Platform tables are the only tables allowed without `tenant_id`.

Repository rules:

- No tenant-owned repository method can run without tenant context.
- List, get, update, delete, aggregate, and export queries include tenant ID.
- IDs from URLs are insufficient; lookup must include ID plus tenant ID.
- Bulk jobs must include tenant ID in filters.

## API Isolation

Rules:

- Tenant APIs require authenticated tenant membership.
- Request bodies cannot set tenant ID.
- Platform endpoints that accept tenant ID require Platform Super Admin permission.
- Tenant Admins cannot access platform tenant registry.
- Tenant users cannot enumerate tenants.
- Error messages must not reveal whether a resource exists in another tenant.

## Cache Isolation

Cache keys include tenant ID:

```text
tenant:{tenant_id}:{module}:{key}
```

Never cache tenant data with global keys. Cache invalidation must target tenant-specific keys unless intentionally clearing platform-wide metadata.

## Queue Isolation

Every queue job includes:

- Tenant ID.
- Actor user ID when applicable.
- Actor membership ID when applicable.
- Idempotency key.
- Job type.

Workers must:

- Validate tenant status.
- Rehydrate tenant context.
- Use tenant-aware repositories.
- Write tenant-scoped audit logs.

## Storage Isolation

Object storage paths include tenant ID:

```text
tenants/{tenant_id}/{category}/{entity_id}/{file_id}
```

Signed URLs are created only after permission and tenant checks. Tenant users cannot request object keys outside their tenant prefix.

## Report Isolation

Reports must:

- Include tenant ID in all query filters.
- Include tenant ID in export job payloads.
- Store export files in tenant-prefixed paths.
- Refuse cross-tenant report joins for tenant users.

Platform analytics are separate endpoints and require Platform Super Admin permission.

## Audit Isolation

Tenant audit logs include tenant ID. Platform audit logs are separate and used for platform operator actions.

Audit logs must capture denied cross-tenant access attempts without exposing protected resource details to the requester.

## Face Service Isolation

Face-service requests include tenant ID and employee ID. The face service must:

- Compare only against the requested tenant employee profile.
- Read only tenant-prefixed object paths.
- Return tenant ID in verification response.
- Reject requests where tenant ID and object path prefix do not match.

## Testing Strategy

Required tests:

- Tenant A cannot read Tenant B employee.
- Tenant A cannot update Tenant B employee by guessed ID.
- Tenant A cannot access Tenant B attendance report.
- Tenant A cannot use Tenant B object key.
- Tenant A cache does not return Tenant B data.
- Tenant A queued export cannot process Tenant B data.
- Tenant A face verification cannot use Tenant B face profile.
- Platform Super Admin endpoint access is denied to Tenant Admin.
- Suspended tenant sessions cannot refresh.

## Operational Verification

Before production:

- Run automated cross-tenant regression suite.
- Review Prisma schema for tenant-owned tables missing `tenant_id`.
- Review repository queries for missing tenant filters.
- Review cache and queue naming.
- Review storage object key helpers.
- Review report export filters.

