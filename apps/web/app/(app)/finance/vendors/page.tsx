import { FinanceAccountingPage } from "../../../../components/finance-accounting-page";

export default function FinanceVendorsPage() {
  return <FinanceAccountingPage title="Vendors" description="Manage vendor masters, GSTIN/PAN, bank details, documents, and risk scores." dataset="vendors" report="VENDOR_OUTSTANDING" />;
}
