import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { OperationsAnalyticsView } from "@vc-wms/shared-types";
import { SLAEngine } from "../helpdesk/engines/sla.engine.js";
import { DepreciationEngine } from "../assets/engines/depreciation.engine.js";

@Injectable()
export class OperationsAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveAnalytics(tenantId: string): Promise<OperationsAnalyticsView> {
    // 1. Assets KPIs
    const assets = await this.prisma.asset.findMany({
      where: { tenantId, isScrapped: false }
    });
    const totalAssetsCount = assets.length;
    const assignedAssetsCount = assets.filter((a) => a.status === "ASSIGNED").length;
    const availableAssetsCount = assets.filter((a) => a.status === "AVAILABLE").length;
    const maintenanceAssetsCount = assets.filter((a) => a.status === "IN_MAINTENANCE" || a.status === "IN_REPAIR").length;

    let totalValuation = 0;
    let currentBookValue = 0;
    for (const a of assets) {
      totalValuation += a.purchaseCost;
      const dep = DepreciationEngine.calculate({
        assetId: a.id,
        assetCode: a.assetCode,
        purchaseCost: a.purchaseCost,
        purchaseDate: a.purchaseDate,
        salvageValue: a.salvageValue,
        usefulLifeYears: a.usefulLifeYears,
        method: a.depreciationMethod as "STRAIGHT_LINE" | "WRITTEN_DOWN_VALUE"
      });
      currentBookValue += dep.currentBookValue;
    }
    const assetUtilization =
      totalAssetsCount > 0 ? Math.round((assignedAssetsCount / totalAssetsCount) * 100) : 0;

    // 2. Helpdesk KPIs
    const tickets = await this.prisma.ticket.findMany({
      where: { tenantId },
      select: {
        priority: true,
        status: true,
        createdAt: true,
        firstRespondedAt: true,
        resolvedAt: true,
        resolutionDueAt: true,
        isSlaBreached: true
      }
    });
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length;
    const slaStats = SLAEngine.computeSLAStats(tickets);
    const totalBreached = slaStats.reduce((sum, s) => sum + s.breachedCount, 0);
    const slaCompliancePercent =
      totalTickets > 0 ? Math.round(((totalTickets - totalBreached) / totalTickets) * 1000) / 10 : 100;
    const mttrHours = SLAEngine.calculateMTTR(tickets);

    // 3. Facilities & Desks KPIs
    const [facilitiesCount, bookingsCount, desksCount, deskAllocationsCount, activeVehiclesCount] =
      await Promise.all([
        this.prisma.facility.count({ where: { tenantId, isActive: true } }),
        this.prisma.facilityBooking.count({
          where: {
            tenantId,
            status: { in: ["BOOKED", "APPROVED"] },
            startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        }),
        this.prisma.desk.count({ where: { tenantId, isActive: true } }),
        this.prisma.deskAllocation.count({ where: { tenantId, status: "ACTIVE" } }),
        this.prisma.vehicle.count({ where: { tenantId, status: { not: "OUT_OF_SERVICE" } } })
      ]);

    const roomUtilization =
      facilitiesCount > 0 ? Math.min(100, Math.round((bookingsCount / (facilitiesCount * 3)) * 100)) : 0;
    const deskOccupancy =
      desksCount > 0 ? Math.round((deskAllocationsCount / desksCount) * 100) : 0;

    // 4. Visitors KPIs
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const [todayVisitors, activePasses] = await Promise.all([
      this.prisma.visitorVisit.count({
        where: { tenantId, createdAt: { gte: startOfToday } }
      }),
      this.prisma.visitorVisit.count({
        where: { tenantId, status: "CHECKED_IN" }
      })
    ]);

    // 5. Exit Clearances KPIs
    const [activeClearances, completedClearances] = await Promise.all([
      this.prisma.exitClearance.count({
        where: { tenantId, status: { in: ["INITIATED", "IN_PROGRESS"] } }
      }),
      this.prisma.exitClearance.findMany({
        where: { tenantId, status: "CLEARANCE_COMPLETED", completedAt: { not: null } },
        select: { createdAt: true, completedAt: true }
      })
    ]);

    let avgTurnaroundDays = 3;
    if (completedClearances.length > 0) {
      const totalDays = completedClearances.reduce((sum, c) => {
        const diff = c.completedAt!.getTime() - c.createdAt.getTime();
        return sum + diff / (1000 * 60 * 60 * 24);
      }, 0);
      avgTurnaroundDays = Math.round((totalDays / completedClearances.length) * 10) / 10;
    }

    return {
      assets: {
        totalCount: totalAssetsCount,
        assignedCount: assignedAssetsCount,
        availableCount: availableAssetsCount,
        inMaintenanceCount: maintenanceAssetsCount,
        totalValuation: Math.round(totalValuation * 100) / 100,
        currentBookValue: Math.round(currentBookValue * 100) / 100,
        utilizationPercent: assetUtilization
      },
      helpdesk: {
        totalTickets,
        openTickets,
        slaCompliancePercent,
        mttrHours
      },
      facilities: {
        meetingRoomUtilizationPercent: roomUtilization,
        deskOccupancyPercent: deskOccupancy,
        activeVehiclesCount
      },
      visitors: {
        todayVisitorsCount: todayVisitors,
        activePassesCount: activePasses
      },
      clearance: {
        activeClearancesCount: activeClearances,
        avgTurnaroundDays
      }
    };
  }
}
