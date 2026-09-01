import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type WorkflowStatus, type WorkflowStepAction } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateWorkflowDefinitionInput,
  EscalationRule,
  StepDefinition,
  TransitionDefinition,
  WorkflowQueryInput
} from "./workflow.schemas.js";

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createDefinition(
    tenantId: string,
    input: CreateWorkflowDefinitionInput,
    actorId?: string
  ) {
    const existing = await this.prisma.workflowDefinition.findUnique({
      where: {
        tenantId_code_version: {
          tenantId,
          code: input.code,
          version: input.version ?? 1
        }
      }
    });

    if (existing) {
      throw new BadRequestException(
        `Workflow definition with code '${input.code}' and version ${input.version ?? 1} already exists.`
      );
    }

    const definition = await this.prisma.workflowDefinition.create({
      data: {
        tenantId,
        code: input.code,
        name: input.name,
        description: input.description,
        entityType: input.entityType,
        steps: input.steps as unknown as Prisma.InputJsonValue,
        transitions: (input.transitions ?? []) as unknown as Prisma.InputJsonValue,
        escalationRules: (input.escalationRules ?? []) as unknown as Prisma.InputJsonValue,
        isActive: input.isActive ?? true,
        version: input.version ?? 1
      }
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actorId,
      action: "workflow_definition.created",
      resourceType: "workflow_definition",
      resourceId: definition.id,
      after: definition as unknown as Prisma.InputJsonValue
    });

    return definition;
  }

  async listDefinitions(tenantId: string, entityType?: string) {
    return this.prisma.workflowDefinition.findMany({
      where: {
        tenantId,
        ...(entityType ? { entityType } : {})
      },
      orderBy: [{ code: "asc" }, { version: "desc" }]
    });
  }

  async getDefinition(tenantId: string, id: string) {
    const definition = await this.prisma.workflowDefinition.findFirst({
      where: { tenantId, id }
    });

    if (!definition) {
      throw new NotFoundException("Workflow definition not found.");
    }

    return definition;
  }

  async startWorkflow(
    tenantId: string,
    definitionCode: string,
    entityType: string,
    entityId: string,
    initiatorId: string,
    data?: Record<string, unknown>
  ) {
    const definition = await this.prisma.workflowDefinition.findFirst({
      where: { tenantId, code: definitionCode, isActive: true },
      orderBy: { version: "desc" }
    });

    if (!definition) {
      throw new NotFoundException(
        `Active workflow definition with code '${definitionCode}' not found.`
      );
    }

    const steps = (definition.steps as unknown as StepDefinition[]) ?? [];
    const firstStep = steps[0];
    if (!firstStep) {
      throw new BadRequestException("Workflow definition has no steps defined.");
    }

    const now = new Date();
    const slaDeadline = firstStep.slaHours
      ? new Date(now.getTime() + firstStep.slaHours * 3600 * 1000)
      : null;

    const instance = await this.prisma.$transaction(async (tx) => {
      const created = await tx.workflowInstance.create({
        data: {
          tenantId,
          workflowDefinitionId: definition.id,
          entityType,
          entityId,
          currentStep: firstStep.code,
          status: "IN_PROGRESS",
          initiatedById: initiatorId,
          data: (data ?? {}) as Prisma.InputJsonValue,
          startedAt: now,
          slaDeadline
        }
      });

      await tx.workflowStepExecution.create({
        data: {
          tenantId,
          workflowInstanceId: created.id,
          stepCode: firstStep.code,
          stepName: firstStep.name,
          assigneeUserId: firstStep.assigneeUserId ?? null,
          assigneeRole: firstStep.assigneeRole ?? null,
          action: "PENDING",
          slaDeadline
        }
      });

      await tx.workflowAudit.create({
        data: {
          tenantId,
          workflowInstanceId: created.id,
          action: "WORKFLOW_STARTED",
          actorUserId: initiatorId,
          fromStep: null,
          toStep: firstStep.code,
          comment: "Workflow instance started",
          metadata: { definitionCode, entityType, entityId } as unknown as Prisma.InputJsonValue
        }
      });

      return created;
    });

    await this.auditService.record({
      tenantId,
      actorUserId: initiatorId,
      action: "workflow_instance.started",
      resourceType: "workflow_instance",
      resourceId: instance.id,
      after: instance as unknown as Prisma.InputJsonValue
    });

    return this.getInstance(tenantId, instance.id);
  }

  async advanceStep(
    tenantId: string,
    instanceId: string,
    action: WorkflowStepAction,
    actorId: string,
    comment?: string,
    data?: Record<string, unknown>
  ) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { tenantId, id: instanceId },
      include: {
        workflowDefinition: true,
        stepExecutions: {
          where: { action: "PENDING" },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!instance) {
      throw new NotFoundException("Workflow instance not found.");
    }

    if (
      instance.status === "COMPLETED" ||
      instance.status === "REJECTED" ||
      instance.status === "CANCELLED"
    ) {
      throw new BadRequestException(
        `Workflow instance is already ${instance.status.toLowerCase()}.`
      );
    }

    const steps = (instance.workflowDefinition.steps as unknown as StepDefinition[]) ?? [];
    const transitions =
      (instance.workflowDefinition.transitions as unknown as TransitionDefinition[]) ?? [];
    const currentStepDef = steps.find((s) => s.code === instance.currentStep);

    if (currentStepDef?.requireComment && (!comment || comment.trim().length === 0)) {
      throw new BadRequestException("A comment is required to advance this step.");
    }

    const pendingExecution = instance.stepExecutions[0];

    // Determine next step and workflow status
    let nextStepCode: string | null = null;
    let nextStatus: WorkflowStatus = "IN_PROGRESS";

    const matchingTransition = transitions.find(
      (t) => t.fromStep === instance.currentStep && t.action === action
    );

    if (matchingTransition) {
      if (
        matchingTransition.toStep === "END" ||
        matchingTransition.toStep === "COMPLETED"
      ) {
        nextStepCode = null;
        nextStatus = action === "REJECTED" ? "REJECTED" : "COMPLETED";
      } else if (matchingTransition.toStep === "REJECTED") {
        nextStepCode = null;
        nextStatus = "REJECTED";
      } else {
        nextStepCode = matchingTransition.toStep;
        nextStatus = "IN_PROGRESS";
      }
    } else {
      // Default sequential transition logic
      if (action === "REJECTED") {
        nextStepCode = null;
        nextStatus = "REJECTED";
      } else if (action === "APPROVED" || action === "SKIPPED") {
        const currentIndex = steps.findIndex((s) => s.code === instance.currentStep);
        const nextStep = currentIndex >= 0 ? steps[currentIndex + 1] : undefined;
        if (nextStep) {
          nextStepCode = nextStep.code;
          nextStatus = "IN_PROGRESS";
        } else {
          nextStepCode = null;
          nextStatus = "COMPLETED";
        }
      } else if (action === "ESCALATED") {
        nextStepCode = instance.currentStep;
        nextStatus = "ESCALATED";
      } else {
        nextStepCode = instance.currentStep;
        nextStatus = instance.status;
      }
    }

    const nextStepDef = nextStepCode ? steps.find((s) => s.code === nextStepCode) : null;
    const now = new Date();
    const nextSlaDeadline = nextStepDef?.slaHours
      ? new Date(now.getTime() + nextStepDef.slaHours * 3600 * 1000)
      : null;

    await this.prisma.$transaction(async (tx) => {
      if (pendingExecution) {
        await tx.workflowStepExecution.update({
          where: { id: pendingExecution.id },
          data: {
            action,
            comment: comment ?? null,
            actionedAt: now,
            actionedById: actorId
          }
        });
      }

      if (nextStepDef && nextStatus === "IN_PROGRESS") {
        await tx.workflowStepExecution.create({
          data: {
            tenantId,
            workflowInstanceId: instance.id,
            stepCode: nextStepDef.code,
            stepName: nextStepDef.name,
            assigneeUserId: nextStepDef.assigneeUserId ?? null,
            assigneeRole: nextStepDef.assigneeRole ?? null,
            action: "PENDING",
            slaDeadline: nextSlaDeadline
          }
        });
      }

      await tx.workflowInstance.update({
        where: { id: instance.id },
        data: {
          currentStep: nextStepCode,
          status: nextStatus,
          completedAt:
            nextStatus === "COMPLETED" || nextStatus === "REJECTED" ? now : null,
          slaDeadline: nextSlaDeadline,
          data: data
            ? ({
                ...((instance.data as Record<string, unknown>) ?? {}),
                ...data
              } as Prisma.InputJsonValue)
            : (instance.data as Prisma.InputJsonValue)
        }
      });

      await tx.workflowAudit.create({
        data: {
          tenantId,
          workflowInstanceId: instance.id,
          action: `STEP_${action}`,
          actorUserId: actorId,
          fromStep: instance.currentStep,
          toStep: nextStepCode,
          comment: comment ?? null,
          metadata: { action, ...(data ?? {}) } as unknown as Prisma.InputJsonValue
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actorId,
      action: `workflow.step_${action.toLowerCase()}`,
      resourceType: "workflow_instance",
      resourceId: instance.id,
      after: {
        instanceId: instance.id,
        action,
        status: nextStatus,
        currentStep: nextStepCode
      } as unknown as Prisma.InputJsonValue
    });

    return this.getInstance(tenantId, instance.id);
  }

  async delegateStep(
    tenantId: string,
    instanceId: string,
    stepId: string | undefined,
    delegatedToUserId: string,
    actorId: string,
    comment?: string
  ) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { tenantId, id: instanceId },
      include: {
        stepExecutions: {
          where: stepId ? { id: stepId } : { action: "PENDING" },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!instance) {
      throw new NotFoundException("Workflow instance not found.");
    }

    if (instance.status !== "IN_PROGRESS" && instance.status !== "PENDING") {
      throw new BadRequestException(
        `Cannot delegate step for a workflow that is ${instance.status.toLowerCase()}.`
      );
    }

    const currentExecution = instance.stepExecutions[0];
    if (!currentExecution) {
      throw new NotFoundException("Pending step execution not found for delegation.");
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.workflowStepExecution.update({
        where: { id: currentExecution.id },
        data: {
          action: "DELEGATED",
          comment: comment ?? `Delegated to user ${delegatedToUserId}`,
          actionedAt: now,
          actionedById: actorId
        }
      });

      await tx.workflowStepExecution.create({
        data: {
          tenantId,
          workflowInstanceId: instance.id,
          stepCode: currentExecution.stepCode,
          stepName: currentExecution.stepName,
          assigneeUserId: delegatedToUserId,
          assigneeRole: null,
          action: "PENDING",
          slaDeadline: currentExecution.slaDeadline
        }
      });

      await tx.workflowAudit.create({
        data: {
          tenantId,
          workflowInstanceId: instance.id,
          action: "STEP_DELEGATED",
          actorUserId: actorId,
          fromStep: currentExecution.stepCode,
          toStep: currentExecution.stepCode,
          comment: comment ?? `Delegated to user ${delegatedToUserId}`,
          metadata: {
            delegatedToUserId,
            originalStepExecutionId: currentExecution.id
          } as unknown as Prisma.InputJsonValue
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actorId,
      action: "workflow.step_delegated",
      resourceType: "workflow_instance",
      resourceId: instance.id,
      after: {
        instanceId: instance.id,
        delegatedToUserId,
        stepCode: currentExecution.stepCode
      } as unknown as Prisma.InputJsonValue
    });

    return this.getInstance(tenantId, instance.id);
  }

  async escalateWorkflow(
    tenantId: string,
    instanceId: string,
    actorId: string,
    reason?: string
  ) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { tenantId, id: instanceId },
      include: {
        workflowDefinition: true,
        stepExecutions: {
          where: { action: "PENDING" },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!instance) {
      throw new NotFoundException("Workflow instance not found.");
    }

    if (
      instance.status === "COMPLETED" ||
      instance.status === "REJECTED" ||
      instance.status === "CANCELLED"
    ) {
      throw new BadRequestException("Cannot escalate a completed or terminated workflow.");
    }

    const rules =
      (instance.workflowDefinition.escalationRules as unknown as EscalationRule[]) ?? [];
    const rule = rules.find((r) => r.stepCode === instance.currentStep);
    const currentExecution = instance.stepExecutions[0];
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      if (currentExecution) {
        await tx.workflowStepExecution.update({
          where: { id: currentExecution.id },
          data: {
            isEscalated: true,
            assigneeRole: rule?.escalateToRole ?? currentExecution.assigneeRole,
            assigneeUserId: rule?.escalateToUserId ?? currentExecution.assigneeUserId
          }
        });
      }

      await tx.workflowInstance.update({
        where: { id: instance.id },
        data: {
          status: "ESCALATED",
          escalatedAt: now
        }
      });

      await tx.workflowAudit.create({
        data: {
          tenantId,
          workflowInstanceId: instance.id,
          action: "WORKFLOW_ESCALATED",
          actorUserId: actorId,
          fromStep: instance.currentStep,
          toStep: instance.currentStep,
          comment: reason ?? "Workflow escalated",
          metadata: { reason, rule } as unknown as Prisma.InputJsonValue
        }
      });
    });

    await this.auditService.record({
      tenantId,
      actorUserId: actorId,
      action: "workflow.escalated",
      resourceType: "workflow_instance",
      resourceId: instance.id,
      after: {
        instanceId: instance.id,
        reason,
        status: "ESCALATED"
      } as unknown as Prisma.InputJsonValue
    });

    return this.getInstance(tenantId, instance.id);
  }

  async listInstances(tenantId: string, query: WorkflowQueryInput) {
    const { entityType, entityId, status, limit, offset } = query;

    return this.prisma.workflowInstance.findMany({
      where: {
        tenantId,
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
        ...(status ? { status } : {})
      },
      include: {
        workflowDefinition: true,
        stepExecutions: {
          orderBy: { createdAt: "asc" }
        },
        initiatedBy: {
          select: { id: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
  }

  async getInstance(tenantId: string, id: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { tenantId, id },
      include: {
        workflowDefinition: true,
        stepExecutions: {
          orderBy: { createdAt: "asc" }
        },
        auditEntries: {
          orderBy: { createdAt: "asc" }
        },
        initiatedBy: {
          select: { id: true, email: true }
        }
      }
    });

    if (!instance) {
      throw new NotFoundException("Workflow instance not found.");
    }

    return instance;
  }

  async getMyPendingWorkflows(tenantId: string, userId: string, roles: string[]) {
    return this.prisma.workflowStepExecution.findMany({
      where: {
        tenantId,
        action: "PENDING",
        OR: [
          { assigneeUserId: userId },
          ...(roles.length > 0 ? [{ assigneeRole: { in: roles } }] : [])
        ],
        workflowInstance: {
          status: { in: ["PENDING", "IN_PROGRESS", "ESCALATED"] }
        }
      },
      include: {
        workflowInstance: {
          include: {
            workflowDefinition: true,
            initiatedBy: {
              select: { id: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getWorkflowAuditTrail(tenantId: string, instanceId: string) {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { tenantId, id: instanceId }
    });

    if (!instance) {
      throw new NotFoundException("Workflow instance not found.");
    }

    return this.prisma.workflowAudit.findMany({
      where: { tenantId, workflowInstanceId: instanceId },
      orderBy: { createdAt: "asc" }
    });
  }
}
