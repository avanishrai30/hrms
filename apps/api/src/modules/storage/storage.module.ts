import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { S3StorageProvider } from "./providers/s3.provider.js";
import { LocalStorageProvider, STORAGE_PROVIDER } from "./storage.provider.js";
import { StorageController } from "./storage.controller.js";

@Module({
  imports: [ConfigModule, PrismaModule, AuditModule],
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: () => {
        const s3Bucket = process.env.S3_BUCKET;
        if (s3Bucket && s3Bucket.trim().length > 0) {
          return new S3StorageProvider();
        }
        return new LocalStorageProvider();
      }
    }
  ],
  exports: [STORAGE_PROVIDER]
})
export class StorageModule {}
