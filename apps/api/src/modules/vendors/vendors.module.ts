import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { VendorsController } from "./vendors.controller.js";
import { VendorsService } from "./vendors.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService]
})
export class VendorsModule {}
