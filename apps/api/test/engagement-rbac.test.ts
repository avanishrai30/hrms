import { describe, expect, it } from "vitest";
import { ROLE_PERMISSIONS } from "@vc-wms/auth";

describe("Engagement RBAC Permissions", () => {
  it("authorizes TENANT_OWNER and HR_ADMIN for full engagement management and AI", () => {
    const ownerPerms = ROLE_PERMISSIONS["TENANT_OWNER"];
    const hrPerms = ROLE_PERMISSIONS["HR_ADMIN"];

    expect(ownerPerms).toContain("engagement.read");
    expect(ownerPerms).toContain("engagement.manage");
    expect(ownerPerms).toContain("engagement.survey");
    expect(ownerPerms).toContain("engagement.recognition");
    expect(ownerPerms).toContain("engagement.rewards");
    expect(ownerPerms).toContain("engagement.analytics");
    expect(ownerPerms).toContain("engagement.ai");

    expect(hrPerms).toContain("engagement.read");
    expect(hrPerms).toContain("engagement.manage");
    expect(hrPerms).toContain("engagement.ai");
  });

  it("authorizes MANAGER for surveys, recognition, rewards, and analytics", () => {
    const managerPerms = ROLE_PERMISSIONS["MANAGER"];

    expect(managerPerms).toContain("engagement.read");
    expect(managerPerms).toContain("engagement.survey");
    expect(managerPerms).toContain("engagement.recognition");
    expect(managerPerms).toContain("engagement.rewards");
    expect(managerPerms).toContain("engagement.analytics");
    expect(managerPerms).not.toContain("engagement.manage");
  });

  it("authorizes EMPLOYEE for self-service surveys, recognition, and reward redemption", () => {
    const employeePerms = ROLE_PERMISSIONS["EMPLOYEE"];

    expect(employeePerms).toContain("engagement.read");
    expect(employeePerms).toContain("engagement.survey");
    expect(employeePerms).toContain("engagement.recognition");
    expect(employeePerms).toContain("engagement.rewards");
    expect(employeePerms).not.toContain("engagement.manage");
    expect(employeePerms).not.toContain("engagement.analytics");
  });
});
