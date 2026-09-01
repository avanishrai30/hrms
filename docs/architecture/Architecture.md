# Architecture

## System Boundary

VC-WMS is an independent multi-tenant SaaS platform. It may share VPS infrastructure with other systems, but it must use independent deployment units, credentials, object storage buckets, queues, authentication, and operational controls.

VC Organics is Tenant #1 inside the SaaS platform.

## Tenancy Architecture

The platform uses a shared PostgreSQL database with tenant-aware tables.

Required invariants:

- Every tenant-owned entity has `tenant_id`.
- Every repository query includes tenant scope.
- Every cache key includes tenant scope.
- Every queue job includes tenant scope.
- Every storage object key includes tenant scope.
- Every audit log includes tenant scope or is explicitly marked as platform-level.
- Every report and export includes tenant scope.
- Request DTOs cannot override authenticated tenant context.

Tenant context is resolved from:

- Authenticated session claims.
- Tenant slug, domain, or subdomain during login.
- Server-side membership lookup.

Tenant context is propagated through API guards, services, repositories, workers, face-service calls, storage helpers, audit logging, and report generation.

## Logical Components

### Web App

- Next.js 16.
- React 19.
- TypeScript.
- TailwindCSS.
- Shadcn UI.
- TanStack Query.
- Zustand for small client state.
- React Hook Form and Zod.
- Recharts.
- PWA manifest and service worker.

The web app talks only to the VC-WMS API. It must not access the database directly. Tenant branding and PWA metadata are loaded from tenant settings after tenant resolution.

### API

- NestJS.
- REST.
- OpenAPI.
- Prisma ORM.
- PostgreSQL.
- Redis.
- BullMQ.
- JWT access tokens.
- Refresh tokens in secure cookies.
- Tenant context guard.
- RBAC guards.
- Audit interceptors.

The API owns tenant isolation. UI filters are never trusted as security controls.

### Face Service

- FastAPI.
- InsightFace.
- OpenCV.
- Liveness checks.
- Embedding generation and comparison.
- Internal API only.

The face service receives `tenant_id`, `employee_id`, model metadata, and signed object references from the API. It must never search across tenants. Face embeddings and image paths are tenant-scoped.

### Storage

- MinIO for documents, profile photos, attendance photos, branding assets, and export artifacts.
- Private buckets by default.
- Tenant-prefixed object paths.
- Short-lived signed URLs for authorized access.

Object key format:

```text
tenants/{tenant_id}/{asset_category}/{entity_id}/{generated_file_id}
```

### Async Processing

- Redis and BullMQ for report generation, payroll jobs, notification dispatch, and cleanup tasks.
- Queue names and job IDs include tenant scope.
- Workers reconstruct tenant context before executing domain logic.

## Module Boundaries

- Platform: tenant registry, platform users, subscriptions, platform audit.
- Tenants: tenant settings, branding, domains, feature flags.
- Auth: users, memberships, sessions, tenant roles, permissions.
- Employees: tenant employment profile and documents.
- Attendance: tenant check-in, check-out, geo-fence, face verification, fraud signals.
- Locations: tenant geo-fence locations and radius configuration.
- Leave: tenant leave requests, balances, approval workflow.
- Payroll: tenant salary rules, payroll runs, salary line items.
- Reports: tenant query APIs and export jobs.
- Audit: immutable platform and tenant action logs.
- Notifications: tenant-scoped in-app notifications and future delivery channels.

## Tenant-Aware Repository Pattern

All tenant data access goes through repositories or services that require `TenantContext`.

Example contract:

```ts
type TenantContext = {
  tenantId: string;
  actorUserId: string;
  membershipId: string;
  roles: string[];
};
```

Repository methods must not accept optional tenant IDs. Tenant scope is required at construction or method boundary.

## Data Flow: Login

1. User opens tenant domain, subdomain, or tenant slug route.
2. API resolves tenant.
3. User authenticates with email or phone inside that tenant.
4. API verifies active tenant membership.
5. API issues access token with tenant and membership claims.
6. Refresh token is bound to tenant, user, session, and device fingerprint.

## Data Flow: Attendance

1. Employee authenticates in tenant context.
2. Web app requests GPS permission.
3. Web app captures device metadata.
4. API validates tenant, membership, employee status, and attendance window.
5. API verifies submitted coordinates against active locations for that tenant only.
6. Web app captures face image to tenant-scoped temporary upload path.
7. API sends tenant-scoped verification request to internal face service.
8. Face service performs liveness and match checks against that tenant employee profile only.
9. API records attendance result, evidence metadata, and fraud signals with `tenant_id`.
10. API writes tenant audit log and returns status.

## Reliability

- Stateless web and API containers.
- Database migrations run as controlled release steps.
- BullMQ jobs are idempotent by tenant and business key.
- Export jobs store tenant, status, and artifact references.
- Failed biometric or location checks are stored as tenant-scoped attempts, not ignored.

## Observability

- Structured JSON logs.
- Request IDs.
- Tenant IDs in service logs where safe for operators.
- Audit IDs on sensitive operations.
- Health checks for web, API, face service, PostgreSQL, Redis, and MinIO.
- Metrics segmented by tenant for platform operations.
- Tenant-level dashboards for attendance success rate, face failures, geo-fence failures, API latency, job failures, and payroll generation.

