import type { ExpensePolicy } from "@prisma/client";
import type { CreateExpenseClaimDto } from "../finance.schemas.js";

export interface PolicyViolation {
  severity: "WARNING" | "HARD_LIMIT" | "AUTO_REJECT" | "REQUIRES_JUSTIFICATION" | "MANAGER_OVERRIDE";
  category: string;
  ruleType: "HARD_LIMIT" | "SOFT_LIMIT" | "REQUIRES_JUSTIFICATION" | "AUTO_REJECT" | "MANAGER_OVERRIDE";
  outcome: "PASS" | "WARNING" | "FAIL";
  message: string;
  amount?: number;
  limit?: number;
}

export class ExpensePolicyEngine {
  validateClaim(input: CreateExpenseClaimDto, policies: ExpensePolicy[]) {
    const byCategory = new Map(policies.filter((policy) => policy.isActive).map((policy) => [policy.category, policy]));
    const violations: PolicyViolation[] = [];

    for (const item of input.items) {
      const policy = byCategory.get(item.category);
      if (!policy) continue;

      if (policy.maxAmountPerItem && item.amount > policy.maxAmountPerItem) {
        const severity = policy.autoReject ? "AUTO_REJECT" : policy.hardLimit ? "HARD_LIMIT" : "WARNING";
        violations.push({
          severity,
          category: item.category,
          ruleType: policy.autoReject ? "AUTO_REJECT" : policy.hardLimit ? "HARD_LIMIT" : "SOFT_LIMIT",
          outcome: severity === "WARNING" ? "WARNING" : "FAIL",
          message: `${item.category} exceeds per-item limit ${policy.currency} ${policy.maxAmountPerItem}.`,
          amount: item.amount,
          limit: policy.maxAmountPerItem
        });
      }
      if (policy.mileageRatePerKm && item.category === "MILEAGE" && item.mileageRate && item.mileageRate > policy.mileageRatePerKm) {
        const severity = policy.hardLimit ? "HARD_LIMIT" : "MANAGER_OVERRIDE";
        violations.push({
          severity,
          category: item.category,
          ruleType: policy.hardLimit ? "HARD_LIMIT" : "MANAGER_OVERRIDE",
          outcome: policy.hardLimit ? "FAIL" : "WARNING",
          message: `Mileage rate exceeds ${policy.currency} ${policy.mileageRatePerKm}/km.`,
          amount: item.mileageRate,
          limit: policy.mileageRatePerKm
        });
      }
      if (policy.requiresPreApproval && input.costCenterId === undefined) {
        violations.push({
          severity: "REQUIRES_JUSTIFICATION",
          category: item.category,
          ruleType: "REQUIRES_JUSTIFICATION",
          outcome: "WARNING",
          message: `${item.category} requires pre-approval or cost-center allocation.`
        });
      }
      if (policy.maxAmountPerDay) {
        const dailyAmount = input.items
          .filter((candidate) => candidate.category === item.category && candidate.expenseDate.toISOString().slice(0, 10) === item.expenseDate.toISOString().slice(0, 10))
          .reduce((total, candidate) => total + candidate.amount, 0);
        if (dailyAmount > policy.maxAmountPerDay) {
          violations.push({
            severity: policy.hardLimit ? "HARD_LIMIT" : "WARNING",
            category: item.category,
            ruleType: policy.hardLimit ? "HARD_LIMIT" : "SOFT_LIMIT",
            outcome: policy.hardLimit ? "FAIL" : "WARNING",
            message: `${item.category} exceeds daily limit ${policy.currency} ${policy.maxAmountPerDay}.`,
            amount: dailyAmount,
            limit: policy.maxAmountPerDay
          });
        }
      }
    }

    const outcome: "PASS" | "WARNING" | "FAIL" = violations.some((violation) => violation.outcome === "FAIL")
      ? "FAIL"
      : violations.length
        ? "WARNING"
        : "PASS";
    return { outcome, violations };
  }
}
