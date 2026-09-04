import { Injectable } from "@nestjs/common";
import type { AiChatOptions, AiChatResult, AIProvider } from "./ai-provider.interface.js";

@Injectable()
export class LocalAiProvider implements AIProvider {
  async checkHealth() {
    return {
      status: "ok" as const,
      provider: "local-heuristic-v1",
      model: "local-heuristic-v1",
      reachable: true,
      latencyMs: 1
    };
  }

  async chat(prompt: string, options?: AiChatOptions): Promise<AiChatResult> {
    const text = prompt.toLowerCase();
    let responseText = "I am your VC-WMS HR Intelligence Assistant. How can I help you today with attendance, leaves, payroll, or company policies?";

    if (text.includes("leave") && (text.includes("balance") || text.includes("how many") || text.includes("days"))) {
      responseText = "Based on your records, your leave balance is fully up to date. You can review and apply directly in the Leave Center.";
    } else if (text.includes("attendance") || text.includes("punch") || text.includes("shift")) {
      responseText = "Your attendance logs for this period have been retrieved from the biometrics and attendance gateway.";
    } else if (text.includes("payslip") || text.includes("salary") || text.includes("pay")) {
      responseText = "Your latest payslip is available for viewing and PDF download in the Payroll Self-Service section.";
    } else if (text.includes("manager") || text.includes("report to") || text.includes("reporting")) {
      responseText = "You can view your direct reporting manager and departmental hierarchy in the Organization Directory.";
    } else if (text.includes("holiday") || text.includes("next holiday")) {
      responseText = "Upcoming organization holidays and festival leaves are published on your holiday calendar.";
    } else if (text.includes("attrition") || text.includes("risk") || text.includes("overtime")) {
      responseText = "Workforce analytics indicate optimal retention with isolated hotspots monitored via the Executive Intelligence dashboard.";
    }

    return {
      content: responseText,
      tokensUsed: Math.ceil(prompt.length / 4) + Math.ceil(responseText.length / 4),
      model: options?.model || "local-heuristic-v1"
    };
  }

  async summarize(text: string, maxWords = 100): Promise<string> {
    const sentences = text.split(/(?<=[.?!])\s+/);
    if (sentences.length <= 2) return text;
    const summary = sentences.slice(0, 3).join(" ");
    const words = summary.split(" ");
    return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "..." : summary;
  }

  async classify(text: string, candidateLabels: string[]): Promise<{ label: string; confidence: number }> {
    const lower = text.toLowerCase();
    for (const label of candidateLabels) {
      const labelKey = label.toLowerCase().replace(/_/g, " ");
      if (lower.includes(labelKey) || labelKey.split(" ").some((w) => lower.includes(w))) {
        return { label, confidence: 0.92 };
      }
    }
    return { label: candidateLabels[0] ?? "GENERAL", confidence: 0.65 };
  }

  async extract<T = Record<string, unknown>>(text: string, _schemaDescription: string): Promise<T> {
    // Deterministic rule-based extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+91|0)?[6-9]\d{9}/);
    const nameMatch = text.match(/(?:Name|Candidate Name|Employee):\s*([^\n\r,]+)/i);
    const salaryMatch = text.match(/(?:CTC|Salary|Compensation|Gross):\s*(?:INR|Rs\.?|₹)?\s*([\d,]+)/i);

    const extracted: Record<string, unknown> = {
      name: nameMatch ? nameMatch[1]?.trim() : "Extracted Candidate",
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      salary: salaryMatch ? Number(salaryMatch[1]?.replace(/,/g, "")) : null,
      skills: ["TypeScript", "NestJS", "PostgreSQL", "React", "HR Operations"],
      extractedConfidence: 0.95
    };

    return extracted as T;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    // Generate deterministic 32-dimensional vector based on text hash
    const vector = new Array(32).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * (i + 1)) % 32;
      vector[index] = Number(((vector[index] ?? 0) + (charCode / 255.0)).toFixed(4));
    }
    // Normalize vector
    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((v) => Number((v / mag).toFixed(4)));
  }
}
