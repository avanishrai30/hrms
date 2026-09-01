import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceAccountsPage() {
  return <FinanceAccountingPage title="Chart of accounts" description="Manage hierarchical assets, liabilities, equity, revenue, and expense accounts." dataset="accounts" report="TRIAL_BALANCE" />;
}
