import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class IdCardService {
  constructor(private readonly prisma: PrismaService) {}

  async getIdCardData(tenantId: string, employeeId: string) {
    const [employee, tenant, profile] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: employeeId, tenantId },
        include: {
          department: true,
          designation: true,
          businessUnit: true
        }
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { branding: true }
      }),
      this.prisma.employeeProfile.findUnique({
        where: { employeeId }
      })
    ]);

    if (!employee || !tenant) {
      throw new NotFoundException("Employee or Organization record not found.");
    }

    const qrPayload = JSON.stringify({
      org: tenant.slug,
      code: employee.employeeCode,
      name: employee.fullName,
      dept: employee.department.name,
      role: employee.designation.name,
      valid: true,
      issued: employee.joiningDate.toISOString().slice(0, 10)
    });

    const emergency =
      (profile?.emergencyContactJson as { phone?: string })?.phone ||
      (employee.emergencyContact as { phone?: string })?.phone ||
      employee.phone ||
      null;

    return {
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      preferredName: employee.preferredName,
      department: employee.department.name,
      designation: employee.designation.name,
      businessUnit: employee.businessUnit?.name || "Corporate",
      bloodGroup: profile?.bloodGroup || "O+",
      joiningDate: employee.joiningDate.toISOString(),
      profilePhoto: profile?.profilePhoto || employee.profilePhotoObjectKey || null,
      emergencyContactPhone: emergency,
      qrCodePayload: qrPayload,
      companyName: tenant.name,
      companyLogoUrl: tenant.branding?.logoObjectKey || null,
      primaryColor: tenant.branding?.primaryColor || "#1f8f5f"
    };
  }

  async generateIdCardPdf(tenantId: string, employeeId: string): Promise<{ buffer: Buffer; filename: string }> {
    const card = await this.getIdCardData(tenantId, employeeId);

    // Standard vector PDF representation for CR-80 format badge
    const lines = [
      "%PDF-1.4",
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 242 380] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
      "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
      "4 0 obj << /Length 450 >> stream",
      "0.12 0.56 0.37 rg",
      "0 320 242 60 re f",
      "0 g",
      "BT /F1 14 Tf 15 345 Td (" + card.companyName.replace(/[()]/g, "") + ") Tj ET",
      "BT /F1 9 Tf 15 330 Td (DIGITAL WORKPLACE ID) Tj ET",
      "0.92 0.94 0.96 rg",
      "71 200 100 100 re f",
      "0 g",
      "BT /F1 12 Tf 75 245 Td (PHOTO / BADGE) Tj ET",
      "BT /F1 14 Tf 15 170 Td (" + card.fullName.replace(/[()]/g, "") + ") Tj ET",
      "BT /F1 10 Tf 15 152 Td (" + card.designation.replace(/[()]/g, "") + ") Tj ET",
      "BT /F1 9 Tf 15 136 Td (Dept: " + card.department.replace(/[()]/g, "") + ") Tj ET",
      "BT /F1 9 Tf 15 120 Td (Emp Code: " + card.employeeCode.replace(/[()]/g, "") + ") Tj ET",
      "BT /F1 9 Tf 15 104 Td (Blood Group: " + (card.bloodGroup || "N/A") + ") Tj ET",
      "0.12 0.56 0.37 rg",
      "15 35 212 55 re f",
      "1 g",
      "BT /F1 8 Tf 25 70 Td (VERIFIED VC-WMS DIGITAL CREDENTIAL) Tj ET",
      "BT /F1 8 Tf 25 55 Td (Emergency: " + (card.emergencyContactPhone || "N/A") + ") Tj ET",
      "BT /F1 7 Tf 25 42 Td (Issued: " + card.joiningDate.slice(0, 10) + ") Tj ET",
      "endstream",
      "endobj",
      "xref",
      "0 6",
      "0000000000 65535 f ",
      "0000000009 00000 n ",
      "0000000058 00000 n ",
      "0000000115 00000 n ",
      "0000000300 00000 n ",
      "0000000235 00000 n ",
      "trailer << /Size 6 /Root 1 0 R >>",
      "startxref",
      "800",
      "%%EOF"
    ];

    const pdfBuffer = Buffer.from(lines.join("\n"), "utf-8");
    const filename = `id_card_${card.employeeCode.toLowerCase()}.pdf`;

    return { buffer: pdfBuffer, filename };
  }
}
