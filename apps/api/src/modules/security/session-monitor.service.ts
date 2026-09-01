import { Injectable, Logger } from "@nestjs/common";
import { type Prisma, type SeverityLevel, type SuspiciousActivityType } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface RapidTravelCheckInput {
  tenantId: string;
  userId: string;
  currentCoords: GeoCoordinate;
  previousCoords?: GeoCoordinate;
  previousTimestamp?: Date;
  currentTimestamp?: Date;
}

export interface LocationSpoofCheckInput {
  tenantId: string;
  userId: string;
  accuracyMeters: number;
  isMockLocation?: boolean;
  isVpnDetected?: boolean;
  gpsCountry?: string;
  ipCountry?: string;
  metadata?: Record<string, unknown>;
}

export interface MultiDeviceCheckInput {
  tenantId: string;
  userId: string;
  currentFingerprint: string;
  currentIp: string;
}

@Injectable()
export class SessionMonitorService {
  private readonly logger = new Logger(SessionMonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  /**
   * Calculates Haversine distance in kilometers between two geo-coordinates
   */
  calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Detects rapid travel anomaly where user appears in geographically distant
   * locations in a physically impossible time window (e.g. > 900 km/h).
   */
  async detectRapidTravel(input: RapidTravelCheckInput) {
    const now = input.currentTimestamp ?? new Date();

    let prevCoords = input.previousCoords;
    let prevTime = input.previousTimestamp;

    if (!prevCoords || !prevTime) {
      // Look up previous location verification or session
      const lastVerification = await this.prisma.locationVerification.findFirst({
        where: {
          tenantId: input.tenantId,
          employee: {
            memberships: {
              some: { userId: input.userId }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      if (lastVerification) {
        prevCoords = {
          latitude: lastVerification.latitude,
          longitude: lastVerification.longitude
        };
        prevTime = lastVerification.createdAt;
      }
    }

    if (!prevCoords || !prevTime) {
      return { isAnomaly: false };
    }

    const distanceKm = this.calculateDistanceKm(
      prevCoords.latitude,
      prevCoords.longitude,
      input.currentCoords.latitude,
      input.currentCoords.longitude
    );

    const timeDiffHours = Math.max(0.001, (now.getTime() - prevTime.getTime()) / (1000 * 60 * 60));
    const speedKmh = distanceKm / timeDiffHours;

    // Threshold: > 900 km/h speed for distances > 50km
    if (distanceKm > 50 && speedKmh > 900) {
      const severity: SeverityLevel = speedKmh > 2000 ? "CRITICAL" : "HIGH";
      const details = {
        distanceKm: Math.round(distanceKm),
        timeDiffMinutes: Math.round(timeDiffHours * 60),
        estimatedSpeedKmh: Math.round(speedKmh),
        previousCoords: prevCoords,
        currentCoords: input.currentCoords,
        previousTimestamp: prevTime.toISOString()
      };

      const record = await this.recordSuspiciousActivity({
        tenantId: input.tenantId,
        userId: input.userId,
        activityType: "RAPID_TRAVEL",
        severity,
        details
      });

      this.logger.warn(
        `[SessionMonitor] Rapid travel detected for user ${input.userId} in tenant ${input.tenantId}: ${Math.round(distanceKm)}km in ${Math.round(timeDiffHours * 60)}min (${Math.round(speedKmh)} km/h)`
      );

      return {
        isAnomaly: true,
        activityId: record.id,
        severity,
        details
      };
    }

    return {
      isAnomaly: false,
      distanceKm: Math.round(distanceKm),
      speedKmh: Math.round(speedKmh)
    };
  }

  /**
   * Detects location spoofing through mock GPS provider flags, accuracy anomalies, or country mismatches
   */
  async detectLocationSpoof(input: LocationSpoofCheckInput) {
    const reasons: string[] = [];
    let severity: SeverityLevel = "LOW";

    if (input.isMockLocation) {
      reasons.push("Mock GPS location provider detected");
      severity = "HIGH";
    }

    if (input.accuracyMeters > 5000) {
      reasons.push(`Infeasible GPS accuracy radius: ${input.accuracyMeters}m`);
      if (severity === "LOW") {
        severity = "MEDIUM";
      }
    }

    if (input.gpsCountry && input.ipCountry && input.gpsCountry !== input.ipCountry) {
      reasons.push(`Country mismatch: GPS (${input.gpsCountry}) vs IP (${input.ipCountry})`);
      severity = "HIGH";
    }

    if (input.isVpnDetected) {
      reasons.push("VPN or anonymizing proxy detected");
      severity = "HIGH";
    }

    if (reasons.length > 0) {
      const details = {
        reasons,
        accuracyMeters: input.accuracyMeters,
        isMockLocation: input.isMockLocation,
        isVpnDetected: input.isVpnDetected,
        gpsCountry: input.gpsCountry,
        ipCountry: input.ipCountry,
        metadata: input.metadata ?? {}
      };

      const record = await this.recordSuspiciousActivity({
        tenantId: input.tenantId,
        userId: input.userId,
        activityType: "LOCATION_SPOOF",
        severity,
        details
      });

      this.logger.warn(
        `[SessionMonitor] Location spoofing detected for user ${input.userId}: ${reasons.join(", ")}`
      );

      return {
        isAnomaly: true,
        activityId: record.id,
        severity,
        reasons
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Detects multiple simultaneous active sessions across distinct devices/IPs
   */
  async detectMultiDeviceAnomaly(input: MultiDeviceCheckInput) {
    const recentWindow = new Date(Date.now() - 15 * 60 * 1000); // last 15 minutes

    const activeSessions = await this.prisma.session.findMany({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        expiresAt: { gt: new Date() },
        revokedAt: null,
        createdAt: { gte: recentWindow }
      }
    });

    const distinctDevices = new Set(activeSessions.map((s) => s.deviceFingerprint));
    const distinctIps = new Set(activeSessions.map((s) => s.ipAddress).filter(Boolean));

    distinctDevices.add(input.currentFingerprint);
    if (input.currentIp) distinctIps.add(input.currentIp);

    if (distinctDevices.size >= 4 || distinctIps.size >= 4) {
      const severity: SeverityLevel = distinctDevices.size >= 6 ? "CRITICAL" : "HIGH";
      const details = {
        distinctDevicesCount: distinctDevices.size,
        distinctIpsCount: distinctIps.size,
        sessionCount: activeSessions.length + 1,
        detectedFingerprints: Array.from(distinctDevices),
        detectedIps: Array.from(distinctIps)
      };

      const record = await this.recordSuspiciousActivity({
        tenantId: input.tenantId,
        userId: input.userId,
        activityType: "MULTI_DEVICE",
        severity,
        details
      });

      this.logger.warn(
        `[SessionMonitor] Multi-device anomaly for user ${input.userId}: ${distinctDevices.size} devices and ${distinctIps.size} IPs in 15min`
      );

      return {
        isAnomaly: true,
        activityId: record.id,
        severity,
        details
      };
    }

    return {
      isAnomaly: false,
      distinctDevicesCount: distinctDevices.size,
      distinctIpsCount: distinctIps.size
    };
  }

  /**
   * Detects logins or actions occurring at unusual hours (1:00 AM to 5:00 AM)
   */
  async detectUnusualHours(tenantId: string, userId: string, timestamp = new Date()) {
    const hour = timestamp.getHours();

    if (hour >= 1 && hour <= 4) {
      const details = {
        hour,
        timestamp: timestamp.toISOString(),
        message: `Activity recorded during unusual early morning hours (${hour}:00)`
      };

      const record = await this.recordSuspiciousActivity({
        tenantId,
        userId,
        activityType: "UNUSUAL_HOURS",
        severity: "LOW",
        details
      });

      return {
        isAnomaly: true,
        activityId: record.id,
        severity: "LOW" as const,
        hour
      };
    }

    return { isAnomaly: false };
  }

  /**
   * Helper to write to SuspiciousActivity table and audit log
   */
  async recordSuspiciousActivity(input: {
    tenantId: string;
    userId: string;
    activityType: SuspiciousActivityType;
    severity: SeverityLevel;
    details: Record<string, unknown>;
  }) {
    const record = await this.prisma.suspiciousActivity.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        activityType: input.activityType,
        severity: input.severity,
        details: input.details as Prisma.InputJsonValue,
        isResolved: false
      }
    });

    await this.auditService.record({
      tenantId: input.tenantId,
      actorUserId: input.userId,
      action: "security.suspicious_activity_flagged",
      resourceType: "SuspiciousActivity",
      resourceId: record.id,
      after: {
        activityType: input.activityType,
        severity: input.severity,
        details: input.details as Prisma.InputJsonValue
      } as Prisma.InputJsonValue
    });

    return record;
  }
}
