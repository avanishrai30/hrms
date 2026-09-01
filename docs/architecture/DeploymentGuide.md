# Deployment Architecture

## Deployment Boundary

VC-WMS deploys as an independent multi-tenant SaaS platform. VC Organics is Tenant #1 inside this platform.

The platform remains independent from the VC Organics billing system.

Required separation from external systems:

- Separate Docker Compose project name.
- Separate PostgreSQL database.
- Separate database user.
- Separate Redis instance or namespace.
- Separate MinIO bucket.
- Separate JWT, cookie, CSRF, and face-service secrets.
- Separate Nginx server block.
- Separate backup policy.

## SaaS Deployment Model

- Shared web deployment.
- Shared API deployment.
- Shared face-service deployment.
- Shared PostgreSQL database with `tenant_id` isolation.
- Shared Redis with tenant-aware keys.
- Shared MinIO bucket with tenant-prefixed object paths.
- Shared worker pool with tenant-aware jobs.

Object path convention:

```text
tenants/{tenant_id}/{asset_category}/{entity_id}/{file_id}
```

Redis key convention:

```text
tenant:{tenant_id}:{module}:{key}
```

Queue job convention:

```json
{
  "tenantId": "uuid",
  "jobType": "PAYROLL_GENERATION",
  "payload": {}
}
```

## Services

- `web`: Next.js app.
- `api`: NestJS API.
- `face-service`: FastAPI biometric service.
- `postgres`: PostgreSQL.
- `redis`: Redis.
- `minio`: Object storage.
- `worker`: BullMQ worker process.
- `nginx`: Reverse proxy and TLS termination.

## Domains

Supported tenant routing:

- Platform domain: `app.example.com`.
- Tenant subdomain: `{tenant_slug}.example.com`.
- Future custom domain: `hr.tenant.com`.

Nginx routes all tenant domains to the same web/API services. The API resolves tenant context from host, slug, session, or verified domain mapping.

## Environment Variables

### Web

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`

### API

- `DATABASE_URL`
- `REDIS_URL`
- `REDIS_KEY_PREFIX`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`
- `CSRF_SECRET`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `FACE_SERVICE_URL`
- `FACE_SERVICE_SHARED_SECRET`
- `CORS_ORIGINS`
- `TENANT_DOMAIN_ROOT`
- `PLATFORM_ADMIN_EMAILS`

### Face Service

- `FACE_SERVICE_SHARED_SECRET`
- `MODEL_NAME`
- `MODEL_VERSION`
- `EMBEDDING_ENCRYPTION_KEY`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`

## Tenant Onboarding

1. Platform Super Admin creates tenant.
2. System creates tenant settings.
3. System creates default tenant branding.
4. System seeds tenant roles and role permissions.
5. System creates Tenant Owner invitation or bootstrap account.
6. System provisions tenant storage prefixes.
7. System verifies tenant domain or subdomain.
8. Tenant status becomes `ACTIVE`.

VC Organics seed:

- Tenant name: VC Organics.
- Slug: `vc-organics`.
- Primary custom domain: `hr.vcorganics.com`.
- Status: `ACTIVE`.
- Plan: `STANDARD` or selected launch plan.

## Release Process

1. Build images.
2. Run unit tests.
3. Run integration tests.
4. Run tenant isolation regression tests.
5. Run Prisma migration in release step.
6. Start API and worker.
7. Start face service.
8. Start web app.
9. Run smoke tests for VC Organics tenant.
10. Run smoke tests for a second test tenant.
11. Verify health checks.
12. Monitor logs and metrics.

## Backup

- PostgreSQL daily backup with retention.
- MinIO bucket backup for tenant documents, branding, attendance evidence, and exports.
- Restore drill before production launch.
- Tenant-level restore procedure must prevent overwriting another tenant.
- Backup credentials stored separately from application credentials.

## Nginx

Routes:

- `/` to web.
- `/api` to API.
- No public route to face service.
- TLS required.
- Wildcard TLS for tenant subdomains where available.
- Custom tenant domains require verification before activation.
- Upload size configured for document and attendance image limits.

## Health Checks

- Web: `GET /`.
- API: `GET /api/v1/health`.
- Face service: `GET /internal/v1/health` on internal network.
- Worker: queue heartbeat.
- PostgreSQL: connection check.
- Redis: ping.
- MinIO: bucket access check.
- Tenant readiness: `GET /api/v1/platform/tenants/:tenantId/health`.

## Production Readiness Checklist

- Secrets are unique to VC-WMS.
- Billing system credentials are not present.
- Database migrations are reviewed.
- Tenant schema rules include `tenant_id` on every tenant-owned table.
- Tenant isolation tests pass.
- RBAC seed data exists per tenant.
- VC Organics tenant seed exists.
- Tenant Owner bootstrap path is documented.
- Audit logs are enabled.
- Rate limits are enabled by tenant and IP.
- Backups are scheduled and tested.
- TLS certificate is active.
- Face service is not internet-accessible.
- Cache keys, queue jobs, object paths, and reports include tenant scope.
