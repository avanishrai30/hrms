/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  advanceWorkflowStepSchema,
  createWorkflowDefinitionSchema,
  delegateWorkflowStepSchema,
  escalateWorkflowSchema,
  startWorkflowSchema,
  workflowQuerySchema
} from "../src/modules/workflows/workflow.schemas.js";
import { WorkflowService } from "../src/modules/workflows/workflow.service.js";

describe("Workflow Engine (Sprint 4)", () => {
  const tenantId = "11111111-1111-4111-8111-111111111111";
  const userId = "22222222-2222-4222-8222-222222222222";
  const otherUserId = "33333333-3333-4333-8333-333333333333";

  let workflowService: WorkflowService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    mockPrisma = {
      workflowDefinition: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      workflowInstance: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      workflowStepExecution: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      workflowAudit: {
        findMany: vi.fn(),
        create: vi.fn()
      },
      $transaction: vi.fn().mockImplementation(async (cb: any) => cb(mockPrisma))
    };

    workflowService = new WorkflowService(mockPrisma, mockAudit);
  });

  describe("Zod Validation Schemas", () => {
    it("validates valid workflow definition schema", () => {
      const validDef = {
        code: "LEAVE_APPROVAL",
        name: "Leave Approval Workflow",
        description: "Multi-level leave approval process",
        entityType: "LEAVE_REQUEST",
        steps: [
          {
            code: "MANAGER_REVIEW",
            name: "Manager Review",
            assigneeRole: "MANAGER",
            slaHours: 24,
            requireComment: false
          },
          {
            code: "HR_REVIEW",
            name: "HR Review",
            assigneeRole: "HR_ADMIN",
            slaHours: 48,
            requireComment: true
          }
        ],
        transitions: [
          {
            fromStep: "MANAGER_REVIEW",
            action: "APPROVED",
            toStep: "HR_REVIEW"
          },
          {
            fromStep: "MANAGER_REVIEW",
            action: "REJECTED",
            toStep: "REJECTED"
          },
          {
            fromStep: "HR_REVIEW",
            action: "APPROVED",
            toStep: "COMPLETED"
          }
        ],
        escalationRules: [
          {
            stepCode: "MANAGER_REVIEW",
            afterHours: 24,
            escalateToRole: "HR_ADMIN"
          }
        ],
        isActive: true,
        version: 1
      };

      const parsed = createWorkflowDefinitionSchema.parse(validDef);
      expect(parsed.code).toBe("LEAVE_APPROVAL");
      expect(parsed.steps).toHaveLength(2);
      expect(parsed.transitions).toHaveLength(3);
      expect(parsed.escalationRules).toHaveLength(1);
    });

    it("rejects invalid workflow definition with empty steps", () => {
      const invalidDef = {
        code: "NO_STEPS",
        name: "Empty Workflow",
        entityType: "DOC",
        steps: []
      };

      expect(() => createWorkflowDefinitionSchema.parse(invalidDef)).toThrow();
    });

    it("validates start workflow schema", () => {
      const parsed = startWorkflowSchema.parse({
        definitionCode: "LEAVE_APPROVAL",
        entityType: "LEAVE_REQUEST",
        entityId: "leave-123",
        data: { days: 3, type: "CASUAL" }
      });
      expect(parsed.definitionCode).toBe("LEAVE_APPROVAL");
      expect(parsed.entityType).toBe("LEAVE_REQUEST");
    });

    it("validates advance step schema", () => {
      const parsed = advanceWorkflowStepSchema.parse({
        action: "APPROVED",
        comment: "Looks good to me",
        data: { score: 95 }
      });
      expect(parsed.action).toBe("APPROVED");
      expect(parsed.comment).toBe("Looks good to me");
    });

    it("validates delegate step schema", () => {
      const parsed = delegateWorkflowStepSchema.parse({
        delegatedToUserId: otherUserId,
        comment: "Out of office"
      });
      expect(parsed.delegatedToUserId).toBe(otherUserId);
      expect(parsed.comment).toBe("Out of office");
    });

    it("validates escalate workflow schema", () => {
      const parsed = escalateWorkflowSchema.parse({
        reason: "SLA breached by 24 hours"
      });
      expect(parsed.reason).toBe("SLA breached by 24 hours");
    });

    it("validates workflow query schema with defaults", () => {
      const parsed = workflowQuerySchema.parse({});
      expect(parsed.limit).toBe(50);
      expect(parsed.offset).toBe(0);
    });
  });

  describe("Workflow Definition Management", () => {
    it("creates a workflow definition with audit logging", () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValue(null);
      const createdDef = {
        id: "def-1",
        tenantId,
        code: "WF_EXPENSE",
        name: "Expense Approval",
        entityType: "EXPENSE",
        steps: [{ code: "MGR", name: "Manager" }],
        transitions: [],
        escalationRules: [],
        isActive: true,
        version: 1
      };
      mockPrisma.workflowDefinition.create.mockResolvedValue(createdDef);

      return workflowService
        .createDefinition(
          tenantId,
          {
            code: "WF_EXPENSE",
            name: "Expense Approval",
            entityType: "EXPENSE",
            steps: [{ code: "MGR", name: "Manager" }]
          } as any,
          userId
        )
        .then((result) => {
          expect(result.id).toBe("def-1");
          expect(mockAudit.record).toHaveBeenCalledWith(
            expect.objectContaining({
              tenantId,
              actorUserId: userId,
              action: "workflow_definition.created",
              resourceType: "workflow_definition"
            })
          );
        });
    });

    it("prevents duplicate definition code and version", async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValue({ id: "existing" });

      await expect(
        workflowService.createDefinition(
          tenantId,
          {
            code: "DUPLICATE",
            name: "Duplicate",
            entityType: "TEST",
            steps: [{ code: "S1", name: "Step 1" }],
            version: 1
          } as any,
          userId
        )
      ).rejects.toThrow("already exists");
    });

    it("lists workflow definitions with tenant filtering", async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValue([
        { id: "def-1", code: "WF1" },
        { id: "def-2", code: "WF2" }
      ]);

      const result = await workflowService.listDefinitions(tenantId, "LEAVE");
      expect(result).toHaveLength(2);
      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith({
        where: { tenantId, entityType: "LEAVE" },
        orderBy: [{ code: "asc" }, { version: "desc" }]
      });
    });
  });

  describe("Workflow Lifecycle & State Machine Execution", () => {
    const mockDefinition = {
      id: "def-1",
      tenantId,
      code: "ONBOARDING",
      name: "Employee Onboarding",
      entityType: "EMPLOYEE",
      steps: [
        { code: "SUBMIT_DOCS", name: "Submit Documents", assigneeRole: "EMPLOYEE", slaHours: 24 },
        { code: "VERIFY_DOCS", name: "Verify Documents", assigneeRole: "HR_ADMIN", slaHours: 48, requireComment: true },
        { code: "IT_PROVISION", name: "IT Provisioning", assigneeRole: "IT_ADMIN", slaHours: 12 }
      ],
      transitions: [
        { fromStep: "SUBMIT_DOCS", action: "APPROVED", toStep: "VERIFY_DOCS" },
        { fromStep: "VERIFY_DOCS", action: "APPROVED", toStep: "IT_PROVISION" },
        { fromStep: "VERIFY_DOCS", action: "REJECTED", toStep: "REJECTED" },
        { fromStep: "IT_PROVISION", action: "APPROVED", toStep: "COMPLETED" }
      ],
      escalationRules: [
        { stepCode: "VERIFY_DOCS", afterHours: 48, escalateToRole: "HR_HEAD" }
      ],
      isActive: true,
      version: 1
    };

    it("starts a workflow and creates initial step execution with SLA", async () => {
      mockPrisma.workflowDefinition.findFirst.mockResolvedValue(mockDefinition);
      const createdInstance = {
        id: "inst-1",
        tenantId,
        workflowDefinitionId: "def-1",
        entityType: "EMPLOYEE",
        entityId: "emp-101",
        currentStep: "SUBMIT_DOCS",
        status: "IN_PROGRESS",
        initiatedById: userId,
        data: {}
      };
      mockPrisma.workflowInstance.create.mockResolvedValue(createdInstance);
      mockPrisma.workflowStepExecution.create.mockResolvedValue({ id: "step-exec-1" });
      mockPrisma.workflowAudit.create.mockResolvedValue({ id: "w-audit-1" });

      mockPrisma.workflowInstance.findFirst.mockResolvedValue({
        ...createdInstance,
        workflowDefinition: mockDefinition,
        stepExecutions: [{ id: "step-exec-1", stepCode: "SUBMIT_DOCS", action: "PENDING" }],
        auditEntries: [],
        initiatedBy: { id: userId, email: "user@example.com" }
      });

      const instance = await workflowService.startWorkflow(
        tenantId,
        "ONBOARDING",
        "EMPLOYEE",
        "emp-101",
        userId,
        { department: "Engineering" }
      );

      expect(instance.id).toBe("inst-1");
      expect(mockPrisma.workflowStepExecution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stepCode: "SUBMIT_DOCS",
            action: "PENDING",
            tenantId
          })
        })
      );
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "workflow_instance.started",
          tenantId
        })
      );
    });

    it("advances workflow to next step following transitions", async () => {
      const currentInstance = {
        id: "inst-1",
        tenantId,
        workflowDefinition: mockDefinition,
        currentStep: "SUBMIT_DOCS",
        status: "IN_PROGRESS",
        data: {},
        stepExecutions: [{ id: "step-exec-1", stepCode: "SUBMIT_DOCS", action: "PENDING" }]
      };

      mockPrisma.workflowInstance.findFirst
        .mockResolvedValueOnce(currentInstance)
        .mockResolvedValueOnce({
          ...currentInstance,
          currentStep: "VERIFY_DOCS",
          status: "IN_PROGRESS"
        });

      await workflowService.advanceStep(
        tenantId,
        "inst-1",
        "APPROVED",
        userId,
        "Documents uploaded"
      );

      expect(mockPrisma.workflowStepExecution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "step-exec-1" },
          data: expect.objectContaining({
            action: "APPROVED",
            comment: "Documents uploaded"
          })
        })
      );

      expect(mockPrisma.workflowStepExecution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stepCode: "VERIFY_DOCS",
            action: "PENDING"
          })
        })
      );

      expect(mockPrisma.workflowInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "inst-1" },
          data: expect.objectContaining({
            currentStep: "VERIFY_DOCS",
            status: "IN_PROGRESS"
          })
        })
      );
    });

    it("completes workflow on final step approval", async () => {
      const currentInstance = {
        id: "inst-1",
        tenantId,
        workflowDefinition: mockDefinition,
        currentStep: "IT_PROVISION",
        status: "IN_PROGRESS",
        data: {},
        stepExecutions: [{ id: "step-exec-3", stepCode: "IT_PROVISION", action: "PENDING" }]
      };

      mockPrisma.workflowInstance.findFirst
        .mockResolvedValueOnce(currentInstance)
        .mockResolvedValueOnce({
          ...currentInstance,
          currentStep: null,
          status: "COMPLETED"
        });

      await workflowService.advanceStep(
        tenantId,
        "inst-1",
        "APPROVED",
        userId,
        "Laptop provisioned"
      );

      expect(mockPrisma.workflowInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "inst-1" },
          data: expect.objectContaining({
            currentStep: null,
            status: "COMPLETED"
          })
        })
      );
    });

    it("terminates workflow when rejected", async () => {
      const currentInstance = {
        id: "inst-1",
        tenantId,
        workflowDefinition: mockDefinition,
        currentStep: "VERIFY_DOCS",
        status: "IN_PROGRESS",
        data: {},
        stepExecutions: [{ id: "step-exec-2", stepCode: "VERIFY_DOCS", action: "PENDING" }]
      };

      mockPrisma.workflowInstance.findFirst
        .mockResolvedValueOnce(currentInstance)
        .mockResolvedValueOnce({
          ...currentInstance,
          currentStep: null,
          status: "REJECTED"
        });

      await workflowService.advanceStep(
        tenantId,
        "inst-1",
        "REJECTED",
        userId,
        "Invalid ID proof"
      );

      expect(mockPrisma.workflowInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "inst-1" },
          data: expect.objectContaining({
            currentStep: null,
            status: "REJECTED"
          })
        })
      );
    });

    it("enforces requireComment when configured on step", async () => {
      const currentInstance = {
        id: "inst-1",
        tenantId,
        workflowDefinition: mockDefinition,
        currentStep: "VERIFY_DOCS",
        status: "IN_PROGRESS",
        data: {},
        stepExecutions: [{ id: "step-exec-2", stepCode: "VERIFY_DOCS", action: "PENDING" }]
      };

      mockPrisma.workflowInstance.findFirst.mockResolvedValue(currentInstance);

      await expect(
        workflowService.advanceStep(
          tenantId,
          "inst-1",
          "APPROVED",
          userId,
          ""
        )
      ).rejects.toThrow("A comment is required");
    });
  });

  describe("Delegation & Escalation", () => {
    it("delegates pending step to another user", async () => {
      const currentInstance = {
        id: "inst-1",
        tenantId,
        status: "IN_PROGRESS",
        currentStep: "STEP_1",
        stepExecutions: [{ id: "step-1", stepCode: "STEP_1", stepName: "Step 1", action: "PENDING", slaDeadline: null }]
      };

      mockPrisma.workflowInstance.findFirst
        .mockResolvedValueOnce(currentInstance)
        .mockResolvedValueOnce(currentInstance);

      await workflowService.delegateStep(
        tenantId,
        "inst-1",
        "step-1",
        otherUserId,
        userId,
        "Please cover for me"
      );

      expect(mockPrisma.workflowStepExecution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "step-1" },
          data: expect.objectContaining({
            action: "DELEGATED"
          })
        })
      );

      expect(mockPrisma.workflowStepExecution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assigneeUserId: otherUserId,
            action: "PENDING"
          })
        })
      );
    });

    it("escalates workflow when SLA breached or triggered manually", async () => {
      const currentInstance = {
        id: "inst-1",
        tenantId,
        status: "IN_PROGRESS",
        currentStep: "VERIFY_DOCS",
        workflowDefinition: {
          escalationRules: [
            { stepCode: "VERIFY_DOCS", afterHours: 48, escalateToRole: "HR_HEAD" }
          ]
        },
        stepExecutions: [{ id: "step-2", stepCode: "VERIFY_DOCS", action: "PENDING", assigneeRole: "HR_ADMIN" }]
      };

      mockPrisma.workflowInstance.findFirst
        .mockResolvedValueOnce(currentInstance)
        .mockResolvedValueOnce(currentInstance);

      await workflowService.escalateWorkflow(
        tenantId,
        "inst-1",
        userId,
        "Pending for too long"
      );

      expect(mockPrisma.workflowStepExecution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "step-2" },
          data: expect.objectContaining({
            isEscalated: true,
            assigneeRole: "HR_HEAD"
          })
        })
      );

      expect(mockPrisma.workflowInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "inst-1" },
          data: expect.objectContaining({
            status: "ESCALATED"
          })
        })
      );
    });
  });

  describe("Controller Security & RBAC Decorators", () => {
    const controllerCode = readFileSync(
      new URL("../src/modules/workflows/workflow.controller.ts", import.meta.url),
      "utf8"
    );

    it("enforces workflows.view on read endpoints", () => {
      expect(controllerCode).toContain('@RequirePermissions("workflows.view")\n  async listDefinitions');
      expect(controllerCode).toContain('@RequirePermissions("workflows.view")\n  async getDefinition');
      expect(controllerCode).toContain('@RequirePermissions("workflows.view")\n  async listInstances');
      expect(controllerCode).toContain('@RequirePermissions("workflows.view")\n  async getMyPendingWorkflows');
      expect(controllerCode).toContain('@RequirePermissions("workflows.view")\n  async getInstance');
    });

    it("enforces workflows.manage on definition creation and escalation", () => {
      expect(controllerCode).toContain('@RequirePermissions("workflows.manage")\n  async createDefinition');
      expect(controllerCode).toContain('@RequirePermissions("workflows.manage")\n  async escalateWorkflow');
    });

    it("enforces workflows.create on workflow initialization", () => {
      expect(controllerCode).toContain('@RequirePermissions("workflows.create")\n  async startWorkflow');
    });

    it("enforces workflows.action on step advancement and delegation", () => {
      expect(controllerCode).toContain('@RequirePermissions("workflows.action")\n  async advanceStep');
      expect(controllerCode).toContain('@RequirePermissions("workflows.action")\n  async delegateStep');
    });

    it("enforces workflows.audit on audit trail retrieval", () => {
      expect(controllerCode).toContain('@RequirePermissions("workflows.audit")\n  async getWorkflowAuditTrail');
    });
  });

  describe("Tenant Isolation Verification", () => {
    const serviceCode = readFileSync(
      new URL("../src/modules/workflows/workflow.service.ts", import.meta.url),
      "utf8"
    );

    it("strictly isolates workflow queries and mutations by tenantId", () => {
      expect(serviceCode).toContain("where: {\n        tenantId,");
      expect(serviceCode).toContain("where: { tenantId, id }");
      expect(serviceCode).toContain("where: { tenantId, id: instanceId }");
      expect(serviceCode).toContain("where: { tenantId, workflowInstanceId: instanceId }");
    });
  });
});
