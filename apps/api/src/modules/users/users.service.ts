import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserStatus, type Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AssignRolesDto,
  CreateRoleDto,
  InviteUserDto,
  ResetAccessDto,
  RolePermissionsDto,
  UpdateRoleDto,
  UpdateUserStatusDto
} from "./users.schemas.js";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  listUsers(tenantId: string) {
    return this.prisma.tenantMembership.findMany({
      where: { tenantId },
      include: {
        user: true,
        employee: true,
        roles: { include: { role: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async inviteUser(tenantId: string, input: InviteUserDto, actorUserId: string, actorMembershipId: string) {
    if (input.employeeId) {
      await this.assertTenantEmployee(tenantId, input.employeeId);
    }
    const roles = await this.findRolesByCode(tenantId, input.roles);
    const user = await this.prisma.user.upsert({
      where: { id: await this.findExistingUserId(input.email, input.phone) },
      create: {
        email: input.email.toLowerCase(),
        phone: input.phone,
        status: UserStatus.INVITED
      },
      update: {
        phone: input.phone,
        status: UserStatus.INVITED
      }
    });
    const membership = await this.prisma.tenantMembership.upsert({
      where: { tenantId_userId: { tenantId, userId: user.id } },
      create: { tenantId, userId: user.id, employeeId: input.employeeId, status: "INVITED" },
      update: { employeeId: input.employeeId, status: "INVITED" }
    });
    await this.replaceRoles(tenantId, membership.id, roles.map((role) => role.id));
    if (input.employeeId) {
      await this.prisma.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId: input.employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "user.invited",
          entityType: "tenant_membership",
          entityId: membership.id,
          message: "User invited",
          metadata: { email: user.email, roles: input.roles }
        }
      });
    }
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "user.invited",
      resourceType: "tenant_membership",
      resourceId: membership.id,
      after: { email: user.email, roles: input.roles }
    });
    return this.getMembership(tenantId, membership.id);
  }

  async assignRoles(tenantId: string, membershipId: string, input: AssignRolesDto, actorUserId: string, actorMembershipId: string) {
    const before = await this.getMembership(tenantId, membershipId);

    const isDemotingOwner =
      before.roles.some((r) => r.role.code === "TENANT_OWNER") &&
      !input.roles.includes("TENANT_OWNER");

    if (isDemotingOwner) {
      const otherActiveOwnersCount = await this.prisma.tenantMembershipRole.count({
        where: {
          tenantId,
          membershipId: { not: membershipId },
          role: { code: "TENANT_OWNER" },
          membership: { status: "ACTIVE" }
        }
      });
      if (otherActiveOwnersCount === 0) {
        throw new BadRequestException("Cannot remove TENANT_OWNER role from the sole active organization owner.");
      }
    }

    const roles = await this.findRolesByCode(tenantId, input.roles);
    await this.replaceRoles(tenantId, membershipId, roles.map((role) => role.id));
    const after = await this.getMembership(tenantId, membershipId);
    if (after.employeeId) {
      await this.prisma.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId: after.employeeId,
          actorUserId,
          actorMembershipId,
          eventType: "role.assigned",
          entityType: "tenant_membership",
          entityId: membershipId,
          message: "Role assigned",
          metadata: { roles: input.roles }
        }
      });
    }
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "user.roles.assigned",
      resourceType: "tenant_membership",
      resourceId: membershipId,
      before: this.auditJson(before),
      after: this.auditJson(after)
    });
    return after;
  }

  async updateStatus(tenantId: string, membershipId: string, input: UpdateUserStatusDto, actorUserId: string, actorMembershipId: string) {
    const before = await this.getMembership(tenantId, membershipId);

    if (input.status !== "ACTIVE") {
      const hasOwnerRole = before.roles.some((r) => r.role.code === "TENANT_OWNER");
      if (hasOwnerRole) {
        const otherActiveOwnersCount = await this.prisma.tenantMembershipRole.count({
          where: {
            tenantId,
            membershipId: { not: membershipId },
            role: { code: "TENANT_OWNER" },
            membership: { status: "ACTIVE" }
          }
        });
        if (otherActiveOwnersCount === 0) {
          throw new BadRequestException("Cannot deactivate or suspend the sole active TENANT_OWNER.");
        }
      }
    }

    const membership = await this.prisma.tenantMembership.update({
      where: { id: membershipId },
      data: { status: input.status }
    });
    if (before.employeeId) {
      await this.prisma.employeeTimelineEvent.create({
        data: {
          tenantId,
          employeeId: before.employeeId,
          actorUserId,
          actorMembershipId,
          eventType: input.status === "ACTIVE" ? "user.activated" : "user.status.changed",
          entityType: "tenant_membership",
          entityId: membershipId,
          message: input.status === "ACTIVE" ? "User activated" : "User status changed",
          metadata: { previousStatus: before.status, newStatus: input.status }
        }
      });
    }
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "user.status.updated",
      resourceType: "tenant_membership",
      resourceId: membershipId,
      before: this.auditJson(before),
      after: this.auditJson(membership)
    });
    return membership;
  }

  async resetAccess(tenantId: string, membershipId: string, input: ResetAccessDto, actorUserId: string, actorMembershipId: string) {
    const membership = await this.getMembership(tenantId, membershipId);
    await this.prisma.session.updateMany({
      where: { tenantId, membershipId },
      data: { revokedAt: new Date() }
    });
    await this.auditService.record({
      tenantId,
      actorUserId,
      actorMembershipId,
      action: "user.access.reset",
      resourceType: "tenant_membership",
      resourceId: membershipId,
      metadata: { reason: input.reason, userId: membership.userId }
    });
    return { ok: true };
  }

  listRoles(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId },
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: "asc" }
    });
  }

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ resource: "asc" }, { action: "asc" }] });
  }

  createRole(tenantId: string, input: CreateRoleDto) {
    return this.prisma.role.create({
      data: { tenantId, code: input.code, name: input.name, description: input.description, isSystemRole: false }
    });
  }

  async updateRole(tenantId: string, roleId: string, input: UpdateRoleDto) {
    await this.assertTenantRole(tenantId, roleId);
    return this.prisma.role.update({ where: { id: roleId }, data: input });
  }

  async updateRolePermissions(tenantId: string, roleId: string, input: RolePermissionsDto) {
    await this.assertTenantRole(tenantId, roleId);
    const permissions = await this.prisma.permission.findMany({ where: { code: { in: input.permissions } } });
    if (permissions.length !== input.permissions.length) {
      throw new BadRequestException("One or more permissions are unknown.");
    }
    await this.prisma.tenantRolePermission.deleteMany({ where: { tenantId, roleId } });
    await this.prisma.tenantRolePermission.createMany({
      data: permissions.map((permission) => ({ tenantId, roleId, permissionId: permission.id })),
      skipDuplicates: true
    });
    return this.prisma.role.findUniqueOrThrow({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } }
    });
  }

  private async findExistingUserId(email: string, phone?: string): Promise<string> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, ...(phone ? [{ phone }] : [])] }
    });
    return existing?.id ?? "00000000-0000-0000-0000-000000000000";
  }

  private async findRolesByCode(tenantId: string, codes: string[]) {
    const roles = await this.prisma.role.findMany({ where: { tenantId, code: { in: codes } } });
    if (roles.length !== codes.length) {
      throw new BadRequestException("One or more roles are unknown for this tenant.");
    }
    return roles;
  }

  private async replaceRoles(tenantId: string, membershipId: string, roleIds: string[]): Promise<void> {
    await this.prisma.tenantMembershipRole.deleteMany({ where: { tenantId, membershipId } });
    await this.prisma.tenantMembershipRole.createMany({
      data: roleIds.map((roleId) => ({ tenantId, membershipId, roleId })),
      skipDuplicates: true
    });
  }

  private async getMembership(tenantId: string, membershipId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { id: membershipId, tenantId },
      include: { user: true, employee: true, roles: { include: { role: true } } }
    });
    if (!membership) {
      throw new NotFoundException("User membership was not found.");
    }
    return membership;
  }

  private async assertTenantRole(tenantId: string, roleId: string): Promise<void> {
    const role = await this.prisma.role.findFirst({ where: { id: roleId, tenantId } });
    if (!role) {
      throw new NotFoundException("Role was not found.");
    }
  }

  private async assertTenantEmployee(tenantId: string, employeeId: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, tenantId }, select: { id: true } });
    if (!employee) {
      throw new BadRequestException("Employee does not exist in this tenant.");
    }
  }

  private auditJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
