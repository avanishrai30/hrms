/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentVaultService } from "../src/modules/ess/services/document-vault.service.js";
import { EmployeeRequestService } from "../src/modules/ess/services/employee-request.service.js";
import { EssService } from "../src/modules/ess/ess.service.js";

describe("ESS Audit Trail Logging (Task 18)", () => {
  let essService: EssService;
  let vaultService: DocumentVaultService;
  let reqService: EmployeeRequestService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockStorage: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const employeeId = "22222222-2222-2222-2222-222222222222";
  const actorUserId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    mockStorage = {
      upload: vi.fn().mockResolvedValue({ path: "documents/test.pdf", size: 100 }),
      getDownloadUrl: vi.fn().mockResolvedValue("https://signed.url"),
      delete: vi.fn().mockResolvedValue(true)
    };

    mockPrisma = {
      employee: {
        findFirst: vi.fn().mockResolvedValue({
          id: employeeId,
          tenantId,
          employeeCode: "EMP001",
          fullName: "John Doe",
          department: { name: "Engineering" },
          designation: { name: "Dev" },
          businessUnit: { name: "Tech" },
          joiningDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        update: vi.fn().mockResolvedValue({ id: employeeId })
      },
      employeeProfile: {
        upsert: vi.fn().mockResolvedValue({ id: "prof-1", updatedAt: new Date() })
      },
      employeeDocument: {
        create: vi.fn().mockResolvedValue({
          id: "doc-1",
          tenantId,
          employeeId,
          title: "Offer",
          fileName: "offer.pdf",
          fileSize: 500,
          mimeType: "application/pdf",
          filePath: "docs/offer.pdf",
          isVerified: false,
          employee: { fullName: "John", employeeCode: "EMP001" },
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        findFirst: vi.fn().mockResolvedValue({
          id: "doc-1",
          tenantId,
          employeeId,
          title: "Offer",
          fileName: "offer.pdf",
          fileSize: 500,
          mimeType: "application/pdf",
          filePath: "docs/offer.pdf",
          isVerified: false,
          employee: { fullName: "John", employeeCode: "EMP001" },
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        update: vi.fn().mockResolvedValue({
          id: "doc-1",
          isVerified: true,
          employee: { fullName: "John", employeeCode: "EMP001" }
        })
      },
      employeeRequest: {
        create: vi.fn().mockResolvedValue({
          id: "req-1",
          tenantId,
          employeeId,
          requestType: "BANK_CHANGE",
          status: "PENDING",
          payloadJson: {},
          submittedAt: new Date(),
          employee: { fullName: "John", employeeCode: "EMP001" },
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    };

    vaultService = new DocumentVaultService(mockPrisma, mockStorage, mockAudit);
    reqService = new EmployeeRequestService(mockPrisma, mockAudit);
    essService = new EssService(mockPrisma, mockAudit, vaultService, reqService, {} as any);
  });

  it("emits profile.updated audit record on profile modification", async () => {
    await essService.updateProfile(tenantId, employeeId, { preferredName: "Johnny" }, actorUserId);

    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        actorUserId,
        action: "profile.updated",
        resourceType: "employee_profile"
      })
    );
  });

  it("emits documents.read audit record on document access", async () => {
    await vaultService.getDocument(tenantId, "doc-1", actorUserId);

    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        actorUserId,
        action: "documents.read",
        resourceType: "employee_document",
        resourceId: "doc-1"
      })
    );
  });

  it("emits requests.created audit record on request submission", async () => {
    await reqService.submitRequest(
      tenantId,
      employeeId,
      { requestType: "BANK_CHANGE", reason: "Account change", payload: {} },
      actorUserId
    );

    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        actorUserId,
        action: "requests.created",
        resourceType: "employee_request"
      })
    );
  });
});
