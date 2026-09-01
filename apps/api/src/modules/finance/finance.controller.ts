import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import type { ExpenseClaimStatus, TravelRequestStatus } from "@prisma/client";
import type { Request } from "express";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  createBudgetAllocationSchema,
  createCostCenterSchema,
  createDepartmentBudgetSchema,
  createExpenseCategorySchema,
  createExpenseClaimSchema,
  createExpensePolicySchema,
  createTravelSettlementSchema,
  createTravelAdvanceSchema,
  createTravelRequestSchema,
  ocrReceiptSchema,
  analyticsPeriodSchema,
  payrollPostingSchema,
  reportExportSchema,
  updateExpenseStatusSchema,
  updateTravelStatusSchema,
  uploadReceiptSchema
} from "./finance.schemas.js";
import { FinanceService } from "./finance.service.js";

@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  @RequirePermissions("finance.view")
  dashboard(@Req() req: Request, @Query("period") period?: string) {
    return this.financeService.analytics(requireTenantContext(req).tenantId, analyticsPeriodSchema.parse(period ?? "monthly"));
  }

  @Get("expenses")
  @RequirePermissions("expenses.view")
  expenses(@Req() req: Request, @Query("status") status?: ExpenseClaimStatus) {
    return this.financeService.listExpenses(requireTenantContext(req).tenantId, status);
  }

  @Post("expenses")
  @RequirePermissions("expenses.create")
  createExpense(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createExpense(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createExpenseClaimSchema.parse(body));
  }

  @Get("expenses/:id")
  @RequirePermissions("expenses.view")
  expense(@Req() req: Request, @Param("id") id: string) {
    return this.financeService.getExpense(requireTenantContext(req).tenantId, id);
  }

  @Post("expenses/:id/status")
  @RequirePermissions("expenses.manage")
  updateExpenseStatus(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.updateExpenseStatus(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, updateExpenseStatusSchema.parse(body));
  }

  @Post("receipts/ocr")
  @RequirePermissions("expenses.create")
  ocr(@Body() body: unknown) {
    return this.financeService.ocrReceipt(ocrReceiptSchema.parse(body));
  }

  @Post("receipts/upload")
  @RequirePermissions("expenses.create")
  uploadReceipt(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.uploadReceipt(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, uploadReceiptSchema.parse(body));
  }

  @Get("receipts/:id/access")
  @RequirePermissions("expenses.view")
  receiptAccess(@Req() req: Request, @Param("id") id: string) {
    return this.financeService.receiptAccess(requireTenantContext(req).tenantId, id);
  }

  @Get("travel")
  @RequirePermissions("travel.view")
  travel(@Req() req: Request, @Query("status") status?: TravelRequestStatus) {
    return this.financeService.listTravel(requireTenantContext(req).tenantId, status);
  }

  @Post("travel")
  @RequirePermissions("travel.create")
  createTravel(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createTravel(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createTravelRequestSchema.parse(body));
  }

  @Post("travel/:id/status")
  @RequirePermissions("travel.manage")
  updateTravelStatus(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.updateTravelStatus(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, updateTravelStatusSchema.parse(body));
  }

  @Post("travel/advances")
  @RequirePermissions("travel.manage")
  createTravelAdvance(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createTravelAdvance(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createTravelAdvanceSchema.parse(body));
  }

  @Post("travel/advances/:id/approve")
  @RequirePermissions("travel.manage")
  approveTravelAdvance(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.financeService.approveTravelAdvance(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id);
  }

  @Post("travel/advances/:id/disburse")
  @RequirePermissions("travel.manage")
  disburseTravelAdvance(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.financeService.disburseTravelAdvance(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id);
  }

  @Post("travel/settlements")
  @RequirePermissions("travel.manage")
  createTravelSettlement(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createTravelSettlement(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createTravelSettlementSchema.parse(body));
  }

  @Get("cost-centers")
  @RequirePermissions("budgets.view")
  costCenters(@Req() req: Request) {
    return this.financeService.listCostCenters(requireTenantContext(req).tenantId);
  }

  @Post("cost-centers")
  @RequirePermissions("budgets.manage")
  createCostCenter(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createCostCenter(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createCostCenterSchema.parse(body));
  }

  @Post("budgets")
  @RequirePermissions("budgets.manage")
  createBudget(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createBudget(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createDepartmentBudgetSchema.parse(body));
  }

  @Post("budgets/allocations")
  @RequirePermissions("budgets.manage")
  createAllocation(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createAllocation(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createBudgetAllocationSchema.parse(body));
  }

  @Get("reimbursements")
  @RequirePermissions("reimbursements.view")
  reimbursements(@Req() req: Request) {
    return this.financeService.listReimbursements(requireTenantContext(req).tenantId);
  }

  @Post("reimbursements/:claimId/pay")
  @RequirePermissions("reimbursements.manage")
  pay(@Req() req: Request, @Param("claimId") claimId: string, @Body("approvedAmount") approvedAmount?: number) {
    const ctx = requireTenantContext(req);
    return this.financeService.payReimbursement(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, claimId, approvedAmount);
  }

  @Get("categories")
  @RequirePermissions("finance.manage")
  categories(@Req() req: Request) {
    return this.financeService.listCategories(requireTenantContext(req).tenantId);
  }

  @Post("categories")
  @RequirePermissions("finance.manage")
  createCategory(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createCategory(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createExpenseCategorySchema.parse(body));
  }

  @Get("policies")
  @RequirePermissions("finance.manage")
  policies(@Req() req: Request) {
    return this.financeService.listPolicies(requireTenantContext(req).tenantId);
  }

  @Post("policies")
  @RequirePermissions("finance.manage")
  createPolicy(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.createPolicy(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, createExpensePolicySchema.parse(body));
  }

  @Post("reports/export")
  @RequirePermissions("finance.audit")
  exportReport(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.exportReport(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, reportExportSchema.parse(body));
  }

  @Post("payroll/postings")
  @RequirePermissions("finance.pay")
  payrollPostings(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    return this.financeService.generatePayrollInputs(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, payrollPostingSchema.parse(body));
  }
}
