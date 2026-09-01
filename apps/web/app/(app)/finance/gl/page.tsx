import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceGLPage() {
  return <FinanceAccountingPage title="General ledger" description="Review posted double-entry ledger movement across accounts and periods." dataset="journals" report="TRIAL_BALANCE" />;
}
