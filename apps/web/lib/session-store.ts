"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import type { PermissionCode, TenantBrandingView } from "@vc-wms/shared-types";
import { decodePermissions, getAccessToken, setAccessToken } from "./auth-token";

export interface SessionState {
  accessToken: string | null;
  tenantName: string;
  permissions: PermissionCode[];
  branding: TenantBrandingView | null;
  isHydrated: boolean;
  setHydrated: () => void;
  setSession: (accessToken: string, tenantName: string, permissions: PermissionCode[]) => void;
  setBranding: (branding: TenantBrandingView) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: typeof window !== "undefined" ? getAccessToken() : null,
  tenantName: "VC Organics Workspace",
  permissions: typeof window !== "undefined" ? decodePermissions(getAccessToken()) : [],
  branding: null,
  isHydrated: typeof window !== "undefined",
  setHydrated: () => set({ isHydrated: true }),
  setSession: (accessToken, tenantName, permissions) => {
    setAccessToken(accessToken);
    set({
      accessToken,
      tenantName,
      permissions: permissions.length ? permissions : decodePermissions(accessToken),
      isHydrated: true
    });
  },
  setBranding: (branding) => set({ branding, tenantName: branding.displayName }),
  clear: () => {
    setAccessToken(null);
    set({ accessToken: null, permissions: [], branding: null, isHydrated: true });
  }
}));

/**
 * Fail-closed permission gate hook.
 * Distinguishes:
 * 1. isLoading (session / token hydration not ready)
 * 2. isAuthorized (token exists and at least one required permission is explicitly present)
 * 3. isUnauthorized (session is ready but required permission is missing or permissions array is empty)
 */
export function usePermissionGate(requiredPermissions: PermissionCode | PermissionCode[]) {
  const [mounted, setMounted] = useState(false);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const permissions = useSessionStore((state) => state.permissions);
  const accessToken = useSessionStore((state) => state.accessToken);

  useEffect(() => {
    setMounted(true);
  }, []);

  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  const isReady = mounted && isHydrated;
  const isAuthorized = isReady && Boolean(accessToken) && required.some((p) => permissions.includes(p));

  return {
    isLoading: !isReady,
    isAuthorized,
    hasToken: Boolean(accessToken),
    permissions
  };
}

/**
 * Action-level permission check hook.
 * Returns true only if session is hydrated, has a valid token, and contains the required permission.
 * Fails closed on unhydrated / missing permission.
 */
export function useHasPermission(requiredPermissions: PermissionCode | PermissionCode[]): boolean {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const permissions = useSessionStore((state) => state.permissions);
  const accessToken = useSessionStore((state) => state.accessToken);

  if (!isHydrated || !accessToken) return false;
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  return required.some((p) => permissions.includes(p));
}
