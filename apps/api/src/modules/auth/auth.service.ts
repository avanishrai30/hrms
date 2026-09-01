import { randomInt, randomUUID } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TenantStatus, UserStatus } from "@prisma/client";
import * as argon2 from "argon2";
import type { PermissionCode, TenantRoleCode } from "@vc-wms/shared-types";
import type { AuthenticatedRequest, PlatformJwtPayload, TenantJwtPayload } from "../common/request-context.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import type { EmailLoginDto, PlatformLoginDto, RequestOtpDto, VerifyOtpDto } from "./auth.schemas.js";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; status: string };
  tenant: { id: string; slug: string; name: string; status: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService
  ) {}

  async emailLogin(input: EmailLoginDto, request: AuthenticatedRequest): Promise<AuthTokens> {
    const membership = await this.findActiveMembership(input.tenantSlug, input.identifier);
    if (!membership.user.passwordHash || !(await argon2.verify(membership.user.passwordHash, input.password))) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    return this.createTenantSession(membership.id, input.deviceFingerprint, request);
  }

  async requestOtp(input: RequestOtpDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: input.tenantSlug } });
    if (!tenant || tenant.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedException("Tenant is unavailable.");
    }

    const code = String(randomInt(100000, 999999));
    const challenge = await this.prisma.otpChallenge.create({
      data: {
        tenantId: tenant.id,
        identifier: input.identifier.toLowerCase(),
        codeHash: await argon2.hash(code),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    return {
      challengeId: challenge.id,
      delivery: "email_or_sms",
      devCode: process.env.NODE_ENV === "production" ? undefined : code
    };
  }

  async verifyOtp(input: VerifyOtpDto, request: AuthenticatedRequest): Promise<AuthTokens> {
    const challenge = await this.prisma.otpChallenge.findUnique({ where: { id: input.challengeId } });
    if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
      throw new UnauthorizedException("OTP challenge is invalid.");
    }
    if (challenge.identifier !== input.identifier.toLowerCase()) {
      throw new UnauthorizedException("OTP challenge is invalid.");
    }
    if (!(await argon2.verify(challenge.codeHash, input.code))) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attemptCount: { increment: 1 } }
      });
      throw new UnauthorizedException("OTP challenge is invalid.");
    }

    await this.prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
    const membership = await this.findActiveMembership(input.tenantSlug, input.identifier);
    return this.createTenantSession(membership.id, input.deviceFingerprint, request);
  }

  async refresh(refreshToken: string | undefined): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required.");
    }
    const payload = this.jwtService.verify<{ sessionId: string; typ: "refresh" }>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET
    });
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        tenant: true,
        user: true,
        membership: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } }
      }
    });
    if (!session || session.revokedAt || session.expiresAt < new Date() || session.tenant.status !== TenantStatus.ACTIVE) {
      throw new UnauthorizedException("Session is invalid.");
    }
    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return this.createTenantSession(session.membershipId, session.deviceFingerprint, { headers: {} });
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const payload = this.jwtService.verify<{ sessionId: string; typ: "refresh" }>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET
    });
    await this.prisma.session.updateMany({
      where: { id: payload.sessionId },
      data: { revokedAt: new Date() }
    });
  }

  async platformLogin(input: PlatformLoginDto) {
    const user = await this.prisma.platformUser.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || user.status !== UserStatus.ACTIVE || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    const payload: PlatformJwtPayload = { sub: user.id, typ: "platform", platformRole: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "15m"
      })
    };
  }

  private async findActiveMembership(tenantSlug: string, identifier: string) {
    const normalized = identifier.toLowerCase();
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        tenant: { slug: tenantSlug, status: TenantStatus.ACTIVE },
        status: "ACTIVE",
        user: {
          status: UserStatus.ACTIVE,
          OR: [{ email: normalized }, { phone: identifier }]
        }
      },
      include: {
        tenant: true,
        user: true,
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
      }
    });
    if (!membership) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    return membership;
  }

  private async createTenantSession(
    membershipId: string,
    deviceFingerprint: string,
    request: AuthenticatedRequest
  ): Promise<AuthTokens> {
    const membership = await this.prisma.tenantMembership.findUniqueOrThrow({
      where: { id: membershipId },
      include: {
        tenant: true,
        user: true,
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
      }
    });
    const roleCodes = membership.roles.map((assignment) => assignment.role.code as TenantRoleCode);
    const permissions = Array.from(
      new Set(
        membership.roles.flatMap((assignment) =>
          assignment.role.permissions.map((permission) => permission.permission.code as PermissionCode)
        )
      )
    );
    const refreshTokenFamily = randomUUID();
    const session = await this.prisma.session.create({
      data: {
        tenantId: membership.tenantId,
        userId: membership.userId,
        membershipId: membership.id,
        refreshTokenHash: await argon2.hash(refreshTokenFamily),
        deviceFingerprint,
        ipAddress: request.ip,
        userAgent: this.userAgent(request),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    await this.prisma.user.update({ where: { id: membership.userId }, data: { lastLoginAt: new Date() } });
    await this.auditService.record({
      tenantId: membership.tenantId,
      actorUserId: membership.userId,
      actorMembershipId: membership.id,
      action: "auth.login",
      resourceType: "session",
      resourceId: session.id,
      metadata: { deviceFingerprint }
    });

    const payload: TenantJwtPayload = {
      sub: membership.userId,
      typ: "tenant",
      tenantId: membership.tenantId,
      tenantSlug: membership.tenant.slug,
      userId: membership.userId,
      membershipId: membership.id,
      roles: roleCodes,
      permissions,
      plan: membership.tenant.plan
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "15m"
      }),
      refreshToken: await this.jwtService.signAsync(
        { typ: "refresh", sessionId: session.id, family: refreshTokenFamily },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: "30d" }
      ),
      user: { id: membership.user.id, email: membership.user.email, status: membership.user.status },
      tenant: {
        id: membership.tenant.id,
        slug: membership.tenant.slug,
        name: membership.tenant.name,
        status: membership.tenant.status
      }
    };
  }

  private userAgent(request: AuthenticatedRequest): string | undefined {
    const value = request.headers["user-agent"];
    return Array.isArray(value) ? value[0] : value;
  }
}
