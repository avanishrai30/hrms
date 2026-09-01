import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { PerformanceController } from "./performance.controller.js";
import { PerformanceService } from "./performance.service.js";
import { OkrGoalEngine } from "./engines/okr-goal.engine.js";
import { Appraisal360Engine } from "./engines/appraisal-360.engine.js";
import { BellCurveCalibrationEngine } from "./engines/bell-curve-calibration.engine.js";
import { IncrementRecommendationEngine } from "./engines/increment-recommendation.engine.js";
import { PromotionReadinessEngine } from "./engines/promotion-readiness.engine.js";
import { SuccessionNineBoxEngine } from "./engines/succession-nine-box.engine.js";
import { AiPerformanceEngine } from "./engines/ai-performance.engine.js";
import { PerformanceAnalyticsService } from "./engines/performance-analytics.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PerformanceController],
  providers: [
    PerformanceService,
    OkrGoalEngine,
    Appraisal360Engine,
    BellCurveCalibrationEngine,
    IncrementRecommendationEngine,
    PromotionReadinessEngine,
    SuccessionNineBoxEngine,
    AiPerformanceEngine,
    PerformanceAnalyticsService
  ],
  exports: [
    PerformanceService,
    OkrGoalEngine,
    Appraisal360Engine,
    BellCurveCalibrationEngine,
    IncrementRecommendationEngine,
    PromotionReadinessEngine,
    SuccessionNineBoxEngine,
    AiPerformanceEngine,
    PerformanceAnalyticsService
  ]
})
export class PerformanceModule {}
