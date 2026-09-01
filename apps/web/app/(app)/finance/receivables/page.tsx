import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceReceivablesPage() {
  return <FinanceAccountingPage title="Accounts receivable" description="Generate customer invoices, track collections, and review ageing buckets." dataset="receivables" report="CUSTOMER_OUTSTANDING" />;
}
