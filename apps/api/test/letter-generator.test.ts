import { describe, expect, it } from "vitest";
import { LetterGeneratorEngine } from "../src/modules/ess/engines/letter-generator.engine.js";

describe("LetterGeneratorEngine", () => {
  it("should correctly render an Employment Confirmation Letter with dynamic context", () => {
    const rendered = LetterGeneratorEngine.renderLetter("EMPLOYMENT_CONFIRMATION", {
      fullName: "Avanish Rai",
      employeeCode: "EMP-1001",
      designation: "Principal Architect",
      department: "Engineering",
      joiningDate: "01 Jan 2024",
      companyName: "VC Organics Ltd.",
      companyAddress: "Bangalore, India",
      currentDate: "01 Sep 2026",
      annualCtc: 2400000,
      monthlyGross: 200000
    });

    expect(rendered.title).toBe("Employment Confirmation Letter - Avanish Rai");
    expect(rendered.content).toContain("Avanish Rai");
    expect(rendered.content).toContain("EMP-1001");
    expect(rendered.content).toContain("Principal Architect");
    expect(rendered.content).toContain("VC Organics Ltd.");
    expect(rendered.content).toContain("01 Jan 2024");
  });

  it("should correctly render a Salary Certificate with formatted currency values", () => {
    const rendered = LetterGeneratorEngine.renderLetter("SALARY_CERTIFICATE", {
      fullName: "Priya Sharma",
      employeeCode: "EMP-1002",
      designation: "Lead HR Business Partner",
      department: "Human Resources",
      joiningDate: "15 Mar 2023",
      companyName: "VC Organics Ltd.",
      companyAddress: "Bangalore, India",
      currentDate: "01 Sep 2026",
      annualCtc: 1800000,
      monthlyGross: 150000
    });

    expect(rendered.title).toBe("Salary Certificate - Priya Sharma");
    expect(rendered.content).toContain("₹18,00,000 per annum");
    expect(rendered.content).toContain("₹1,50,000 per month");
  });

  it("should correctly render an Experience Letter with relieving date", () => {
    const rendered = LetterGeneratorEngine.renderLetter("EXPERIENCE_LETTER", {
      fullName: "Rohan Verma",
      employeeCode: "EMP-1003",
      designation: "DevOps Engineer",
      department: "Infrastructure",
      joiningDate: "01 Jun 2022",
      relievingDate: "31 Aug 2026",
      companyName: "VC Organics Ltd.",
      companyAddress: "Bangalore, India",
      currentDate: "01 Sep 2026"
    });

    expect(rendered.title).toBe("Experience & Relieving Letter - Rohan Verma");
    expect(rendered.content).toContain("01 Jun 2022 to 31 Aug 2026");
  });
});
