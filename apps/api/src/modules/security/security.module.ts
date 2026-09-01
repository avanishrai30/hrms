import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { RateLimiterGuard } from "./rate-limiter.guard.js";
import { SecurityController } from "./security.controller.js";
import { SecurityService } from "./security.service.js";
import { SessionMonitorService } from "./session-monitor.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    SessionMonitorService,
    RateLimiterGuard
  ],
  exports: [
    SecurityService,
    SessionMonitorService,
    RateLimiterGuard
  ]
})
export class SecurityModule {}
