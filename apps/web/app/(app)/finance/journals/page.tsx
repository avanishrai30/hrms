import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceJournalsPage() {
  return <FinanceAccountingPage title="Journal entries" description="Create, approve, post, and reverse balanced accounting journals." dataset="journals" report="TRIAL_BALANCE" />;
}
