# VC Organics Workforce Management Platform

VC-WMS is an independent multi-tenant SaaS workforce management platform. VC Organics is Tenant #1. The platform is separate from the existing VC Organics billing system and uses its own API, authentication, deployment units, storage, and operational controls.

## Scope

- Employee management
- Tenant management
- Tenant settings and branding
- GPS and face verified attendance
- Geo-fencing
- Leave management
- Attendance-driven salary calculation
- Payroll foundation
- Audit logs
- Reports and analytics
- Tenant-scoped role based access control
- Mobile-first Progressive Web App

## Target Architecture

- `apps/web`: Next.js PWA
- `apps/api`: NestJS REST API
- `apps/face-service`: FastAPI face verification service
- `packages/ui`: Shared UI primitives
- `packages/shared-types`: Shared TypeScript contracts
- `packages/auth`: Shared auth and RBAC helpers
- `packages/utils`: Shared utilities
- `infra`: Docker, Nginx, PostgreSQL, Redis, MinIO, monitoring assets
- `docs`: Product, architecture, API, workflow, security, and deployment documentation

## Development Gate

The project brief requires documentation approval before code generation. The current repository state contains the planning and architecture package needed for review.

The current architecture is shared database plus `tenant_id`. All APIs, services, repositories, caches, queues, storage paths, audit logs, and reports must enforce tenant boundaries.

## Primary Documents

- [PRD](docs/prd/PRD.md)
- [Architecture](docs/architecture/Architecture.md)
- [Database Schema](docs/architecture/DatabaseSchema.md)
- [API Specification](docs/api/API-Specification.md)
- [Attendance Rules](docs/workflows/AttendanceRules.md)
- [Salary Rules](docs/workflows/SalaryRules.md)
- [Security Architecture](docs/architecture/SecurityArchitecture.md)
- [Deployment Guide](docs/architecture/DeploymentGuide.md)
- [Tenant Lifecycle](docs/architecture/TenantLifecycle.md)
- [Subscription Plans](docs/architecture/SubscriptionPlans.md)
- [Feature Flags](docs/architecture/FeatureFlags.md)
- [White Label Architecture](docs/architecture/WhiteLabelArchitecture.md)
- [Tenant Onboarding](docs/architecture/TenantOnboarding.md)
- [Platform Administration](docs/architecture/PlatformAdministration.md)
- [SaaS Metrics](docs/architecture/SaaSMetrics.md)
- [Tenant Isolation Strategy](docs/architecture/TenantIsolationStrategy.md)
- [Brand System](docs/design/BrandSystem.md)
- [Color System](docs/design/ColorSystem.md)
- [Typography](docs/design/Typography.md)
- [Spacing System](docs/design/SpacingSystem.md)
- [Motion System](docs/design/MotionSystem.md)
- [Component Library](docs/design/ComponentLibrary.md)
- [Dashboard UX](docs/design/DashboardUX.md)
- [Attendance UX](docs/design/AttendanceUX.md)
- [Employee UX](docs/design/EmployeeUX.md)
- [Mobile UX](docs/design/MobileUX.md)
- [Design Tokens](docs/design/DesignTokens.md)
- [Accessibility](docs/design/Accessibility.md)
- [Task 05 Validation Decision](docs/decisions/0001-task-05-validation-and-design-decisions.md)
- [Screen Specifications](docs/screens)
- [Command System](docs/screens/CommandSystem.md)
