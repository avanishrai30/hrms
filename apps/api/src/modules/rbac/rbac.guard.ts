import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { hasPermission } from "@vc-wms/auth";
import type { PermissionCode } from "@vc-wms/shared-types";
import type { AuthenticatedRequest, PlatformJwtPayload, TenantJwtPayload } from "../common/request-context.js";
import { PERMISSIONS_KEY, PLATFORM_KEY } from "./permissions.decorator.js";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const platformRequired = this.reflector.getAllAndOverride<boolean>(PLATFORM_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!required?.length && !platformRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException("Authentication is required.");
    }

    if (platformRequired) {
      request.platformUser = this.jwtService.verify<PlatformJwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET
      });
      if (request.platformUser.typ !== "platform") {
        throw new ForbiddenException("Platform access is required.");
      }
      return true;
    }

    request.user = this.jwtService.verify<TenantJwtPayload>(token, {
      secret: process.env.JWT_ACCESS_SECRET
    });
    if (request.user.typ !== "tenant") {
      throw new ForbiddenException("Tenant access is required.");
    }

    for (const permission of required ?? []) {
      if (!hasPermission(request.user.permissions, permission)) {
        throw new ForbiddenException(`Missing permission: ${permission}`);
      }
    }

    return true;
  }

  private extractBearerToken(request: AuthenticatedRequest): string | null {
    const authorization = request.headers.authorization;
    const value = Array.isArray(authorization) ? authorization[0] : authorization;
    if (!value?.startsWith("Bearer ")) {
      return null;
    }
    return value.slice("Bearer ".length);
  }
}

