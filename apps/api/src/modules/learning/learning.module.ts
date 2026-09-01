import { Module } from "@nestjs/common";
import { LearningController } from "./learning.controller.js";
import { LearningService } from "./learning.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService]
})
export class LearningModule {}
