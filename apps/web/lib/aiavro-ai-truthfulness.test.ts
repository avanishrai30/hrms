import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Task 09 — Web AI Truthfulness & Architecture Boundary Tests", () => {
  const aiWebDir = path.resolve(__dirname, "../app/(app)/ai");

  it("ensures no direct browser-to-model connections (e.g. localhost:11434 or Ollama) exist in web code", () => {
    function scanDir(dir: string): string[] {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          results.push(...scanDir(filePath));
        } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
          results.push(filePath);
        }
      }
      return results;
    }

    const files = scanDir(aiWebDir);
    const forbiddenPatterns = [
      /localhost:11434/i,
      /http:\/\/127\.0\.0\.1:11434/i,
      /api\.openai\.com/i,
      /generativelanguage\.googleapis\.com/i,
      /dangerouslySetInnerHTML/i
    ];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      for (const pattern of forbiddenPatterns) {
        const match = content.match(pattern);
        expect(
          match,
          `Forbidden client-side model connection or insecure HTML pattern found in ${file}: ${pattern}`
        ).toBeNull();
      }
    }
  });

  it("ensures all AI requests route through authenticated backend /ai endpoints", () => {
    const copilotCode = fs.readFileSync(path.join(aiWebDir, "page.tsx"), "utf-8");

    // Must call /ai/chat
    expect(copilotCode).toContain('"/ai/chat"');
    // Must call /ai/tools/confirm
    expect(copilotCode).toContain('"/ai/tools/confirm"');
    // Must handle TOOL_PROPOSAL for write actions
    expect(copilotCode).toContain('"TOOL_PROPOSAL"');
  });

  it("ensures AI Smart Insights page interacts with /ai/insights and dismiss endpoint", () => {
    const insightsCode = fs.readFileSync(path.join(aiWebDir, "insights/page.tsx"), "utf-8");

    expect(insightsCode).toContain('"/ai/insights"');
    expect(insightsCode).toContain("`/ai/insights/${id}/dismiss`");
    expect(insightsCode).toContain("All Systems Normal");
  });

  it("ensures AI Workforce Predictions page calls /ai/predictions/workforce without mock fallbacks", () => {
    const predictionsCode = fs.readFileSync(path.join(aiWebDir, "predictions/page.tsx"), "utf-8");

    expect(predictionsCode).toContain('"/ai/predictions/workforce"');
    expect(predictionsCode).not.toContain("Math.random");
  });
});
