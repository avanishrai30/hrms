import { z } from "zod";

export const createBusinessUnitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric with optional dashes or underscores"),
  description: z.string().optional().nullable(),
  headUserId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateBusinessUnitSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  headUserId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional()
});

export const createRegionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric with optional dashes or underscores"),
  description: z.string().optional().nullable(),
  businessUnitId: z.string().uuid().optional().nullable(),
  headUserId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateRegionSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  businessUnitId: z.string().uuid().optional().nullable(),
  headUserId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional()
});

export const createTeamSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric with optional dashes or underscores"),
  description: z.string().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  leadUserId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  leadUserId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional()
});

export const assignReportingManagerSchema = z.object({
  employeeId: z.string().uuid(),
  managerId: z.string().uuid().optional().nullable(),
  managerEmployeeId: z.string().uuid().optional().nullable()
});

export const assignEmployeeOrgSchema = z.object({
  businessUnitId: z.string().uuid().optional().nullable(),
  regionId: z.string().uuid().optional().nullable(),
  teamId: z.string().uuid().optional().nullable()
});

export const organizationFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  businessUnitId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional()
});

// Alias uppercase versions for consistency
export const CreateBusinessUnitSchema = createBusinessUnitSchema;
export const UpdateBusinessUnitSchema = updateBusinessUnitSchema;
export const CreateRegionSchema = createRegionSchema;
export const UpdateRegionSchema = updateRegionSchema;
export const CreateTeamSchema = createTeamSchema;
export const UpdateTeamSchema = updateTeamSchema;
export const AssignReportingManagerSchema = assignReportingManagerSchema;
export const AssignEmployeeOrgSchema = assignEmployeeOrgSchema;

export type CreateBusinessUnitDto = z.input<typeof createBusinessUnitSchema>;
export type UpdateBusinessUnitDto = z.input<typeof updateBusinessUnitSchema>;
export type CreateRegionDto = z.input<typeof createRegionSchema>;
export type UpdateRegionDto = z.input<typeof updateRegionSchema>;
export type CreateTeamDto = z.input<typeof createTeamSchema>;
export type UpdateTeamDto = z.input<typeof updateTeamSchema>;
export type AssignReportingManagerDto = z.input<typeof assignReportingManagerSchema>;
export type AssignEmployeeOrgDto = z.input<typeof assignEmployeeOrgSchema>;
export type OrganizationFilterDto = z.input<typeof organizationFilterSchema>;
