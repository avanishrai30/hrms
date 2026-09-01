import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { LocationsController } from "./locations.controller.js";
import { LocationsService } from "./locations.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService]
})
export class LocationsModule {}
