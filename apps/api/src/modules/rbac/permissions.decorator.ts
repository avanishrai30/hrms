import { SetMetadata } from "@nestjs/common";
import type { PermissionCode } from "@vc-wms/shared-types";

export const PERMISSIONS_KEY = Symbol("permissions");

export function RequirePermissions(...permissions: PermissionCode[]) {
  return SetMetadata(PERMISSIONS_KEY, permissions);
}

export const PLATFORM_KEY = Symbol("platform");

export function RequirePlatform() {
  return SetMetadata(PLATFORM_KEY, true);
}

export const IS_PUBLIC_KEY = Symbol("isPublic");

export function Public() {
  return SetMetadata(IS_PUBLIC_KEY, true);
}
