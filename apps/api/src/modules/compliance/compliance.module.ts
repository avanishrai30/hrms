import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ComplianceController } from "./compliance.controller.js";
import { ComplianceService } from "./compliance.service.js";
import { EsiProvider } from "./providers/esi.provider.js";
import { PfProvider } from "./providers/pf.provider.js";
import { PtProvider } from "./providers/pt.provider.js";
import { TdsProvider } from "./providers/tds.provider.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    PfProvider,
    EsiProvider,
    PtProvider,
    TdsProvider
  ],
  exports: [
    ComplianceService,
    PfProvider,
    EsiProvider,
    PtProvider,
    TdsProvider
  ]
})
export class ComplianceModule {}
