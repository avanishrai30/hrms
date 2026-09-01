/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationMemoryService } from "../src/modules/ai/memory/conversation-memory.service.js";
import { KnowledgeBaseService } from "../src/modules/ai/services/knowledge-base.service.js";

describe("AI Multi-Tenant Isolation Tests (Task 19)", () => {
  let memoryService: ConversationMemoryService;
  let knowledgeService: KnowledgeBaseService;
  let mockPrisma: any;
  let mockSecurity: any;

  const tenantA = "11111111-1111-1111-1111-111111111111";
  const tenantB = "22222222-2222-2222-2222-222222222222";
  const userA = "user-a-uuid";

  beforeEach(() => {
    mockSecurity = {
      recordAiAudit: vi.fn().mockResolvedValue(undefined)
    };

    mockPrisma = {
      aiConversation: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA && where.id === "conv-1") {
            return Promise.resolve({
              id: "conv-1",
              tenantId: tenantA,
              userId: userA,
              title: "My Leave Query",
              messages: []
            });
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockResolvedValue({ id: "new-conv", tenantId: tenantA, userId: userA, messages: [] }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA) {
            return Promise.resolve([{ id: "conv-1", tenantId: tenantA, userId: userA, messages: [] }]);
          }
          return Promise.resolve([]);
        })
      },
      aiKnowledgeChunk: {
        findMany: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId === tenantA) {
            return Promise.resolve([
              {
                id: "chunk-a",
                tenantId: tenantA,
                documentId: "doc-a",
                chunkIndex: 0,
                content: "Tenant A Confidential Leave Policy: 24 days annually.",
                keywords: ["leave", "policy", "tenant"],
                embeddingVector: [0.1, 0.2, 0.3],
                document: { id: "doc-a", title: "Leave Policy A", category: "POLICY" }
              }
            ]);
          }
          return Promise.resolve([]);
        })
      }
    };

    memoryService = new ConversationMemoryService(mockPrisma);
    knowledgeService = new KnowledgeBaseService(mockPrisma, mockSecurity);
  });

  it("should never return conversations belonging to Tenant B when querying for Tenant A", async () => {
    const listA = await memoryService.listConversations(tenantA, userA);
    expect(listA.length).toBe(1);
    expect(listA[0]?.tenantId).toBe(tenantA);

    const listB = await memoryService.listConversations(tenantB, userA);
    expect(listB.length).toBe(0);
  });

  it("should throw NotFoundException when trying to access another tenant's conversation", async () => {
    await expect(memoryService.getConversation(tenantB, userA, "conv-1")).rejects.toThrow("Conversation not found.");
  });

  it("should enforce tenantId boundary in knowledge search and RAG retrieval", async () => {
    const resultsA = await knowledgeService.searchKnowledge(tenantA, { query: "leave policy", topK: 5 });
    expect(resultsA.length).toBe(1);
    expect(resultsA[0]?.content).toContain("Tenant A");

    const resultsB = await knowledgeService.searchKnowledge(tenantB, { query: "leave policy", topK: 5 });
    expect(resultsB.length).toBe(0);
  });
});
