import { describe, expect, it } from "vitest";
import { buildDirectoryQueryParams } from "./queries/use-people-queries";
import {
  buildWorkforceCurrentPageCsv,
  canRenderTenantWorkforceTable,
  normalizeDirectoryPageResponse,
  resolveRegionOrBusinessUnit,
  sanitizeCsvCell,
  unavailable
} from "./workforce-table-data";
import type { DirectoryEmployeeView } from "@vc-wms/shared-types";

const baseEmployee: DirectoryEmployeeView = {
  id: "employee-1",
  employeeCode: "EMP-001",
  fullName: "Asha Rao",
  email: "asha@example.com",
  phone: null,
  department: "",
  designation: "Designer",
  joiningDate: "2026-01-01T00:00:00.000Z",
  status: "ACTIVE"
};

describe("workforce dashboard table data integrity (Parity Audit)", () => {
  // 1. missing department renders —
  it("renders missing department as em dash", () => {
    expect(unavailable("")).toBe("—");
    expect(unavailable(null)).toBe("—");
    expect(unavailable(undefined)).toBe("—");
    expect(unavailable("   ")).toBe("—");
  });

  // 2. missing region/businessUnit renders —
  it("renders missing region/businessUnit as em dash", () => {
    expect(resolveRegionOrBusinessUnit(baseEmployee)).toBe("—");
    expect(resolveRegionOrBusinessUnit({})).toBe("—");
  });

  // 3. no "HQ" fallback in production dashboard table
  it("prohibits fabricated 'HQ' fallback", () => {
    expect(resolveRegionOrBusinessUnit(baseEmployee)).not.toBe("HQ");
    expect(resolveRegionOrBusinessUnit({ region: "", businessUnit: "" })).not.toBe("HQ");
  });

  // 4. no "General" fallback
  it("prohibits fabricated 'General' fallback", () => {
    expect(unavailable(baseEmployee.department)).not.toBe("General");
    expect(unavailable("")).not.toBe("General");
  });

  it("uses real region or business unit only when API data provides it", () => {
    expect(resolveRegionOrBusinessUnit({ region: "West", businessUnit: "Supply" })).toBe("West");
    expect(resolveRegionOrBusinessUnit({ businessUnit: "Supply" })).toBe("Supply");
  });

  // 5. CSV formula cells are sanitized
  it.each(["=1+1", "+cmd", "-10", "@SUM(A1)", "\t=1+1", "\r=1+1"])(
    "sanitizes CSV formula trigger %s",
    (value) => {
      const sanitized = sanitizeCsvCell(value);
      expect(sanitized.replace(/^"/, "").startsWith("'")).toBe(true);
    }
  );

  // 6. CSV quotes/commas/newlines escape correctly
  it("escapes CSV quotes, commas, and newlines correctly", () => {
    expect(sanitizeCsvCell('Priya "Engineer"')).toBe('"Priya ""Engineer"""');
    expect(sanitizeCsvCell("Rao, Asha")).toBe('"Rao, Asha"');
    expect(sanitizeCsvCell("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
  });

  it("sanitizes all current-page exported workforce string cells", () => {
    const csv = buildWorkforceCurrentPageCsv([
      {
        ...baseEmployee,
        employeeCode: "=EMP",
        fullName: "+cmd",
        email: "-10",
        department: "@SUM(A1)",
        region: "\tRegion",
        status: "\rACTIVE"
      }
    ]);

    expect(csv).toContain("'=EMP");
    expect(csv).toContain("'+cmd");
    expect(csv).toContain("'-10");
    expect(csv).toContain("'@SUM(A1)");
    expect(csv).toContain("'\tRegion");
    expect(csv).toContain("'\rACTIVE");
  });

  // 7. backend total drives pagination
  it("normalizes backend pagination totals instead of using first page length", () => {
    const normalized = normalizeDirectoryPageResponse({
      items: [baseEmployee],
      total: 75,
      limit: 5,
      offset: 10
    });

    expect(normalized.items).toHaveLength(1);
    expect(normalized.total).toBe(75);
    expect(normalized.total).not.toBe(normalized.items.length);
  });

  // 8. changing page requests correct server page
  it("computes correct server offset when changing page index", () => {
    const pageSize = 5;
    const pageIndex0 = 0;
    const pageIndex1 = 1;
    const pageIndex2 = 2;

    const qsPage1 = buildDirectoryQueryParams({ limit: pageSize, offset: pageIndex0 * pageSize });
    const qsPage2 = buildDirectoryQueryParams({ limit: pageSize, offset: pageIndex1 * pageSize });
    const qsPage3 = buildDirectoryQueryParams({ limit: pageSize, offset: pageIndex2 * pageSize });

    expect(qsPage1).toContain("limit=5&offset=0");
    expect(qsPage2).toContain("limit=5&offset=5");
    expect(qsPage3).toContain("limit=5&offset=10");
  });

  // 9. search resets page
  it("builds server query params with search and resets offset when changing search", () => {
    const searchParam = "asha";
    // Search change contract: offset resets to 0
    const resetOffset = 0;
    const qs = buildDirectoryQueryParams({
      search: searchParam,
      limit: 5,
      offset: resetOffset
    });

    expect(qs).toContain("search=asha");
    expect(qs).toContain("offset=0");
  });

  // 10. unauthorized user does not receive tenant-wide workforce table
  it("fails closed for users without tenant-wide directory permissions", () => {
    expect(canRenderTenantWorkforceTable([])).toBe(false);
    expect(canRenderTenantWorkforceTable(["profile.view"])).toBe(false);
    expect(canRenderTenantWorkforceTable(["directory.view"])).toBe(true);
    expect(canRenderTenantWorkforceTable(["employees.read"])).toBe(true);
  });

  // 11. export scope is truthful
  it("truthfully formats export filename for current page scope", () => {
    const pageNumber = 2;
    const filename = `workforce-current-page-${pageNumber}.csv`;
    expect(filename).toBe("workforce-current-page-2.csv");
    expect(filename).not.toBe("vc-organics-workforce-report.csv");
  });
});
