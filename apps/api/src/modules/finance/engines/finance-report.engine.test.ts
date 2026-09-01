import { describe, expect, it } from "vitest";
import { FinanceReportEngine } from "./finance-report.engine.js";

describe("FinanceReportEngine", () => {
  it("exports CSV, Excel-ready CSV, PDF payload, and JSON", () => {
    const engine = new FinanceReportEngine();
    const rows = [{ claim: "EXP-1", amount: 1200 }];

    expect(engine.export(rows, "CSV", "Expense Register").content).toContain("claim,amount");
    expect(engine.export(rows, "EXCEL", "Expense Register").content.startsWith("\uFEFF")).toBe(true);
    expect(engine.export(rows, "PDF", "Expense Register").mimeType).toBe("application/pdf");
    expect(engine.export(rows, "JSON", "Expense Register").content).toContain("\"EXP-1\"");
  });
});
