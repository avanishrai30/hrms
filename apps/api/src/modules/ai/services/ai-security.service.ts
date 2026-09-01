import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit/audit.service.js";

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /reveal\s+(all\s+)?(employee\s+)?(salaries|passwords|credentials|keys|tokens)/i,
  /show\s+(all\s+)?(passwords|hashes|secrets|env\s+variables)/i,
  /system\s*override/i,
  /jailbreak/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /drop\s+table/i,
  /delete\s+from\s+users/i,
  /bypass\s+security\s+rules/i,
  /export\s+all\s+database/i
];

@Injectable()
export class AiSecurityService {
  constructor(private readonly auditService: AuditService) {}

  validatePromptSafety(prompt: string): { isSafe: boolean; reason?: string } {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        return {
          isSafe: false,
          reason: "Prompt blocked by safety shield: Potential prompt injection or unauthorized instruction detected."
        };
      }
    }
    return { isSafe: true };
  }

  maskPii(
    text: string,
    permissions: string[]
  ): string {
    let sanitized = text;

    const canViewCompensation = permissions.includes("compensation.view") || permissions.includes("payroll.view");
    const canViewDocuments = permissions.includes("documents.view") || permissions.includes("documents.read");

    // Mask PAN (10-char alphanumeric e.g. ABCDE1234F) if not authorized
    if (!canViewDocuments) {
      sanitized = sanitized.replace(/[A-Z]{5}[0-9]{4}[A-Z]{1}/g, "••••••••••");
    }

    // Mask Aadhaar (12-digit e.g. 1234 5678 9012) if not authorized
    if (!canViewDocuments) {
      sanitized = sanitized.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, "•••• •••• ••••");
    }

    // Mask Bank Account Numbers (9-18 digits) if not authorized
    if (!canViewCompensation) {
      sanitized = sanitized.replace(/(?:account|acct|acc\.?|a\/c)\s*(?:no\.?|number)?\s*:?\s*(\d{4,18})/gi, "Account: ••••••••");
    }

    // Mask Passwords or Secret Keys if accidentally present
    sanitized = sanitized.replace(/(?:password|secret|api_key|token)\s*[:=]\s*([^\s,;]+)/gi, "$1: [REDACTED]");

    return sanitized;
  }

  async recordAiAudit(
    tenantId: string,
    userId: string,
    data: {
      action: "ai.query" | "ai.prediction.generated" | "ai.knowledge.uploaded" | "ai.settings.updated" | "ai.document.extracted";
      promptSummary?: string;
      modelUsed?: string;
      tokensUsed?: number;
      intent?: string;
      resourceId?: string;
    }
  ) {
    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      action: data.action,
      resourceType: "ai_intelligence",
      resourceId: data.resourceId ?? "ai_copilot",
      after: {
        promptSummary: data.promptSummary?.slice(0, 100),
        modelUsed: data.modelUsed,
        tokensUsed: data.tokensUsed,
        intent: data.intent
      }
    });
  }
}
