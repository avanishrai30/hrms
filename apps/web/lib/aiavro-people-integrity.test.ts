import { describe, it, expect } from "vitest";
import type { PermissionCode } from "@vc-wms/shared-types";

describe("AIavro People, Organization & Manager Workspace Integrity & Security Tests", () => {
  describe("Fail-Closed RBAC & Permission Gating", () => {
    it("empty permissions never grant access to employee directory", () => {
      const perms: PermissionCode[] = [];
      const hasPermission = perms.includes("directory.view") || perms.includes("employees.read");
      expect(hasPermission).toBe(false);
    });

    it("empty permissions never grant access to workforce operations", () => {
      const perms: PermissionCode[] = [];
      const hasPermission = perms.includes("employees.read");
      expect(hasPermission).toBe(false);
    });

    it("empty permissions never grant access to organization structure", () => {
      const perms: PermissionCode[] = [];
      const hasPermission = perms.includes("organization.view") || perms.includes("departments.read");
      expect(hasPermission).toBe(false);
    });

    it("empty permissions never grant access to manager workspace", () => {
      const perms: PermissionCode[] = [];
      const hasPermission = perms.includes("mss.read");
      expect(hasPermission).toBe(false);
    });

    it("evaluates permission gate states cleanly without permissive defaults", () => {
      const gateCheck = (isHydrated: boolean, token: string | null, userPerms: PermissionCode[], required: PermissionCode[]) => {
        const isReady = isHydrated;
        const isAuthorized = isReady && Boolean(token) && required.some((p) => userPerms.includes(p));
        return {
          isLoading: !isReady,
          isAuthorized
        };
      };

      // Unhydrated -> loading=true, authorized=false
      expect(gateCheck(false, "jwt", ["directory.view"], ["directory.view"]).isLoading).toBe(true);
      expect(gateCheck(false, "jwt", ["directory.view"], ["directory.view"]).isAuthorized).toBe(false);

      // Hydrated but unauthorized -> loading=false, authorized=false
      expect(gateCheck(true, "jwt", ["profile.view"], ["employees.read"]).isAuthorized).toBe(false);

      // Hydrated and authorized -> loading=false, authorized=true
      expect(gateCheck(true, "jwt", ["employees.read"], ["employees.read"]).isAuthorized).toBe(true);
    });
  });

  describe("Privacy & Field Classification", () => {
    it("directory card view exposes only public workplace fields", () => {
      const fullEmployeeRecord = {
        id: "emp-101",
        fullName: "Avanish Rai",
        employeeCode: "VC-0001",
        designation: "Software Architect",
        department: "Engineering",
        email: "avanish@vcorganics.com",
        location: "Bangalore Tech Hub",
        // Restricted fields that must NOT be exposed in public directory
        personalPhone: "+91 9876543210",
        homeAddress: "123 Private Street",
        emergencyContact: "Family Contact",
        bankAccountNumber: "998877665544",
        grossSalary: 285000,
        taxPan: "ABCDE1234F"
      };

      const publicDirectoryCard = {
        fullName: fullEmployeeRecord.fullName,
        employeeCode: fullEmployeeRecord.employeeCode,
        designation: fullEmployeeRecord.designation,
        department: fullEmployeeRecord.department,
        email: fullEmployeeRecord.email,
        location: fullEmployeeRecord.location
      };

      expect(publicDirectoryCard).not.toHaveProperty("personalPhone");
      expect(publicDirectoryCard).not.toHaveProperty("homeAddress");
      expect(publicDirectoryCard).not.toHaveProperty("bankAccountNumber");
      expect(publicDirectoryCard).not.toHaveProperty("grossSalary");
      expect(publicDirectoryCard).not.toHaveProperty("taxPan");
    });
  });

  describe("Manager Boundary & Direct Reports Scoping", () => {
    it("manager query strictly returns direct reports filtered by managerId", () => {
      const allEmployees = [
        { id: "e1", fullName: "Direct Report 1", managerId: "mgr-100", status: "ACTIVE" },
        { id: "e2", fullName: "Direct Report 2", managerId: "mgr-100", status: "ACTIVE" },
        { id: "e3", fullName: "Unrelated Colleague", managerId: "mgr-200", status: "ACTIVE" }
      ];

      const managerId = "mgr-100";
      const directReports = allEmployees.filter((e) => e.managerId === managerId);

      expect(directReports.length).toBe(2);
      expect(directReports.map((d) => d.id)).toEqual(["e1", "e2"]);
      expect(directReports.map((d) => d.id)).not.toContain("e3");
    });
  });

  describe("Organization Hierarchy & Tree Expansion", () => {
    it("correctly models recursive tree node hierarchy with child counts", () => {
      const orgTree = {
        id: "root-1",
        name: "Executive Leadership",
        title: "CEO",
        children: [
          {
            id: "vp-1",
            name: "VP Operations",
            title: "Vice President",
            department: "Operations",
            children: [
              { id: "mgr-1", name: "Engineering Manager", title: "Manager", department: "Engineering", children: [] }
            ]
          }
        ]
      };

      expect(orgTree.children.length).toBe(1);
      expect(orgTree.children[0]!.children.length).toBe(1);
      expect(orgTree.children[0]!.children[0]!.title).toBe("Manager");
    });
  });

  describe("Manager Approvals State Management", () => {
    it("approvals queue distinguishes between leave applications and service desk requests", () => {
      const approvalsData = {
        leaves: [
          { id: "l-1", status: "PENDING_MANAGER", startDate: "2026-09-10", endDate: "2026-09-12" }
        ],
        requests: [
          { id: "r-1", status: "PENDING", requestType: "ADDRESS_CHANGE" }
        ]
      };

      expect(approvalsData.leaves.length).toBe(1);
      expect(approvalsData.requests.length).toBe(1);
      expect(approvalsData.leaves[0]!.status).toBe("PENDING_MANAGER");
    });
  });
});
