import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Leave RBAC Enforcement", () => {
  const controllerCode = readFileSync(
    new URL("../src/modules/leaves/leaves.controller.ts", import.meta.url),
    "utf8"
  );

  it("enforces leave.view permission on read endpoints", () => {
    expect(controllerCode).toContain('@RequirePermissions("leave.view")\n  async listLeaveTypes');
    expect(controllerCode).toContain('@RequirePermissions("leave.view")\n  async getMyBalances');
    expect(controllerCode).toContain('@RequirePermissions("leave.view")\n  async listLeaveRequests');
    expect(controllerCode).toContain('@RequirePermissions("leave.view")\n  async getCalendar');
  });

  it("enforces leave.create on leave request submission", () => {
    expect(controllerCode).toContain('@RequirePermissions("leave.create")\n  async createLeaveRequest');
  });

  it("enforces leave.approve on request approvals", () => {
    expect(controllerCode).toContain('@RequirePermissions("leave.approve")\n  async approveRequest');
    expect(controllerCode).toContain('@RequirePermissions("leave.approve")\n  async rejectRequest');
  });

  it("enforces leave.cancel on cancellation", () => {
    expect(controllerCode).toContain('@RequirePermissions("leave.cancel")\n  async cancelRequest');
  });

  it("enforces leave.manage on policy, balance adjustment, and holiday endpoints", () => {
    expect(controllerCode).toContain('@RequirePermissions("leave.manage")\n  async createLeaveType');
    expect(controllerCode).toContain('@RequirePermissions("leave.manage")\n  async updatePolicy');
    expect(controllerCode).toContain('@RequirePermissions("leave.manage")\n  async adjustBalance');
    expect(controllerCode).toContain('@RequirePermissions("leave.manage")\n  async createHoliday');
  });
});
