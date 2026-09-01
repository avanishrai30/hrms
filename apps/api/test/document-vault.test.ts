/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentVaultService } from "../src/modules/ess/services/document-vault.service.js";

describe("Document Vault Service (Task 18)", () => {
  let vaultService: DocumentVaultService;
  let mockPrisma: any;
  let mockStorage: any;
  let mockAudit: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const employeeId = "22222222-2222-2222-2222-222222222222";
  const userId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findFirst: vi.fn().mockResolvedValue({ id: employeeId, tenantId, fullName: "John Doe", employeeCode: "EMP001" })
      },
      employeeDocument: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "doc-1",
            tenantId,
            employeeId,
            documentType: "PAN",
            title: "Pan Card",
            fileName: "pan.pdf",
            fileSize: 102400,
            mimeType: "application/pdf",
            filePath: "documents/2222/pan.pdf",
            isVerified: true,
            verifiedBy: userId,
            verifier: { email: "hr@test.com" },
            verifiedAt: new Date("2024-01-20"),
            expiryDate: new Date("2029-01-20"),
            metadata: {},
            employee: { fullName: "John Doe", employeeCode: "EMP001" },
            createdAt: new Date("2024-01-20"),
            updatedAt: new Date("2024-01-20")
          }
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: "doc-1",
          tenantId,
          employeeId,
          documentType: "PAN",
          title: "Pan Card",
          fileName: "pan.pdf",
          fileSize: 102400,
          mimeType: "application/pdf",
          filePath: "documents/2222/pan.pdf",
          isVerified: false,
          verifiedBy: null,
          verifier: null,
          verifiedAt: null,
          expiryDate: null,
          metadata: {},
          employee: { fullName: "John Doe", employeeCode: "EMP001" },
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date("2024-01-20")
        }),
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "doc-new",
            ...data,
            employee: { fullName: "John Doe", employeeCode: "EMP001" },
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ),
        update: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "doc-1",
            isVerified: data.isVerified,
            verifiedBy: data.verifiedBy,
            verifiedAt: data.verifiedAt,
            metadata: data.metadata,
            employee: { fullName: "John Doe", employeeCode: "EMP001" },
            verifier: { email: "hr@test.com" }
          })
        ),
        delete: vi.fn().mockResolvedValue({ id: "doc-1" })
      }
    };

    mockStorage = {
      upload: vi.fn().mockResolvedValue({ path: "documents/2222/test.pdf", size: 100 }),
      getDownloadUrl: vi.fn().mockResolvedValue("https://storage.local/presigned/test.pdf"),
      delete: vi.fn().mockResolvedValue(true)
    };

    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    vaultService = new DocumentVaultService(mockPrisma, mockStorage, mockAudit);
  });

  it("uploads a document to object storage and saves document metadata with audit log", async () => {
    const docDto = {
      documentType: "AADHAAR" as const,
      title: "Aadhaar Card Copy",
      fileName: "aadhaar.pdf",
      fileBase64: Buffer.from("dummy pdf content").toString("base64"),
      mimeType: "application/pdf"
    };

    const result = await vaultService.uploadDocument(tenantId, employeeId, docDto, undefined, userId);

    expect(result).toBeDefined();
    expect(mockStorage.upload).toHaveBeenCalled();
    expect(mockPrisma.employeeDocument.create).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        action: "documents.uploaded",
        resourceType: "employee_document"
      })
    );
  });

  it("verifies employee document status and records verifier audit trail", async () => {
    const verified = await vaultService.verifyDocument(tenantId, "doc-1", userId, {
      isVerified: true,
      remarks: "Original document verified against DigiLocker"
    });

    expect(verified.isVerified).toBe(true);
    expect(mockPrisma.employeeDocument.update).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        action: "documents.verified",
        resourceType: "employee_document"
      })
    );
  });

  it("deletes a document and its underlying storage object", async () => {
    const result = await vaultService.deleteDocument(tenantId, "doc-1", userId);

    expect(result.success).toBe(true);
    expect(mockStorage.delete).toHaveBeenCalled();
    expect(mockPrisma.employeeDocument.delete).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "documents.deleted"
      })
    );
  });
});
