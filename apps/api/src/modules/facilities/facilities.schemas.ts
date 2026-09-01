import { z } from "zod";

export const CreateFacilitySchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    "MEETING_ROOM",
    "CONFERENCE_HALL",
    "TRAINING_ROOM",
    "EXECUTIVE_CABIN",
    "WORKSTATION",
    "CAFETERIA",
    "AUDITORIUM"
  ]).default("MEETING_ROOM"),
  building: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  capacity: z.number().int().min(1).default(6),
  amenities: z.array(z.string()).optional().default([])
});

export const BookFacilitySchema = z.object({
  facilityId: z.string().uuid(),
  title: z.string().min(1),
  startTime: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  endTime: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  attendees: z.number().int().min(1).default(1),
  purpose: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const CreateDeskSchema = z.object({
  deskNumber: z.string().min(1),
  floor: z.string().min(1),
  zone: z.string().min(1),
  type: z.enum(["HOT_DESK", "DEDICATED", "EXECUTIVE", "VISITOR"]).default("HOT_DESK")
});

export const AllocateDeskSchema = z.object({
  deskId: z.string().uuid(),
  employeeId: z.string().uuid(),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  isPermanent: z.boolean().default(false)
});

export const CreateVehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  type: z.string().default("SEDAN"),
  capacity: z.number().int().min(1).default(4),
  driverName: z.string().optional().nullable(),
  driverPhone: z.string().optional().nullable(),
  insuranceExpiry: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  currentOdometer: z.number().min(0).default(0),
  notes: z.string().optional().nullable()
});

export const BookVehicleSchema = z.object({
  vehicleId: z.string().uuid(),
  purpose: z.string().min(1),
  destination: z.string().min(1),
  startTime: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  endTime: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  passengers: z.number().int().min(1).default(1),
  notes: z.string().optional().nullable()
});

export const RecordVehicleLogSchema = z.object({
  vehicleId: z.string().uuid(),
  logType: z.enum(["TRIP", "FUEL", "SERVICE"]).default("TRIP"),
  odometerReading: z.number().min(0),
  fuelLiters: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).default(0),
  remarks: z.string().optional().nullable()
});

export type CreateFacilityDto = z.infer<typeof CreateFacilitySchema>;
export type BookFacilityDto = z.infer<typeof BookFacilitySchema>;
export type CreateDeskDto = z.infer<typeof CreateDeskSchema>;
export type AllocateDeskDto = z.infer<typeof AllocateDeskSchema>;
export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type BookVehicleDto = z.infer<typeof BookVehicleSchema>;
export type RecordVehicleLogDto = z.infer<typeof RecordVehicleLogSchema>;
