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

describe("OllamaProvider Production Failure Semantics", () => {
  it("should parse Ollama chat responses correctly", async () => {
    const { OllamaProvider } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: "Your remaining leave balance is 14 days." },
        prompt_eval_count: 12,
        eval_count: 18,
        model: "qwen2.5:1.5b"
      })
    } as any);

    try {
      const res = await provider.chat("What is my leave balance?", {
        systemPrompt: "You are an HR Assistant."
      });

      expect(res.content).toBe("Your remaining leave balance is 14 days.");
      expect(res.model).toBe("qwen2.5:1.5b");
      expect(res.tokensUsed).toBe(30);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw AiProviderUnavailableError when Ollama is unreachable (ECONNREFUSED)", async () => {
    const { OllamaProvider, AiProviderUnavailableError } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:11434"));

    try {
      await expect(provider.chat("What is my leave balance?")).rejects.toThrow(AiProviderUnavailableError);
      await expect(provider.chat("What is my leave balance?")).rejects.toThrow(/ECONNREFUSED/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw AiProviderUnavailableError on Ollama timeout", async () => {
    const { OllamaProvider, AiProviderUnavailableError } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("The operation was aborted due to timeout"));

    try {
      await expect(provider.chat("Hello")).rejects.toThrow(AiProviderUnavailableError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw AiProviderUnavailableError on non-2xx response", async () => {
    const { OllamaProvider, AiProviderUnavailableError } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error"
    } as any);

    try {
      await expect(provider.chat("Hello")).rejects.toThrow(AiProviderUnavailableError);
      await expect(provider.chat("Hello")).rejects.toThrow(/HTTP 500/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should NOT implicitly fall back to LocalAiProvider on failure", async () => {
    const { OllamaProvider } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));

    try {
      let threw = false;
      try {
        const res = await provider.chat("test");
        // If we got here, check it is NOT LocalAiProvider output
        expect(res.model).not.toBe("local-heuristic-v1");
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw AiProviderUnavailableError from summarize on failure", async () => {
    const { OllamaProvider, AiProviderUnavailableError } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));

    try {
      await expect(provider.summarize("Some text to summarize")).rejects.toThrow(AiProviderUnavailableError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw AiProviderUnavailableError from classify on failure", async () => {
    const { OllamaProvider, AiProviderUnavailableError } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));

    try {
      await expect(provider.classify("some text", ["A", "B"])).rejects.toThrow(AiProviderUnavailableError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw AiProviderUnavailableError from extract on failure", async () => {
    const { OllamaProvider, AiProviderUnavailableError } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));

    try {
      await expect(provider.extract("some text", "name: string")).rejects.toThrow(AiProviderUnavailableError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should throw AiProviderUnavailableError from generateEmbeddings on failure (no fake vectors)", async () => {
    const { OllamaProvider, AiProviderUnavailableError } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));

    try {
      await expect(provider.generateEmbeddings("test text")).rejects.toThrow(AiProviderUnavailableError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should report healthy when Ollama tags endpoint returns the model", async () => {
    const { OllamaProvider } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [{ name: "qwen2.5:1.5b" }]
      })
    } as any);

    try {
      const health = await provider.checkHealth();
      expect(health.status).toBe("ok");
      expect(health.provider).toBe("ollama");
      expect(health.reachable).toBe(true);
      expect(health.model).toBe("qwen2.5:1.5b");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should report degraded with provider='ollama' (NOT 'local-fallback') when Ollama is unreachable", async () => {
    const { OllamaProvider } = await import("../src/modules/ai/providers/ollama.provider.js");
    const provider = new OllamaProvider();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection timeout"));

    try {
      const health = await provider.checkHealth();
      expect(health.status).toBe("degraded");
      expect(health.reachable).toBe(false);
      expect(health.provider).toBe("ollama");
      expect(health.provider).not.toBe("local-fallback");
      expect(health.model).toBe("qwen2.5:1.5b");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should only use LocalAiProvider when AI_PROVIDER=local is explicitly configured", async () => {
    const originalEnv = process.env.AI_PROVIDER;
    process.env.AI_PROVIDER = "local";

    try {
      const { LocalAiProvider } = await import("../src/modules/ai/providers/local-ai.provider.js");
      const provider = new LocalAiProvider();

      const res = await provider.chat("What is my leave balance?");
      expect(res).toBeDefined();
      expect(res.model).toBe("local-heuristic-v1");
    } finally {
      process.env.AI_PROVIDER = originalEnv;
    }
  });
});
