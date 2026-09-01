export interface SearchResultItem {
  id: string;
  category: "EMPLOYEES" | "VENDORS" | "CONTRACTORS" | "ASSETS" | "POLICIES" | "KNOWLEDGE" | "DOCUMENTS";
  title: string;
  subtitle?: string;
  badge?: string;
  url: string;
  relevanceScore: number;
}

export interface SearchFilterOptions {
  category?: string;
  limit?: number;
}

export class GlobalSearchEngine {
  static search(
    query: string,
    dataset: Array<{
      id: string;
      category: "EMPLOYEES" | "VENDORS" | "CONTRACTORS" | "ASSETS" | "POLICIES" | "KNOWLEDGE" | "DOCUMENTS";
      title: string;
      subtitle?: string;
      keywords?: string[];
      url: string;
    }>,
    filters?: SearchFilterOptions
  ): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);
    const results: SearchResultItem[] = [];

    for (const item of dataset) {
      if (filters?.category && filters.category !== "ALL" && item.category !== filters.category) {
        continue;
      }

      let score = 0;
      const titleLower = item.title.toLowerCase();
      const subtitleLower = item.subtitle ? item.subtitle.toLowerCase() : "";
      const keywordsStr = item.keywords ? item.keywords.join(" ").toLowerCase() : "";

      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 60;
      else if (titleLower.includes(q)) score += 40;

      if (subtitleLower.includes(q)) score += 25;
      if (keywordsStr.includes(q)) score += 20;

      for (const term of terms) {
        if (titleLower.includes(term)) score += 15;
        if (subtitleLower.includes(term)) score += 10;
        if (keywordsStr.includes(term)) score += 8;
      }

      if (score > 0) {
        results.push({
          id: item.id,
          category: item.category,
          title: item.title,
          subtitle: item.subtitle,
          url: item.url,
          relevanceScore: score
        });
      }
    }

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const limit = filters?.limit ?? 30;
    return results.slice(0, limit);
  }
}
