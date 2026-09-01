# Agent Operating Guide

## Mission

Build VC-WMS as a production-grade, independent multi-tenant SaaS Workforce Management Platform. VC Organics is Tenant #1. The system must not depend on the VC Organics billing platform.

## Non-Negotiables

- Keep billing and WMS systems isolated.
- Use shared database plus `tenant_id` for SaaS tenancy.
- Every tenant-owned table, query, cache key, queue job, storage path, audit log, and report must be tenant-scoped.
- Use a separate PostgreSQL database from billing, separate API, Docker deployment, auth system, Redis namespace, storage bucket, and environment configuration.
- Use Prisma for database access. Do not use raw SQL in application code.
- Keep business logic out of React components.
- Keep APIs typed, validated, versioned, audited, and documented.
- Enforce RBAC server-side for every protected action.
- Attendance requires location verification and face verification. No bypass path is allowed for employee self-attendance.
- Manual attendance is restricted to HR Admin, Tenant Admin, and Tenant Owner and must create audit records.

## Build Order

1. Review and approve documentation.
2. Scaffold monorepo and shared tooling.
3. Implement database schema and migrations.
4. Implement tenant management, settings, branding, and tenant context propagation.
5. Implement authentication and tenant-scoped RBAC.
6. Implement employee management.
7. Implement locations, geo-fencing, and attendance.
8. Implement face enrollment and verification integration.
9. Implement leave workflow.
10. Implement salary engine and payroll foundation.
11. Implement reports and exports.
12. Harden security, observability, deployment, and tests.

## Coding Standards

- TypeScript strict mode everywhere it applies.
- No `any` unless approved in a local comment with rationale.
- Feature-based folders.
- DTO validation with Zod or class-validator according to package context.
- Unit tests for domain rules.
- Integration tests for API workflows.
- End-to-end tests for attendance, leave, and payroll critical paths.

## Review Checklist

- Does this change preserve WMS independence from billing?
- Does every tenant-owned operation enforce tenant scope?
- Could this query, cache key, storage path, queue job, report, or audit log leak cross-tenant data?
- Are permissions checked server-side?
- Is every sensitive mutation audited?
- Is input validated before business logic runs?
- Is attendance fraud surfaced rather than silently ignored?
- Are errors safe for users and useful for operators?
- Are tests proportional to risk?
