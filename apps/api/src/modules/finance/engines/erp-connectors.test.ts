import { describe, expect, it } from "vitest";
import { erpConnector } from "./erp-connectors.js";

describe("ERP connectors", () => {
  it("exports provider-specific payload counts", () => {
    const result = erpConnector("TALLY").export({ journals: [{ id: "j1" }], invoices: [{ id: "i1" }, { id: "i2" }] });

    expect(result.provider).toBe("TALLY");
    expect(result.exported).toBe(3);
  });
});
