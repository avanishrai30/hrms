import { Module } from "@nestjs/common";
import { WorkforceController } from "./workforce.controller.js";
import { WorkforceService } from "./workforce.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [WorkforceController],
  providers: [WorkforceService],
  exports: [WorkforceService]
})
export class WorkforceModule {}
