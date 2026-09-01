import { LocationVerificationStatus } from "@prisma/client";

export interface LocationTarget {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxAccuracyMeters: number;
  isActive: boolean;
  isPriority?: boolean;
}

export interface VerificationResult {
  verified: boolean;
  status: LocationVerificationStatus;
  distanceMeters: number | null;
  accuracyMeters: number;
  matchedLocationId: string | null;
  matchedLocationName: string | null;
  reason: string;
}

export class LocationVerificationEngine {
  private static readonly EARTH_RADIUS_METERS = 6371000;

  /**
   * Calculates geodesic distance in meters between two lat/lng coordinates using Haversine formula.
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(LocationVerificationEngine.EARTH_RADIUS_METERS * c * 10) / 10;
  }

  /**
   * Evaluates GPS coordinates against a set of assigned target locations.
   */
  static verify(params: {
    latitude: number;
    longitude: number;
    accuracy: number;
    locations: LocationTarget[];
  }): VerificationResult {
    const { latitude, longitude, accuracy, locations } = params;

    if (!locations || locations.length === 0) {
      return {
        verified: false,
        status: LocationVerificationStatus.NO_ASSIGNED_LOCATION,
        distanceMeters: null,
        accuracyMeters: accuracy,
        matchedLocationId: null,
        matchedLocationName: null,
        reason: "No assigned work location found for employee."
      };
    }

    const activeLocations = locations.filter((loc) => loc.isActive);
    if (activeLocations.length === 0) {
      return {
        verified: false,
        status: LocationVerificationStatus.LOCATION_DISABLED,
        distanceMeters: null,
        accuracyMeters: accuracy,
        matchedLocationId: locations[0]?.id ?? null,
        matchedLocationName: locations[0]?.name ?? null,
        reason: "All assigned work locations are currently disabled."
      };
    }

    // Sort: priority locations first
    const sortedLocations = [...activeLocations].sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return 0;
    });

    const evaluated = sortedLocations.map((loc) => {
      const distance = LocationVerificationEngine.calculateDistance(latitude, longitude, loc.latitude, loc.longitude);
      const isInside = distance <= loc.radiusMeters;
      const isAccurate = accuracy <= loc.maxAccuracyMeters;
      return { loc, distance, isInside, isAccurate };
    });

    // Check if user is inside any assigned location
    const matchedInside = evaluated.find((e) => e.isInside);
    if (matchedInside) {
      if (!matchedInside.isAccurate) {
        return {
          verified: false,
          status: LocationVerificationStatus.ACCURACY_TOO_LOW,
          distanceMeters: matchedInside.distance,
          accuracyMeters: accuracy,
          matchedLocationId: matchedInside.loc.id,
          matchedLocationName: matchedInside.loc.name,
          reason: `GPS accuracy too low (${Math.round(accuracy)}m). Required: <= ${matchedInside.loc.maxAccuracyMeters}m.`
        };
      }

      return {
        verified: true,
        status: LocationVerificationStatus.VERIFIED,
        distanceMeters: matchedInside.distance,
        accuracyMeters: accuracy,
        matchedLocationId: matchedInside.loc.id,
        matchedLocationName: matchedInside.loc.name,
        reason: `Inside ${matchedInside.loc.name} radius (${Math.round(matchedInside.distance)}m from center, radius: ${matchedInside.loc.radiusMeters}m).`
      };
    }

    // Outside radius: find the closest location
    evaluated.sort((a, b) => a.distance - b.distance);
    const closest = evaluated[0];
    if (!closest) {
      return {
        verified: false,
        status: LocationVerificationStatus.OUTSIDE_RADIUS,
        distanceMeters: null,
        accuracyMeters: accuracy,
        matchedLocationId: null,
        matchedLocationName: null,
        reason: "Outside assigned location radius."
      };
    }
    const deficit = Math.round(closest.distance - closest.loc.radiusMeters);

    return {
      verified: false,
      status: LocationVerificationStatus.OUTSIDE_RADIUS,
      distanceMeters: closest.distance,
      accuracyMeters: accuracy,
      matchedLocationId: closest.loc.id,
      matchedLocationName: closest.loc.name,
      reason: `Outside radius of ${closest.loc.name} by ${deficit}m (Distance: ${Math.round(closest.distance)}m, Allowed: ${closest.loc.radiusMeters}m).`
    };
  }
}
