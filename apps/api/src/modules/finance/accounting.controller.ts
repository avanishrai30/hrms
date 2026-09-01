import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  accountingReportSchema,
  createAccountGroupSchema,
  createAccountSchema,
  createBankAccountSchema,
  createBankStatementSchema,
  createCustomerInvoiceSchema,
  createCustomerSchema,
  createJournalSchema,
  createPeriodSchema,
  createVendorInvoiceSchema,
  createVendorSchema,
  erpIntegrationSchema,
  erpSyncSchema,
  gstReturnSchema,
  reconcileBankSchema,
  recordCustomerPaymentSchema,
  recordVendorPaymentSchema,
  updateAccountSchema,
  updateJournalStatusSchema,
  updatePeriodStatusSchema
} from "./accounting.schemas.js";
import { AccountingService } from "./accounting.service.js";

@Controller("finance")
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get("accounts")
  @RequirePermissions("finance.accounts.view")
  accounts(@Req() req: Request) {
    return this.accountingService.listAccounts(requireTenantContext(req).tenantId);
  }

  @Post("account-groups")
  @RequirePermissions("finance.accounts.manage")
  createAccountGroup(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createAccountGroup(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createAccountGroupSchema.parse(body));
  }

  @Post("accounts")
  @RequirePermissions("finance.accounts.manage")
  createAccount(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createAccount(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createAccountSchema.parse(body));
  }

  @Patch("accounts/:id")
  @RequirePermissions("finance.accounts.manage")
  updateAccount(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.updateAccount(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, updateAccountSchema.parse(body));
  }

  @Delete("accounts/:id")
  @RequirePermissions("finance.accounts.manage")
  deleteAccount(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.accountingService.deleteAccount(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id);
  }

  @Get("gl")
  @RequirePermissions("finance.gl.view")
  gl(@Req() req: Request) {
    return this.accountingService.listJournals(requireTenantContext(req).tenantId);
  }

  @Get("journals")
  @RequirePermissions("finance.journal.view")
  journals(@Req() req: Request) {
    return this.accountingService.listJournals(requireTenantContext(req).tenantId);
  }

  @Post("journals")
  @RequirePermissions("finance.journal.manage")
  createJournal(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createJournal(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createJournalSchema.parse(body));
  }

  @Post("journals/:id/status")
  @RequirePermissions("finance.journal.approve")
  updateJournalStatus(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.updateJournalStatus(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, updateJournalStatusSchema.parse(body));
  }

  @Get("periods")
  @RequirePermissions("finance.journal.view")
  periods(@Req() req: Request) {
    return this.accountingService.listPeriods(requireTenantContext(req).tenantId);
  }

  @Post("periods")
  @RequirePermissions("finance.journal.manage")
  createPeriod(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createPeriod(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createPeriodSchema.parse(body));
  }

  @Post("periods/:id/status")
  @RequirePermissions("finance.journal.approve")
  updatePeriod(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.updatePeriodStatus(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, updatePeriodStatusSchema.parse(body));
  }

  @Get("banks")
  @RequirePermissions("finance.bank.view")
  banks(@Req() req: Request) {
    return this.accountingService.listBankAccounts(requireTenantContext(req).tenantId);
  }

  @Post("banks")
  @RequirePermissions("finance.bank.manage")
  createBank(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createBankAccount(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createBankAccountSchema.parse(body));
  }

  @Post("banks/statements")
  @RequirePermissions("finance.bank.manage")
  createStatement(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createBankStatement(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createBankStatementSchema.parse(body));
  }

  @Post("reconciliation/run")
  @RequirePermissions("finance.bank.manage")
  reconcile(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.reconcileBank(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, reconcileBankSchema.parse(body));
  }

  @Get("vendors")
  @RequirePermissions("finance.vendor.view")
  vendors(@Req() req: Request) {
    return this.accountingService.listVendors(requireTenantContext(req).tenantId);
  }

  @Post("vendors")
  @RequirePermissions("finance.vendor.manage")
  createVendor(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createVendor(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createVendorSchema.parse(body));
  }

  @Get("payables")
  @RequirePermissions("finance.payable.view")
  payables(@Req() req: Request) {
    return this.accountingService.listVendorInvoices(requireTenantContext(req).tenantId);
  }

  @Post("payables")
  @RequirePermissions("finance.payable.manage")
  createPayable(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createVendorInvoice(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createVendorInvoiceSchema.parse(body));
  }

  @Post("payables/payments")
  @RequirePermissions("finance.payable.manage")
  vendorPayment(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.recordVendorPayment(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, recordVendorPaymentSchema.parse(body));
  }

  @Get("receivables")
  @RequirePermissions("finance.receivable.view")
  receivables(@Req() req: Request) {
    return this.accountingService.listCustomerInvoices(requireTenantContext(req).tenantId);
  }

  @Post("customers")
  @RequirePermissions("finance.receivable.manage")
  createCustomer(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createCustomer(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createCustomerSchema.parse(body));
  }

  @Post("receivables")
  @RequirePermissions("finance.receivable.manage")
  createReceivable(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createCustomerInvoice(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createCustomerInvoiceSchema.parse(body));
  }

  @Post("receivables/payments")
  @RequirePermissions("finance.receivable.manage")
  customerPayment(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.recordCustomerPayment(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, recordCustomerPaymentSchema.parse(body));
  }

  @Get("invoices")
  @RequirePermissions("finance.receivable.view")
  invoices(@Req() req: Request) {
    return this.accountingService.listCustomerInvoices(requireTenantContext(req).tenantId);
  }

  @Post("gst/returns")
  @RequirePermissions("finance.tax.manage")
  gstReturn(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.calculateGSTReturn(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, gstReturnSchema.parse(body));
  }

  @Get("taxes")
  @RequirePermissions("finance.tax.view")
  taxes(@Req() req: Request) {
    return this.accountingService.exportAccountingReport(requireTenantContext(req).tenantId, { userId: requireTenantContext(req).userId, membershipId: requireTenantContext(req).membershipId }, { report: "GST_SUMMARY", format: "JSON" });
  }

  @Post("erp")
  @RequirePermissions("finance.erp.manage")
  createERP(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.createERPIntegration(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, erpIntegrationSchema.parse(body));
  }

  @Get("erp")
  @RequirePermissions("finance.erp.view")
  erp(@Req() req: Request) {
    return this.accountingService.listERPIntegrations(requireTenantContext(req).tenantId);
  }

  @Post("erp/sync")
  @RequirePermissions("finance.erp.manage")
  erpSync(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.queueERPSync(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, erpSyncSchema.parse(body));
  }

  @Post("accounting/reports/export")
  @RequirePermissions("finance.report.export")
  accountingReport(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.accountingService.exportAccountingReport(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, accountingReportSchema.parse(body));
  }

  @Get("intelligence")
  @RequirePermissions("finance.report.view")
  intelligence(@Req() req: Request) {
    return this.accountingService.intelligence(requireTenantContext(req).tenantId);
  }
}
