import { Injectable, Logger } from "@nestjs/common";
import type { AiChatOptions, AiChatResult, AIProvider } from "./ai-provider.interface.js";
import { LocalAiProvider } from "./local-ai.provider.js";
import { GeminiProvider } from "./gemini.provider.js";

export interface OllamaHealthStatus {
  status: "ok" | "degraded";
  provider: "ollama" | "local-fallback";
  model: string;
  reachable: boolean;
  latencyMs: number;
}

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly fallback: AIProvider;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
    this.defaultModel = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
    this.timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS) || 25000;

    // Use Gemini if configured, otherwise deterministic LocalAiProvider
    if (process.env.GEMINI_API_KEY) {
      this.fallback = new GeminiProvider();
    } else {
      this.fallback = new LocalAiProvider();
    }
  }

  async checkHealth(): Promise<OllamaHealthStatus> {
    const t0 = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(3000)
      });
      const latencyMs = Date.now() - t0;

      if (res.ok) {
        const data = (await res.json()) as { models?: Array<{ name: string }> };
        const hasModel = (data.models || []).some((m) =>
          m.name.toLowerCase().startsWith(this.defaultModel.toLowerCase().split(":")[0] || "")
        );

        return {
          status: hasModel ? "ok" : "degraded",
          provider: "ollama",
          model: this.defaultModel,
          reachable: true,
          latencyMs
        };
      }

      return {
        status: "degraded",
        provider: "local-fallback",
        model: "local-heuristic-v1",
        reachable: false,
        latencyMs
      };
    } catch {
      return {
        status: "degraded",
        provider: "local-fallback",
        model: "local-heuristic-v1",
        reachable: false,
        latencyMs: Date.now() - t0
      };
    }
  }

  async chat(prompt: string, options?: AiChatOptions): Promise<AiChatResult> {
    const model = options?.model || this.defaultModel;

    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

      if (options?.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }

      if (options?.history?.length) {
        for (const h of options.history) {
          messages.push({
            role: h.role === "assistant" ? "assistant" : h.role === "system" ? "system" : "user",
            content: h.content
          });
        }
      }

      messages.push({ role: "user", content: prompt });

      const payload: Record<string, unknown> = {
        model,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.2,
          num_predict: options?.maxTokens ?? 2048
        }
      };

      if (options?.jsonSchema) {
        payload.format = options.jsonSchema;
      }

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (!res.ok) {
        throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
      }

      const data = (await res.json()) as {
        message?: { content?: string };
        prompt_eval_count?: number;
        eval_count?: number;
        model?: string;
      };

      const content = data.message?.content || "";
      const tokensUsed = (data.prompt_eval_count || Math.ceil(prompt.length / 4)) +
        (data.eval_count || Math.ceil(content.length / 4));

      let structuredJson: Record<string, unknown> | undefined;
      if (options?.jsonSchema && content) {
        try {
          structuredJson = JSON.parse(content) as Record<string, unknown>;
        } catch {
          // Non-blocking JSON parse
        }
      }

      return {
        content,
        tokensUsed,
        model: data.model || model,
        structuredJson
      };
    } catch (err: unknown) {
      this.logger.warn(
        `Ollama chat call failed (${err instanceof Error ? err.message : String(err)}), delegating to fallback provider`
      );
      return this.fallback.chat(prompt, options);
    }
  }

  async summarize(text: string, maxWords = 100): Promise<string> {
    try {
      const res = await this.chat(
        `Summarize the following text concisely in under ${maxWords} words. Provide ONLY the summary text:\n\n${text}`
      );
      return res.content.trim() || this.fallback.summarize(text, maxWords);
    } catch {
      return this.fallback.summarize(text, maxWords);
    }
  }

  async classify(text: string, candidateLabels: string[]): Promise<{ label: string; confidence: number }> {
    try {
      const labelsList = candidateLabels.join(", ");
      const prompt = `Classify the following text into exactly one of these labels: [${labelsList}].\nText: "${text}"\nReply with ONLY the exact label name.`;
      const res = await this.chat(prompt, { temperature: 0.0 });
      const chosen = res.content.trim();
      const matched = candidateLabels.find((l) => l.toLowerCase() === chosen.toLowerCase());
      if (matched) {
        return { label: matched, confidence: 0.95 };
      }
      return this.fallback.classify(text, candidateLabels);
    } catch {
      return this.fallback.classify(text, candidateLabels);
    }
  }

  async extract<T = Record<string, unknown>>(text: string, schemaDescription: string): Promise<T> {
    try {
      const prompt = `Extract data from the following text according to this schema:\n${schemaDescription}\n\nText: "${text}"\n\nReturn valid JSON only.`;
      const res = await this.chat(prompt, { temperature: 0.0 });
      const jsonMatch = res.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return this.fallback.extract<T>(text, schemaDescription);
    } catch {
      return this.fallback.extract<T>(text, schemaDescription);
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.defaultModel,
          prompt: text
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = (await res.json()) as { embedding?: number[] };
        if (Array.isArray(data.embedding) && data.embedding.length > 0) {
          return data.embedding;
        }
      }
    } catch {
      // Fallback
    }
    return this.fallback.generateEmbeddings(text);
  }
}
