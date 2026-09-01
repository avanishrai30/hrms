import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { requireTenantContext } from "../common/tenant-context.js";
import type { AuthenticatedRequest } from "../common/request-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  assignRolesSchema,
  createRoleSchema,
  inviteUserSchema,
  resetAccessSchema,
  rolePermissionsSchema,
  updateRoleSchema,
  updateUserStatusSchema,
  type AssignRolesDto,
  type CreateRoleDto,
  type InviteUserDto,
  type ResetAccessDto,
  type RolePermissionsDto,
  type UpdateRoleDto,
  type UpdateUserStatusDto
} from "./users.schemas.js";
import { UsersService } from "./users.service.js";

@Controller("admin/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions("users.read")
  list(@Req() request: AuthenticatedRequest) {
    return this.usersService.listUsers(requireTenantContext(request).tenantId);
  }

  @Post("invite")
  @RequirePermissions("users.invite")
  invite(@Body(new ZodValidationPipe(inviteUserSchema)) body: InviteUserDto, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.usersService.inviteUser(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":membershipId/roles")
  @RequirePermissions("users.update")
  assignRoles(
    @Param("membershipId") membershipId: string,
    @Body(new ZodValidationPipe(assignRolesSchema)) body: AssignRolesDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.usersService.assignRoles(tenant.tenantId, membershipId, body, tenant.userId, tenant.membershipId);
  }

  @Patch(":membershipId/status")
  @RequirePermissions("users.deactivate")
  updateStatus(
    @Param("membershipId") membershipId: string,
    @Body(new ZodValidationPipe(updateUserStatusSchema)) body: UpdateUserStatusDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.usersService.updateStatus(tenant.tenantId, membershipId, body, tenant.userId, tenant.membershipId);
  }

  @Post(":membershipId/reset-access")
  @RequirePermissions("users.reset_access")
  resetAccess(
    @Param("membershipId") membershipId: string,
    @Body(new ZodValidationPipe(resetAccessSchema)) body: ResetAccessDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.usersService.resetAccess(tenant.tenantId, membershipId, body, tenant.userId, tenant.membershipId);
  }
}

@Controller("tenant/roles")
export class RolesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions("roles.read")
  list(@Req() request: AuthenticatedRequest) {
    return this.usersService.listRoles(requireTenantContext(request).tenantId);
  }

  @Post()
  @RequirePermissions("roles.create")
  create(@Body(new ZodValidationPipe(createRoleSchema)) body: CreateRoleDto, @Req() request: AuthenticatedRequest) {
    return this.usersService.createRole(requireTenantContext(request).tenantId, body);
  }

  @Patch(":roleId")
  @RequirePermissions("roles.update")
  update(
    @Param("roleId") roleId: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) body: UpdateRoleDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.usersService.updateRole(requireTenantContext(request).tenantId, roleId, body);
  }

  @Patch(":roleId/permissions")
  @RequirePermissions("roles.update")
  updatePermissions(
    @Param("roleId") roleId: string,
    @Body(new ZodValidationPipe(rolePermissionsSchema)) body: RolePermissionsDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.usersService.updateRolePermissions(requireTenantContext(request).tenantId, roleId, body);
  }
}

@Controller("tenant/permissions")
export class PermissionsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions("permissions.read")
  list() {
    return this.usersService.listPermissions();
  }
}
