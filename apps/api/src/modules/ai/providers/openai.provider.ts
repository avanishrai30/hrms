import { Injectable, Logger } from "@nestjs/common";
import type { AiChatOptions, AiChatResult, AIProvider } from "./ai-provider.interface.js";
import { LocalAiProvider } from "./local-ai.provider.js";

@Injectable()
export class OpenAiProvider implements AIProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly fallback: LocalAiProvider;

  constructor() {
    this.fallback = new LocalAiProvider();
  }

  async chat(prompt: string, options?: AiChatOptions): Promise<AiChatResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.debug("OPENAI_API_KEY missing, routing to local fallback provider");
      return this.fallback.chat(prompt, options);
    }

    try {
      const model = options?.model || "gpt-4o-mini";
      const messages: Array<{ role: string; content: string }> = [];

      if (options?.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }

      if (options?.history) {
        for (const msg of options.history) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 2048
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API HTTP ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };
      const text = data.choices?.[0]?.message?.content || "";
      const tokens = data.usage?.total_tokens || (Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4));

      return {
        content: text,
        tokensUsed: tokens,
        model
      };
    } catch (err: unknown) {
      this.logger.warn(`OpenAI API call failed, using fallback: ${err instanceof Error ? err.message : String(err)}`);
      return this.fallback.chat(prompt, options);
    }
  }

  async summarize(text: string, maxWords = 100): Promise<string> {
    try {
      const res = await this.chat(`Summarize this text in less than ${maxWords} words:\n\n${text}`);
      return res.content;
    } catch {
      return this.fallback.summarize(text, maxWords);
    }
  }

  async classify(text: string, candidateLabels: string[]): Promise<{ label: string; confidence: number }> {
    return this.fallback.classify(text, candidateLabels);
  }

  async extract<T = Record<string, unknown>>(text: string, schemaDescription: string): Promise<T> {
    return this.fallback.extract<T>(text, schemaDescription);
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    return this.fallback.generateEmbeddings(text);
  }
}
