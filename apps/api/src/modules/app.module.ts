import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module.js";
import { AttendanceModule } from "./attendance/attendance.module.js";
import { AuditModule } from "./audit/audit.module.js";
import { EmployeesModule } from "./employees/employees.module.js";
import { FaceModule } from "./face/face.module.js";
import { CompensationModule } from "./compensation/compensation.module.js";
import { LeavesModule } from "./leaves/leaves.module.js";
import { LocationsModule } from "./locations/locations.module.js";
import { PayrollModule } from "./payroll/payroll.module.js";
import { PayslipsModule } from "./payslips/payslips.module.js";
import { ComplianceModule } from "./compliance/compliance.module.js";
import { AnalyticsModule } from "./analytics/analytics.module.js";
import { OrganizationModule } from "./organization/organization.module.js";
import { WorkflowModule } from "./workflows/workflow.module.js";
import { ApprovalModule } from "./approvals/approval.module.js";
import { EssModule } from "./ess/ess.module.js";
import { AiModule } from "./ai/ai.module.js";
import { RecruitmentModule } from "./recruitment/recruitment.module.js";
import { PerformanceModule } from "./performance/performance.module.js";
import { AssetsModule } from "./assets/assets.module.js";
import { HelpdeskModule } from "./helpdesk/helpdesk.module.js";
import { FacilitiesModule } from "./facilities/facilities.module.js";
import { VisitorModule } from "./visitor/visitor.module.js";
import { ClearanceModule } from "./clearance/clearance.module.js";
import { FinanceModule } from "./finance/finance.module.js";
import { OperationsAnalyticsModule } from "./operations-analytics/operations-analytics.module.js";
import { IntegrationsModule } from "./integrations/integrations.module.js";
import { LearningModule } from "./learning/learning.module.js";
import { WorkforceModule } from "./workforce/workforce.module.js";
import { WorkforceOperationsModule } from "./workforce-operations/workforce-operations.module.js";
import { EngagementModule } from "./engagement/engagement.module.js";
import { SearchModule } from "./search/search.module.js";
import { VendorsModule } from "./vendors/vendors.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { RbacGuard } from "./rbac/rbac.guard.js";
import { TenantsModule } from "./tenants/tenants.module.js";
import { UsersModule } from "./users/users.module.js";
import { QueueModule } from "./queue/queue.module.js";
import { StorageModule } from "./storage/storage.module.js";
import { HealthModule } from "./health/health.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
    PrismaModule,
    AuditModule,
    QueueModule,
    StorageModule,
    HealthModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    EmployeesModule,
    AttendanceModule,
    LocationsModule,
    FaceModule,
    LeavesModule,
    CompensationModule,
    PayrollModule,
    PayslipsModule,
    ComplianceModule,
    AnalyticsModule,
    OrganizationModule,
    WorkflowModule,
    ApprovalModule,
    EssModule,
    AiModule,
    RecruitmentModule,
    PerformanceModule,
    AssetsModule,
    HelpdeskModule,
    FacilitiesModule,
    VisitorModule,
    ClearanceModule,
    FinanceModule,
    OperationsAnalyticsModule,
    IntegrationsModule,
    LearningModule,
    WorkforceModule,
    WorkforceOperationsModule,
    EngagementModule,
    SearchModule,
    VendorsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RbacGuard
    }
  ]
})
export class AppModule {}
