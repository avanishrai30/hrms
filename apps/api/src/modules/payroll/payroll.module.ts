import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { CompensationModule } from "../compensation/compensation.module.js";
import { LeavesModule } from "../leaves/leaves.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PayrollController } from "./payroll.controller.js";
import { PayrollService } from "./payroll.service.js";

@Module({
  imports: [PrismaModule, AuditModule, LeavesModule, CompensationModule],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService]
})
export class PayrollModule {}
