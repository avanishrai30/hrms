import { Module } from "@nestjs/common";
import { AssetsController } from "./assets.controller.js";
import { AssetsService } from "./assets.service.js";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService]
})
export class AssetsModule {}
