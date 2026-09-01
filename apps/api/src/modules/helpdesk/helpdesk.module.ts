import { Module } from "@nestjs/common";
import { HelpdeskController } from "./helpdesk.controller.js";
import { HelpdeskService } from "./helpdesk.service.js";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [HelpdeskController],
  providers: [HelpdeskService],
  exports: [HelpdeskService]
})
export class HelpdeskModule {}
