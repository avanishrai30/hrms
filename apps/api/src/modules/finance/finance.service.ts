import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ExpenseClaimStatus, TravelRequestStatus, type Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { BudgetEngine } from "./engines/budget.engine.js";
import { ExpensePolicyEngine } from "./engines/expense-policy.engine.js";
import { FinanceAnalyticsEngine } from "./engines/finance-analytics.engine.js";
import { FinanceReportEngine } from "./engines/finance-report.engine.js";
import { PayrollFinanceBridge } from "./engines/payroll-finance-bridge.js";
import { ReceiptOcrEngine } from "./engines/receipt-ocr.engine.js";
import type {
  AnalyticsPeriodDto,
  CreateBudgetAllocationDto,
  CreateCostCenterDto,
  CreateDepartmentBudgetDto,
  CreateExpenseCategoryDto,
  CreateExpenseClaimDto,
  CreateExpensePolicyDto,
  CreateTravelSettlementDto,
  CreateTravelAdvanceDto,
  CreateTravelRequestDto,
  OcrReceiptDto,
  PayrollPostingDto,
  ReportExportDto,
  UpdateExpenseStatusDto,
  UpdateTravelStatusDto,
  UploadReceiptDto
} from "./finance.schemas.js";
import { ReceiptStorageService } from "./receipt-storage.service.js";
import { ReimbursementService } from "./reimbursement.service.js";
import { TravelAdvanceService } from "./travel-advance.service.js";
import { TravelSettlementService } from "./travel-settlement.service.js";

interface Actor {
  userId: string;
  membershipId: string;
}

