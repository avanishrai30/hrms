import { Injectable, Logger } from "@nestjs/common";
import type { AiChatOptions, AiChatResult, AiHealthStatus, AIProvider } from "./ai-provider.interface.js";

/**
 * Typed error thrown when the Ollama runtime is unreachable or returns a
 * non-recoverable error.  Callers (AiService, etc.) should catch this and
 * translate it into an HTTP 503 for the client.
 */
export class AiProviderUnavailableError extends Error {
  public readonly code = "AI_PROVIDER_UNAVAILABLE";
  constructor(
    public readonly provider: string,
    public readonly reason: string
  ) {
    super(`AI provider "${provider}" is unavailable: ${reason}`);
    this.name = "AiProviderUnavailableError";
  }
}

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
    this.defaultModel = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
    this.timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS) || 25000;
  }

  async checkHealth(): Promise<AiHealthStatus> {
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
        provider: "ollama",
        model: this.defaultModel,
        reachable: false,
        latencyMs
      };
    } catch {
      return {
        status: "degraded",
        provider: "ollama",
        model: this.defaultModel,
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
        const body = await res.text().catch(() => "");
        throw new AiProviderUnavailableError("ollama", `HTTP ${res.status}: ${body}`);
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
      if (err instanceof AiProviderUnavailableError) {
        throw err;
      }
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ollama chat call failed: ${reason}`);
      throw new AiProviderUnavailableError("ollama", reason);
    }
  }

  async summarize(text: string, maxWords = 100): Promise<string> {
    const res = await this.chat(
      `Summarize the following text concisely in under ${maxWords} words. Provide ONLY the summary text:\n\n${text}`
    );
    if (!res.content.trim()) {
      throw new AiProviderUnavailableError("ollama", "Empty summarization response");
    }
    return res.content.trim();
  }

  async classify(text: string, candidateLabels: string[]): Promise<{ label: string; confidence: number }> {
    const labelsList = candidateLabels.join(", ");
    const prompt = `Classify the following text into exactly one of these labels: [${labelsList}].\nText: "${text}"\nReply with ONLY the exact label name.`;
    const res = await this.chat(prompt, { temperature: 0.0 });
    const chosen = res.content.trim();
    const matched = candidateLabels.find((l) => l.toLowerCase() === chosen.toLowerCase());
    if (matched) {
      return { label: matched, confidence: 0.95 };
    }
    throw new AiProviderUnavailableError(
      "ollama",
      `Classification returned unrecognized label "${chosen}"`
    );
  }

  async extract<T = Record<string, unknown>>(text: string, schemaDescription: string): Promise<T> {
    const prompt = `Extract data from the following text according to this schema:\n${schemaDescription}\n\nText: "${text}"\n\nReturn valid JSON only.`;
    const res = await this.chat(prompt, { temperature: 0.0 });
    const jsonMatch = res.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new AiProviderUnavailableError("ollama", "Extraction returned no valid JSON");
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || "all-minilm";
    try {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: embeddingModel,
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
      const body = await res.text().catch(() => "");
      throw new AiProviderUnavailableError("ollama", `Embedding HTTP ${res.status}: ${body || "empty embedding response"}`);
    } catch (err: unknown) {
      if (err instanceof AiProviderUnavailableError) {
        throw err;
      }
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ollama embedding call failed: ${reason}`);
      throw new AiProviderUnavailableError("ollama", reason);
    }
  }
}
