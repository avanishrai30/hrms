import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  FaceEnrollmentStatus,
  FaceProfileStatus,
  FaceVerificationStatus,
  type Prisma
} from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { FaceRecognitionEngine } from "./face-recognition.engine.js";
import {
  FACE_DETECTION_PROVIDER,
  FACE_EMBEDDING_PROVIDER,
  FACE_VERIFICATION_PROVIDER,
  LIVENESS_PROVIDER,
  type FaceDetectionProvider,
  type FaceEmbeddingProvider,
  type FaceVerificationProvider,
  type LivenessProvider
} from "./providers/biometric-provider.interface.js";
import type {
  BiometricAuditFilterDto,
  EnrollFaceDto,
  ReviewEnrollmentDto,
  VerifyFaceDto
} from "./face.schemas.js";

@Injectable()
export class FaceService {
  private readonly secretKey: string;
  private readonly defaultModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
    @Inject(FACE_DETECTION_PROVIDER)
    private readonly detectionProvider: FaceDetectionProvider,
    @Inject(FACE_EMBEDDING_PROVIDER)
    private readonly embeddingProvider: FaceEmbeddingProvider,
    @Inject(FACE_VERIFICATION_PROVIDER)
    private readonly verificationProvider: FaceVerificationProvider,
    @Inject(LIVENESS_PROVIDER)
    private readonly livenessProvider: LivenessProvider
  ) {
    this.secretKey =
      this.configService.get<string>("BIOMETRIC_SECRET_KEY") ?? "vc-wms-biometrics-secure-key-default";
    this.defaultModel =
      this.configService.get<string>("DEEPFACE_DEFAULT_MODEL") ?? "Facenet512";
  }

  /**
   * Get employee face profile status
   */
  async getFaceProfile(tenantId: string, employeeId: string) {
    const profile = await this.prisma.faceProfile.findFirst({
      where: { tenantId, employeeId },
      include: {
        employee: { select: { id: true, employeeCode: true, fullName: true } },
        embeddings: {
          where: { isActive: true },
          select: { id: true, modelVersion: true, dimensions: true, confidenceThreshold: true, createdAt: true }
        }
      }
    });

    if (!profile) {
      return null;
    }

    return profile;
  }

  /**
   * Submit face enrollment or re-enrollment
   */
  async submitEnrollment(
    tenantId: string,
    employeeId: string,
    input: EnrollFaceDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, tenantId } });
    if (!employee) {
      throw new NotFoundException("Employee not found.");
    }

    // Step 1: Dedicated Anti-Spoof Liveness & Quality Evaluation via LivenessProvider
    const liveness = await this.livenessProvider.evaluateLiveness(input.imageBase64);
    if (!liveness.passed) {
      await this.prisma.livenessVerification.create({
        data: {
          tenantId,
          employeeId,
          status: liveness.status,
          livenessScore: liveness.livenessScore,
          checksPerformed: liveness.checksPerformed,
          reason: liveness.reason
        }
      });
      throw new BadRequestException(`Enrollment failed liveness validation: ${liveness.reason}`);
    }

    // Step 2: Face Detection check via FaceDetectionProvider
    await this.detectionProvider.detect(input.imageBase64);

    // Step 3: Extract Embedding Vector via FaceEmbeddingProvider
    const embeddingResult = await this.embeddingProvider.generateEmbedding(input.imageBase64, {
      modelName: this.defaultModel
    });

    // Step 4: Encrypt vector using AES-256-GCM before DB persistence
    const encryptedEmbedding = FaceRecognitionEngine.encryptEmbedding(
      embeddingResult.embedding,
      this.secretKey
    );

    // Step 5: Transactional profile & enrollment persistence
    const enrollment = await this.prisma.$transaction(async (tx) => {
      const existingProfile = await tx.faceProfile.findFirst({ where: { tenantId, employeeId } });
      const nextVersion = existingProfile ? existingProfile.version + 1 : 1;

      // Upsert profile in ACTIVE status
      const profile = await tx.faceProfile.upsert({
        where: { tenantId_employeeId: { tenantId, employeeId } },
        create: {
          tenantId,
          employeeId,
          status: FaceProfileStatus.ACTIVE,
          version: nextVersion,
          enrolledAt: new Date()
        },
        update: {
          status: FaceProfileStatus.ACTIVE,
          version: nextVersion,
          enrolledAt: new Date()
        }
      });

      // Mark old embeddings inactive
      await tx.faceEmbedding.updateMany({
        where: { tenantId, faceProfileId: profile.id },
        data: { isActive: false }
      });

      // Store new encrypted embedding with model metadata
      await tx.faceEmbedding.create({
        data: {
          tenantId,
          faceProfileId: profile.id,
          modelVersion: embeddingResult.modelVersion,
          dimensions: embeddingResult.dimensions,
          encryptedEmbedding,
          confidenceThreshold: FaceRecognitionEngine.DEFAULT_CONFIDENCE_THRESHOLD,
          isActive: true
        }
      });

      // Record enrollment audit entry
      const createdEnrollment = await tx.faceEnrollment.create({
        data: {
          tenantId,
          employeeId,
          faceProfileId: profile.id,
          qualityScore: liveness.qualityScore,
          livenessScore: liveness.livenessScore,
          status: FaceEnrollmentStatus.APPROVED,
          version: nextVersion,
          reason: input.reason ?? `DeepFace (${embeddingResult.modelVersion}) enrollment completed`,
          enrolledByUserId: actorUserId,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });

      // Employee timeline
      await tx.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "face.enrolled",
          entityType: "face_profile",
          entityId: profile.id,
          message: `Biometric face profile v${nextVersion} enrolled (${embeddingResult.modelVersion})`,
          metadata: {
            version: nextVersion,
            modelVersion: embeddingResult.modelVersion,
            qualityScore: liveness.qualityScore,
            livenessScore: liveness.livenessScore
          }
        }
      });

      return createdEnrollment;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "face.enrolled",
      resourceType: "face_profile",
      resourceId: enrollment.id,
      after: {
        employeeId,
        version: enrollment.version,
        qualityScore: liveness.qualityScore,
        modelVersion: embeddingResult.modelVersion
      }
    });

    return enrollment;
  }

  /**
   * Review pending enrollment
   */
  async reviewEnrollment(
    tenantId: string,
    enrollmentId: string,
    input: ReviewEnrollmentDto,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const enrollment = await this.prisma.faceEnrollment.findFirst({
      where: { id: enrollmentId, tenantId }
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment record not found.");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const reviewed = await tx.faceEnrollment.update({
        where: { id: enrollmentId },
        data: {
          status: input.status === "APPROVED" ? FaceEnrollmentStatus.APPROVED : FaceEnrollmentStatus.REJECTED,
          reviewNote: input.reviewNote,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      });

      if (input.status === "APPROVED" && enrollment.faceProfileId) {
        await tx.faceProfile.update({
          where: { id: enrollment.faceProfileId },
          data: { status: FaceProfileStatus.ACTIVE }
        });
      }

      return reviewed;
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "face.enrollment.reviewed",
      resourceType: "face_enrollment",
      resourceId: enrollment.id,
      after: { status: updated.status, reviewNote: input.reviewNote }
    });

    return updated;
  }

  /**
   * Verify face image against employee active profile using FaceVerificationProvider
   */
  async verifyFace(
    tenantId: string,
    employeeId: string,
    input: VerifyFaceDto,
    _actorUserId?: string
  ) {
    const profile = await this.prisma.faceProfile.findFirst({
      where: { tenantId, employeeId, status: FaceProfileStatus.ACTIVE },
      include: {
        embeddings: { where: { isActive: true } }
      }
    });

    // Check active profile existence
    if (!profile || profile.embeddings.length === 0) {
      const failed = await this.prisma.faceVerification.create({
        data: {
          tenantId,
          employeeId,
          attendanceId: input.attendanceId,
          status: FaceVerificationStatus.NO_ACTIVE_PROFILE,
          confidenceScore: 0.0,
          thresholdUsed: FaceRecognitionEngine.DEFAULT_CONFIDENCE_THRESHOLD,
          reason: "No active face biometric profile enrolled for employee."
        }
      });

      return {
        matched: false,
        status: FaceVerificationStatus.NO_ACTIVE_PROFILE,
        confidenceScore: 0.0,
        livenessScore: 0.0,
        reason: failed.reason
      };
    }

    // Step 1: Dedicated Anti-Spoof Liveness check via LivenessProvider
    const liveness = await this.livenessProvider.evaluateLiveness(input.imageBase64);
    const livenessRecord = await this.prisma.livenessVerification.create({
      data: {
        tenantId,
        employeeId,
        status: liveness.status,
        livenessScore: liveness.livenessScore,
        checksPerformed: liveness.checksPerformed,
        reason: liveness.reason
      }
    });

    if (!liveness.passed) {
      const verificationRecord = await this.prisma.faceVerification.create({
        data: {
          tenantId,
          employeeId,
          attendanceId: input.attendanceId,
          faceProfileId: profile.id,
          status: FaceVerificationStatus.SPOOF_DETECTED,
          confidenceScore: 0.0,
          thresholdUsed:
            profile.embeddings[0]?.confidenceThreshold ?? FaceRecognitionEngine.DEFAULT_CONFIDENCE_THRESHOLD,
          reason: `Liveness failed: ${liveness.reason}`
        }
      });

      await this.prisma.livenessVerification.update({
        where: { id: livenessRecord.id },
        data: { faceVerificationId: verificationRecord.id }
      });

      return {
        matched: false,
        status: FaceVerificationStatus.SPOOF_DETECTED,
        confidenceScore: 0.0,
        livenessScore: liveness.livenessScore,
        reason: verificationRecord.reason
      };
    }

    // Step 2: Facial Vector Verification via FaceVerificationProvider
    const activeEmbedding = profile.embeddings[0];
    if (!activeEmbedding) {
      throw new BadRequestException("No active embedding found.");
    }

    const verificationResult = await this.verificationProvider.verify(
      input.imageBase64,
      activeEmbedding.encryptedEmbedding,
      {
        modelName: activeEmbedding.modelVersion,
        threshold: activeEmbedding.confidenceThreshold
      }
    );

    // Step 3: Record verification attempt with model and threshold metadata
    const verificationRecord = await this.prisma.faceVerification.create({
      data: {
        tenantId,
        employeeId,
        attendanceId: input.attendanceId,
        faceProfileId: profile.id,
        status: verificationResult.status,
        confidenceScore: verificationResult.confidenceScore,
        thresholdUsed: verificationResult.thresholdUsed,
        reason: verificationResult.reason,
        metadata: {
          modelVersion: verificationResult.modelVersion,
          distanceMetric: verificationResult.distanceMetric,
          distance: verificationResult.distance
        } as Prisma.InputJsonValue
      }
    });

    await this.prisma.livenessVerification.update({
      where: { id: livenessRecord.id },
      data: { faceVerificationId: verificationRecord.id }
    });

    if (verificationResult.matched) {
      await this.prisma.faceProfile.update({
        where: { id: profile.id },
        data: { lastVerifiedAt: new Date() }
      });
    }

    return {
      matched: verificationResult.matched,
      status: verificationResult.status,
      confidenceScore: verificationResult.confidenceScore,
      livenessScore: liveness.livenessScore,
      reason: verificationResult.reason
    };
  }

  /**
   * Disable/Suspend face profile
   */
  async disableFaceProfile(
    tenantId: string,
    profileId: string,
    actorUserId: string,
    actorMembershipId?: string
  ) {
    const profile = await this.prisma.faceProfile.findFirst({ where: { id: profileId, tenantId } });
    if (!profile) {
      throw new NotFoundException("Face profile not found.");
    }

    const updated = await this.prisma.faceProfile.update({
      where: { id: profileId },
      data: { status: FaceProfileStatus.SUSPENDED }
    });

    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "face.profile.disabled",
      resourceType: "face_profile",
      resourceId: profile.id,
      after: { status: updated.status }
    });

    return updated;
  }

  /**
   * List enrollments queue
   */
  async listEnrollments(
    tenantId: string,
    filters: { employeeId?: string; status?: FaceEnrollmentStatus; page?: number; limit?: number }
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;

    const where: Prisma.FaceEnrollmentWhereInput = {
      tenantId,
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.status ? { status: filters.status } : {})
    };

    const [enrollments, total] = await Promise.all([
      this.prisma.faceEnrollment.findMany({
        where,
        include: {
          employee: { select: { id: true, employeeCode: true, fullName: true } },
          enrolledBy: { select: { email: true } },
          reviewedBy: { select: { email: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.faceEnrollment.count({ where })
    ]);

    return { enrollments, total, page, limit };
  }

  /**
   * List biometric verifications / audits
   */
  async listVerifications(tenantId: string, filters: BiometricAuditFilterDto) {
    const where: Prisma.FaceVerificationWhereInput = {
      tenantId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {})
    };

    const [verifications, total] = await Promise.all([
      this.prisma.faceVerification.findMany({
        where,
        include: {
          employee: { select: { id: true, employeeCode: true, fullName: true } },
          livenessVerifications: true
        },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.faceVerification.count({ where })
    ]);

    return { verifications, total, page: filters.page, limit: filters.limit };
  }
}
