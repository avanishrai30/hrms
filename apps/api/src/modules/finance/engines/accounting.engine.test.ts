import { describe, expect, it } from "vitest";
import { AccountingEngine, BankReconciliationEngine, GSTEngine, TDSEngine } from "./accounting.engine.js";

describe("AccountingEngine", () => {
  it("validates double-entry journals", () => {
    const result = new AccountingEngine().assertBalanced([
      { accountId: "cash", debit: 1000, credit: 0 },
      { accountId: "revenue", debit: 0, credit: 1000 }
    ]);

    expect(result).toEqual({ totalDebit: 1000, totalCredit: 1000, balanced: true, validLines: true });
  });

  it("rejects unbalanced journals", () => {
    const result = new AccountingEngine().assertBalanced([
      { accountId: "cash", debit: 1000, credit: 0 },
      { accountId: "revenue", debit: 0, credit: 900 }
    ]);

    expect(result.balanced).toBe(false);
  });
});

describe("BankReconciliationEngine", () => {
  it("matches by amount, reference, narration, and date proximity", () => {
    const result = new BankReconciliationEngine().match(
      { id: "bank-1", amount: 1200, reference: "UTR-1", narration: "customer payment", date: new Date("2026-09-01") },
      [{ id: "payment-1", amount: 1200, reference: "UTR-1", narration: "customer", date: new Date("2026-09-02") }]
    );

    expect(result.status).toBe("MATCHED");
    expect(result.candidate?.id).toBe("payment-1");
  });
});

describe("GSTEngine and TDSEngine", () => {
  it("splits intra-state GST and calculates TDS liability", () => {
    expect(new GSTEngine().calculate({ taxableAmount: 1000, gstRate: 18, placeOfSupply: "INTRA_STATE" })).toEqual({ cgst: 90, sgst: 90, igst: 0, totalTax: 180 });
    expect(new TDSEngine().calculate(1000, 10)).toBe(100);
  });
});
