import { Module } from "@nestjs/common";
import { WorkforceOperationsController } from "./workforce-operations.controller.js";
import { WorkforceOperationsService } from "./workforce-operations.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [WorkforceOperationsController],
  providers: [WorkforceOperationsService],
  exports: [WorkforceOperationsService]
})
export class WorkforceOperationsModule {}
