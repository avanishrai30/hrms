import { z } from "zod";

export const employmentStatusSchema = z.enum([
  "DRAFT",
  "INVITED",
  "ACTIVE",
  "PROBATION",
  "ON_LEAVE",
  "NOTICE_PERIOD",
  "INACTIVE",
  "ARCHIVED"
]);

export const employeeDocumentTypeSchema = z.enum([
  "IDENTITY_PROOF",
  "ADDRESS_PROOF",
  "OFFER_LETTER",
  "EMPLOYMENT_AGREEMENT",
  "BANK_DOCUMENT",
  "TAX_DOCUMENT",
  "CUSTOM"
]);

export const employeeDocumentStatusSchema = z.enum(["DRAFT", "ACTIVE", "REPLACED", "REJECTED", "ARCHIVED"]);

const jsonRecordSchema = z.record(z.unknown());

export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  status: z.string().default("ACTIVE")
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createDesignationSchema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().min(2),
  code: z.string().min(2),
  status: z.string().default("ACTIVE")
});

export const updateDesignationSchema = createDesignationSchema.partial();

export const createEmployeeSchema = z.object({
  employeeCode: z.string().min(2),
  fullName: z.string().min(2),
  preferredName: z.string().min(1).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().min(1).optional(),
  personalEmail: z.string().email().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  managerEmployeeId: z.string().uuid().optional(),
  joiningDate: z.coerce.date(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]),
  salaryType: z.enum(["MONTHLY", "DAILY", "HOURLY"]).default("MONTHLY"),
  status: employmentStatusSchema.default("DRAFT"),

  profilePhotoObjectKey: z.string().optional(),
  currentAddress: jsonRecordSchema.optional(),
  permanentAddress: jsonRecordSchema.optional(),
  emergencyContact: jsonRecordSchema.optional(),
  bankDetails: jsonRecordSchema.optional(),
  governmentIds: jsonRecordSchema.optional(),
  probationEndsAt: z.coerce.date().optional(),
  noticePeriodEndsAt: z.coerce.date().optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const archiveEmployeeSchema = z.object({
  reason: z.string().min(8)
});

export const transitionEmployeeStatusSchema = z.object({
  status: employmentStatusSchema,
  reason: z.string().min(8)
});

export const createDocumentMetadataSchema = z.object({
  documentType: employeeDocumentTypeSchema,
  customTypeLabel: z.string().min(2).optional(),
  fileName: z.string().min(2),
  mimeType: z.string().min(3),
  sizeBytes: z.number().int().positive(),
  objectKey: z.string().min(8),
  version: z.number().int().positive().optional(),
  status: employeeDocumentStatusSchema.default("ACTIVE"),
  metadata: jsonRecordSchema.default({})
});

export const updateDocumentMetadataSchema = z.object({
  fileName: z.string().min(2).optional(),
  mimeType: z.string().min(3).optional(),
  sizeBytes: z.number().int().positive().optional(),
  objectKey: z.string().min(8).optional(),
  status: employeeDocumentStatusSchema.optional(),
  metadata: jsonRecordSchema.optional()
});

export const employeeSearchSchema = z.object({
  q: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  businessUnitId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: employmentStatusSchema.optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"]).optional(),
  joinedFrom: z.coerce.date().optional(),
  joinedTo: z.coerce.date().optional(),
  managerEmployeeId: z.string().uuid().optional(),
  role: z.string().optional(),
  archived: z.coerce.boolean().default(false),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export const employeeImportPreviewSchema = z.object({
  csv: z.string().min(1)
});

export const employeeImportCommitSchema = employeeImportPreviewSchema.extend({
  rollbackOnError: z.boolean().default(true)
});

export const employeeExportSchema = z.object({
  format: z.enum(["CSV", "EXCEL"]).default("CSV"),
  filters: employeeSearchSchema.partial().default({})
});

export const bulkEmployeeUpdateSchema = z.object({
  employeeIds: z.array(z.string().uuid()).min(1),
  reason: z.string().min(8),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  status: employmentStatusSchema.optional(),
  archive: z.boolean().optional()
});

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
export type CreateDesignationDto = z.infer<typeof createDesignationSchema>;
export type UpdateDesignationDto = z.infer<typeof updateDesignationSchema>;
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type ArchiveEmployeeDto = z.infer<typeof archiveEmployeeSchema>;
export type TransitionEmployeeStatusDto = z.infer<typeof transitionEmployeeStatusSchema>;
export type CreateDocumentMetadataDto = z.infer<typeof createDocumentMetadataSchema>;
export type UpdateDocumentMetadataDto = z.infer<typeof updateDocumentMetadataSchema>;
export type EmployeeSearchDto = z.infer<typeof employeeSearchSchema>;
export type EmployeeImportPreviewDto = z.infer<typeof employeeImportPreviewSchema>;
export type EmployeeImportCommitDto = z.infer<typeof employeeImportCommitSchema>;
export type EmployeeExportDto = z.infer<typeof employeeExportSchema>;
export type BulkEmployeeUpdateDto = z.infer<typeof bulkEmployeeUpdateSchema>;
