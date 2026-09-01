import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { NotificationModule } from "../notifications/notification.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { StorageModule } from "../storage/storage.module.js";
import { EssController } from "./ess.controller.js";
import { EssService } from "./ess.service.js";
import { AnnouncementService } from "./services/announcement.service.js";
import { DocumentVaultService } from "./services/document-vault.service.js";
import { EmployeeRequestService } from "./services/employee-request.service.js";
import { IdCardService } from "./services/id-card.service.js";

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    NotificationModule,
    StorageModule
  ],
  controllers: [EssController],
  providers: [
    EssService,
    DocumentVaultService,
    EmployeeRequestService,
    AnnouncementService,
    IdCardService
  ],
  exports: [
    EssService,
    DocumentVaultService,
    EmployeeRequestService,
    AnnouncementService,
    IdCardService
  ]
})
export class EssModule {}
