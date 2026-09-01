import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { InvoiceStatus, JournalStatus, Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { QueueService } from "../queue/queue.service.js";
import type {
  AccountingReportDto,
  CreateAccountDto,
  CreateAccountGroupDto,
  CreateBankAccountDto,
  CreateBankStatementDto,
  CreateCustomerDto,
  CreateCustomerInvoiceDto,
  CreateJournalDto,
  CreatePeriodDto,
  CreateVendorDto,
  CreateVendorInvoiceDto,
  ERPIntegrationDto,
  ERPSyncDto,
  GSTReturnDto,
  ReconcileBankDto,
  RecordCustomerPaymentDto,
  RecordVendorPaymentDto,
  UpdateAccountDto,
  UpdateJournalStatusDto,
  UpdatePeriodStatusDto
} from "./accounting.schemas.js";
import { AccountingEngine, BankReconciliationEngine, GSTEngine, TDSEngine } from "./engines/accounting.engine.js";
import { erpConnector } from "./engines/erp-connectors.js";
import { FinanceReportEngine } from "./engines/finance-report.engine.js";

interface Actor {
  userId: string;
  membershipId: string;
}

@Injectable()
export class AccountingService {
  private readonly accountingEngine = new AccountingEngine();
  private readonly reconciliationEngine = new BankReconciliationEngine();
  private readonly gstEngine = new GSTEngine();
  private readonly tdsEngine = new TDSEngine();
  private readonly reportEngine = new FinanceReportEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly queueService: QueueService
  ) {}

  listAccounts(tenantId: string) {
    return this.prisma.chartOfAccount.findMany({
      where: { tenantId, deletedAt: null },
      include: { group: true, children: true },
      orderBy: { code: "asc" }
    });
  }

  async createAccountGroup(tenantId: string, actor: Actor, dto: CreateAccountGroupDto) {
    if (dto.parentId) await this.assertAccountGroup(tenantId, dto.parentId);
    const group = await this.prisma.accountGroup.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "finance.account_group.created", "account_group", group.id, group);
    return group;
  }

  async createAccount(tenantId: string, actor: Actor, dto: CreateAccountDto) {
    if (dto.groupId) await this.assertAccountGroup(tenantId, dto.groupId);
    if (dto.parentId) await this.assertAccount(tenantId, dto.parentId);
    const account = await this.prisma.chartOfAccount.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "finance.account.created", "chart_of_account", account.id, account);
    return account;
  }

  async updateAccount(tenantId: string, actor: Actor, id: string, dto: UpdateAccountDto) {
    const before = await this.assertAccount(tenantId, id);
    if (dto.groupId) await this.assertAccountGroup(tenantId, dto.groupId);
    if (dto.parentId) await this.assertAccount(tenantId, dto.parentId);
    const account = await this.prisma.chartOfAccount.update({ where: { id: before.id }, data: dto });
    await this.audit(tenantId, actor, "finance.account.updated", "chart_of_account", account.id, { before, after: account });
    return account;
  }

  async deleteAccount(tenantId: string, actor: Actor, id: string) {
    const before = await this.assertAccount(tenantId, id);
    const account = await this.prisma.chartOfAccount.update({ where: { id: before.id }, data: { isActive: false, deletedAt: new Date() } });
    await this.audit(tenantId, actor, "finance.account.deleted", "chart_of_account", account.id, { before, after: account });
    return account;
  }

  listJournals(tenantId: string) {
    return this.prisma.journalEntry.findMany({
      where: { tenantId },
      include: { lines: { include: { account: true } }, period: true },
      orderBy: { entryDate: "desc" }
    });
  }

  async createJournal(tenantId: string, actor: Actor, dto: CreateJournalDto) {
    const validation = this.accountingEngine.assertBalanced(dto.lines);
    if (!validation.balanced) throw new BadRequestException("Journal entry must be balanced.");
    if (!validation.validLines) throw new BadRequestException("Each journal line must contain either debit or credit.");
    await Promise.all(dto.lines.map((line) => this.assertAccount(tenantId, line.accountId)));
    const period = dto.periodId ? await this.assertPeriodOpen(tenantId, dto.periodId) : await this.findOpenPeriod(tenantId, dto.entryDate);
    const journal = await this.prisma.journalEntry.create({
      data: {
        tenantId,
        periodId: period?.id,
        entryNumber: await this.nextJournalNumber(tenantId),
        entryDate: dto.entryDate,
        sourceType: dto.sourceType,
        sourceId: dto.sourceId,
        narration: dto.narration,
        totalDebit: validation.totalDebit,
        totalCredit: validation.totalCredit,
        createdBy: actor.userId,
        lines: { create: dto.lines.map((line) => ({ tenantId, ...line })) }
      },
      include: { lines: true }
    });
    await this.audit(tenantId, actor, "finance.journal.created", "journal_entry", journal.id, journal);
    return journal;
  }

  async updateJournalStatus(tenantId: string, actor: Actor, id: string, dto: UpdateJournalStatusDto) {
    const before = await this.prisma.journalEntry.findFirst({ where: { tenantId, id }, include: { lines: true } });
    if (!before) throw new NotFoundException("Journal entry not found.");
    await this.assertPostingAllowed(tenantId, before.periodId, before.entryDate);
    const status = this.nextJournalStatus(before.status, dto.action);
    const journal = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.journalEntry.update({
        where: { id: before.id },
        data: {
          status,
          approvedAt: status === "APPROVED" ? new Date() : before.approvedAt,
          postedAt: status === "POSTED" ? new Date() : before.postedAt,
          reversedAt: status === "REVERSED" ? new Date() : before.reversedAt
        }
      });
      if (status === "POSTED") {
        await tx.generalLedgerEntry.createMany({
          data: before.lines.map((line) => ({
            tenantId,
            journalEntryId: before.id,
            accountId: line.accountId,
            periodId: before.periodId,
            entryDate: before.entryDate,
            debit: line.debit,
            credit: line.credit,
            balance: Number((line.debit - line.credit).toFixed(2)),
            sourceType: before.sourceType,
            sourceId: before.sourceId
          }))
        });
      }
      return updated;
    });
    await this.audit(tenantId, actor, `finance.journal.${dto.action.toLowerCase()}`, "journal_entry", journal.id, { beforeStatus: before.status, afterStatus: status, remarks: dto.remarks });
    return journal;
  }

  listPeriods(tenantId: string) {
    return this.prisma.accountingPeriod.findMany({ where: { tenantId }, orderBy: [{ fiscalYear: "desc" }, { month: "desc" }] });
  }

  async createPeriod(tenantId: string, actor: Actor, dto: CreatePeriodDto) {
    const period = await this.prisma.accountingPeriod.create({ data: { tenantId, ...dto } });
    await this.audit(tenantId, actor, "finance.period.created", "accounting_period", period.id, period);
    return period;
  }

  async updatePeriodStatus(tenantId: string, actor: Actor, id: string, dto: UpdatePeriodStatusDto) {
    const period = await this.prisma.accountingPeriod.findFirst({ where: { tenantId, id } });
    if (!period) throw new NotFoundException("Accounting period not found.");
    const status = dto.action === "UNLOCK" ? "OPEN" : dto.action === "CLOSE" ? "CLOSED" : "LOCKED";
    const updated = await this.prisma.accountingPeriod.update({
      where: { id: period.id },
      data: { status, lockedAt: status === "LOCKED" ? new Date() : period.lockedAt, lockedBy: status === "LOCKED" ? actor.userId : period.lockedBy }
    });
    await this.audit(tenantId, actor, this.periodEvent(dto.action), "accounting_period", updated.id, { before: period.status, after: status, remarks: dto.remarks });
    return updated;
  }

  listERPIntegrations(tenantId: string) {
    return this.prisma.eRPIntegration.findMany({ where: { tenantId }, include: { connections: true, jobs: true }, orderBy: { createdAt: "desc" } });
  }

  listBankAccounts(tenantId: string) {
    return this.prisma.bankAccount.findMany({ where: { tenantId, deletedAt: null }, include: { transactions: true }, orderBy: { bankName: "asc" } });
  }

  async createBankAccount(tenantId: string, actor: Actor, dto: CreateBankAccountDto) {
    const account = await this.prisma.bankAccount.create({ data: { tenantId, ...dto, currentBalance: dto.currentBalance || dto.openingBalance } });
    await this.audit(tenantId, actor, "finance.bank_account.created", "bank_account", account.id, account);
    return account;
  }

  async createBankStatement(tenantId: string, actor: Actor, dto: CreateBankStatementDto) {
    await this.assertBankAccount(tenantId, dto.bankAccountId);
    const statement = await this.prisma.bankStatement.create({
      data: {
        tenantId,
        bankAccountId: dto.bankAccountId,
        statementNumber: dto.statementNumber,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        fileObjectKey: dto.fileObjectKey,
        transactions: { create: dto.transactions.map((transaction) => ({ tenantId, bankAccountId: dto.bankAccountId, ...transaction })) }
      },
      include: { transactions: true }
    });
    await this.audit(tenantId, actor, "finance.bank_statement.created", "bank_statement", statement.id, statement);
    return statement;
  }

  async reconcileBank(tenantId: string, actor: Actor, dto: ReconcileBankDto) {
    await this.assertBankAccount(tenantId, dto.bankAccountId);
    const [transactions, vendorPayments, customerPayments] = await Promise.all([
      this.prisma.bankTransaction.findMany({ where: { tenantId, bankAccountId: dto.bankAccountId, reconciliationStatus: "UNMATCHED" } }),
      this.prisma.vendorPayment.findMany({ where: { tenantId } }),
      this.prisma.customerPayment.findMany({ where: { tenantId } })
    ]);
    const candidates = [
      ...vendorPayments.map((payment) => ({ id: payment.id, amount: payment.amount, reference: payment.reference, narration: "vendor payment", date: payment.paymentDate, type: "VENDOR_PAYMENT" })),
      ...customerPayments.map((payment) => ({ id: payment.id, amount: payment.amount, reference: payment.reference, narration: "customer payment", date: payment.paymentDate, type: "CUSTOMER_PAYMENT" }))
    ];
    const results = [];
    for (const transaction of transactions) {
      const match = this.reconciliationEngine.match({
        id: transaction.id,
        amount: transaction.amount,
        reference: transaction.reference,
        narration: transaction.narration,
        date: transaction.transactionDate
      }, candidates);
      const reconciliation = await this.prisma.bankReconciliation.create({
        data: {
          tenantId,
          bankAccountId: dto.bankAccountId,
          bankTransactionId: transaction.id,
          matchedReferenceType: match.candidate ? "PAYMENT" : undefined,
          matchedReferenceId: match.candidate?.id,
          matchScore: match.matchScore,
          status: match.status,
          reconciledAt: match.status === "MATCHED" ? new Date() : undefined
        }
      });
      await this.prisma.bankTransaction.update({ where: { id: transaction.id }, data: { reconciliationStatus: match.status } });
      results.push(reconciliation);
    }
    await this.audit(tenantId, actor, "finance.bank_reconciliation.completed", "bank_account", dto.bankAccountId, { reconciled: results.length });
    return results;
  }

  listVendors(tenantId: string) {
    return this.prisma.vendor.findMany({ where: { tenantId, deletedAt: null }, include: { bankAccounts: true }, orderBy: { name: "asc" } });
  }

  async createVendor(tenantId: string, actor: Actor, dto: CreateVendorDto) {
    const vendor = await this.prisma.vendor.create({
      data: { tenantId, ...dto, addressJson: dto.addressJson as Prisma.InputJsonValue, riskScore: this.vendorRiskScore(dto) }
    });
    await this.audit(tenantId, actor, "finance.vendor.created", "vendor", vendor.id, vendor);
    return vendor;
  }

  listCustomers(tenantId: string) {
    return this.prisma.customer.findMany({ where: { tenantId, deletedAt: null }, orderBy: { name: "asc" } });
  }

  async createCustomer(tenantId: string, actor: Actor, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: { tenantId, ...dto, addressJson: dto.addressJson as Prisma.InputJsonValue }
    });
    await this.audit(tenantId, actor, "finance.customer.created", "customer", customer.id, customer);
    return customer;
  }

  listVendorInvoices(tenantId: string) {
    return this.prisma.vendorInvoice.findMany({ where: { tenantId }, include: { vendor: true, items: true, payments: true }, orderBy: { invoiceDate: "desc" } });
  }

  async createVendorInvoice(tenantId: string, actor: Actor, dto: CreateVendorInvoiceDto) {
    await this.assertVendor(tenantId, dto.vendorId);
    const totals = this.invoiceTotals(dto.items, dto.tdsRate);
    const invoice = await this.prisma.vendorInvoice.create({
      data: {
        tenantId,
        vendorId: dto.vendorId,
        invoiceNumber: dto.invoiceNumber,
        invoiceDate: dto.invoiceDate,
        dueDate: dto.dueDate,
        currency: dto.currency,
        ...totals,
        items: { create: dto.items.map((item) => ({ tenantId, ...this.invoiceItemTotals(item) })) }
      },
      include: { items: true }
    });
    await this.writeTaxLedgers(tenantId, "VENDOR_INVOICE", invoice.id, invoice.taxableAmount, invoice.taxAmount, true, dto.invoiceDate, invoice.tdsAmount);
    await this.audit(tenantId, actor, "finance.vendor_invoice.created", "vendor_invoice", invoice.id, invoice);
    return invoice;
  }

  async recordVendorPayment(tenantId: string, actor: Actor, dto: RecordVendorPaymentDto) {
    await this.assertVendor(tenantId, dto.vendorId);
    const invoice = dto.invoiceId ? await this.assertVendorInvoice(tenantId, dto.invoiceId) : null;
    const payment = await this.prisma.vendorPayment.create({ data: { tenantId, ...dto } });
    if (invoice) await this.updateInvoicePaid("vendor", invoice.id, invoice.totalAmount, invoice.paidAmount + dto.amount);
    await this.audit(tenantId, actor, "finance.vendor_payment.created", "vendor_payment", payment.id, payment);
    return payment;
  }

  listCustomerInvoices(tenantId: string) {
    return this.prisma.customerInvoice.findMany({ where: { tenantId }, include: { customer: true, items: true, payments: true }, orderBy: { invoiceDate: "desc" } });
  }

  async createCustomerInvoice(tenantId: string, actor: Actor, dto: CreateCustomerInvoiceDto) {
    await this.assertCustomer(tenantId, dto.customerId);
    const totals = this.invoiceTotals(dto.items, 0);
    const invoice = await this.prisma.customerInvoice.create({
      data: {
        tenantId,
        customerId: dto.customerId,
        invoiceNumber: dto.invoiceNumber,
        invoiceDate: dto.invoiceDate,
        dueDate: dto.dueDate,
        currency: dto.currency,
        taxableAmount: totals.taxableAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        items: { create: dto.items.map((item) => ({ tenantId, ...this.invoiceItemTotals(item) })) }
      },
      include: { items: true }
    });
    await this.writeTaxLedgers(tenantId, "CUSTOMER_INVOICE", invoice.id, invoice.taxableAmount, invoice.taxAmount, false, dto.invoiceDate, 0);
    await this.audit(tenantId, actor, "finance.customer_invoice.created", "customer_invoice", invoice.id, invoice);
    return invoice;
  }

  async recordCustomerPayment(tenantId: string, actor: Actor, dto: RecordCustomerPaymentDto) {
    await this.assertCustomer(tenantId, dto.customerId);
    const invoice = dto.invoiceId ? await this.assertCustomerInvoice(tenantId, dto.invoiceId) : null;
    const payment = await this.prisma.customerPayment.create({ data: { tenantId, ...dto } });
    if (invoice) await this.updateInvoicePaid("customer", invoice.id, invoice.totalAmount, invoice.paidAmount + dto.amount);
    await this.audit(tenantId, actor, "finance.customer_payment.created", "customer_payment", payment.id, payment);
    return payment;
  }

  async calculateGSTReturn(tenantId: string, actor: Actor, dto: GSTReturnDto) {
    const transactions = await this.prisma.gSTTransaction.findMany({ where: { tenantId, transactionDate: this.periodDateFilter(dto.period) } });
    const inputTax = transactions.filter((transaction) => transaction.sourceType === "VENDOR_INVOICE").reduce((sum, transaction) => sum + transaction.taxAmount, 0);
    const outputTax = transactions.filter((transaction) => transaction.sourceType === "CUSTOMER_INVOICE").reduce((sum, transaction) => sum + transaction.taxAmount, 0);
    const gstReturn = await this.prisma.gSTReturn.upsert({
      where: { tenantId_returnType_period: { tenantId, returnType: dto.returnType, period: dto.period } },
      create: { tenantId, returnType: dto.returnType, period: dto.period, inputTax, outputTax, netLiability: Math.max(0, outputTax - inputTax) },
      update: { inputTax, outputTax, netLiability: Math.max(0, outputTax - inputTax) }
    });
    await this.audit(tenantId, actor, "finance.gst_return.calculated", "gst_return", gstReturn.id, gstReturn);
    return gstReturn;
  }

  async createERPIntegration(tenantId: string, actor: Actor, dto: ERPIntegrationDto) {
    const integration = await this.prisma.eRPIntegration.create({
      data: {
        tenantId,
        provider: dto.provider,
        name: dto.name,
        connections: { create: { tenantId, settings: dto.settings as Prisma.InputJsonValue } }
      },
      include: { connections: true }
    });
    await this.audit(tenantId, actor, "finance.erp.integration.created", "erp_integration", integration.id, integration);
    return integration;
  }

  async queueERPSync(tenantId: string, actor: Actor, dto: ERPSyncDto) {
    const integration = await this.prisma.eRPIntegration.findFirst({ where: { tenantId, id: dto.integrationId } });
    if (!integration) throw new NotFoundException("ERP integration not found.");
    const connector = erpConnector(integration.provider);
    const exportPayload = connector.export(dto.payload);
    const job = await this.prisma.eRPJob.create({
      data: { tenantId, integrationId: integration.id, jobType: dto.jobType, payload: exportPayload as unknown as Prisma.InputJsonValue }
    });
    const queueId = await this.queueService.addJob("erp", dto.jobType, { tenantId, jobId: job.id, provider: integration.provider, payload: exportPayload });
    await this.prisma.eRPJobLog.create({ data: { tenantId, jobId: job.id, message: `Queued ERP sync ${queueId}`, metadata: { queueId } } });
    await this.audit(tenantId, actor, "finance.erp.sync.queued", "erp_job", job.id, { queueId, provider: integration.provider, jobType: dto.jobType });
    return { job, queueId, exportPayload };
  }

  async intelligence(tenantId: string) {
    const [receivables, payables, ledger, bank, payroll] = await Promise.all([
      this.prisma.customerInvoice.aggregate({ where: { tenantId }, _sum: { totalAmount: true, paidAmount: true } }),
      this.prisma.vendorInvoice.aggregate({ where: { tenantId }, _sum: { totalAmount: true, paidAmount: true, tdsAmount: true } }),
      this.prisma.generalLedgerEntry.groupBy({ by: ["accountId"], where: { tenantId }, _sum: { debit: true, credit: true } }),
      this.prisma.bankAccount.aggregate({ where: { tenantId, deletedAt: null }, _sum: { currentBalance: true } }),
      this.prisma.payrollRun.aggregate({ where: { tenantId }, _sum: { totalGross: true } })
    ]);
    const revenue = receivables._sum.totalAmount ?? 0;
    const expenses = payables._sum.totalAmount ?? 0;
    const outstandingReceivables = revenue - (receivables._sum.paidAmount ?? 0);
    const outstandingPayables = expenses - (payables._sum.paidAmount ?? 0);
    return {
      revenue,
      expenses,
      profit: Number((revenue - expenses).toFixed(2)),
      cashPosition: bank._sum.currentBalance ?? 0,
      outstandingReceivables,
      outstandingPayables,
      taxLiability: payables._sum.tdsAmount ?? 0,
      payrollCost: payroll._sum.totalGross ?? 0,
      departmentSpend: ledger,
      budgetVariance: Number((revenue - expenses - outstandingPayables).toFixed(2)),
      monthlyBurnRate: expenses,
      cashRunwayMonths: expenses > 0 ? Number(((bank._sum.currentBalance ?? 0) / expenses).toFixed(1)) : 0
    };
  }

  async exportAccountingReport(tenantId: string, actor: Actor, dto: AccountingReportDto) {
    const rows = await this.reportRows(tenantId, dto);
    const exported = this.reportEngine.export(rows, dto.format, dto.report);
    await this.audit(tenantId, actor, "finance.accounting_report.exported", "accounting_report", undefined, { report: dto.report, format: dto.format, rows: rows.length });
    return exported;
  }

  private nextJournalStatus(current: JournalStatus, action: UpdateJournalStatusDto["action"]): JournalStatus {
    if (action === "APPROVE" && current === "DRAFT") return "APPROVED";
    if (action === "POST" && current === "APPROVED") return "POSTED";
    if (action === "REVERSE" && current === "POSTED") return "REVERSED";
    throw new BadRequestException("Invalid journal status transition.");
  }

  private periodEvent(action: UpdatePeriodStatusDto["action"]) {
    const events = {
      CLOSE: "finance.period.close",
      LOCK: "finance.period.lock",
      UNLOCK: "finance.period.unlock"
    };
    return events[action];
  }

  private async assertPostingAllowed(tenantId: string, periodId: string | null, entryDate: Date) {
    const period = periodId ? await this.prisma.accountingPeriod.findFirst({ where: { tenantId, id: periodId } }) : await this.findOpenPeriod(tenantId, entryDate);
    if (period && period.status === "LOCKED") throw new BadRequestException("Cannot post into a locked accounting period.");
    return period;
  }

  private async assertPeriodOpen(tenantId: string, periodId: string) {
    const period = await this.prisma.accountingPeriod.findFirst({ where: { tenantId, id: periodId } });
    if (!period) throw new NotFoundException("Accounting period not found.");
    if (period.status === "LOCKED") throw new BadRequestException("Accounting period is locked.");
    return period;
  }

  private findOpenPeriod(tenantId: string, entryDate: Date) {
    return this.prisma.accountingPeriod.findFirst({
      where: { tenantId, startDate: { lte: entryDate }, endDate: { gte: entryDate }, status: { not: "LOCKED" } }
    });
  }

  private async assertAccountGroup(tenantId: string, id: string) {
    const group = await this.prisma.accountGroup.findFirst({ where: { tenantId, id, deletedAt: null } });
    if (!group) throw new BadRequestException("Account group does not belong to this tenant.");
    return group;
  }

  private async assertAccount(tenantId: string, id: string) {
    const account = await this.prisma.chartOfAccount.findFirst({ where: { tenantId, id, deletedAt: null } });
    if (!account) throw new BadRequestException("Account does not belong to this tenant.");
    return account;
  }

  private async assertBankAccount(tenantId: string, id: string) {
    const account = await this.prisma.bankAccount.findFirst({ where: { tenantId, id, deletedAt: null } });
    if (!account) throw new BadRequestException("Bank account does not belong to this tenant.");
    return account;
  }

  private async assertVendor(tenantId: string, id: string) {
    const vendor = await this.prisma.vendor.findFirst({ where: { tenantId, id, deletedAt: null } });
    if (!vendor) throw new BadRequestException("Vendor does not belong to this tenant.");
    return vendor;
  }

  private async assertCustomer(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({ where: { tenantId, id, deletedAt: null } });
    if (!customer) throw new BadRequestException("Customer does not belong to this tenant.");
    return customer;
  }

  private async assertVendorInvoice(tenantId: string, id: string) {
    const invoice = await this.prisma.vendorInvoice.findFirst({ where: { tenantId, id } });
    if (!invoice) throw new BadRequestException("Vendor invoice does not belong to this tenant.");
    return invoice;
  }

  private async assertCustomerInvoice(tenantId: string, id: string) {
    const invoice = await this.prisma.customerInvoice.findFirst({ where: { tenantId, id } });
    if (!invoice) throw new BadRequestException("Customer invoice does not belong to this tenant.");
    return invoice;
  }

  private async nextJournalNumber(tenantId: string) {
    const year = new Date().getFullYear();
    const count = await this.prisma.journalEntry.count({ where: { tenantId } });
    return `JV-${year}-${String(count + 1).padStart(6, "0")}`;
  }

  private invoiceItemTotals(item: { description: string; quantity: number; unitPrice: number; gstRate: number }) {
    const taxableAmount = Number((item.quantity * item.unitPrice).toFixed(2));
    const taxAmount = this.gstEngine.calculate({ taxableAmount, gstRate: item.gstRate, placeOfSupply: "INTRA_STATE" }).totalTax;
    return { ...item, taxableAmount, taxAmount, totalAmount: Number((taxableAmount + taxAmount).toFixed(2)) };
  }

  private invoiceTotals(items: Array<{ description: string; quantity: number; unitPrice: number; gstRate: number }>, tdsRate: number) {
    const calculated = items.map((item) => this.invoiceItemTotals(item));
    const taxableAmount = Number(calculated.reduce((sum, item) => sum + item.taxableAmount, 0).toFixed(2));
    const taxAmount = Number(calculated.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2));
    const tdsAmount = this.tdsEngine.calculate(taxableAmount, tdsRate);
    return { taxableAmount, taxAmount, tdsAmount, totalAmount: Number((taxableAmount + taxAmount - tdsAmount).toFixed(2)) };
  }

  private async updateInvoicePaid(kind: "vendor" | "customer", invoiceId: string, totalAmount: number, paidAmount: number) {
    const status: InvoiceStatus = paidAmount >= totalAmount ? "PAID" : "PARTIALLY_PAID";
    if (kind === "vendor") {
      return this.prisma.vendorInvoice.update({ where: { id: invoiceId }, data: { paidAmount, status } });
    }
    return this.prisma.customerInvoice.update({ where: { id: invoiceId }, data: { paidAmount, status } });
  }

  private async writeTaxLedgers(tenantId: string, sourceType: string, sourceId: string, taxableAmount: number, taxAmount: number, isInputTax: boolean, date: Date, tdsAmount: number) {
    const period = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const gst = this.gstEngine.calculate({ taxableAmount, gstRate: taxableAmount > 0 ? (taxAmount / taxableAmount) * 100 : 0, placeOfSupply: "INTRA_STATE" });
    await this.prisma.gSTTransaction.createMany({
      data: [
        { tenantId, taxType: "CGST", sourceType, sourceId, taxableAmount, taxAmount: gst.cgst, transactionDate: date },
        { tenantId, taxType: "SGST", sourceType, sourceId, taxableAmount, taxAmount: gst.sgst, transactionDate: date }
      ]
    });
    await this.prisma.taxLedger.create({ data: { tenantId, taxType: "CGST", sourceType, sourceId, taxableAmount, taxAmount: gst.cgst, isInputTax, period } });
    await this.prisma.taxLedger.create({ data: { tenantId, taxType: "SGST", sourceType, sourceId, taxableAmount, taxAmount: gst.sgst, isInputTax, period } });
    if (tdsAmount > 0) {
      await this.prisma.taxLedger.create({ data: { tenantId, taxType: "TDS", sourceType, sourceId, taxableAmount, taxAmount: tdsAmount, isInputTax: false, period } });
    }
  }

  private periodDateFilter(period: string) {
    const [year, month] = period.split("-").map(Number);
    if (!year || !month) return undefined;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    return { gte: start, lte: end };
  }

  private async reportRows(tenantId: string, dto: AccountingReportDto): Promise<Array<Record<string, string | number | boolean | null>>> {
    if (dto.report === "TRIAL_BALANCE") {
      const rows = await this.prisma.generalLedgerEntry.groupBy({ by: ["accountId"], where: { tenantId }, _sum: { debit: true, credit: true } });
      return rows.map((row) => ({ accountId: row.accountId, debit: row._sum.debit ?? 0, credit: row._sum.credit ?? 0 }));
    }
    if (dto.report === "VENDOR_OUTSTANDING") {
      const rows = await this.prisma.vendorInvoice.findMany({ where: { tenantId }, include: { vendor: true } });
      return rows.map((row) => ({ vendor: row.vendor.name, invoiceNumber: row.invoiceNumber, outstanding: Number((row.totalAmount - row.paidAmount).toFixed(2)), status: row.status }));
    }
    if (dto.report === "CUSTOMER_OUTSTANDING") {
      const rows = await this.prisma.customerInvoice.findMany({ where: { tenantId }, include: { customer: true } });
      return rows.map((row) => ({ customer: row.customer.name, invoiceNumber: row.invoiceNumber, outstanding: Number((row.totalAmount - row.paidAmount).toFixed(2)), status: row.status }));
    }
    if (dto.report === "GST_SUMMARY" || dto.report === "TDS_SUMMARY") {
      const rows = await this.prisma.taxLedger.findMany({ where: { tenantId, ...(dto.report === "TDS_SUMMARY" ? { taxType: "TDS" as const } : {}) } });
      return rows.map((row) => ({ taxType: row.taxType, period: row.period, taxableAmount: row.taxableAmount, taxAmount: row.taxAmount, inputTax: row.isInputTax }));
    }
    const intelligence = await this.intelligence(tenantId);
    return [intelligence as unknown as Record<string, string | number | boolean | null>];
  }

  private vendorRiskScore(dto: CreateVendorDto) {
    let score = 25;
    if (!dto.gstin) score += 25;
    if (!dto.pan) score += 20;
    if (!dto.addressJson) score += 10;
    return Math.min(100, score);
  }

  private audit(tenantId: string, actor: Actor, action: string, resourceType: string, resourceId: string | undefined, metadata: unknown) {
    return this.auditService.record({
      tenantId,
      actorUserId: actor.userId,
      actorMembershipId: actor.membershipId,
      action,
      resourceType,
      resourceId,
      metadata: metadata as Prisma.InputJsonValue
    });
  }
}
