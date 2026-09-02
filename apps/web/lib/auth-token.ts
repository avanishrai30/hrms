import type { PermissionCode } from "@vc-wms/shared-types";

const STORAGE_KEY = "aiavro.accessToken";

interface TenantTokenPayload {
  permissions?: PermissionCode[];
}

let accessToken: string | null = null;

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof window === "undefined") return null;
  accessToken = window.sessionStorage.getItem(STORAGE_KEY);
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === "undefined") return;
  if (token) {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function decodePermissions(token: string | null): PermissionCode[] {
  if (!token) return [];
  const [, payload] = token.split(".");
  if (!payload) return [];
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(globalThis.atob(normalized)) as TenantTokenPayload;
    return Array.isArray(decoded.permissions) ? decoded.permissions : [];
  } catch {
    return [];
  }
}
