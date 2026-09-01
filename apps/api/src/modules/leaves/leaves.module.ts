import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { LeavesController } from "./leaves.controller.js";
import { LeavesService } from "./leaves.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService]
})
export class LeavesModule {}
