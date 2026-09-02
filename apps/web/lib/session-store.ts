"use client";

import { create } from "zustand";
import type { PermissionCode, TenantBrandingView } from "@vc-wms/shared-types";
import { decodePermissions, getAccessToken, setAccessToken } from "./auth-token";

interface SessionState {
  accessToken: string | null;
  tenantName: string;
  permissions: PermissionCode[];
  branding: TenantBrandingView | null;
  setSession: (accessToken: string, tenantName: string, permissions: PermissionCode[]) => void;
  setBranding: (branding: TenantBrandingView) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: getAccessToken(),
  tenantName: "VC Organics Workspace",
  permissions: decodePermissions(getAccessToken()),
  branding: null,
  setSession: (accessToken, tenantName, permissions) => {
    setAccessToken(accessToken);
    set({ accessToken, tenantName, permissions: permissions.length ? permissions : decodePermissions(accessToken) });
  },
  setBranding: (branding) => set({ branding, tenantName: branding.displayName }),
  clear: () => {
    setAccessToken(null);
    set({ accessToken: null, permissions: [], branding: null });
  }
}));
