import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateTravelSettlementDto } from "./finance.schemas.js";

@Injectable()
export class TravelSettlementService {
  constructor(private readonly prisma: PrismaService) {}

  async settle(tenantId: string, dto: CreateTravelSettlementDto) {
    const request = await this.prisma.travelRequest.findFirst({
      where: { tenantId, id: dto.requestId, employeeId: dto.employeeId },
      include: { advances: true }
    });
    if (!request) throw new NotFoundException("Travel request not found.");
    if (!["APPROVED", "IN_PROGRESS", "COMPLETED"].includes(request.status)) {
      throw new BadRequestException("Only approved or completed travel can be settled.");
    }

    const totalAdvance = request.advances
      .filter((advance) => ["DISBURSED", "SETTLED", "CLOSED"].includes(advance.status))
      .reduce((sum, advance) => sum + advance.amount, 0);
    const balanceDue = Math.max(0, dto.totalActualSpend - totalAdvance);
    const refundAmount = Math.max(0, totalAdvance - dto.totalActualSpend);
    const settlement = await this.prisma.travelSettlement.create({
      data: {
        tenantId,
        requestId: dto.requestId,
        employeeId: dto.employeeId,
        totalAdvance,
        totalActualSpend: dto.totalActualSpend,
        balanceDue,
        refundAmount,
        isSettled: true,
        settledAt: new Date(),
        remarks: dto.remarks
      }
    });
    await this.prisma.travelRequest.update({ where: { id: request.id }, data: { actualSpend: dto.totalActualSpend, status: "COMPLETED" } });
    await this.prisma.travelAdvance.updateMany({ where: { tenantId, requestId: request.id, status: "DISBURSED" }, data: { status: "SETTLED", settledAt: new Date() } });
    return settlement;
  }
}
