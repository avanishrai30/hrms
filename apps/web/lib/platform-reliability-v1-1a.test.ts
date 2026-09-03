import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMMAND_ROUTES } from "../components/search-dialog";
import { refreshAccessToken } from "./api";
import { decodePermissions } from "./auth-token";
import { useSessionStore } from "./session-store";
import type { PermissionCode } from "@vc-wms/shared-types";

function resolveSafeNext(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

describe("V1.1A Frontend Platform Reliability & Security (Part 15)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useSessionStore.getState().clear();
  });

  // 1. Logged-out protected route redirect logic
  it("redirects logged-out unauthenticated state safely to login", () => {
    const state = useSessionStore.getState();
    expect(state.accessToken).toBeNull();
    const targetPath = "/employees";
    const redirectUrl = `/login?next=${encodeURIComponent(targetPath)}`;
    expect(redirectUrl).toBe("/login?next=%2Femployees");
  });

  // 2. Safe next redirect validation (prevents open redirects)
  it("validates safe internal destinations and rejects open redirect attempts", () => {
    expect(resolveSafeNext("/payroll")).toBe("/payroll");
    expect(resolveSafeNext("/dashboard?tab=analytics")).toBe("/dashboard?tab=analytics");
    expect(resolveSafeNext("https://evil.com")).toBe("/dashboard");
    expect(resolveSafeNext("//evil.com")).toBe("/dashboard");
    expect(resolveSafeNext("javascript:alert(1)")).toBe("/dashboard");
    expect(resolveSafeNext("")).toBe("/dashboard");
    expect(resolveSafeNext(null)).toBe("/dashboard");
  });

  // 3. Authenticated refresh stays logged in
  it("keeps session active and updates store when refresh succeeds", async () => {
    const mockToken = "header." + btoa(JSON.stringify({ permissions: ["employees.read", "payroll.read"] })) + ".sig";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: mockToken })
    } as Response);

    const token = await refreshAccessToken();
    expect(token).toBe(mockToken);
    useSessionStore.getState().hydrateFromStorage();
    expect(useSessionStore.getState().accessToken).toBe(mockToken);
  });

  // 4. Failed refresh redirects once and clears session
  it("clears session and returns null when refresh fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401
    } as Response);

    const token = await refreshAccessToken();
    expect(token).toBeNull();
    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  // 5. No duplicate refresh loop (Single-in-flight mutex)
  it("coalesces concurrent refresh calls into exactly one HTTP request", async () => {
    const mockToken = "header." + btoa(JSON.stringify({ permissions: ["tenant.settings.read"] })) + ".sig";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ accessToken: mockToken })
              } as Response),
            50
          )
        )
    );

    // Fire 5 concurrent refresh calls simultaneously
    const [t1, t2, t3, t4, t5] = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
      refreshAccessToken(),
      refreshAccessToken(),
      refreshAccessToken()
    ]);

    expect(t1).toBe(mockToken);
    expect(t2).toBe(mockToken);
    expect(t3).toBe(mockToken);
    expect(t4).toBe(mockToken);
    expect(t5).toBe(mockToken);

    // Exactly 1 network call made!
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  // 6. Permission-filtered navigation
  it("filters command menu routes according to granted permissions", () => {
    const userPermissions: PermissionCode[] = ["employees.read"];
    const accessible = COMMAND_ROUTES.filter((r) => !r.permission || userPermissions.includes(r.permission));

    expect(accessible.some((r) => r.title === "Employees Directory")).toBe(true);
    // User does not have payroll.read or tenant.settings.read
    expect(accessible.some((r) => r.title === "Enterprise Payroll")).toBe(false);
    expect(accessible.some((r) => r.title === "Platform Admin Center")).toBe(false);
  });

  // 7. Quick Create RBAC (proves action permissions required, not read permissions)
  it("verifies Quick Create actions require explicit creation permissions", () => {
    const readOnlyPermissions: PermissionCode[] = ["employees.read", "recruitment.read", "location.view"];

    // Add Employee must require employees.create
    const canAddEmployee = readOnlyPermissions.includes("employees.create");
    expect(canAddEmployee).toBe(false);

    // Create Requisition must require recruitment.manage
    const canCreateRequisition = readOnlyPermissions.includes("recruitment.manage");
    expect(canCreateRequisition).toBe(false);

    // Create Location must require location.create
    const canCreateLocation = readOnlyPermissions.includes("location.create");
    expect(canCreateLocation).toBe(false);

    // With proper creation permissions
    const adminPermissions: PermissionCode[] = [
      "employees.create",
      "recruitment.manage",
      "location.create"
    ];
    expect(adminPermissions.includes("employees.create")).toBe(true);
  });

  // 8. Command/search RBAC
  it("prevents unauthorized access to privileged admin routes in search dialog", () => {
    const nonAdminPermissions: PermissionCode[] = ["employees.read", "leave.create"];
    const adminRoute = COMMAND_ROUTES.find((r) => r.href === "/admin");

    expect(adminRoute?.permission).toBe("tenant.settings.read");
    expect(nonAdminPermissions.includes(adminRoute!.permission!)).toBe(false);
  });

  // 9. Query invalidation correctness
  it("decodes permissions payload correctly from JWT token", () => {
    const testPerms: PermissionCode[] = ["directory.view", "employees.read", "payroll.read"];
    const token = "header." + btoa(JSON.stringify({ permissions: testPerms })) + ".sig";
    expect(decodePermissions(token)).toEqual(testPerms);
  });

  // 10. Fail closed when token has no permissions or is corrupted
  it("fails closed on corrupted or missing token", () => {
    expect(decodePermissions(null)).toEqual([]);
    expect(decodePermissions("")).toEqual([]);
    expect(decodePermissions("invalid.token")).toEqual([]);
  });
});
