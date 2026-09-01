import { describe, it, expect } from "vitest";
import { GlobalSearchEngine } from "../src/modules/search/engines/global-search.engine.js";

describe("Global Enterprise Search Engine (Task 33)", () => {
  const dataset = [
    {
      id: "emp-1",
      category: "EMPLOYEES" as const,
      title: "Avanish Rai",
      subtitle: "Principal Architect • Tech",
      keywords: ["EMP-001", "avanish@vcorganics.com", "Engineering"],
      url: "/directory"
    },
    {
      id: "vnd-1",
      category: "VENDORS" as const,
      title: "Apex Logistics & Supply",
      subtitle: "Vendor Code: VND-001",
      keywords: ["VND-001", "27ABCDE1234F1Z5"],
      url: "/vendors"
    },
    {
      id: "ast-1",
      category: "ASSETS" as const,
      title: 'MacBook Pro 16" M3 Max',
      subtitle: "Tag: AST-LAP-001",
      keywords: ["AST-LAP-001", "C02XYZ12345", "Laptops"],
      url: "/assets"
    },
    {
      id: "pol-1",
      category: "POLICIES" as const,
      title: "Code of Conduct & Anti-Bribery Policy",
      subtitle: "Policy Code: POL-COC-01",
      keywords: ["POL-COC-01", "Ethics", "Compliance"],
      url: "/communications/policies"
    }
  ];

  it("finds matching employees with high relevance", () => {
    const results = GlobalSearchEngine.search("Avanish", dataset);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.title).toBe("Avanish Rai");
    expect(results[0]?.category).toBe("EMPLOYEES");
  });

  it("filters search results by entity category", () => {
    const results = GlobalSearchEngine.search("VND-001", dataset, { category: "VENDORS" });
    expect(results.length).toBe(1);
    expect(results[0]?.category).toBe("VENDORS");
    expect(results[0]?.title).toBe("Apex Logistics & Supply");
  });

  it("returns empty array for empty search queries", () => {
    const results = GlobalSearchEngine.search("   ", dataset);
    expect(results).toEqual([]);
  });
});
