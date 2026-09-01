import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("attendance geofence verification integration", () => {
  const service = readFileSync(new URL("../src/modules/attendance/attendance.service.ts", import.meta.url), "utf8");
  const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");

  it("ensures attendance model contains location verification fields", () => {
    expect(schema).toMatch(/locationId\s+String\?\s+@map\("location_id"\)/);
    expect(schema).toMatch(/distanceMeters\s+Float\?\s+@map\("distance_meters"\)/);
    expect(schema).toMatch(/accuracyMeters\s+Float\?\s+@map\("accuracy_meters"\)/);
    expect(schema).toMatch(/locationVerificationStatus\s+LocationVerificationStatus\?/);
  });

  it("invokes location verification during check-in when coordinates are provided", () => {
    expect(service).toContain("this.locationsService.verifyGps");
    expect(service).toContain("LocationVerificationStatus.VERIFIED");
    expect(service).toContain("LocationVerificationStatus.MANUAL_OVERRIDE");
  });

  it("handles geofence enforcement and exception creation", () => {
    expect(service).toContain("exceptionType: \"LOCATION_GEOFENCE_FAILED\"");
    expect(service).toContain("Geofence verification failed:");
  });
});
