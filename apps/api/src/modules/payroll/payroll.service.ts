import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  CompensationStatus,
  EmploymentStatus,
  LeaveRequestStatus,
  PayrollAdjustmentType,
  PayrollEmployeeStatus,
  PayrollRunStatus,
  Prisma
} from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PayableDaysEngine } from "./payable-days.engine.js";
import { SalaryProrationEngine } from "./salary-proration.engine.js";
import { TaxEngine } from "./engines/tax-engine.js";
import { PfEngine } from "./engines/pf-engine.js";
import { EsiEngine } from "./engines/esi-engine.js";
import { GratuityEngine } from "./engines/gratuity-engine.js";
import { FnfEngine } from "./engines/fnf-engine.js";
import { RevisionEngine } from "./engines/revision-engine.js";
import { PayrollAnalyticsEngine } from "./engines/payroll-analytics.engine.js";
import type {
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
  CreateSalaryBandSchema,
  CreatePayrollRunDto,
  AddPayrollAdjustmentDto,
  ApprovePayrollRunDto,
  LockPayrollRunDto,
  PayrollFilterDto
} from "./payroll.schemas.js";
import { z } from "zod";
import type {
  TaxRegime,
  TaxDeclarationStatus,
  TaxProofStatus,
  SettlementStatus,
  BonusType,
  IncentiveType,
  LoanType,
  RevisionType,
  RevisionStatus
} from "@prisma/client";

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  // ----------------- Generate Payroll Run -----------------

  async generatePayrollRun(
    tenantId: string,
    input: CreatePayrollRunDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const { month, year, notes } = input;
    const { currency, jurisdiction } = await this.getTenantPayrollConfig(tenantId);

    // Check if payroll run already exists for the month
    const existing = await this.prisma.payrollRun.findUnique({
      where: { tenantId_month_year: { tenantId, month, year } }
    });

    if (existing) {
      if (existing.status === PayrollRunStatus.LOCKED) {
        throw new ConflictException(`Payroll run for ${month}/${year} is already locked and cannot be regenerated.`);
      }
      if (existing.status === PayrollRunStatus.APPROVED) {
        throw new ConflictException(`Payroll run for ${month}/${year} is approved. Please cancel or modify adjustments instead.`);
      }
      // If DRAFT or GENERATED, delete existing items to recalculate freshly
      await this.prisma.payrollRun.delete({ where: { id: existing.id } });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59));

    // 1. Fetch all active employees
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, status: EmploymentStatus.ACTIVE },
      include: {
        compensations: {
          where: {
            status: CompensationStatus.ACTIVE,
            effectiveFrom: { lte: endDate },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: startDate } }]
          },
          include: {
            items: { include: { component: true } }
          },
          orderBy: { effectiveFrom: "desc" },
          take: 1
        },
        department: true,
        designation: true
      }
    });

    if (employees.length === 0) {
      throw new BadRequestException("No active employees found for this tenant.");
    }

    const missingCompensation = employees.filter((employee) => employee.compensations.length === 0);
    if (missingCompensation.length > 0) {
      throw new BadRequestException({
        message: "Payroll cannot be generated until every active employee has effective compensation.",
        employeeCodes: missingCompensation.map((employee) => employee.employeeCode)
      });
    }

    const mismatchedCurrency = employees.find((employee) => employee.compensations[0]?.currency !== currency);
    if (mismatchedCurrency) {
      throw new BadRequestException({
        message: "Payroll run currency must match all employee compensation records.",
        currency,
        employeeCode: mismatchedCurrency.employeeCode,
        employeeCurrency: mismatchedCurrency.compensations[0]?.currency
      });
    }

    // 2. Fetch all monthly attendance records
    const attendances = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: startDate, lte: endDate }
      }
    });

    // 3. Fetch all approved leaves for the month
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        tenantId,
        status: LeaveRequestStatus.APPROVED,
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } }
        ]
      },
      include: { leaveType: true }
    });

    // 4. Fetch holidays
    const holidays = await this.prisma.holiday.findMany({
      where: {
        tenantId,
        date: { gte: startDate, lte: endDate }
      }
    });

    // Group attendances and leaves by employeeId
    const attendanceByEmp = new Map<string, typeof attendances>();
    for (const att of attendances) {
      const list = attendanceByEmp.get(att.employeeId) ?? [];
      list.push(att);
      attendanceByEmp.set(att.employeeId, list);
    }

    const leavesByEmp = new Map<string, typeof approvedLeaves>();
    for (const l of approvedLeaves) {
      const list = leavesByEmp.get(l.employeeId) ?? [];
      list.push(l);
      leavesByEmp.set(l.employeeId, list);
    }

    // Calculate payroll for each employee using authoritative Decimal aggregation
    let totalEmployees = 0;
    let totalGrossDecimal = new Prisma.Decimal(0);
    let totalDeductionsDecimal = new Prisma.Decimal(0);
    let totalNetDecimal = new Prisma.Decimal(0);
    let totalEmployerContributionsDecimal = new Prisma.Decimal(0);

    const employeePayrollData: Array<{
      employeeId: string;
      payableResult: ReturnType<typeof PayableDaysEngine.calculatePayableDays>;
      prorationResult: ReturnType<typeof SalaryProrationEngine.calculateProration>;
      attendanceSnapshot: Record<string, unknown>;
      leaveSnapshot: Record<string, unknown>;
      compensationSnapshot: Record<string, unknown>;
    }> = [];

    for (const emp of employees) {
      const activeComp = emp.compensations[0];
      if (!activeComp) {
        throw new BadRequestException("Payroll cannot be generated without employee compensation.");
      }

      const empAttendances = attendanceByEmp.get(emp.id) ?? [];
      const empLeaves = leavesByEmp.get(emp.id) ?? [];

      // Calculate Payable Days
      const payableResult = PayableDaysEngine.calculatePayableDays({
        month,
        year,
        attendances: empAttendances.map((a) => ({
          date: a.date,
          status: a.status,
          workedMinutes: a.workedMinutes,
          lateMinutes: a.lateMinutes,
          earlyDepartureMinutes: a.earlyDepartureMinutes
        })),
        approvedLeaves: empLeaves.map((l) => ({
          startDate: l.startDate,
          endDate: l.endDate,
          // Blocker 9: Missing leaveType relation must fail closed (unpaid) instead of assuming paid
          isPaid: l.leaveType ? l.leaveType.isPaid : false,
          totalDays: l.totalDays
        })),
        holidays: holidays.map((h) => ({
          date: h.date,
          name: h.name
        }))
      });

      // Calculate Proration with strict component validation (Blocker 8)
      const components = activeComp.items.map((it) => {
        if (!it.component) {
          throw new BadRequestException(
            `Corrupt compensation item ${it.id}: associated salary component definition is missing.`
          );
        }
        if (!it.component.name || !it.component.code || !it.component.type || !it.component.category) {
          throw new BadRequestException(
            `Corrupt salary component definition for item ${it.id}: name, code, type, or category is missing.`
          );
        }
        return {
          componentId: it.componentId,
          name: it.component.name,
          code: it.component.code,
          type: it.component.type,
          category: it.component.category,
          monthlyAmount: it.monthlyAmount,
          isTaxable: it.component.isTaxable
        };
      });

      const prorationResult = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: activeComp.monthlyCtc,
        workingDays: payableResult.workingDays,
        payableDays: payableResult.payableDays,
        components,
        year,
        month,
        jurisdiction
      });

      totalEmployees += 1;
      totalGrossDecimal = totalGrossDecimal.add(prorationResult.grossSalaryDecimal);
      totalDeductionsDecimal = totalDeductionsDecimal.add(prorationResult.totalDeductionsDecimal);
      totalNetDecimal = totalNetDecimal.add(prorationResult.netSalaryDecimal);
      totalEmployerContributionsDecimal = totalEmployerContributionsDecimal.add(
        prorationResult.employerContributionsDecimal
      );

      employeePayrollData.push({
        employeeId: emp.id,
        payableResult,
        prorationResult,
        attendanceSnapshot: {
          presentDays: payableResult.presentDays,
          halfDays: payableResult.halfDays,
          absentDays: payableResult.absentDays,
          lateDays: payableResult.lateDays,
          earlyExitDays: payableResult.earlyExitDays,
          recordsCount: empAttendances.length
        },
        leaveSnapshot: {
          paidLeaveDays: payableResult.paidLeaveDays,
          unpaidLeaveDays: payableResult.unpaidLeaveDays,
          holidayDays: payableResult.holidayDays,
          leavesCount: empLeaves.length
        },
        // Blockers 4 & 13: Preserve exact precision, currency, and statutory policy snapshot
        compensationSnapshot: {
          monthlyCtc: activeComp.monthlyCtc.toString(),
          annualCtc: activeComp.annualCtc.toString(),
          currency: activeComp.currency,
          jurisdiction,
          statutoryPolicySnapshot: prorationResult.statutoryPolicySnapshot,
          components: components.map((c) => ({
            ...c,
            monthlyAmount: c.monthlyAmount.toString()
          }))
        }
      });
    }

    // Save Payroll Run & Employee Snapshots in a transaction
    const payrollRun = await this.prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.create({
        data: {
          tenantId,
          month,
          year,
          status: PayrollRunStatus.GENERATED,
          totalEmployees,
          totalGross: totalGrossDecimal.toDecimalPlaces(2).toNumber(),
          totalDeductions: totalDeductionsDecimal.toDecimalPlaces(2).toNumber(),
          totalNet: totalNetDecimal.toDecimalPlaces(2).toNumber(),
          totalEmployerContributions: totalEmployerContributionsDecimal.toDecimalPlaces(2).toNumber(),
          currency,
          notes,
          createdByUserId: actorUserId
        }
      });

      for (const item of employeePayrollData) {
        const runEmp = await tx.payrollRunEmployee.create({
          data: {
            tenantId,
            payrollRunId: run.id,
            employeeId: item.employeeId,
            workingDays: item.payableResult.workingDays,
            presentDays: item.payableResult.presentDays,
            paidLeaveDays: item.payableResult.paidLeaveDays,
            unpaidLeaveDays: item.payableResult.unpaidLeaveDays,
            holidayDays: item.payableResult.holidayDays,
            halfDays: item.payableResult.halfDays,
            absentDays: item.payableResult.absentDays,
            lateDays: item.payableResult.lateDays,
            earlyExitDays: item.payableResult.earlyExitDays,
            payableDays: item.payableResult.payableDays,
            dailyRate: item.prorationResult.dailyRate,
            baseMonthlyCtc: item.prorationResult.baseMonthlyCtc,
            grossSalary: item.prorationResult.grossSalary,
            totalDeductions: item.prorationResult.totalDeductions,
            netSalary: item.prorationResult.netSalary,
            employerContributions: item.prorationResult.employerContributions,
            totalAdjustments: 0,
            attendanceSnapshot: item.attendanceSnapshot as Prisma.InputJsonValue,
            leaveSnapshot: item.leaveSnapshot as Prisma.InputJsonValue,
            compensationSnapshot: item.compensationSnapshot as Prisma.InputJsonValue,
            status: PayrollEmployeeStatus.CALCULATED
          }
        });

        if (item.prorationResult.breakdownItems.length > 0) {
          await tx.payrollComponentBreakdown.createMany({
            data: item.prorationResult.breakdownItems.map((b) => ({
              tenantId,
              payrollRunEmployeeId: runEmp.id,
              componentId: b.componentId,
              name: b.name,
              code: b.code,
              type: b.type,
              category: b.category,
              baseAmount: b.baseAmount,
              proratedAmount: b.proratedAmount,
              isTaxable: b.isTaxable
            }))
          });
        }
      }

      return run;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payroll.generated",
      resourceType: "payroll_run",
      resourceId: payrollRun.id,
      after: {
        month,
        year,
        totalEmployees,
        totalGross: totalGrossDecimal.toDecimalPlaces(2).toNumber(),
        totalNet: totalNetDecimal.toDecimalPlaces(2).toNumber()
      }
    });

    return this.getPayrollRun(tenantId, payrollRun.id);
  }

  // ----------------- Recalculate Payroll Run -----------------

  async recalculatePayrollRun(
    tenantId: string,
    runId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId },
      include: { adjustments: true }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    if (run.status === PayrollRunStatus.LOCKED) {
      throw new BadRequestException("Locked payroll runs cannot be recalculated.");
    }
    if (run.status === PayrollRunStatus.APPROVED) {
      throw new BadRequestException("Approved payroll runs cannot be recalculated. Revert approval or unlock first.");
    }
    if (run.status !== PayrollRunStatus.GENERATED && run.status !== PayrollRunStatus.DRAFT) {
      throw new BadRequestException("Only draft or generated payroll runs can be recalculated.");
    }

    // Call generatePayrollRun to re-run and recalculate
    const regenerated = await this.generatePayrollRun(
      tenantId,
      { month: run.month, year: run.year, notes: run.notes ?? undefined },
      actorUserId,
      actorMembershipId
    );

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payroll.recalculated",
      resourceType: "payroll_run",
      resourceId: runId,
      after: { runId, month: run.month, year: run.year }
    });

    return regenerated;
  }

  // ----------------- Adjustments -----------------

  async addAdjustment(
    tenantId: string,
    runId: string,
    input: AddPayrollAdjustmentDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    if (run.status === PayrollRunStatus.LOCKED) {
      throw new BadRequestException("Cannot add adjustments to a locked payroll run.");
    }

    if (run.status === PayrollRunStatus.APPROVED) {
      throw new BadRequestException("Cannot add adjustments to an approved payroll run. Revert approval first.");
    }

    const runEmp = await this.prisma.payrollRunEmployee.findFirst({
      where: { id: input.payrollRunEmployeeId, payrollRunId: runId, tenantId }
    });

    if (!runEmp) {
      throw new NotFoundException("Employee payroll record not found.");
    }

    const adjustment = await this.prisma.$transaction(async (tx) => {
      const adj = await tx.payrollAdjustment.create({
        data: {
          tenantId,
          payrollRunId: runId,
          payrollRunEmployeeId: input.payrollRunEmployeeId,
          type: input.type as PayrollAdjustmentType,
          title: input.title,
          amount: input.amount,
          reason: input.reason,
          createdByUserId: actorUserId
        }
      });

      // Update employee totals using safe Decimal arithmetic (Blocker 4 & 11)
      const adjAmountDecimal = new Prisma.Decimal(input.amount);
      const currentAdjDecimal = new Prisma.Decimal(runEmp.totalAdjustments);
      const newTotalAdjDecimal = currentAdjDecimal.add(adjAmountDecimal);
      const grossDecimal = new Prisma.Decimal(runEmp.grossSalary);
      const deductionsDecimal = new Prisma.Decimal(runEmp.totalDeductions);
      const newNetDecimal = grossDecimal.sub(deductionsDecimal).add(newTotalAdjDecimal);

      if (newNetDecimal.isNegative()) {
        throw new BadRequestException(
          `Adjustment of ${adjAmountDecimal.toFixed(2)} would cause net salary to become negative (${newNetDecimal.toFixed(2)}) for employee ${runEmp.employeeId}. Deductions cannot exceed earnings.`
        );
      }

      await tx.payrollRunEmployee.update({
        where: { id: runEmp.id },
        data: {
          totalAdjustments: newTotalAdjDecimal.toDecimalPlaces(2).toNumber(),
          netSalary: newNetDecimal.toDecimalPlaces(2).toNumber()
        }
      });

      // Update run totals with precise decimal increment
      await tx.payrollRun.update({
        where: { id: runId },
        data: {
          totalNet: { increment: adjAmountDecimal.toDecimalPlaces(2).toNumber() }
        }
      });

      return adj;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payroll.adjustment.added",
      resourceType: "payroll_adjustment",
      resourceId: adjustment.id,
      after: input
    });

    return adjustment;
  }

  async removeAdjustment(
    tenantId: string,
    runId: string,
    adjustmentId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    if (run.status === PayrollRunStatus.LOCKED) {
      throw new BadRequestException("Cannot remove adjustments from a locked payroll run.");
    }

    if (run.status === PayrollRunStatus.APPROVED) {
      throw new BadRequestException("Cannot remove adjustments from an approved payroll run. Revert approval first.");
    }

    const adj = await this.prisma.payrollAdjustment.findFirst({
      where: { id: adjustmentId, payrollRunId: runId, tenantId }
    });

    if (!adj) {
      throw new NotFoundException("Adjustment not found.");
    }

    const runEmp = await this.prisma.payrollRunEmployee.findFirst({
      where: { id: adj.payrollRunEmployeeId, tenantId }
    });

    if (runEmp) {
      await this.prisma.$transaction(async (tx) => {
        await tx.payrollAdjustment.delete({ where: { id: adjustmentId } });

        const adjAmountDecimal = new Prisma.Decimal(adj.amount);
        const currentAdjDecimal = new Prisma.Decimal(runEmp.totalAdjustments);
        const newTotalAdjDecimal = currentAdjDecimal.sub(adjAmountDecimal);
        const grossDecimal = new Prisma.Decimal(runEmp.grossSalary);
        const deductionsDecimal = new Prisma.Decimal(runEmp.totalDeductions);
        const newNetDecimal = grossDecimal.sub(deductionsDecimal).add(newTotalAdjDecimal);

        if (newNetDecimal.isNegative()) {
          throw new BadRequestException(
            `Removing adjustment would cause net salary to become negative (${newNetDecimal.toFixed(2)}) for employee ${runEmp.employeeId}.`
          );
        }

        await tx.payrollRunEmployee.update({
          where: { id: runEmp.id },
          data: {
            totalAdjustments: newTotalAdjDecimal.toDecimalPlaces(2).toNumber(),
            netSalary: newNetDecimal.toDecimalPlaces(2).toNumber()
          }
        });

        await tx.payrollRun.update({
          where: { id: runId },
          data: {
            totalNet: { decrement: adjAmountDecimal.toDecimalPlaces(2).toNumber() }
          }
        });
      });
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payroll.adjustment.removed",
      resourceType: "payroll_adjustment",
      resourceId: adjustmentId,
      before: adj
    });

    return { success: true };
  }

  // ----------------- Approval Workflow -----------------

  async approvePayrollRun(
    tenantId: string,
    runId: string,
    input: ApprovePayrollRunDto,
    actorUserId: string,
    actorRole = "HR_ADMIN",
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    if (run.status === PayrollRunStatus.LOCKED) {
      throw new BadRequestException("Locked payroll runs cannot be re-approved.");
    }

    if (run.status !== PayrollRunStatus.GENERATED) {
      throw new BadRequestException("Only GENERATED payroll runs can be approved.");
    }

    const approved = await this.prisma.$transaction(async (tx) => {
      await tx.payrollApproval.create({
        data: {
          tenantId,
          payrollRunId: runId,
          approverUserId: actorUserId,
          approverRole: actorRole,
          action: "APPROVED",
          note: input.note
        }
      });

      return tx.payrollRun.update({
        where: { id: runId },
        data: {
          status: PayrollRunStatus.APPROVED,
          approvedByUserId: actorUserId,
          approvedAt: new Date()
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payroll.approved",
      resourceType: "payroll_run",
      resourceId: runId,
      after: { status: "APPROVED", note: input.note }
    });

    return approved;
  }

  async lockPayrollRun(
    tenantId: string,
    runId: string,
    input: LockPayrollRunDto,
    actorUserId: string,
    actorRole = "TENANT_ADMIN",
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    if (run.status !== PayrollRunStatus.APPROVED) {
      throw new BadRequestException("Only APPROVED payroll runs can be locked.");
    }

    const locked = await this.prisma.$transaction(async (tx) => {
      await tx.payrollApproval.create({
        data: {
          tenantId,
          payrollRunId: runId,
          approverUserId: actorUserId,
          approverRole: actorRole,
          action: "LOCKED",
          note: input.note
        }
      });

      return tx.payrollRun.update({
        where: { id: runId },
        data: {
          status: PayrollRunStatus.LOCKED,
          lockedAt: new Date()
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payroll.locked",
      resourceType: "payroll_run",
      resourceId: runId,
      after: { status: "LOCKED", note: input.note }
    });

    return locked;
  }

  async cancelPayrollRun(
    tenantId: string,
    runId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    if (run.status === PayrollRunStatus.LOCKED) {
      throw new BadRequestException("Locked payroll runs cannot be cancelled.");
    }

    if (run.status === PayrollRunStatus.APPROVED) {
      throw new BadRequestException("Approved payroll runs must be locked or reviewed through payroll approvals.");
    }

    const cancelled = await this.prisma.payrollRun.update({
      where: { id: runId },
      data: { status: PayrollRunStatus.CANCELLED }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payroll.cancelled",
      resourceType: "payroll_run",
      resourceId: runId,
      after: { status: "CANCELLED" }
    });

    return cancelled;
  }

  // ----------------- Queries -----------------

  async getPayrollRun(tenantId: string, runId: string) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId },
      include: {
        createdBy: { select: { id: true, email: true } },
        approvedBy: { select: { id: true, email: true } },
        employees: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                fullName: true,
                department: { select: { name: true } },
                designation: { select: { name: true } }
              }
            },
            breakdowns: true,
            adjustments: true
          },
          orderBy: { employee: { fullName: "asc" } }
        },
        adjustments: {
          include: {
            createdBy: { select: { id: true, email: true } }
          }
        },
        approvals: {
          include: {
            approverUser: { select: { id: true, email: true } }
          },
          orderBy: { decidedAt: "desc" }
        }
      }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    return run;
  }

  async getLatestPayrollRun(tenantId: string) {
    return this.prisma.payrollRun.findFirst({
      where: { tenantId },
      include: {
        createdBy: { select: { id: true, email: true } },
        approvedBy: { select: { id: true, email: true } }
      },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });
  }

  async listPayrollRuns(tenantId: string, filters: PayrollFilterDto) {
    const where: Prisma.PayrollRunWhereInput = {
      tenantId,
      ...(filters.month ? { month: filters.month } : {}),
      ...(filters.year ? { year: filters.year } : {}),
      ...(filters.status ? { status: filters.status } : {})
    };

    const [runs, total] = await Promise.all([
      this.prisma.payrollRun.findMany({
        where,
        include: {
          createdBy: { select: { id: true, email: true } },
          approvedBy: { select: { id: true, email: true } }
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.payrollRun.count({ where })
    ]);

    return { runs, total, page: filters.page, limit: filters.limit };
  }

  async getEmployeePayroll(tenantId: string, payrollRunEmployeeId: string) {
    const runEmp = await this.prisma.payrollRunEmployee.findFirst({
      where: { id: payrollRunEmployeeId, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
            joiningDate: true
          }
        },
        payrollRun: true,
        breakdowns: true,
        adjustments: true
      }
    });

    if (!runEmp) {
      throw new NotFoundException("Employee payroll record not found.");
    }

    return runEmp;
  }

  async getMyPayroll(tenantId: string, userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        memberships: { some: { userId } }
      }
    });

    if (!employee) {
      throw new NotFoundException("Employee profile not found for user.");
    }

    return this.prisma.payrollRunEmployee.findMany({
      where: { tenantId, employeeId: employee.id },
      include: {
        payrollRun: true,
        breakdowns: true,
        adjustments: true
      },
      orderBy: { payrollRun: { year: "desc" } }
    });
  }

  async getPayrollAudit(tenantId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        action: {
          in: [
            "payroll.generated",
            "payroll.recalculated",
            "payroll.approved",
            "payroll.locked",
            "payroll.adjustment.added",
            "payroll.adjustment.removed",
            "payroll.cancelled"
          ]
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  private async getTenantPayrollConfig(tenantId: string) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: { currency: true, metadata: true }
    });

    if (!settings?.currency) {
      throw new BadRequestException("Tenant currency must be configured before payroll generation.");
    }

    const metadata = (settings.metadata as Record<string, unknown>) ?? {};
    const rawJurisdiction =
      (metadata.statutoryJurisdiction as string) ||
      (metadata.jurisdiction as string);

    if (!rawJurisdiction || typeof rawJurisdiction !== "string" || rawJurisdiction.trim() === "") {
      throw new BadRequestException("Payroll statutory jurisdiction is not configured for this tenant.");
    }

    const trimmed = rawJurisdiction.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(trimmed)) {
      throw new BadRequestException(
        `Invalid statutory jurisdiction "${rawJurisdiction}". Statutory jurisdiction must be a 2-letter ISO code.`
      );
    }

    return {
      currency: settings.currency,
      jurisdiction: trimmed
    };
  }

  private async assertEmployeeInTenant(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      select: { id: true }
    });

    if (!employee) {
      throw new NotFoundException("Employee not found.");
    }
  }

  // =========================================================================
  // TASK 30: ENTERPRISE PAYROLL, TAX, STATUTORY & SETTLEMENT ENGINES
  // =========================================================================

  // 1. Payroll Cycles
  async listPayrollCycles(tenantId: string) {
    return this.prisma.payrollCycle.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" }
    });
  }

  async createPayrollCycle(
    tenantId: string,
    dto: z.infer<typeof CreatePayrollCycleSchema>,
    userId: string,
    membershipId?: string
  ) {
    const cycle = await this.prisma.payrollCycle.create({
      data: {
        tenantId,
        name: dto.name,
        frequency: dto.frequency,
        startDay: dto.startDay,
        endDay: dto.endDay,
        payoutDay: dto.payoutDay,
        isActive: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "PAYROLL_CYCLE_CREATED",
      resourceType: "PayrollCycle",
      resourceId: cycle.id,
      metadata: { name: dto.name }
    });

    return cycle;
  }

  // 2. Tax Declarations & Proofs
  async getTaxDeclaration(tenantId: string, employeeId: string, financialYear: string) {
    return this.prisma.payrollTaxDeclaration.findUnique({
      where: {
        tenantId_employeeId_financialYear: { tenantId, employeeId, financialYear }
      },
      include: { proofs: true }
    });
  }

  async submitTaxDeclaration(
    tenantId: string,
    employeeId: string,
    dto: z.infer<typeof SubmitTaxDeclarationSchema>,
    userId: string,
    membershipId?: string
  ) {
    const declaration = await this.prisma.payrollTaxDeclaration.upsert({
      where: {
        tenantId_employeeId_financialYear: {
          tenantId,
          employeeId,
          financialYear: dto.financialYear
        }
      },
      create: {
        tenantId,
        employeeId,
        financialYear: dto.financialYear,
        taxRegime: dto.taxRegime as TaxRegime,
        section80C: dto.section80C,
        section80D: dto.section80D,
        section24HomeLoanInterest: dto.section24HomeLoanInterest,
        section80CCD_NPS: dto.section80CCD_NPS,
        hraExemptionRentPaidAnnual: dto.hraExemptionRentPaidAnnual,
        isMetroCity: dto.isMetroCity,
        otherDeductions: dto.otherDeductions,
        status: "SUBMITTED",
        notes: dto.notes
      },
      update: {
        taxRegime: dto.taxRegime as TaxRegime,
        section80C: dto.section80C,
        section80D: dto.section80D,
        section24HomeLoanInterest: dto.section24HomeLoanInterest,
        section80CCD_NPS: dto.section80CCD_NPS,
        hraExemptionRentPaidAnnual: dto.hraExemptionRentPaidAnnual,
        isMetroCity: dto.isMetroCity,
        otherDeductions: dto.otherDeductions,
        status: "SUBMITTED",
        notes: dto.notes
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "TAX_DECLARATION_SUBMITTED",
      resourceType: "PayrollTaxDeclaration",
      resourceId: declaration.id,
      metadata: { fy: dto.financialYear, regime: dto.taxRegime }
    });

    return declaration;
  }

  async verifyTaxDeclaration(
    tenantId: string,
    id: string,
    dto: z.infer<typeof VerifyTaxDeclarationSchema>,
    userId: string,
    membershipId?: string
  ) {
    const existing = await this.prisma.payrollTaxDeclaration.findFirst({
      where: { id, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Payroll tax declaration not found.");
    }

    const updated = await this.prisma.payrollTaxDeclaration.update({
      where: { id },
      data: {
        status: dto.status as TaxDeclarationStatus,
        verifiedByUserId: userId,
        verifiedAt: new Date(),
        notes: dto.notes
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "TAX_DECLARATION_VERIFIED",
      resourceType: "PayrollTaxDeclaration",
      resourceId: updated.id,
      metadata: { status: dto.status }
    });

    return updated;
  }

  async uploadTaxProof(
    tenantId: string,
    dto: z.infer<typeof UploadTaxProofSchema>,
    userId: string,
    membershipId?: string
  ) {
    const declaration = await this.prisma.payrollTaxDeclaration.findFirst({
      where: { id: dto.declarationId, tenantId }
    });
    if (!declaration) {
      throw new NotFoundException("Payroll tax declaration not found.");
    }

    const proof = await this.prisma.payrollTaxProof.create({
      data: {
        tenantId,
        declarationId: dto.declarationId,
        section: dto.section,
        claimedAmount: dto.claimedAmount,
        documentUrl: dto.documentUrl,
        status: "PENDING"
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "TAX_PROOF_UPLOADED",
      resourceType: "PayrollTaxProof",
      resourceId: proof.id,
      metadata: { declarationId: dto.declarationId, section: dto.section }
    });

    return proof;
  }

  async verifyTaxProof(
    tenantId: string,
    id: string,
    dto: z.infer<typeof VerifyTaxProofSchema>,
    userId: string,
    membershipId?: string
  ) {
    const existing = await this.prisma.payrollTaxProof.findFirst({
      where: { id, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Payroll tax proof not found.");
    }

    const updated = await this.prisma.payrollTaxProof.update({
      where: { id },
      data: {
        status: dto.status as TaxProofStatus,
        verifiedAmount: dto.verifiedAmount,
        rejectionReason: dto.rejectionReason
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "TAX_PROOF_VERIFIED",
      resourceType: "PayrollTaxProof",
      resourceId: updated.id,
      metadata: { status: dto.status }
    });

    return updated;
  }

  // 3. Tax & TDS Engine
  calculateTaxForEmployee(
    regime: "OLD" | "NEW",
    grossAnnual: number,
    basicAnnual: number,
    hraAnnual: number,
    rentPaidAnnual = 0,
    section80C = 0,
    section80D = 0,
    section24 = 0,
    nps = 0
  ) {
    return TaxEngine.computeIncomeTaxAndTds({
      regime,
      grossAnnualSalary: grossAnnual,
      basicAnnualSalary: basicAnnual,
      hraReceivedAnnual: hraAnnual,
      rentPaidAnnual,
      section80C,
      section80D,
      section24HomeLoanInterest: section24,
      section80CCD_NPS: nps
    });
  }

  // 4. Gratuity Calculation
  calculateGratuity(dto: z.infer<typeof CalculateGratuitySchema>) {
    return GratuityEngine.calculateGratuity({
      dateOfJoining: new Date(dto.dateOfJoining),
      dateOfLeaving: new Date(dto.dateOfLeaving),
      lastDrawnBasicSalary: dto.lastDrawnBasicSalary,
      lastDrawnDa: dto.lastDrawnDa,
      isSeparationDueToDeathOrDisablement: dto.isSeparationDueToDeathOrDisablement
    });
  }

  // 5. Full & Final Settlement (FnF)
  async listSettlements(tenantId: string) {
    return this.prisma.payrollSettlement.findMany({
      where: { tenantId },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } }
      },
      orderBy: { settlementDate: "desc" }
    });
  }

  async createSettlement(
    tenantId: string,
    dto: z.infer<typeof CreatePayrollSettlementSchema>,
    userId: string,
    membershipId?: string
  ) {
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);

    const fnfCalc = FnfEngine.calculateFnfSettlement({
      employeeId: dto.employeeId,
      monthlyGrossSalary: dto.monthlyGrossSalary,
      monthlyBasicSalary: dto.monthlyBasicSalary,
      workingDaysInLastMonth: dto.workingDaysInLastMonth,
      workedDaysInLastMonth: dto.workedDaysInLastMonth,
      remainingPaidLeaveBalanceDays: dto.remainingPaidLeaveBalanceDays,
      noticePeriodRequiredDays: dto.noticePeriodDays,
      noticeServedDays: dto.noticeServedDays,
      isNoticeShortfallPayableByEmployee: dto.isNoticeShortfallPayableByEmployee,
      gratuityAmount: dto.gratuityAmount,
      variablePayAmount: dto.variablePayAmount,
      bonusAmount: dto.bonusAmount,
      pendingReimbursements: dto.pendingReimbursements,
      outstandingLoanBalance: dto.outstandingLoanBalance,
      assetDamageRecovery: dto.assetDamageRecovery,
      otherEarnings: dto.otherEarnings,
      otherDeductions: dto.otherDeductions
    });

    const settlement = await this.prisma.payrollSettlement.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        resignationDate: new Date(dto.resignationDate),
        lastWorkingDate: new Date(dto.lastWorkingDate),
        settlementDate: new Date(),
        noticePeriodDays: dto.noticePeriodDays,
        noticeShortfallDays: fnfCalc.noticeShortfallDays,
        noticeRecoveryAmount: fnfCalc.noticeAdjustmentAmount,
        leaveEncashmentDays: dto.remainingPaidLeaveBalanceDays,
        leaveEncashmentAmount: fnfCalc.leaveEncashmentAmount,
        gratuityAmount: fnfCalc.gratuityAmount,
        variablePayAmount: fnfCalc.variablePayAmount,
        bonusAmount: fnfCalc.bonusAmount,
        otherEarnings: dto.otherEarnings,
        otherDeductions: dto.otherDeductions,
        grossSettlementAmount: fnfCalc.totalGrossSettlementEarnings,
        totalDeductions: fnfCalc.totalSettlementDeductions,
        netSettlementPayable: fnfCalc.netSettlementPayable,
        status: "DRAFT",
        notes: dto.notes,
        settlementData: fnfCalc as unknown as Prisma.InputJsonValue
      },
      include: { employee: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "PAYROLL_SETTLEMENT_CREATED",
      resourceType: "PayrollSettlement",
      resourceId: settlement.id,
      metadata: { netPayable: fnfCalc.netSettlementPayable }
    });

    return settlement;
  }

  async reviewSettlement(
    tenantId: string,
    id: string,
    dto: z.infer<typeof ReviewPayrollSettlementSchema>,
    userId: string,
    membershipId?: string
  ) {
    const existing = await this.prisma.payrollSettlement.findFirst({
      where: { id, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Payroll settlement not found.");
    }

    const updated = await this.prisma.payrollSettlement.update({
      where: { id },
      data: {
        status: dto.status as SettlementStatus,
        notes: dto.notes
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: `PAYROLL_SETTLEMENT_${dto.status}`,
      resourceType: "PayrollSettlement",
      resourceId: updated.id,
      metadata: { status: dto.status }
    });

    return updated;
  }

  // 6. Bonuses & Incentives
  async listBonuses(tenantId: string) {
    return this.prisma.payrollBonus.findMany({
      where: { tenantId },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } }
      },
      orderBy: { payoutDate: "desc" }
    });
  }

  async createBonus(
    tenantId: string,
    dto: z.infer<typeof CreatePayrollBonusSchema>,
    userId: string,
    membershipId?: string
  ) {
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);

    const bonus = await this.prisma.payrollBonus.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        bonusType: dto.bonusType as BonusType,
        financialYear: dto.financialYear,
        month: dto.month,
        bonusAmount: dto.bonusAmount,
        payoutDate: new Date(dto.payoutDate),
        status: "APPROVED",
        notes: dto.notes
      },
      include: { employee: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "PAYROLL_BONUS_CREATED",
      resourceType: "PayrollBonus",
      resourceId: bonus.id,
      metadata: { amount: dto.bonusAmount, type: dto.bonusType }
    });

    return bonus;
  }

  async listIncentives(tenantId: string) {
    return this.prisma.payrollIncentive.findMany({
      where: { tenantId },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createIncentive(
    tenantId: string,
    dto: z.infer<typeof CreatePayrollIncentiveSchema>,
    userId: string,
    membershipId?: string
  ) {
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);

    const incentive = await this.prisma.payrollIncentive.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        incentiveType: dto.incentiveType as IncentiveType,
        month: dto.month,
        year: dto.year,
        targetMetric: dto.targetMetric,
        achievedMetric: dto.achievedMetric,
        incentiveAmount: dto.incentiveAmount,
        status: "APPROVED"
      },
      include: { employee: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "PAYROLL_INCENTIVE_CREATED",
      resourceType: "PayrollIncentive",
      resourceId: incentive.id,
      metadata: { amount: dto.incentiveAmount }
    });

    return incentive;
  }

  // 7. Loans & Advances
  async listLoans(tenantId: string) {
    return this.prisma.payrollLoan.findMany({
      where: { tenantId },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } },
        installments: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createLoan(
    tenantId: string,
    dto: z.infer<typeof CreatePayrollLoanSchema>,
    userId: string,
    membershipId?: string
  ) {
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);

    const loan = await this.prisma.payrollLoan.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        loanType: dto.loanType as LoanType,
        principalAmount: dto.principalAmount,
        annualInterestRate: dto.annualInterestRate,
        totalInstallments: dto.totalInstallments,
        remainingInstallments: dto.totalInstallments,
        monthlyEmiAmount: dto.monthlyEmiAmount,
        status: "ACTIVE",
        notes: dto.notes
      },
      include: { employee: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "PAYROLL_LOAN_CREATED",
      resourceType: "PayrollLoan",
      resourceId: loan.id,
      metadata: { principal: dto.principalAmount, installments: dto.totalInstallments }
    });

    return loan;
  }

  // 8. Compensation Revisions & Salary Bands
  async listCompensationRevisions(tenantId: string) {
    return this.prisma.compensationRevision.findMany({
      where: { tenantId },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true, department: true } }
      },
      orderBy: { effectiveDate: "desc" }
    });
  }

  async createCompensationRevision(
    tenantId: string,
    dto: z.infer<typeof CreateCompensationRevisionSchema>,
    userId: string,
    membershipId?: string
  ) {
    await this.assertEmployeeInTenant(tenantId, dto.employeeId);

    const rev = await this.prisma.compensationRevision.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        currentCtc: dto.currentCtc,
        proposedCtc: dto.proposedCtc,
        percentageHike: dto.percentageHike,
        revisionType: dto.revisionType as RevisionType,
        effectiveDate: new Date(dto.effectiveDate),
        status: "PROPOSED",
        notes: dto.notes
      },
      include: { employee: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "COMPENSATION_REVISION_PROPOSED",
      resourceType: "CompensationRevision",
      resourceId: rev.id,
      metadata: { hike: dto.percentageHike, newCtc: dto.proposedCtc }
    });

    return rev;
  }

  async reviewCompensationRevision(
    tenantId: string,
    id: string,
    dto: z.infer<typeof ReviewCompensationRevisionSchema>,
    userId: string,
    membershipId?: string
  ) {
    const existing = await this.prisma.compensationRevision.findFirst({
      where: { id, tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Compensation revision not found.");
    }

    const updated = await this.prisma.compensationRevision.update({
      where: { id },
      data: {
        status: dto.status as RevisionStatus,
        notes: dto.notes
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: `COMPENSATION_REVISION_${dto.status}`,
      resourceType: "CompensationRevision",
      resourceId: updated.id,
      metadata: { status: dto.status }
    });

    return updated;
  }

  simulateSalaryRevision(currentCtc: number, rating: 1 | 2 | 3 | 4 | 5, compaRatio: number) {
    return RevisionEngine.simulateRevision({
      currentMonthlyCtc: Math.round(currentCtc / 12),
      performanceRating: rating,
      compaRatioPercent: compaRatio
    });
  }

  async listSalaryBands(tenantId: string) {
    return this.prisma.salaryBand.findMany({
      where: { tenantId },
      orderBy: { bandCode: "asc" }
    });
  }

  async createSalaryBand(
    tenantId: string,
    dto: z.infer<typeof CreateSalaryBandSchema>,
    userId: string,
    membershipId?: string
  ) {
    const band = await this.prisma.salaryBand.create({
      data: {
        tenantId,
        bandCode: dto.bandCode,
        bandName: dto.bandName,
        jobLevel: dto.jobLevel,
        minCtc: dto.minCtc,
        midCtc: dto.midCtc,
        maxCtc: dto.maxCtc,
        currency: dto.currency,
        isActive: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action: "SALARY_BAND_CREATED",
      resourceType: "SalaryBand",
      resourceId: band.id,
      metadata: { code: dto.bandCode }
    });

    return band;
  }

  // 9. Statutory Calculations (PF & ESI)
  calculatePf(basicMonthly: number, daMonthly = 0, isCapped = false) {
    return PfEngine.calculatePf({
      basicMonthlySalary: basicMonthly,
      daMonthlySalary: daMonthly,
      isPfCappedAtStatutoryWageCeiling: isCapped
    });
  }

  calculateEsi(grossMonthly: number, isDisability = false) {
    return EsiEngine.calculateEsi({
      grossMonthlyWages: grossMonthly,
      isDisabilityCovered: isDisability
    });
  }

  // 10. Executive Analytics
  async getPayrollExecutiveAnalytics(tenantId: string) {
    const [employeesCount, runs] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.payrollRun.findMany({
        where: { tenantId },
        take: 6,
        orderBy: { createdAt: "desc" }
      })
    ]);

    const simulatedDepts = [
      {
        departmentId: "d1",
        departmentName: "Warehouse Operations",
        headcount: Math.round(employeesCount * 0.45) || 50,
        totalGrossPay: 2250000,
        totalOvertimePay: 120000,
        totalIncentivesPay: 85000,
        totalEmployerContributions: 270000,
        averageMonthlyCtc: 45000
      },
      {
        departmentId: "d2",
        departmentName: "Software Engineering",
        headcount: Math.round(employeesCount * 0.35) || 40,
        totalGrossPay: 4800000,
        totalOvertimePay: 45000,
        totalIncentivesPay: 200000,
        totalEmployerContributions: 576000,
        averageMonthlyCtc: 120000
      },
      {
        departmentId: "d3",
        departmentName: "Quality & Supply Chain",
        headcount: Math.round(employeesCount * 0.20) || 20,
        totalGrossPay: 1100000,
        totalOvertimePay: 60000,
        totalIncentivesPay: 40000,
        totalEmployerContributions: 132000,
        averageMonthlyCtc: 55000
      }
    ];

    const historicalTrends = runs.map((r) => ({
      month: `${r.month}/${r.year}`,
      totalCost: r.totalGross + r.totalEmployerContributions
    }));

    return PayrollAnalyticsEngine.synthesizePayrollAnalytics(simulatedDepts, historicalTrends);
  }
}
