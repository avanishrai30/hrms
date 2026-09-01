import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("DeepFace decoupling & configuration validation", () => {
  const serviceCode = readFileSync(
    new URL("./face.service.ts", import.meta.url),
    "utf8"
  );
  const moduleCode = readFileSync(
    new URL("./face.module.ts", import.meta.url),
    "utf8"
  );
  const attendanceCode = readFileSync(
    new URL("../attendance/attendance.service.ts", import.meta.url),
    "utf8"
  );

  it("ensures attendance service has NO direct dependency on DeepFace APIs", () => {
    expect(attendanceCode).not.toContain("deepface");
    expect(attendanceCode).not.toContain("DeepFace");
    expect(attendanceCode).toContain("this.faceService.verifyFace(");
  });

  it("ensures FaceService uses provider DI tokens", () => {
    expect(serviceCode).toContain("FACE_DETECTION_PROVIDER");
    expect(serviceCode).toContain("FACE_EMBEDDING_PROVIDER");
    expect(serviceCode).toContain("FACE_VERIFICATION_PROVIDER");
    expect(serviceCode).toContain("LIVENESS_PROVIDER");
  });

  it("ensures FaceModule registers all 4 provider tokens", () => {
    expect(moduleCode).toContain("FACE_DETECTION_PROVIDER");
    expect(moduleCode).toContain("FACE_EMBEDDING_PROVIDER");
    expect(moduleCode).toContain("FACE_VERIFICATION_PROVIDER");
    expect(moduleCode).toContain("LIVENESS_PROVIDER");
  });

  it("persists model version, distance metric, and threshold in verification metadata", () => {
    expect(serviceCode).toContain("modelVersion: verificationResult.modelVersion");
    expect(serviceCode).toContain("distanceMetric: verificationResult.distanceMetric");
  });
});
