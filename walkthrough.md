# Task 24 Walkthrough

## Backend Flow

1. Create account groups and chart-of-account records under `/api/v1/finance/accounts`.
2. Create balanced manual journals through `/api/v1/finance/journals`.
3. Approve and post journals through `/api/v1/finance/journals/:id/status`.
4. Posted journals create `GeneralLedgerEntry` rows for debit and credit lines.
5. Accounting period locks prevent posting into closed operational windows.
6. Vendor and customer invoices calculate GST and TDS ledgers during creation.
7. Vendor and customer payments update invoice paid status and outstanding balances.
8. Bank statements create tenant-scoped transactions.
9. Bank reconciliation matches transactions against payment records by amount, reference, narration, and date proximity.
10. ERP sync creates an `ERPJob`, writes an `ERPJobLog`, and queues a tenant-scoped job.

## UI Flow

- `/finance/accounts` shows Chart of Accounts.
- `/finance/gl` shows journal-backed ledger activity.
- `/finance/journals` shows manual journal workflows.
- `/finance/periods` shows accounting periods.
- `/finance/banks` and `/finance/reconciliation` show banking and matching surfaces.
- `/finance/vendors`, `/finance/payables`, `/finance/receivables`, and `/finance/invoices` show AP/AR operations.
- `/finance/gst` and `/finance/taxes` show tax summaries.
- `/finance/erp` shows ERP integration readiness.
- `/admin/finance-intelligence` opens the finance intelligence dashboard.

## Security

All accounting APIs require tenant context and server-side RBAC permissions. Mutations write audit records through the existing audit service. ERP queue payloads include `tenantId`.

