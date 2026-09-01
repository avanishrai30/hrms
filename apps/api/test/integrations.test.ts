import { describe, expect, it } from "vitest";
import { collectPermissions, hasPermission } from "@vc-wms/auth";
import {
  ApiCredentialEngine,
  ApiRateLimitEngine,
  AutomationEngine,
  WebhookDeliveryEngine,
  connectorCatalog
} from "../src/modules/integrations/integrations.engine.js";

describe("Integrations Platform Engines (Task 25)", () => {
  const credentials = new ApiCredentialEngine();
  const rateLimits = new ApiRateLimitEngine();
  const webhooks = new WebhookDeliveryEngine();
  const automation = new AutomationEngine();

  describe("ApiCredentialEngine", () => {
    it("creates prefixed secret, hash and prefix", () => {
      const cred = credentials.createSecret("wms_live");
      expect(cred.raw.startsWith("wms_live_")).toBe(true);
      expect(cred.prefix.startsWith("wms_live_")).toBe(true);
      expect(cred.hash).toBe(credentials.hash(cred.raw));
    });

    it("encrypts config and signs webhooks with HMAC-SHA256", () => {
      const config = { apiKey: "secret_123", endpoint: "https://api.example.com" };
      const encrypted = credentials.encryptConfig(config);
      expect(typeof encrypted).toBe("string");

      const secret = "test_signing_secret";
      const payload = { event: "employee.created", id: "emp-123" };
      const sig = credentials.signWebhook(secret, payload);
      expect(typeof sig).toBe("string");
      expect(credentials.verifyWebhook(secret, payload, sig)).toBe(true);
      expect(credentials.verifyWebhook(secret, payload, "invalid_sig")).toBe(false);
    });
  });

  describe("ApiRateLimitEngine", () => {
    it("permits requests within rate limit and computes remaining", () => {
      const allowed = rateLimits.isAllowed(5, 60);
      expect(allowed.allowed).toBe(true);
      expect(allowed.remaining).toBe(54);
      expect(allowed.resetSeconds).toBe(60);
    });

    it("blocks requests exceeding rate limit", () => {
      const blocked = rateLimits.isAllowed(60, 60);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe("WebhookDeliveryEngine", () => {
    it("computes exponential backoff next attempt timestamp", () => {
      const next1 = webhooks.nextAttempt(1);
      const next2 = webhooks.nextAttempt(2);
      expect(next2.getTime()).toBeGreaterThan(next1.getTime());
    });

    it("classifies HTTP status into DELIVERED, FAILED, and DEAD_LETTER", () => {
      expect(webhooks.classify(200, 1, 3)).toBe("DELIVERED");
      expect(webhooks.classify(204, 1, 3)).toBe("DELIVERED");
      expect(webhooks.classify(500, 1, 3)).toBe("FAILED");
      expect(webhooks.classify(500, 3, 3)).toBe("DEAD_LETTER");
    });
  });

  describe("AutomationEngine", () => {
    it("evaluates EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, CONTAINS, DEPARTMENT_BASED, ROLE_BASED conditions", () => {
      const payload = {
        department: "Engineering",
        amount: 5000,
        role: "MANAGER",
        title: "Senior Backend Developer"
      };

      expect(
        automation.conditionsPass(
          [
            { field: "department", operator: "EQUALS", value: "Engineering" },
            { field: "amount", operator: "GREATER_THAN", value: 4000 },
            { field: "role", operator: "ROLE_BASED", value: "MANAGER" },
            { field: "title", operator: "CONTAINS", value: "Backend" }
          ],
          payload
        )
      ).toBe(true);

      expect(
        automation.conditionsPass(
          [{ field: "department", operator: "EQUALS", value: "Sales" }],
          payload
        )
      ).toBe(false);
    });

    it("creates QUEUED action result descriptor", () => {
      const res = automation.actionResult({ type: "SEND_EMAIL", payload: { to: "user@example.com" } });
      expect(res.status).toBe("QUEUED");
      expect(res.type).toBe("SEND_EMAIL");
    });
  });

  describe("Connector Catalog", () => {
    it("includes required connectors across Productivity, Communication, HR, Accounting, Storage, Identity", () => {
      const categories = new Set(connectorCatalog.map((c) => c.category));
      expect(categories.has("PRODUCTIVITY")).toBe(true);
      expect(categories.has("COMMUNICATION")).toBe(true);
      expect(categories.has("HR")).toBe(true);
      expect(categories.has("ACCOUNTING")).toBe(true);
      expect(categories.has("STORAGE")).toBe(true);
      expect(categories.has("IDENTITY")).toBe(true);
      expect(connectorCatalog.length).toBeGreaterThanOrEqual(17);
    });
  });

  describe("Integrations RBAC Permissions", () => {
    it("grants full integrations access to TENANT_OWNER and TENANT_ADMIN", () => {
      const ownerPerms = collectPermissions(["TENANT_OWNER"]);
      const adminPerms = collectPermissions(["TENANT_ADMIN"]);

      const required = [
        "integrations.view",
        "integrations.manage",
        "integrations.api.view",
        "integrations.api.manage",
        "integrations.webhooks.view",
        "integrations.webhooks.manage",
        "integrations.connectors.view",
        "integrations.connectors.manage",
        "integrations.sso.view",
        "integrations.sso.manage",
        "automation.view",
        "automation.manage",
        "automation.run",
        "knowledge.view",
        "knowledge.manage",
        "marketplace.view",
        "marketplace.manage",
        "ai.assistant.view"
      ] as const;

      for (const p of required) {
        expect(hasPermission(ownerPerms, p)).toBe(true);
        expect(hasPermission(adminPerms, p)).toBe(true);
      }
    });

    it("grants view and execution permissions to MANAGER and EMPLOYEE where appropriate", () => {
      const hrPerms = collectPermissions(["HR_ADMIN"]);
      expect(hasPermission(hrPerms, "integrations.view")).toBe(true);
      expect(hasPermission(hrPerms, "knowledge.manage")).toBe(true);
      expect(hasPermission(hrPerms, "ai.assistant.view")).toBe(true);
    });
  });
});
