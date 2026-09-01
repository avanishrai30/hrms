import { z } from "zod";

export const CreateAssetSchema = z.object({
  category: z.enum([
    "LAPTOP",
    "DESKTOP",
    "MOBILE_PHONE",
    "TABLET",
    "PRINTER",
    "BIOMETRIC_DEVICE",
    "ACCESS_CARD",
    "SIM_CARD",
    "VEHICLE",
    "FURNITURE",
    "MONITOR",
    "SOFTWARE_LICENSE",
    "NETWORK_DEVICE",
    "SERVER",
    "CUSTOM_ASSET"
  ]),
  assetCode: z.string().min(1),
  serialNumber: z.string().min(1),
  name: z.string().min(1),
  model: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  specificationsJson: z.record(z.any()).optional().default({}),
  purchaseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  purchaseCost: z.number().min(0),
  currency: z.string().default("INR"),
  location: z.string().optional().nullable(),
  condition: z.enum(["BRAND_NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED", "SCRAP"]).default("BRAND_NEW"),
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_REPAIR", "IN_MAINTENANCE", "LOST", "SCRAPPED", "RETURNED"]).default("AVAILABLE"),
  usefulLifeYears: z.number().int().min(1).default(3),
  salvageValue: z.number().min(0).default(0),
  depreciationMethod: z.enum(["STRAIGHT_LINE", "WRITTEN_DOWN_VALUE"]).default("STRAIGHT_LINE"),
  notes: z.string().optional().nullable()
});

export const UpdateAssetSchema = CreateAssetSchema.partial();

export const AssignAssetSchema = z.object({
  employeeId: z.string().uuid(),
  condition: z.enum(["BRAND_NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED", "SCRAP"]).default("GOOD"),
  notes: z.string().optional().nullable(),
  agreementUrl: z.string().optional().nullable()
});

export const TransferAssetSchema = z.object({
  toEmployeeId: z.string().uuid(),
  condition: z.enum(["BRAND_NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED", "SCRAP"]).default("GOOD"),
  notes: z.string().optional().nullable()
});

export const ReturnAssetSchema = z.object({
  returnCondition: z.enum(["BRAND_NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED", "SCRAP"]).default("GOOD"),
  notes: z.string().optional().nullable()
});

export const BulkAssignAssetSchema = z.object({
  assignments: z.array(
    z.object({
      assetId: z.string().uuid(),
      employeeId: z.string().uuid(),
      notes: z.string().optional().nullable()
    })
  ).min(1)
});

export const ScheduleMaintenanceSchema = z.object({
  assetId: z.string().uuid(),
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "WARRANTY_REPAIR", "AMC_SERVICE", "UPGRADE"]).default("CORRECTIVE"),
  description: z.string().min(1),
  cost: z.number().min(0).default(0),
  scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  serviceProvider: z.string().optional().nullable(),
  isUnderWarranty: z.boolean().default(false),
  isUnderAMC: z.boolean().default(false),
  notes: z.string().optional().nullable()
});

export const CreateSoftwareLicenseSchema = z.object({
  name: z.string().min(1),
  publisher: z.string().min(1),
  type: z.enum(["PERPETUAL", "SUBSCRIPTION", "SEAT_BASED", "USER_BASED", "DEVICE_BASED", "ENTERPRISE_TIER"]).default("SEAT_BASED"),
  licenseKey: z.string().optional().nullable(),
  totalSeats: z.number().int().min(1).default(1),
  costPerSeat: z.number().min(0).default(0),
  totalCost: z.number().min(0).default(0),
  currency: z.string().default("INR"),
  purchaseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  expiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  vendorName: z.string().optional().nullable()
});

export const AssignLicenseSchema = z.object({
  employeeId: z.string().uuid()
});

export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().default("CONSUMABLE"),
  unit: z.string().default("PCS"),
  currentStock: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(10),
  unitCost: z.number().min(0).default(0),
  supplier: z.string().optional().nullable(),
  location: z.string().optional().nullable()
});

export const RecordInventoryMovementSchema = z.object({
  itemId: z.string().uuid(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().int().min(1),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetDto = z.infer<typeof UpdateAssetSchema>;
export type AssignAssetDto = z.infer<typeof AssignAssetSchema>;
export type TransferAssetDto = z.infer<typeof TransferAssetSchema>;
export type ReturnAssetDto = z.infer<typeof ReturnAssetSchema>;
export type BulkAssignAssetDto = z.infer<typeof BulkAssignAssetSchema>;
export type ScheduleMaintenanceDto = z.infer<typeof ScheduleMaintenanceSchema>;
export type CreateSoftwareLicenseDto = z.infer<typeof CreateSoftwareLicenseSchema>;
export type AssignLicenseDto = z.infer<typeof AssignLicenseSchema>;
export type CreateInventoryItemDto = z.infer<typeof CreateInventoryItemSchema>;
export type RecordInventoryMovementDto = z.infer<typeof RecordInventoryMovementSchema>;
