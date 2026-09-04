export interface AiChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  history?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  jsonSchema?: Record<string, unknown>;
}

export interface AiChatResult {
  content: string;
  tokensUsed: number;
  model: string;
  structuredJson?: Record<string, unknown>;
}

export interface AiHealthStatus {
  status: "ok" | "degraded";
  provider: string;
  model: string;
  reachable: boolean;
  latencyMs: number;
}

export interface AIProvider {
  chat(prompt: string, options?: AiChatOptions): Promise<AiChatResult>;
  summarize(text: string, maxWords?: number): Promise<string>;
  classify(text: string, candidateLabels: string[]): Promise<{ label: string; confidence: number }>;
  extract<T = Record<string, unknown>>(text: string, schemaDescription: string): Promise<T>;
  generateEmbeddings(text: string): Promise<number[]>;
  checkHealth?(): Promise<AiHealthStatus>;
}

export const AI_PROVIDER = "AI_PROVIDER";
