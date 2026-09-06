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

  it("blocks non-admin users from submitting leave for another employee", () => {
    expect(controllerCode).toContain('if (employeeId && !tenant.permissions.includes("leave.manage"))');
    expect(controllerCode).toContain("You can only submit leave requests for your own employee profile.");
  });

  it("requires leave.manage for tenant-wide leave surfaces", () => {
    expect(controllerCode).toContain("Tenant-wide leave requests require leave.manage.");
    expect(controllerCode).toContain("Tenant-wide leave calendar requires leave.manage.");
    expect(controllerCode).toContain("You can only view leave balances for your own employee profile.");
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

  it("denies self-approval server-side", () => {
    const serviceCode = readFileSync(
      new URL("../src/modules/leaves/leaves.service.ts", import.meta.url),
      "utf8"
    );
    expect(serviceCode).toContain("reviewerMembership?.employeeId === request.employeeId");
    expect(serviceCode).toContain("You cannot approve or reject your own leave request.");
  });

  it("requires managers to have a linked employee profile before reviewing direct reports", () => {
    const serviceCode = readFileSync(
      new URL("../src/modules/leaves/leaves.service.ts", import.meta.url),
      "utf8"
    );
    expect(serviceCode).toContain("!reviewerMembership?.employeeId || request.employee.managerEmployeeId !== reviewerMembership.employeeId");
    expect(serviceCode).toContain("You can only review leave requests for your direct reports.");
  });
});
