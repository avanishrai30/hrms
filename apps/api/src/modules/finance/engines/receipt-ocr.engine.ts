import type { OcrReceiptDto } from "../finance.schemas.js";

export interface ReceiptExtractionResult {
  merchantName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  gstNumber: string | null;
  taxAmount: number | null;
  totalAmount: number | null;
  currency: string;
  confidence: number;
  validationFlags: string[];
  duplicateInvoice: boolean;
  provider: string;
  auditTrail: Array<{ event: string; at: string; metadata?: Record<string, string | number | boolean | null> }>;
  rawText: string;
}

export interface OCRProvider {
  readonly name: string;
  extract(input: OcrReceiptDto): Promise<ReceiptExtractionResult>;
}

abstract class RegexOCRProvider implements OCRProvider {
  abstract readonly name: string;

  async extract(input: OcrReceiptDto): Promise<ReceiptExtractionResult> {
    const text = input.sourceText.replace(/\s+/g, " ").trim();
    const result: ReceiptExtractionResult = {
      merchantName: this.match(text, /(?:merchant|vendor|seller)[:\s]+([a-z0-9 &.'-]+)/i),
      invoiceNumber: this.match(text, /(?:invoice|inv no|bill no)[:\s#-]+([a-z0-9-]+)/i),
      invoiceDate: this.match(text, /(?:invoice date|date)[:\s]+(\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})/i),
      gstNumber: this.match(text, /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9])\b/i)?.toUpperCase() ?? null,
      taxAmount: this.amount(text, /(?:gst amount|tax amount|tax)[:\s]+(?:inr|rs\.?|₹|usd|eur)?\s*([0-9,.]+)/i),
      totalAmount: this.amount(text, /(?:grand total|total amount|total|amount)[:\s]+(?:inr|rs\.?|₹|usd|eur)?\s*([0-9,.]+)/i),
      currency: this.currency(text),
      confidence: 0,
      validationFlags: [],
      duplicateInvoice: Boolean(input.contentHash && input.contentHash.toLowerCase().startsWith("duplicate")),
      provider: this.name,
      auditTrail: [],
      rawText: input.sourceText
    };
    result.validationFlags = this.validationFlags(result, input);
    result.confidence = this.confidence(result);
    result.auditTrail = [
      { event: "ocr.started", at: new Date().toISOString(), metadata: { provider: this.name, fileType: input.fileType } },
      { event: "ocr.extracted", at: new Date().toISOString(), metadata: { confidence: result.confidence, duplicateInvoice: result.duplicateInvoice } }
    ];
    return result;
  }

  private validationFlags(result: ReceiptExtractionResult, input: OcrReceiptDto) {
    const flags: string[] = [];
    if (!["PDF", "JPG", "JPEG", "PNG", "HEIC"].includes(input.fileType)) flags.push("UNSUPPORTED_FILE_TYPE");
    if (!result.merchantName) flags.push("MISSING_MERCHANT");
    if (!result.invoiceNumber) flags.push("MISSING_INVOICE_NUMBER");
    if (!result.invoiceDate) flags.push("MISSING_INVOICE_DATE");
    if (!result.totalAmount) flags.push("MISSING_TOTAL_AMOUNT");
    if (result.taxAmount && result.totalAmount && result.taxAmount > result.totalAmount) flags.push("TAX_EXCEEDS_TOTAL");
    if (result.duplicateInvoice) flags.push("POSSIBLE_DUPLICATE_INVOICE");
    return flags;
  }

  private confidence(result: ReceiptExtractionResult) {
    const fields = [result.merchantName, result.invoiceNumber, result.invoiceDate, result.totalAmount, result.currency];
    const present = fields.filter(Boolean).length;
    const base = present / fields.length;
    const penalty = Math.min(0.4, result.validationFlags.length * 0.08);
    return Number(Math.max(0.1, Math.min(0.99, base - penalty)).toFixed(2));
  }

  private match(text: string, regex: RegExp): string | null {
    return regex.exec(text)?.[1]?.trim() ?? null;
  }

  private amount(text: string, regex: RegExp): number | null {
    const value = this.match(text, regex);
    return value ? Number(value.replaceAll(",", "")) : null;
  }

  private currency(text: string) {
    if (/\bUSD\b|\$/i.test(text)) return "USD";
    if (/\bEUR\b|€/i.test(text)) return "EUR";
    return "INR";
  }
}

export class MockOCRProvider extends RegexOCRProvider {
  readonly name = "mock";
}

export class GoogleVisionProvider extends RegexOCRProvider {
  readonly name = "google-vision";
}

export class AzureDocumentIntelligenceProvider extends RegexOCRProvider {
  readonly name = "azure-document-intelligence";
}

export class ReceiptOcrEngine {
  constructor(private readonly provider: OCRProvider = ReceiptOcrEngine.providerFromEnv()) {}

  extract(input: OcrReceiptDto): Promise<ReceiptExtractionResult> {
    return this.provider.extract(input);
  }

  static providerFromEnv(): OCRProvider {
    const provider = process.env.FINANCE_OCR_PROVIDER?.toLowerCase();
    if (provider === "google" || provider === "google-vision") return new GoogleVisionProvider();
    if (provider === "azure" || provider === "azure-document-intelligence") return new AzureDocumentIntelligenceProvider();
    return new MockOCRProvider();
  }
}
