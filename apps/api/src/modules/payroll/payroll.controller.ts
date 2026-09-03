import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  addPayrollAdjustmentSchema,
  approvePayrollRunSchema,
  createPayrollRunSchema,
  lockPayrollRunSchema,
  payrollFilterSchema,
  CreatePayrollCycleSchema,
  SubmitTaxDeclarationSchema,
  VerifyTaxDeclarationSchema,
  UploadTaxProofSchema,
  VerifyTaxProofSchema,
  CreatePayrollSettlementSchema,
  ReviewPayrollSettlementSchema,
  CalculateGratuitySchema,
  CreatePayrollBonusSchema,
  CreatePayrollIncentiveSchema,
  CreatePayrollLoanSchema,
  CreateCompensationRevisionSchema,
  ReviewCompensationRevisionSchema,
  CreateSalaryBandSchema
} from "./payroll.schemas.js";
import { PayrollService } from "./payroll.service.js";

@Controller("api/v1/payroll")
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post("runs")
  @RequirePermissions("payroll.generate")
  async generatePayrollRun(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = createPayrollRunSchema.parse(body);
    return this.payrollService.generatePayrollRun(
      tenant.tenantId,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("runs")
  @RequirePermissions("payroll.view")
  async listPayrollRuns(
    @Req() req: AuthenticatedRequest,
    @Query() query: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = payrollFilterSchema.parse(query);
    return this.payrollService.listPayrollRuns(tenant.tenantId, parsed);
  }

  @Get("runs/latest")
  @RequirePermissions("payroll.view")
  async getLatestPayrollRun(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getLatestPayrollRun(tenant.tenantId);
  }

  @Get("runs/:id")
  @RequirePermissions("payroll.view")
  async getPayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getPayrollRun(tenant.tenantId, id);
  }

  @Post("runs/:id/recalculate")
  @RequirePermissions("payroll.generate")
  async recalculatePayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.recalculatePayrollRun(
      tenant.tenantId,
      id,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("runs/:id/adjustments")
  @RequirePermissions("payroll.generate")
  async addAdjustment(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = addPayrollAdjustmentSchema.parse(body);
    return this.payrollService.addAdjustment(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Delete("runs/:id/adjustments/:adjustmentId")
  @RequirePermissions("payroll.generate")
  async removeAdjustment(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Param("adjustmentId") adjustmentId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.removeAdjustment(
      tenant.tenantId,
      id,
      adjustmentId,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("runs/:id/approve")
  @RequirePermissions("payroll.approve")
  async approvePayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = approvePayrollRunSchema.parse(body);
    const primaryRole = requirePayrollActorRole(tenant.roles, "approve");
    return this.payrollService.approvePayrollRun(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      primaryRole,
      tenant.membershipId
    );
  }

  @Post("runs/:id/lock")
  @RequirePermissions("payroll.lock")
  async lockPayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const parsed = lockPayrollRunSchema.parse(body);
    const primaryRole = requirePayrollActorRole(tenant.roles, "lock");
    return this.payrollService.lockPayrollRun(
      tenant.tenantId,
      id,
      parsed,
      tenant.userId,
      primaryRole,
      tenant.membershipId
    );
  }

  @Post("runs/:id/cancel")
  @RequirePermissions("payroll.generate")
  async cancelPayrollRun(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.cancelPayrollRun(
      tenant.tenantId,
      id,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("employees/:payrollRunEmployeeId")
  @RequirePermissions("payroll.view")
  async getEmployeePayroll(
    @Req() req: AuthenticatedRequest,
    @Param("payrollRunEmployeeId") payrollRunEmployeeId: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getEmployeePayroll(tenant.tenantId, payrollRunEmployeeId);
  }

  @Get("me")
  @RequirePermissions("payroll.view")
  async getMyPayroll(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    if (!tenant.userId) {
      throw new BadRequestException("User ID required.");
    }
    return this.payrollService.getMyPayroll(tenant.tenantId, tenant.userId);
  }

  @Get("audit")
  @RequirePermissions("payroll.audit")
  async getPayrollAudit(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getPayrollAudit(
      tenant.tenantId,
      limit ? parseInt(limit, 10) : 50
    );
  }

  // =========================================================================
  // TASK 30: ENTERPRISE PAYROLL & COMPENSATION OPERATIONS
  // =========================================================================

  // 1. Payroll Cycles
  @Get("cycles")
  @RequirePermissions("payroll.view")
  async listPayrollCycles(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.listPayrollCycles(tenant.tenantId);
  }

  @Post("cycles")
  @RequirePermissions("payroll.manage")
  async createPayrollCycle(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreatePayrollCycleSchema.parse(body);
    return this.payrollService.createPayrollCycle(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 2. Tax Declarations & Proofs
  @Get("tax-declarations")
  @RequirePermissions("payroll.view")
  async getTaxDeclaration(
    @Req() req: AuthenticatedRequest,
    @Query("employeeId") employeeId: string,
    @Query("financialYear") financialYear: string
  ) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getTaxDeclaration(tenant.tenantId, employeeId, financialYear);
  }

  @Post("tax-declarations")
  @RequirePermissions("payroll.view")
  async submitTaxDeclaration(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = SubmitTaxDeclarationSchema.parse(body);
    return this.payrollService.submitTaxDeclaration(
      tenant.tenantId,
      tenant.userId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Put("tax-declarations/:id/verify")
  @RequirePermissions("payroll.tax")
  async verifyTaxDeclaration(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = VerifyTaxDeclarationSchema.parse(body);
    return this.payrollService.verifyTaxDeclaration(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("tax-proofs")
  @RequirePermissions("payroll.view")
  async uploadTaxProof(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = UploadTaxProofSchema.parse(body);
    return this.payrollService.uploadTaxProof(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Put("tax-proofs/:id/verify")
  @RequirePermissions("payroll.tax")
  async verifyTaxProof(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = VerifyTaxProofSchema.parse(body);
    return this.payrollService.verifyTaxProof(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 3. Tax & Gratuity Calculation Endpoints
  @Post("tax/calculate")
  @RequirePermissions("payroll.view")
  async calculateTax(
    @Body("regime") regime: "OLD" | "NEW",
    @Body("grossAnnual") grossAnnual: number,
    @Body("basicAnnual") basicAnnual: number,
    @Body("hraAnnual") hraAnnual: number,
    @Body("rentPaidAnnual") rentPaidAnnual?: number,
    @Body("section80C") section80C?: number,
    @Body("section80D") section80D?: number,
    @Body("section24") section24?: number,
    @Body("nps") nps?: number
  ) {
    return this.payrollService.calculateTaxForEmployee(
      regime,
      grossAnnual,
      basicAnnual,
      hraAnnual,
      rentPaidAnnual ?? 0,
      section80C ?? 0,
      section80D ?? 0,
      section24 ?? 0,
      nps ?? 0
    );
  }

  @Post("gratuity/calculate")
  @RequirePermissions("payroll.view")
  async calculateGratuity(@Body() body: unknown) {
    const dto = CalculateGratuitySchema.parse(body);
    return this.payrollService.calculateGratuity(dto);
  }

  // 4. Full & Final Settlement (FnF)
  @Get("settlements")
  @RequirePermissions("payroll.view")
  async listSettlements(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.listSettlements(tenant.tenantId);
  }

  @Post("settlements")
  @RequirePermissions("payroll.manage")
  async createSettlement(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreatePayrollSettlementSchema.parse(body);
    return this.payrollService.createSettlement(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Put("settlements/:id/review")
  @RequirePermissions("payroll.approve")
  async reviewSettlement(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = ReviewPayrollSettlementSchema.parse(body);
    return this.payrollService.reviewSettlement(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 5. Bonuses & Incentives
  @Get("bonuses")
  @RequirePermissions("payroll.view")
  async listBonuses(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.listBonuses(tenant.tenantId);
  }

  @Post("bonuses")
  @RequirePermissions("payroll.manage")
  async createBonus(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreatePayrollBonusSchema.parse(body);
    return this.payrollService.createBonus(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Get("incentives")
  @RequirePermissions("payroll.view")
  async listIncentives(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.listIncentives(tenant.tenantId);
  }

  @Post("incentives")
  @RequirePermissions("payroll.manage")
  async createIncentive(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreatePayrollIncentiveSchema.parse(body);
    return this.payrollService.createIncentive(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 6. Loans & Advances
  @Get("loans")
  @RequirePermissions("payroll.view")
  async listLoans(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.listLoans(tenant.tenantId);
  }

  @Post("loans")
  @RequirePermissions("payroll.manage")
  async createLoan(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreatePayrollLoanSchema.parse(body);
    return this.payrollService.createLoan(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 7. Compensation Revisions & Bands
  @Get("revisions")
  @RequirePermissions("payroll.view")
  async listCompensationRevisions(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.listCompensationRevisions(tenant.tenantId);
  }

  @Post("revisions")
  @RequirePermissions("payroll.compensation")
  async createCompensationRevision(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateCompensationRevisionSchema.parse(body);
    return this.payrollService.createCompensationRevision(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Put("revisions/:id/review")
  @RequirePermissions("payroll.compensation")
  async reviewCompensationRevision(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = ReviewCompensationRevisionSchema.parse(body);
    return this.payrollService.reviewCompensationRevision(
      tenant.tenantId,
      id,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("revisions/simulate")
  @RequirePermissions("payroll.view")
  async simulateSalaryRevision(
    @Body("currentCtc") currentCtc: number,
    @Body("rating") rating: 1 | 2 | 3 | 4 | 5,
    @Body("compaRatio") compaRatio: number
  ) {
    return this.payrollService.simulateSalaryRevision(currentCtc, rating, compaRatio);
  }

  @Get("salary-bands")
  @RequirePermissions("payroll.view")
  async listSalaryBands(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.listSalaryBands(tenant.tenantId);
  }

  @Post("salary-bands")
  @RequirePermissions("payroll.compensation")
  async createSalaryBand(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown
  ) {
    const tenant = requireTenantContext(req);
    const dto = CreateSalaryBandSchema.parse(body);
    return this.payrollService.createSalaryBand(
      tenant.tenantId,
      dto,
      tenant.userId,
      tenant.membershipId
    );
  }

  // 8. Executive Analytics
  @Get("analytics/executive")
  @RequirePermissions("payroll.analytics")
  async getPayrollExecutiveAnalytics(@Req() req: AuthenticatedRequest) {
    const tenant = requireTenantContext(req);
    return this.payrollService.getPayrollExecutiveAnalytics(tenant.tenantId);
  }
}

function requirePayrollActorRole(roles: string[], action: "approve" | "lock") {
  const [primaryRole] = roles;
  if (!primaryRole) {
    throw new BadRequestException(`Payroll ${action} requires an authenticated role context.`);
  }

  return primaryRole;
}
