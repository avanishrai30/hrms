import { Module } from "@nestjs/common";
import { ClearanceController } from "./clearance.controller.js";
import { ClearanceService } from "./clearance.service.js";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ClearanceController],
  providers: [ClearanceService],
  exports: [ClearanceService]
})
export class ClearanceModule {}
