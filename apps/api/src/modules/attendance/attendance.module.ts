import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { FaceModule } from "../face/face.module.js";
import { LocationsModule } from "../locations/locations.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AttendanceController } from "./attendance.controller.js";
import { AttendanceService } from "./attendance.service.js";

@Module({
  imports: [PrismaModule, AuditModule, LocationsModule, FaceModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {}
