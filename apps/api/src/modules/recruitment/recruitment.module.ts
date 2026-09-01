import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { StorageModule } from "../storage/storage.module.js";
import { AiModule } from "../ai/ai.module.js";
import { RecruitmentController } from "./recruitment.controller.js";
import { PublicCareersController } from "./public-careers.controller.js";
import { RecruitmentService } from "./recruitment.service.js";
import { ResumeParserEngine } from "./engines/resume-parser.engine.js";
import { CandidateEvaluationEngine } from "./engines/evaluation.engine.js";
import { AiRecruitmentEngine } from "./engines/ai-recruitment.engine.js";
import { OnboardingIntegrationService } from "./engines/onboarding-integration.service.js";
import { RecruitmentAnalyticsService } from "./engines/recruitment-analytics.service.js";

@Module({
  imports: [PrismaModule, AuditModule, StorageModule, AiModule],
  controllers: [RecruitmentController, PublicCareersController],
  providers: [
    RecruitmentService,
    ResumeParserEngine,
    CandidateEvaluationEngine,
    AiRecruitmentEngine,
    OnboardingIntegrationService,
    RecruitmentAnalyticsService
  ],
  exports: [
    RecruitmentService,
    ResumeParserEngine,
    CandidateEvaluationEngine,
    AiRecruitmentEngine,
    OnboardingIntegrationService,
    RecruitmentAnalyticsService
  ]
})
export class RecruitmentModule {}
