import { Injectable, Logger } from "@nestjs/common";
import type { AiChatOptions, AiChatResult, AIProvider } from "./ai-provider.interface.js";
import { LocalAiProvider } from "./local-ai.provider.js";

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly fallback: LocalAiProvider;

  constructor() {
    this.fallback = new LocalAiProvider();
  }

  async checkHealth() {
    return {
      status: process.env.GEMINI_API_KEY ? ("ok" as const) : ("degraded" as const),
      provider: "gemini",
      model: "gemini-1.5-flash",
      reachable: Boolean(process.env.GEMINI_API_KEY),
      latencyMs: 1
    };
  }

  async chat(prompt: string, options?: AiChatOptions): Promise<AiChatResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.debug("GEMINI_API_KEY missing, routing to local fallback provider");
      return this.fallback.chat(prompt, options);
    }

    try {
      const model = options?.model || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (options?.systemPrompt) {
        contents.push({ role: "user", parts: [{ text: `System Instructions: ${options.systemPrompt}` }] });
        contents.push({ role: "model", parts: [{ text: "Understood. I will strictly follow these instructions." }] });
      }

      if (options?.history) {
        for (const msg of options.history) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          });
        }
      }

      contents.push({ role: "user", parts: [{ text: prompt }] });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? 2048
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        usageMetadata?: { totalTokenCount?: number };
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const tokens = data.usageMetadata?.totalTokenCount || (Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4));

      return {
        content: text,
        tokensUsed: tokens,
        model
      };
    } catch (err: unknown) {
      this.logger.warn(`Gemini API call failed, using fallback: ${err instanceof Error ? err.message : String(err)}`);
      return this.fallback.chat(prompt, options);
    }
  }

  async summarize(text: string, maxWords = 100): Promise<string> {
    try {
      const res = await this.chat(`Summarize the following text concisely in less than ${maxWords} words:\n\n${text}`);
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
