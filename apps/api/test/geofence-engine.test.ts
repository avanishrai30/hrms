import { describe, expect, it } from "vitest";
import { GeoFenceEngine } from "../src/modules/workforce-operations/engines/geofence-engine.js";

describe("TASK 29 — GeoFence & GPS Distance Engine", () => {
  const mockFence = {
    id: "f-1",
    name: "Main Plant Mumbai",
    centerLatitude: 19.0760,
    centerLongitude: 72.8777,
    radiusMeters: 100,
    maxAccuracyMeters: 50
  };

  it("should validate punch inside geofence perimeter", () => {
    const result = GeoFenceEngine.validateGeoFencePunch(
      { latitude: 19.0761, longitude: 72.8778 }, // ~15 meters away
      10,
      false,
      mockFence
    );

    expect(result.isWithinFence).toBe(true);
    expect(result.isAccuracyAcceptable).toBe(true);
    expect(result.isMockLocationDetected).toBe(false);
    expect(result.validationStatus).toBe("VALID");
    expect(result.distanceMeters).toBeLessThan(100);
  });

  it("should reject punch outside authorized perimeter", () => {
    const result = GeoFenceEngine.validateGeoFencePunch(
      { latitude: 19.0800, longitude: 72.8800 }, // ~500 meters away
      10,
      false,
      mockFence
    );

    expect(result.isWithinFence).toBe(false);
    expect(result.validationStatus).toBe("OUTSIDE_GEOFENCE");
    expect(result.distanceMeters).toBeGreaterThan(100);
  });

  it("should reject mock GPS spoofing", () => {
    const result = GeoFenceEngine.validateGeoFencePunch(
      { latitude: 19.0760, longitude: 72.8777 },
      10,
      true, // Mock location flag
      mockFence
    );

    expect(result.isMockLocationDetected).toBe(true);
    expect(result.validationStatus).toBe("MOCK_LOCATION_REJECTED");
  });

  it("should reject poor GPS accuracy (> max accuracy meters)", () => {
    const result = GeoFenceEngine.validateGeoFencePunch(
      { latitude: 19.0760, longitude: 72.8777 },
      120, // 120m accuracy (poor)
      false,
      mockFence
    );

    expect(result.isAccuracyAcceptable).toBe(false);
    expect(result.validationStatus).toBe("POOR_ACCURACY");
  });
});
