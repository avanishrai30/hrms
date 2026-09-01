import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import {
  type ClearanceDepartment,
  type ClearanceStatus,
  Prisma
} from "@prisma/client";
import type {
  InitiateExitClearanceDto,
  CompleteClearanceTaskDto
} from "./clearance.schemas.js";

@Injectable()
export class ClearanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private async recordAudit(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    userId?: string,
    membershipId?: string
  ) {
    return this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action,
      resourceType,
      resourceId,
      metadata: (metadata ?? {}) as unknown as Prisma.InputJsonValue
    });
  }

  async listClearances(tenantId: string, status?: ClearanceStatus) {
    return this.prisma.exitClearance.findMany({
      where: {
        tenantId,
        ...(status && { status })
      },
      include: {
        employee: true,
        tasks: {
          include: { assignee: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getClearanceById(tenantId: string, id: string) {
    const clearance = await this.prisma.exitClearance.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          include: {
            assignedAssets: {
              where: { isReturned: false },
              include: { asset: true }
            },
            assignedLicenses: {
              where: { isActive: true },
              include: { license: true }
            }
          }
        },
        tasks: {
          include: { assignee: true },
          orderBy: { department: "asc" }
        }
      }
    });

    if (!clearance) {
      throw new NotFoundException(`Exit clearance with ID "${id}" not found`);
    }

    const totalTasks = clearance.tasks.length;
    const completedTasks = clearance.tasks.filter((t) => t.isCompleted).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...clearance,
      progressPercent,
      isFullyCompleted: completedTasks === totalTasks
    };
  }

  async initiateClearance(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: InitiateExitClearanceDto
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${dto.employeeId}" not found`);
    }

    const existing = await this.prisma.exitClearance.findFirst({
      where: { tenantId, employeeId: dto.employeeId }
    });
    if (existing && existing.status !== "REJECTED") {
      throw new BadRequestException(
        `Exit clearance is already active for employee ${employee.fullName}`
      );
    }

    // Define standard 5 department tasks
    const initialTasks: Array<{
      department: ClearanceDepartment;
      taskName: string;
      description: string;
    }> = [
      {
        department: "IT" as ClearanceDepartment,
        taskName: "IT Hardware Asset Return & Access Revocation",
        description: "Recover company laptops, monitors, access tokens, and revoke Google/Microsoft & VPN credentials."
      },
      {
        department: "ADMIN" as ClearanceDepartment,
        taskName: "ID Card & Physical Facility Access Return",
        description: "Collect employee ID badge, parking pass, pedestal/cabin keys, and visitor passes."
      },
      {
        department: "FINANCE" as ClearanceDepartment,
        taskName: "Pending Dues, Loans & Expense Settlement",
        description: "Verify pending travel reimbursements, company advances, loan balances, and gratuity calculations."
      },
      {
        department: "HR" as ClearanceDepartment,
        taskName: "Exit Interview & Documentation Verification",
        description: "Conduct exit survey, re-affirm Non-Disclosure Agreement (NDA), and verify FnF settlement terms."
      },
      {
        department: "REPORTING_MANAGER" as ClearanceDepartment,
        taskName: "Knowledge Transfer (KT) & Project Handover",
        description: "Signoff on project repository documentation, code handoffs, and client relationship transitions."
      }
    ];

    const clearance = await this.prisma.exitClearance.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        resignationDate: new Date(dto.resignationDate),
        lastWorkingDay: new Date(dto.lastWorkingDay),
        status: "INITIATED" as ClearanceStatus,
        notes: dto.notes,
        tasks: {
          create: initialTasks.map((t) => ({
            tenantId,
            department: t.department,
            taskName: t.taskName,
            description: t.description
          }))
        }
      },
      include: { tasks: true }
    });

    await this.recordAudit(
      tenantId,
      "CLEARANCE_INITIATED",
      "ExitClearance",
      clearance.id,
      { employeeId: dto.employeeId, employeeName: employee.fullName },
      actorContext.userId,
      actorContext.membershipId
    );

    return clearance;
  }

  async completeClearanceTask(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    taskId: string,
    dto: CompleteClearanceTaskDto
  ) {
    const task = await this.prisma.clearanceTask.findFirst({
      where: { id: taskId, tenantId },
      include: { clearance: true }
    });

    if (!task) {
      throw new NotFoundException(`Clearance task with ID "${taskId}" not found`);
    }

    if (task.isCompleted) {
      return task;
    }

    const updatedTask = await this.prisma.clearanceTask.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        remarks: dto.remarks,
        assetsRecovered: dto.assetsRecovered || [],
        duesAmount: dto.duesAmount || 0
      }
    });

    // Check if all tasks in clearance are complete
    const remainingIncomplete = await this.prisma.clearanceTask.count({
      where: {
        tenantId,
        clearanceId: task.clearanceId,
        isCompleted: false
      }
    });

    if (remainingIncomplete === 0) {
      await this.prisma.exitClearance.update({
        where: { id: task.clearanceId },
        data: {
          status: "CLEARANCE_COMPLETED" as ClearanceStatus,
          completedAt: new Date()
        }
      });

      // Update employee status to INACTIVE / NOTICE_PERIOD
      await this.prisma.employee.update({
        where: { id: task.clearance.employeeId },
        data: { status: "INACTIVE" }
      });
    } else {
      await this.prisma.exitClearance.update({
        where: { id: task.clearanceId },
        data: { status: "IN_PROGRESS" as ClearanceStatus }
      });
    }

    await this.recordAudit(
      tenantId,
      "CLEARANCE_TASK_COMPLETED",
      "ClearanceTask",
      taskId,
      { department: task.department, clearanceId: task.clearanceId, remainingTasks: remainingIncomplete },
      actorContext.userId,
      actorContext.membershipId
    );

    return updatedTask;
  }
}
