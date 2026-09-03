import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  PayrollRunStatus,
  PayslipDistributionStatus,
  PayslipStatus,
  type Prisma
} from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  EMAIL_PROVIDER,
  type EmailProvider
} from "./distribution/email.provider.js";
import {
  PayslipPdfEngine,
  type PayslipPdfData
} from "./payslip-pdf.engine.js";
import type {
  DistributionFilterDto,
  DistributePayslipsDto,
  PayslipFilterDto
} from "./payslips.schemas.js";
import {
  STORAGE_PROVIDER,
  type StorageProvider
} from "../storage/storage.provider.js";

@Injectable()
export class PayslipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: StorageProvider,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider
  ) {}

  // ----------------- Batch Generation for Run -----------------

  async generatePayslipsForRun(
    tenantId: string,
    payrollRunId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: payrollRunId, tenantId },
      include: {
        tenant: { select: { name: true } },
        employees: {
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                employeeCode: true,
                email: true,
                department: { select: { name: true } },
                designation: { select: { name: true } },
                joiningDate: true
              }
            },
            breakdowns: true,
            adjustments: true
          }
        }
      }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    // CORE PRINCIPLE: Must be LOCKED
    if (run.status !== PayrollRunStatus.LOCKED) {
      throw new BadRequestException(
        "Payslips can ONLY be generated from LOCKED payroll runs. Current status: " + run.status
      );
    }

    const createdPayslips = [];

    for (const runEmp of run.employees) {
      // Determine next version
      const existingCount = await this.prisma.payslip.count({
        where: { tenantId, payrollRunEmployeeId: runEmp.id }
      });
      const version = existingCount + 1;

      // Prepare PDF data
      const earnings = runEmp.breakdowns
        .filter((b) => b.type === "EARNING")
        .map((b) => ({ name: b.name, amount: b.proratedAmount }));

      const deductions = runEmp.breakdowns
        .filter((b) => b.type === "DEDUCTION")
        .map((b) => ({ name: b.name, amount: b.proratedAmount }));

      const employerContributions = runEmp.breakdowns
        .filter((b) => b.type === "EMPLOYER_CONTRIBUTION")
        .map((b) => ({ name: b.name, amount: b.proratedAmount }));

      // Append adjustments to earnings/deductions
      for (const adj of runEmp.adjustments) {
        if (adj.amount >= 0) {
          earnings.push({ name: adj.title, amount: adj.amount });
        } else {
          deductions.push({ name: adj.title, amount: Math.abs(adj.amount) });
        }
      }

      const pdfData: PayslipPdfData = {
        tenantName: run.tenant?.name ?? "VC Organics",
        month: run.month,
        year: run.year,
        version,
        currency: run.currency,
        generatedAt: new Date(),
        employee: {
          fullName: runEmp.employee.fullName,
          employeeCode: runEmp.employee.employeeCode,
          department: runEmp.employee.department?.name,
          designation: runEmp.employee.designation?.name,
          joiningDate: runEmp.employee.joiningDate
            ? new Date(runEmp.employee.joiningDate).toLocaleDateString()
            : undefined
        },
        attendance: {
          workingDays: runEmp.workingDays,
          payableDays: runEmp.payableDays,
          presentDays: runEmp.presentDays,
          paidLeaveDays: runEmp.paidLeaveDays,
          holidayDays: runEmp.holidayDays,
          halfDays: runEmp.halfDays,
          absentDays: runEmp.absentDays
        },
        earnings,
        deductions,
        employerContributions,
        grossSalary: runEmp.grossSalary,
        totalDeductions: runEmp.totalDeductions,
        netSalary: runEmp.netSalary
      };

      const pdfBuffer = PayslipPdfEngine.generatePayslipPdf(pdfData);
      const storageKey = `${tenantId}/payslips/${run.year}/${run.month}/${runEmp.employeeId}/v${version}.pdf`;

      await this.storageProvider.upload(storageKey, pdfBuffer);

      const payslip = await this.prisma.payslip.create({
        data: {
          tenantId,
          employeeId: runEmp.employeeId,
          payrollRunId: run.id,
          payrollRunEmployeeId: runEmp.id,
          month: run.month,
          year: run.year,
          grossSalary: runEmp.grossSalary,
          deductions: runEmp.totalDeductions,
          netSalary: runEmp.netSalary,
          pdfPath: storageKey,
          version,
          status: PayslipStatus.GENERATED,
          generatedByUserId: actorUserId
        }
      });

      createdPayslips.push(payslip);
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payslip.generated",
      resourceType: "payroll_run",
      resourceId: payrollRunId,
      after: {
        payrollRunId,
        month: run.month,
        year: run.year,
        count: createdPayslips.length
      }
    });

    return {
      message: `Successfully generated ${createdPayslips.length} payslips for ${run.month}/${run.year}.`,
      count: createdPayslips.length,
      payslips: createdPayslips
    };
  }

  // ----------------- Single Employee Generation -----------------

  async generateEmployeePayslip(
    tenantId: string,
    payrollRunEmployeeId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const runEmp = await this.prisma.payrollRunEmployee.findFirst({
      where: { id: payrollRunEmployeeId, tenantId },
      include: {
        payrollRun: {
          include: { tenant: { select: { name: true } } }
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
            joiningDate: true
          }
        },
        breakdowns: true,
        adjustments: true
      }
    });

    if (!runEmp) {
      throw new NotFoundException("Employee payroll record not found.");
    }

    if (runEmp.payrollRun.status !== PayrollRunStatus.LOCKED) {
      throw new BadRequestException("Payslips can only be generated for LOCKED payroll runs.");
    }

    const existingCount = await this.prisma.payslip.count({
      where: { tenantId, payrollRunEmployeeId }
    });
    const version = existingCount + 1;

    const earnings = runEmp.breakdowns
      .filter((b) => b.type === "EARNING")
      .map((b) => ({ name: b.name, amount: b.proratedAmount }));

    const deductions = runEmp.breakdowns
      .filter((b) => b.type === "DEDUCTION")
      .map((b) => ({ name: b.name, amount: b.proratedAmount }));

    const employerContributions = runEmp.breakdowns
      .filter((b) => b.type === "EMPLOYER_CONTRIBUTION")
      .map((b) => ({ name: b.name, amount: b.proratedAmount }));

    for (const adj of runEmp.adjustments) {
      if (adj.amount >= 0) {
        earnings.push({ name: adj.title, amount: adj.amount });
      } else {
        deductions.push({ name: adj.title, amount: Math.abs(adj.amount) });
      }
    }

    const pdfData: PayslipPdfData = {
      tenantName: runEmp.payrollRun.tenant?.name ?? "VC Organics",
      month: runEmp.payrollRun.month,
      year: runEmp.payrollRun.year,
      version,
      currency: runEmp.payrollRun.currency,
      generatedAt: new Date(),
      employee: {
        fullName: runEmp.employee.fullName,
        employeeCode: runEmp.employee.employeeCode,
        department: runEmp.employee.department?.name,
        designation: runEmp.employee.designation?.name,
        joiningDate: runEmp.employee.joiningDate
          ? new Date(runEmp.employee.joiningDate).toLocaleDateString()
          : undefined
      },
      attendance: {
        workingDays: runEmp.workingDays,
        payableDays: runEmp.payableDays,
        presentDays: runEmp.presentDays,
        paidLeaveDays: runEmp.paidLeaveDays,
        holidayDays: runEmp.holidayDays,
        halfDays: runEmp.halfDays,
        absentDays: runEmp.absentDays
      },
      earnings,
      deductions,
      employerContributions,
      grossSalary: runEmp.grossSalary,
      totalDeductions: runEmp.totalDeductions,
      netSalary: runEmp.netSalary
    };

    const pdfBuffer = PayslipPdfEngine.generatePayslipPdf(pdfData);
    const storageKey = `${tenantId}/payslips/${runEmp.payrollRun.year}/${runEmp.payrollRun.month}/${runEmp.employeeId}/v${version}.pdf`;

    await this.storageProvider.upload(storageKey, pdfBuffer);

    const payslip = await this.prisma.payslip.create({
      data: {
        tenantId,
        employeeId: runEmp.employeeId,
        payrollRunId: runEmp.payrollRunId,
        payrollRunEmployeeId: runEmp.id,
        month: runEmp.payrollRun.month,
        year: runEmp.payrollRun.year,
        grossSalary: runEmp.grossSalary,
        deductions: runEmp.totalDeductions,
        netSalary: runEmp.netSalary,
        pdfPath: storageKey,
        version,
        status: PayslipStatus.GENERATED,
        generatedByUserId: actorUserId
      },
      include: {
        employee: true,
        payrollRun: true
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: version > 1 ? "payslip.regenerated" : "payslip.generated",
      resourceType: "payslip",
      resourceId: payslip.id,
      after: { version, month: runEmp.payrollRun.month, year: runEmp.payrollRun.year }
    });

    return payslip;
  }

  // ----------------- Distribution -----------------

  async distributePayslips(
    tenantId: string,
    input: DistributePayslipsDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const payslips = await this.prisma.payslip.findMany({
      where: {
        id: { in: input.payslipIds },
        tenantId
      },
      include: {
        employee: { select: { id: true, fullName: true, email: true } },
        payrollRun: { select: { month: true, year: true } }
      }
    });

    if (payslips.length === 0) {
      throw new NotFoundException("No matching payslips found to distribute.");
    }

    const results = [];

    for (const payslip of payslips) {
      const recipientEmail = payslip.employee.email ?? "employee@vcorganics.com";

      // Dispatch via email provider
      const emailResult = await this.emailProvider.sendEmail({
        to: recipientEmail,
        subject: `Payslip for ${payslip.month}/${payslip.year} - VC Organics`,
        html: `<p>Dear ${payslip.employee.fullName}, your payslip for ${payslip.month}/${payslip.year} is now available for download.</p>`
      });

      const dist = await this.prisma.payslipDistribution.create({
        data: {
          tenantId,
          payslipId: payslip.id,
          employeeId: payslip.employeeId,
          channel: input.channel,
          recipientEmail,
          status: emailResult.success ? PayslipDistributionStatus.DELIVERED : PayslipDistributionStatus.FAILED,
          sentAt: new Date(),
          deliveredAt: emailResult.success ? new Date() : null,
          failedAt: emailResult.success ? null : new Date(),
          failureReason: emailResult.error
        }
      });

      // Update Payslip status to DISTRIBUTED
      await this.prisma.payslip.update({
        where: { id: payslip.id },
        data: { status: PayslipStatus.DISTRIBUTED }
      });

      await this.auditService.record({
        tenantId,
        actorUserId,
        actorMembershipId,
        action: emailResult.success ? "payslip.email.sent" : "payslip.email.failed",
        resourceType: "payslip_distribution",
        resourceId: dist.id,
        after: {
          payslipId: payslip.id,
          recipientEmail,
          status: dist.status
        }
      });

      results.push(dist);
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payslip.distributed",
      resourceType: "payslip_batch",
      resourceId: `batch-${Date.now()}`,
      after: { distributedCount: results.length }
    });

    return {
      message: `Distributed ${results.length} payslips.`,
      distributions: results
    };
  }

  // ----------------- Secure Download & Streaming -----------------

  async downloadPayslip(
    tenantId: string,
    payslipId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id: payslipId, tenantId },
      include: {
        employee: { select: { employeeCode: true } }
      }
    });

    if (!payslip) {
      throw new NotFoundException("Payslip not found.");
    }

    const buffer = await this.storageProvider.getStream(payslip.pdfPath);

    // Update status to DOWNLOADED if not ARCHIVED
    if (payslip.status !== PayslipStatus.ARCHIVED) {
      await this.prisma.payslip.update({
        where: { id: payslipId },
        data: { status: PayslipStatus.DOWNLOADED }
      });
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payslip.downloaded",
      resourceType: "payslip",
      resourceId: payslipId,
      after: {
        payslipId,
        version: payslip.version,
        month: payslip.month,
        year: payslip.year
      }
    });

    const filename = `Payslip_${payslip.employee.employeeCode}_${payslip.year}_${String(payslip.month).padStart(2, "0")}_v${payslip.version}.pdf`;

    return {
      buffer,
      filename,
      contentType: "application/pdf"
    };
  }

  // ----------------- Viewing & Queries -----------------

  async viewPayslip(
    tenantId: string,
    payslipId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id: payslipId, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            email: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
            joiningDate: true
          }
        },
        payrollRun: true,
        payrollRunEmployee: {
          include: {
            breakdowns: true,
            adjustments: true
          }
        },
        distributions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!payslip) {
      throw new NotFoundException("Payslip not found.");
    }

    if (payslip.status === PayslipStatus.GENERATED || payslip.status === PayslipStatus.DISTRIBUTED) {
      await this.prisma.payslip.update({
        where: { id: payslipId },
        data: { status: PayslipStatus.VIEWED }
      });
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "payslip.viewed",
      resourceType: "payslip",
      resourceId: payslipId,
      after: { payslipId }
    });

    return payslip;
  }

  async listPayslips(tenantId: string, filters: PayslipFilterDto) {
    const where: Prisma.PayslipWhereInput = {
      tenantId,
      ...(filters.month ? { month: filters.month } : {}),
      ...(filters.year ? { year: filters.year } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            employee: {
              OR: [
                { fullName: { contains: filters.search, mode: "insensitive" } },
                { employeeCode: { contains: filters.search, mode: "insensitive" } }
              ]
            }
          }
        : {})
    };

    const [payslips, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where,
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
          payrollRun: {
            select: {
              id: true,
              month: true,
              year: true,
              status: true,
              currency: true
            }
          },
          distributions: { take: 1, orderBy: { createdAt: "desc" } }
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.payslip.count({ where })
    ]);

    return { payslips, total, page: filters.page, limit: filters.limit };
  }

  async getMyPayslips(tenantId: string, userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        memberships: { some: { userId } }
      }
    });

    if (!employee) {
      throw new NotFoundException("Employee profile not linked to user.");
    }

    return this.prisma.payslip.findMany({
      where: { tenantId, employeeId: employee.id },
      include: {
        payrollRun: {
          select: {
            id: true,
            month: true,
            year: true,
            status: true,
            currency: true
          }
        },
        payrollRunEmployee: {
          include: {
            breakdowns: true,
            adjustments: true
          }
        }
      },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });
  }

  async listDistributions(tenantId: string, filters: DistributionFilterDto) {
    const where: Prisma.PayslipDistributionWhereInput = {
      tenantId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {})
    };

    const [distributions, total] = await Promise.all([
      this.prisma.payslipDistribution.findMany({
        where,
        include: {
          employee: {
            select: { id: true, employeeCode: true, fullName: true }
          },
          payslip: {
            select: { id: true, month: true, year: true, version: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.payslipDistribution.count({ where })
    ]);

    return { distributions, total, page: filters.page, limit: filters.limit };
  }

  async getPayslipAudit(tenantId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        action: {
          in: [
            "payslip.generated",
            "payslip.regenerated",
            "payslip.downloaded",
            "payslip.viewed",
            "payslip.distributed",
            "payslip.email.sent",
            "payslip.email.failed",
            "payslip.archived"
          ]
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }
}
