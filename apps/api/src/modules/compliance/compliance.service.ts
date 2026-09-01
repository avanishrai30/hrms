import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  type ComplianceType,
  type Prisma
} from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CalculatePreviewDto,
  CreateComplianceRuleDto,
  CreateRuleVersionDto
} from "./compliance.schemas.js";
import { EsiProvider } from "./providers/esi.provider.js";
import { PfProvider } from "./providers/pf.provider.js";
import { PtProvider } from "./providers/pt.provider.js";
import { TdsProvider } from "./providers/tds.provider.js";

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly pfProvider: PfProvider,
    private readonly esiProvider: EsiProvider,
    private readonly ptProvider: PtProvider,
    private readonly tdsProvider: TdsProvider
  ) {}

  // ----------------- Rules & Versioning -----------------

  async listRules(tenantId: string, type?: ComplianceType) {
    return this.prisma.complianceRule.findMany({
      where: {
        tenantId,
        ...(type ? { type } : {})
      },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 5
        }
      },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
  }

  async getRule(tenantId: string, ruleId: string) {
    const rule = await this.prisma.complianceRule.findFirst({
      where: { id: ruleId, tenantId },
      include: {
        versions: {
          orderBy: { version: "desc" },
          include: { createdBy: { select: { id: true, email: true } } }
        }
      }
    });

    if (!rule) {
      throw new NotFoundException("Compliance rule not found.");
    }
    return rule;
  }

  async createRule(
    tenantId: string,
    input: CreateComplianceRuleDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.complianceRule.findUnique({
      where: { tenantId_code: { tenantId, code: input.code } }
    });

    if (existing) {
      throw new BadRequestException(`Rule with code ${input.code} already exists.`);
    }

    const rule = await this.prisma.complianceRule.create({
      data: {
        tenantId,
        type: input.type,
        name: input.name,
        code: input.code,
        state: input.state,
        description: input.description,
        currentVersion: 1,
        versions: {
          create: {
            tenantId,
            version: 1,
            effectiveFrom: input.effectiveFrom,
            configuration: input.configuration as Prisma.InputJsonValue,
            createdById: actorUserId
          }
        }
      },
      include: { versions: true }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compliance.rule.created",
      resourceType: "compliance_rule",
      resourceId: rule.id,
      after: { code: rule.code, type: rule.type, version: 1 }
    });

    return rule;
  }

  async createRuleVersion(
    tenantId: string,
    ruleId: string,
    input: CreateRuleVersionDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const rule = await this.prisma.complianceRule.findFirst({
      where: { id: ruleId, tenantId }
    });

    if (!rule) {
      throw new NotFoundException("Compliance rule not found.");
    }

    const nextVersion = rule.currentVersion + 1;

    const [versionRecord] = await this.prisma.$transaction([
      this.prisma.complianceRuleVersion.create({
        data: {
          tenantId,
          ruleId: rule.id,
          version: nextVersion,
          effectiveFrom: input.effectiveFrom,
          effectiveTo: input.effectiveTo,
          configuration: input.configuration as Prisma.InputJsonValue,
          createdById: actorUserId
        }
      }),
      this.prisma.complianceRule.update({
        where: { id: rule.id },
        data: { currentVersion: nextVersion }
      })
    ]);

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compliance.rule.updated",
      resourceType: "compliance_rule",
      resourceId: rule.id,
      after: { code: rule.code, newVersion: nextVersion }
    });

    return versionRecord;
  }

  // ----------------- Calculation Preview Engine -----------------

  async calculatePreview(tenantId: string, input: CalculatePreviewDto) {
    const pf = this.pfProvider.calculate({
      basicWage: input.basicWage,
      enforceCeiling: true,
      isVpfEnabled: input.isVpfEnabled,
      vpfRate: input.vpfRate
    });

    const esi = this.esiProvider.calculate({
      grossWage: input.grossWage
    });

    const pt = this.ptProvider.calculate({
      grossWage: input.grossWage,
      state: input.state,
      month: input.month
    });

    const tds = this.tdsProvider.calculate({
      annualEstimatedGross: input.grossWage * 12,
      regime: input.taxRegime,
      declarations80C: input.taxDeclarations80C,
      declarations80D: input.taxDeclarations80D
    });

    return {
      month: input.month,
      year: input.year,
      state: input.state,
      pf,
      esi,
      pt,
      tds,
      totalEmployeeDeductions: pf.totalEmployeePf + esi.employeeEsi + pt.monthlyDeduction + tds.monthlyTds,
      totalEmployerContributions: pf.totalEmployerPf + esi.employerEsi
    };
  }

  // ----------------- Compliance Snapshots & Freezing -----------------

  async freezeComplianceSnapshotForRun(
    tenantId: string,
    payrollRunId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: payrollRunId, tenantId },
      include: {
        employees: {
          include: {
            breakdowns: true,
            employee: { select: { id: true, joiningDate: true } }
          }
        }
      }
    });

    if (!run) {
      throw new NotFoundException("Payroll run not found.");
    }

    const createdSnapshots = [];

    for (const emp of run.employees) {
      // Find basic wage from breakdowns
      const basicBreakdown = emp.breakdowns.find((b) => b.code === "BASIC");
      const basicWage = basicBreakdown ? basicBreakdown.proratedAmount : emp.grossSalary * 0.5;

      const pf = this.pfProvider.calculate({
        basicWage,
        enforceCeiling: true
      });

      const esi = this.esiProvider.calculate({
        grossWage: emp.grossSalary
      });

      const pt = this.ptProvider.calculate({
        grossWage: emp.grossSalary,
        state: "MH",
        month: run.month
      });

      const tds = this.tdsProvider.calculate({
        annualEstimatedGross: emp.grossSalary * 12,
        regime: "NEW"
      });

      const snapshot = await this.prisma.complianceSnapshot.upsert({
        where: { payrollRunEmployeeId: emp.id },
        create: {
          tenantId,
          payrollRunId: run.id,
          payrollRunEmployeeId: emp.id,
          employeeId: emp.employeeId,
          month: run.month,
          year: run.year,
          pfEmployee: pf.totalEmployeePf,
          pfEmployer: pf.totalEmployerPf,
          pfWageBasis: pf.wageBasis,
          esiEmployee: esi.employeeEsi,
          esiEmployer: esi.employerEsi,
          esiWageBasis: esi.wageBasis,
          ptAmount: pt.monthlyDeduction,
          ptState: pt.state,
          tdsAmount: tds.monthlyTds,
          tdsRegime: "NEW",
          ruleVersions: { pf: "v1.0", esi: "v1.0", pt: "v1.0", tds: "v1.0" }
        },
        update: {
          pfEmployee: pf.totalEmployeePf,
          pfEmployer: pf.totalEmployerPf,
          pfWageBasis: pf.wageBasis,
          esiEmployee: esi.employeeEsi,
          esiEmployer: esi.employerEsi,
          esiWageBasis: esi.wageBasis,
          ptAmount: pt.monthlyDeduction,
          ptState: pt.state,
          tdsAmount: tds.monthlyTds,
          tdsRegime: "NEW"
        }
      });

      createdSnapshots.push(snapshot);
    }

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compliance.snapshot.created",
      resourceType: "compliance_snapshot_batch",
      resourceId: `snap-${run.id}`,
      after: { payrollRunId: run.id, month: run.month, year: run.year, count: createdSnapshots.length }
    });

    return {
      message: `Frozen compliance snapshots for ${createdSnapshots.length} employees.`,
      count: createdSnapshots.length,
      snapshots: createdSnapshots
    };
  }

  async listSnapshots(tenantId: string, month?: number, year?: number, runId?: string) {
    return this.prisma.complianceSnapshot.findMany({
      where: {
        tenantId,
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
        ...(runId ? { payrollRunId: runId } : {})
      },
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
          select: { id: true, month: true, year: true, status: true }
        }
      },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    });
  }

  // ----------------- Reports & Summaries -----------------

  async getMonthlyComplianceSummary(tenantId: string, month: number, year: number, runId?: string) {
    const snapshots = await this.listSnapshots(tenantId, month, year, runId);

    const totalEmployees = snapshots.length;

    // PF aggregations
    const pfCovered = snapshots.filter((s) => s.pfWageBasis > 0);
    const totalPfWageBasis = pfCovered.reduce((acc, s) => acc + s.pfWageBasis, 0);
    const totalEmployeePf = pfCovered.reduce((acc, s) => acc + s.pfEmployee, 0);
    const totalEmployerPf = pfCovered.reduce((acc, s) => acc + s.pfEmployer, 0);
    const totalEmployerEps = pfCovered.reduce(
      (acc, s) => acc + Math.round(Math.min(s.pfWageBasis, 15000) * 0.0833),
      0
    );
    const totalAdminCharges = Math.round(totalPfWageBasis * 0.005);
    const totalEdliCharges = Math.round(Math.min(totalPfWageBasis, totalEmployees * 15000) * 0.005);

    // ESI aggregations
    const esiCovered = snapshots.filter((s) => s.esiWageBasis > 0);
    const totalEsiWageBasis = esiCovered.reduce((acc, s) => acc + s.esiWageBasis, 0);
    const totalEmployeeEsi = esiCovered.reduce((acc, s) => acc + s.esiEmployee, 0);
    const totalEmployerEsi = esiCovered.reduce((acc, s) => acc + s.esiEmployer, 0);

    // PT aggregations
    const ptCovered = snapshots.filter((s) => s.ptAmount > 0);
    const totalPtDeducted = ptCovered.reduce((acc, s) => acc + s.ptAmount, 0);
    const stateMap = new Map<string, { count: number; totalAmount: number }>();

    for (const s of ptCovered) {
      const state = s.ptState || "MH";
      const existing = stateMap.get(state) || { count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += s.ptAmount;
      stateMap.set(state, existing);
    }

    const stateBreakdown = Array.from(stateMap.entries()).map(([state, data]) => ({
      state,
      count: data.count,
      totalAmount: data.totalAmount
    }));

    // TDS aggregations
    const tdsCovered = snapshots.filter((s) => s.tdsAmount > 0);
    const totalTdsDeducted = tdsCovered.reduce((acc, s) => acc + s.tdsAmount, 0);
    const oldRegimeCount = snapshots.filter((s) => s.tdsRegime === "OLD").length;
    const newRegimeCount = snapshots.filter((s) => s.tdsRegime === "NEW").length;

    const totalStatutoryLiability =
      totalEmployeePf +
      totalEmployerPf +
      totalAdminCharges +
      totalEdliCharges +
      totalEmployeeEsi +
      totalEmployerEsi +
      totalPtDeducted +
      totalTdsDeducted;

    return {
      month,
      year,
      totalEmployees,
      pf: {
        totalEmployeesCovered: pfCovered.length,
        totalPfWageBasis,
        totalEmployeePf,
        totalEmployerPf,
        totalEmployerEps,
        totalAdminCharges,
        totalEdliCharges,
        totalPfContribution: totalEmployeePf + totalEmployerPf + totalAdminCharges + totalEdliCharges
      },
      esi: {
        totalEmployeesCovered: esiCovered.length,
        totalEsiWageBasis,
        totalEmployeeEsi,
        totalEmployerEsi,
        totalEsiContribution: totalEmployeeEsi + totalEmployerEsi
      },
      pt: {
        totalEmployeesCovered: ptCovered.length,
        totalPtDeducted,
        stateBreakdown
      },
      tds: {
        totalEmployeesCovered: tdsCovered.length,
        totalTdsDeducted,
        oldRegimeCount,
        newRegimeCount
      },
      totalStatutoryLiability
    };
  }

  async getPfSummaryReport(tenantId: string, month: number, year: number, runId?: string) {
    const summary = await this.getMonthlyComplianceSummary(tenantId, month, year, runId);
    const snapshots = await this.listSnapshots(tenantId, month, year, runId);
    return {
      summary: summary.pf,
      records: snapshots.map((s) => ({
        employeeCode: s.employee?.employeeCode,
        fullName: s.employee?.fullName,
        wageBasis: s.pfWageBasis,
        employeePf: s.pfEmployee,
        employerEpf: s.pfEmployer - Math.round(Math.min(s.pfWageBasis, 15000) * 0.0833),
        employerEps: Math.round(Math.min(s.pfWageBasis, 15000) * 0.0833),
        totalPf: s.pfEmployee + s.pfEmployer
      }))
    };
  }

  async getEsiSummaryReport(tenantId: string, month: number, year: number, runId?: string) {
    const summary = await this.getMonthlyComplianceSummary(tenantId, month, year, runId);
    const snapshots = await this.listSnapshots(tenantId, month, year, runId);
    return {
      summary: summary.esi,
      records: snapshots.map((s) => ({
        employeeCode: s.employee?.employeeCode,
        fullName: s.employee?.fullName,
        wageBasis: s.esiWageBasis,
        employeeEsi: s.esiEmployee,
        employerEsi: s.esiEmployer,
        totalEsi: s.esiEmployee + s.esiEmployer
      }))
    };
  }

  async getPtSummaryReport(tenantId: string, month: number, year: number, runId?: string) {
    const summary = await this.getMonthlyComplianceSummary(tenantId, month, year, runId);
    const snapshots = await this.listSnapshots(tenantId, month, year, runId);
    return {
      summary: summary.pt,
      records: snapshots.map((s) => ({
        employeeCode: s.employee?.employeeCode,
        fullName: s.employee?.fullName,
        state: s.ptState,
        amount: s.ptAmount
      }))
    };
  }

  async getTdsSummaryReport(tenantId: string, month: number, year: number, runId?: string) {
    const summary = await this.getMonthlyComplianceSummary(tenantId, month, year, runId);
    const snapshots = await this.listSnapshots(tenantId, month, year, runId);
    return {
      summary: summary.tds,
      records: snapshots.map((s) => ({
        employeeCode: s.employee?.employeeCode,
        fullName: s.employee?.fullName,
        regime: s.tdsRegime,
        monthlyTds: s.tdsAmount
      }))
    };
  }

  async getComplianceAudit(tenantId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        action: {
          in: [
            "compliance.rule.created",
            "compliance.rule.updated",
            "compliance.snapshot.created",
            "compliance.report.generated"
          ]
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }
}
