import { describe, expect, it } from "vitest";
import { AssetAssignmentEngine } from "../src/modules/assets/engines/asset-assignment.engine.js";
import { AssetStatus } from "@prisma/client";

describe("Asset Assignment Engine (Task 22)", () => {
  it("allows assignment of available, non-scrapped assets", () => {
    const check = AssetAssignmentEngine.validateAssignment({
      currentStatus: AssetStatus.AVAILABLE,
      isScrapped: false,
      currentHolderId: null
    });

    expect(check.valid).toBe(true);
  });

  it("blocks assignment of already assigned or scrapped assets", () => {
    const assignedCheck = AssetAssignmentEngine.validateAssignment({
      currentStatus: AssetStatus.ASSIGNED,
      isScrapped: false,
      currentHolderId: "emp-1"
    });
    expect(assignedCheck.valid).toBe(false);
    expect(assignedCheck.reason).toContain("already assigned");

    const scrappedCheck = AssetAssignmentEngine.validateAssignment({
      currentStatus: AssetStatus.AVAILABLE,
      isScrapped: true
    });
    expect(scrappedCheck.valid).toBe(false);
    expect(scrappedCheck.reason).toContain("Scrapped");
  });

  it("validates asset transfer between employees", () => {
    const validTransfer = AssetAssignmentEngine.validateTransfer(
      {
        currentStatus: AssetStatus.ASSIGNED,
        isScrapped: false,
        currentHolderId: "emp-1"
      },
      "emp-2"
    );
    expect(validTransfer.valid).toBe(true);

    const sameHolderTransfer = AssetAssignmentEngine.validateTransfer(
      {
        currentStatus: AssetStatus.ASSIGNED,
        isScrapped: false,
        currentHolderId: "emp-1"
      },
      "emp-1"
    );
    expect(sameHolderTransfer.valid).toBe(false);
    expect(sameHolderTransfer.reason).toContain("already assigned");
  });

  it("validates asset return condition", () => {
    const validReturn = AssetAssignmentEngine.validateReturn({
      currentStatus: AssetStatus.ASSIGNED,
      isScrapped: false,
      currentHolderId: "emp-1"
    });
    expect(validReturn.valid).toBe(true);

    const unassignedReturn = AssetAssignmentEngine.validateReturn({
      currentStatus: AssetStatus.AVAILABLE,
      isScrapped: false,
      currentHolderId: null
    });
    expect(unassignedReturn.valid).toBe(false);
  });
});
