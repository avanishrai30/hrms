/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KnowledgeBaseService } from "../src/modules/ai/services/knowledge-base.service.js";

describe("Policy Assistant & RAG Knowledge Base Tests (Task 19)", () => {
  let knowledgeService: KnowledgeBaseService;
  let mockPrisma: any;
  let mockSecurity: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockSecurity = {
      recordAiAudit: vi.fn().mockResolvedValue(undefined)
    };

    mockPrisma = {
      aiKnowledgeDocument: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({
          id: "doc-1",
          tenantId: data.tenantId,
          title: data.title,
          category: data.category,
          content: data.content,
          filePath: data.filePath,
          version: 1,
          isActive: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "doc-1",
            tenantId,
            title: "Maternity & Paternity Policy",
            category: "LEAVE",
            content: "Full 26 weeks paid maternity leave is provided under the Maternity Benefit Act.",
            filePath: null,
            version: 1,
            isActive: true,
            metadata: {},
            _count: { chunks: 2 },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: "doc-1",
          tenantId,
          title: "Maternity & Paternity Policy",
          category: "LEAVE",
          content: "Full 26 weeks paid maternity leave is provided under the Maternity Benefit Act.",
          filePath: null,
          version: 1,
          isActive: true,
          chunks: [
            { id: "c-1", documentId: "doc-1", chunkIndex: 0, content: "Maternity benefit details", keywords: ["maternity"] }
          ],
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        delete: vi.fn().mockResolvedValue({ id: "doc-1" })
      },
      aiKnowledgeChunk: {
        create: vi.fn().mockResolvedValue({ id: "chunk-new" }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "c-1",
            tenantId,
            documentId: "doc-1",
            chunkIndex: 0,
            content: "Full 26 weeks paid maternity leave is provided for female employees.",
            keywords: ["maternity", "leave", "weeks", "benefit"],
            embeddingVector: [0.12, 0.45, 0.78],
            document: { id: "doc-1", title: "Maternity & Paternity Policy", category: "LEAVE" }
          }
        ]),
        deleteMany: vi.fn().mockResolvedValue({ count: 2 })
      }
    };

    knowledgeService = new KnowledgeBaseService(mockPrisma, mockSecurity);
  });

  it("should upload and automatically chunk company policy documents", async () => {
    const doc = await knowledgeService.uploadKnowledgeDocument(
      tenantId,
      {
        title: "Standard Code of Conduct",
        category: "CODE_OF_CONDUCT",
        content: "This document sets forth company guidelines for integrity, workplace safety, and harassment-free operations across all manufacturing and corporate hubs."
      },
      userId
    );

    expect(doc.id).toBe("doc-1");
    expect(doc.chunkCount).toBeGreaterThan(0);
    expect(mockPrisma.aiKnowledgeChunk.create).toHaveBeenCalled();
  });

  it("should perform semantic RAG search against policy chunks", async () => {
    const results = await knowledgeService.searchKnowledge(tenantId, {
      query: "maternity leave days",
      topK: 3
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.content).toContain("26 weeks");
    expect(results[0]?.similarityScore).toBeGreaterThan(0);
  });
});
