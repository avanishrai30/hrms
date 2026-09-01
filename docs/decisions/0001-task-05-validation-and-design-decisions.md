# Decision 0001: Task 05 Validation And Design Decisions

## Status

Accepted.

## Validation Summary

The repository is currently documentation-only and internally aligned around a multi-tenant SaaS Workforce Management Platform with VC Organics as Tenant #1. The architecture consistently requires shared PostgreSQL with `tenant_id`, tenant-scoped APIs, tenant-aware storage paths, tenant-aware caches, tenant-aware jobs, and strict server-side RBAC.

## Contradictions Found

- Role naming drift: some earlier docs use "Super Admin" for tenant-level approvals while newer SaaS docs define "Platform Super Admin" as platform-only. Decision: use `Platform Super Admin` only for SaaS operations; use `Tenant Owner`, `Tenant Admin`, `HR Admin`, `Manager`, and `Employee` inside tenants.
- Domain specificity gap: Task 05 introduces `hr.vcorganics.com` as VC Organics primary domain, while previous docs only used generic examples. Decision: treat `hr.vcorganics.com` as Tenant #1 custom domain example, not as the platform-wide product domain.

## Duplicate Rules Found

- Tenant isolation appears in PRD, Architecture, Security, Deployment, and Tenant Isolation docs. This duplication is intentional because it is a security invariant.
- Design rules for contrast, mobile-first behavior, and attendance speed appear in several docs. This duplication is intentional because those constraints affect every screen.

## Missing States Found

- Attendance UX had the right high-level flow but did not enumerate every failure and retry state requested in Task 05.
- Screen-level loading, empty, error, success, disabled, and permission-denied states were not yet specified per screen.

## Missing Permissions Found

- Platform support access is documented as controlled but not mapped screen-by-screen.
- Tenant branding and role-management permissions need explicit screen-level gates.

## Terminology Decisions

- `Platform Super Admin`: SaaS operator, platform console only.
- `Tenant Owner`: highest business role inside a tenant.
- `Tenant Admin`: tenant administration role used in screen specs when a tenant-level admin can configure settings, branding, roles, and users.
- `HR Admin`: workforce operations role inside a tenant.
- `Manager`: team-level approval and visibility role.
- `Employee`: self-service role.

## Design Decisions

- `DESIGN.md` is the canonical visual contract for future AI agents.
- Existing `docs/design/*` files remain supporting detail.
- The visual system is vendor-neutral and brand-neutral.
- VC Organics appears only as a tenant example.
- Tenant branding can override brand tokens but cannot override accessibility, semantic statuses, attendance flow order, or security-critical states.

## Implementation Ambiguity Resolved

- Employee-facing UX is simpler than admin UX.
- Admin UX may be data-dense but must remain visually quiet.
- Mobile attendance is the flagship flow and must optimize for completion under 10 seconds.
- Tables are desktop-first components; mobile screens use cards, sheets, and progressive disclosure unless controlled horizontal scrolling is unavoidable.

