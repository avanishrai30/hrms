import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { CompensationController } from "./compensation.controller.js";
import { CompensationService } from "./compensation.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [CompensationController],
  providers: [CompensationService],
  exports: [CompensationService]
})
export class CompensationModule {}
