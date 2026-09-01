/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { EssService } from "../src/modules/ess/ess.service.js";
import { DocumentVaultService } from "../src/modules/ess/services/document-vault.service.js";
import { EmployeeRequestService } from "../src/modules/ess/services/employee-request.service.js";
import { AnnouncementService } from "../src/modules/ess/services/announcement.service.js";

describe("ESS Multi-Tenant Isolation (Task 18)", () => {
  const tenantA = "11111111-1111-1111-1111-111111111111";
  const tenantB = "22222222-2222-2222-2222-222222222222";
  const employeeIdA = "33333333-3333-3333-3333-333333333333";
  const docIdA = "44444444-4444-4444-4444-444444444444";
  const reqIdA = "55555555-5555-5555-5555-555555555555";
  const annIdA = "66666666-6666-6666-6666-666666666666";

  let essService: EssService;
  let vaultService: DocumentVaultService;
  let reqService: EmployeeRequestService;
  let annService: AnnouncementService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.tenantId === tenantA && where?.id === employeeIdA) {
            return Promise.resolve({
              id: employeeIdA,
              tenantId: tenantA,
              employeeCode: "EMP-A",
              fullName: "Tenant A Employee",
              email: "a@tenant-a.com",
              department: { name: "Dept A" },
              designation: { name: "Role A" },
              joiningDate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          return Promise.resolve(null);
        })
      },
      employeeDocument: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.tenantId === tenantA && where?.id === docIdA) {
            return Promise.resolve({
              id: docIdA,
              tenantId: tenantA,
              employeeId: employeeIdA,
              filePath: "docs/a.pdf",
              documentType: "PAN",
              title: "Pan A",
              fileName: "a.pdf",
              fileSize: 100,
              mimeType: "application/pdf",
              isVerified: true,
              employee: { fullName: "Tenant A Employee", employeeCode: "EMP-A" },
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          if (where?.tenantId === tenantA) {
            return Promise.resolve([{ id: docIdA, tenantId: tenantA, employeeId: employeeIdA, filePath: "docs/a.pdf", employee: { fullName: "A", employeeCode: "EMP-A" }, createdAt: new Date(), updatedAt: new Date() }]);
          }
          return Promise.resolve([]);
        })
      },
      employeeRequest: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.tenantId === tenantA && where?.id === reqIdA) {
            return Promise.resolve({
              id: reqIdA,
              tenantId: tenantA,
              employeeId: employeeIdA,
              requestType: "ADDRESS_CHANGE",
              status: "PENDING",
              payloadJson: {},
              submittedAt: new Date(),
              employee: { id: employeeIdA, fullName: "Tenant A Employee", employeeCode: "EMP-A" },
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          if (where?.tenantId === tenantA) {
            return Promise.resolve([{ id: reqIdA, tenantId: tenantA, employeeId: employeeIdA, requestType: "ADDRESS_CHANGE", status: "PENDING", submittedAt: new Date(), employee: { fullName: "A", employeeCode: "A" }, createdAt: new Date(), updatedAt: new Date() }]);
          }
          return Promise.resolve([]);
        })
      },
      announcement: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.tenantId === tenantA && where?.id === annIdA) {
            return Promise.resolve({
              id: annIdA,
              tenantId: tenantA,
              title: "Ann A",
              content: "Content A",
              priority: "HIGH",
              isPinned: true,
              publishedAt: new Date(),
              createdBy: "user-a",
              author: { email: "a@tenant-a.com" },
              acknowledgements: [],
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockImplementation(({ where }) => {
          if (where?.tenantId === tenantA) {
            return Promise.resolve([{ id: annIdA, tenantId: tenantA, title: "Ann A", content: "A", priority: "HIGH", isPinned: true, publishedAt: new Date(), author: { email: "a@a.com" }, acknowledgements: [], createdAt: new Date(), updatedAt: new Date() }]);
          }
          return Promise.resolve([]);
        })
      }
    };

    const mockAudit = { record: vi.fn().mockResolvedValue({ id: "audit-1" }) };
    const mockStorage = { getDownloadUrl: vi.fn().mockResolvedValue("https://signed.url"), upload: vi.fn(), delete: vi.fn() };
    const mockNotif = { sendNotification: vi.fn().mockResolvedValue({ success: true }) };

    vaultService = new DocumentVaultService(mockPrisma, mockStorage as any, mockAudit as any);
    reqService = new EmployeeRequestService(mockPrisma, mockAudit as any);
    annService = new AnnouncementService(mockPrisma, mockAudit as any, mockNotif as any);
    essService = new EssService(mockPrisma, mockAudit as any, vaultService, reqService, annService);
  });

  it("prevents Tenant B from viewing Tenant A's employee profile", async () => {
    await expect(essService.getProfile(tenantB, employeeIdA)).rejects.toThrow(NotFoundException);
  });

  it("prevents Tenant B from downloading Tenant A's vault documents", async () => {
    await expect(vaultService.getDocument(tenantB, docIdA)).rejects.toThrow(NotFoundException);
  });

  it("prevents Tenant B from resolving Tenant A's employee requests", async () => {
    await expect(reqService.approveRequest(tenantB, reqIdA, "user-b", { comments: "ok" })).rejects.toThrow(
      NotFoundException
    );
  });

  it("prevents Tenant B from accessing Tenant A's announcements", async () => {
    await expect(annService.getAnnouncement(tenantB, annIdA)).rejects.toThrow(NotFoundException);
  });
});
