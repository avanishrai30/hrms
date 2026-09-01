# Security Architecture

## Security Model

VC-WMS is a shared-database multi-tenant SaaS platform. Tenant isolation is a mandatory security control across authentication, authorization, repositories, caches, queues, object storage, audit logs, and reports.

## Authentication

- Email or phone login inside a resolved tenant context.
- Tenant can be resolved by subdomain, verified custom domain, or tenant slug.
- Passwords hashed with Argon2id or bcrypt with current cost guidance.
- JWT access tokens with short expiry.
- Access tokens include user ID, tenant ID, membership ID, roles, and permissions version.
- Refresh tokens stored in secure, HTTP-only, same-site cookies.
- Refresh token rotation on use.
- Sessions are bound to tenant, user, membership, device fingerprint, and refresh token family.
- Suspended tenants cannot issue or refresh tenant sessions.

## Authorization

- Platform roles and tenant roles are separate.
- Platform Super Admin can manage tenants and platform operations.
- Tenant roles apply only inside one tenant.
- RBAC is enforced in API guards and domain services.
- Permissions are stored and checked by resource and action.
- UI authorization is convenience only. API authorization is the source of truth.
- Support impersonation, if added, requires explicit reason, time limit, approval policy, and audit logs.

## Tenant Isolation Controls

- Tenant context guard runs before protected tenant routes.
- Request body `tenantId` is rejected for tenant business endpoints.
- Repository methods require tenant context.
- Prisma middleware or repository wrappers assert `tenant_id` filters for tenant-owned models.
- Cross-tenant joins are prohibited except platform analytics services with Platform Super Admin permission.
- Cache keys use `tenant:{tenant_id}:...`.
- Queue names or job payloads include tenant ID and workers rehydrate tenant context.
- MinIO object keys use `tenants/{tenant_id}/...`.
- Report exports include tenant ID in query filters and storage object keys.
- Audit logs include tenant ID for tenant actions.

## CSRF

- Use same-site secure cookies.
- Require CSRF token for state-changing browser requests when cookie auth is involved.
- CSRF tokens are tenant-session scoped.

## Rate Limiting

Apply rate limits by tenant, user, IP, and route to:

- Login.
- Refresh.
- Attendance attempts.
- Face enrollment.
- Uploads.
- Report exports.
- Tenant management endpoints.

## Biometric Data

- Store face embeddings encrypted.
- Include tenant ID in face profile records and face-service requests.
- Store attendance photos in private tenant-prefixed MinIO paths.
- Avoid public URLs.
- Use signed URLs with short expiry.
- Restrict biometric operations to the internal service network.
- Log access to biometric resources.
- Face service must not compare a face image against profiles from another tenant.

## File Upload Security

- Validate MIME type and extension.
- Enforce tenant-level size and quota limits.
- Store files outside web root.
- Generate object keys server-side.
- Prefix object keys with tenant ID.
- Scan or quarantine uploads when malware scanning is available.
- Never trust client-provided filenames for storage paths.

## Audit Logging

Audit logs must be append-only at the application level.

Tenant audit logs include:

- Tenant ID.
- Actor user ID.
- Actor membership ID.
- Action.
- Resource type and ID.
- Request ID.
- IP address.
- User agent.
- Before and after snapshots where appropriate.

Audit:

- Login success and failure.
- Tenant membership and role changes.
- Tenant settings and branding changes.
- Employee create, update, status change.
- Document upload and delete.
- Face enrollment.
- Attendance success and failure.
- Manual attendance.
- Leave approvals and rejections.
- Payroll generation, approval, and payment.
- Report exports.

Platform audit logs include tenant lifecycle and platform operator actions.

## Anti-Fraud

Fraud detection must log suspicious actions instead of silently ignoring them.

Signals:

- Mock location.
- VPN or suspicious IP.
- Multiple device use within a tenant.
- Repeated failed face attempts.
- Face mismatch.
- Low location accuracy.
- Impossible travel between tenant-scoped attendance attempts.

## Secrets

- Use environment variables.
- Keep `.env` files out of git.
- Rotate JWT, cookie, object storage, database, and face-service shared secrets.
- Use separate secrets from every other platform.
- Use per-environment encryption keys.
- Design for future tenant-specific encryption keys for biometric and payroll data.

## OWASP Controls

- Input validation.
- Output encoding.
- Secure headers.
- Tenant-aware CORS allowlist.
- CSRF protection.
- Rate limiting.
- Least privilege database and object storage credentials.
- Safe error messages.
- Dependency scanning.
- Container image scanning.
- Cross-tenant access regression tests.

