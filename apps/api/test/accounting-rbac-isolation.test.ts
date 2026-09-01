import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("accounting RBAC, tenant isolation, and audit coverage", () => {
  const controller = readFileSync(new URL("../src/modules/finance/accounting.controller.ts", import.meta.url), "utf8");
  const service = readFileSync(new URL("../src/modules/finance/accounting.service.ts", import.meta.url), "utf8");

  it("guards accounting endpoints with server-side permissions", () => {
    for (const permission of [
      "finance.accounts.view",
      "finance.accounts.manage",
      "finance.gl.view",
      "finance.journal.view",
      "finance.journal.manage",
      "finance.journal.approve",
      "finance.bank.view",
      "finance.bank.manage",
      "finance.vendor.view",
      "finance.vendor.manage",
      "finance.payable.view",
      "finance.payable.manage",
      "finance.receivable.view",
      "finance.receivable.manage",
      "finance.tax.view",
      "finance.tax.manage",
      "finance.erp.view",
      "finance.erp.manage",
      "finance.report.export",
      "finance.report.view"
    ]) {
      expect(controller).toContain(`@RequirePermissions("${permission}")`);
    }
  });

  it("uses tenant predicates before reading or mutating accounting entities", () => {
    for (const expected of [
      "where: { tenantId",
      "findFirst({ where: { tenantId, id",
      "where: { tenantId, deletedAt: null",
      "where: { tenantId, bankAccountId",
      "where: { tenantId, id: dto.integrationId }"
    ]) {
      expect(service).toContain(expected);
    }
  });

  it("audits critical accounting mutations and integrations", () => {
    for (const action of [
      "finance.account.created",
      "finance.account.deleted",
      "finance.journal.created",
      "finance.period.lock",
      "finance.bank_reconciliation.completed",
      "finance.vendor.created",
      "finance.vendor_invoice.created",
      "finance.customer_invoice.created",
      "finance.gst_return.calculated",
      "finance.erp.sync.queued",
      "finance.accounting_report.exported"
    ]) {
      expect(service).toContain(action);
    }
  });

  it("contains period lock and balanced journal enforcement", () => {
    expect(service).toContain("Journal entry must be balanced.");
    expect(service).toContain("Cannot post into a locked accounting period.");
  });
});
