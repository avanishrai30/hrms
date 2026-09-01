import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { AiKnowledgeSearchDto, AiKnowledgeUploadDto } from "../ai.schemas.js";
import { LocalAiProvider } from "../providers/local-ai.provider.js";
import { AiSecurityService } from "./ai-security.service.js";

@Injectable()
export class KnowledgeBaseService {
  private readonly localAi = new LocalAiProvider();

  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: AiSecurityService
  ) {}

  async uploadKnowledgeDocument(
    tenantId: string,
    dto: AiKnowledgeUploadDto,
    userId: string
  ) {
    // 1. Create base document
    const doc = await this.prisma.aiKnowledgeDocument.create({
      data: {
        tenantId,
        title: dto.title,
        category: dto.category,
        content: dto.content,
        filePath: dto.filePath ?? null,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue
      }
    });

    // 2. Chunk document into semantic passages (approx 400 chars per chunk with 50 char overlap)
    const chunks = this.chunkText(dto.content, 400, 50);

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i] ?? "";
      const keywords = this.extractKeywords(chunkText);
      const embedding = await this.localAi.generateEmbeddings(chunkText);

      await this.prisma.aiKnowledgeChunk.create({
        data: {
          tenantId,
          documentId: doc.id,
          chunkIndex: i,
          content: chunkText,
          keywords,
          embeddingVector: embedding as Prisma.InputJsonValue
        }
      });
    }

    await this.securityService.recordAiAudit(tenantId, userId, {
      action: "ai.knowledge.uploaded",
      resourceId: doc.id,
      promptSummary: `Uploaded knowledge doc: ${dto.title} (${chunks.length} chunks)`
    });

    return {
      id: doc.id,
      tenantId: doc.tenantId,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      filePath: doc.filePath,
      version: doc.version,
      isActive: doc.isActive,
      chunkCount: chunks.length,
      metadata: (doc.metadata as Record<string, unknown>) ?? {},
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }

  async searchKnowledge(
    tenantId: string,
    dto: AiKnowledgeSearchDto
  ) {
    const queryLower = dto.query.toLowerCase();
    const queryKeywords = this.extractKeywords(dto.query);
    const queryEmbedding = await this.localAi.generateEmbeddings(dto.query);

    const where: Prisma.AiKnowledgeChunkWhereInput = {
      tenantId,
      document: {
        isActive: true,
        ...(dto.category ? { category: dto.category } : {})
      }
    };

    const candidateChunks = await this.prisma.aiKnowledgeChunk.findMany({
      where,
      include: {
        document: {
          select: { id: true, title: true, category: true }
        }
      },
      take: 100
    });

    // Compute relevance scores using keyword matching and cosine similarity
    const scored = candidateChunks.map((chunk) => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();

      // Direct text match bonus
      if (contentLower.includes(queryLower)) {
        score += 3.0;
      }

      // Keyword overlap
      const keywordOverlap = chunk.keywords.filter((kw) => queryKeywords.includes(kw)).length;
      score += keywordOverlap * 1.5;

      // Vector cosine similarity
      if (Array.isArray(chunk.embeddingVector) && Array.isArray(queryEmbedding)) {
        const sim = this.cosineSimilarity(chunk.embeddingVector as number[], queryEmbedding);
        score += sim * 2.0;
      }

      return {
        id: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        category: chunk.document.category,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        keywords: chunk.keywords,
        similarityScore: Number(score.toFixed(3))
      };
    });

    // Sort by score descending and return top K
    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return scored.slice(0, dto.topK);
  }

  async listDocuments(tenantId: string, category?: string) {
    const docs = await this.prisma.aiKnowledgeDocument.findMany({
      where: {
        tenantId,
        ...(category ? { category } : {})
      },
      include: {
        _count: { select: { chunks: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return docs.map((d) => ({
      id: d.id,
      tenantId: d.tenantId,
      title: d.title,
      category: d.category,
      content: d.content,
      filePath: d.filePath,
      version: d.version,
      isActive: d.isActive,
      chunkCount: d._count.chunks,
      metadata: (d.metadata as Record<string, unknown>) ?? {},
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString()
    }));
  }

  async getDocument(tenantId: string, id: string) {
    const doc = await this.prisma.aiKnowledgeDocument.findFirst({
      where: { id, tenantId },
      include: {
        chunks: { orderBy: { chunkIndex: "asc" } }
      }
    });
    if (!doc) {
      throw new NotFoundException("Knowledge document not found.");
    }
    return {
      id: doc.id,
      tenantId: doc.tenantId,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      filePath: doc.filePath,
      version: doc.version,
      isActive: doc.isActive,
      chunkCount: doc.chunks.length,
      chunks: doc.chunks.map((c) => ({
        id: c.id,
        documentId: c.documentId,
        chunkIndex: c.chunkIndex,
        content: c.content,
        keywords: c.keywords
      })),
      metadata: (doc.metadata as Record<string, unknown>) ?? {},
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }

  async deleteDocument(tenantId: string, id: string, userId: string) {
    const existing = await this.prisma.aiKnowledgeDocument.findFirst({
      where: { id, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Knowledge document not found.");
    }

    await this.prisma.aiKnowledgeChunk.deleteMany({ where: { documentId: id } });
    await this.prisma.aiKnowledgeDocument.delete({ where: { id } });

    await this.securityService.recordAiAudit(tenantId, userId, {
      action: "ai.knowledge.uploaded",
      resourceId: id,
      promptSummary: `Deleted knowledge document: ${existing.title}`
    });

    return { success: true, message: "Document and associated chunks deleted." };
  }

  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      if (end >= text.length) break;
      start += chunkSize - overlap;
    }
    return chunks.length > 0 ? chunks : [text];
  }

  private extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const stopWords = new Set(["this", "that", "with", "from", "have", "they", "will", "would", "about", "there", "their"]);
    return Array.from(new Set(words.filter((w) => !stopWords.has(w)))).slice(0, 10);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      const a = vecA[i] ?? 0;
      const b = vecB[i] ?? 0;
      dot += a * b;
      magA += a * a;
      magB += b * b;
    }
    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude > 0 ? dot / magnitude : 0;
  }
}
