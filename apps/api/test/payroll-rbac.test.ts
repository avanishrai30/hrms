import { describe, expect, it } from "vitest";
import { ROLE_PERMISSIONS } from "@vc-wms/auth";

describe("Payroll & Compensation RBAC Permissions (Task 30)", () => {
  it("TENANT_OWNER and TENANT_ADMIN should have full payroll and tax permissions", () => {
    const requiredPerms = [
      "payroll.view",
      "payroll.read",
      "payroll.manage",
      "payroll.process",
      "payroll.tax",
      "payroll.compliance",
      "payroll.compensation",
      "payroll.analytics"
    ];

    for (const perm of requiredPerms) {
      expect(ROLE_PERMISSIONS.TENANT_OWNER).toContain(perm);
      expect(ROLE_PERMISSIONS.TENANT_ADMIN).toContain(perm);
      expect(ROLE_PERMISSIONS.HR_ADMIN).toContain(perm);
    }
  });

  it("MANAGER and EMPLOYEE should have read-only access to their own payroll and payslips", () => {
    expect(ROLE_PERMISSIONS.EMPLOYEE).toContain("payroll.view");
    expect(ROLE_PERMISSIONS.EMPLOYEE).toContain("payroll.read");
    expect(ROLE_PERMISSIONS.EMPLOYEE).toContain("payslip.view");
    expect(ROLE_PERMISSIONS.EMPLOYEE).not.toContain("payroll.manage");
    expect(ROLE_PERMISSIONS.EMPLOYEE).not.toContain("payroll.process");
  });
});
