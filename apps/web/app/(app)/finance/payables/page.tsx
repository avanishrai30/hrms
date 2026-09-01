import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinancePayablesPage() {
  return <FinanceAccountingPage title="Accounts payable" description="Approve vendor invoices, track payments, and monitor outstanding balances." dataset="payables" report="VENDOR_OUTSTANDING" />;
}
