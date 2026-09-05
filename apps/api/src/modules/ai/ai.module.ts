import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { StorageModule } from "../storage/storage.module.js";
import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";
import { PredictionEngine } from "./engines/prediction.engine.js";
import { InsightsEngine } from "./engines/insights.engine.js";
import { ConversationMemoryService } from "./memory/conversation-memory.service.js";
import { AI_PROVIDER } from "./providers/ai-provider.interface.js";
import { OllamaProvider } from "./providers/ollama.provider.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { OpenAiProvider } from "./providers/openai.provider.js";
import { LocalAiProvider } from "./providers/local-ai.provider.js";
import { AiSecurityService } from "./services/ai-security.service.js";
import { KnowledgeBaseService } from "./services/knowledge-base.service.js";
import { DocumentAiService } from "./services/document-ai.service.js";
import { NaturalLanguageReportsService } from "./services/natural-language-reports.service.js";
import { AiContextBuilderService } from "./services/ai-context-builder.service.js";
import { AiToolRegistryService } from "./tools/ai-tool-registry.service.js";

@Module({
  imports: [PrismaModule, AuditModule, StorageModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiContextBuilderService,
    AiToolRegistryService,
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
    OllamaProvider,
    {
      provide: AI_PROVIDER,
      useFactory: () => {
        const selected = (process.env.AI_PROVIDER || "ollama").toLowerCase();
        switch (selected) {
          case "gemini":
            return new GeminiProvider();
          case "local":
            return new LocalAiProvider();
          case "ollama":
          default:
            return new OllamaProvider();
        }
      }
    }
  ],
  exports: [
    AiService,
    AiContextBuilderService,
    AiToolRegistryService,
    PredictionEngine,
    InsightsEngine,
    KnowledgeBaseService,
    DocumentAiService,
    NaturalLanguageReportsService,
    AiSecurityService,
    OllamaProvider,
    AI_PROVIDER
  ]
})
export class AiModule {}
