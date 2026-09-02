import { afterEach, describe, expect, it, vi } from "vitest";
import { loadDashboard, roleLabel, statusTone } from "./dashboard-data";
import { setAccessToken } from "./auth-token";

describe("dashboard data normalization", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
  });

  it("returns partial dashboard data with unavailable source labels", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ record: null, canCheckIn: true, canCheckOut: false }), { status: 200 }))
      .mockResolvedValueOnce(new Response("Forbidden", { status: 403 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ requests: [{ id: "leave-1", status: "PENDING_MANAGER" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "announcement-1", title: "Welcome" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ employees: [{ id: "employee-1" }, { id: "employee-2" }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadDashboard()).resolves.toMatchObject({
      leaveBalances: [],
      leaveRequests: [{ id: "leave-1", status: "PENDING_MANAGER" }],
      employeeCount: 2,
      unavailable: ["Leave balances"]
    });
  });

  it("maps permissions and statuses into stable UI labels", () => {
    expect(roleLabel(["employees.read"])).toBe("HR workspace");
    expect(roleLabel(["approvals.action"])).toBe("Manager workspace");
    expect(statusTone("PENDING_MANAGER")).toBe("warning");
    expect(statusTone("REJECTED")).toBe("danger");
  });
});
