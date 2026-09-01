import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceReconciliationPage() {
  return <FinanceAccountingPage title="Bank reconciliation" description="Match bank transactions against vendor and customer payment records." dataset="banks" report="BANK_RECONCILIATION_SUMMARY" />;
}
