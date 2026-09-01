import { Module } from "@nestjs/common";
import { FacilitiesController } from "./facilities.controller.js";
import { FacilitiesService } from "./facilities.service.js";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
  exports: [FacilitiesService]
})
export class FacilitiesModule {}
