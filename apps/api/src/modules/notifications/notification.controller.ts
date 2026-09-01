import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import { type AuthenticatedRequest } from "../common/request-context.js";
import { requireTenantContext } from "../common/tenant-context.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import {
  createNotificationTemplateSchema,
  notificationPreferencesSchema,
  notificationQuerySchema,
  sendNotificationSchema,
  updateNotificationTemplateSchema,
  type CreateNotificationTemplateDto,
  type NotificationPreferencesDto,
  type NotificationQueryDto,
  type SendNotificationDto,
  type UpdateNotificationTemplateDto
} from "./notification.schemas.js";
import { NotificationService } from "./notification.service.js";

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("me")
  @RequirePermissions("notifications.view")
  async getMyNotifications(
    @Query(new ZodValidationPipe(notificationQuerySchema)) query: NotificationQueryDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.notificationService.getInAppNotifications(tenant.tenantId, tenant.userId, query);
  }

  @Post("me/read/:id")
  @RequirePermissions("notifications.view")
  async markAsRead(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.notificationService.markAsRead(tenant.tenantId, id, tenant.userId, tenant.membershipId);
  }

  @Post("me/read-all")
  @RequirePermissions("notifications.view")
  async markAllAsRead(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.notificationService.markAllAsRead(tenant.tenantId, tenant.userId, tenant.membershipId);
  }

  @Get("me/unread-count")
  @RequirePermissions("notifications.view")
  async getUnreadCount(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.notificationService.getUnreadCount(tenant.tenantId, tenant.userId);
  }

  @Get("preferences")
  @RequirePermissions("notifications.view")
  async getPreferences(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.notificationService.getPreferences(tenant.tenantId, tenant.userId);
  }

  @Put("preferences")
  @RequirePermissions("notifications.view")
  async updatePreferences(
    @Body(new ZodValidationPipe(notificationPreferencesSchema)) body: NotificationPreferencesDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.notificationService.updatePreferences(
      tenant.tenantId,
      tenant.userId,
      body,
      tenant.userId,
      tenant.membershipId
    );
  }

  @Post("send")
  @RequirePermissions("notifications.send")
  async send(
    @Body(new ZodValidationPipe(sendNotificationSchema)) body: SendNotificationDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.notificationService.send(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Get("templates")
  @RequirePermissions("notifications.manage")
  async listTemplates(@Req() request: AuthenticatedRequest) {
    const tenant = requireTenantContext(request);
    return this.notificationService.listTemplates(tenant.tenantId);
  }

  @Post("templates")
  @RequirePermissions("notifications.manage")
  async createTemplate(
    @Body(new ZodValidationPipe(createNotificationTemplateSchema)) body: CreateNotificationTemplateDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.notificationService.createTemplate(tenant.tenantId, body, tenant.userId, tenant.membershipId);
  }

  @Put("templates/:id")
  @RequirePermissions("notifications.manage")
  async updateTemplate(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateNotificationTemplateSchema)) body: UpdateNotificationTemplateDto,
    @Req() request: AuthenticatedRequest
  ) {
    const tenant = requireTenantContext(request);
    return this.notificationService.updateTemplate(tenant.tenantId, id, body, tenant.userId, tenant.membershipId);
  }
}
