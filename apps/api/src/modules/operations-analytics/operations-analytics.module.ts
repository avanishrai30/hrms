import { Module } from "@nestjs/common";
import { OperationsAnalyticsController } from "./operations-analytics.controller.js";
import { OperationsAnalyticsService } from "./operations-analytics.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule],
  controllers: [OperationsAnalyticsController],
  providers: [OperationsAnalyticsService],
  exports: [OperationsAnalyticsService]
})
export class OperationsAnalyticsModule {}
