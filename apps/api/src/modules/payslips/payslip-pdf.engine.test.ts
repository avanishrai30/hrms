import { describe, expect, it } from "vitest";
import { PayslipPdfEngine, type PayslipPdfData } from "./payslip-pdf.engine.js";

describe("PayslipPdfEngine", () => {
  it("generates a valid, deterministic PDF-1.4 binary buffer", () => {
    const data: PayslipPdfData = {
      tenantName: "VC Organics Ltd",
      month: 8,
      year: 2026,
      version: 1,
      currency: "USD",
      generatedAt: new Date("2026-08-31T12:00:00Z"),
      employee: {
        fullName: "Avanish Rai",
        employeeCode: "EMP-001",
        department: "Engineering",
        designation: "Staff Software Engineer",
        joiningDate: "01/01/2024"
      },
      attendance: {
        workingDays: 30,
        payableDays: 28,
        presentDays: 24,
        paidLeaveDays: 2,
        holidayDays: 2,
        halfDays: 0,
        absentDays: 2
      },
      earnings: [
        { name: "Basic Salary", amount: 46667 },
        { name: "HRA", amount: 23333 },
        { name: "Special Allowance", amount: 9333 }
      ],
      deductions: [
        { name: "Provident Fund", amount: 5600 },
        { name: "Professional Tax", amount: 200 }
      ],
      employerContributions: [
        { name: "Employer PF Match", amount: 5600 }
      ],
      grossSalary: 79333,
      totalDeductions: 5800,
      netSalary: 73533
    };

    const pdfBuffer = PayslipPdfEngine.generatePayslipPdf(data);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(500);

    const pdfText = pdfBuffer.toString("utf8");
    // Verify standard PDF-1.4 structure
    expect(pdfText.startsWith("%PDF-1.4")).toBe(true);
    expect(pdfText.includes("/Type /Catalog")).toBe(true);
    expect(pdfText.includes("/MediaBox [0 0 595.28 841.89]")).toBe(true);
    expect(pdfText.includes("VC ORGANICS LTD")).toBe(true);
    expect(pdfText.includes("Avanish Rai")).toBe(true);
    expect(pdfText.includes("EMP-001")).toBe(true);
    expect(pdfText.includes("USD 73,533")).toBe(true);
    expect(pdfText.includes("Rs.")).toBe(false);
    expect(pdfText.includes("%%EOF")).toBe(true);
  });

  it("generates a valid PDF with INR currency for tenant-configured INR runs", () => {
    const data: PayslipPdfData = {
      tenantName: "VC Organics Ltd",
      month: 9,
      year: 2026,
      version: 1,
      currency: "INR",
      generatedAt: new Date("2026-09-30T12:00:00Z"),
      employee: {
        fullName: "Rahul Verma",
        employeeCode: "EMP-042",
        department: "Operations",
        designation: "Plant Manager",
        joiningDate: "15/03/2023"
      },
      attendance: {
        workingDays: 30,
        payableDays: 30,
        presentDays: 26,
        paidLeaveDays: 4,
        holidayDays: 0,
        halfDays: 0,
        absentDays: 0
      },
      earnings: [
        { name: "Basic Salary", amount: 60000 },
        { name: "HRA", amount: 30000 }
      ],
      deductions: [
        { name: "Provident Fund", amount: 7200 }
      ],
      employerContributions: [
        { name: "Employer PF Match", amount: 7200 }
      ],
      grossSalary: 90000,
      totalDeductions: 7200,
      netSalary: 82800
    };

    const pdfBuffer = PayslipPdfEngine.generatePayslipPdf(data);
    const pdfText = pdfBuffer.toString("utf8");

    expect(pdfText.startsWith("%PDF-1.4")).toBe(true);
    expect(pdfText.includes("Rahul Verma")).toBe(true);
    expect(pdfText.includes("INR 82,800")).toBe(true);
    expect(pdfText.includes("%%EOF")).toBe(true);
  });
});
