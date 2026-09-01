import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { PermissionsController, RolesController, UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

@Module({
  imports: [AuditModule],
  controllers: [UsersController, RolesController, PermissionsController],
  providers: [UsersService]
})
export class UsersModule {}
