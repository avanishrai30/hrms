import { ForbiddenException } from "@nestjs/common";
import type { AuthenticatedRequest } from "./request-context.js";

export function requireTenantContext(request: AuthenticatedRequest) {
  if (!request.user?.tenantId) {
    throw new ForbiddenException("Tenant context is required.");
  }
  return request.user;
}

