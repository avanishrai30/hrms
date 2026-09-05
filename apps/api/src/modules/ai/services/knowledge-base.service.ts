import { BadRequestException, Inject, Injectable, NotFoundException, Optional, ServiceUnavailableException } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { extname } from "node:path";
import { inflateRawSync, inflateSync } from "node:zlib";
import type { Prisma } from "@prisma/client";
import { assertTenantScopedPath } from "@vc-wms/utils";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AI_PROVIDER, type AIProvider } from "../providers/ai-provider.interface.js";
import type { AiKnowledgeFileUploadDto, AiKnowledgeSearchDto, AiKnowledgeUploadDto } from "../ai.schemas.js";
import { STORAGE_PROVIDER, type StorageProvider } from "../../storage/storage.provider.js";
import { AiSecurityService } from "./ai-security.service.js";

export interface KnowledgeUploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

type KnowledgeStatus = "UPLOADED" | "PROCESSING" | "INDEXED" | "FAILED" | "ARCHIVED";
type KnowledgeAuditAction =
  | "ai.knowledge.uploaded"
  | "ai.knowledge.file_uploaded"
  | "ai.knowledge.archived"
  | "ai.knowledge.reindexed"
  | "ai.knowledge.deleted";

interface ExtractedText {
  text: string;
  sections: Array<{ title?: string; page?: number; content: string }>;
}

@Injectable()
export class KnowledgeBaseService {
  private readonly maxFileBytes = Number(process.env.AI_KNOWLEDGE_MAX_FILE_BYTES || 10 * 1024 * 1024);
  private readonly allowedTypes = new Map([
    [".txt", new Set(["text/plain", "application/octet-stream"])],
    [".md", new Set(["text/markdown", "text/plain", "application/octet-stream"])],
    [".pdf", new Set(["application/pdf", "application/octet-stream"])],
    [".docx", new Set(["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"])]
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: AiSecurityService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
    @Optional() @Inject(STORAGE_PROVIDER) private readonly storageProvider?: StorageProvider
  ) {}

  async uploadKnowledgeDocument(tenantId: string, dto: AiKnowledgeUploadDto, userId: string) {
    const normalized = this.normalizeText(dto.content);
    if (!normalized) {
      throw new BadRequestException("Knowledge content is empty after normalization.");
    }

    const sha256 = this.sha256(Buffer.from(normalized, "utf-8"));
    const duplicate = await this.findActiveDuplicate(tenantId, sha256);
    if (duplicate) {
      throw new BadRequestException("This exact knowledge content already exists for this tenant.");
    }

    const doc = await this.prisma.aiKnowledgeDocument.create({
      data: {
        tenantId,
        title: dto.title,
        category: dto.category,
        content: normalized,
        filePath: dto.filePath ?? null,
        originalFileName: dto.title,
        mimeType: "text/plain",
        sizeBytes: Buffer.byteLength(normalized, "utf-8"),
        sha256,
        status: "PROCESSING",
        uploadedById: userId,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue
      }
    });

    try {
      await this.indexDocument(tenantId, doc.id, normalized);
    } catch (error) {
      await this.markFailed(doc.id, error);
    }
    await this.audit(tenantId, userId, "ai.knowledge.uploaded", doc.id, dto.title);
    return this.getDocument(tenantId, doc.id);
  }

  async uploadKnowledgeFile(tenantId: string, file: KnowledgeUploadFile | undefined, dto: AiKnowledgeFileUploadDto, userId: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("Knowledge file is required.");
    }
    this.validateKnowledgeFile(file);
    if (!this.storageProvider) {
      throw new ServiceUnavailableException("Private storage provider is not configured.");
    }

    const sha256 = this.sha256(file.buffer);
    if (!dto.versionOfDocumentId) {
      const duplicate = await this.findActiveDuplicate(tenantId, sha256);
      if (duplicate) {
        throw new BadRequestException("This exact file already exists for this tenant. Upload it as a new version if replacement is intended.");
      }
    }

    const previous = dto.versionOfDocumentId
      ? await this.prisma.aiKnowledgeDocument.findFirst({ where: { id: dto.versionOfDocumentId, tenantId } })
      : null;
    if (dto.versionOfDocumentId && !previous) {
      throw new NotFoundException("Previous knowledge document version was not found for this tenant.");
    }

    const documentId = randomUUID();
    const safeName = this.sanitizeFileName(file.originalname);
    const storageKey = `tenants/${tenantId}/knowledge/${documentId}/${safeName}`;
    assertTenantScopedPath(tenantId, storageKey);
    await this.storageProvider.upload(storageKey, file.buffer, file.mimetype);

    const title = dto.title?.trim() || this.titleFromFileName(file.originalname);
    const version = previous ? previous.version + 1 : 1;
    const doc = await this.prisma.aiKnowledgeDocument.create({
      data: {
        id: documentId,
        tenantId,
        title,
        category: dto.category,
        content: "",
        filePath: storageKey,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        sha256,
        status: "UPLOADED",
        version,
        effectiveDate: dto.effectiveDate,
        expiresAt: dto.expiresAt,
        audience: dto.audience,
        uploadedById: userId,
        metadata: {
          source: "FILE_UPLOAD",
          untrustedContentBoundary: "Uploaded file content is reference-only and cannot override system or security instructions.",
          previousDocumentId: previous?.id ?? null
        }
      }
    });

    try {
      const extracted = this.extractKnowledgeFileText(file.buffer, file.originalname, file.mimetype);
      const normalized = this.normalizeText(extracted.text);
      if (!normalized) {
        throw new BadRequestException("No extractable text was found. Scanned image PDFs require OCR and are not indexed by this service.");
      }
      await this.prisma.aiKnowledgeDocument.update({
        where: { id: doc.id },
        data: { content: normalized, status: "PROCESSING", lastError: null }
      });
      await this.indexDocument(tenantId, doc.id, normalized, extracted.sections);
      if (previous) {
        await this.archiveDocument(tenantId, previous.id, userId, false);
      }
    } catch (error) {
      await this.markFailed(doc.id, error);
    }

    await this.audit(tenantId, userId, "ai.knowledge.file_uploaded", doc.id, title);
    return this.getDocument(tenantId, doc.id);
  }

