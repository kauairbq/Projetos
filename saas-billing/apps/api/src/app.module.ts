import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PlansModule } from "./plans/plans.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { OrganizationUsersModule } from "./organization-users/organization-users.module";
import { PaymentsModule } from "./payments/payments.module";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { MetricsModule } from "./metrics/metrics.module";
import { ReportsModule } from "./reports/reports.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    InvoicesModule,
    OrganizationsModule,
    OrganizationUsersModule,
    PaymentsModule,
    AuditLogsModule,
    MetricsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
