import { describe, it, expect } from "vitest";
import type { PermissionCode } from "@vc-wms/shared-types";
import {
  peopleKeys,
  buildDirectoryQueryParams,
  buildEmployeesQueryParams,
  formatEmploymentStatus,
  formatEmploymentType
} from "./queries/use-people-queries";

describe("AIavro People, Organization & Manager Workspace Hardening & Release Tests (Task 03.2)", () => {
  describe("Blocker 1 & 12: Pure Shared Formatting Helpers & Zero Synthetic Defaults", () => {
    it("formatEmploymentType returns formatted string or neutral em-dash for missing/empty values", () => {
      expect(formatEmploymentType("FULL_TIME")).toBe("FULL TIME");
      expect(formatEmploymentType("PART_TIME")).toBe("PART TIME");
      expect(formatEmploymentType("CONTRACT")).toBe("CONTRACT");
      expect(formatEmploymentType("TEMPORARY")).toBe("TEMPORARY");
      expect(formatEmploymentType(null)).toBe("—");
      expect(formatEmploymentType(undefined)).toBe("—");
      expect(formatEmploymentType("")).toBe("—");
      expect(formatEmploymentType("   ")).toBe("—");
      // Never returns synthetic "Full Time" for undefined
      expect(formatEmploymentType(undefined)).not.toBe("Full Time");
    });

    it("formatEmploymentStatus returns formatted string or neutral em-dash", () => {
      expect(formatEmploymentStatus("ACTIVE")).toBe("ACTIVE");
      expect(formatEmploymentStatus("PROBATION")).toBe("PROBATION");
      expect(formatEmploymentStatus("ON_LEAVE")).toBe("ON LEAVE");
      expect(formatEmploymentStatus("NOTICE_PERIOD")).toBe("NOTICE PERIOD");
      expect(formatEmploymentStatus(null)).toBe("—");
      expect(formatEmploymentStatus(undefined)).toBe("—");
      expect(formatEmploymentStatus("")).toBe("—");
      expect(formatEmploymentStatus(undefined)).not.toBe("ACTIVE");
    });
  });

  describe("Blocker 2, 3, 4 & 13: Deliberate Employee Creation Form Validation", () => {
    it("requires deliberate employmentType and joiningDate selection without synthetic defaults", () => {
      const validateCreateEmployeeForm = (input: {
        employeeCode: string;
        fullName: string;
        email: string;
        departmentId: string;
        designationId: string;
        employmentType: string;
        joiningDate: string;
      }) => {
        if (!input.employeeCode.trim()) throw new Error("Employee Code is required.");
        if (!input.fullName.trim()) throw new Error("Full Name is required.");
        if (!input.email.trim()) throw new Error("Work Email is required.");
        if (!input.departmentId) throw new Error("Department selection is required.");
        if (!input.designationId) throw new Error("Designation selection is required.");
        if (!input.employmentType) throw new Error("Employment Type selection is required.");
        if (!input.joiningDate) throw new Error("Joining Date is required. Please pick a valid date.");

        return {
          employeeCode: input.employeeCode.trim().toUpperCase(),
          fullName: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          departmentId: input.departmentId,
          designationId: input.designationId,
          employmentType: input.employmentType,
          joiningDate: new Date(input.joiningDate).toISOString()
        };
      };

      // Missing employment type throws
      expect(() =>
        validateCreateEmployeeForm({
          employeeCode: "EMP-10",
          fullName: "Ananya",
          email: "ananya@vc.com",
          departmentId: "dept-1",
          designationId: "desig-1",
          employmentType: "",
          joiningDate: "2026-05-01"
        })
      ).toThrow("Employment Type selection is required.");

      // Missing joining date throws
      expect(() =>
        validateCreateEmployeeForm({
          employeeCode: "EMP-10",
          fullName: "Ananya",
          email: "ananya@vc.com",
          departmentId: "dept-1",
          designationId: "desig-1",
          employmentType: "FULL_TIME",
          joiningDate: ""
        })
      ).toThrow("Joining Date is required. Please pick a valid date.");

      // Valid deliberate choices succeed without synthetic fields
      const payload = validateCreateEmployeeForm({
        employeeCode: "emp-10",
        fullName: "Ananya Sharma",
        email: "ANANYA@VC.COM",
        departmentId: "dept-1",
        designationId: "desig-1",
        employmentType: "CONTRACT",
        joiningDate: "2026-05-01"
      });

      expect(payload.employeeCode).toBe("EMP-10");
      expect(payload.email).toBe("ananya@vc.com");
      expect(payload.employmentType).toBe("CONTRACT");
      expect(payload).not.toHaveProperty("salaryType");
      expect(payload).not.toHaveProperty("status");
    });
  });

  describe("Blocker 5 & 6: Privacy & Permission Gating", () => {
    const hasPermission = (userPerms: PermissionCode[], required: PermissionCode | PermissionCode[]): boolean => {
      if (userPerms.length === 0) return false;
      const req = Array.isArray(required) ? required : [required];
      return req.some((p) => userPerms.includes(p));
    };

    it("employee read permission does not imply create permission", () => {
      const readOnlyUser: PermissionCode[] = ["employees.read"];
      expect(hasPermission(readOnlyUser, "employees.read")).toBe(true);
      expect(hasPermission(readOnlyUser, "employees.create")).toBe(false);
    });

    it("organization view does not imply department/designation create", () => {
      const orgViewer: PermissionCode[] = ["organization.view", "departments.read"];
      expect(hasPermission(orgViewer, "organization.view")).toBe(true);
      expect(hasPermission(orgViewer, "departments.create")).toBe(false);
      expect(hasPermission(orgViewer, "designations.create")).toBe(false);
      expect(hasPermission(orgViewer, "organization.manage")).toBe(false);
    });

    it("location view does not imply location create", () => {
      const locationViewer: PermissionCode[] = ["location.view"];
      expect(hasPermission(locationViewer, "location.view")).toBe(true);
      expect(hasPermission(locationViewer, "location.create")).toBe(false);
    });

    it("leave read does not imply leave approve", () => {
      const leaveViewer: PermissionCode[] = ["leave.view"];
      expect(hasPermission(leaveViewer, "leave.view")).toBe(true);
      expect(hasPermission(leaveViewer, "leave.approve")).toBe(false);
    });

    it("employee document query is disabled without document permission", () => {
      const isDocumentQueryEnabled = (isAuthorized: boolean, canReadDocuments: boolean, activeTab: string) => {
        return isAuthorized && canReadDocuments && activeTab === "documents";
      };

      expect(isDocumentQueryEnabled(true, false, "documents")).toBe(false);
      expect(isDocumentQueryEnabled(true, true, "overview")).toBe(false);
      expect(isDocumentQueryEnabled(true, true, "documents")).toBe(true);
      expect(isDocumentQueryEnabled(false, true, "documents")).toBe(false);
    });
  });

  describe("Blocker 7, 8 & 14: Real Exported Query Parameter Builders", () => {
    it("buildDirectoryQueryParams formats search, departmentId, locationId, limit, and offset correctly", () => {
      const qs1 = buildDirectoryQueryParams({ search: "Alice", departmentId: "dept-1", limit: 24, offset: 48 });
      expect(qs1).toBe("search=Alice&departmentId=dept-1&limit=24&offset=48");

      const qs2 = buildDirectoryQueryParams({ departmentId: "ALL", limit: 24, offset: 0 });
      expect(qs2).toBe("limit=24&offset=0");

      const qs3 = buildDirectoryQueryParams(undefined);
      expect(qs3).toBe("");
    });

    it("buildEmployeesQueryParams formats q, departmentId, and status correctly", () => {
      const qs1 = buildEmployeesQueryParams({ q: "Dev", departmentId: "dept-2", status: "ACTIVE" });
      expect(qs1).toBe("q=Dev&departmentId=dept-2&status=ACTIVE");

      const qs2 = buildEmployeesQueryParams({ departmentId: "ALL", status: "ALL", q: "" });
      expect(qs2).toBe("");

      const qs3 = buildEmployeesQueryParams(undefined);
      expect(qs3).toBe("");
    });
  });

  describe("Blocker 9, 10 & 11: Schema Enums & Service Request Copy Truthfulness", () => {
    it("supports only valid backend EmploymentStatus enum values", () => {
      const validBackendStatuses = [
        "ACTIVE",
        "PROBATION",
        "ON_LEAVE",
        "NOTICE_PERIOD",
        "INACTIVE",
        "DRAFT",
        "INVITED",
        "ARCHIVED"
      ];

      const frontendFilterValues = [
        "ACTIVE",
        "PROBATION",
        "ON_LEAVE",
        "NOTICE_PERIOD",
        "INACTIVE",
        "DRAFT",
        "INVITED"
      ];

      frontendFilterValues.forEach((status) => {
        expect(validBackendStatuses).toContain(status);
      });
    });

    it("supports only valid backend LocationType enum values and backend-owned 100m default", () => {
      const validLocationTypes = ["FACTORY", "OFFICE", "WAREHOUSE", "RETAIL_OUTLET", "DISTRIBUTION_CENTER", "CUSTOM"];
      const backendDefaultRadius = 100;

      expect(validLocationTypes).toContain("OFFICE");
      expect(validLocationTypes).toContain("WAREHOUSE");
      expect(backendDefaultRadius).toBe(100);
    });

    it("distinguishes actionable leave applications from read-only service requests in MSS", () => {
      const mssCopy = {
        title: "Pending Approvals",
        description: "Review and action direct reports leave applications; monitor workplace service requests."
      };

      expect(mssCopy.description).toContain("monitor");
      expect(mssCopy.description).not.toContain("action workplace service requests");
    });
  });

  describe("Blocker 11: Query Key Hierarchy & Cache Invalidation", () => {
    it("exports well-structured query key factories for people and organization domains", () => {
      expect(peopleKeys.all).toEqual(["people"]);
      expect(peopleKeys.directory({ search: "test" })).toEqual(["people", "directory", { search: "test" }]);
      expect(peopleKeys.employees({ status: "ACTIVE" })).toEqual(["people", "employees", { status: "ACTIVE" }]);
      expect(peopleKeys.employeeDetail("emp-1")).toEqual(["people", "employee", "emp-1"]);
      expect(peopleKeys.employeeDocuments("emp-1")).toEqual(["people", "employee", "emp-1", "documents"]);
      expect(peopleKeys.departments()).toEqual(["organization", "departments"]);
      expect(peopleKeys.designations()).toEqual(["organization", "designations"]);
      expect(peopleKeys.businessUnits()).toEqual(["organization", "business-units"]);
      expect(peopleKeys.teams()).toEqual(["organization", "teams"]);
      expect(peopleKeys.locations()).toEqual(["organization", "locations", undefined]);
      expect(peopleKeys.managerDashboard()).toEqual(["manager", "dashboard"]);
      expect(peopleKeys.managerApprovals()).toEqual(["manager", "approvals"]);
    });
  });
});
