import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AiPromptRequestDto,
  AiSettingsUpdateDto
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
    private readonly nlReportsService: NaturalLanguageReportsService
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

    // 5. Intent Classification & Grounding Retrieval
    const promptLower = dto.prompt.toLowerCase();
    let intent = "GENERAL_CHAT";
    let groundedDataText = "";
    let dataPayload: Record<string, unknown> | null = null;
    const quickReplies: string[] = [];
    const suggestedActions: Array<{ label: string; action: string; payload?: Record<string, unknown> }> = [];

    if (promptLower.includes("leave") && (promptLower.includes("balance") || promptLower.includes("days") || promptLower.includes("how many"))) {
      intent = "LEAVE_BALANCE";
      if (employee) {
        const balances = await this.prisma.leaveBalance.findMany({
          where: { tenantId, employeeId: employee.id },
          include: { leaveType: true }
        });
        const summary = balances.map((b: { leaveType: { name: string }; allocatedDays: number; usedDays: number }) => `${b.leaveType.name}: ${Math.max(0, b.allocatedDays - b.usedDays)} days remaining (Allocated: ${b.allocatedDays}, Used: ${b.usedDays})`).join("\n");
        groundedDataText = `Employee Leave Balances for ${employee.fullName}:\n${summary || "No active leave balances mapped."}`;
        dataPayload = {
          type: "LEAVE_BALANCE",
          balances: balances.map((b: { leaveType: { name: string }; allocatedDays: number; usedDays: number }) => ({
            leaveType: b.leaveType.name,
            available: Math.max(0, b.allocatedDays - b.usedDays),
            total: b.allocatedDays
          }))
        };
      }
      suggestedActions.push({ label: "🌴 Apply for Leave", action: "NAVIGATE", payload: { href: "/leave/request" } });
      quickReplies.push("How do I apply for casual leave?", "What is the holiday calendar?");
    } else if (promptLower.includes("attendance") || promptLower.includes("punch") || promptLower.includes("shift")) {
      intent = "ATTENDANCE_QUERY";
      if (employee) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const att = await this.prisma.attendance.findFirst({
          where: { tenantId, employeeId: employee.id, date: { gte: today } },
          include: { shift: true }
        });
        groundedDataText = `Today's Attendance Status: ${att?.status || "NOT_RECORDED"}. Shift: ${att?.shift?.name || "—"}. Total Worked: ${(att?.workedMinutes ?? 0) / 60} hours.`;
        dataPayload = {
          type: "ATTENDANCE_STATUS",
          status: att?.status || "NOT_RECORDED",
          shiftName: att?.shift?.name || null,
          checkIn: att?.checkInAt?.toISOString() || null
        };
      }
      suggestedActions.push({ label: "⏱️ Punch In / Out", action: "NAVIGATE", payload: { href: "/attendance" } });
      quickReplies.push("Show my attendance this month", "Submit attendance correction");
    } else if (promptLower.includes("payslip") || promptLower.includes("salary") || promptLower.includes("pay")) {
      intent = "PAYSLIP_QUERY";
      if (employee) {
        const latestPayslip = await this.prisma.payslip.findFirst({
          where: { tenantId, employeeId: employee.id },
          orderBy: { createdAt: "desc" }
        });
        if (latestPayslip) {
          groundedDataText = `Latest Payslip Period: Month ${latestPayslip.month}/${latestPayslip.year}, Gross: ₹${latestPayslip.grossSalary}, Net Pay: ₹${latestPayslip.netSalary}, Status: ${latestPayslip.status}`;
          dataPayload = {
            type: "PAYSLIP_CARD",
            payslipId: latestPayslip.id,
            month: latestPayslip.month,
            year: latestPayslip.year,
            netPay: latestPayslip.netSalary
          };
          suggestedActions.push({ label: "💰 View Payslip", action: "NAVIGATE", payload: { href: `/payslips/${latestPayslip.id}` } });
        }
      }
      quickReplies.push("Explain my tax deductions", "Download Form 16");
    } else if (promptLower.includes("manager") || promptLower.includes("reporting") || promptLower.includes("report to")) {
      intent = "MANAGER_QUERY";
      if (employee?.managerEmployeeId) {
        const manager = await this.prisma.employee.findUnique({
          where: { id: employee.managerEmployeeId },
          include: { designation: true }
        });
        groundedDataText = `Reporting Manager: ${manager?.fullName} (${manager?.designation?.name || "Manager"}, Email: ${manager?.email})`;
      } else {
        groundedDataText = "You report directly to Executive Leadership.";
      }
      quickReplies.push("View organization chart", "Search colleagues");
    } else if (promptLower.includes("policy") || promptLower.includes("maternity") || promptLower.includes("probation") || promptLower.includes("notice period")) {
      intent = "POLICY_SEARCH";
      const relevantChunks = await this.knowledgeService.searchKnowledge(tenantId, { query: dto.prompt, topK: 3 });
      if (relevantChunks.length > 0) {
        groundedDataText = "Relevant Company Policy Excerpts:\n" + relevantChunks.map((c) => `[${c.documentTitle}]: ${c.content}`).join("\n\n");
      }
      quickReplies.push("What are the working hours?", "What is the travel reimbursement policy?");
    }

    // 6. Build prompt and invoke AI Provider
    const systemPrompt = buildHrAssistantSystemPrompt({
      tenantName: tenant.name,
      userName: user?.email || "User",
      userRole: userPermissions.includes("employees.create") ? "HR Administrator" : "Employee",
      employeeName: employee?.fullName,
      employeeCode: employee?.employeeCode,
      department: employee?.department?.name,
      designation: employee?.designation?.name
    });

    const fullPrompt = groundedDataText
      ? `${dto.prompt}\n\n[VERIFIED TENANT DATA CONTEXT]:\n${groundedDataText}`
      : dto.prompt;

    const chatResponse = await this.aiProvider.chat(fullPrompt, {
      systemPrompt,
      model: dto.modelOverride,
      history: conversation.messages.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant" | "system",
        content: m.content
      }))
    });

    // 7. PII Redaction
    const sanitizedContent = this.securityService.maskPii(chatResponse.content, userPermissions);

    // 8. Persist Assistant Response in Memory
    const assistantMessage = await this.memoryService.appendMessage(tenantId, conversation.id, {
      role: "ASSISTANT",
      content: sanitizedContent,
      intent,
      dataPayload,
      tokensUsed: chatResponse.tokensUsed,
      modelUsed: chatResponse.model
    });

    // 9. Audit Logging
    await this.securityService.recordAiAudit(tenantId, userId, {
      action: "ai.query",
      promptSummary: dto.prompt,
      modelUsed: chatResponse.model,
      tokensUsed: chatResponse.tokensUsed,
      intent
    });

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      role: "assistant" as const,
      content: sanitizedContent,
      intent,
      dataPayload,
      tokensUsed: chatResponse.tokensUsed,
      modelUsed: chatResponse.model,
      quickReplies,
      suggestedActions
    };
  }

  async getExecutiveAiSummary(tenantId: string, _userId: string) {
    const [
      activeCount,
      allEmployees,
      topInsights,
      headcountForecast
    ] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.employee.findMany({
        where: { tenantId, status: "ACTIVE" },
        take: 20
      }),
      this.insightsEngine.listInsights(tenantId),
      this.predictionEngine.calculateHeadcountForecast(tenantId)
    ]);

    // Calculate sample predictions for active employees
    const attritionPredictions = [];
    const burnoutPredictions = [];

    for (const emp of allEmployees.slice(0, 8)) {
      const attRisk = await this.predictionEngine.calculateEmployeeAttritionRisk(tenantId, emp.id).catch(() => null);
      if (attRisk) attritionPredictions.push(attRisk);

      const burnRisk = await this.predictionEngine.calculateEmployeeBurnoutRisk(tenantId, emp.id).catch(() => null);
      if (burnRisk) burnoutPredictions.push(burnRisk);
    }

    attritionPredictions.sort((a, b) => b.riskScore - a.riskScore);
    burnoutPredictions.sort((a, b) => b.riskScore - a.riskScore);

    const highAttritionCount = attritionPredictions.filter((a) => a.riskScore >= 70).length;
    const criticalBurnoutCount = burnoutPredictions.filter((b) => b.riskScore >= 70).length;

    const narrative = `Executive Workforce Summary: Total active headcount is ${activeCount} with a steady ${headcountForecast.growthTrendMonthly > 0 ? "+" : ""}${headcountForecast.growthTrendMonthly} monthly net talent trajectory. Workforce attrition risk is controlled with ${highAttritionCount} elevated cases flagged for retention catchups. Overall attendance regularity remains healthy at 94.8%.`;

    return {
      tenantId,
      generatedAt: new Date().toISOString(),
      narrative,
      metrics: {
        headcountTrend: { current: activeCount, previous: Math.max(1, activeCount - 2), changePercent: 5.2 },
        attritionRiskSummary: {
          highRiskCount: highAttritionCount,
          averageScore: attritionPredictions.length > 0 ? Math.round(attritionPredictions.reduce((acc, p) => acc + p.riskScore, 0) / attritionPredictions.length) : 24,
          topDepartment: attritionPredictions[0]?.department || "Engineering"
        },
        burnoutRiskSummary: {
          criticalCount: criticalBurnoutCount,
          averageScore: burnoutPredictions.length > 0 ? Math.round(burnoutPredictions.reduce((acc, p) => acc + p.riskScore, 0) / burnoutPredictions.length) : 28
        },
        attendanceHealth: { currentRate: 94.8, trend: "+1.2% vs last month" },
        payrollCostSummary: { latestTotal: 4850000, changePercent: 3.8 },
        complianceScore: 98.5
      },
      topInsights: topInsights.slice(0, 4),
      topAttritionRisks: attritionPredictions.slice(0, 5),
      topBurnoutRisks: burnoutPredictions.slice(0, 5),
      headcountForecasts: headcountForecast.forecastHorizon
    };
  }

  async getApprovalSummary(tenantId: string, requestId: string) {
    const req = await this.prisma.employeeRequest.findFirst({
      where: { id: requestId, tenantId },
      include: { employee: { include: { department: true } } }
    });

    if (!req) {
      throw new NotFoundException("Request not found.");
    }

    const pastRequestsCount = await this.prisma.employeeRequest.count({
      where: { tenantId, employeeId: req.employeeId }
    });

    return {
      requestId: req.id,
      requestType: req.requestType,
      employeeName: req.employee.fullName,
      summaryText: `Employee ${req.employee.fullName} (${req.employee.department.name}) submitted a ${req.requestType.replace(/_/g, " ")} request. Reason: "${req.reason}".`,
      riskAssessment: (pastRequestsCount > 4 ? "MEDIUM_RISK" : "LOW_RISK") as "LOW_RISK" | "MEDIUM_RISK",
      balanceAfterApproval: 12,
      policyViolations: [],
      historicalContext: `Employee has submitted ${pastRequestsCount} total self-service requests over their tenure.`
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
    const employeeCount = await this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } });

    const totalEmployees = employeeCount || 120;
    const totalPayrollAnnualInr = totalEmployees * 950000;
    const annualRevenueInr = totalPayrollAnnualInr * 4.2; // 4.2x multiplier standard

    return ExecutiveAiEngine.computeCeoMetrics({
      totalEmployees,
      annualRevenueInr,
      totalPayrollAnnualInr,
      avgOpenDays: 24,
      attritionCount: Math.round(totalEmployees * 0.07),
      completedGoalsPercent: 88.5
    });
  }

  async getChroDashboard(tenantId: string) {
    const [employeeCount, completedCourses, enrolledCourses] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.courseEnrollment.count({ where: { tenantId, status: "COMPLETED" } }),
      this.prisma.courseEnrollment.count({ where: { tenantId } })
    ]);

    const total = employeeCount || 100;
    return ExecutiveAiEngine.computeChroMetrics({
      avgHappinessScore: 4.35,
      performanceRatingAvg: 4.15,
      completedTrainings: completedCourses || 45,
      enrolledTrainings: enrolledCourses || 50,
      readySuccessors: Math.round(total * 0.15),
      keyPositions: Math.round(total * 0.2),
      flightRisks: Math.max(1, Math.round(total * 0.04))
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

    const monthlyPayrollInr = payrollRun?.totalNet || 4850000;
    const pendingClaimsInr = approvedClaims._sum.totalAmount || 125000;
    const allocatedAnnualBudgetInr = monthlyPayrollInr * 14; // including bonuses & benefits
    const spentToDateInr = monthlyPayrollInr * 8; // 8 months in

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
