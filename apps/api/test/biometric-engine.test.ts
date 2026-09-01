import { describe, expect, it } from "vitest";
import { BiometricEngine } from "../src/modules/workforce-operations/engines/biometric-engine.js";

describe("TASK 29 — Biometric Integration & Punch Ingestion Engine", () => {
  it("should normalize eSSL punch payload correctly", () => {
    const now = new Date();
    const result = BiometricEngine.normalizePunch({
      vendor: "ESSL",
      deviceSerialNumber: "ESSL-WH-001",
      userId: "1001",
      timestamp: now,
      punchType: "CHECK_IN",
      verificationMode: "FINGERPRINT"
    });

    expect(result.deviceSerialNumber).toBe("ESSL-WH-001");
    expect(result.biometricUserId).toBe("1001");
    expect(result.punchType).toBe("CHECK_IN");
    expect(result.verificationMode).toBe("FINGERPRINT");
    expect(result.isDuplicate).toBe(false);
  });

  it("should detect duplicate punches within 2-minute debounce window", () => {
    const now = new Date();
    const existingPunchTime = new Date(now.getTime() - 45 * 1000); // 45 seconds ago

    const result = BiometricEngine.normalizePunch(
      {
        vendor: "ZKTECO",
        deviceSerialNumber: "ZK-001",
        userId: "2002",
        timestamp: now
      },
      [existingPunchTime],
      2
    );

    expect(result.isDuplicate).toBe(true);
  });

  it("should evaluate device health based on heartbeat timestamp", () => {
    const recent = new Date(Date.now() - 5 * 60 * 1000); // 5 mins ago
    const stale = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago

    expect(BiometricEngine.evaluateDeviceHealth(recent, 15)).toBe("ONLINE");
    expect(BiometricEngine.evaluateDeviceHealth(stale, 15)).toBe("OFFLINE");
    expect(BiometricEngine.evaluateDeviceHealth(null, 15)).toBe("OFFLINE");
  });
});
