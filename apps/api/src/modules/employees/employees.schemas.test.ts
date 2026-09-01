import { describe, expect, it } from "vitest";
import {
  bulkEmployeeUpdateSchema,
  createDocumentMetadataSchema,
  createEmployeeSchema,
  employeeExportSchema,
  employeeImportCommitSchema,
  employeeImportPreviewSchema,
  employeeSearchSchema,
  transitionEmployeeStatusSchema,
  updateDocumentMetadataSchema
} from "./employees.schemas.js";

describe("employee foundation schemas", () => {
  it("accepts complete employee foundation input", () => {
    const result = createEmployeeSchema.safeParse({
      employeeCode: "EMP-001",
      fullName: "Asha Nair",
      email: "asha@example.com",
      departmentId: "00000000-0000-0000-0000-000000000001",
      designationId: "00000000-0000-0000-0000-000000000002",
      joiningDate: "2026-08-31",
      employmentType: "FULL_TIME",
      salaryType: "MONTHLY",
      status: "DRAFT",
      emergencyContact: { name: "Devika", phone: "+919999999999", relationship: "Spouse" },
      bankDetails: { bankName: "Example Bank", accountLast4: "1234" },
      governmentIds: { panLast4: "1234" }
    });

    expect(result.success).toBe(true);
  });

  it("accepts every employee lifecycle target status with a reason", () => {
    for (const status of ["DRAFT", "INVITED", "ACTIVE", "PROBATION", "ON_LEAVE", "NOTICE_PERIOD", "INACTIVE", "ARCHIVED"]) {
      expect(transitionEmployeeStatusSchema.safeParse({ status, reason: "Approved lifecycle transition" }).success).toBe(true);
    }
  });

  it("rejects document metadata without a positive file size", () => {
    const result = createDocumentMetadataSchema.safeParse({
      documentType: "IDENTITY_PROOF",
      fileName: "id.pdf",
      mimeType: "application/pdf",
      sizeBytes: 0,
      objectKey: "tenants/tenant-1/documents/employee-1/file-1"
    });

    expect(result.success).toBe(false);
  });

  it("accepts versioned document metadata updates", () => {
    const createResult = createDocumentMetadataSchema.safeParse({
      documentType: "BANK_DOCUMENT",
      fileName: "cancelled-cheque.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2048,
      objectKey: "tenants/tenant-1/employees/employee-1/documents/bank-v2.pdf",
      version: 2,
      status: "ACTIVE",
      metadata: { checksum: "sha256:abc" }
    });
    const updateResult = updateDocumentMetadataSchema.safeParse({
      status: "ARCHIVED",
      metadata: { reason: "Superseded by newer upload" }
    });

    expect(createResult.success).toBe(true);
    expect(updateResult.success).toBe(true);
  });

  it("validates import, export, and bulk operation payloads", () => {
    const csv = "employeeCode,fullName,email,phone,departmentCode,designationCode,joiningDate\nEMP-002,Ravi Menon,ravi@example.com,+919888888888,OPS,MGR,2026-08-31";

    expect(employeeImportCommitSchema.safeParse({ csv, rollbackOnError: true }).success).toBe(true);
    expect(employeeExportSchema.safeParse({ format: "EXCEL", filters: { q: "ravi", archived: false } }).success).toBe(true);
    expect(
      bulkEmployeeUpdateSchema.safeParse({
        employeeIds: ["00000000-0000-0000-0000-000000000001"],
        status: "PROBATION",
        reason: "Bulk probation assignment"
      }).success
    ).toBe(true);
  });

  it("validates import preview schema", () => {
    expect(employeeImportPreviewSchema.safeParse({ csv: "code,name\n1,Test" }).success).toBe(true);
    expect(employeeImportPreviewSchema.safeParse({ csv: "" }).success).toBe(false);
  });

  it("validates import commit schema", () => {
    expect(employeeImportCommitSchema.safeParse({ csv: "test", rollbackOnError: true }).success).toBe(true);
    expect(employeeImportCommitSchema.safeParse({ csv: "test", rollbackOnError: false }).success).toBe(true);
    const defaultResult = employeeImportCommitSchema.safeParse({ csv: "test" });
    expect(defaultResult.success).toBe(true);
    if (defaultResult.success) {
      expect(defaultResult.data.rollbackOnError).toBe(true);
    }
  });

  it("validates export schema", () => {
    const defaultResult = employeeExportSchema.safeParse({});
    expect(defaultResult.success).toBe(true);
    if (defaultResult.success) {
      expect(defaultResult.data.format).toBe("CSV");
    }

    expect(employeeExportSchema.safeParse({ format: "EXCEL" }).success).toBe(true);
    expect(employeeExportSchema.safeParse({ format: "CSV", filters: { q: "search" } }).success).toBe(true);
    expect(employeeExportSchema.safeParse({ format: "CSV", filters: {} }).success).toBe(true);
  });

  it("validates bulk update schema requirements", () => {
    const validId = "00000000-0000-0000-0000-000000000001";
    
    // Requires at least one employee ID
    expect(bulkEmployeeUpdateSchema.safeParse({ employeeIds: [], reason: "Valid reason" }).success).toBe(false);
    
    // Requires 8-character minimum reason
    expect(bulkEmployeeUpdateSchema.safeParse({ employeeIds: [validId], reason: "short" }).success).toBe(false);
    
    // Accepts department assignment
    expect(bulkEmployeeUpdateSchema.safeParse({ employeeIds: [validId], reason: "Valid reason", departmentId: validId }).success).toBe(true);
    
    // Accepts designation assignment
    expect(bulkEmployeeUpdateSchema.safeParse({ employeeIds: [validId], reason: "Valid reason", designationId: validId }).success).toBe(true);
    
    // Accepts status change
    expect(bulkEmployeeUpdateSchema.safeParse({ employeeIds: [validId], reason: "Valid reason", status: "PROBATION" }).success).toBe(true);
    
    // Accepts archive flag
    expect(bulkEmployeeUpdateSchema.safeParse({ employeeIds: [validId], reason: "Valid reason", archive: true }).success).toBe(true);
  });

  it("validates search schema with various filters", () => {
    const validId = "00000000-0000-0000-0000-000000000001";
    
    // Accepts all filter combinations
    expect(employeeSearchSchema.safeParse({
      q: "john",
      departmentId: validId,
      designationId: validId,
      status: "ACTIVE",
      employmentType: "FULL_TIME",
      joinedFrom: "2026-01-01",
      joinedTo: "2026-12-31",
      managerEmployeeId: validId,
      role: "admin",
      archived: true
    }).success).toBe(true);

    // Accepts fuzzy search query
    expect(employeeSearchSchema.safeParse({ q: "fuzzy query" }).success).toBe(true);
    
    // Accepts date range filters
    expect(employeeSearchSchema.safeParse({ joinedFrom: "2026-01-01", joinedTo: "2026-12-31" }).success).toBe(true);
    
    // Accepts role filter
    expect(employeeSearchSchema.safeParse({ role: "manager" }).success).toBe(true);
    
    // Accepts manager filter
    expect(employeeSearchSchema.safeParse({ managerEmployeeId: validId }).success).toBe(true);
    
    // Defaults archived to false
    const defaultResult = employeeSearchSchema.safeParse({});
    expect(defaultResult.success).toBe(true);
    if (defaultResult.success) {
      expect(defaultResult.data.archived).toBe(false);
    }
  });

  it("accepts employee create with all optional fields", () => {
    const validId = "00000000-0000-0000-0000-000000000001";
    
    const result = createEmployeeSchema.safeParse({
      employeeCode: "EMP-001",
      fullName: "Asha Nair",
      email: "asha@example.com",
      departmentId: validId,
      designationId: validId,
      joiningDate: "2026-08-31",
      employmentType: "FULL_TIME",
      salaryType: "MONTHLY",
      
      // Optional fields
      currentAddress: { street: "123 Main St", city: "Testville" },
      permanentAddress: { street: "456 Old Rd", city: "Hometown" },
      emergencyContact: { name: "Bob", phone: "1234567890", relationship: "Brother" },
      bankDetails: { account: "123", ifsc: "IFSC123" },
      governmentIds: { pan: "ABCDE1234F" },
      profilePhotoObjectKey: "photos/emp-001.jpg",
      managerEmployeeId: validId,
      probationEndsAt: "2027-02-28",
      noticePeriodEndsAt: "2027-03-31",
      dateOfBirth: "1990-01-01",
      gender: "Female"
    });

    expect(result.success).toBe(true);
  });

  it("accepts document update with partial fields", () => {
    // Accepts partial updates (only fileName)
    expect(updateDocumentMetadataSchema.safeParse({ fileName: "new-name.pdf" }).success).toBe(true);
    
    // Accepts status change only
    expect(updateDocumentMetadataSchema.safeParse({ status: "ARCHIVED" }).success).toBe(true);
    
    // Accepts metadata update only
    expect(updateDocumentMetadataSchema.safeParse({ metadata: { tags: ["important"] } }).success).toBe(true);
  });
});
