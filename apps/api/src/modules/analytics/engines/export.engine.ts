import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  Optional
} from "@nestjs/common";
import { QueueService } from "../../queue/queue.service.js";
import { STORAGE_PROVIDER, type StorageProvider } from "../../storage/storage.provider.js";
import type { ReportFormatType } from "../analytics.schemas.js";

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}

export interface ExportDataset {
  title: string;
  tenantName?: string;
  columns: ExportColumn[];
  rows: Array<Record<string, unknown>>;
  generatedAt?: Date;
}

export interface ExportResult {
  buffer?: Buffer;
  filename: string;
  contentType: string;
  downloadUrl?: string;
  isAsync: boolean;
  jobId?: string;
  rowCount: number;
}

@Injectable()
export class ExportEngine {
  private readonly logger = new Logger(ExportEngine.name);

  constructor(
    @Optional() private readonly queueService?: QueueService,
    @Optional() @Inject(STORAGE_PROVIDER) private readonly storageProvider?: StorageProvider
  ) {}

  /**
   * Main export handler: dispatches to BullMQ background queue if >1,000 rows or async requested,
   * otherwise returns synchronously generated buffer.
   */
  async exportDataset(
    tenantId: string,
    dataset: ExportDataset,
    format: ReportFormatType = "CSV",
    options?: { asyncExport?: boolean; actorUserId?: string }
  ): Promise<ExportResult> {
    const isLarge = dataset.rows.length > 1000;
    const requiresAsync = Boolean(options?.asyncExport || isLarge);
    const extension = this.getExtension(format);
    const contentType = this.getContentType(format);
    const filename = `${dataset.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.${extension}`;

    if (requiresAsync && this.queueService) {
      const jobId = await this.queueService.addJob("exports", "generate_export", {
        tenantId,
        actorUserId: options?.actorUserId,
        datasetTitle: dataset.title,
        columns: dataset.columns,
        rowCount: dataset.rows.length,
        format,
        filename,
        createdAt: new Date().toISOString()
      });

      this.logger.log(
        `Dispatched async export job ${jobId} for tenant ${tenantId} (${dataset.rows.length} records)`
      );

      return {
        filename,
        contentType,
        isAsync: true,
        jobId,
        rowCount: dataset.rows.length
      };
    }

    // Synchronous generation
    const buffer = this.generateBuffer(dataset, format);

    let downloadUrl: string | undefined;
    if (this.storageProvider) {
      try {
        const storageKey = `exports/${tenantId}/${filename}`;
        await this.storageProvider.upload(storageKey, buffer, contentType);
        downloadUrl = await this.storageProvider.getDownloadUrl(storageKey);
      } catch (err: unknown) {
        this.logger.warn(`Failed to persist export to StorageProvider: ${err instanceof Error ? err.message : ""}`);
      }
    }

    return {
      buffer,
      filename,
      contentType,
      downloadUrl,
      isAsync: false,
      rowCount: dataset.rows.length
    };
  }

