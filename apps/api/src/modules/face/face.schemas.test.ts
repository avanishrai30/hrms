import { describe, expect, it } from "vitest";
import {
  enrollFaceSchema,
  reviewEnrollmentSchema,
  verifyFaceSchema
} from "./face.schemas.js";

describe("Face Schemas", () => {
  it("validates enrollment payload", () => {
    const valid = enrollFaceSchema.parse({
      employeeId: "11111111-1111-4111-8111-111111111111",
      imageBase64: "data:image/jpeg;base64,VGhpcyBpcyBhIHRlc3QgaW1hZ2UgcGF5bG9hZCBmb3IgYmlvbWV0cmljcy4=",
      reason: "Initial onboarding"
    });

    expect(valid.imageBase64).toBeDefined();
    expect(valid.reason).toBe("Initial onboarding");
  });

  it("rejects enrollment without image payload", () => {
    expect(() =>
      enrollFaceSchema.parse({
        imageBase64: "short"
      })
    ).toThrow();
  });

  it("validates review payload", () => {
    const approved = reviewEnrollmentSchema.parse({
      status: "APPROVED",
      reviewNote: "Liveness and face match clear"
    });
    expect(approved.status).toBe("APPROVED");

    expect(() =>
      reviewEnrollmentSchema.parse({
        status: "APPROVED",
        reviewNote: "sh" // < 4 chars
      })
    ).toThrow();
  });

  it("validates verify face payload", () => {
    const valid = verifyFaceSchema.parse({
      imageBase64: "data:image/jpeg;base64,VGhpcyBpcyBhIHRlc3QgaW1hZ2UgcGF5bG9hZCBmb3IgYmlvbWV0cmljcy4="
    });
    expect(valid.imageBase64).toBeDefined();
  });
});
