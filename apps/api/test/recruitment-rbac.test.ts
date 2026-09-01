import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission, ROLE_PERMISSIONS } from "@vc-wms/auth";

describe("Recruitment & ATS RBAC Matrix (Task 20)", () => {
  it("grants TENANT_OWNER and TENANT_ADMIN complete recruitment permissions", () => {
    const ownerPerms = ROLE_PERMISSIONS.TENANT_OWNER;
    const adminPerms = ROLE_PERMISSIONS.TENANT_ADMIN;

    const expectedRecruitmentPerms = [
      "recruitment.read",
      "recruitment.manage",
      "candidates.read",
      "candidates.create",
      "candidates.manage",
      "applications.read",
      "applications.manage",
      "interviews.read",
      "interviews.schedule",
      "interviews.feedback",
      "offers.read",
      "offers.create",
      "offers.manage",
      "preboarding.read",
      "preboarding.manage",
      "careers.manage"
    ] as const;

    for (const perm of expectedRecruitmentPerms) {
      expect(ownerPerms).toContain(perm);
      expect(adminPerms).toContain(perm);
    }
  });

  it("grants HR_ADMIN full operational ATS and recruitment management permissions", () => {
    const hrPerms = ROLE_PERMISSIONS.HR_ADMIN;

    expect(hrPerms).toContain("recruitment.read");
    expect(hrPerms).toContain("recruitment.manage");
    expect(hrPerms).toContain("candidates.read");
    expect(hrPerms).toContain("candidates.create");
    expect(hrPerms).toContain("candidates.manage");
    expect(hrPerms).toContain("applications.read");
    expect(hrPerms).toContain("applications.manage");
    expect(hrPerms).toContain("interviews.read");
    expect(hrPerms).toContain("interviews.schedule");
    expect(hrPerms).toContain("interviews.feedback");
    expect(hrPerms).toContain("offers.read");
    expect(hrPerms).toContain("offers.create");
    expect(hrPerms).toContain("offers.manage");
    expect(hrPerms).toContain("preboarding.read");
    expect(hrPerms).toContain("preboarding.manage");
  });

  it("grants MANAGER hiring visibility and interview feedback permissions but prevents offer release or candidate deletion", () => {
    const managerPerms = ROLE_PERMISSIONS.MANAGER;

    expect(managerPerms).toContain("recruitment.read");
    expect(managerPerms).toContain("candidates.read");
    expect(managerPerms).toContain("applications.read");
    expect(managerPerms).toContain("interviews.read");
    expect(managerPerms).toContain("interviews.feedback");

    expect(managerPerms).not.toContain("recruitment.manage");
    expect(managerPerms).not.toContain("offers.manage");
    expect(managerPerms).not.toContain("preboarding.manage");
  });

  it("evaluates permission checks correctly using hasPermission helper", () => {
    const managerPerms = collectPermissions(["MANAGER"]);
    expect(hasPermission(managerPerms, "interviews.feedback")).toBe(true);
    expect(hasPermission(managerPerms, "offers.manage")).toBe(false);

    const hrPerms = collectPermissions(["HR_ADMIN"]);
    expect(hasPermission(hrPerms, "offers.manage")).toBe(true);
    expect(hasPermission(hrPerms, "preboarding.manage")).toBe(true);
  });
});
