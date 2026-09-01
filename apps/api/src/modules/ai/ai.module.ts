import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";
import { PredictionEngine } from "./engines/prediction.engine.js";
import { InsightsEngine } from "./engines/insights.engine.js";
import { ConversationMemoryService } from "./memory/conversation-memory.service.js";
import { AI_PROVIDER } from "./providers/ai-provider.interface.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { OpenAiProvider } from "./providers/openai.provider.js";
import { LocalAiProvider } from "./providers/local-ai.provider.js";
import { AiSecurityService } from "./services/ai-security.service.js";
import { KnowledgeBaseService } from "./services/knowledge-base.service.js";
import { DocumentAiService } from "./services/document-ai.service.js";
import { NaturalLanguageReportsService } from "./services/natural-language-reports.service.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AiController],
  providers: [
    AiService,
    ConversationMemoryService,
    PredictionEngine,
    InsightsEngine,
    AiSecurityService,
    KnowledgeBaseService,
    DocumentAiService,
    NaturalLanguageReportsService,
    LocalAiProvider,
    GeminiProvider,
    OpenAiProvider,
    {
      provide: AI_PROVIDER,
      useClass: GeminiProvider
    }
  ],
  exports: [
    AiService,
    PredictionEngine,
    InsightsEngine,
    KnowledgeBaseService,
    DocumentAiService,
    NaturalLanguageReportsService,
    AiSecurityService
  ]
})
export class AiModule {}
