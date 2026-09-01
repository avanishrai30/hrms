import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { FaceController } from "./face.controller.js";
import { FaceService } from "./face.service.js";
import {
  FACE_DETECTION_PROVIDER,
  FACE_EMBEDDING_PROVIDER,
  FACE_VERIFICATION_PROVIDER,
  LIVENESS_PROVIDER
} from "./providers/biometric-provider.interface.js";
import { DeepFaceHttpBiometricProvider } from "./providers/deepface-http.provider.js";
import { LocalBiometricProvider } from "./providers/local-biometric.provider.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [FaceController],
  providers: [
    FaceService,
    LocalBiometricProvider,
    DeepFaceHttpBiometricProvider,
    {
      provide: FACE_DETECTION_PROVIDER,
      useExisting: DeepFaceHttpBiometricProvider
    },
    {
      provide: FACE_EMBEDDING_PROVIDER,
      useExisting: DeepFaceHttpBiometricProvider
    },
    {
      provide: FACE_VERIFICATION_PROVIDER,
      useExisting: DeepFaceHttpBiometricProvider
    },
    {
      provide: LIVENESS_PROVIDER,
      useExisting: DeepFaceHttpBiometricProvider
    }
  ],
  exports: [
    FaceService,
    FACE_DETECTION_PROVIDER,
    FACE_EMBEDDING_PROVIDER,
    FACE_VERIFICATION_PROVIDER,
    LIVENESS_PROVIDER
  ]
})
export class FaceModule {}
