import { Module } from "@nestjs/common";
import { VisitorController } from "./visitor.controller.js";
import { VisitorService } from "./visitor.service.js";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [VisitorController],
  providers: [VisitorService],
  exports: [VisitorService]
})
export class VisitorModule {}
