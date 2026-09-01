import { describe, expect, it } from "vitest";
import { PayrollFinanceBridge } from "./payroll-finance-bridge.js";

describe("PayrollFinanceBridge", () => {
  it("generates payroll earning and skips already posted sources", () => {
    const inputs = new PayrollFinanceBridge().generatePayrollInputs({
      payrollRunId: "payroll-1",
      alreadyPostedSourceIds: ["claim-old"],
      sources: [
        { id: "claim-old", employeeId: "emp-1", amount: 100, currency: "INR", type: "REIMBURSEMENT" },
        { id: "claim-new", employeeId: "emp-1", amount: 2500, currency: "INR", type: "REIMBURSEMENT" }
      ]
    });

    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toEqual(expect.objectContaining({ sourceId: "claim-new", adjustmentType: "EARNING", code: "FIN_REIMBURSEMENT" }));
  });
});
