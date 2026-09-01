import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Response } from "express";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { AuthenticatedRequest } from "../common/request-context.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { AuthService } from "./auth.service.js";
import {
  emailLoginSchema,
  platformLoginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  type EmailLoginDto,
  type PlatformLoginDto,
  type RequestOtpDto,
  type VerifyOtpDto
} from "./auth.schemas.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async emailLogin(
    @Body(new ZodValidationPipe(emailLoginSchema)) body: EmailLoginDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.emailLogin(body, request);
    response.cookie("vc_wms_refresh", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return { accessToken: result.accessToken, user: result.user, tenant: result.tenant };
  }

  @Post("otp/request")
  async requestOtp(@Body(new ZodValidationPipe(requestOtpSchema)) body: RequestOtpDto) {
    return this.authService.requestOtp(body);
  }

  @Post("otp/verify")
  async verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpSchema)) body: VerifyOtpDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.verifyOtp(body, request);
    response.cookie("vc_wms_refresh", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return { accessToken: result.accessToken, user: result.user, tenant: result.tenant };
  }

  @Post("refresh")
  async refresh(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.refresh(request.cookies?.vc_wms_refresh);
    response.cookie("vc_wms_refresh", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return { accessToken: result.accessToken, user: result.user, tenant: result.tenant };
  }

  @Post("logout")
  async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.vc_wms_refresh);
    response.clearCookie("vc_wms_refresh");
    return { ok: true };
  }

  @Get("me")
  @RequirePermissions("tenant.dashboard.read")
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}

@Controller("platform/auth")
export class PlatformAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body(new ZodValidationPipe(platformLoginSchema)) body: PlatformLoginDto) {
    return this.authService.platformLogin(body);
  }
}

