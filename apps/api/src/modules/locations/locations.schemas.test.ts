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
        name: "Production Campus",
        code: "PROD-CAMPUS",
        description: "Primary production site",
        type: "FACTORY",
        latitude: 40.7128,
        longitude: -74.006,
        radiusMeters: 150,
        maxAccuracyMeters: 50,
        isActive: true
      });

      expect(parsed.code).toBe("PROD-CAMPUS");
      expect(parsed.radiusMeters).toBe(150);
    });

    it("requires explicit geofence configuration without hidden defaults", () => {
      expect(() =>
        createLocationSchema.parse({
          name: "Unconfigured Location",
          code: "UNCONFIGURED",
          latitude: 40.7128,
          longitude: -74.006
        })
      ).toThrow();
    });

    it("rejects invalid latitude or longitude", () => {
      expect(() =>
        createLocationSchema.parse({
          name: "Invalid Loc",
          code: "INV-01",
          latitude: 95.0, // > 90
          longitude: -74.0,
          type: "OFFICE",
          radiusMeters: 100,
          maxAccuracyMeters: 50
        })
      ).toThrow();
    });

    it("rejects invalid location codes with special characters", () => {
      expect(() =>
        createLocationSchema.parse({
          name: "Invalid Code",
          code: "BLR@#$",
          latitude: 40.7,
          longitude: -74.0,
          type: "OFFICE",
          radiusMeters: 100,
          maxAccuracyMeters: 50
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
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 12.5
      });
      expect(parsed.latitude).toBe(40.7128);
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
