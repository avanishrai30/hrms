import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceGSTPage() {
  return <FinanceAccountingPage title="GST" description="Review CGST, SGST, IGST, GSTR-1, GSTR-3B, input tax, and output tax." dataset="intelligence" report="GST_SUMMARY" />;
}
