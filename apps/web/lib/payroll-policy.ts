/**
 * Authoritative Payroll Permission & Action Gating Policy (Task 05.2)
 */

export function canReadPayroll(permissions: string[]): boolean {
  return permissions.includes("payroll.read");
}

export function canManagePayroll(permissions: string[]): boolean {
  return permissions.includes("payroll.manage");
}

export function canLockPayroll(permissions: string[]): boolean {
  return permissions.includes("payroll.lock");
}

export function canAccessCompensation(permissions: string[]): boolean {
  return permissions.includes("compensation.read") || permissions.includes("payroll.read");
}

export type PayrollAction = "APPROVE" | "CANCEL" | "RECALCULATE" | "LOCK";
export type PayrollStatus =
  | "DRAFT"
  | "PROCESSING"
  | "GENERATED"
  | "APPROVED"
  | "LOCKED"
  | "CANCELLED";

/**
 * Validates whether a payroll action is permissible given the current run status.
 * Mirror of backend state machine contract.
 */
export function isAllowedPayrollTransition(fromStatus: PayrollStatus, action: PayrollAction): boolean {
  if (fromStatus === "LOCKED" || fromStatus === "CANCELLED") {
    return false;
  }
  if (fromStatus === "GENERATED" || fromStatus === "DRAFT") {
    return action === "APPROVE" || action === "CANCEL" || action === "RECALCULATE";
  }
  if (fromStatus === "APPROVED") {
    return action === "LOCK";
  }
  return false;
}
