import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  roles: z.array(z.string().min(2)).min(1),
  employeeId: z.string().uuid().optional()
});

export const assignRolesSchema = z.object({
  roles: z.array(z.string().min(2)).min(1)
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "REMOVED"])
});

export const resetAccessSchema = z.object({
  reason: z.string().min(8)
});

export const createRoleSchema = z.object({
  code: z.string().min(2).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2),
  description: z.string().optional()
});

export const updateRoleSchema = createRoleSchema.partial();

export const rolePermissionsSchema = z.object({
  permissions: z.array(z.string().min(3))
});

export type InviteUserDto = z.infer<typeof inviteUserSchema>;
export type AssignRolesDto = z.infer<typeof assignRolesSchema>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;
export type ResetAccessDto = z.infer<typeof resetAccessSchema>;
export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type RolePermissionsDto = z.infer<typeof rolePermissionsSchema>;

