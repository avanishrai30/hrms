import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditService } from "../../audit/audit.service.js";
import { KnowledgeBaseService } from "../services/knowledge-base.service.js";

export interface ToolDefinition {
  name: string;
  description: string;
  isMutating: boolean;
  requiredPermission: string;
  parametersSchema: Record<string, unknown>;
}

export interface ToolExecutionProposal {
  type: "PROPOSAL";
  toolName: string;
  confirmationToken: string;
  expiresAt: string;
  parameters: Record<string, unknown>;
  previewText: string;
}

export interface ToolExecutionSuccess {
  type: "SUCCESS";
  toolName: string;
  result: Record<string, unknown>;
  summary: string;
}

export type ToolExecutionResult = ToolExecutionProposal | ToolExecutionSuccess;

@Injectable()
export class AiToolRegistryService {
  private readonly secretKey = process.env.JWT_SECRET || "ai-tool-confirmation-secret-fallback";
  private readonly pendingProposals = new Map<string, {
    tenantId: string;
    userId: string;
    toolName: string;
    parameters: Record<string, unknown>;
    expiresAt: number;
  }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly knowledgeService: KnowledgeBaseService
  ) {}

  /**
   * Get all registered tool definitions filtered by user permissions.
   */
  getAvailableTools(userPermissions: string[]): ToolDefinition[] {
    const allTools: ToolDefinition[] = [
      {
        name: "get_my_leave_balance",
        description: "Fetch remaining and allocated leave days for the current employee.",
        isMutating: false,
        requiredPermission: "leave.view",
        parametersSchema: { type: "object", properties: {} }
      },
      {
        name: "get_my_attendance_today",
        description: "Fetch today's attendance punch status, check-in time, and shift details.",
        isMutating: false,
        requiredPermission: "attendance.view",
        parametersSchema: { type: "object", properties: {} }
      },
      {
        name: "get_my_latest_payslip",
        description: "Fetch latest calculated net pay and compensation summary for the current employee.",
        isMutating: false,
        requiredPermission: "payslip.view",
        parametersSchema: { type: "object", properties: {} }
      },
      {
        name: "search_policies",
        description: "Search corporate HR guidelines, handbooks, and statutory policies.",
        isMutating: false,
        requiredPermission: "ai.knowledge.read",
        parametersSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      },
      {
        name: "submit_leave_request",
        description: "Submit a new leave application. Requires explicit human confirmation.",
        isMutating: true,
        requiredPermission: "leave.create",
        parametersSchema: {
          type: "object",
          properties: {
            leaveTypeId: { type: "string" },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            reason: { type: "string" }
          },
          required: ["leaveTypeId", "startDate", "endDate"]
        }
      },
      {
        name: "clock_attendance_punch",
        description: "Record attendance check-in or check-out punch. Requires explicit human confirmation.",
        isMutating: true,
        requiredPermission: "attendance.create",
        parametersSchema: {
          type: "object",
          properties: {
            punchType: { type: "string", enum: ["IN", "OUT"] },
            notes: { type: "string" }
          },
          required: ["punchType"]
        }
      }
    ];

    return allTools.filter((t) => userPermissions.includes(t.requiredPermission));
  }

  /**
   * Request execution of a tool.
   * If the tool is mutating, generates a proposal and confirmation token.
   * If the tool is read-only, executes immediately.
   */
  async executeTool(params: {
    tenantId: string;
    userId: string;
    userPermissions: string[];
    toolName: string;
    parameters: Record<string, unknown>;
  }): Promise<ToolExecutionResult> {
    const { tenantId, userId, userPermissions, toolName, parameters } = params;

    const available = this.getAvailableTools(userPermissions);
    const tool = available.find((t) => t.name === toolName);

    if (!tool) {
      throw new ForbiddenException(`Tool '${toolName}' is not available or user lacks required permission.`);
    }

    // 1. MUTATING TOOL: Enforce Human Confirmation Flow
    if (tool.isMutating) {
      const confirmationToken = randomBytes(24).toString("hex");
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute validity

      this.pendingProposals.set(confirmationToken, {
        tenantId,
        userId,
        toolName,
        parameters,
        expiresAt
      });

      let previewText = `Action proposed: ${toolName}`;
      if (toolName === "submit_leave_request") {
        previewText = `Submit leave request from ${parameters.startDate} to ${parameters.endDate}`;
      } else if (toolName === "clock_attendance_punch") {
        previewText = `Record attendance punch ${parameters.punchType}`;
      }

      return {
        type: "PROPOSAL",
        toolName,
        confirmationToken,
        expiresAt: new Date(expiresAt).toISOString(),
        parameters,
        previewText
      };
    }

    // 2. READ-ONLY TOOL: Execute Immediately
    return this.executeReadTool(tenantId, userId, toolName, parameters);
  }

  /**
   * Confirm and execute a pending mutating tool action.
   */
  async confirmToolExecution(params: {
    tenantId: string;
    userId: string;
    userPermissions: string[];
    confirmationToken: string;
  }): Promise<ToolExecutionSuccess> {
    const { tenantId, userId, userPermissions, confirmationToken } = params;

    const proposal = this.pendingProposals.get(confirmationToken);
    if (!proposal) {
      throw new NotFoundException("Confirmation token is invalid or has expired.");
    }

    if (Date.now() > proposal.expiresAt) {
      this.pendingProposals.delete(confirmationToken);
      throw new BadRequestException("Confirmation token has expired. Please request the action again.");
    }

    // Cross-tenant and cross-user isolation verification
    if (proposal.tenantId !== tenantId || proposal.userId !== userId) {
      this.pendingProposals.delete(confirmationToken);
      throw new ForbiddenException("Unauthorized: proposal token does not match active security context.");
    }

    // Re-verify required permission
    const tool = this.getAvailableTools(userPermissions).find((t) => t.name === proposal.toolName);
    if (!tool) {
      this.pendingProposals.delete(confirmationToken);
      throw new ForbiddenException(`User lacks permission to execute '${proposal.toolName}'.`);
    }

    // Execute the mutating action
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const employee = user?.email
      ? await this.prisma.employee.findFirst({
          where: { tenantId, email: user.email }
        })
      : null;

    if (!employee) {
      this.pendingProposals.delete(confirmationToken);
      throw new BadRequestException("No employee record linked to active user account.");
    }

    let result: Record<string, unknown> = {};
    let summary = "";

    if (proposal.toolName === "submit_leave_request") {
      const leaveTypeId = String(proposal.parameters.leaveTypeId);
      const startDate = new Date(String(proposal.parameters.startDate));
      const endDate = new Date(String(proposal.parameters.endDate));
      const reason = proposal.parameters.reason ? String(proposal.parameters.reason) : "Submitted via AI Copilot";
      const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      const created = await this.prisma.leaveRequest.create({
        data: {
          tenantId,
          employeeId: employee.id,
          leaveTypeId,
          startDate,
          endDate,
          reason,
          status: "PENDING_MANAGER",
          totalDays: days,
          deductedDays: days
        }
      });

      result = { leaveRequestId: created.id, status: created.status };
      summary = `Successfully submitted leave application from ${proposal.parameters.startDate} to ${proposal.parameters.endDate}.`;
    } else if (proposal.toolName === "clock_attendance_punch") {
      const punchType = String(proposal.parameters.punchType);
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const event = await this.prisma.attendanceEvent.create({
        data: {
          tenantId,
          employeeId: employee.id,
          eventType: punchType === "IN" ? "CHECK_IN" : "CHECK_OUT",
          timestamp: now,
          source: "WEB"
        }
      });

      result = { eventId: event.id, timestamp: event.timestamp.toISOString() };
      summary = `Recorded attendance punch (${punchType}) at ${now.toLocaleTimeString()}.`;
    }

    // Clean up consumed proposal
    this.pendingProposals.delete(confirmationToken);

    // Audit Log
    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: "ai.tool.executed",
      resourceType: "ai_tool",
      resourceId: proposal.toolName,
      after: {
        toolName: proposal.toolName,
        parameters: proposal.parameters as Prisma.InputJsonValue,
        result: result as Prisma.InputJsonValue
      }
    });

    return {
      type: "SUCCESS",
      toolName: proposal.toolName,
      result,
      summary
    };
  }

  private async executeReadTool(
    tenantId: string,
    userId: string,
    toolName: string,
    parameters: Record<string, unknown>
  ): Promise<ToolExecutionSuccess> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const employee = user?.email
      ? await this.prisma.employee.findFirst({
          where: { tenantId, email: user.email }
        })
      : null;

    if (toolName === "get_my_leave_balance") {
      if (!employee) {
        return {
          type: "SUCCESS",
          toolName,
          result: { balances: [] },
          summary: "No linked employee record found."
        };
      }
      const balances = await this.prisma.leaveBalance.findMany({
        where: { tenantId, employeeId: employee.id },
        include: { leaveType: true }
      });
      return {
        type: "SUCCESS",
        toolName,
        result: {
          balances: balances.map((b) => ({
            leaveType: b.leaveType.name,
            available: Math.max(0, b.allocatedDays - b.usedDays),
            total: b.allocatedDays
          }))
        },
        summary: `Retrieved ${balances.length} leave balance records.`
      };
    }

    if (toolName === "get_my_attendance_today") {
      if (!employee) {
        return {
          type: "SUCCESS",
          toolName,
          result: { status: "UNAVAILABLE" },
          summary: "No linked employee record found."
        };
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const att = await this.prisma.attendance.findFirst({
        where: { tenantId, employeeId: employee.id, date: { gte: today } },
        include: { shift: true }
      });
      return {
        type: "SUCCESS",
        toolName,
        result: {
          status: att?.status || "NOT_RECORDED",
          shiftName: att?.shift?.name || "Standard",
          checkIn: att?.checkInAt?.toISOString() || null
        },
        summary: `Today's status: ${att?.status || "NOT_RECORDED"}`
      };
    }

    if (toolName === "get_my_latest_payslip") {
      if (!employee) {
        return {
          type: "SUCCESS",
          toolName,
          result: { payslip: null },
          summary: "No linked employee record found."
        };
      }
      const latest = await this.prisma.payslip.findFirst({
        where: { tenantId, employeeId: employee.id },
        orderBy: { createdAt: "desc" }
      });
      return {
        type: "SUCCESS",
        toolName,
        result: {
          month: latest?.month || null,
          year: latest?.year || null,
          netSalary: latest?.netSalary || 0
        },
        summary: latest
          ? `Latest payslip: ${latest.month}/${latest.year}`
          : "No payslips available."
      };
    }

    if (toolName === "search_policies") {
      const query = String(parameters.query || "");
      const chunks = await this.knowledgeService.searchKnowledge(tenantId, { query, topK: 3 });
      return {
        type: "SUCCESS",
        toolName,
        result: {
          matches: chunks.map((c) => ({
            documentTitle: c.documentTitle,
            excerpt: c.content
          }))
        },
        summary: `Found ${chunks.length} policy excerpts matching query.`
      };
    }

    throw new BadRequestException(`Unrecognized read tool '${toolName}'.`);
  }
}
