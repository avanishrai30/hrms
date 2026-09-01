import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { TenantsController, TenantSelfController, PublicTenantsController } from "./tenants.controller.js";
import { TenantsService } from "./tenants.service.js";

@Module({
  imports: [AuditModule],
  controllers: [TenantsController, TenantSelfController, PublicTenantsController],
  providers: [TenantsService],
  exports: [TenantsService]
})
export class TenantsModule {}

