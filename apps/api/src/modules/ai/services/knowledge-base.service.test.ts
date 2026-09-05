import { deflateRawSync } from "node:zlib";
import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { KnowledgeBaseService, type KnowledgeUploadFile } from "./knowledge-base.service.js";

function service(overrides: {
  prisma?: Record<string, unknown>;
  aiProvider?: Record<string, unknown>;
  storageProvider?: Record<string, unknown>;
} = {}) {
  return new KnowledgeBaseService(
    (overrides.prisma ?? {}) as never,
    { recordAiAudit: async () => ({}) } as never,
    (overrides.aiProvider ?? { generateEmbeddings: async () => [1, 0, 0] }) as never,
    (overrides.storageProvider ?? { upload: async () => ({}), getStream: async () => Buffer.from(""), delete: async () => true }) as never
  );
}

function uploadFile(name: string, mimetype: string, text: string): KnowledgeUploadFile {
  const buffer = Buffer.from(text, "utf-8");
  return { originalname: name, mimetype, size: buffer.length, buffer };
}

function createPdf(text: string) {
  return Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 72 720 Td (${text}) Tj ET
endstream
endobj
%%EOF`, "latin1");
}

function createDocx(text: string) {
  const xml = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`);
  const compressed = deflateRawSync(xml);
  const name = Buffer.from("word/document.xml");
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(0, 10);
  local.writeUInt32LE(0, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(xml.length, 22);
  local.writeUInt16LE(name.length, 26);
  const localRecord = Buffer.concat([local, name, compressed]);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(0, 12);
  central.writeUInt32LE(0, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(xml.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(0, 42);
  const centralRecord = Buffer.concat([central, name]);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(centralRecord.length, 12);
  eocd.writeUInt32LE(localRecord.length, 16);
  return Buffer.concat([localRecord, centralRecord, eocd]);
}

describe("KnowledgeBaseService file ingestion", () => {
  it("extracts TXT and MD content directly", () => {
    const sut = service();
    expect(sut.extractKnowledgeFileText(Buffer.from("Policy text"), "policy.txt", "text/plain").text).toContain("Policy text");
    expect(sut.extractKnowledgeFileText(Buffer.from("# Handbook\n\nClause"), "handbook.md", "text/markdown").text).toContain("Handbook");
  });

  it("extracts simple digital PDF text", () => {
    const sut = service();
    const extracted = sut.extractKnowledgeFileText(createPdf("Unique PDF policy phrase"), "policy.pdf", "application/pdf");
    expect(extracted.text).toContain("Unique PDF policy phrase");
  });

  it("leaves scanned or image-only PDFs without extractable text", () => {
    const sut = service();
    const extracted = sut.extractKnowledgeFileText(Buffer.from("%PDF-1.4\n%%EOF", "latin1"), "scan.pdf", "application/pdf");
    expect(extracted.text.trim()).toBe("");
  });

  it("extracts DOCX document text", () => {
    const sut = service();
    const extracted = sut.extractKnowledgeFileText(createDocx("Unique DOCX policy phrase"), "policy.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(extracted.text).toContain("Unique DOCX policy phrase");
  });

  it("rejects unsupported and oversized files", () => {
    const sut = service();
    expect(() => sut.validateKnowledgeFile(uploadFile("policy.exe", "application/x-msdownload", "x"))).toThrow(BadRequestException);
    expect(() => sut.validateKnowledgeFile({ ...uploadFile("policy.txt", "text/plain", "x"), size: 11 * 1024 * 1024 })).toThrow(BadRequestException);
  });

  it("rejects duplicate active files for the same tenant", async () => {
    const sut = service({
      prisma: {
        aiKnowledgeDocument: {
          findFirst: async () => ({ id: "existing" })
        }
      }
    });

    await expect(sut.uploadKnowledgeFile("tenant-a", uploadFile("policy.txt", "text/plain", "same content"), { category: "POLICY", audience: "TENANT_ADMIN" }, "user-1")).rejects.toThrow(BadRequestException);
  });

  it("fails truthfully when the embedding provider is unavailable", async () => {
    const updates: Array<Record<string, unknown>> = [];
    let documentRecord: Record<string, unknown> | null = null;
    const sut = service({
      aiProvider: { generateEmbeddings: async () => { throw new Error("offline"); } },
      prisma: {
        aiKnowledgeDocument: {
          findFirst: async ({ where }: { where: Record<string, unknown> }) => {
            if (where.sha256) return null;
            return documentRecord ? { ...documentRecord, chunks: [] } : null;
          },
          create: async ({ data }: { data: Record<string, unknown> }) => {
            documentRecord = { ...data, createdAt: new Date(), updatedAt: new Date(), uploadedAt: new Date(), isActive: true, version: 1, chunkCount: 0, id: data.id };
            return documentRecord;
          },
          update: async ({ data }: { data: Record<string, unknown> }) => {
            updates.push(data);
            documentRecord = { ...(documentRecord ?? {}), ...data, updatedAt: new Date() };
            return documentRecord;
          }
        },
        aiKnowledgeChunk: { deleteMany: async () => ({}), create: async () => ({}), findMany: async () => [] }
      }
    });

    const result = await sut.uploadKnowledgeFile("tenant-a", uploadFile("policy.txt", "text/plain", "Unique provider failure phrase"), { category: "POLICY", audience: "TENANT_ADMIN" }, "user-1");
    expect(result.status).toBe("FAILED");
    expect(updates.some((update) => update.status === "FAILED" && String(update.lastError).includes("embedding provider"))).toBe(true);
  });

  it("enforces tenant-scoped RAG retrieval", async () => {
    const sut = service({
      prisma: {
        aiKnowledgeChunk: {
          findMany: async ({ where }: { where: { tenantId: string } }) =>
            where.tenantId === "tenant-b"
              ? []
              : [{
                  id: "chunk-a",
                  documentId: "doc-a",
                  chunkIndex: 0,
                  content: "Tenant A exact unique phrase",
                  keywords: ["tenant", "unique", "phrase"],
                  embeddingVector: [1, 0, 0],
                  sourcePage: null,
                  sourceSection: "Policy",
                  document: { id: "doc-a", title: "A Policy", category: "POLICY", version: 1 }
                }]
        }
      }
    });

    await expect(sut.searchKnowledge("tenant-b", { query: "Tenant A exact unique phrase", topK: 5 })).resolves.toEqual([]);
  });

  it("rejects cross-tenant storage paths before delete cleanup", async () => {
    const sut = service({
      prisma: {
        aiKnowledgeDocument: {
          findFirst: async () => ({
            id: "doc-1",
            tenantId: "tenant-a",
            title: "Leaked path",
            category: "POLICY",
            content: "",
            filePath: "tenants/tenant-b/knowledge/doc-1/policy.txt",
            chunkCount: 0
          })
        }
      },
      storageProvider: { delete: async () => true }
    });

    await expect(sut.deleteDocument("tenant-a", "doc-1", "user-1")).rejects.toThrow();
  });
});
