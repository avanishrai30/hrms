import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { QueueModule } from "../queue/queue.module.js";
import { AiModule } from "../ai/ai.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [PrismaModule, AuditModule, QueueModule, AiModule],
  controllers: [HealthController]
})
export class HealthModule {}