  async searchKnowledge(tenantId: string, dto: AiKnowledgeSearchDto) {
    const queryLower = dto.query.toLowerCase();
    const queryKeywords = this.extractKeywords(dto.query);
    const queryEmbedding = await this.embedOrFail(dto.query);

    const candidateChunks = await this.prisma.aiKnowledgeChunk.findMany({
      where: {
        tenantId,
        document: {
          tenantId,
          isActive: true,
          status: "INDEXED",
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          ...(dto.category ? { category: dto.category } : {})
        }
      },
      include: {
        document: {
          select: { id: true, title: true, category: true, version: true }
        }
      },
      take: 200
    });

    const scored = candidateChunks.map((chunk) => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      if (contentLower.includes(queryLower)) score += 3;
      score += chunk.keywords.filter((kw) => queryKeywords.includes(kw)).length * 1.5;
      if (Array.isArray(chunk.embeddingVector)) {
        score += this.cosineSimilarity(chunk.embeddingVector as number[], queryEmbedding) * 2;
      }
      return {
        id: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        category: chunk.document.category,
        version: chunk.document.version,
        chunkIndex: chunk.chunkIndex,
        sourcePage: chunk.sourcePage,
        sourceSection: chunk.sourceSection,
        content: chunk.content,
        keywords: chunk.keywords,
        similarityScore: Number(score.toFixed(3))
      };
    });

