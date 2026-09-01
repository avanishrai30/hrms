import { Global, Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { QueueService } from "./queue.service.js";

@Global()
@Module({
  imports: [PrismaModule, AuditModule],
  providers: [QueueService],
  exports: [QueueService]
})
export class QueueModule {}
