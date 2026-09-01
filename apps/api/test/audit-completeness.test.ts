import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("audit completeness", () => {
  it("audits employee and document events", () => {
    const service = readFileSync(new URL("../src/modules/employees/employees.service.ts", import.meta.url), "utf8");
    const employeeActions = [
      "employee.created",
      "employee.updated",
      "employee.status.changed"
    ];
    for (const action of employeeActions) {
      expect(service).toContain(`"${action}"`);
    }
    const directActions = [
      "document.uploaded",
      "document.updated",
      "employee.imported",
      "employee.exported",
      "employee.bulk.updated",
      "department.created",
      "department.updated",
      "designation.created",
      "designation.updated"
    ];
    for (const action of directActions) {
      expect(service).toContain(`action: "${action}"`);
    }
  });

  it("audits attendance events", () => {
    const service = readFileSync(new URL("../src/modules/attendance/attendance.service.ts", import.meta.url), "utf8");
    const attendanceActions = [
      "attendance.check_in",
      "attendance.check_out",
      "attendance.manual",
      "attendance.updated",
      "attendance.correction.requested",
      "attendance.correction.reviewed",
      "attendance.rules.updated"
    ];
    for (const action of attendanceActions) {
      expect(service).toContain(`action: "${action}"`);
    }
  });

  it("audits user and role events", () => {
    const service = readFileSync(new URL("../src/modules/users/users.service.ts", import.meta.url), "utf8");
    const actions = [
      "user.invited",
      "user.roles.assigned",
      "user.status.updated",
      "user.access.reset"
    ];
    for (const action of actions) {
      expect(service).toContain(`action: "${action}"`);
    }
  });

  it("audits tenant and settings events", () => {
    const service = readFileSync(new URL("../src/modules/tenants/tenants.service.ts", import.meta.url), "utf8");
    const actions = [
      "tenant.created",
      "tenant.updated",
      "tenant.settings.updated",
      "tenant.branding.updated",
      "tenant.feature_flag.upserted",
      "tenant.domain.created"
    ];
    for (const action of actions) {
      expect(service).toContain(`action: "${action}"`);
    }
  });

  it("audits auth events", () => {
    const service = readFileSync(new URL("../src/modules/auth/auth.service.ts", import.meta.url), "utf8");
    expect(service).toContain(`action: "auth.login"`);
  });

  it("audits location events", () => {
    const service = readFileSync(new URL("../src/modules/locations/locations.service.ts", import.meta.url), "utf8");
    const actions = [
      "location.created",
      "location.updated",
      "location.deactivated",
      "location.assigned",
      "location.assignment.removed",
      "location.override"
    ];
    for (const action of actions) {
      expect(service).toContain(`action: "${action}"`);
    }
  });

  it("audits face biometric events", () => {
    const service = readFileSync(new URL("../src/modules/face/face.service.ts", import.meta.url), "utf8");
    const actions = [
      "face.enrolled",
      "face.enrollment.reviewed",
      "face.profile.disabled"
    ];
    for (const action of actions) {
      expect(service).toContain(`action: "${action}"`);
    }
  });

  it("audits leave events", () => {
    const service = readFileSync(new URL("../src/modules/leaves/leaves.service.ts", import.meta.url), "utf8");
    const actions = [
      "leave.type.created",
      "leave.policy.updated",
      "leave.balance.adjusted",
      "leave.created",
      "leave.approved",
      "leave.rejected",
      "leave.cancelled",
      "holiday.created",
      "holiday.deleted"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits compensation events", () => {
    const service = readFileSync(new URL("../src/modules/compensation/compensation.service.ts", import.meta.url), "utf8");
    const actions = [
      "compensation.component.created",
      "compensation.component.updated",
      "compensation.template.created",
      "compensation.template.updated",
      "compensation.assigned",
      "compensation.revised"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits payroll events", () => {
    const service = readFileSync(new URL("../src/modules/payroll/payroll.service.ts", import.meta.url), "utf8");
    const actions = [
      "payroll.generated",
      "payroll.recalculated",
      "payroll.adjustment.added",
      "payroll.adjustment.removed",
      "payroll.approved",
      "payroll.locked",
      "payroll.cancelled"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits payslip events", () => {
    const service = readFileSync(new URL("../src/modules/payslips/payslips.service.ts", import.meta.url), "utf8");
    const actions = [
      "payslip.generated",
      "payslip.regenerated",
      "payslip.downloaded",
      "payslip.viewed",
      "payslip.distributed",
      "payslip.email.sent",
      "payslip.email.failed"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits compliance events", () => {
    const service = readFileSync(new URL("../src/modules/compliance/compliance.service.ts", import.meta.url), "utf8");
    const actions = [
      "compliance.rule.created",
      "compliance.rule.updated",
      "compliance.snapshot.created"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits analytics & report events", () => {
    const service = readFileSync(new URL("../src/modules/analytics/analytics.service.ts", import.meta.url), "utf8");
    const actions = [
      "analytics.report.saved",
      "analytics.report.executed",
      "analytics.report.exported",
      "analytics.schedule.created",
      "analytics.schedule.triggered",
      "analytics.dashboard.created",
      "analytics.dashboard.updated",
      "analytics.dashboard.deleted"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits notification events", () => {
    const service = readFileSync(new URL("../src/modules/notifications/notification.service.ts", import.meta.url), "utf8");
    const actions = [
      "notification.send",
      "notification_template.create",
      "notification_template.update",
      "notification_preferences.update"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits workflow events", () => {
    const service = readFileSync(new URL("../src/modules/workflows/workflow.service.ts", import.meta.url), "utf8");
    const actions = [
      "workflow_definition.created",
      "workflow_instance.started",
      "workflow.step_delegated",
      "workflow.escalated"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits approval events", () => {
    const service = readFileSync(new URL("../src/modules/approvals/approval.service.ts", import.meta.url), "utf8");
    const actions = [
      "approval_template.created",
      "approval_request.submitted",
      "approval_request.approved",
      "approval_request.rejected",
      "approval_request.delegated"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits enterprise organization events", () => {
    const service = readFileSync(new URL("../src/modules/organization/organization.service.ts", import.meta.url), "utf8");
    const actions = [
      "organization.business_unit.created",
      "organization.business_unit.updated",
      "organization.region.created",
      "organization.region.updated",
      "organization.team.created",
      "organization.team.updated",
      "organization.reporting_manager.assigned",
      "organization.employee_org.assigned"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits security events", () => {
    const service = readFileSync(new URL("../src/modules/security/security.service.ts", import.meta.url), "utf8");
    const actions = [
      "security.suspicious_activity_recorded",
      "security.alert_resolved"
    ];
    for (const action of actions) {
      expect(service).toContain(`"${action}"`);
    }
  });

  it("audits ess profile, document, request, and announcement events", () => {
    const essService = readFileSync(new URL("../src/modules/ess/ess.service.ts", import.meta.url), "utf8");
    expect(essService).toContain('"profile.updated"');

    const docService = readFileSync(new URL("../src/modules/ess/services/document-vault.service.ts", import.meta.url), "utf8");
    expect(docService).toContain('"documents.uploaded"');
    expect(docService).toContain('"documents.read"');
    expect(docService).toContain('"documents.verified"');
    expect(docService).toContain('"documents.deleted"');

    const reqService = readFileSync(new URL("../src/modules/ess/services/employee-request.service.ts", import.meta.url), "utf8");
    expect(reqService).toContain('"requests.created"');
    expect(reqService).toContain('"requests.approved"');
    expect(reqService).toContain('"requests.rejected"');

    const annService = readFileSync(new URL("../src/modules/ess/services/announcement.service.ts", import.meta.url), "utf8");
    expect(annService).toContain('"announcements.created"');
    expect(annService).toContain('"announcements.deleted"');
  });

  it("includes required audit fields in all services that call auditService.record", () => {
    const services = [
      "employees/employees.service.ts",
      "users/users.service.ts",
      "tenants/tenants.service.ts",
      "auth/auth.service.ts",
      "attendance/attendance.service.ts",
      "locations/locations.service.ts",
      "face/face.service.ts",
      "leaves/leaves.service.ts",
      "compensation/compensation.service.ts",
      "payroll/payroll.service.ts",
      "payslips/payslips.service.ts",
      "compliance/compliance.service.ts",
      "analytics/analytics.service.ts",
      "notifications/notification.service.ts",
      "workflows/workflow.service.ts",
      "approvals/approval.service.ts",
      "organization/organization.service.ts",
      "security/security.service.ts",
      "ess/ess.service.ts",
      "ess/services/document-vault.service.ts",
      "ess/services/employee-request.service.ts",
      "ess/services/announcement.service.ts"
    ];

    for (const file of services) {
      const content = readFileSync(new URL(`../src/modules/${file}`, import.meta.url), "utf8");
      expect(content).toContain("auditService.record");
      expect(content).toContain("tenantId");
      expect(content).toContain("action");
      expect(content).toContain("resourceType");
    }
  });
});
