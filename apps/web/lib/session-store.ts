"use client";

import { create } from "zustand";
import type { PermissionCode, TenantBrandingView } from "@vc-wms/shared-types";

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
  accessToken: null,
  tenantName: "Workspace",
  permissions: [],
  branding: null,
  setSession: (accessToken, tenantName, permissions) => set({ accessToken, tenantName, permissions }),
  setBranding: (branding) => set({ branding, tenantName: branding.displayName }),
  clear: () => set({ accessToken: null, permissions: [], branding: null })
}));

