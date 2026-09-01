import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { AuthController, PlatformAuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

@Module({
  imports: [AuditModule],
  controllers: [AuthController, PlatformAuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