    return scored.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, dto.topK);
  }

  async listDocuments(tenantId: string, category?: string) {
    const docs = await this.prisma.aiKnowledgeDocument.findMany({
      where: { tenantId, ...(category ? { category } : {}) },
      include: { _count: { select: { chunks: true } } },
      orderBy: { updatedAt: "desc" }
    });
    return docs.map((doc) => this.toDocumentView(doc, doc._count.chunks));
  }

  async getDocument(tenantId: string, id: string) {
    const doc = await this.prisma.aiKnowledgeDocument.findFirst({
      where: { id, tenantId },
      include: { chunks: { orderBy: { chunkIndex: "asc" } } }
    });
    if (!doc) throw new NotFoundException("Knowledge document not found.");
    return {
      ...this.toDocumentView(doc, doc.chunks.length),
      chunks: doc.chunks.map((chunk) => ({
        id: chunk.id,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        sourcePage: chunk.sourcePage,
        sourceSection: chunk.sourceSection,
        content: chunk.content,
        keywords: chunk.keywords
      }))
    };
  }

  async archiveDocument(tenantId: string, id: string, userId: string, audit = true) {
    const existing = await this.assertDocument(tenantId, id);
    const updated = await this.prisma.aiKnowledgeDocument.update({
      where: { id: existing.id },
      data: { isActive: false, status: "ARCHIVED", archivedAt: new Date() }
    });
    if (audit) await this.audit(tenantId, userId, "ai.knowledge.archived", id, existing.title);
    return this.toDocumentView(updated, existing.chunkCount);
  }

  async reindexDocument(tenantId: string, id: string, userId: string) {
    const existing = await this.assertDocument(tenantId, id);
    let content = existing.content;
    if (existing.filePath && this.storageProvider) {
      assertTenantScopedPath(tenantId, existing.filePath);
      const buffer = await this.storageProvider.getStream(existing.filePath);
      content = this.normalizeText(this.extractKnowledgeFileText(buffer, existing.originalFileName || existing.title, existing.mimeType || "").text);
    }
    if (!content) {
      await this.markFailed(existing.id, new BadRequestException("No extractable text was found during reindex."));
      return this.getDocument(tenantId, id);
    }
    await this.indexDocument(tenantId, id, content);
    await this.audit(tenantId, userId, "ai.knowledge.reindexed", id, existing.title);
    return this.getDocument(tenantId, id);
  }

  async deleteDocument(tenantId: string, id: string, userId: string) {
    const existing = await this.assertDocument(tenantId, id);
    if (existing.filePath && this.storageProvider) {
      assertTenantScopedPath(tenantId, existing.filePath);
      await this.storageProvider.delete(existing.filePath).catch(() => false);
    }
    await this.prisma.aiKnowledgeChunk.deleteMany({ where: { tenantId, documentId: id } });
    await this.prisma.aiKnowledgeDocument.delete({ where: { id: existing.id } });
    await this.audit(tenantId, userId, "ai.knowledge.deleted", id, existing.title);
    return { success: true, message: "Document, chunks, and private storage object deleted." };
  }

  private async indexDocument(
    tenantId: string,
    documentId: string,
    text: string,
    sections = this.sectionsFromText(text)
  ) {
    await this.prisma.aiKnowledgeChunk.deleteMany({ where: { tenantId, documentId } });
    const chunks = this.chunkSections(sections);
    if (chunks.length === 0) {
      throw new BadRequestException("No indexable text chunks were generated.");
    }

    for (const chunk of chunks) {
      const embedding = await this.embedOrFail(chunk.content);
      await this.prisma.aiKnowledgeChunk.create({
        data: {
          tenantId,
          documentId,
          chunkIndex: chunk.index,
          content: chunk.content,
          sourcePage: chunk.page,
          sourceSection: chunk.section,
          keywords: this.extractKeywords(chunk.content),
          embeddingVector: embedding as Prisma.InputJsonValue,
          metadata: { sourceType: "TENANT_KNOWLEDGE", untrusted: true }
        }
      });
    }

    await this.prisma.aiKnowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "INDEXED",
        isActive: true,
        indexedAt: new Date(),
        chunkCount: chunks.length,
        lastError: null
      }
    });
  }

  private async embedOrFail(text: string) {
    try {
      const embedding = await this.aiProvider.generateEmbeddings(text);
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Embedding provider returned no vector.");
      }
      return embedding;
    } catch {
      throw new ServiceUnavailableException("AI embedding provider is unavailable; document was not indexed.");
    }
  }

  validateKnowledgeFile(file: KnowledgeUploadFile) {
    if (file.size > this.maxFileBytes) {
      throw new BadRequestException(`Knowledge file exceeds the ${this.maxFileBytes} byte server limit.`);
    }
    const extension = extname(file.originalname).toLowerCase();
    const allowedMime = this.allowedTypes.get(extension);
    if (!allowedMime || !allowedMime.has(file.mimetype)) {
      throw new BadRequestException("Unsupported knowledge file type. Upload PDF, DOCX, TXT, or MD.");
    }
  }

  extractKnowledgeFileText(buffer: Buffer, fileName: string, mimeType: string): ExtractedText {
    const ext = extname(fileName).toLowerCase();
    if (ext === ".txt" || ext === ".md" || mimeType.startsWith("text/")) {
      const text = buffer.toString("utf-8");
      return { text, sections: this.sectionsFromText(text) };
    }
    if (ext === ".pdf" || mimeType === "application/pdf") {
      return this.extractPdfText(buffer);
    }
    if (ext === ".docx" || mimeType.includes("wordprocessingml")) {
      return this.extractDocxText(buffer);
    }
    throw new BadRequestException("Unsupported knowledge file type.");
  }

  private extractPdfText(buffer: Buffer): ExtractedText {
    const binary = buffer.toString("latin1");
    const streams = [...binary.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)].map((match) => match[1] || "");
    const textParts: string[] = [];

    for (const stream of streams) {
      const source = Buffer.from(stream, "latin1");
      const decodedCandidates = [source.toString("latin1")];
      try {
        decodedCandidates.push(inflateSync(source).toString("latin1"));
      } catch {
        try {
          decodedCandidates.push(inflateRawSync(source).toString("latin1"));
        } catch {
          // Some PDF streams are plain text; compressed failures are ignored.
        }
      }
      for (const candidate of decodedCandidates) {
        textParts.push(...this.extractPdfStringLiterals(candidate));
      }
    }

    textParts.push(...this.extractPdfStringLiterals(binary));
    const text = textParts.join("\n");
    return { text, sections: this.sectionsFromText(text) };
  }

  private extractPdfStringLiterals(input: string): string[] {
    return [...input.matchAll(/\(([^()]{2,})\)\s*Tj/g), ...input.matchAll(/\(([^()]{2,})\)/g)]
      .map((match) => (match[1] || "").replace(/\\([()\\])/g, "$1").trim())
      .filter(Boolean);
  }

  private extractDocxText(buffer: Buffer): ExtractedText {
    const xmlBuffer = this.readZipEntry(buffer, "word/document.xml");
    if (!xmlBuffer) {
      throw new BadRequestException("DOCX document.xml could not be read.");
    }
    const xml = xmlBuffer.toString("utf-8");
    const paragraphs = [...xml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)].map((paragraph) =>
      [...(paragraph[0] || "").matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
        .map((text) => this.decodeXml(text[1] || ""))
        .join("")
        .trim()
    ).filter(Boolean);
    const text = paragraphs.join("\n\n");
    return { text, sections: this.sectionsFromText(text) };
  }

  private readZipEntry(buffer: Buffer, entryName: string): Buffer | null {
    const eocdOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (eocdOffset < 0) return null;
    const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
    let offset = centralDirectoryOffset;
    while (offset < eocdOffset && buffer.readUInt32LE(offset) === 0x02014b50) {
      const method = buffer.readUInt16LE(offset + 10);
      const compressedSize = buffer.readUInt32LE(offset + 20);
      const fileNameLength = buffer.readUInt16LE(offset + 28);
      const extraLength = buffer.readUInt16LE(offset + 30);
      const commentLength = buffer.readUInt16LE(offset + 32);
      const localHeaderOffset = buffer.readUInt32LE(offset + 42);
      const name = buffer.subarray(offset + 46, offset + 46 + fileNameLength).toString("utf-8");
      if (name === entryName) {
        const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
        const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
        const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
        const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
        if (method === 0) return compressed;
        if (method === 8) return inflateRawSync(compressed);
        throw new BadRequestException("Unsupported DOCX compression method.");
      }
      offset += 46 + fileNameLength + extraLength + commentLength;
    }
    return null;
  }

  private normalizeText(text: string) {
    return text
      .replace(/\u0000/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private sectionsFromText(text: string): Array<{ title?: string; content: string }> {
    const paragraphs = this.normalizeText(text).split(/\n{2,}/).filter(Boolean);
    const sections: Array<{ title?: string; content: string }> = [];
    let currentTitle: string | undefined;
    let current: string[] = [];
    for (const paragraph of paragraphs) {
      const heading = paragraph.match(/^(#{1,6}\s+.+|[A-Z][A-Z0-9\s/&-]{4,})$/);
      if (heading && current.length > 0) {
        sections.push({ title: currentTitle, content: current.join("\n\n") });
        current = [];
      }
      if (heading) {
        currentTitle = paragraph.replace(/^#{1,6}\s+/, "").trim();
      } else {
        current.push(paragraph);
      }
    }
    if (current.length > 0) sections.push({ title: currentTitle, content: current.join("\n\n") });
    return sections.length ? sections : [{ content: this.normalizeText(text) }];
  }

  private chunkSections(sections: Array<{ title?: string; page?: number; content: string }>) {
    const max = 1200;
    const overlap = 150;
    const chunks: Array<{ index: number; content: string; section?: string; page?: number }> = [];
    for (const section of sections) {
      const text = this.normalizeText(section.content);
      if (text.length <= max) {
        chunks.push({ index: chunks.length, content: text, section: section.title, page: section.page });
        continue;
      }
      let start = 0;
      while (start < text.length) {
        let end = Math.min(start + max, text.length);
        const boundary = text.lastIndexOf("\n\n", end);
        if (boundary > start + 300) end = boundary;
        chunks.push({ index: chunks.length, content: text.slice(start, end).trim(), section: section.title, page: section.page });
        if (end >= text.length) break;
        start = Math.max(0, end - overlap);
      }
    }
    return chunks.filter((chunk) => chunk.content.length > 0);
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set(["this", "that", "with", "from", "have", "they", "will", "would", "about", "there", "their", "shall"]);
    return Array.from(new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((word) => word.length > 3 && !stopWords.has(word)))).slice(0, 20);
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

  private async assertDocument(tenantId: string, id: string) {
    const doc = await this.prisma.aiKnowledgeDocument.findFirst({ where: { id, tenantId } });
    if (!doc) throw new NotFoundException("Knowledge document not found.");
    return doc;
  }

  private findActiveDuplicate(tenantId: string, sha256: string) {
    return this.prisma.aiKnowledgeDocument.findFirst({ where: { tenantId, sha256, isActive: true } });
  }

  private async markFailed(documentId: string, error: unknown) {
    const message = error instanceof Error ? error.message : "Knowledge document processing failed.";
    await this.prisma.aiKnowledgeDocument.update({
      where: { id: documentId },
      data: { status: "FAILED", isActive: false, lastError: message }
    });
  }

  private toDocumentView(doc: {
    id: string;
    tenantId: string;
    title: string;
    category: string;
    content: string;
    filePath: string | null;
    originalFileName: string | null;
    mimeType: string | null;
    sizeBytes: number;
    sha256: string | null;
    status: string;
    version: number;
    effectiveDate: Date | null;
    expiresAt: Date | null;
    audience: string;
    chunkCount: number;
    indexedAt: Date | null;
    lastError: string | null;
    uploadedById: string | null;
    uploadedAt: Date;
    archivedAt: Date | null;
    isActive: boolean;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }, countedChunks?: number) {
    return {
      id: doc.id,
      tenantId: doc.tenantId,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      filePath: doc.filePath,
      originalFileName: doc.originalFileName,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      sha256: doc.sha256,
      status: doc.status as KnowledgeStatus,
      version: doc.version,
      effectiveDate: doc.effectiveDate?.toISOString() ?? null,
      expiresAt: doc.expiresAt?.toISOString() ?? null,
      audience: doc.audience,
      chunkCount: countedChunks ?? doc.chunkCount,
      indexedAt: doc.indexedAt?.toISOString() ?? null,
      lastError: doc.lastError,
      uploadedById: doc.uploadedById,
      uploadedAt: doc.uploadedAt.toISOString(),
      isActive: doc.isActive,
      metadata: (doc.metadata as Record<string, unknown>) ?? {},
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }

  private sha256(buffer: Buffer) {
    return createHash("sha256").update(buffer).digest("hex");
  }

  private sanitizeFileName(fileName: string) {
    const extension = extname(fileName).toLowerCase();
    const base = fileName.slice(0, Math.max(0, fileName.length - extension.length)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "knowledge";
    return `${base}-${Date.now()}${extension}`;
  }

  private titleFromFileName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Knowledge Document";
  }

  private decodeXml(value: string) {
    return value
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  private audit(tenantId: string, userId: string, action: KnowledgeAuditAction, resourceId: string, title: string) {
    return this.securityService.recordAiAudit(tenantId, userId, {
      action,
      resourceId,
      promptSummary: `${action}: ${title}`
    });
  }
}
