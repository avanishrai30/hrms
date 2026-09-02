# AI Architecture

AIavro AI capabilities sit behind the authenticated backend. Frontend clients never call a model runtime directly.

## Boundary

User request flows through:

1. Authenticated session
2. Server-derived tenant context
3. RBAC permission context
4. AI orchestration service
5. Prompt guardrails and policy checks
6. Tenant-scoped retrieval and tool invocation
7. Shared model runtime
8. Response validation and audit logging

## Model Runtime

The shared model runtime is infrastructure, not a tenant data store. Tenant context, retrieved documents, tool calls, memory, and generated artifacts are isolated above the model.

## Tooling

AI tools must independently validate user, tenant, permission, and record scope. Model-generated tenant IDs are never trusted.

## Deployment Note

Do not deploy a local LLM runtime on the production VPS until the UI/application stabilization, resource measurement, and service boundary work are complete.

## Frontend Session Note

AIavro frontend requests must attach the short-lived access token as a bearer token because the NestJS RBAC guard authorizes protected endpoints from the `Authorization` header. The HttpOnly refresh cookie is used to recover a new access token on protected 401 responses.
