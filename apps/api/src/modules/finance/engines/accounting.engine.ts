export interface JournalLineInput {
  accountId: string;
  debit: number;
  credit: number;
}

export class AccountingEngine {
  totals(lines: JournalLineInput[]) {
    const totalDebit = Number(lines.reduce((sum, line) => sum + line.debit, 0).toFixed(2));
    const totalCredit = Number(lines.reduce((sum, line) => sum + line.credit, 0).toFixed(2));
    return { totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  }

  assertBalanced(lines: JournalLineInput[]) {
    const totals = this.totals(lines);
    const invalidLine = lines.find((line) => (line.debit > 0 && line.credit > 0) || (line.debit === 0 && line.credit === 0));
    return { ...totals, validLines: !invalidLine };
  }
}

export interface GSTInput {
  taxableAmount: number;
  gstRate: number;
  placeOfSupply: "INTRA_STATE" | "INTER_STATE";
}

export class GSTEngine {
  calculate(input: GSTInput) {
    const taxAmount = Number(((input.taxableAmount * input.gstRate) / 100).toFixed(2));
    if (input.placeOfSupply === "INTER_STATE") {
      return { cgst: 0, sgst: 0, igst: taxAmount, totalTax: taxAmount };
    }
    return { cgst: Number((taxAmount / 2).toFixed(2)), sgst: Number((taxAmount / 2).toFixed(2)), igst: 0, totalTax: taxAmount };
  }
}

export class TDSEngine {
  calculate(taxableAmount: number, tdsRate: number) {
    return Number(((taxableAmount * tdsRate) / 100).toFixed(2));
  }
}

export interface ReconciliationCandidate {
  id: string;
  amount: number;
  reference?: string | null;
  narration?: string | null;
  date: Date;
}

export class BankReconciliationEngine {
  match(transaction: ReconciliationCandidate, candidates: ReconciliationCandidate[]) {
    const scored = candidates.map((candidate) => {
      let score = 0;
      if (Math.abs(candidate.amount - transaction.amount) < 0.01) score += 50;
      if (candidate.reference && transaction.reference && candidate.reference === transaction.reference) score += 35;
      if (candidate.narration && transaction.narration && transaction.narration.toLowerCase().includes(candidate.narration.toLowerCase())) score += 10;
      const dayDistance = Math.abs(candidate.date.getTime() - transaction.date.getTime()) / 86400000;
      if (dayDistance <= 3) score += 5;
      return { candidate, score };
    }).sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best || best.score < 50) return { status: "UNMATCHED" as const, matchScore: best?.score ?? 0, candidate: null };
    return { status: best.score >= 85 ? "MATCHED" as const : "PARTIAL" as const, matchScore: best.score, candidate: best.candidate };
  }
}
