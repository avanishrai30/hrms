import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinancePeriodsPage() {
  return <FinanceAccountingPage title="Accounting periods" description="Close, lock, and unlock monthly, quarterly, and yearly accounting periods." dataset="periods" report="TRIAL_BALANCE" />;
}
