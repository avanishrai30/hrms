import { describe, expect, it } from "vitest";
import {
  isPrivateOrReservedIpv4,
  isPrivateOrReservedIpv6,
  SsrfValidationError,
  validateSsrfUrl
} from "../src/modules/common/ssrf-validator.js";

describe("Webhook SSRF Protection (Part 4 & 16)", () => {
  it("correctly identifies private and reserved IPv4 addresses", () => {
    expect(isPrivateOrReservedIpv4("127.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIpv4("127.255.255.255")).toBe(true);
    expect(isPrivateOrReservedIpv4("0.0.0.0")).toBe(true);
    expect(isPrivateOrReservedIpv4("10.0.1.5")).toBe(true);
    expect(isPrivateOrReservedIpv4("172.16.0.1")).toBe(true);
    expect(isPrivateOrReservedIpv4("172.31.255.255")).toBe(true);
    expect(isPrivateOrReservedIpv4("192.168.1.100")).toBe(true);
    expect(isPrivateOrReservedIpv4("169.254.169.254")).toBe(true); // AWS/GCP metadata
    expect(isPrivateOrReservedIpv4("224.0.0.1")).toBe(true); // Multicast
    expect(isPrivateOrReservedIpv4("255.255.255.255")).toBe(true); // Broadcast

    // Public IPs should not be marked private
    expect(isPrivateOrReservedIpv4("8.8.8.8")).toBe(false);
    expect(isPrivateOrReservedIpv4("1.1.1.1")).toBe(false);
    expect(isPrivateOrReservedIpv4("140.82.121.4")).toBe(false); // GitHub
  });

  it("correctly identifies private and reserved IPv6 addresses", () => {
    expect(isPrivateOrReservedIpv6("::1")).toBe(true);
    expect(isPrivateOrReservedIpv6("::")).toBe(true);
    expect(isPrivateOrReservedIpv6("fc00::1")).toBe(true);
    expect(isPrivateOrReservedIpv6("fd12:3456:789a:1::1")).toBe(true);
    expect(isPrivateOrReservedIpv6("fe80::1")).toBe(true);
    expect(isPrivateOrReservedIpv6("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIpv6("::ffff:192.168.1.1")).toBe(true);

    // Public IPv6
    expect(isPrivateOrReservedIpv6("2607:f8b0:4005:805::200e")).toBe(false); // Google
  });

  it("blocks localhost, loopback, and internal service names", async () => {
    await expect(validateSsrfUrl("https://localhost/webhook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://127.0.0.1/webhook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://127.0.0.5:8443/webhook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://postgres:5432/webhook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://redis:6379/webhook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://metadata.google.internal/computeMetadata/v1/")).rejects.toThrow(
      SsrfValidationError
    );
  });

  it("blocks cloud metadata IP 169.254.169.254 and link-local ranges", async () => {
    await expect(validateSsrfUrl("https://169.254.169.254/latest/meta-data")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://169.254.1.1/hook")).rejects.toThrow(SsrfValidationError);
  });

  it("blocks private IPv4 CIDR ranges (10.x, 172.16-31.x, 192.168.x)", async () => {
    await expect(validateSsrfUrl("https://10.0.0.1/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://10.254.254.254/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://172.16.5.5/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://172.31.0.1/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://192.168.0.1/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://192.168.100.200/hook")).rejects.toThrow(SsrfValidationError);
  });

  it("blocks private IPv6 addresses", async () => {
    await expect(validateSsrfUrl("https://[::1]/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://[fc00::1]/hook")).rejects.toThrow(SsrfValidationError);
    await expect(validateSsrfUrl("https://[fe80::1]/hook")).rejects.toThrow(SsrfValidationError);
  });

  it("rejects insecure HTTP destination URLs by default", async () => {
    await expect(validateSsrfUrl("http://example.com/webhook")).rejects.toThrow(
      "Only HTTPS webhook destination URLs are permitted."
    );
  });

  it("rejects alternate numeric IP representations", async () => {
    // 0x7f000001 = 127.0.0.1 in hex
    await expect(validateSsrfUrl("https://0x7f000001/hook")).rejects.toThrow(SsrfValidationError);
    // 2130706433 = 127.0.0.1 in dword
    await expect(validateSsrfUrl("https://2130706433/hook")).rejects.toThrow(SsrfValidationError);
  });

  it("allows safe public HTTPS destination URLs", async () => {
    const result = await validateSsrfUrl("https://8.8.8.8/webhook");
    expect(result.valid).toBe(true);
    expect(result.resolvedIp).toBe("8.8.8.8");
  });
});
