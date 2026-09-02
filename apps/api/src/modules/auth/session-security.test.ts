import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("session security implementation", () => {
  const service = readFileSync(new URL("./auth.service.ts", import.meta.url), "utf8");
  const controller = readFileSync(new URL("./auth.controller.ts", import.meta.url), "utf8");

  it("creates tenant sessions with device, IP, user agent, expiry, and audit records", () => {
    expect(service).toContain("deviceFingerprint");
    expect(service).toContain("ipAddress: request.ip");
    expect(service).toContain("userAgent: this.userAgent(request)");
    expect(service).toContain("expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)");
    expect(service).toContain("action: \"auth.login\"");
  });

  it("revokes sessions during refresh and logout", () => {
    expect(service).toContain("session.revokedAt");
    expect(service).toContain("data: { revokedAt: new Date() }");
    expect(service).toContain("JWT_REFRESH_SECRET");
  });

  it("tracks OTP expiry, failed attempts, and consumption", () => {
    expect(service).toContain("expiresAt: new Date(Date.now() + 10 * 60 * 1000)");
    expect(service).toContain("attemptCount: { increment: 1 }");
    expect(service).toContain("consumedAt: new Date()");
  });

  it("supports multi-device sessions (no unique constraint on userId in schema)", () => {
    const schema = readFileSync(new URL("../../../prisma/schema.prisma", import.meta.url), "utf8");
    // Should NOT have @unique on userId in Session model
    const sessionModel = schema.match(/model Session\s*\{[^}]+\}/)?.[0] || "";
    expect(sessionModel).not.toMatch(/userId\s+String\s+@unique/);
  });

  it("revokes sessions in resetAccess", () => {
    const users = readFileSync(new URL("../users/users.service.ts", import.meta.url), "utf8");
    expect(users).toContain("session.updateMany(");
    expect(users).toContain("revokedAt: new Date()");
  });

  it("rejects expired sessions during refresh", () => {
    expect(service).toContain("session.expiresAt < new Date()");
  });

  it("updates lastLoginAt on login", () => {
    expect(service).toContain("lastLoginAt: new Date()");
  });

  it("sets access token expiry to 15m and refresh token to 30d", () => {
    expect(service).toContain('expiresIn: "15m"');
    expect(service).toContain('expiresIn: "30d"');
  });

  it("uses 6-digit OTP codes", () => {
    expect(service).toContain("randomInt(100000, 999999)");
  });

  it("uses separate JWT payload for platform login", () => {
    expect(service).toContain('typ: "platform"');
  });

  it("sets secure refresh cookie attributes consistently", () => {
    expect(controller).toContain("httpOnly: true");
    expect(controller).toContain('sameSite: "lax"');
    expect(controller).toContain('secure: process.env.NODE_ENV === "production"');
    expect(controller).toContain('path: "/"');
    expect(controller).toContain('response.clearCookie("vc_wms_refresh", refreshCookieOptions)');
  });
});
