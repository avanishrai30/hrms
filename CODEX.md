# Codex Guide

## Current State

This repository contains the documentation-first planning package for VC-WMS. The platform is now a shared-database, tenant-aware SaaS product with VC Organics as Tenant #1. The brief explicitly requires documentation approval before generating application code.

## Recommended Next Task

After approval, scaffold the monorepo using the documented structure:

- Next.js 16 web app
- NestJS API
- FastAPI face-service
- Shared packages
- Tenant-aware Prisma schema
- Docker Compose for local development

## Guardrails

- Do not connect to or import from the billing platform.
- Do not create tenant-owned data models without `tenant_id`.
- Do not write tenant-owned repository queries without tenant context.
- Do not create cache keys, queue jobs, storage object keys, audit logs, or reports without tenant scope.
- Do not hardcode secrets.
- Do not implement attendance without both geo-fence and face verification checks.
- Do not store face images or embeddings without following the security architecture.
- Do not make UI components responsible for salary, leave, attendance, or RBAC decisions.
