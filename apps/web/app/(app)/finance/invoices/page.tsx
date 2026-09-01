import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceInvoicesPage() {
  return <FinanceAccountingPage title="Invoice management" description="Monitor customer and vendor invoice lifecycle, payments, and tax values." dataset="receivables" report="CUSTOMER_OUTSTANDING" />;
}
