import type { ERPProvider } from "@prisma/client";

export interface ERPExportPayload {
  journals?: unknown[];
  invoices?: unknown[];
  vendors?: unknown[];
  payments?: unknown[];
}

export interface ERPConnector {
  readonly provider: ERPProvider;
  export(payload: ERPExportPayload): { provider: ERPProvider; exported: number; payload: ERPExportPayload };
}

abstract class BaseERPConnector implements ERPConnector {
  abstract readonly provider: ERPProvider;

  export(payload: ERPExportPayload) {
    const exported = Object.values(payload).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0);
    return { provider: this.provider, exported, payload };
  }
}

export class TallyConnector extends BaseERPConnector {
  readonly provider = "TALLY" as const;
}

export class ZohoBooksConnector extends BaseERPConnector {
  readonly provider = "ZOHO_BOOKS" as const;
}

export class QuickBooksConnector extends BaseERPConnector {
  readonly provider = "QUICKBOOKS" as const;
}

export class SAPConnector extends BaseERPConnector {
  readonly provider = "SAP" as const;
}

export function erpConnector(provider: ERPProvider): ERPConnector {
  if (provider === "ZOHO_BOOKS") return new ZohoBooksConnector();
  if (provider === "QUICKBOOKS") return new QuickBooksConnector();
  if (provider === "SAP") return new SAPConnector();
  return new TallyConnector();
}
