import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { STORAGE_PROVIDER, type StorageProvider } from "../storage/storage.provider.js";
import { ReceiptOcrEngine } from "./engines/receipt-ocr.engine.js";
import type { UploadReceiptDto } from "./finance.schemas.js";
import { VIRUS_SCAN_PROVIDER, type VirusScanProvider } from "./virus-scan.provider.js";

interface Actor {
  userId: string;
  membershipId: string;
}

@Injectable()
export class ReceiptStorageService {
  private readonly ocrEngine = new ReceiptOcrEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(VIRUS_SCAN_PROVIDER) private readonly virusScanner: VirusScanProvider
  ) {}

  async upload(tenantId: string, actor: Actor, dto: UploadReceiptDto) {
    const item = await this.prisma.expenseItem.findFirst({ where: { tenantId, id: dto.itemId }, include: { claim: true } });
    if (!item) throw new NotFoundException("Expense item not found.");

    const buffer = Buffer.from(dto.base64, "base64");
    const scan = await this.virusScanner.scan(buffer, dto.fileName);
    if (!scan.clean) throw new BadRequestException("Receipt failed virus scan.");

    const contentHash = createHash("sha256").update(buffer).digest("hex");
    const key = this.receiptKey(tenantId, item.claimId, dto.fileName);
    const thumbnailKey = this.receiptKey(tenantId, item.claimId, `thumb-${dto.fileName}.txt`);
    const upload = await this.storage.upload(key, buffer, dto.contentType);
    await this.storage.upload(thumbnailKey, Buffer.from(`thumbnail:${dto.fileName}:${buffer.length}`), "text/plain");
    const ocr = await this.ocrEngine.extract({
      fileName: dto.fileName,
      fileType: dto.fileType,
      sourceText: dto.ocrText ?? "",
      contentHash
    });
    const duplicate = await this.prisma.expenseReceipt.findFirst({
      where: { tenantId, contentHash },
      select: { id: true }
    });
    const receipt = await this.prisma.expenseReceipt.create({
      data: {
        tenantId,
        itemId: item.id,
        fileUrl: upload.path,
        fileName: dto.fileName,
        fileType: dto.fileType,
        fileSizeBytes: upload.size,
        ocrMerchant: ocr.merchantName,
        ocrInvoiceNumber: ocr.invoiceNumber,
        ocrDate: ocr.invoiceDate ? new Date(ocr.invoiceDate) : undefined,
        ocrAmount: ocr.totalAmount,
        ocrGstNumber: ocr.gstNumber,
        ocrTaxAmount: ocr.taxAmount,
        ocrRawJson: { ...ocr, scan, thumbnailKey } as unknown as Prisma.InputJsonValue,
        contentHash,
        isDuplicate: Boolean(duplicate)
      }
    });
    await this.auditService.record({
      tenantId,
      actorUserId: actor.userId,
      actorMembershipId: actor.membershipId,
      action: "finance.receipt.uploaded",
      resourceType: "expense_receipt",
      resourceId: receipt.id,
      metadata: { receiptId: receipt.id, itemId: item.id, claimId: item.claimId, duplicate: Boolean(duplicate), scan } as unknown as Prisma.InputJsonValue
    });
    return {
      receipt,
      metadata: { key: upload.path, thumbnailKey, size: upload.size, contentHash, duplicate: Boolean(duplicate), scan },
      urls: {
        downloadUrl: await this.storage.getDownloadUrl(upload.path),
        previewUrl: await this.storage.getDownloadUrl(thumbnailKey),
        token: randomBytes(18).toString("base64url")
      },
      ocr
    };
  }

  async getReceiptAccess(tenantId: string, receiptId: string) {
    const receipt = await this.prisma.expenseReceipt.findFirst({ where: { tenantId, id: receiptId } });
    if (!receipt) throw new NotFoundException("Receipt not found.");
    return {
      receiptId: receipt.id,
      downloadUrl: await this.storage.getDownloadUrl(receipt.fileUrl),
      previewUrl: await this.storage.getDownloadUrl(receipt.fileUrl),
      token: randomBytes(18).toString("base64url")
    };
  }

  private receiptKey(tenantId: string, claimId: string, fileName: string) {
    const cleanFileName = fileName.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
    return `tenants/${tenantId}/finance/receipts/${claimId}/${Date.now()}-${cleanFileName}`;
  }
}
