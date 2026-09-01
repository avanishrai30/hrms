import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { StorageModule } from "../storage/storage.module.js";
import { AccountingController } from "./accounting.controller.js";
import { AccountingService } from "./accounting.service.js";
import { FinanceController } from "./finance.controller.js";
import { FinanceService } from "./finance.service.js";
import { ReceiptStorageService } from "./receipt-storage.service.js";
import { ReimbursementService } from "./reimbursement.service.js";
import { TravelAdvanceService } from "./travel-advance.service.js";
import { TravelSettlementService } from "./travel-settlement.service.js";
import { MockVirusScanProvider, VIRUS_SCAN_PROVIDER } from "./virus-scan.provider.js";

@Module({
  imports: [PrismaModule, AuditModule, StorageModule],
  controllers: [FinanceController, AccountingController],
  providers: [
    AccountingService,
    FinanceService,
    ReceiptStorageService,
    ReimbursementService,
    TravelAdvanceService,
    TravelSettlementService,
    { provide: VIRUS_SCAN_PROVIDER, useClass: MockVirusScanProvider }
  ],
  exports: [FinanceService]
})
export class FinanceModule {}
