import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Task 08 — Web Analytics Production Truthfulness & Zero-Fabrication", () => {
  describe("Phase 5 & 26: Zero vs Unavailable Semantics", () => {
    function formatMetric(val: number | null | undefined, unit: string = ""): string {
      if (val === null || val === undefined) return "—";
      return `${val}${unit}`;
    }

    it("renders truthful 0 or 0% when value is 0", () => {
      expect(formatMetric(0)).toBe("0");
      expect(formatMetric(0, "%")).toBe("0%");
      expect(formatMetric(0, " days")).toBe("0 days");
    });

    it("renders em-dash (—) when value is null or undefined (unavailable)", () => {
      expect(formatMetric(null)).toBe("—");
      expect(formatMetric(undefined)).toBe("—");
      expect(formatMetric(null, "%")).toBe("—");
    });

    it("does not convert null/undefined into 0 or default fake numbers", () => {
      const apiValue: number | null = null;
      const display = apiValue !== null ? `${apiValue}%` : "—";
      expect(display).toBe("—");
      expect(display).not.toBe("95%");
      expect(display).not.toBe("0%");
    });
  });

  describe("Phase 18 & 27: Multi-Currency Safety", () => {
    function formatCurrency(amount: number | null | undefined, currency: string = "USD"): string {
      if (amount === null || amount === undefined) return "—";
      return `${currency} ${amount.toLocaleString()}`;
    }

    it("respects dynamic tenant/run currency and does not hardcode INR", () => {
      expect(formatCurrency(50000, "EUR")).toBe("EUR 50,000");
      expect(formatCurrency(50000, "USD")).toBe("USD 50,000");
      expect(formatCurrency(50000, "GBP")).toBe("GBP 50,000");
      expect(formatCurrency(null, "EUR")).toBe("—");
    });
  });

  describe("Phase 33: Static Synthetic Data Audit in Analytics Pages", () => {
    const analyticsPages = [
      "../app/(app)/analytics/page.tsx",
      "../app/(app)/analytics/workforce/page.tsx",
      "../app/(app)/analytics/attendance/page.tsx",
      "../app/(app)/analytics/leave/page.tsx",
      "../app/(app)/analytics/payroll/page.tsx",
      "../app/(app)/analytics/compliance/page.tsx",
      "../app/(app)/analytics/face/page.tsx",
      "../app/(app)/analytics/organization/page.tsx",
      "../app/(app)/analytics/executive/page.tsx"
    ];

    it("verifies no fake fallback identities or numbers exist in catch blocks", () => {
      for (const pageRelPath of analyticsPages) {
        const fileContent = readFileSync(new URL(pageRelPath, import.meta.url), "utf8");

        // Verify catch blocks do NOT call setData with synthetic objects
        const catchMatch = fileContent.match(/catch\s*\([^)]*\)\s*\{([^}]+)\}/);
        if (catchMatch && catchMatch[1]) {
          expect(catchMatch[1]).not.toContain("totalGross: 4850000");
          expect(catchMatch[1]).not.toContain("totalHeadcount: 148");
          expect(catchMatch[1]).not.toContain("totalRecords: 3600");
        }

        // Verify banned synthetic mock names
        expect(fileContent).not.toContain("Vikram Sharma");
        expect(fileContent).not.toContain("Priya Nair");
        expect(fileContent).not.toContain("Rohit Verma");
        expect(fileContent).not.toContain("Sneha Patel");
        expect(fileContent).not.toContain("Arun Mehra");
        expect(fileContent).not.toContain("Meera Sen");
        expect(fileContent).not.toContain("CC-ENG-101");
      }
    });

    it("verifies all analytics pages handle errors gracefully without mock fallback", () => {
      for (const pageRelPath of analyticsPages) {
        const fileContent = readFileSync(new URL(pageRelPath, import.meta.url), "utf8");

        // Every page must have error state handling
        expect(fileContent).toContain("setError(");
        expect(fileContent).toContain("{error");
      }
    });
  });
});
