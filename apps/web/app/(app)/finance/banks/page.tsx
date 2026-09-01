import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceBanksPage() {
  return <FinanceAccountingPage title="Bank accounts" description="Track bank accounts, statements, balances, and reconciliation readiness." dataset="banks" report="BANK_RECONCILIATION_SUMMARY" />;
}
