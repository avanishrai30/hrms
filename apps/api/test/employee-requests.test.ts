/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmployeeRequestService } from "../src/modules/ess/services/employee-request.service.js";

describe("Employee Request Service (Task 18)", () => {
  let reqService: EmployeeRequestService;
  let mockPrisma: any;
  let mockAudit: any;

  const tenantId = "11111111-1111-1111-1111-111111111111";
  const employeeId = "22222222-2222-2222-2222-222222222222";
  const approverUserId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    mockPrisma = {
      employee: {
        findFirst: vi.fn().mockResolvedValue({ id: employeeId, tenantId, fullName: "John Doe", employeeCode: "EMP001" }),
        update: vi.fn().mockResolvedValue({ id: employeeId })
      },
      employeeProfile: {
        upsert: vi.fn().mockResolvedValue({ id: "prof-1" })
      },
      employeeRequest: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "req-1",
            ...data,
            employee: { fullName: "John Doe", employeeCode: "EMP001" },
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "req-1",
            tenantId,
            employeeId,
            requestType: "ADDRESS_CHANGE",
            status: "PENDING",
            payloadJson: { currentAddress: { line1: "456 Green Way", city: "Pune", state: "Maharashtra", postalCode: "411001", country: "India" } },
            reason: "Relocated to Pune branch office",
            comments: null,
            workflowInstanceId: null,
            submittedAt: new Date(),
            resolvedAt: null,
            resolvedById: null,
            employee: { fullName: "John Doe", employeeCode: "EMP001" },
            resolvedBy: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: "req-1",
          tenantId,
          employeeId,
          requestType: "ADDRESS_CHANGE",
          status: "PENDING",
          payloadJson: { currentAddress: { line1: "456 Green Way", city: "Pune", state: "Maharashtra", postalCode: "411001", country: "India" } },
          reason: "Relocated to Pune branch office",
          comments: null,
          workflowInstanceId: null,
          submittedAt: new Date(),
          resolvedAt: null,
          resolvedById: null,
          employee: { id: employeeId, fullName: "John Doe", employeeCode: "EMP001" },
          resolvedBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        update: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "req-1",
            status: data.status,
            resolvedAt: data.resolvedAt,
            resolvedById: data.resolvedById,
            comments: data.comments,
            employee: { fullName: "John Doe", employeeCode: "EMP001" },
            resolvedBy: { email: "manager@test.com" }
          })
        )
      }
    };

    mockAudit = {
      record: vi.fn().mockResolvedValue({ id: "audit-1" })
    };

    reqService = new EmployeeRequestService(mockPrisma, mockAudit);
  });

  it("submits a new employee self-service request with audit trail", async () => {
    const dto = {
      requestType: "BANK_CHANGE" as const,
      reason: "Switched salary account to HDFC Bank",
      payload: {
        accountNumber: "123456789012",
        bankName: "HDFC Bank",
        ifscCode: "HDFC0001234",
        accountType: "SALARY"
      }
    };

    const res = await reqService.submitRequest(tenantId, employeeId, dto, approverUserId);

    expect(res).toBeDefined();
    expect(res.status).toBe("PENDING");
    expect(mockPrisma.employeeRequest.create).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "requests.created",
        resourceType: "employee_request"
      })
    );
  });

  it("approves employee request and auto-syncs approved changes to employee profile", async () => {
    const approved = await reqService.approveRequest(tenantId, "req-1", approverUserId, {
      comments: "Address proof verified and approved."
    });

    expect(approved.status).toBe("APPROVED");
    expect(mockPrisma.employee.update).toHaveBeenCalled();
    expect(mockPrisma.employeeProfile.upsert).toHaveBeenCalled();
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "requests.approved"
      })
    );
  });

  it("rejects employee request with mandatory review comments", async () => {
    const rejected = await reqService.rejectRequest(tenantId, "req-1", approverUserId, {
      comments: "Please upload official rental agreement."
    });

    expect(rejected.status).toBe("REJECTED");
    expect(mockAudit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "requests.rejected"
      })
    );
  });
});
