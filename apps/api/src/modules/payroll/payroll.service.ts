import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  CompensationStatus,
  LeaveRequestStatus,
  PayrollAdjustmentType,
  PayrollEmployeeStatus,
  PayrollRunStatus,
  type Prisma
} from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PayableDaysEngine } from "./payable-days.engine.js";
import type {
  AddPayrollAdjustmentDto,
  ApprovePayrollRunDto,
  CreatePayrollRunDto,
  LockPayrollRunDto,
  PayrollFilterDto
} from "./payroll.schemas.js";
import { SalaryProrationEngine } from "./salary-proration.engine.js";

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
      where: { tenantId, status: "ACTIVE" },
      include: {
        compensations: {
          where: { status: CompensationStatus.ACTIVE },
          include: {
            items: { include: { component: true } }
          }
        },
        department: true,
        designation: true
      }
    });

    if (employees.length === 0) {
      throw new BadRequestException("No active employees found for this tenant.");
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

    // Calculate payroll for each employee
    let totalEmployees = 0;
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalEmployerContributions = 0;

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
        // Skip employees without an assigned salary
        continue;
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
          isPaid: l.leaveType?.isPaid ?? true,
          totalDays: l.totalDays
        })),
        holidays: holidays.map((h) => ({
          date: h.date,
          name: h.name
        }))
      });

      // Calculate Proration
      const components = activeComp.items.map((it) => ({
        componentId: it.componentId,
        name: it.component?.name ?? "Component",
        code: it.component?.code ?? "CODE",
        type: it.component?.type ?? "EARNING",
        category: it.component?.category ?? "CUSTOM",
        monthlyAmount: it.monthlyAmount,
        isTaxable: it.component?.isTaxable ?? true
      }));

      const prorationResult = SalaryProrationEngine.calculateProration({
        baseMonthlyCtc: activeComp.monthlyCtc,
        workingDays: payableResult.workingDays,
        payableDays: payableResult.payableDays,
        components
      });

      totalEmployees += 1;
      totalGross += prorationResult.grossSalary;
      totalDeductions += prorationResult.totalDeductions;
      totalNet += prorationResult.netSalary;
      totalEmployerContributions += prorationResult.employerContributions;

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
        compensationSnapshot: {
          monthlyCtc: activeComp.monthlyCtc,
          annualCtc: activeComp.annualCtc,
          components
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
          totalGross: Math.round(totalGross * 100) / 100,
          totalDeductions: Math.round(totalDeductions * 100) / 100,
          totalNet: Math.round(totalNet * 100) / 100,
          totalEmployerContributions: Math.round(totalEmployerContributions * 100) / 100,
          currency: "INR",
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
        totalGross: Math.round(totalGross * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100
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

      // Update employee totals
      const newTotalAdj = runEmp.totalAdjustments + input.amount;
      const newNet = Math.max(0, runEmp.grossSalary - runEmp.totalDeductions + newTotalAdj);

      await tx.payrollRunEmployee.update({
        where: { id: runEmp.id },
        data: {
          totalAdjustments: Math.round(newTotalAdj * 100) / 100,
          netSalary: Math.round(newNet * 100) / 100
        }
      });

      // Update run totals
      await tx.payrollRun.update({
        where: { id: runId },
        data: {
          totalNet: { increment: input.amount }
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

    if (!run || run.status === PayrollRunStatus.LOCKED) {
      throw new BadRequestException("Cannot remove adjustments from this payroll run.");
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

        const newTotalAdj = runEmp.totalAdjustments - adj.amount;
        const newNet = Math.max(0, runEmp.grossSalary - runEmp.totalDeductions + newTotalAdj);

        await tx.payrollRunEmployee.update({
          where: { id: runEmp.id },
          data: {
            totalAdjustments: Math.round(newTotalAdj * 100) / 100,
            netSalary: Math.round(newNet * 100) / 100
          }
        });

        await tx.payrollRun.update({
          where: { id: runId },
          data: {
            totalNet: { decrement: adj.amount }
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
}
