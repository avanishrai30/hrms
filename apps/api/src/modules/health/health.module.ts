import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { QueueModule } from "../queue/queue.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [PrismaModule, AuditModule, QueueModule],
  controllers: [HealthController],
  exports: [HealthController]
})
export class HealthModule {}
