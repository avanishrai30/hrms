import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { QueueModule } from "../queue/queue.module.js";
import { StorageModule } from "../storage/storage.module.js";
import { AnalyticsController } from "./analytics.controller.js";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsEngine } from "./engines/analytics.engine.js";
import { DashboardEngine } from "./engines/dashboard.engine.js";
import { ExportEngine } from "./engines/export.engine.js";
import { ReportEngine } from "./engines/report.engine.js";

@Module({
  imports: [PrismaModule, AuditModule, QueueModule, StorageModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsEngine,
    ReportEngine,
    DashboardEngine,
    ExportEngine
  ],
  exports: [
    AnalyticsService,
    AnalyticsEngine,
    ReportEngine,
    DashboardEngine,
    ExportEngine
  ]
})
export class AnalyticsModule {}
