import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { ExpenseClaim } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class ReimbursementService {
  constructor(private readonly prisma: PrismaService) {}

  listQueue(tenantId: string) {
    return this.prisma.expenseClaim.findMany({
      where: { tenantId, status: { in: ["APPROVED", "PAID"] } },
      include: { employee: true, costCenter: true },
      orderBy: { approvedAt: "desc" }
    });
  }

  async markPaid(tenantId: string, claimId: string, approvedAmount?: number): Promise<ExpenseClaim> {
    const claim = await this.prisma.expenseClaim.findFirst({ where: { tenantId, id: claimId } });
    if (!claim) throw new NotFoundException("Expense claim not found.");
    if (claim.status !== "APPROVED") throw new BadRequestException("Only approved claims can be paid.");
    return this.prisma.expenseClaim.update({
      where: { id: claim.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        approvedAmount: approvedAmount ?? claim.approvedAmount ?? claim.totalAmount
      }
    });
  }
}
