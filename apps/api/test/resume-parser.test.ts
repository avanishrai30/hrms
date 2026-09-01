import { describe, expect, it } from "vitest";
import type { DocumentAiService } from "../src/modules/ai/services/document-ai.service.js";
import { ResumeParserEngine } from "../src/modules/recruitment/engines/resume-parser.engine.js";

describe("Resume Parser Engine (Task 20)", () => {
  const fakeDocAi = {
    extractDocumentData: async (_tenantId: string, _dto: unknown) => ({
      extractedData: {
        name: "Aakash Sharma",
        email: "aakash.sharma@example.com",
        phone: "+91-9876543210",
        skills: ["TypeScript", "NestJS", "React", "PostgreSQL"],
        companies: ["TechNova Systems", "InnoWave Solutions"],
        experienceYears: 4.5,
        education: [{ degree: "B.Tech in Computer Science", institution: "IIT Bombay", year: "2021" }],
        certifications: ["AWS Certified Solutions Architect"],
        projects: ["Enterprise ATS Platform", "Real-time Chat Engine"],
        summary: "Senior Full Stack Engineer with 4.5 years of experience building distributed web apps."
      }
    })
  };

  const engine = new ResumeParserEngine(fakeDocAi as unknown as DocumentAiService);

  it("extracts candidate profile entities accurately via Document AI integration", async () => {
    const resumeText = `
      Aakash Sharma
      Email: aakash.sharma@example.com | Phone: +91-9876543210
      Senior Full Stack Engineer with 4.5 years experience in TypeScript, React, and NestJS.
      Worked at TechNova Systems and InnoWave Solutions.
    `;

    const parsed = await engine.parseResume("test-tenant-id", resumeText, "aakash_resume.pdf");

    expect(parsed.name).toBe("Aakash Sharma");
    expect(parsed.email).toBe("aakash.sharma@example.com");
    expect(parsed.phone).toBe("+91-9876543210");
    expect(parsed.skills).toContain("TypeScript");
    expect(parsed.skills).toContain("NestJS");
    expect(parsed.companies).toContain("TechNova Systems");
    expect(parsed.experienceYears).toBe(4.5);
    expect(parsed.education[0]?.degree).toBe("B.Tech in Computer Science");
  });

  it("falls back gracefully to regex and heuristic entity extraction on Document AI error", async () => {
    const failingDocAi = {
      extractDocumentData: async () => {
        throw new Error("AI provider unavailable");
      }
    };

    const fallbackEngine = new ResumeParserEngine(failingDocAi as unknown as DocumentAiService);
    const resumeText = `Priya Patel
      priya.patel@acme.org | +91-9812345678
      5.0 years experience working with Docker, Python, PostgreSQL, and AWS.
      Software engineer at CloudScale Technologies.
    `;

    const parsed = await fallbackEngine.parseResume("test-tenant-id", resumeText, "priya_cv.pdf");

    expect(parsed.email).toBe("priya.patel@acme.org");
    expect(parsed.phone).toBe("+91-9812345678");
    expect(parsed.skills).toContain("Python");
    expect(parsed.skills).toContain("Docker");
    expect(parsed.skills).toContain("AWS");
    expect(parsed.experienceYears).toBe(5.0);
  });
});
