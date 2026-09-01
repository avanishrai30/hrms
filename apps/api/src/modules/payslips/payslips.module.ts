import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { StorageModule } from "../storage/storage.module.js";
import {
  EMAIL_PROVIDER,
  LocalQueueEmailProvider
} from "./distribution/email.provider.js";
import { PayslipsController } from "./payslips.controller.js";
import { PayslipsService } from "./payslips.service.js";

@Module({
  imports: [PrismaModule, AuditModule, StorageModule],
  controllers: [PayslipsController],
  providers: [
    PayslipsService,
    {
      provide: EMAIL_PROVIDER,
      useClass: LocalQueueEmailProvider
    }
  ],
  exports: [PayslipsService, EMAIL_PROVIDER]
})
export class PayslipsModule {}
