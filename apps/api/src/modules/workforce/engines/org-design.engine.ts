/**
 * TASK 28 — ORG DESIGN ENGINE
 * Calculates organizational depth (layers), span of control, manager-to-IC ratio, and complexity indices.
 */

export interface OrgNodeInput {
  id: string;
  name: string;
  title: string;
  reportsToId: string | null;
  departmentName?: string;
}

export interface OrgAnalysisResult {
  totalNodes: number;
  totalManagers: number;
  totalIndividualContributors: number;
  maxLayers: number;
  avgSpanOfControl: number;
  managerToIcRatio: number;
  complexityScore: number;
  topSpans: Array<{ managerId: string; managerName: string; directReportsCount: number }>;
}

export class OrgDesignEngine {
  /**
   * Analyze an organizational tree structure and compute organizational health telemetry.
   */
  static analyzeHierarchy(nodes: OrgNodeInput[]): OrgAnalysisResult {
    if (nodes.length === 0) {
      return {
        totalNodes: 0,
        totalManagers: 0,
        totalIndividualContributors: 0,
        maxLayers: 0,
        avgSpanOfControl: 0,
        managerToIcRatio: 0,
        complexityScore: 0,
        topSpans: []
      };
    }

    const childrenMap = new Map<string, string[]>();
    const nodeMap = new Map<string, OrgNodeInput>();

    for (const node of nodes) {
      nodeMap.set(node.id, node);
      if (node.reportsToId) {
        const existing = childrenMap.get(node.reportsToId) ?? [];
        existing.push(node.id);
        childrenMap.set(node.reportsToId, existing);
      }
    }

    let managersCount = 0;
    let totalDirectReports = 0;
    const managerSpans: Array<{ managerId: string; managerName: string; directReportsCount: number }> = [];

    for (const node of nodes) {
      const directReports = childrenMap.get(node.id) ?? [];
      if (directReports.length > 0) {
        managersCount += 1;
        totalDirectReports += directReports.length;
        managerSpans.push({
          managerId: node.id,
          managerName: node.name,
          directReportsCount: directReports.length
        });
      }
    }

    const individualContributorsCount = nodes.length - managersCount;
    const avgSpanOfControl =
      managersCount > 0 ? Math.round((totalDirectReports / managersCount) * 10) / 10 : 0;
    const managerToIcRatio =
      individualContributorsCount > 0
        ? Math.round((managersCount / individualContributorsCount) * 100) / 100
        : managersCount;

    // Calculate max depth / layers starting from root nodes (reportsToId === null)
    let maxLayers = 1;
    const calculateDepth = (nodeId: string, currentDepth: number): number => {
      const children = childrenMap.get(nodeId) ?? [];
      if (children.length === 0) return currentDepth;
      let deepest = currentDepth;
      for (const childId of children) {
        const d = calculateDepth(childId, currentDepth + 1);
        if (d > deepest) deepest = d;
      }
      return deepest;
    };

    const roots = nodes.filter((n) => !n.reportsToId || !nodeMap.has(n.reportsToId));
    for (const root of roots) {
      const depth = calculateDepth(root.id, 1);
      if (depth > maxLayers) maxLayers = depth;
    }

    // Org Complexity Score = (MaxLayers * 0.4) + (ManagerRatio * 20 * 0.3) + (Log(TotalNodes) * 0.3)
    const rawComplexity = maxLayers * 0.4 + managerToIcRatio * 20 * 0.3 + Math.log10(Math.max(1, nodes.length)) * 1.5;
    const complexityScore = Math.round(rawComplexity * 10) / 10;

    managerSpans.sort((a, b) => b.directReportsCount - a.directReportsCount);

    return {
      totalNodes: nodes.length,
      totalManagers: managersCount,
      totalIndividualContributors: individualContributorsCount,
      maxLayers,
      avgSpanOfControl,
      managerToIcRatio,
      complexityScore,
      topSpans: managerSpans.slice(0, 5)
    };
  }
}
