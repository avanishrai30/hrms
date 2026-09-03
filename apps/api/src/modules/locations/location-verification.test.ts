import { describe, expect, it } from "vitest";
import { LocationVerificationStatus } from "@prisma/client";
import {
  LocationTarget,
  LocationVerificationEngine
} from "./location-verification.engine.js";

describe("LocationVerificationEngine", () => {
  const primaryOffice: LocationTarget = {
    id: "loc-primary-1",
    name: "Primary Office",
    code: "PRIMARY-01",
    latitude: 40.7128,
    longitude: -74.006,
    radiusMeters: 100,
    maxAccuracyMeters: 50,
    isActive: true,
    isPriority: false
  };

  const warehouseA: LocationTarget = {
    id: "loc-wh-1",
    name: "Warehouse Alpha",
    code: "WH-A",
    latitude: 40.7138,
    longitude: -74.0049,
    radiusMeters: 200,
    maxAccuracyMeters: 50,
    isActive: true,
    isPriority: true
  };

  const disabledPlant: LocationTarget = {
    id: "loc-plant-1",
    name: "Plant Beta",
    code: "PL-B",
    latitude: 40.7128,
    longitude: -74.006,
    radiusMeters: 100,
    maxAccuracyMeters: 50,
    isActive: false,
    isPriority: false
  };

  describe("calculateDistance", () => {
    it("returns 0 for identical coordinates", () => {
      const dist = LocationVerificationEngine.calculateDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(dist).toBe(0);
    });

    it("calculates accurate geodesic distance between two known points", () => {
      const dist = LocationVerificationEngine.calculateDistance(40.7128, -74.006, 40.7306, -73.9352);
      expect(dist).toBeGreaterThan(6000);
      expect(dist).toBeLessThan(7000);
    });

    it("calculates small scale meters accurately (e.g. 50 meters offset)", () => {
      // 0.00045 degrees latitude is approx 50 meters
      const dist = LocationVerificationEngine.calculateDistance(40.7128, -74.006, 40.71325, -74.006);
      expect(dist).toBeGreaterThan(45);
      expect(dist).toBeLessThan(55);
    });
  });

  describe("verify", () => {
    it("returns NO_ASSIGNED_LOCATION when location list is empty", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        locations: []
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.NO_ASSIGNED_LOCATION);
    });

    it("returns LOCATION_DISABLED when all assigned locations are inactive", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        locations: [disabledPlant]
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.LOCATION_DISABLED);
    });

    it("returns VERIFIED when user is inside radius with good accuracy", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 15,
        locations: [primaryOffice]
      });

      expect(res.verified).toBe(true);
      expect(res.status).toBe(LocationVerificationStatus.VERIFIED);
      expect(res.matchedLocationId).toBe("loc-primary-1");
      expect(res.distanceMeters).toBe(0);
      expect(res.reason).toContain("Inside Primary Office radius");
    });

    it("returns VERIFIED when user is within allowable radius (e.g. 40m away)", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 40.7131,
        longitude: -74.006,
        accuracy: 20,
        locations: [primaryOffice]
      });

      expect(res.verified).toBe(true);
      expect(res.status).toBe(LocationVerificationStatus.VERIFIED);
      expect(res.distanceMeters).toBeLessThanOrEqual(100);
    });

    it("returns ACCURACY_TOO_LOW when inside radius but GPS accuracy exceeds threshold", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 85, // max allowed is 50
        locations: [primaryOffice]
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.ACCURACY_TOO_LOW);
      expect(res.reason).toContain("GPS accuracy too low");
    });

    it("returns OUTSIDE_RADIUS when user position is beyond perimeter", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 40.7173,
        longitude: -74.006,
        accuracy: 10,
        locations: [primaryOffice]
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.OUTSIDE_RADIUS);
      expect(res.matchedLocationId).toBe("loc-primary-1");
      expect(res.distanceMeters).toBeGreaterThan(100);
      expect(res.reason).toContain("Outside radius of Primary Office");
    });

    it("prioritizes priority location when multiple locations are assigned", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 40.7138,
        longitude: -74.0049,
        accuracy: 10,
        locations: [primaryOffice, warehouseA]
      });

      expect(res.verified).toBe(true);
      expect(res.status).toBe(LocationVerificationStatus.VERIFIED);
      expect(res.matchedLocationId).toBe("loc-wh-1");
    });
  });
});
