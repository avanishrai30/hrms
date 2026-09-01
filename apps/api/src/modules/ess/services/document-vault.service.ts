import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { AuditService } from "../../audit/audit.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { STORAGE_PROVIDER, type StorageProvider } from "../../storage/storage.provider.js";
import type {
  DocumentFilterDto,
  UploadDocumentDto,
  VerifyDocumentDto
} from "../ess.schemas.js";

@Injectable()
export class DocumentVaultService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
    private readonly auditService: AuditService
  ) {}

  async listDocuments(tenantId: string, employeeId?: string, filter?: DocumentFilterDto) {
    const where: Prisma.EmployeeDocumentWhereInput = {
      tenantId,
      ...(employeeId ? { employeeId } : {})
    };

    if (filter?.documentType) {
      where.documentType = filter.documentType;
    }

    if (filter?.isVerified !== undefined) {
      where.isVerified = filter.isVerified;
    }

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { fileName: { contains: filter.search, mode: "insensitive" } }
      ];
    }

    const docs = await this.prisma.employeeDocument.findMany({
      where,
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        verifier: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: filter?.limit ?? 50,
      skip: filter?.offset ?? 0
    });

    return Promise.all(
      docs.map(async (doc) => {
        let isExpiringSoon = false;
        let daysUntilExpiry: number | null = null;
        if (doc.expiryDate) {
          const diffMs = doc.expiryDate.getTime() - Date.now();
          daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        }

        const downloadUrl = await this.storageProvider.getDownloadUrl(doc.filePath, 3600);

        return {
          id: doc.id,
          tenantId: doc.tenantId,
          employeeId: doc.employeeId,
          employeeName: doc.employee.fullName,
          employeeCode: doc.employee.employeeCode,
          documentType: doc.documentType,
          title: doc.title,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          filePath: doc.filePath,
          downloadUrl,
          isVerified: doc.isVerified,
          verifiedBy: doc.verifiedBy,
          verifiedByName: doc.verifier?.email ?? null,
          verifiedAt: doc.verifiedAt ? doc.verifiedAt.toISOString() : null,
          expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
          isExpiringSoon,
          daysUntilExpiry,
          metadata: (doc.metadata as Record<string, unknown>) ?? {},
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString()
        };
      })
    );
  }

  async uploadDocument(
    tenantId: string,
    targetEmployeeId: string,
    dto: UploadDocumentDto,
    fileBuffer?: Buffer,
    actorUserId?: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: targetEmployeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException("Employee record not found in this organization.");
    }

    const objectKey = `documents/${targetEmployeeId}/${Date.now()}_${dto.fileName.replace(/\s+/g, "_")}`;
    const bufferToSave = fileBuffer ?? (dto.fileBase64 ? Buffer.from(dto.fileBase64, "base64") : Buffer.from(""));
    const finalSize = dto.fileSize ?? bufferToSave.length;

    await this.storageProvider.upload(objectKey, bufferToSave, dto.mimeType);

    const doc = await this.prisma.employeeDocument.create({
      data: {
        tenantId,
        employeeId: targetEmployeeId,
        documentType: dto.documentType,
        title: dto.title,
        fileName: dto.fileName,
        fileSize: finalSize,
        mimeType: dto.mimeType,
        filePath: objectKey,
        isVerified: false,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue
      },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } }
      }
    });

    if (actorUserId) {
      await this.auditService.record({
        tenantId,
        actorUserId,
        action: "documents.uploaded",
        resourceType: "employee_document",
        resourceId: doc.id,
        after: {
          employeeId: targetEmployeeId,
          documentType: dto.documentType,
          title: dto.title,
          fileName: dto.fileName
        }
      });
    }

    const downloadUrl = await this.storageProvider.getDownloadUrl(objectKey, 3600);

    return {
      id: doc.id,
      tenantId: doc.tenantId,
      employeeId: doc.employeeId,
      employeeName: doc.employee.fullName,
      employeeCode: doc.employee.employeeCode,
      documentType: doc.documentType,
      title: doc.title,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      filePath: doc.filePath,
      downloadUrl,
      isVerified: doc.isVerified,
      verifiedBy: null,
      verifiedByName: null,
      verifiedAt: null,
      expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
      isExpiringSoon: false,
      daysUntilExpiry: null,
      metadata: (doc.metadata as Record<string, unknown>) ?? {},
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }

  async getDocument(tenantId: string, documentId: string, actorUserId?: string) {
    const doc = await this.prisma.employeeDocument.findFirst({
      where: { id: documentId, tenantId },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        verifier: { select: { id: true, email: true } }
      }
    });
    if (!doc) {
      throw new NotFoundException("Document not found.");
    }

    if (actorUserId) {
      await this.auditService.record({
        tenantId,
        actorUserId,
        action: "documents.read",
        resourceType: "employee_document",
        resourceId: doc.id,
        after: { title: doc.title, documentType: doc.documentType }
      });
    }

    const downloadUrl = await this.storageProvider.getDownloadUrl(doc.filePath, 3600);

    let isExpiringSoon = false;
    let daysUntilExpiry: number | null = null;
    if (doc.expiryDate) {
      const diffMs = doc.expiryDate.getTime() - Date.now();
      daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }

    return {
      id: doc.id,
      tenantId: doc.tenantId,
      employeeId: doc.employeeId,
      employeeName: doc.employee.fullName,
      employeeCode: doc.employee.employeeCode,
      documentType: doc.documentType,
      title: doc.title,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      filePath: doc.filePath,
      downloadUrl,
      isVerified: doc.isVerified,
      verifiedBy: doc.verifiedBy,
      verifiedByName: doc.verifier?.email ?? null,
      verifiedAt: doc.verifiedAt ? doc.verifiedAt.toISOString() : null,
      expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
      isExpiringSoon,
      daysUntilExpiry,
      metadata: (doc.metadata as Record<string, unknown>) ?? {},
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }

  async verifyDocument(
    tenantId: string,
    documentId: string,
    verifierUserId: string,
    dto: VerifyDocumentDto
  ) {
    const existing = await this.prisma.employeeDocument.findFirst({
      where: { id: documentId, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Document not found.");
    }

    const currentMeta = (existing.metadata as Record<string, unknown>) ?? {};
    if (dto.remarks) {
      currentMeta.verificationRemarks = dto.remarks;
    }

    const updated = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        isVerified: dto.isVerified,
        verifiedBy: verifierUserId,
        verifiedAt: new Date(),
        metadata: currentMeta as Prisma.InputJsonValue
      },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
        verifier: { select: { id: true, email: true } }
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: verifierUserId,
      action: "documents.verified",
      resourceType: "employee_document",
      resourceId: updated.id,
      before: { isVerified: existing.isVerified },
      after: { isVerified: updated.isVerified, remarks: dto.remarks }
    });

    return updated;
  }

  async deleteDocument(tenantId: string, documentId: string, actorUserId: string) {
    const existing = await this.prisma.employeeDocument.findFirst({
      where: { id: documentId, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Document not found.");
    }

    await this.storageProvider.delete(existing.filePath).catch(() => null);

    await this.prisma.employeeDocument.delete({
      where: { id: documentId }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      action: "documents.deleted",
      resourceType: "employee_document",
      resourceId: documentId,
      before: { title: existing.title, filePath: existing.filePath }
    });

    return { success: true, message: "Document successfully deleted." };
  }

  async getExpiringDocuments(tenantId: string, employeeId?: string, withinDays = 30) {
    return this.listDocuments(tenantId, employeeId, {
      expiringWithinDays: withinDays,
      limit: 20,
      offset: 0
    });
  }
}
