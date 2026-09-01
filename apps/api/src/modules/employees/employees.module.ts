import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module.js";
import { DepartmentsController, DesignationsController, EmployeesController } from "./employees.controller.js";
import { EmployeesService } from "./employees.service.js";

@Module({
  imports: [AuditModule],
  controllers: [EmployeesController, DepartmentsController, DesignationsController],
  providers: [EmployeesService]
})
export class EmployeesModule {}

