import { describe, expect, it } from "vitest";
import { LocationVerificationStatus } from "@prisma/client";
import {
  LocationTarget,
  LocationVerificationEngine
} from "./location-verification.engine.js";

describe("LocationVerificationEngine", () => {
  const hqOffice: LocationTarget = {
    id: "loc-hq-1",
    name: "Headquarters",
    code: "HQ-01",
    latitude: 12.9716, // Bangalore coordinates
    longitude: 77.5946,
    radiusMeters: 100,
    maxAccuracyMeters: 50,
    isActive: true,
    isPriority: false
  };

  const warehouseA: LocationTarget = {
    id: "loc-wh-1",
    name: "Warehouse Alpha",
    code: "WH-A",
    latitude: 12.9800,
    longitude: 77.6000,
    radiusMeters: 200,
    maxAccuracyMeters: 50,
    isActive: true,
    isPriority: true
  };

  const disabledPlant: LocationTarget = {
    id: "loc-plant-1",
    name: "Plant Beta",
    code: "PL-B",
    latitude: 12.9716,
    longitude: 77.5946,
    radiusMeters: 100,
    maxAccuracyMeters: 50,
    isActive: false,
    isPriority: false
  };

  describe("calculateDistance", () => {
    it("returns 0 for identical coordinates", () => {
      const dist = LocationVerificationEngine.calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
      expect(dist).toBe(0);
    });

    it("calculates accurate geodesic distance between two known points", () => {
      // Distance between Bangalore (12.9716, 77.5946) and Mysore (12.2958, 76.6394) is ~128-130km
      const dist = LocationVerificationEngine.calculateDistance(12.9716, 77.5946, 12.2958, 76.6394);
      expect(dist).toBeGreaterThan(120000);
      expect(dist).toBeLessThan(140000);
    });

    it("calculates small scale meters accurately (e.g. 50 meters offset)", () => {
      // 0.00045 degrees latitude is approx 50 meters
      const dist = LocationVerificationEngine.calculateDistance(12.9716, 77.5946, 12.97205, 77.5946);
      expect(dist).toBeGreaterThan(45);
      expect(dist).toBeLessThan(55);
    });
  });

  describe("verify", () => {
    it("returns NO_ASSIGNED_LOCATION when location list is empty", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 10,
        locations: []
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.NO_ASSIGNED_LOCATION);
    });

    it("returns LOCATION_DISABLED when all assigned locations are inactive", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 10,
        locations: [disabledPlant]
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.LOCATION_DISABLED);
    });

    it("returns VERIFIED when user is inside radius with good accuracy", () => {
      // Exact point at HQ
      const res = LocationVerificationEngine.verify({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 15,
        locations: [hqOffice]
      });

      expect(res.verified).toBe(true);
      expect(res.status).toBe(LocationVerificationStatus.VERIFIED);
      expect(res.matchedLocationId).toBe("loc-hq-1");
      expect(res.distanceMeters).toBe(0);
      expect(res.reason).toContain("Inside Headquarters radius");
    });

    it("returns VERIFIED when user is within allowable radius (e.g. 40m away)", () => {
      // ~40m away from HQ
      const res = LocationVerificationEngine.verify({
        latitude: 12.9719,
        longitude: 77.5946,
        accuracy: 20,
        locations: [hqOffice]
      });

      expect(res.verified).toBe(true);
      expect(res.status).toBe(LocationVerificationStatus.VERIFIED);
      expect(res.distanceMeters).toBeLessThanOrEqual(100);
    });

    it("returns ACCURACY_TOO_LOW when inside radius but GPS accuracy exceeds threshold", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 85, // max allowed is 50
        locations: [hqOffice]
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.ACCURACY_TOO_LOW);
      expect(res.reason).toContain("GPS accuracy too low");
    });

    it("returns OUTSIDE_RADIUS when user position is beyond perimeter", () => {
      // 500 meters away from HQ
      const res = LocationVerificationEngine.verify({
        latitude: 12.9760,
        longitude: 77.5946,
        accuracy: 10,
        locations: [hqOffice]
      });

      expect(res.verified).toBe(false);
      expect(res.status).toBe(LocationVerificationStatus.OUTSIDE_RADIUS);
      expect(res.matchedLocationId).toBe("loc-hq-1");
      expect(res.distanceMeters).toBeGreaterThan(100);
      expect(res.reason).toContain("Outside radius of Headquarters");
    });

    it("prioritizes priority location when multiple locations are assigned", () => {
      const res = LocationVerificationEngine.verify({
        latitude: 12.9800,
        longitude: 77.6000,
        accuracy: 10,
        locations: [hqOffice, warehouseA]
      });

      expect(res.verified).toBe(true);
      expect(res.status).toBe(LocationVerificationStatus.VERIFIED);
      expect(res.matchedLocationId).toBe("loc-wh-1");
    });
  });
});
