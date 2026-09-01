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
import type { Request } from "express";
import { AssetsService } from "./assets.service.js";
import { RequirePermissions } from "../rbac/permissions.decorator.js";
import { requireTenantContext } from "../common/tenant-context.js";
import {
  CreateAssetSchema,
  UpdateAssetSchema,
  AssignAssetSchema,
  TransferAssetSchema,
  ReturnAssetSchema,
  BulkAssignAssetSchema,
  ScheduleMaintenanceSchema,
  CreateSoftwareLicenseSchema,
  AssignLicenseSchema,
  CreateInventoryItemSchema,
  RecordInventoryMovementSchema
} from "./assets.schemas.js";
import type { AssetCategory, AssetStatus } from "@prisma/client";

@Controller("api/v1/assets")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @RequirePermissions("assets.view")
  async listAssets(
    @Req() req: Request,
    @Query("category") category?: AssetCategory,
    @Query("status") status?: AssetStatus,
    @Query("search") search?: string,
    @Query("currentHolderId") currentHolderId?: string
  ) {
    const ctx = requireTenantContext(req);
    return this.assetsService.listAssets(ctx.tenantId, {
      category,
      status,
      search,
      currentHolderId
    });
  }

  @Get("depreciation/calculate")
  @RequirePermissions("assets.view")
  async getDepreciationReport(
    @Req() req: Request,
    @Query("method") method?: "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE",
    @Query("asOfDate") asOfDate?: string
  ) {
    const ctx = requireTenantContext(req);
    return this.assetsService.getDepreciationReport(ctx.tenantId, { method, asOfDate });
  }

  @Get("maintenance")
  @RequirePermissions("assets.view")
  async listMaintenances(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.assetsService.listMaintenances(ctx.tenantId);
  }

  @Post("maintenance")
  @RequirePermissions("assets.manage")
  async scheduleMaintenance(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = ScheduleMaintenanceSchema.parse(body);
    return this.assetsService.scheduleMaintenance(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, dto);
  }

  @Get("alerts/expiry")
  @RequirePermissions("assets.view")
  async getWarrantyAndAMCAlerts(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.assetsService.getWarrantyAndAMCAlerts(ctx.tenantId);
  }

  @Get("licenses")
  @RequirePermissions("assets.view")
  async listLicenses(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.assetsService.listLicenses(ctx.tenantId);
  }

  @Post("licenses")
  @RequirePermissions("assets.manage")
  async createLicense(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateSoftwareLicenseSchema.parse(body);
    return this.assetsService.createLicense(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, dto);
  }

  @Post("licenses/:id/assign")
  @RequirePermissions("assets.manage")
  async assignLicense(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = AssignLicenseSchema.parse(body);
    return this.assetsService.assignLicense(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, dto);
  }

  @Get("inventory")
  @RequirePermissions("inventory.view")
  async listInventory(@Req() req: Request) {
    const ctx = requireTenantContext(req);
    return this.assetsService.listInventory(ctx.tenantId);
  }

  @Post("inventory")
  @RequirePermissions("inventory.manage")
  async createInventoryItem(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateInventoryItemSchema.parse(body);
    return this.assetsService.createInventoryItem(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, dto);
  }

  @Post("inventory/movement")
  @RequirePermissions("inventory.manage")
  async recordInventoryMovement(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = RecordInventoryMovementSchema.parse(body);
    return this.assetsService.recordInventoryMovement(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, dto);
  }

  @Post("bulk-assign")
  @RequirePermissions("assets.manage")
  async bulkAssignAssets(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = BulkAssignAssetSchema.parse(body);
    return this.assetsService.bulkAssignAssets(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, dto);
  }

  @Get(":id")
  @RequirePermissions("assets.view")
  async getAssetById(@Req() req: Request, @Param("id") id: string) {
    const ctx = requireTenantContext(req);
    return this.assetsService.getAssetById(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions("assets.manage")
  async createAsset(@Req() req: Request, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = CreateAssetSchema.parse(body);
    return this.assetsService.createAsset(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, dto);
  }

  @Put(":id")
  @RequirePermissions("assets.manage")
  async updateAsset(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = UpdateAssetSchema.parse(body);
    return this.assetsService.updateAsset(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, dto);
  }

  @Post(":id/assign")
  @RequirePermissions("assets.manage")
  async assignAsset(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = AssignAssetSchema.parse(body);
    return this.assetsService.assignAsset(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, dto);
  }

  @Post(":id/transfer")
  @RequirePermissions("assets.manage")
  async transferAsset(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = TransferAssetSchema.parse(body);
    return this.assetsService.transferAsset(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, dto);
  }

  @Post(":id/return")
  @RequirePermissions("assets.manage")
  async returnAsset(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = requireTenantContext(req);
    const dto = ReturnAssetSchema.parse(body);
    return this.assetsService.returnAsset(ctx.tenantId, { userId: ctx.userId, membershipId: ctx.membershipId }, id, dto);
  }
}
