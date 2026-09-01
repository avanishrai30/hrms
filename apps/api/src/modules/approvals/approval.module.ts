import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ApprovalController } from "./approval.controller.js";
import { ApprovalService } from "./approval.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService]
})
export class ApprovalModule {}
