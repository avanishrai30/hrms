import { describe, expect, it } from "vitest";
import {
  createAssignmentSchema,
  createLocationSchema,
  locationOverrideSchema,
  verifyGpsSchema
} from "./locations.schemas.js";

describe("Locations Schemas", () => {
  describe("createLocationSchema", () => {
    it("validates a complete location payload", () => {
      const parsed = createLocationSchema.parse({
        name: "Bangalore HQ",
        code: "BLR-HQ",
        description: "Main development center",
        type: "OFFICE",
        latitude: 12.9716,
        longitude: 77.5946,
        radiusMeters: 150,
        maxAccuracyMeters: 50,
        isActive: true
      });

      expect(parsed.code).toBe("BLR-HQ");
      expect(parsed.radiusMeters).toBe(150);
    });

    it("rejects invalid latitude or longitude", () => {
      expect(() =>
        createLocationSchema.parse({
          name: "Invalid Loc",
          code: "INV-01",
          latitude: 95.0, // > 90
          longitude: 77.0
        })
      ).toThrow();
    });

    it("rejects invalid location codes with special characters", () => {
      expect(() =>
        createLocationSchema.parse({
          name: "Invalid Code",
          code: "BLR@#$",
          latitude: 12.0,
          longitude: 77.0
        })
      ).toThrow();
    });
  });

  describe("createAssignmentSchema", () => {
    it("validates employee assignment", () => {
      const parsed = createAssignmentSchema.parse({
        locationId: "11111111-1111-4111-8111-111111111111",
        employeeId: "22222222-2222-4222-8222-222222222222",
        isPriority: true
      });
      expect(parsed.isPriority).toBe(true);
    });

    it("rejects when neither employeeId nor departmentId is provided", () => {
      expect(() =>
        createAssignmentSchema.parse({
          locationId: "11111111-1111-4111-8111-111111111111"
        })
      ).toThrow();
    });
  });

  describe("verifyGpsSchema", () => {
    it("validates GPS coordinate payload", () => {
      const parsed = verifyGpsSchema.parse({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 12.5
      });
      expect(parsed.latitude).toBe(12.9716);
      expect(parsed.accuracy).toBe(12.5);
    });
  });

  describe("locationOverrideSchema", () => {
    it("requires reason of minimum length 8", () => {
      expect(() =>
        locationOverrideSchema.parse({
          employeeId: "11111111-1111-4111-8111-111111111111",
          locationId: "22222222-2222-4222-8222-222222222222",
          reason: "Short"
        })
      ).toThrow();

      const valid = locationOverrideSchema.parse({
        employeeId: "11111111-1111-4111-8111-111111111111",
        locationId: "22222222-2222-4222-8222-222222222222",
        reason: "Client meeting offsite duty approved"
      });
      expect(valid.reason).toBe("Client meeting offsite duty approved");
    });
  });
});