@Injectable()
export class FinanceService {
  private readonly policyEngine = new ExpensePolicyEngine();
  private readonly ocrEngine = new ReceiptOcrEngine();
  private readonly budgetEngine = new BudgetEngine();
  private readonly analyticsEngine = new FinanceAnalyticsEngine();
  private readonly reportEngine = new FinanceReportEngine();
  private readonly payrollBridge = new PayrollFinanceBridge();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly reimbursements: ReimbursementService,
    private readonly receiptStorage: ReceiptStorageService,
    private readonly travelAdvances: TravelAdvanceService,
    private readonly travelSettlements: TravelSettlementService
  ) {}

  listCategories(tenantId: string) {
    return this.prisma.expenseCategoryMaster.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  async createCategory(tenantId: string, actor: Actor, dto: CreateExpenseCategoryDto) {
    const category = await this.prisma.expenseCategoryMaster.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "finance.expense_category.created", "expense_category", category.id, category);
    return category;
  }

  listPolicies(tenantId: string) {
    return this.prisma.expensePolicy.findMany({ where: { tenantId }, orderBy: { category: "asc" } });
  }

  async createPolicy(tenantId: string, actor: Actor, dto: CreateExpensePolicyDto) {
    const policy = await this.prisma.expensePolicy.create({
      data: { tenantId, ...dto, metadataJson: dto.metadataJson as Prisma.InputJsonValue }
    });
    await this.audit(tenantId, actor, "finance.expense_policy.created", "expense_policy", policy.id, policy);
    return policy;
  }

  async listExpenses(tenantId: string, status?: ExpenseClaimStatus) {
    return this.prisma.expenseClaim.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      include: { employee: true, items: { include: { receipts: true } }, costCenter: true, approvals: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async getExpense(tenantId: string, claimId: string) {
    const claim = await this.prisma.expenseClaim.findFirst({
      where: { tenantId, id: claimId },
      include: { employee: true, items: { include: { receipts: true } }, costCenter: true, approvals: true, audits: true }
    });
    if (!claim) throw new NotFoundException("Expense claim not found.");
    return claim;
  }

  async createExpense(tenantId: string, actor: Actor, dto: CreateExpenseClaimDto) {
    await this.assertEmployee(tenantId, dto.employeeId);
    if (dto.costCenterId) await this.assertCostCenter(tenantId, dto.costCenterId);
    const policies = await this.prisma.expensePolicy.findMany({ where: { tenantId, isActive: true } });
    const policyResult = this.policyEngine.validateClaim(dto, policies);
    const violations = policyResult.violations;
    const autoRejected = policyResult.outcome === "FAIL" && violations.some((violation) => violation.severity === "AUTO_REJECT");
    const claim = await this.prisma.$transaction(async (tx) => {
      const created = await tx.expenseClaim.create({
        data: {
          tenantId,
          claimNumber: await this.nextNumber(tx, tenantId, "EXP"),
          employeeId: dto.employeeId,
          title: dto.title,
          description: dto.description,
          currency: dto.currency,
          costCenterId: dto.costCenterId,
          status: autoRejected ? "REJECTED" : "DRAFT",
          totalAmount: dto.items.reduce((sum, item) => sum + item.amount, 0),
          taxAmount: dto.items.reduce((sum, item) => sum + item.taxAmount, 0),
          policyViolations: policyResult as unknown as Prisma.InputJsonValue,
          rejectionReason: autoRejected ? "Auto rejected by expense policy." : undefined,
          items: {
            create: dto.items.map((item) => ({
              tenantId,
              categoryId: item.categoryId,
              category: item.category,
              description: item.description,
              amount: item.amount,
              taxAmount: item.taxAmount,
              gstNumber: item.gstNumber,
              gstAmount: item.gstAmount,
              currency: item.currency,
              expenseDate: item.expenseDate,
              merchantName: item.merchantName,
              invoiceNumber: item.invoiceNumber,
              mileageKm: item.mileageKm,
              mileageRate: item.mileageRate,
              isViolation: violations.some((violation) => violation.category === item.category),
              violationNote: violations.filter((violation) => violation.category === item.category).map((violation) => violation.message).join("; ") || undefined,
              receipts: {
                create: item.receipts.map((receipt) => ({
                  tenantId,
                  fileUrl: receipt.fileUrl,
                  fileName: receipt.fileName,
                  fileType: receipt.fileType,
                  fileSizeBytes: receipt.fileSizeBytes,
                  contentHash: receipt.contentHash,
                  isDuplicate: false
                }))
              }
            }))
          }
        },
        include: { items: { include: { receipts: true } } }
      });
      await this.markDuplicateReceipts(tx, tenantId, created.items.flatMap((item) => item.receipts));
      await this.expenseAudit(tx, tenantId, created.id, "expense.created", actor.userId, undefined, created.status, created);
      return created;
    });
    await this.audit(tenantId, actor, "finance.expense.created", "expense_claim", claim.id, claim);
    return claim;
  }

  async updateExpenseStatus(tenantId: string, actor: Actor, claimId: string, dto: UpdateExpenseStatusDto) {
    const before = await this.getExpense(tenantId, claimId);
    const status = this.nextExpenseStatus(before.status, dto.action);
    const approverId = await this.actorEmployeeId(tenantId, actor) ?? before.employeeId;
    const updated = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.expenseClaim.update({
        where: { id: before.id },
        data: {
          status,
          submittedAt: status === "SUBMITTED" ? new Date() : before.submittedAt,
          approvedAt: status === "APPROVED" ? new Date() : before.approvedAt,
          paidAt: status === "PAID" ? new Date() : before.paidAt,
          approvedAmount: dto.approvedAmount ?? before.approvedAmount,
          rejectionReason: status === "REJECTED" ? dto.remarks : before.rejectionReason
        }
      });
      await tx.expenseApproval.create({
        data: {
          tenantId,
          claimId: claim.id,
          approverId,
          level: dto.action === "FINANCE_APPROVE" || dto.action === "PAY" ? 2 : 1,
          action: dto.action,
          remarks: dto.remarks,
          approvedAmount: dto.approvedAmount
        }
      });
      await this.expenseAudit(tx, tenantId, claim.id, this.expenseEvent(dto.action), actor.userId, before.status, status, dto);
      if (status === "APPROVED" && claim.costCenterId) {
        await this.consumeBudget(tx, tenantId, claim.costCenterId, claim.approvedAmount ?? claim.totalAmount, "EXPENSE", claim.id);
      }
      return claim;
    });
    await this.audit(tenantId, actor, `finance.${this.expenseEvent(dto.action)}`, "expense_claim", updated.id, { previousStatus: before.status, newStatus: status, remarks: dto.remarks });
    return updated;
  }

  ocrReceipt(dto: OcrReceiptDto) {
    return this.ocrEngine.extract(dto);
  }

  uploadReceipt(tenantId: string, actor: Actor, dto: UploadReceiptDto) {
    return this.receiptStorage.upload(tenantId, actor, dto);
  }

  receiptAccess(tenantId: string, receiptId: string) {
    return this.receiptStorage.getReceiptAccess(tenantId, receiptId);
  }

  listTravel(tenantId: string, status?: TravelRequestStatus) {
    return this.prisma.travelRequest.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      include: { employee: true, segments: true, advances: true, settlements: true, costCenter: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async createTravel(tenantId: string, actor: Actor, dto: CreateTravelRequestDto) {
    await this.assertEmployee(tenantId, dto.employeeId);
    if (dto.costCenterId) await this.assertCostCenter(tenantId, dto.costCenterId);
    const travel = await this.prisma.travelRequest.create({
      data: {
        tenantId,
        requestNumber: await this.nextNumber(this.prisma, tenantId, "TRV"),
        employeeId: dto.employeeId,
        title: dto.title,
        purpose: dto.purpose,
        travelType: dto.travelType,
        estimatedBudget: dto.estimatedBudget,
        currency: dto.currency,
        costCenterId: dto.costCenterId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        segments: { create: dto.segments.map((segment) => ({ tenantId, ...segment })) }
      },
      include: { segments: true }
    });
    await this.audit(tenantId, actor, "finance.travel.created", "travel_request", travel.id, travel);
    return travel;
  }

  async updateTravelStatus(tenantId: string, actor: Actor, requestId: string, dto: UpdateTravelStatusDto) {
    const before = await this.prisma.travelRequest.findFirst({ where: { tenantId, id: requestId } });
    if (!before) throw new NotFoundException("Travel request not found.");
    const status = this.nextTravelStatus(before.status, dto.action);
    const travel = await this.prisma.travelRequest.update({
      where: { id: before.id },
      data: {
        status,
        submittedAt: status === "SUBMITTED" ? new Date() : before.submittedAt,
        approvedAt: status === "APPROVED" ? new Date() : before.approvedAt,
        approvedBy: status === "APPROVED" ? actor.userId : before.approvedBy,
        rejectionReason: status === "REJECTED" ? dto.remarks : before.rejectionReason
      }
    });
    if (status === "APPROVED" && travel.costCenterId) {
      await this.consumeBudget(this.prisma, tenantId, travel.costCenterId, travel.estimatedBudget, "TRAVEL", travel.id);
    }
    await this.audit(tenantId, actor, `finance.travel.${dto.action.toLowerCase()}`, "travel_request", travel.id, { previousStatus: before.status, newStatus: status, remarks: dto.remarks });
    return travel;
  }

  async createTravelAdvance(tenantId: string, actor: Actor, dto: CreateTravelAdvanceDto) {
    await this.assertEmployee(tenantId, dto.employeeId);
    const request = await this.prisma.travelRequest.findFirst({ where: { tenantId, id: dto.requestId, employeeId: dto.employeeId } });
    if (!request) throw new NotFoundException("Travel request not found.");
    const advance = await this.prisma.travelAdvance.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "finance.travel_advance.created", "travel_advance", advance.id, advance);
    return advance;
  }

  async approveTravelAdvance(tenantId: string, actor: Actor, advanceId: string) {
    const advance = await this.travelAdvances.approve(tenantId, advanceId);
    await this.audit(tenantId, actor, "finance.travel_advance.approved", "travel_advance", advance.id, advance);
    return advance;
  }

  async disburseTravelAdvance(tenantId: string, actor: Actor, advanceId: string) {
    const advance = await this.travelAdvances.disburse(tenantId, advanceId);
    await this.audit(tenantId, actor, "finance.travel_advance.disbursed", "travel_advance", advance.id, advance);
    return advance;
  }

  async createTravelSettlement(tenantId: string, actor: Actor, dto: CreateTravelSettlementDto) {
    const settlement = await this.travelSettlements.settle(tenantId, dto);
    await this.audit(tenantId, actor, "finance.travel_settlement.created", "travel_settlement", settlement.id, settlement);
    if (settlement.balanceDue > 0) {
      await this.audit(tenantId, actor, "finance.reimbursement.generated", "travel_settlement", settlement.id, {
        employeeId: settlement.employeeId,
        balanceDue: settlement.balanceDue
      });
    }
    return settlement;
  }

  listCostCenters(tenantId: string) {
    return this.prisma.costCenter.findMany({ where: { tenantId }, include: { budgets: true, manager: true }, orderBy: { code: "asc" } });
  }

  async createCostCenter(tenantId: string, actor: Actor, dto: CreateCostCenterDto) {
    if (dto.parentId) await this.assertCostCenter(tenantId, dto.parentId);
    if (dto.managerId) await this.assertEmployee(tenantId, dto.managerId);
    const costCenter = await this.prisma.costCenter.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "finance.cost_center.created", "cost_center", costCenter.id, costCenter);
    return costCenter;
  }

  async createBudget(tenantId: string, actor: Actor, dto: CreateDepartmentBudgetDto) {
    await this.assertCostCenter(tenantId, dto.costCenterId);
    const budget = await this.prisma.departmentBudget.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "finance.budget.created", "department_budget", budget.id, budget);
    return budget;
  }

  async createAllocation(tenantId: string, actor: Actor, dto: CreateBudgetAllocationDto) {
    await this.assertCostCenter(tenantId, dto.costCenterId);
    const budget = await this.prisma.departmentBudget.findFirst({ where: { tenantId, id: dto.budgetId } });
    if (!budget) throw new NotFoundException("Department budget not found.");
    const validation = this.budgetEngine.validateSpend(budget, dto.amount);
    if (!validation.allowed) throw new BadRequestException("Budget allocation exceeds available budget.");
    const allocation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.budgetAllocation.create({ data: { tenantId, ...dto, allocatedBy: actor.userId } });
      await tx.departmentBudget.update({
        where: { id: budget.id },
        data: { allocatedAmount: { increment: dto.amount } }
      });
      return created;
    });
    await this.audit(tenantId, actor, "finance.budget.updated", "budget_allocation", allocation.id, { allocation, validation });
    return allocation;
  }

  listReimbursements(tenantId: string) {
    return this.reimbursements.listQueue(tenantId);
  }

  async payReimbursement(tenantId: string, actor: Actor, claimId: string, approvedAmount?: number) {
    const claim = await this.reimbursements.markPaid(tenantId, claimId, approvedAmount);
    await this.audit(tenantId, actor, "finance.reimbursement.paid", "expense_claim", claim.id, claim);
    return claim;
  }

  async analytics(tenantId: string, period: AnalyticsPeriodDto = "monthly") {
    const [expenses, items, travel, budgets, pendingApprovals, pendingReimbursements] = await Promise.all([
      this.prisma.expenseClaim.findMany({ where: { tenantId } }),
      this.prisma.expenseItem.findMany({ where: { tenantId }, include: { claim: true } }),
      this.prisma.travelRequest.findMany({ where: { tenantId } }),
      this.prisma.departmentBudget.findMany({ where: { tenantId }, include: { costCenter: true } }),
      this.prisma.expenseClaim.count({ where: { tenantId, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      this.prisma.expenseClaim.count({ where: { tenantId, status: "APPROVED" } })
    ]);
    const analytics = this.analyticsEngine.build({ expenses, items, travel, budgets, period });
    return {
      ...analytics,
      pendingApprovals,
      pendingReimbursements,
      budgetMetrics: budgets.map((budget) => this.budgetEngine.evaluate(budget)),
      forecastBurnRate: analytics.monthlySpend > 0 ? Number((analytics.monthlySpend * 1.12).toFixed(2)) : 0
    };
  }

  async exportReport(tenantId: string, actor: Actor, dto: ReportExportDto) {
    const rows = await this.reportRows(tenantId, dto.report);
    await this.audit(tenantId, actor, "finance.report.exported", "finance_report", undefined, { report: dto.report, format: dto.format, rows: rows.length });
    return this.reportEngine.export(rows, dto.format, dto.report);
  }

  async generatePayrollInputs(tenantId: string, actor: Actor, dto: PayrollPostingDto) {
    const reimbursements = await this.prisma.expenseClaim.findMany({
      where: { tenantId, status: "APPROVED", paidAt: null },
      select: { id: true, employeeId: true, approvedAmount: true, totalAmount: true, currency: true }
    });
    const inputs = this.payrollBridge.generatePayrollInputs({
      payrollRunId: dto.payrollRunId,
      sources: reimbursements.map((claim) => ({
        id: claim.id,
        employeeId: claim.employeeId,
        amount: claim.approvedAmount ?? claim.totalAmount,
        currency: claim.currency,
        type: "REIMBURSEMENT"
      }))
    });
    await this.audit(tenantId, actor, "finance.payroll.posted", "payroll_run", dto.payrollRunId, {
      inputs: inputs.length,
      sourceIds: inputs.map((input) => input.sourceId)
    });
    return { payrollRunId: dto.payrollRunId, inputs };
  }

  private nextExpenseStatus(current: ExpenseClaimStatus, action: string): ExpenseClaimStatus {
    const map: Record<string, ExpenseClaimStatus> = {
      SUBMIT: "SUBMITTED",
      MANAGER_APPROVE: "UNDER_REVIEW",
      FINANCE_APPROVE: "APPROVED",
      APPROVE: current === "SUBMITTED" ? "UNDER_REVIEW" : "APPROVED",
      REJECT: "REJECTED",
      PAY: "PAID",
      CANCEL: "CANCELLED"
    };
    const next = map[action];
    if (!next) throw new BadRequestException("Unsupported expense action.");
    if (current === "PAID" || current === "CANCELLED") throw new BadRequestException("Expense claim is already closed.");
    if (action === "PAY" && current !== "APPROVED") throw new BadRequestException("Only finance-approved claims can be paid.");
    if (action === "MANAGER_APPROVE" && current !== "SUBMITTED") throw new BadRequestException("Only submitted claims can be manager approved.");
    if (action === "FINANCE_APPROVE" && current !== "UNDER_REVIEW") throw new BadRequestException("Only manager-approved claims can be finance approved.");
    return next;
  }

  private expenseEvent(action: string) {
    const map: Record<string, string> = {
      SUBMIT: "expense.submitted",
      MANAGER_APPROVE: "expense.manager_approved",
      FINANCE_APPROVE: "expense.approved",
      APPROVE: "expense.approved",
      REJECT: "expense.rejected",
      PAY: "expense.paid",
      CANCEL: "expense.cancelled"
    };
    return map[action] ?? `expense.${action.toLowerCase()}`;
  }

  private nextTravelStatus(current: TravelRequestStatus, action: string): TravelRequestStatus {
    const map: Record<string, TravelRequestStatus> = { SUBMIT: "SUBMITTED", APPROVE: "APPROVED", REJECT: "REJECTED", START: "IN_PROGRESS", COMPLETE: "COMPLETED", CANCEL: "CANCELLED" };
    const next = map[action];
    if (!next) throw new BadRequestException("Unsupported travel action.");
    if (current === "COMPLETED" || current === "CANCELLED") throw new BadRequestException("Travel request is already closed.");
    return next;
  }

  private async assertEmployee(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { tenantId, id: employeeId }, select: { id: true } });
    if (!employee) throw new BadRequestException("Employee does not belong to this tenant.");
  }

  private async assertCostCenter(tenantId: string, costCenterId: string) {
    const costCenter = await this.prisma.costCenter.findFirst({ where: { tenantId, id: costCenterId }, select: { id: true } });
    if (!costCenter) throw new BadRequestException("Cost center does not belong to this tenant.");
  }

  private async markDuplicateReceipts(tx: Prisma.TransactionClient, tenantId: string, receipts: Array<{ id: string; contentHash: string | null }>) {
    for (const receipt of receipts.filter((item) => item.contentHash)) {
      const duplicate = await tx.expenseReceipt.findFirst({
        where: { tenantId, contentHash: receipt.contentHash, id: { not: receipt.id } },
        select: { id: true }
      });
      if (duplicate) await tx.expenseReceipt.update({ where: { id: receipt.id }, data: { isDuplicate: true } });
    }
  }

  private async nextNumber(tx: Pick<PrismaService, "expenseClaim" | "travelRequest"> | Prisma.TransactionClient, tenantId: string, prefix: string) {
    const year = new Date().getFullYear();
    const count = prefix === "EXP"
      ? await tx.expenseClaim.count({ where: { tenantId } })
      : await tx.travelRequest.count({ where: { tenantId } });
    return `${prefix}-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  private async consumeBudget(tx: Pick<PrismaService, "departmentBudget" | "budgetAllocation"> | Prisma.TransactionClient, tenantId: string, costCenterId: string, amount: number, referenceType: string, referenceId: string) {
    const fiscalYear = new Date().getFullYear();
    const budget = await tx.departmentBudget.findFirst({ where: { tenantId, costCenterId, fiscalYear, quarter: null } });
    const validation = this.budgetEngine.validateSpend(budget, amount);
    if (!validation.allowed) throw new BadRequestException("Budget exceeded.");
    if (budget) {
      await tx.departmentBudget.update({ where: { id: budget.id }, data: { consumedAmount: { increment: amount } } });
      await tx.budgetAllocation.create({ data: { tenantId, budgetId: budget.id, costCenterId, category: referenceType, amount, referenceType, referenceId, allocatedBy: "00000000-0000-0000-0000-000000000000" } });
    }
  }

  private async actorEmployeeId(tenantId: string, actor: Actor) {
    const membership = await this.prisma.tenantMembership.findFirst({ where: { tenantId, id: actor.membershipId }, select: { employeeId: true } });
    return membership?.employeeId ?? null;
  }

  private expenseAudit(tx: Prisma.TransactionClient, tenantId: string, claimId: string, action: string, performedBy: string, previousStatus: string | undefined, newStatus: string | undefined, metadata: unknown) {
    return tx.expenseAudit.create({
      data: {
        tenantId,
        claimId,
        action,
        performedBy,
        previousStatus,
        newStatus,
        metadata: metadata as Prisma.InputJsonValue
      }
    });
  }

  private async reportRows(tenantId: string, report: ReportExportDto["report"]): Promise<Array<Record<string, string | number | boolean | null>>> {
    if (report === "TRAVEL_REGISTER") {
      const rows = await this.prisma.travelRequest.findMany({ where: { tenantId }, include: { employee: true, costCenter: true } });
      return rows.map((row) => ({ requestNumber: row.requestNumber, employee: row.employee.fullName, status: row.status, estimatedBudget: row.estimatedBudget, costCenter: row.costCenter?.code ?? "" }));
    }
    if (report === "BUDGET_CONSUMPTION") {
      const rows = await this.prisma.departmentBudget.findMany({ where: { tenantId }, include: { costCenter: true } });
      return rows.map((row) => ({ costCenter: row.costCenter.code, fiscalYear: row.fiscalYear, budget: row.totalBudget, consumed: row.consumedAmount, utilizationPct: row.totalBudget ? Number(((row.consumedAmount / row.totalBudget) * 100).toFixed(2)) : 0 }));
    }
    if (report === "ADVANCE_LEDGER") {
      const rows = await this.prisma.travelAdvance.findMany({ where: { tenantId }, include: { employee: true, request: true } });
      return rows.map((row) => ({ requestNumber: row.request.requestNumber, employee: row.employee.fullName, amount: row.amount, status: row.status }));
    }
    if (report === "SETTLEMENT_LEDGER") {
      const rows = await this.prisma.travelSettlement.findMany({ where: { tenantId }, include: { employee: true, request: true } });
      return rows.map((row) => ({ requestNumber: row.request.requestNumber, employee: row.employee.fullName, actualSpend: row.totalActualSpend, balanceDue: row.balanceDue, refund: row.refundAmount }));
    }
    if (report === "POLICY_VIOLATION") {
      const rows = await this.prisma.expenseItem.findMany({ where: { tenantId, isViolation: true }, include: { claim: { include: { employee: true } } } });
      return rows.map((row) => ({ claimNumber: row.claim.claimNumber, employee: row.claim.employee.fullName, category: row.category, amount: row.amount, note: row.violationNote ?? "" }));
    }
    const rows = await this.prisma.expenseClaim.findMany({ where: { tenantId }, include: { employee: true, costCenter: true } });
    return rows.map((row) => ({ claimNumber: row.claimNumber, employee: row.employee.fullName, status: row.status, totalAmount: row.totalAmount, approvedAmount: row.approvedAmount ?? "", costCenter: row.costCenter?.code ?? "" }));
  }

  private audit(tenantId: string, actor: Actor, action: string, resourceType: string, resourceId: string | undefined, metadata: unknown) {
    return this.auditService.record({
      tenantId,
      actorUserId: actor.userId,
      actorMembershipId: actor.membershipId,
      action,
      resourceType,
      resourceId,
      metadata: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue
    });
  }
}
