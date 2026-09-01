/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdCardService } from "../src/modules/ess/services/id-card.service.js";

describe("Digital ID Card Service (Task 18)", () => {
  let idCardService: IdCardService;
  let mockPrisma: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const employeeId = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findFirst: vi.fn().mockResolvedValue({
          id: employeeId,
          tenantId,
          employeeCode: "VC-1001",
          fullName: "Vikram Chandra",
          preferredName: "Vikram",
          phone: "+919876543210",
          emergencyContact: { phone: "+919999900000" },
          joiningDate: new Date("2024-02-01"),
          department: { name: "Agriculture Ops" },
          designation: { name: "Operations Lead" },
          businessUnit: { name: "Farm Management" },
          profilePhotoObjectKey: "photos/vikram.jpg"
        })
      },
      tenant: {
        findUnique: vi.fn().mockResolvedValue({
          id: tenantId,
          name: "VC Organics Ltd",
          slug: "vc-organics",
          branding: {
            logoObjectKey: "https://vc-organics.com/logo.png",
            primaryColor: "#1f8f5f"
          }
        })
      },
      employeeProfile: {
        findUnique: vi.fn().mockResolvedValue({
          employeeId,
          bloodGroup: "B+",
          profilePhoto: "photos/vikram_hd.jpg"
        })
      }
    };

    idCardService = new IdCardService(mockPrisma);
  });

  it("generates digital ID card payload with dynamic QR code payload and tenant branding", async () => {
    const card = await idCardService.getIdCardData(tenantId, employeeId);

    expect(card).toBeDefined();
    expect(card.employeeCode).toBe("VC-1001");
    expect(card.fullName).toBe("Vikram Chandra");
    expect(card.bloodGroup).toBe("B+");
    expect(card.companyName).toBe("VC Organics Ltd");
    expect(card.primaryColor).toBe("#1f8f5f");

    const parsedQr = JSON.parse(card.qrCodePayload);
    expect(parsedQr.code).toBe("VC-1001");
    expect(parsedQr.valid).toBe(true);
  });

  it("generates downloadable vector PDF of printable ID badge", async () => {
    const { buffer, filename } = await idCardService.generateIdCardPdf(tenantId, employeeId);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(100);
    expect(filename).toContain("id_card_vc-1001.pdf");
    expect(buffer.toString("utf-8")).toContain("%PDF-1.4");
  });
});
