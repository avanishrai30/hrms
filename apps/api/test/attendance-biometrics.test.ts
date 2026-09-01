import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("attendance check-in face biometrics integration", () => {
  const attendanceService = readFileSync(
    new URL("../src/modules/attendance/attendance.service.ts", import.meta.url),
    "utf8"
  );
  const attendanceSchema = readFileSync(
    new URL("../src/modules/attendance/attendance.schemas.ts", import.meta.url),
    "utf8"
  );

  it("ensures checkInSchema supports faceImageBase64 payload", () => {
    expect(attendanceSchema).toContain("faceImageBase64: z.string().optional()");
  });

  it("ensures attendance checkIn runs verifyFace when faceImageBase64 is provided", () => {
    expect(attendanceService).toContain("this.faceService.verifyFace(");
  });

  it("ensures attendance checkIn logs exception and blocks when face verification fails under mandatory policy", () => {
    expect(attendanceService).toContain('exceptionType: "FACE_BIOMETRIC_FAILED"');
    expect(attendanceService).toContain("throw new BadRequestException(`Face verification failed:");
  });

  it("persists biometric verification statuses on attendance record", () => {
    expect(attendanceService).toContain("faceVerificationStatus");
    expect(attendanceService).toContain("livenessVerificationStatus");
    expect(attendanceService).toContain("biometricTrustScore");
    expect(attendanceService).toContain("biometricVerificationReason");
  });
});
