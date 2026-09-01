import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import { AssetAssignmentEngine } from "./engines/asset-assignment.engine.js";
import { DepreciationEngine } from "./engines/depreciation.engine.js";
import {
  type AssetCategory,
  type AssetCondition,
  type AssetStatus,
  type AssetTransactionType,
  type MaintenanceType,
  type LicenseType,
  type DepreciationMethod,
  Prisma
} from "@prisma/client";
import type {
  CreateAssetDto,
  UpdateAssetDto,
  AssignAssetDto,
  TransferAssetDto,
  ReturnAssetDto,
  BulkAssignAssetDto,
  ScheduleMaintenanceDto,
  CreateSoftwareLicenseDto,
  AssignLicenseDto,
  CreateInventoryItemDto,
  RecordInventoryMovementDto
} from "./assets.schemas.js";

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private async recordAudit(
    tenantId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    userId?: string,
    membershipId?: string
  ) {
    return this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorMembershipId: membershipId,
      action,
      resourceType,
      resourceId,
      metadata: (metadata ?? {}) as unknown as Prisma.InputJsonValue
    });
  }

  // -------------------------------------------------------------
  // 1. ASSET CRUD & REGISTRY
  // -------------------------------------------------------------

  async listAssets(
    tenantId: string,
    filters?: {
      category?: AssetCategory;
      status?: AssetStatus;
      search?: string;
      currentHolderId?: string;
    }
  ) {
    const where: Prisma.AssetWhereInput = {
      tenantId,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.currentHolderId && { currentHolderId: filters.currentHolderId }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { assetCode: { contains: filters.search, mode: "insensitive" } },
          { serialNumber: { contains: filters.search, mode: "insensitive" } },
          { brand: { contains: filters.search, mode: "insensitive" } },
          { model: { contains: filters.search, mode: "insensitive" } }
        ]
      })
    };

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        vendor: true,
        assignments: {
          where: { isReturned: false },
          include: { employee: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return assets.map((asset) => {
      const dep = DepreciationEngine.calculate({
        assetId: asset.id,
        assetCode: asset.assetCode,
        purchaseCost: asset.purchaseCost,
        purchaseDate: asset.purchaseDate,
        salvageValue: asset.salvageValue,
        usefulLifeYears: asset.usefulLifeYears,
        method: asset.depreciationMethod as "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE"
      });

      const currentAssignment = asset.assignments[0];
      return {
        ...asset,
        bookValue: dep.currentBookValue,
        currentHolder: currentAssignment
          ? {
              id: currentAssignment.employee.id,
              fullName: currentAssignment.employee.fullName,
              employeeCode: currentAssignment.employee.employeeCode
            }
          : null
      };
    });
  }

  async getAssetById(tenantId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      include: {
        vendor: true,
        categoryMaster: true,
        assignments: {
          include: {
            employee: true,
            issuedBy: true
          },
          orderBy: { assignedDate: "desc" }
        },
        transactions: {
          orderBy: { transactionDate: "desc" }
        },
        maintenances: {
          orderBy: { scheduledDate: "desc" }
        },
        warranties: true,
        amcs: true,
        tickets: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID "${id}" not found`);
    }

    const depreciation = DepreciationEngine.calculate({
      assetId: asset.id,
      assetCode: asset.assetCode,
      purchaseCost: asset.purchaseCost,
      purchaseDate: asset.purchaseDate,
      salvageValue: asset.salvageValue,
      usefulLifeYears: asset.usefulLifeYears,
      method: asset.depreciationMethod as "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE"
    });

    return {
      ...asset,
      depreciation
    };
  }

  async createAsset(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CreateAssetDto
  ) {
    const existing = await this.prisma.asset.findFirst({
      where: {
        tenantId,
        OR: [{ assetCode: dto.assetCode }, { serialNumber: dto.serialNumber }]
      }
    });

    if (existing) {
      throw new BadRequestException(
        `Asset with code "${dto.assetCode}" or serial number "${dto.serialNumber}" already exists`
      );
    }

    const asset = await this.prisma.asset.create({
      data: {
        tenantId,
        category: dto.category as AssetCategory,
        assetCode: dto.assetCode,
        serialNumber: dto.serialNumber,
        name: dto.name,
        model: dto.model,
        brand: dto.brand,
        specificationsJson: dto.specificationsJson as unknown as Prisma.InputJsonValue,
        purchaseDate: new Date(dto.purchaseDate),
        purchaseCost: dto.purchaseCost,
        currency: dto.currency,
        location: dto.location,
        condition: dto.condition as AssetCondition,
        status: dto.status as AssetStatus,
        usefulLifeYears: dto.usefulLifeYears,
        salvageValue: dto.salvageValue,
        depreciationMethod: dto.depreciationMethod as DepreciationMethod,
        notes: dto.notes,
        transactions: {
          create: {
            tenantId,
            type: "PURCHASE" as AssetTransactionType,
            condition: dto.condition as AssetCondition,
            detailsJson: { purchaseCost: dto.purchaseCost, currency: dto.currency } as unknown as Prisma.InputJsonValue,
            actionByUserId: actorContext.userId,
            notes: "Initial Asset Registration"
          }
        }
      }
    });

    await this.recordAudit(
      tenantId,
      "ASSET_CREATED",
      "Asset",
      asset.id,
      { assetCode: asset.assetCode, name: asset.name },
      actorContext.userId,
      actorContext.membershipId
    );

    return asset;
  }

  async updateAsset(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    id: string,
    dto: UpdateAssetDto
  ) {
    await this.getAssetById(tenantId, id);

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category as AssetCategory }),
        ...(dto.name && { name: dto.name }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.condition && { condition: dto.condition as AssetCondition }),
        ...(dto.status && { status: dto.status as AssetStatus }),
        ...(dto.usefulLifeYears !== undefined && { usefulLifeYears: dto.usefulLifeYears }),
        ...(dto.salvageValue !== undefined && { salvageValue: dto.salvageValue }),
        ...(dto.depreciationMethod && { depreciationMethod: dto.depreciationMethod as DepreciationMethod }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.specificationsJson && {
          specificationsJson: dto.specificationsJson as unknown as Prisma.InputJsonValue
        })
      }
    });

    await this.recordAudit(
      tenantId,
      "ASSET_UPDATED",
      "Asset",
      id,
      { changes: dto },
      actorContext.userId,
      actorContext.membershipId
    );

    return updated;
  }

  // -------------------------------------------------------------
  // 2. ASSIGNMENTS & TRANSFERS
  // -------------------------------------------------------------

  async assignAsset(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    assetId: string,
    dto: AssignAssetDto
  ) {
    const asset = await this.getAssetById(tenantId, assetId);
    const validation = AssetAssignmentEngine.validateAssignment({
      currentStatus: asset.status,
      isScrapped: asset.isScrapped,
      currentHolderId: asset.currentHolderId
    });

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${dto.employeeId}" not found`);
    }

    const [assignment, updatedAsset] = await this.prisma.$transaction([
      this.prisma.assetAssignment.create({
        data: {
          tenantId,
          assetId,
          employeeId: dto.employeeId,
          condition: dto.condition as AssetCondition,
          agreementUrl: dto.agreementUrl,
          notes: dto.notes
        }
      }),
      this.prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "ASSIGNED" as AssetStatus,
          currentHolderId: dto.employeeId,
          condition: dto.condition as AssetCondition
        }
      }),
      this.prisma.assetTransaction.create({
        data: {
          tenantId,
          assetId,
          type: "ASSIGNMENT" as AssetTransactionType,
          toEmployeeId: dto.employeeId,
          condition: dto.condition as AssetCondition,
          actionByUserId: actorContext.userId,
          notes: dto.notes || `Assigned to ${employee.fullName}`
        }
      })
    ]);

    await this.recordAudit(
      tenantId,
      "ASSET_ASSIGNED",
      "Asset",
      assetId,
      { employeeId: dto.employeeId, assignmentId: assignment.id },
      actorContext.userId,
      actorContext.membershipId
    );

    return { assignment, asset: updatedAsset };
  }

  async transferAsset(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    assetId: string,
    dto: TransferAssetDto
  ) {
    const asset = await this.getAssetById(tenantId, assetId);
    const validation = AssetAssignmentEngine.validateTransfer(
      {
        currentStatus: asset.status,
        isScrapped: asset.isScrapped,
        currentHolderId: asset.currentHolderId
      },
      dto.toEmployeeId
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const targetEmployee = await this.prisma.employee.findFirst({
      where: { id: dto.toEmployeeId, tenantId }
    });
    if (!targetEmployee) {
      throw new NotFoundException(`Target employee with ID "${dto.toEmployeeId}" not found`);
    }

    const fromEmployeeId = asset.currentHolderId;

    await this.prisma.$transaction([
      // Close active assignment
      this.prisma.assetAssignment.updateMany({
        where: { tenantId, assetId, isReturned: false },
        data: {
          isReturned: true,
          returnedDate: new Date(),
          returnCondition: dto.condition as AssetCondition,
          notes: `Transferred to ${targetEmployee.fullName}`
        }
      }),
      // Create new assignment
      this.prisma.assetAssignment.create({
        data: {
          tenantId,
          assetId,
          employeeId: dto.toEmployeeId,
          condition: dto.condition as AssetCondition,
          notes: dto.notes
        }
      }),
      // Update asset holder
      this.prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "ASSIGNED" as AssetStatus,
          currentHolderId: dto.toEmployeeId,
          condition: dto.condition as AssetCondition
        }
      }),
      // Record transaction
      this.prisma.assetTransaction.create({
        data: {
          tenantId,
          assetId,
          type: "TRANSFER" as AssetTransactionType,
          fromEmployeeId,
          toEmployeeId: dto.toEmployeeId,
          condition: dto.condition as AssetCondition,
          actionByUserId: actorContext.userId,
          notes: dto.notes || `Transferred to ${targetEmployee.fullName}`
        }
      })
    ]);

    await this.recordAudit(
      tenantId,
      "ASSET_TRANSFERRED",
      "Asset",
      assetId,
      { fromEmployeeId, toEmployeeId: dto.toEmployeeId },
      actorContext.userId,
      actorContext.membershipId
    );

    return { message: "Asset successfully transferred", assetId, toEmployeeId: dto.toEmployeeId };
  }

  async returnAsset(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    assetId: string,
    dto: ReturnAssetDto
  ) {
    const asset = await this.getAssetById(tenantId, assetId);
    const validation = AssetAssignmentEngine.validateReturn({
      currentStatus: asset.status,
      isScrapped: asset.isScrapped,
      currentHolderId: asset.currentHolderId
    });

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const fromEmployeeId = asset.currentHolderId;

    await this.prisma.$transaction([
      this.prisma.assetAssignment.updateMany({
        where: { tenantId, assetId, isReturned: false },
        data: {
          isReturned: true,
          returnedDate: new Date(),
          returnCondition: dto.returnCondition as AssetCondition,
          notes: dto.notes
        }
      }),
      this.prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "AVAILABLE" as AssetStatus,
          currentHolderId: null,
          condition: dto.returnCondition as AssetCondition
        }
      }),
      this.prisma.assetTransaction.create({
        data: {
          tenantId,
          assetId,
          type: "RETURN" as AssetTransactionType,
          fromEmployeeId,
          condition: dto.returnCondition as AssetCondition,
          actionByUserId: actorContext.userId,
          notes: dto.notes || "Returned to inventory"
        }
      })
    ]);

    await this.recordAudit(
      tenantId,
      "ASSET_RETURNED",
      "Asset",
      assetId,
      { fromEmployeeId, returnCondition: dto.returnCondition },
      actorContext.userId,
      actorContext.membershipId
    );

    return { message: "Asset successfully returned to inventory", assetId };
  }

  async bulkAssignAssets(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: BulkAssignAssetDto
  ) {
    const results = [];
    for (const item of dto.assignments) {
      try {
        await this.assignAsset(tenantId, actorContext, item.assetId, {
          employeeId: item.employeeId,
          condition: "GOOD",
          notes: item.notes || "Bulk assignment"
        });
        results.push({ assetId: item.assetId, employeeId: item.employeeId, status: "SUCCESS" });
      } catch (err: unknown) {
        results.push({
          assetId: item.assetId,
          employeeId: item.employeeId,
          status: "FAILED",
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
    return { summary: results, total: dto.assignments.length };
  }

  // -------------------------------------------------------------
  // 3. DEPRECIATION & VALUATION
  // -------------------------------------------------------------

  async getDepreciationReport(
    tenantId: string,
    options?: { method?: "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE"; asOfDate?: string }
  ) {
    const assets = await this.prisma.asset.findMany({
      where: { tenantId, isScrapped: false }
    });

    const report = assets.map((asset) => {
      return DepreciationEngine.calculate({
        assetId: asset.id,
        assetCode: asset.assetCode,
        purchaseCost: asset.purchaseCost,
        purchaseDate: asset.purchaseDate,
        salvageValue: asset.salvageValue,
        usefulLifeYears: asset.usefulLifeYears,
        method: options?.method || (asset.depreciationMethod as "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE"),
        asOfDate: options?.asOfDate
      });
    });

    const totalCost = report.reduce((sum, item) => sum + item.purchaseCost, 0);
    const totalAccumulated = report.reduce((sum, item) => sum + item.accumulatedDepreciation, 0);
    const totalBookValue = report.reduce((sum, item) => sum + item.currentBookValue, 0);
    const totalMonthlyExpense = report.reduce((sum, item) => sum + item.monthlyDepreciation, 0);

    return {
      summary: {
        totalAssets: report.length,
        totalCost: Math.round(totalCost * 100) / 100,
        totalAccumulatedDepreciation: Math.round(totalAccumulated * 100) / 100,
        totalBookValue: Math.round(totalBookValue * 100) / 100,
        totalMonthlyExpense: Math.round(totalMonthlyExpense * 100) / 100
      },
      assets: report
    };
  }

  // -------------------------------------------------------------
  // 4. MAINTENANCE, WARRANTY & AMC
  // -------------------------------------------------------------

  async listMaintenances(tenantId: string) {
    return this.prisma.assetMaintenance.findMany({
      where: { tenantId },
      include: { asset: true },
      orderBy: { scheduledDate: "desc" }
    });
  }

  async scheduleMaintenance(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: ScheduleMaintenanceDto
  ) {
    await this.getAssetById(tenantId, dto.assetId);

    const maintenance = await this.prisma.assetMaintenance.create({
      data: {
        tenantId,
        assetId: dto.assetId,
        type: dto.type as MaintenanceType,
        description: dto.description,
        cost: dto.cost,
        scheduledDate: new Date(dto.scheduledDate),
        serviceProvider: dto.serviceProvider,
        isUnderWarranty: dto.isUnderWarranty,
        isUnderAMC: dto.isUnderAMC,
        notes: dto.notes,
        status: "SCHEDULED"
      }
    });

    await this.prisma.asset.update({
      where: { id: dto.assetId },
      data: { status: "IN_MAINTENANCE" as AssetStatus }
    });

    await this.recordAudit(
      tenantId,
      "MAINTENANCE_SCHEDULED",
      "AssetMaintenance",
      maintenance.id,
      { assetId: dto.assetId, scheduledDate: dto.scheduledDate },
      actorContext.userId,
      actorContext.membershipId
    );

    return maintenance;
  }

  async getWarrantyAndAMCAlerts(tenantId: string) {
    const now = new Date();
    const ninetyDaysAhead = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const [warranties, amcs] = await Promise.all([
      this.prisma.assetWarranty.findMany({
        where: {
          tenantId,
          endDate: { gte: now, lte: ninetyDaysAhead }
        },
        include: { asset: true, vendor: true },
        orderBy: { endDate: "asc" }
      }),
      this.prisma.assetAMC.findMany({
        where: {
          tenantId,
          endDate: { gte: now, lte: ninetyDaysAhead }
        },
        include: { asset: true, vendor: true },
        orderBy: { endDate: "asc" }
      })
    ]);

    const categorizeDays = (endDate: Date) => {
      const diffMs = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) return "7_DAYS";
      if (diffDays <= 30) return "30_DAYS";
      if (diffDays <= 60) return "60_DAYS";
      return "90_DAYS";
    };

    return {
      expiringWarranties: warranties.map((w) => ({
        id: w.id,
        assetCode: w.asset.assetCode,
        assetName: w.asset.name,
        warrantyCode: w.warrantyCode,
        endDate: w.endDate,
        vendor: w.vendor?.name,
        bucket: categorizeDays(w.endDate)
      })),
      expiringAMCs: amcs.map((a) => ({
        id: a.id,
        assetCode: a.asset.assetCode,
        assetName: a.asset.name,
        contractNumber: a.contractNumber,
        providerName: a.providerName,
        endDate: a.endDate,
        bucket: categorizeDays(a.endDate)
      }))
    };
  }

  // -------------------------------------------------------------
  // 5. SOFTWARE LICENSES
  // -------------------------------------------------------------

  async listLicenses(tenantId: string) {
    const licenses = await this.prisma.softwareLicense.findMany({
      where: { tenantId },
      include: {
        assignments: {
          where: { isActive: true },
          include: { employee: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return licenses.map((lic) => {
      const allocatedSeats = lic.assignments.length;
      const utilizationPercent =
        lic.totalSeats > 0 ? Math.round((allocatedSeats / lic.totalSeats) * 100) : 0;
      return {
        ...lic,
        allocatedSeats,
        availableSeats: Math.max(0, lic.totalSeats - allocatedSeats),
        utilizationPercent,
        isCompliant: allocatedSeats <= lic.totalSeats
      };
    });
  }

  async createLicense(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CreateSoftwareLicenseDto
  ) {
    const license = await this.prisma.softwareLicense.create({
      data: {
        tenantId,
        name: dto.name,
        publisher: dto.publisher,
        type: dto.type as LicenseType,
        licenseKey: dto.licenseKey,
        totalSeats: dto.totalSeats,
        costPerSeat: dto.costPerSeat,
        totalCost: dto.totalCost || dto.totalSeats * dto.costPerSeat,
        currency: dto.currency,
        purchaseDate: new Date(dto.purchaseDate),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        vendorName: dto.vendorName
      }
    });

    await this.recordAudit(
      tenantId,
      "LICENSE_CREATED",
      "SoftwareLicense",
      license.id,
      { name: license.name, totalSeats: license.totalSeats },
      actorContext.userId,
      actorContext.membershipId
    );

    return license;
  }

  async assignLicense(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    licenseId: string,
    dto: AssignLicenseDto
  ) {
    const license = await this.prisma.softwareLicense.findFirst({
      where: { id: licenseId, tenantId },
      include: { assignments: { where: { isActive: true } } }
    });

    if (!license) {
      throw new NotFoundException(`License with ID "${licenseId}" not found`);
    }

    if (license.assignments.length >= license.totalSeats) {
      throw new BadRequestException(
        `All ${license.totalSeats} seats for license "${license.name}" are already allocated`
      );
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId }
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${dto.employeeId}" not found`);
    }

    const assignment = await this.prisma.licenseAssignment.create({
      data: {
        tenantId,
        licenseId,
        employeeId: dto.employeeId
      }
    });

    await this.recordAudit(
      tenantId,
      "LICENSE_ASSIGNED",
      "LicenseAssignment",
      assignment.id,
      { licenseId, employeeId: dto.employeeId },
      actorContext.userId,
      actorContext.membershipId
    );

    return assignment;
  }

  // -------------------------------------------------------------
  // 6. INVENTORY MANAGEMENT
  // -------------------------------------------------------------

  async listInventory(tenantId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { tenantId },
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: { name: "asc" }
    });

    return items.map((item) => ({
      ...item,
      isLowStock: item.currentStock <= item.reorderLevel,
      stockValue: Math.round(item.currentStock * item.unitCost * 100) / 100
    }));
  }

  async createInventoryItem(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: CreateInventoryItemDto
  ) {
    const existing = await this.prisma.inventoryItem.findFirst({
      where: { tenantId, sku: dto.sku }
    });
    if (existing) {
      throw new BadRequestException(`Inventory item with SKU "${dto.sku}" already exists`);
    }

    const item = await this.prisma.inventoryItem.create({
      data: {
        tenantId,
        name: dto.name,
        sku: dto.sku,
        category: dto.category,
        unit: dto.unit,
        currentStock: dto.currentStock,
        reorderLevel: dto.reorderLevel,
        unitCost: dto.unitCost,
        supplier: dto.supplier,
        location: dto.location
      }
    });

    await this.recordAudit(
      tenantId,
      "INVENTORY_ITEM_CREATED",
      "InventoryItem",
      item.id,
      { sku: item.sku, name: item.name },
      actorContext.userId,
      actorContext.membershipId
    );

    return item;
  }

  async recordInventoryMovement(
    tenantId: string,
    actorContext: { userId?: string; membershipId?: string },
    dto: RecordInventoryMovementDto
  ) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: dto.itemId, tenantId }
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID "${dto.itemId}" not found`);
    }

    let newBalance = item.currentStock;
    if (dto.type === "IN") {
      newBalance += dto.quantity;
    } else if (dto.type === "OUT") {
      if (item.currentStock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${item.currentStock}, Requested: ${dto.quantity}`
        );
      }
      newBalance -= dto.quantity;
    } else if (dto.type === "ADJUSTMENT") {
      newBalance = dto.quantity;
    }

    const [movement, updatedItem] = await this.prisma.$transaction([
      this.prisma.inventoryMovement.create({
        data: {
          tenantId,
          itemId: dto.itemId,
          type: dto.type,
          quantity: dto.quantity,
          balanceAfter: newBalance,
          reference: dto.reference,
          notes: dto.notes,
          actionByUser: actorContext.userId
        }
      }),
      this.prisma.inventoryItem.update({
        where: { id: dto.itemId },
        data: { currentStock: newBalance }
      })
    ]);

    await this.recordAudit(
      tenantId,
      "INVENTORY_MOVEMENT_RECORDED",
      "InventoryMovement",
      movement.id,
      { itemId: dto.itemId, type: dto.type, quantity: dto.quantity, balanceAfter: newBalance },
      actorContext.userId,
      actorContext.membershipId
    );

    return { movement, item: updatedItem };
  }
}
