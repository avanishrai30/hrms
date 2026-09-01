import { describe, expect, it } from "vitest";
import { ReceiptOcrEngine } from "./receipt-ocr.engine.js";

describe("ReceiptOcrEngine", () => {
  it("extracts merchant, invoice, date, amount, GST, and tax fields from receipt text", async () => {
    const result = await new ReceiptOcrEngine().extract({
      fileName: "hotel.png",
      fileType: "PNG",
      sourceText: "Merchant: Green Stay Invoice: INV-42 Date: 2026-09-01 GST: 29ABCDE1234F1Z5 Tax: 450 Total: INR 5450"
    });

    expect(result.merchantName).toContain("Green Stay");
    expect(result.invoiceNumber).toBe("INV-42");
    expect(result.invoiceDate).toBe("2026-09-01");
    expect(result.totalAmount).toBe(5450);
    expect(result.gstNumber).toBe("29ABCDE1234F1Z5");
    expect(result.taxAmount).toBe(450);
    expect(result.currency).toBe("INR");
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});
