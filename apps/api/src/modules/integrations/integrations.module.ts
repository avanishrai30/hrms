import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { QueueModule } from "../queue/queue.module.js";
import { IntegrationsController } from "./integrations.controller.js";
import { IntegrationsService } from "./integrations.service.js";

@Module({
  imports: [PrismaModule, AuditModule, QueueModule, AiModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService]
})
export class IntegrationsModule {}
