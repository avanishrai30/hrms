import { describe, expect, it } from "vitest";
import { ExportDataset, ExportEngine } from "./export.engine.js";

describe("ExportEngine", () => {
  const engine = new ExportEngine();

  const testDataset: ExportDataset = {
    title: "Test Employee Report",
    tenantName: "VC Organics",
    columns: [
      { key: "code", header: "Emp Code" },
      { key: "name", header: "Full Name" },
      { key: "salary", header: "Gross Salary" }
    ],
    rows: [
      { code: "EMP-001", name: "Avanish Rai, Lead", salary: 75000 },
      { code: "EMP-002", name: 'Priya "Engineer" Sharma', salary: 65000 }
    ]
  };

  it("generates compliant CSV with proper escaping", () => {
    const csvBuffer = engine.generateCsv(testDataset);
    const csvStr = csvBuffer.toString("utf-8");

    expect(csvStr).toContain("Emp Code,Full Name,Gross Salary");
    expect(csvStr).toContain('EMP-001,"Avanish Rai, Lead",75000');
    expect(csvStr).toContain('EMP-002,"Priya ""Engineer"" Sharma",65000');
  });

  it("generates Excel TSV with UTF-8 BOM", () => {
    const excelBuffer = engine.generateExcel(testDataset);
    const excelStr = excelBuffer.toString("utf-8");

    expect(excelStr.startsWith("\uFEFF")).toBe(true);
    expect(excelStr).toContain("Emp Code\tFull Name\tGross Salary");
    expect(excelStr).toContain("EMP-001\tAvanish Rai, Lead\t75000");
  });

  it("generates structured JSON export", () => {
    const jsonBuffer = engine.generateJson(testDataset);
    const parsed = JSON.parse(jsonBuffer.toString("utf-8"));

    expect(parsed.title).toBe("Test Employee Report");
    expect(parsed.rowCount).toBe(2);
    expect(parsed.data[0].code).toBe("EMP-001");
  });

  it("generates vector PDF summary document", () => {
    const pdfBuffer = engine.generatePdf(testDataset);
    const pdfHeader = pdfBuffer.subarray(0, 8).toString("utf-8");

    expect(pdfHeader).toContain("%PDF-1.4");
    expect(pdfBuffer.length).toBeGreaterThan(500);
  });
});
