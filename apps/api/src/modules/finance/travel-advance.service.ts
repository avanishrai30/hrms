import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class TravelAdvanceService {
  constructor(private readonly prisma: PrismaService) {}

  async approve(tenantId: string, advanceId: string) {
    const advance = await this.prisma.travelAdvance.findFirst({ where: { tenantId, id: advanceId } });
    if (!advance) throw new NotFoundException("Travel advance not found.");
    if (advance.status !== "REQUESTED") throw new BadRequestException("Only requested advances can be approved.");
    return this.prisma.travelAdvance.update({ where: { id: advance.id }, data: { status: "APPROVED", approvedAt: new Date() } });
  }

  async disburse(tenantId: string, advanceId: string) {
    const advance = await this.prisma.travelAdvance.findFirst({ where: { tenantId, id: advanceId } });
    if (!advance) throw new NotFoundException("Travel advance not found.");
    if (advance.status !== "APPROVED") throw new BadRequestException("Only approved advances can be disbursed.");
    return this.prisma.travelAdvance.update({ where: { id: advance.id }, data: { status: "DISBURSED", disbursedAt: new Date() } });
  }
}
