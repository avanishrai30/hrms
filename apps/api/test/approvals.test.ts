/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  approvalActionSchema,
  approvalQuerySchema,
  createApprovalTemplateSchema,
  delegateApprovalSchema,
  submitApprovalRequestSchema
} from "../src/modules/approvals/approval.schemas.js";
import { ApprovalService } from "../src/modules/approvals/approval.service.js";

describe("Approval Engine (Sprint 5)", () => {
  const tenantId = "11111111-1111-4111-8111-111111111111";
  const requesterId = "22222222-2222-4222-8222-222222222222";
  const managerId = "33333333-3333-4333-8333-333333333333";
  const hrId = "44444444-4444-4444-8444-444444444444";
  const delegateeId = "55555555-5555-4555-8555-555555555555";

  let approvalService: ApprovalService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(() => {
    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    mockPrisma = {
      approvalTemplate: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      approvalRequest: {
        findFirst: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      approvalAction: {
        findMany: vi.fn(),
        create: vi.fn()
      },
      tenantMembership: {
        findFirst: vi.fn()
      },
      $transaction: vi.fn().mockImplementation(async (cb: any) => cb(mockPrisma))
    };

    approvalService = new ApprovalService(mockPrisma, mockAudit);
  });

  describe("Zod Validation Schemas", () => {
    it("validates valid approval template schema", () => {
      const validTemplate = {
        code: "EXPENSE_APPROVAL",
        name: "Expense Reimbursement Approval",
        entityType: "EXPENSE",
        levels: [
          { level: 1, name: "Manager Approval", approverRole: "MANAGER" },
          { level: 2, name: "Finance Approval", approverRole: "FINANCE_ADMIN" }
        ],
        approverStrategy: "SEQUENTIAL",
        isActive: true
      };

      const parsed = createApprovalTemplateSchema.parse(validTemplate);
      expect(parsed.code).toBe("EXPENSE_APPROVAL");
      expect(parsed.levels).toHaveLength(2);
      expect(parsed.approverStrategy).toBe("SEQUENTIAL");
    });

    it("rejects approval template with no levels", () => {
      const invalid = {
        code: "INVALID_TMPL",
        name: "Empty Levels",
        entityType: "TEST",
        levels: []
      };

      expect(() => createApprovalTemplateSchema.parse(invalid)).toThrow();
    });

    it("validates submit approval request schema", () => {
      const parsed = submitApprovalRequestSchema.parse({
        templateCode: "EXPENSE_APPROVAL",
        entityType: "EXPENSE",
        entityId: "exp-101",
        data: { amount: 5000, currency: "INR" }
      });
      expect(parsed.templateCode).toBe("EXPENSE_APPROVAL");
      expect(parsed.entityType).toBe("EXPENSE");
    });

    it("rejects submit request when neither templateCode nor approvalTemplateId is provided", () => {
      expect(() =>
        submitApprovalRequestSchema.parse({
          entityType: "EXPENSE",
          entityId: "exp-101"
        })
      ).toThrow("Either templateCode or approvalTemplateId must be provided");
    });

    it("validates approval action schema", () => {
      const parsed = approvalActionSchema.parse({ comment: "Approved by manager" });
      expect(parsed.comment).toBe("Approved by manager");
    });

    it("validates delegate approval schema", () => {
      const parsed = delegateApprovalSchema.parse({
        delegateToUserId: delegateeId,
        comment: "Delegating while on leave"
      });
      expect(parsed.delegateToUserId).toBe(delegateeId);
    });

    it("validates approval query schema", () => {
      const parsed = approvalQuerySchema.parse({
        entityType: "EXPENSE",
        status: "PENDING",
        limit: "25",
        offset: "10"
      });
      expect(parsed.limit).toBe(25);
      expect(parsed.offset).toBe(10);
    });
  });

  describe("Template Management", () => {
    it("creates an approval template and logs audit trail", () => {
      mockPrisma.approvalTemplate.findUnique.mockResolvedValue(null);
      const createdTmpl = {
        id: "tmpl-1",
        tenantId,
        code: "PROMOTION_APPROVAL",
        name: "Promotion Approval Chain",
        entityType: "EMPLOYEE",
        levels: [{ level: 1, name: "HR Review" }],
        approverStrategy: "SEQUENTIAL",
        isActive: true
      };
      mockPrisma.approvalTemplate.create.mockResolvedValue(createdTmpl);

      return approvalService
        .createTemplate(
          tenantId,
          {
            code: "PROMOTION_APPROVAL",
            name: "Promotion Approval Chain",
            entityType: "EMPLOYEE",
            levels: [{ level: 1, name: "HR Review" }]
          } as any,
          hrId
        )
        .then((result) => {
          expect(result.id).toBe("tmpl-1");
          expect(mockAudit.record).toHaveBeenCalledWith(
            expect.objectContaining({
              tenantId,
              actorUserId: hrId,
              action: "approval_template.created",
              resourceType: "approval_template"
            })
          );
        });
    });

    it("prevents creating duplicate template codes within tenant", async () => {
      mockPrisma.approvalTemplate.findUnique.mockResolvedValue({ id: "tmpl-existing" });

      await expect(
        approvalService.createTemplate(
          tenantId,
          {
            code: "DUPLICATE",
            name: "Duplicate",
            entityType: "EXPENSE",
            levels: [{ level: 1, name: "Level 1" }]
          } as any,
          managerId
        )
      ).rejects.toThrow("already exists");
    });
  });

  describe("Multi-Level Approval Flow & Strategies", () => {
    const mockSequentialTemplate = {
      id: "tmpl-seq",
      tenantId,
      code: "TRAVEL_REQUEST",
      name: "Travel Request Approval",
      entityType: "TRAVEL",
      levels: [
        { level: 1, name: "Manager Approval", approverRole: "MANAGER" },
        { level: 2, name: "Director Approval", approverRole: "DIRECTOR" }
      ],
      approverStrategy: "SEQUENTIAL",
      isActive: true
    };

    it("submits approval request and initializes at level 1 with PENDING status", async () => {
      mockPrisma.approvalTemplate.findFirst.mockResolvedValue(mockSequentialTemplate);
      const createdRequest = {
        id: "req-1",
        tenantId,
        approvalTemplateId: "tmpl-seq",
        entityType: "TRAVEL",
        entityId: "trv-001",
        requesterId,
        currentLevel: 1,
        totalLevels: 2,
        status: "PENDING",
        data: {}
      };
      mockPrisma.approvalRequest.create.mockResolvedValue(createdRequest);

      const result = await approvalService.submitRequest(
        tenantId,
        {
          templateCode: "TRAVEL_REQUEST",
          entityType: "TRAVEL",
          entityId: "trv-001",
          data: { destination: "London", budget: 150000 }
        },
        requesterId
      );

      expect(result.id).toBe("req-1");
      expect(result.currentLevel).toBe(1);
      expect(result.status).toBe("PENDING");
      expect(mockAudit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "approval_request.submitted",
          resourceType: "approval_request"
        })
      );
    });

    it("advances to level 2 upon level 1 sequential approval", async () => {
      const pendingRequest = {
        id: "req-1",
        tenantId,
        approvalTemplateId: "tmpl-seq",
        currentLevel: 1,
        totalLevels: 2,
        status: "PENDING",
        approvalTemplate: mockSequentialTemplate,
        actions: []
      };

      mockPrisma.approvalRequest.findFirst.mockResolvedValue(pendingRequest);
      mockPrisma.approvalAction.create.mockResolvedValue({ id: "act-1" });
      mockPrisma.approvalRequest.update.mockResolvedValue({
        ...pendingRequest,
        currentLevel: 2,
        status: "PENDING"
      });

      const updated = await approvalService.approve(
        tenantId,
        "req-1",
        managerId,
        "Level 1 approved"
      );

      expect(mockPrisma.approvalAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            approvalRequestId: "req-1",
            level: 1,
            approverUserId: managerId,
            action: "APPROVED",
            comment: "Level 1 approved"
          })
        })
      );

      expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "req-1" },
          data: expect.objectContaining({
            currentLevel: 2,
            status: "PENDING"
          })
        })
      );
      expect(updated.currentLevel).toBe(2);
      expect(updated.status).toBe("PENDING");
    });

    it("marks request as APPROVED when final level is approved", async () => {
      const pendingRequestLevel2 = {
        id: "req-1",
        tenantId,
        approvalTemplateId: "tmpl-seq",
        currentLevel: 2,
        totalLevels: 2,
        status: "PENDING",
        approvalTemplate: mockSequentialTemplate,
        actions: [{ id: "act-1", level: 1, action: "APPROVED", approverUserId: managerId }]
      };

      mockPrisma.approvalRequest.findFirst.mockResolvedValue(pendingRequestLevel2);
      mockPrisma.approvalAction.create.mockResolvedValue({ id: "act-2" });
      mockPrisma.approvalRequest.update.mockResolvedValue({
        ...pendingRequestLevel2,
        currentLevel: 2,
        status: "APPROVED"
      });

      const finalApproved = await approvalService.approve(
        tenantId,
        "req-1",
        hrId,
        "Director approved budget"
      );

      expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "req-1" },
          data: expect.objectContaining({
            status: "APPROVED"
          })
        })
      );
      expect(finalApproved.status).toBe("APPROVED");
    });

    it("immediately rejects request when rejected by any approver", async () => {
      const pendingRequest = {
        id: "req-1",
        tenantId,
        approvalTemplateId: "tmpl-seq",
        currentLevel: 1,
        totalLevels: 2,
        status: "PENDING"
      };

      mockPrisma.approvalRequest.findFirst.mockResolvedValue(pendingRequest);
      mockPrisma.approvalAction.create.mockResolvedValue({ id: "act-rej" });
      mockPrisma.approvalRequest.update.mockResolvedValue({
        ...pendingRequest,
        status: "REJECTED"
      });

      const rejected = await approvalService.reject(
        tenantId,
        "req-1",
        managerId,
        "Budget too high"
      );

      expect(mockPrisma.approvalAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "REJECTED",
            comment: "Budget too high"
          })
        })
      );

      expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "req-1" },
          data: expect.objectContaining({
            status: "REJECTED"
          })
        })
      );
      expect(rejected.status).toBe("REJECTED");
    });

    it("records delegation of approval action", async () => {
      const pendingRequest = {
        id: "req-1",
        tenantId,
        currentLevel: 1,
        status: "PENDING"
      };

      mockPrisma.approvalRequest.findFirst.mockResolvedValue(pendingRequest);
      mockPrisma.approvalAction.create.mockResolvedValue({ id: "act-del" });
      mockPrisma.approvalRequest.findFirst.mockResolvedValueOnce(pendingRequest).mockResolvedValueOnce({
        ...pendingRequest,
        actions: [{ id: "act-del", action: "DELEGATED", delegatedToUserId: delegateeId }]
      });

      await approvalService.delegate(
        tenantId,
        "req-1",
        managerId,
        delegateeId,
        "Delegated during PTO"
      );

      expect(mockPrisma.approvalAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "DELEGATED",
            delegatedToUserId: delegateeId,
            comment: "Delegated during PTO"
          })
        })
      );
    });

    it("handles PARALLEL approval strategy when all approvers complete", async () => {
      const mockParallelTemplate = {
        id: "tmpl-par",
        tenantId,
        code: "MULTI_SIGN_OFF",
        name: "Multi-party Sign Off",
        entityType: "CONTRACT",
        levels: [
          { level: 1, name: "Legal", approverRole: "LEGAL" },
          { level: 2, name: "Finance", approverRole: "FINANCE" }
        ],
        approverStrategy: "PARALLEL",
        isActive: true
      };

      const requestWithOneApproval = {
        id: "req-par-1",
        tenantId,
        approvalTemplateId: "tmpl-par",
        currentLevel: 1,
        totalLevels: 2,
        status: "PENDING",
        approvalTemplate: mockParallelTemplate,
        actions: [{ id: "act-1", action: "APPROVED", level: 1, approverUserId: managerId }]
      };

      mockPrisma.approvalRequest.findFirst.mockResolvedValue(requestWithOneApproval);
      mockPrisma.approvalAction.create.mockResolvedValue({ id: "act-2" });
      mockPrisma.approvalRequest.update.mockResolvedValue({
        ...requestWithOneApproval,
        status: "APPROVED"
      });

      await approvalService.approve(tenantId, "req-par-1", hrId, "Legal signed off");
      expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "APPROVED"
          })
        })
      );
    });
  });

  describe("Pending Approvals Query for User", () => {
    it("returns pending requests matching user roles or direct assignment", async () => {
      mockPrisma.tenantMembership.findFirst.mockResolvedValue({
        roles: [{ role: { code: "MANAGER" } }]
      });

      const pendingRequests = [
        {
          id: "req-1",
          tenantId,
          currentLevel: 1,
          status: "PENDING",
          approvalTemplate: {
            levels: [{ level: 1, name: "Manager Approval", approverRole: "MANAGER" }]
          },
          actions: []
        },
        {
          id: "req-2",
          tenantId,
          currentLevel: 2,
          status: "PENDING",
          approvalTemplate: {
            levels: [
              { level: 1, name: "Manager Approval", approverRole: "MANAGER" },
              { level: 2, name: "Director Approval", approverRole: "DIRECTOR" }
            ]
          },
          actions: [{ id: "a-1", level: 1, action: "APPROVED", approverUserId: managerId }]
        }
      ];

      mockPrisma.approvalRequest.findMany.mockResolvedValue(pendingRequests);

      const myPending = await approvalService.getMyPendingApprovals(tenantId, managerId);
      expect(myPending).toHaveLength(1);
      expect(myPending[0]!.id).toBe("req-1");
    });
  });

  describe("Controller Security & RBAC Decorators", () => {
    const controllerCode = readFileSync(
      new URL("../src/modules/approvals/approval.controller.ts", import.meta.url),
      "utf8"
    );

    it("enforces approvals.view on read endpoints", () => {
      expect(controllerCode).toContain('@RequirePermissions("approvals.view")\n  async listTemplates');
      expect(controllerCode).toContain('@RequirePermissions("approvals.view")\n  async listRequests');
      expect(controllerCode).toContain('@RequirePermissions("approvals.view")\n  async getMyPendingApprovals');
      expect(controllerCode).toContain('@RequirePermissions("approvals.view")\n  async getRequest');
    });

    it("enforces approvals.manage on template creation", () => {
      expect(controllerCode).toContain('@RequirePermissions("approvals.manage")\n  async createTemplate');
    });

    it("enforces approvals.create on request submission", () => {
      expect(controllerCode).toContain('@RequirePermissions("approvals.create")\n  async submitRequest');
    });

    it("enforces approvals.action on approve, reject, and delegate", () => {
      expect(controllerCode).toContain('@RequirePermissions("approvals.action")\n  async approveRequest');
      expect(controllerCode).toContain('@RequirePermissions("approvals.action")\n  async rejectRequest');
      expect(controllerCode).toContain('@RequirePermissions("approvals.action")\n  async delegateRequest');
    });
  });

  describe("Tenant Isolation Verification", () => {
    const serviceCode = readFileSync(
      new URL("../src/modules/approvals/approval.service.ts", import.meta.url),
      "utf8"
    );

    it("strictly isolates approval queries and mutations by tenantId", () => {
      expect(serviceCode).toContain("where: {\n        tenantId,");
      expect(serviceCode).toContain("where: { tenantId, id }");
      expect(serviceCode).toContain("where: { tenantId, id: requestId }");
    });
  });
});
