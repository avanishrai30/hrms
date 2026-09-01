import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("finance RBAC and tenant isolation", () => {
  const controller = readFileSync(new URL("../src/modules/finance/finance.controller.ts", import.meta.url), "utf8");
  const service = readFileSync(new URL("../src/modules/finance/finance.service.ts", import.meta.url), "utf8");
  const receiptStorage = readFileSync(new URL("../src/modules/finance/receipt-storage.service.ts", import.meta.url), "utf8");

  it("guards every finance endpoint with server-side permissions", () => {
    for (const permission of [
      "finance.view",
      "finance.manage",
      "finance.audit",
      "expenses.view",
      "expenses.create",
      "expenses.manage",
      "travel.view",
      "travel.create",
      "travel.manage",
      "budgets.view",
      "budgets.manage",
      "reimbursements.view",
      "reimbursements.manage",
      "finance.pay"
    ]) {
      expect(controller).toContain(`@RequirePermissions("${permission}")`);
    }
  });

  it("uses tenant predicates across finance repositories", () => {
    for (const expected of [
      "where: { tenantId",
      "findFirst({ where: { tenantId, id: employeeId }",
      "findFirst({ where: { tenantId, id: costCenterId }",
      "where: { tenantId, id: claimId }",
      "where: { tenantId, id: requestId }",
      "where: { tenantId, contentHash",
      "where: { tenantId, id: receiptId }"
    ]) {
      expect(`${service}\n${receiptStorage}`).toContain(expected);
    }
  });

  it("audits critical finance actions", () => {
    for (const action of [
      "finance.expense.created",
      "finance.expense_policy.created",
      "finance.travel.created",
      "finance.cost_center.created",
      "finance.budget.created",
      "finance.reimbursement.paid",
      "finance.report.exported",
      "finance.receipt.uploaded",
      "finance.payroll.posted",
      "expense.submitted",
      "expense.approved",
      "expense.rejected",
      "expense.paid"
    ]) {
      expect(`${service}\n${receiptStorage}`).toContain(action);
    }
  });
});
