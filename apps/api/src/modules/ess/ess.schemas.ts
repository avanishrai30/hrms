import { z } from "zod";

// ----------------- Profile Schemas -----------------

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z.string().min(8, "Valid phone is required"),
  alternatePhone: z.string().optional(),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  address: z.string().optional()
});

export const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().default("India")
});

export const bankDetailsSchema = z.object({
  accountNumber: z.string().min(5, "Account number is required"),
  bankName: z.string().min(2, "Bank name is required"),
  ifscCode: z.string().min(4, "IFSC code is required"),
  branchName: z.string().optional(),
  accountType: z.enum(["SAVINGS", "CURRENT", "SALARY"]).default("SALARY")
});

export const governmentIdsSchema = z.object({
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  passport: z.string().optional(),
  drivingLicense: z.string().optional(),
  uan: z.string().optional(),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional()
});

export const updateProfileSchema = z.object({
  preferredName: z.string().optional(),
  personalEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().min(8, "Valid phone number required").optional(),
  bio: z.string().max(1000).optional(),
  profilePhoto: z.string().optional(),
  dateOfBirth: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]).optional(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"]).optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  emergencyContact: emergencyContactSchema.optional(),
  currentAddress: addressSchema.optional(),
  permanentAddress: addressSchema.optional(),
  bankDetails: bankDetailsSchema.optional(),
  governmentIds: governmentIdsSchema.optional()
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

// ----------------- Document Vault Schemas -----------------

export const essDocumentTypeSchema = z.enum([
  "PAN",
  "AADHAAR",
  "PASSPORT",
  "DRIVING_LICENSE",
  "OFFER_LETTER",
  "APPOINTMENT_LETTER",
  "PAYSLIP",
  "TAX_DOCUMENT",
  "CERTIFICATE",
  "CUSTOM"
]);

export const uploadDocumentSchema = z.object({
  employeeId: z.string().uuid().optional(),
  documentType: essDocumentTypeSchema,
  title: z.string().min(2, "Title is required").max(200),
  fileName: z.string().min(1, "File name is required"),
  fileBase64: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().default("application/pdf"),
  expiryDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  metadata: z.record(z.unknown()).default({})
});

export type UploadDocumentDto = z.infer<typeof uploadDocumentSchema>;

export const verifyDocumentSchema = z.object({
  isVerified: z.boolean(),
  remarks: z.string().optional()
});

export type VerifyDocumentDto = z.infer<typeof verifyDocumentSchema>;

export const documentFilterSchema = z.object({
  employeeId: z.string().uuid().optional(),
  documentType: essDocumentTypeSchema.optional(),
  isVerified: z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional()),
  expiringWithinDays: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export type DocumentFilterDto = z.infer<typeof documentFilterSchema>;

// ----------------- Employee Request Schemas -----------------

export const employeeRequestTypeSchema = z.enum([
  "ADDRESS_CHANGE",
  "BANK_CHANGE",
  "PERSONAL_INFO_CORRECTION",
  "DOCUMENT_UPDATE",
  "MANAGER_CHANGE",
  "SHIFT_CHANGE",
  "ATTENDANCE_CORRECTION",
  "CUSTOM"
]);

export const createEmployeeRequestSchema = z.object({
  employeeId: z.string().uuid().optional(),
  requestType: employeeRequestTypeSchema,
  reason: z.string().min(3, "Reason is required").max(500),
  payload: z.record(z.unknown()),
  comments: z.string().optional()
});

export type CreateEmployeeRequestDto = z.infer<typeof createEmployeeRequestSchema>;

export const resolveEmployeeRequestSchema = z.object({
  comments: z.string().optional()
});

export type ResolveEmployeeRequestDto = z.infer<typeof resolveEmployeeRequestSchema>;

export const requestFilterSchema = z.object({
  employeeId: z.string().uuid().optional(),
  requestType: employeeRequestTypeSchema.optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export type RequestFilterDto = z.infer<typeof requestFilterSchema>;

// ----------------- Announcement Schemas -----------------

export const announcementPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title is required").max(250),
  content: z.string().min(5, "Content is required"),
  priority: announcementPrioritySchema.default("MEDIUM"),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        sizeBytes: z.number().optional()
      })
    )
    .optional()
    .default([]),
  notifyChannels: z.array(z.enum(["IN_APP", "PUSH", "EMAIL"])).optional().default(["IN_APP"])
});

export type CreateAnnouncementDto = z.infer<typeof createAnnouncementSchema>;

export const announcementFilterSchema = z.object({
  priority: announcementPrioritySchema.optional(),
  isPinned: z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional()),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export type AnnouncementFilterDto = z.infer<typeof announcementFilterSchema>;

// ----------------- Directory Schemas -----------------

export const directoryFilterSchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  businessUnitId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export type DirectoryFilterDto = z.infer<typeof directoryFilterSchema>;
