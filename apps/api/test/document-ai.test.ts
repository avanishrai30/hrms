/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentAiService } from "../src/modules/ai/services/document-ai.service.js";

describe("Document AI Parsing & Extraction Tests (Task 19)", () => {
  let docAiService: DocumentAiService;
  let mockPrisma: any;
  let mockSecurity: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockSecurity = {
      recordAiAudit: vi.fn().mockResolvedValue(undefined)
    };

    mockPrisma = {
      aiDocumentExtraction: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          id: "ext-1",
          tenantId: data.tenantId,
          documentType: data.documentType,
          fileName: data.fileName,
          filePath: data.filePath,
          extractedData: data.extractedData,
          confidence: data.confidence,
          createdAt: new Date()
        })),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "ext-1",
            tenantId,
            documentType: "RESUME",
            fileName: "candidate_resume.pdf",
            filePath: "uploads/resume.pdf",
            extractedData: { candidateName: "Aditi Sharma", skills: ["TypeScript", "NestJS"] },
            confidence: 0.95,
            createdAt: new Date()
          }
        ])
      }
    };

    docAiService = new DocumentAiService(mockPrisma, mockSecurity);
  });

  it("should extract structured candidate profile from Resume text", async () => {
    const resumeSample = `
    Candidate Name: Vikram Malhotra
    Email: vikram.m@example.com
    Phone: +91 9988776655
    Skills: React, TypeScript, PostgreSQL, Docker, HR Analytics
    Experience: 5 years in Enterprise SaaS development
    `;

    const result = await docAiService.extractDocumentData(
      tenantId,
      {
        documentType: "RESUME",
        fileName: "vikram_resume.pdf",
        filePath: "documents/resumes/vikram.pdf",
        rawText: resumeSample
      },
      userId
    );

    expect(result.id).toBe("ext-1");
    expect(result.extractedData).toHaveProperty("candidateName");
    expect(result.extractedData).toHaveProperty("email");
    expect(result.extractedData).toHaveProperty("skills");
    expect(Array.isArray((result.extractedData as any).skills)).toBe(true);
  });

  it("should extract compensation and offer terms from Offer Letter text", async () => {
    const offerLetterSample = `
    Dear Rajesh Kumar,
    We are pleased to offer you the position of Lead Agronomist.
    Your Annual CTC will be INR 1,400,000.
    Joining Date: 2026-11-01
    `;

    const result = await docAiService.extractDocumentData(
      tenantId,
      {
        documentType: "OFFER_LETTER",
        fileName: "rajesh_offer.pdf",
        filePath: "documents/offers/rajesh.pdf",
        rawText: offerLetterSample
      },
      userId
    );

    expect(result.extractedData).toHaveProperty("candidateName");
    expect(result.extractedData).toHaveProperty("designation");
    expect(result.extractedData).toHaveProperty("annualCtc");
    expect((result.extractedData as any).annualCtc).toBeGreaterThan(0);
  });
});
