import type { PermissionCode, PlatformRole, TenantContext, TenantRoleCode } from "@vc-wms/shared-types";

export interface TenantJwtPayload extends TenantContext {
  sub: string;
  typ: "tenant";
}

export interface PlatformJwtPayload {
  sub: string;
  typ: "platform";
  platformRole: PlatformRole;
}

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
  ip?: string;
  user?: TenantJwtPayload;
  platformUser?: PlatformJwtPayload;
}

export interface PermissionMetadata {
  permissions: PermissionCode[];
  platform?: boolean;
}

export interface RoleAssignmentInput {
  roles: TenantRoleCode[];
}

