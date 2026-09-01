/**
 * TASK 29 — BIOMETRIC DEVICE INTEGRATION ENGINE
 * Normalizes multi-vendor punch formats (eSSL, ZKTeco, Matrix, Suprema) and handles punch de-duplication.
 */

export interface RawBiometricPayload {
  vendor: "ESSL" | "ZKTECO" | "MATRIX" | "SUPREMA" | "GENERIC_REST";
  deviceSerialNumber: string;
  userId: string;
  timestamp: string | Date;
  punchType?: "CHECK_IN" | "CHECK_OUT" | "BREAK_IN" | "BREAK_OUT";
  verificationMode?: "FINGERPRINT" | "FACE" | "CARD" | "PIN";
}

export interface NormalizedPunchResult {
  deviceSerialNumber: string;
  biometricUserId: string;
  punchTime: Date;
  punchType: "CHECK_IN" | "CHECK_OUT" | "BREAK_IN" | "BREAK_OUT";
  verificationMode: "FINGERPRINT" | "FACE" | "CARD" | "PIN";
  isDuplicate: boolean;
}

export class BiometricEngine {
  /**
   * Normalize and validate raw punch payload from any biometric terminal vendor.
   */
  static normalizePunch(
    payload: RawBiometricPayload,
    recentPunchesWithinMinutes: Date[] = [],
    dedupWindowMinutes = 2
  ): NormalizedPunchResult {
    const punchTime = new Date(payload.timestamp);

    // Default mode mapping
    let verificationMode: "FINGERPRINT" | "FACE" | "CARD" | "PIN" = "FINGERPRINT";
    if (payload.verificationMode) {
      verificationMode = payload.verificationMode;
    } else if (payload.vendor === "SUPREMA") {
      verificationMode = "FACE";
    }

    // Default punch type
    const punchType = payload.punchType ?? "CHECK_IN";

    // De-duplication check: if another punch exists within dedupWindowMinutes, flag as duplicate
    const dedupWindowMs = dedupWindowMinutes * 60 * 1000;
    const isDuplicate = recentPunchesWithinMinutes.some(
      (existing) => Math.abs(existing.getTime() - punchTime.getTime()) < dedupWindowMs
    );

    return {
      deviceSerialNumber: payload.deviceSerialNumber,
      biometricUserId: payload.userId,
      punchTime,
      punchType,
      verificationMode,
      isDuplicate
    };
  }

  /**
   * Determine device status from last heartbeat / sync timestamp.
   */
  static evaluateDeviceHealth(lastHeartbeat: Date | null, offlineThresholdMinutes = 15): "ONLINE" | "OFFLINE" {
    if (!lastHeartbeat) return "OFFLINE";
    const diffMs = Date.now() - new Date(lastHeartbeat).getTime();
    return diffMs <= offlineThresholdMinutes * 60 * 1000 ? "ONLINE" : "OFFLINE";
  }
}
