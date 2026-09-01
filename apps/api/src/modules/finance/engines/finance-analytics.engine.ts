export interface FinanceAnalyticsInput {
  expenses: Array<{
    status: string;
    totalAmount: number;
    approvedAmount?: number | null;
    createdAt: Date;
    submittedAt?: Date | null;
    approvedAt?: Date | null;
    employeeId: string;
    costCenterId?: string | null;
    policyViolations?: unknown;
  }>;
  items: Array<{ category: string; amount: number; claim: { employeeId: string; costCenterId?: string | null } }>;
  travel: Array<{ status: string; estimatedBudget: number; actualSpend?: number | null; createdAt: Date; approvedAt?: Date | null; costCenterId?: string | null }>;
  budgets: Array<{ id: string; totalBudget: number; consumedAmount: number; costCenter: { code: string; name: string } }>;
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
}

export class FinanceAnalyticsEngine {
  build(input: FinanceAnalyticsInput) {
    const totalExpenseSpend = this.sum(input.expenses.map((expense) => expense.approvedAmount ?? expense.totalAmount));
    const travelSpend = this.sum(input.travel.map((travel) => travel.actualSpend ?? travel.estimatedBudget));
    const policyViolations = input.items.filter((item) => {
      const claim = input.expenses.find((expense) => expense.employeeId === item.claim.employeeId);
      return Boolean(claim?.policyViolations);
    }).length;

    return {
      period: input.period,
      monthlySpend: totalExpenseSpend,
      spendTrend: this.trend(input.expenses.map((expense) => ({ date: expense.createdAt, amount: expense.totalAmount })), input.period),
      categoryBreakdown: this.group(input.items.map((item) => ({ key: item.category, amount: item.amount }))),
      departmentBreakdown: this.group(input.items.map((item) => ({ key: item.claim.costCenterId ?? "UNALLOCATED", amount: item.amount }))),
      budgetConsumption: input.budgets.map((budget) => ({
        budgetId: budget.id,
        costCenter: budget.costCenter.name,
        consumedAmount: budget.consumedAmount,
        totalBudget: budget.totalBudget,
        utilizationPct: budget.totalBudget > 0 ? Number(((budget.consumedAmount / budget.totalBudget) * 100).toFixed(2)) : 0
      })),
      topSpenders: this.group(input.expenses.map((expense) => ({ key: expense.employeeId, amount: expense.totalAmount }))).slice(0, 10),
      policyViolations,
      averageApprovalTimeHours: this.averageHours(input.expenses.map((expense) => [expense.submittedAt, expense.approvedAt])),
      averageSettlementTimeHours: this.averageHours(input.travel.map((travel) => [travel.createdAt, travel.approvedAt])),
      reimbursementCycleHours: this.averageHours(input.expenses.map((expense) => [expense.approvedAt, expense.status === "PAID" ? new Date() : null])),
      travelSpend
    };
  }

  private sum(values: number[]) {
    return Number(values.reduce((total, value) => total + value, 0).toFixed(2));
  }

  private group(rows: Array<{ key: string; amount: number }>) {
    const totals = new Map<string, number>();
    for (const row of rows) {
      totals.set(row.key, (totals.get(row.key) ?? 0) + row.amount);
    }
    return [...totals.entries()]
      .map(([key, amount]) => ({ key, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);
  }

  private trend(rows: Array<{ date: Date; amount: number }>, period: FinanceAnalyticsInput["period"]) {
    return this.group(rows.map((row) => ({ key: this.bucket(row.date, period), amount: row.amount }))).sort((a, b) => a.key.localeCompare(b.key));
  }

  private bucket(date: Date, period: FinanceAnalyticsInput["period"]) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    if (period === "daily") return `${year}-${month}-${day}`;
    if (period === "weekly") return `${year}-W${Math.ceil(date.getUTCDate() / 7)}`;
    if (period === "quarterly") return `${year}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
    if (period === "yearly") return String(year);
    return `${year}-${month}`;
  }

  private averageHours(pairs: Array<[Date | null | undefined, Date | null | undefined]>) {
    const durations = pairs
      .filter((pair): pair is [Date, Date] => Boolean(pair[0] && pair[1]))
      .map(([start, end]) => (end.getTime() - start.getTime()) / 36e5);
    return durations.length ? Number((durations.reduce((total, value) => total + value, 0) / durations.length).toFixed(2)) : 0;
  }
}
