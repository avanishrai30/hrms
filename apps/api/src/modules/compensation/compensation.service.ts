import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  CompensationStatus,
  type Prisma
} from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  CompensationEngine,
  type ComponentCalculationInput
} from "./compensation-engine.js";
import type {
  AssignEmployeeCompensationDto,
  CalculateBreakdownDto,
  CompensationFilterDto,
  CreateCompensationTemplateDto,
  CreateSalaryComponentDto,
  ReviseEmployeeCompensationDto,
  UpdateCompensationTemplateDto,
  UpdateSalaryComponentDto
} from "./compensation.schemas.js";

@Injectable()
export class CompensationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  // ----------------- Salary Components -----------------

  async listComponents(tenantId: string) {
    return this.prisma.salaryComponent.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
  }

  async createComponent(
    tenantId: string,
    input: CreateSalaryComponentDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.salaryComponent.findFirst({
      where: { tenantId, code: input.code }
    });
    if (existing) {
      throw new ConflictException(`Salary component code ${input.code} already exists.`);
    }

    const component = await this.prisma.salaryComponent.create({
      data: {
        tenantId,
        name: input.name,
        code: input.code,
        type: input.type,
        category: input.category,
        isTaxable: input.isTaxable,
        isFixed: input.isFixed,
        calculationType: input.calculationType,
        calculationValue: input.calculationValue,
        description: input.description,
        isActive: input.isActive
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compensation.component.created",
      resourceType: "salary_component",
      resourceId: component.id,
      after: input
    });

    return component;
  }

  async updateComponent(
    tenantId: string,
    id: string,
    input: UpdateSalaryComponentDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const component = await this.prisma.salaryComponent.findFirst({
      where: { id, tenantId }
    });
    if (!component) {
      throw new NotFoundException("Salary component not found.");
    }

    const updated = await this.prisma.salaryComponent.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.isTaxable !== undefined ? { isTaxable: input.isTaxable } : {}),
        ...(input.isFixed !== undefined ? { isFixed: input.isFixed } : {}),
        ...(input.calculationType ? { calculationType: input.calculationType } : {}),
        ...(input.calculationValue !== undefined ? { calculationValue: input.calculationValue } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compensation.component.updated",
      resourceType: "salary_component",
      resourceId: id,
      before: component,
      after: input
    });

    return updated;
  }

  // ----------------- Compensation Templates -----------------

  async listTemplates(tenantId: string) {
    return this.prisma.compensationTemplate.findMany({
      where: { tenantId, isActive: true },
      include: {
        items: {
          include: { component: true },
          orderBy: { order: "asc" }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  async createTemplate(
    tenantId: string,
    input: CreateCompensationTemplateDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const existing = await this.prisma.compensationTemplate.findFirst({
      where: { tenantId, code: input.code }
    });
    if (existing) {
      throw new ConflictException(`Compensation template code ${input.code} already exists.`);
    }

    const template = await this.prisma.compensationTemplate.create({
      data: {
        tenantId,
        name: input.name,
        code: input.code,
        description: input.description,
        jobRole: input.jobRole,
        currency: input.currency,
        isActive: input.isActive,
        items: {
          create: input.items.map((item, idx) => ({
            tenantId,
            componentId: item.componentId,
            calculationType: item.calculationType,
            calculationValue: item.calculationValue,
            monthlyAmount: item.monthlyAmount,
            annualAmount: item.annualAmount,
            order: item.order ?? idx
          }))
        }
      },
      include: {
        items: {
          include: { component: true },
          orderBy: { order: "asc" }
        }
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compensation.template.created",
      resourceType: "compensation_template",
      resourceId: template.id,
      after: input
    });

    return template;
  }

  async updateTemplate(
    tenantId: string,
    id: string,
    input: UpdateCompensationTemplateDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const template = await this.prisma.compensationTemplate.findFirst({
      where: { id, tenantId },
      include: { items: true }
    });
    if (!template) {
      throw new NotFoundException("Compensation template not found.");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (input.items) {
        await tx.compensationTemplateItem.deleteMany({ where: { templateId: id } });
        await tx.compensationTemplateItem.createMany({
          data: input.items.map((item, idx) => ({
            tenantId,
            templateId: id,
            componentId: item.componentId,
            calculationType: item.calculationType,
            calculationValue: item.calculationValue,
            monthlyAmount: item.monthlyAmount,
            annualAmount: item.annualAmount,
            order: item.order ?? idx
          }))
        });
      }

      return tx.compensationTemplate.update({
        where: { id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.jobRole !== undefined ? { jobRole: input.jobRole } : {}),
          ...(input.currency ? { currency: input.currency } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
        },
        include: {
          items: {
            include: { component: true },
            orderBy: { order: "asc" }
          }
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compensation.template.updated",
      resourceType: "compensation_template",
      resourceId: id,
      before: template,
      after: input
    });

    return updated;
  }

  // ----------------- Breakdown Calculation Preview -----------------

  async calculatePreview(tenantId: string, input: CalculateBreakdownDto) {
    let components: ComponentCalculationInput[] = [];

    if (input.templateId) {
      const template = await this.prisma.compensationTemplate.findFirst({
        where: { id: input.templateId, tenantId },
        include: {
          items: {
            include: { component: true },
            orderBy: { order: "asc" }
          }
        }
      });

      if (template && template.items.length > 0) {
        components = template.items.map((item) => ({
          componentId: item.componentId,
          name: item.component.name,
          code: item.component.code,
          type: item.component.type,
          category: item.component.category,
          calculationType: item.calculationType,
          calculationValue: item.calculationValue,
          monthlyAmount: item.monthlyAmount
        }));
      }
    }

    if (components.length === 0) {
      throw new BadRequestException("Salary components must be configured before compensation preview.");
    }

    return CompensationEngine.calculateBreakdown(input.monthlyCtc, components);
  }

  // ----------------- Employee Compensation Assignment -----------------

  async assignCompensation(
    tenantId: string,
    employeeId: string,
    input: AssignEmployeeCompensationDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException("Employee not found.");
    }

    if (input.employeeId !== employeeId) {
      throw new BadRequestException("Compensation employeeId must match the route employee.");
    }

    if (input.templateId) {
      await this.assertTemplateInTenant(tenantId, input.templateId, input.currency);
    }

    if (input.items && input.items.length > 0) {
      await this.assertComponentsInTenant(
        tenantId,
        input.items.map((item) => item.componentId)
      );
    }

    const effectiveFromDate = new Date(input.effectiveFrom);
    const annualCtc = input.annualCtc ?? Math.round(input.monthlyCtc * 12 * 100) / 100;

    // Calculate components if not explicitly provided
    let itemsToCreate: Array<{ componentId: string; monthlyAmount: number; annualAmount: number }> = [];

    if (input.items && input.items.length > 0) {
      itemsToCreate = input.items;
    } else {
      const preview = await this.calculatePreview(tenantId, {
        monthlyCtc: input.monthlyCtc,
        templateId: input.templateId
      });
      itemsToCreate = preview.items.map((it) => ({
        componentId: it.componentId,
        monthlyAmount: it.monthlyAmount,
        annualAmount: it.annualAmount
      }));
    }

    const created = await this.prisma.$transaction(async (tx) => {
      // Find and deactivate any currently active compensation
      const activeExisting = await tx.employeeCompensation.findFirst({
        where: {
          tenantId,
          employeeId,
          status: CompensationStatus.ACTIVE
        },
        include: { items: { include: { component: true } } }
      });

      if (activeExisting) {
        // Set previous active compensation to REVISED with effectiveTo
        await tx.employeeCompensation.update({
          where: { id: activeExisting.id },
          data: {
            status: CompensationStatus.REVISED,
            effectiveTo: effectiveFromDate
          }
        });

        // Record immutable history snapshot
        await tx.employeeCompensationHistory.create({
          data: {
            tenantId,
            employeeId,
            compensationId: activeExisting.id,
            previousMonthlyCtc: activeExisting.monthlyCtc,
            previousAnnualCtc: activeExisting.annualCtc,
            newMonthlyCtc: input.monthlyCtc,
            newAnnualCtc: annualCtc,
            reason: input.reason,
            notes: input.notes,
            revisionDate: new Date(),
            effectiveFrom: effectiveFromDate,
            effectiveTo: null,
            approvedByUserId: actorUserId,
            breakdownSnapshot: {
              currency: input.currency,
              previousMonthlyCtc: activeExisting.monthlyCtc,
              previousAnnualCtc: activeExisting.annualCtc,
              newMonthlyCtc: input.monthlyCtc,
              newAnnualCtc: annualCtc,
              items: itemsToCreate
            }
          }
        });
      }

      // Create new active compensation record
      const comp = await tx.employeeCompensation.create({
        data: {
          tenantId,
          employeeId,
          templateId: input.templateId,
          effectiveFrom: effectiveFromDate,
          effectiveTo: null,
          monthlyCtc: input.monthlyCtc,
          annualCtc,
          currency: input.currency,
          status: CompensationStatus.ACTIVE,
          reason: input.reason,
          notes: input.notes,
          approvedByUserId: actorUserId,
          approvedAt: new Date(),
          items: {
            create: itemsToCreate.map((item) => ({
              tenantId,
              componentId: item.componentId,
              monthlyAmount: item.monthlyAmount,
              annualAmount: item.annualAmount
            }))
          }
        },
        include: {
          items: {
            include: { component: true }
          },
          template: true
        }
      });

      return comp;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compensation.assigned",
      resourceType: "employee_compensation",
      resourceId: created.id,
      after: {
        employeeId,
        monthlyCtc: input.monthlyCtc,
        annualCtc,
        reason: input.reason
      }
    });

    return created;
  }

  // ----------------- Salary Revision -----------------

  async reviseCompensation(
    tenantId: string,
    employeeId: string,
    input: ReviseEmployeeCompensationDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException("Employee not found.");
    }

    const currentActive = await this.prisma.employeeCompensation.findFirst({
      where: {
        tenantId,
        employeeId,
        status: CompensationStatus.ACTIVE
      },
      include: { items: { include: { component: true } } }
    });

    if (!currentActive) {
      throw new BadRequestException("No active compensation found to revise. Please assign initial salary first.");
    }

    const effectiveFromDate = new Date(input.effectiveFrom);
    const newAnnualCtc = input.newAnnualCtc ?? Math.round(input.newMonthlyCtc * 12 * 100) / 100;

    if (input.templateId) {
      await this.assertTemplateInTenant(tenantId, input.templateId, currentActive.currency);
    }

    if (input.items && input.items.length > 0) {
      await this.assertComponentsInTenant(
        tenantId,
        input.items.map((item) => item.componentId)
      );
    }

    let itemsToCreate: Array<{ componentId: string; monthlyAmount: number; annualAmount: number }> = [];

    if (input.items && input.items.length > 0) {
      itemsToCreate = input.items;
    } else {
      const preview = await this.calculatePreview(tenantId, {
        monthlyCtc: input.newMonthlyCtc,
        templateId: input.templateId ?? currentActive.templateId ?? undefined
      });
      itemsToCreate = preview.items.map((it) => ({
        componentId: it.componentId,
        monthlyAmount: it.monthlyAmount,
        annualAmount: it.annualAmount
      }));
    }

    const revised = await this.prisma.$transaction(async (tx) => {
      // Mark old as REVISED
      await tx.employeeCompensation.update({
        where: { id: currentActive.id },
        data: {
          status: CompensationStatus.REVISED,
          effectiveTo: effectiveFromDate
        }
      });

      // Write immutable history record
      await tx.employeeCompensationHistory.create({
        data: {
          tenantId,
          employeeId,
          compensationId: currentActive.id,
          previousMonthlyCtc: currentActive.monthlyCtc,
          previousAnnualCtc: currentActive.annualCtc,
          newMonthlyCtc: input.newMonthlyCtc,
          newAnnualCtc,
          reason: input.reason,
          notes: input.notes,
          revisionDate: new Date(),
          effectiveFrom: effectiveFromDate,
          effectiveTo: null,
          approvedByUserId: actorUserId,
            breakdownSnapshot: {
              currency: currentActive.currency,
              previousMonthlyCtc: currentActive.monthlyCtc,
              previousAnnualCtc: currentActive.annualCtc,
            newMonthlyCtc: input.newMonthlyCtc,
            newAnnualCtc,
            items: itemsToCreate
          }
        }
      });

      // Create new active compensation record
      return tx.employeeCompensation.create({
        data: {
          tenantId,
          employeeId,
          templateId: input.templateId ?? currentActive.templateId,
          effectiveFrom: effectiveFromDate,
          effectiveTo: null,
          monthlyCtc: input.newMonthlyCtc,
          annualCtc: newAnnualCtc,
          currency: currentActive.currency,
          status: CompensationStatus.ACTIVE,
          reason: input.reason,
          notes: input.notes,
          approvedByUserId: actorUserId,
          approvedAt: new Date(),
          items: {
            create: itemsToCreate.map((item) => ({
              tenantId,
              componentId: item.componentId,
              monthlyAmount: item.monthlyAmount,
              annualAmount: item.annualAmount
            }))
          }
        },
        include: {
          items: { include: { component: true } },
          template: true
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "compensation.revised",
      resourceType: "employee_compensation",
      resourceId: revised.id,
      before: {
        monthlyCtc: currentActive.monthlyCtc,
        annualCtc: currentActive.annualCtc
      },
      after: {
        monthlyCtc: input.newMonthlyCtc,
        annualCtc: newAnnualCtc,
        reason: input.reason,
        notes: input.notes
      }
    });

    return revised;
  }

  // ----------------- Queries & History -----------------

  async getEmployeeCompensation(tenantId: string, employeeId: string) {
    const compensation = await this.prisma.employeeCompensation.findFirst({
      where: {
        tenantId,
        employeeId,
        status: CompensationStatus.ACTIVE
      },
      include: {
        items: {
          include: { component: true }
        },
        template: {
          include: {
            items: {
              include: { component: true },
              orderBy: { order: "asc" }
            }
          }
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            joiningDate: true,
            department: { select: { name: true } },
            designation: { select: { name: true } }
          }
        }
      }
    });

    return compensation;
  }

  async getEmployeeHistory(tenantId: string, employeeId: string) {
    const history = await this.prisma.employeeCompensationHistory.findMany({
      where: { tenantId, employeeId },
      include: {
        compensation: { select: { currency: true } },
        approvedBy: { select: { id: true, email: true } },
        employee: { select: { id: true, employeeCode: true, fullName: true } }
      },
      orderBy: { revisionDate: "desc" }
    });

    return history.map(({ compensation, ...item }) => ({
      ...item,
      currency: compensation?.currency ?? null
    }));
  }

  async listAllCompensations(tenantId: string, filters: CompensationFilterDto) {
    const where: Prisma.EmployeeCompensationWhereInput = {
      tenantId,
      ...(filters.status ? { status: filters.status } : { status: CompensationStatus.ACTIVE }),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.departmentId
        ? { employee: { departmentId: filters.departmentId } }
        : {}),
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

    const [compensations, total] = await Promise.all([
      this.prisma.employeeCompensation.findMany({
        where,
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
          template: true,
          items: {
            include: { component: true }
          }
        },
        orderBy: { updatedAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.employeeCompensation.count({ where })
    ]);

    return { compensations, total, page: filters.page, limit: filters.limit };
  }

  async getAuditLogs(tenantId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        action: {
          in: [
            "compensation.component.created",
            "compensation.component.updated",
            "compensation.template.created",
            "compensation.template.updated",
            "compensation.assigned",
            "compensation.revised",
            "compensation.deactivated"
          ]
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  private async assertTemplateInTenant(tenantId: string, templateId: string, expectedCurrency: string) {
    const template = await this.prisma.compensationTemplate.findFirst({
      where: { id: templateId, tenantId },
      select: { currency: true }
    });

    if (!template) {
      throw new NotFoundException("Compensation template not found.");
    }

    if (template.currency !== expectedCurrency) {
      throw new BadRequestException("Compensation template currency must match employee compensation currency.");
    }
  }

  private async assertComponentsInTenant(tenantId: string, componentIds: string[]) {
    const uniqueComponentIds = [...new Set(componentIds)];
    const ownedComponents = await this.prisma.salaryComponent.count({
      where: { tenantId, id: { in: uniqueComponentIds } }
    });

    if (ownedComponents !== uniqueComponentIds.length) {
      throw new BadRequestException("All compensation components must belong to the current tenant.");
    }
  }
}
