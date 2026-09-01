import { createHash, createHmac, randomBytes } from "node:crypto";

export class ApiCredentialEngine {
  createSecret(prefix: string) {
    const raw = `${prefix}_${randomBytes(24).toString("base64url")}`;
    return { raw, hash: this.hash(raw), prefix: raw.slice(0, 12) };
  }

  hash(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  encryptConfig(config: Record<string, unknown>) {
    return Buffer.from(JSON.stringify(config)).toString("base64url");
  }

  signWebhook(secret: string, payload: unknown) {
    return createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
  }

  verifyWebhook(secret: string, payload: unknown, signature: string) {
    return this.signWebhook(secret, payload) === signature;
  }
}

export class ApiRateLimitEngine {
  isAllowed(count: number, limit: number) {
    return { allowed: count < limit, remaining: Math.max(0, limit - count - 1), resetSeconds: 60 };
  }
}

export class WebhookDeliveryEngine {
  nextAttempt(attempts: number) {
    return new Date(Date.now() + Math.min(3600, 2 ** attempts * 30) * 1000);
  }

  classify(statusCode: number, attempts: number, maxAttempts: number) {
    if (statusCode >= 200 && statusCode < 300) return "DELIVERED" as const;
    return attempts >= maxAttempts ? "DEAD_LETTER" as const : "FAILED" as const;
  }
}

export class AutomationEngine {
  conditionsPass(conditions: Array<{ field: string; operator: string; value: unknown }>, payload: Record<string, unknown>) {
    return conditions.every((condition) => {
      const value = payload[condition.field];
      if (condition.operator === "EQUALS") return value === condition.value;
      if (condition.operator === "NOT_EQUALS") return value !== condition.value;
      if (condition.operator === "GREATER_THAN") return Number(value) > Number(condition.value);
      if (condition.operator === "LESS_THAN") return Number(value) < Number(condition.value);
      if (condition.operator === "CONTAINS") return String(value ?? "").includes(String(condition.value));
      if (condition.operator === "DATE_BASED") return Boolean(value);
      if (condition.operator === "DEPARTMENT_BASED") return value === condition.value;
      if (condition.operator === "ROLE_BASED") return value === condition.value;
      return false;
    });
  }

  actionResult(action: { type: string; payload: Record<string, unknown> }) {
    return { type: action.type, status: "QUEUED", payload: action.payload };
  }
}

export const connectorCatalog = [
  { provider: "google_workspace", category: "PRODUCTIVITY", name: "Google Workspace" },
  { provider: "microsoft_365", category: "PRODUCTIVITY", name: "Microsoft 365" },
  { provider: "slack", category: "COMMUNICATION", name: "Slack" },
  { provider: "microsoft_teams", category: "COMMUNICATION", name: "Microsoft Teams" },
  { provider: "telegram", category: "COMMUNICATION", name: "Telegram" },
  { provider: "darwinbox", category: "HR", name: "Darwinbox" },
  { provider: "keka", category: "HR", name: "Keka" },
  { provider: "bamboohr", category: "HR", name: "BambooHR" },
  { provider: "tally", category: "ACCOUNTING", name: "Tally" },
  { provider: "zoho_books", category: "ACCOUNTING", name: "Zoho Books" },
  { provider: "quickbooks", category: "ACCOUNTING", name: "QuickBooks" },
  { provider: "google_drive", category: "STORAGE", name: "Google Drive" },
  { provider: "onedrive", category: "STORAGE", name: "OneDrive" },
  { provider: "dropbox", category: "STORAGE", name: "Dropbox" },
  { provider: "azure_ad", category: "IDENTITY", name: "Azure AD" },
  { provider: "okta", category: "IDENTITY", name: "Okta" },
  { provider: "google_sso", category: "IDENTITY", name: "Google SSO" }
] as const;
