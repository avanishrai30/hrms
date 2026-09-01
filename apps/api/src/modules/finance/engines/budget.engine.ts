export interface BudgetSnapshot {
  id: string;
  costCenterId: string;
  totalBudget: number;
  allocatedAmount: number;
  consumedAmount: number;
  committedAmount?: number;
  warningThreshold?: number;
}

export interface BudgetMetric {
  budgetId: string;
  costCenterId: string;
  allocated: number;
  consumed: number;
  committed: number;
  remaining: number;
  utilizationPct: number;
  threshold: "NONE" | "50" | "75" | "90" | "100";
  notifications: string[];
}

export class BudgetEngine {
  evaluate(budget: BudgetSnapshot): BudgetMetric {
    const committed = budget.committedAmount ?? 0;
    const consumedWithCommitments = budget.consumedAmount + committed;
    const utilizationPct = budget.totalBudget > 0 ? Number(((consumedWithCommitments / budget.totalBudget) * 100).toFixed(2)) : 0;
    const threshold = this.threshold(utilizationPct);
    const notifications: string[] = [];

    if (threshold !== "NONE") {
      notifications.push(`budget.threshold.${threshold}`);
    }
    if (budget.warningThreshold && utilizationPct >= budget.warningThreshold) {
      notifications.push("budget.warning_threshold.exceeded");
    }
    if (utilizationPct >= 100) {
      notifications.push("budget.exhausted");
    }

    return {
      budgetId: budget.id,
      costCenterId: budget.costCenterId,
      allocated: budget.allocatedAmount,
      consumed: budget.consumedAmount,
      committed,
      remaining: Number(Math.max(0, budget.totalBudget - consumedWithCommitments).toFixed(2)),
      utilizationPct,
      threshold,
      notifications
    };
  }

  validateSpend(budget: BudgetSnapshot | null, amount: number) {
    if (!budget) {
      return { allowed: true, reason: "NO_BUDGET", metric: null };
    }
    const metric = this.evaluate({ ...budget, committedAmount: (budget.committedAmount ?? 0) + amount });
    return {
      allowed: metric.utilizationPct <= 100,
      reason: metric.utilizationPct > 100 ? "BUDGET_EXCEEDED" : "PASS",
      metric
    };
  }

  private threshold(utilizationPct: number): BudgetMetric["threshold"] {
    if (utilizationPct >= 100) return "100";
    if (utilizationPct >= 90) return "90";
    if (utilizationPct >= 75) return "75";
    if (utilizationPct >= 50) return "50";
    return "NONE";
  }
}
