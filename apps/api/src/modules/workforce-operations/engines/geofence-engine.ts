/**
 * TASK 29 — GEOFENCE & GPS VERIFICATION ENGINE
 * Calculates Haversine distance and validates GPS accuracy, radius bounds, and mock GPS flags.
 */

export interface GeoLocationCoord {
  latitude: number;
  longitude: number;
}

export interface GeoFenceBoundary {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  maxAccuracyMeters: number;
}

export interface GeoFenceValidationResult {
  isWithinFence: boolean;
  distanceMeters: number;
  fenceName: string;
  isAccuracyAcceptable: boolean;
  isMockLocationDetected: boolean;
  validationStatus: "VALID" | "OUTSIDE_GEOFENCE" | "POOR_ACCURACY" | "MOCK_LOCATION_REJECTED";
}

export class GeoFenceEngine {
  /**
   * Calculate distance between two GPS coordinates using Haversine formula (in meters).
   */
  static calculateDistanceMeters(coord1: GeoLocationCoord, coord2: GeoLocationCoord): number {
    const earthRadiusMeters = 6371000;
    const dLat = this.degreesToRadians(coord2.latitude - coord1.latitude);
    const dLon = this.degreesToRadians(coord2.longitude - coord1.longitude);

    const lat1 = this.degreesToRadians(coord1.latitude);
    const lat2 = this.degreesToRadians(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadiusMeters * c);
  }

  private static degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Validate mobile device GPS punch against target site geofence boundary.
   */
  static validateGeoFencePunch(
    punchCoord: GeoLocationCoord,
    accuracyMeters: number,
    isMockLocation: boolean,
    fence: GeoFenceBoundary
  ): GeoFenceValidationResult {
    if (isMockLocation) {
      return {
        isWithinFence: false,
        distanceMeters: 0,
        fenceName: fence.name,
        isAccuracyAcceptable: false,
        isMockLocationDetected: true,
        validationStatus: "MOCK_LOCATION_REJECTED"
      };
    }

    const distanceMeters = this.calculateDistanceMeters(punchCoord, {
      latitude: fence.centerLatitude,
      longitude: fence.centerLongitude
    });

    const isAccuracyAcceptable = accuracyMeters <= fence.maxAccuracyMeters;
    const isWithinFence = distanceMeters <= fence.radiusMeters;

    let validationStatus: "VALID" | "OUTSIDE_GEOFENCE" | "POOR_ACCURACY" | "MOCK_LOCATION_REJECTED" = "VALID";

    if (!isAccuracyAcceptable) {
      validationStatus = "POOR_ACCURACY";
    } else if (!isWithinFence) {
      validationStatus = "OUTSIDE_GEOFENCE";
    }

    return {
      isWithinFence,
      distanceMeters,
      fenceName: fence.name,
      isAccuracyAcceptable,
      isMockLocationDetected: false,
      validationStatus
    };
  }
}
