import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceTaxesPage() {
  return <FinanceAccountingPage title="Tax ledger" description="Track GST and TDS deductions, remittances, and tax liabilities." dataset="intelligence" report="TDS_SUMMARY" />;
}
