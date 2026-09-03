import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AiPromptRequestDto,
  AiSettingsUpdateDto,
  AiToolConfirmDto,
  AiToolExecuteDto
} from "./ai.schemas.js";
import { PredictionEngine } from "./engines/prediction.engine.js";
import { InsightsEngine } from "./engines/insights.engine.js";
import { ExecutiveAiEngine } from "./engines/executive-ai.engine.js";
import { ConversationMemoryService } from "./memory/conversation-memory.service.js";
import { buildHrAssistantSystemPrompt } from "./prompts/hr-assistant.prompt.js";
import { AI_PROVIDER, type AIProvider } from "./providers/ai-provider.interface.js";
import { AiSecurityService } from "./services/ai-security.service.js";
import { KnowledgeBaseService } from "./services/knowledge-base.service.js";
import { NaturalLanguageReportsService } from "./services/natural-language-reports.service.js";
import { AiContextBuilderService } from "./services/ai-context-builder.service.js";
import { AiToolRegistryService, type ToolExecutionResult } from "./tools/ai-tool-registry.service.js";

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
    private readonly memoryService: ConversationMemoryService,
    private readonly securityService: AiSecurityService,
    private readonly knowledgeService: KnowledgeBaseService,
    private readonly predictionEngine: PredictionEngine,
    private readonly insightsEngine: InsightsEngine,
    private readonly nlReportsService: NaturalLanguageReportsService,
    private readonly contextBuilder: AiContextBuilderService,
    private readonly toolRegistry: AiToolRegistryService
  ) {}

  async handleChatPrompt(
    tenantId: string,
    userId: string,
    userPermissions: string[],
    dto: AiPromptRequestDto
  ) {
    // 1. Prompt Injection & Safety Check
    const safety = this.securityService.validatePromptSafety(dto.prompt);
    if (!safety.isSafe) {
      throw new BadRequestException(safety.reason);
    }

    // 2. Fetch User & Tenant context
    const [user, tenant, employee] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.prisma.employee.findFirst({
        where: { tenantId, email: (await this.prisma.user.findUnique({ where: { id: userId } }))?.email || "" },
        include: { department: true, designation: true }
      })
    ]);

    if (!tenant) {
      throw new NotFoundException("Tenant not found.");
    }

    // 3. Retrieve or create Conversation Thread
    const conversation = await this.memoryService.getOrCreateConversation(
      tenantId,
      userId,
      dto.conversationId,
      dto.contextType
    );

    // 4. Save User Message
    await this.memoryService.appendMessage(tenantId, conversation.id, {
      role: "USER",
      content: dto.prompt
    });

    // 5. Build Grounded Context via Context Builder with Permission Intersection
    const contextResult = await this.contextBuilder.buildGroundedContext({
      tenantId,
      userId,
      userPermissions,
      prompt: dto.prompt,
      employeeId: employee?.id
    });

    let dataPayload: Record<string, unknown> | null = contextResult.dataPayload;
    const sources = contextResult.sources;
    const quickReplies = contextResult.quickReplies;
    const suggestedActions = contextResult.suggestedActions;

    // 6. Tool Proposal Detection (e.g. write actions requiring confirmation)
    const promptLower = dto.prompt.toLowerCase();
    if (promptLower.includes("apply for leave") || promptLower.includes("request leave")) {
      if (userPermissions.includes("leave.create") && employee) {
        const leaveType = await this.prisma.leaveType.findFirst({ where: { tenantId } });
        if (leaveType) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dayAfter = new Date(tomorrow);
          dayAfter.setDate(dayAfter.getDate() + 1);

          const toolProposal = await this.toolRegistry.executeTool({
            tenantId,
            userId,
            userPermissions,
            toolName: "submit_leave_request",
            parameters: {
              leaveTypeId: leaveType.id,
              startDate: tomorrow.toISOString().split("T")[0],
              endDate: dayAfter.toISOString().split("T")[0],
              reason: "Applied via AI Copilot"
            }
          });

          if (toolProposal.type === "PROPOSAL") {
            dataPayload = {
              type: "TOOL_PROPOSAL",
              toolName: toolProposal.toolName,
              confirmationToken: toolProposal.confirmationToken,
              expiresAt: toolProposal.expiresAt,
              parameters: toolProposal.parameters,
              previewText: toolProposal.previewText
            };
          }
        }
      }
    } else if (promptLower.includes("clock in") || promptLower.includes("clock out") || promptLower.includes("punch in")) {
      if (userPermissions.includes("attendance.create")) {
        const punchType = promptLower.includes("clock out") ? "OUT" : "IN";
        const toolProposal = await this.toolRegistry.executeTool({
          tenantId,
          userId,
          userPermissions,
          toolName: "clock_attendance_punch",
          parameters: { punchType }
        });

        if (toolProposal.type === "PROPOSAL") {
          dataPayload = {
            type: "TOOL_PROPOSAL",
            toolName: toolProposal.toolName,
            confirmationToken: toolProposal.confirmationToken,
            expiresAt: toolProposal.expiresAt,
            parameters: toolProposal.parameters,
            previewText: toolProposal.previewText
          };
        }
      }
    }

    // 7. Build prompt and invoke AI Provider
    const systemPrompt = buildHrAssistantSystemPrompt({
      tenantName: tenant.name,
      userName: user?.email || "User",
      userRole: userPermissions.includes("employees.create") ? "HR Administrator" : "Employee",
      employeeName: employee?.fullName,
      employeeCode: employee?.employeeCode,
      department: employee?.department?.name,
      designation: employee?.designation?.name
    });

    const fullPrompt = contextResult.groundedDataText
      ? `${dto.prompt}\n\n[VERIFIED TENANT DATA CONTEXT]:\n${contextResult.groundedDataText}`
      : dto.prompt;

    const chatResponse = await this.aiProvider.chat(fullPrompt, {
      systemPrompt,
      model: dto.modelOverride,
      history: conversation.messages.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant" | "system",
        content: m.content
      }))
    });

    // 8. PII Redaction
    const sanitizedContent = this.securityService.maskPii(chatResponse.content, userPermissions);

    // 9. Persist Assistant Response in Memory
    const assistantMessage = await this.memoryService.appendMessage(tenantId, conversation.id, {
      role: "ASSISTANT",
      content: sanitizedContent,
      intent: "GENERAL_CHAT",
      dataPayload,
      tokensUsed: chatResponse.tokensUsed,
      modelUsed: chatResponse.model
    });

    // 10. Audit Logging
    await this.securityService.recordAiAudit(tenantId, userId, {
      action: "ai.query",
      promptSummary: dto.prompt,
      modelUsed: chatResponse.model,
      tokensUsed: chatResponse.tokensUsed,
      intent: "GENERAL_CHAT"
    });

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      role: "assistant" as const,
      content: sanitizedContent,
      intent: "GENERAL_CHAT",
      dataPayload,
      sources,
      tokensUsed: chatResponse.tokensUsed,
      modelUsed: chatResponse.model,
      quickReplies,
      suggestedActions
    };
  }

  async executeTool(
    tenantId: string,
    userId: string,
    userPermissions: string[],
    dto: AiToolExecuteDto
  ): Promise<ToolExecutionResult> {
    return this.toolRegistry.executeTool({
      tenantId,
      userId,
      userPermissions,
      toolName: dto.toolName,
      parameters: dto.parameters
    });
  }

  async confirmTool(
    tenantId: string,
    userId: string,
    userPermissions: string[],
    dto: AiToolConfirmDto
  ) {
    return this.toolRegistry.confirmToolExecution({
      tenantId,
      userId,
      userPermissions,
      confirmationToken: dto.confirmationToken
    });
  }

  getAvailableTools(userPermissions: string[]) {
    return this.toolRegistry.getAvailableTools(userPermissions);
  }

  async getExecutiveAiSummary(tenantId: string, _userId: string) {
    const [
      activeCount,
      departments,
      recentVerifications,
      predictions
    ] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.department.findMany({
        where: { tenantId },
        select: { id: true, name: true, _count: { select: { employees: true } } }
      }),
      this.prisma.faceVerification.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      this.prisma.aiWorkforcePrediction.findMany({
        where: { tenantId },
        take: 10
      })
    ]);

    const highAttritionRisks = predictions.filter(
      (p: { predictionType: string; riskScore: number }) => p.predictionType === "ATTRITION_RISK" && p.riskScore >= 70
    ).length;

    const matchedVerifications = recentVerifications.filter(
      (v: { status: string }) => v.status === "MATCHED"
    ).length;
    const biometricTrustScore =
      recentVerifications.length > 0
        ? Math.round((matchedVerifications / recentVerifications.length) * 100)
        : 100;

    return {
      activeEmployees: activeCount,
      departmentCount: departments.length,
      biometricTrustScore,
      highAttritionRisksCount: highAttritionRisks,
      recentAlerts: [
        {
          id: "alert-1",
          title: "Workforce Telemetry Active",
          description: `Telemetry monitored across ${departments.length} departments.`,
          severity: "INFO",
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  async getApprovalSummary(tenantId: string, requestId: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id: requestId, tenantId },
      include: {
        employee: { include: { department: true, designation: true } },
        leaveType: true
      }
    });

    if (!request) {
      throw new NotFoundException("Approval request not found.");
    }

    const employeeLeaves = await this.prisma.leaveRequest.count({
      where: {
        tenantId,
        employeeId: request.employeeId,
        status: "APPROVED"
      }
    });

    return {
      requestId: request.id,
      employeeName: request.employee.fullName,
      employeeCode: request.employee.employeeCode,
      department: request.employee.department?.name || "—",
      leaveType: request.leaveType.name,
      dates: `${request.startDate.toISOString().split("T")[0]} to ${request.endDate.toISOString().split("T")[0]}`,
      daysRequested: request.totalDays,
      reason: request.reason || "No reason specified",
      historicalLeavesTaken: employeeLeaves,
      aiRecommendation: request.totalDays <= 3 ? "APPROVE" : "MANUAL_REVIEW",
      riskScore: request.totalDays > 5 ? 65 : 20
    };
  }

  async getAiSettings(tenantId: string) {
    let settings = await this.prisma.aiSettings.findUnique({
      where: { tenantId }
    });

    if (!settings) {
      settings = await this.prisma.aiSettings.create({
        data: {
          tenantId,
          activeProvider: "GEMINI",
          modelName: "gemini-1.5-flash",
          temperature: 0.2,
          maxTokens: 2048,
          enablePiiMasking: true,
          enablePromptShield: true,
          enableAutoInsights: true,
          enableWorkforcePredictions: true
        }
      });
    }

    return {
      id: settings.id,
      tenantId: settings.tenantId,
      activeProvider: settings.activeProvider,
      hasGeminiKey: Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY),
      hasOpenaiKey: Boolean(settings.openaiApiKey || process.env.OPENAI_API_KEY),
      modelName: settings.modelName,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      enablePiiMasking: settings.enablePiiMasking,
      enablePromptShield: settings.enablePromptShield,
      enableAutoInsights: settings.enableAutoInsights,
      enableWorkforcePredictions: settings.enableWorkforcePredictions,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    };
  }

  async updateAiSettings(tenantId: string, dto: AiSettingsUpdateDto, userId: string) {
    const updated = await this.prisma.aiSettings.upsert({
      where: { tenantId },
      update: {
        ...(dto.activeProvider !== undefined ? { activeProvider: dto.activeProvider } : {}),
        ...(dto.geminiApiKey !== undefined ? { geminiApiKey: dto.geminiApiKey } : {}),
        ...(dto.openaiApiKey !== undefined ? { openaiApiKey: dto.openaiApiKey } : {}),
        ...(dto.modelName !== undefined ? { modelName: dto.modelName } : {}),
        ...(dto.temperature !== undefined ? { temperature: dto.temperature } : {}),
        ...(dto.maxTokens !== undefined ? { maxTokens: dto.maxTokens } : {}),
        ...(dto.enablePiiMasking !== undefined ? { enablePiiMasking: dto.enablePiiMasking } : {}),
        ...(dto.enablePromptShield !== undefined ? { enablePromptShield: dto.enablePromptShield } : {}),
        ...(dto.enableAutoInsights !== undefined ? { enableAutoInsights: dto.enableAutoInsights } : {}),
        ...(dto.enableWorkforcePredictions !== undefined ? { enableWorkforcePredictions: dto.enableWorkforcePredictions } : {})
      },
      create: {
        tenantId,
        activeProvider: dto.activeProvider || "GEMINI",
        geminiApiKey: dto.geminiApiKey,
        openaiApiKey: dto.openaiApiKey,
        modelName: dto.modelName || "gemini-1.5-flash",
        temperature: dto.temperature ?? 0.2,
        maxTokens: dto.maxTokens ?? 2048,
        enablePiiMasking: dto.enablePiiMasking ?? true,
        enablePromptShield: dto.enablePromptShield ?? true,
        enableAutoInsights: dto.enableAutoInsights ?? true,
        enableWorkforcePredictions: dto.enableWorkforcePredictions ?? true
      }
    });

    await this.securityService.recordAiAudit(tenantId, userId, {
      action: "ai.settings.updated",
      promptSummary: `Updated AI settings: Provider=${updated.activeProvider}, Model=${updated.modelName}`
    });

    return this.getAiSettings(tenantId);
  }

  async getCeoDashboard(tenantId: string) {
    const [employeeCount, latestPayrollRun, attritionHistory] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.payrollRun.findFirst({
        where: { tenantId, status: { in: ["APPROVED", "LOCKED", "GENERATED"] } },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.employeeStatusHistory.count({
        where: { tenantId, newStatus: "INACTIVE" }
      })
    ]);

    const totalEmployees = employeeCount;
    const monthlyGross = latestPayrollRun?.totalGross ?? 0;
    const totalPayrollAnnualInr = monthlyGross * 12;
    const annualRevenueInr = totalPayrollAnnualInr * 4;

    return ExecutiveAiEngine.computeCeoMetrics({
      totalEmployees,
      annualRevenueInr,
      totalPayrollAnnualInr,
      avgOpenDays: 0,
      attritionCount: attritionHistory,
      completedGoalsPercent: totalEmployees > 0 ? 80 : 0
    });
  }

  async getChroDashboard(tenantId: string) {
    const [employeeCount, completedCourses, enrolledCourses, highRiskPredictions] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.courseEnrollment.count({ where: { tenantId, status: "COMPLETED" } }),
      this.prisma.courseEnrollment.count({ where: { tenantId } }),
      this.prisma.aiWorkforcePrediction.count({
        where: { tenantId, predictionType: "ATTRITION_RISK", riskScore: { gte: 70 } }
      })
    ]);

    const total = employeeCount;
    return ExecutiveAiEngine.computeChroMetrics({
      avgHappinessScore: total > 0 ? 4.0 : 0,
      performanceRatingAvg: total > 0 ? 3.8 : 0,
      completedTrainings: completedCourses,
      enrolledTrainings: enrolledCourses,
      readySuccessors: 0,
      keyPositions: Math.max(1, Math.round(total * 0.1)),
      flightRisks: highRiskPredictions
    });
  }

  async getCfoDashboard(tenantId: string) {
    const [payrollRun, approvedClaims] = await Promise.all([
      this.prisma.payrollRun.findFirst({
        where: { tenantId, status: { in: ["APPROVED", "LOCKED", "GENERATED"] } },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.expenseClaim.aggregate({
        where: { tenantId, status: "APPROVED" },
        _sum: { totalAmount: true }
      })
    ]);

    const monthlyPayrollInr = payrollRun?.totalNet || 0;
    const pendingClaimsInr = approvedClaims._sum.totalAmount || 0;
    const allocatedAnnualBudgetInr = monthlyPayrollInr * 12;
    const spentToDateInr = monthlyPayrollInr;

    return ExecutiveAiEngine.computeCfoMetrics({
      monthlyPayrollInr,
      allocatedAnnualBudgetInr,
      spentToDateInr,
      pendingClaimsInr,
      statutoryTaxesInr: Math.round(monthlyPayrollInr * 0.18)
    });
  }

  async getExecutiveRisks(tenantId: string) {
    const [ceo, chro, cfo] = await Promise.all([
      this.getCeoDashboard(tenantId),
      this.getChroDashboard(tenantId),
      this.getCfoDashboard(tenantId)
    ]);

    const risks = ExecutiveAiEngine.generateAiRiskInsights({ ceo, chro, cfo });
    return {
      ceo,
      chro,
      cfo,
      risks,
      generatedAt: new Date().toISOString()
    };
  }
}
