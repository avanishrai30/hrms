import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { EngagementController } from "./engagement.controller.js";
import { EngagementService } from "./engagement.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService]
})
export class EngagementModule {}
