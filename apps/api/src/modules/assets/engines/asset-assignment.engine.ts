import { AssetStatus } from "@prisma/client";

export interface AssignmentValidationInput {
  currentStatus: AssetStatus;
  isScrapped: boolean;
  currentHolderId?: string | null;
}

export class AssetAssignmentEngine {
  /**
   * Validates whether an asset is eligible for assignment.
   */
  public static validateAssignment(input: AssignmentValidationInput): { valid: boolean; reason?: string } {
    if (input.isScrapped) {
      return { valid: false, reason: "Scrapped assets cannot be assigned" };
    }
    if (input.currentStatus === AssetStatus.ASSIGNED || input.currentHolderId) {
      return { valid: false, reason: "Asset is already assigned to another employee" };
    }
    if (input.currentStatus === AssetStatus.IN_REPAIR || input.currentStatus === AssetStatus.IN_MAINTENANCE) {
      return { valid: false, reason: "Asset is currently undergoing maintenance or repair" };
    }
    if (input.currentStatus === AssetStatus.LOST) {
      return { valid: false, reason: "Asset is marked as LOST" };
    }
    return { valid: true };
  }

  /**
   * Validates whether an asset is eligible for transfer.
   */
  public static validateTransfer(input: AssignmentValidationInput, targetEmployeeId: string): { valid: boolean; reason?: string } {
    if (input.isScrapped) {
      return { valid: false, reason: "Scrapped assets cannot be transferred" };
    }
    if (input.currentStatus !== AssetStatus.ASSIGNED || !input.currentHolderId) {
      return { valid: false, reason: "Asset must be actively assigned to perform a transfer" };
    }
    if (input.currentHolderId === targetEmployeeId) {
      return { valid: false, reason: "Asset is already assigned to the target employee" };
    }
    return { valid: true };
  }

  /**
   * Validates whether an asset is eligible for return.
   */
  public static validateReturn(input: AssignmentValidationInput): { valid: boolean; reason?: string } {
    if (input.currentStatus !== AssetStatus.ASSIGNED && !input.currentHolderId) {
      return { valid: false, reason: "Asset is not currently assigned to any employee" };
    }
    return { valid: true };
  }
}