  /**
   * Generates formatted file Buffer based on target format
   */
  generateBuffer(dataset: ExportDataset, format: ReportFormatType): Buffer {
    switch (format) {
      case "CSV":
        return this.generateCsv(dataset);
      case "EXCEL":
        return this.generateExcel(dataset);
      case "JSON":
        return this.generateJson(dataset);
      case "PDF":
        return this.generatePdf(dataset);
      default:
        throw new BadRequestException(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generates standard RFC 4180 CSV buffer
   */
  generateCsv(dataset: ExportDataset): Buffer {
    const headers = dataset.columns.map((c) => this.escapeCsv(c.header)).join(",");
    const rows = dataset.rows.map((row) =>
      dataset.columns
        .map((col) => {
          const val = row[col.key];
          return this.escapeCsv(val === null || val === undefined ? "" : String(val));
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\r\n");
    return Buffer.from(csvContent, "utf-8");
  }

  /**
   * Generates Tab-Separated Values (TSV) with UTF-8 BOM for Microsoft Excel compatibility
   */
  generateExcel(dataset: ExportDataset): Buffer {
    const BOM = "\uFEFF";
    const headers = dataset.columns.map((c) => c.header.replace(/\t/g, " ")).join("\t");
    const rows = dataset.rows.map((row) =>
      dataset.columns
        .map((col) => {
          const val = row[col.key];
          return (val === null || val === undefined ? "" : String(val)).replace(/\t|\r|\n/g, " ");
        })
        .join("\t")
    );

    const content = BOM + [headers, ...rows].join("\r\n");
    return Buffer.from(content, "utf-8");
  }

  /**
   * Generates structured JSON export buffer
   */
  generateJson(dataset: ExportDataset): Buffer {
    const jsonObject = {
      title: dataset.title,
      tenantName: dataset.tenantName ?? "VC Organics HRMS",
      generatedAt: (dataset.generatedAt ?? new Date()).toISOString(),
      rowCount: dataset.rows.length,
      columns: dataset.columns,
      data: dataset.rows
    };
    return Buffer.from(JSON.stringify(jsonObject, null, 2), "utf-8");
  }

  /**
   * Generates deterministic pure vector PDF-1.4 summary document
   */
  generatePdf(dataset: ExportDataset): Buffer {
    const objects: string[] = [];

    const addObject = (content: string): number => {
      objects.push(content);
      return objects.length;
    };

    const title = dataset.title.replace(/[()\\]/g, "");
    const generatedAt = (dataset.generatedAt ?? new Date()).toLocaleDateString();
    const rowCount = dataset.rows.length;

    // Build PDF content stream
    let contentStream = `
q
0.05 0.59 0.41 rg
0 780 595.28 61.89 re f
1 1 1 rg
BT
/F1 16 Tf
40 805 Td
(${title}) Tj
/F1 9 Tf
0 -18 Td
(VC Organics HRMS • Generated: ${generatedAt} • Total Records: ${rowCount}) Tj
ET

0 0 0 rg
BT
/F1 10 Tf
40 750 Td
`;

    // Print headers
    const headerLine = dataset.columns.map((c) => c.header).slice(0, 5).join("   |   ");
    contentStream += `(${headerLine.replace(/[()\\]/g, "")}) Tj\n0 -16 Td\n`;

    // Print top rows
    const previewRows = dataset.rows.slice(0, 30);
    for (const r of previewRows) {
      const rowLine = dataset.columns
        .slice(0, 5)
        .map((c) => String(r[c.key] ?? "-"))
        .join("   |   ");
      contentStream += `/F2 8 Tf\n(${rowLine.replace(/[()\\]/g, "")}) Tj\n0 -12 Td\n`;
    }

    if (dataset.rows.length > 30) {
      contentStream += `/F1 8 Tf\n(... and ${dataset.rows.length - 30} more records) Tj\n`;
    }

    contentStream += `
ET
Q
`;

    const streamLen = Buffer.byteLength(contentStream, "utf-8");

    // Catalog & Pages
    addObject("<< /Type /Catalog /Pages 2 0 R >>"); // 1
    addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"); // 2
    addObject(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>"
    ); // 3
    addObject(`<< /Length ${streamLen} >>\nstream\n${contentStream}\nendstream`); // 4
    addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"); // 5
    addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"); // 6

    let pdf = "%PDF-1.4\n";
    const xrefOffsets: number[] = [0];

    for (let i = 0; i < objects.length; i++) {
      const offset = Buffer.byteLength(pdf, "utf-8");
      xrefOffsets.push(offset);
      pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefStart = Buffer.byteLength(pdf, "utf-8");
    pdf += "xref\n";
    pdf += `0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";

    for (let i = 1; i <= objects.length; i++) {
      const offset = xrefOffsets[i] ?? 0;
      pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    }

    pdf += "trailer\n";
    pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += "startxref\n";
    pdf += `${xrefStart}\n`;
    pdf += "%%EOF";

    return Buffer.from(pdf, "utf-8");
  }

  private escapeCsv(val: string): string {
    if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }

  private getExtension(format: ReportFormatType): string {
    switch (format) {
      case "CSV":
        return "csv";
      case "EXCEL":
        return "xls";
      case "JSON":
        return "json";
      case "PDF":
        return "pdf";
      default:
        return "csv";
    }
  }

  private getContentType(format: ReportFormatType): string {
    switch (format) {
      case "CSV":
        return "text/csv";
      case "EXCEL":
        return "application/vnd.ms-excel";
      case "JSON":
        return "application/json";
      case "PDF":
        return "application/pdf";
      default:
        return "application/octet-stream";
    }
  }
}
